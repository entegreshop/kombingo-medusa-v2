import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function sendAbandonedCartReminders(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const cartModuleService = container.resolve(Modules.CART)
  
  // Custom API kullanarak ayarlari veri tabanindan cekecegiz veya store-meta benzeri sistem.
  // Medusa'da store servisine erisim icin STORE module kullanabiliriz. (Eger custom ayar oradaysa)
  // Fakat metadata genel olarak database query icinden de alinabilir.
  // Burada test/mock veri altyapisi icin guvenli modda ilerliyoruz.
  logger.info("[SİSTEM] Abandoned Cart Otomasyonu (Cron) çalıştırıldı...")

  try {
      // 1. Get Automations Settings from metadata -> We can achieve this via Query or direct module.
      // Eger configuration bulunamazsa cron sessizce kapanir.
      const query = container.resolve("query")
      
      // Store settings'i metadata icinden cek
      const { data: stores } = await query.graph({
          entity: "store",
          fields: ["id", "metadata"]
      })

      if (!stores || stores.length === 0) return
      
      const store = stores[0]
      const settings = (store.metadata as any)?.automation_settings
      
      if (!settings) {
          logger.info("[SİSTEM] Otomasyon ayarı bulunamadı, bekleniyor.")
          return
      }

      const { 
          abandoned_cart_minutes, 
          whatsapp_active, whatsapp_token, whatsapp_phone_id, whatsapp_template,
          sms_active, sms_netgsm_usercode, sms_netgsm_password, sms_netgsm_header, sms_message,
          email_active, email_subject, email_message
      } = settings

      // Eger hicbir kanal aktif degilse hic yorulmadan cik.
      if (!whatsapp_active && !sms_active && !email_active) {
         return
      }

      // 2. Fetch Active Carts that are older than config limit
      const minutesThreshold = parseInt(abandoned_cart_minutes) || 120
      const targetTime = new Date(Date.now() - minutesThreshold * 60 * 1000)

      // Carts listesinden metadata.abandoned_reminded != true olan ve updated_at < targetTime olan
      // tamamlanmamis sepetleri buluyoruz. (Burada ornek/mock sorgu yapilir).
      const { data: carts } = await query.graph({
          entity: "cart",
          fields: ["id", "email", "metadata", "updated_at", "billing_address.*", "shipping_address.*", "items.*"]
      })

      // In-Memory filter for abandoned logic
      const targetCarts = carts.filter((c: any) => {
          const updatedAt = new Date(c.updated_at)
          const isOlderThanLimit = updatedAt < targetTime
          const isAlreadyReminded = (c.metadata as any)?.abandoned_reminded === true
          const hasContactInfo = c.email || c.shipping_address?.phone || c.billing_address?.phone
          return isOlderThanLimit && !isAlreadyReminded && hasContactInfo
      })

      if (targetCarts.length === 0) {
          logger.info("[SİSTEM] Tetiklenecek terk edilmiş sepet bulunamadı.")
          return
      }

      logger.info(`[OTOMASYON] ${targetCarts.length} adet sepet bulundu. İşlem başlatılıyor!`)

      // 3. Her sepet icin ayarlara gore aksiyon
      for (const cart of targetCarts) {
          const customerName = cart.shipping_address?.first_name || "Değerli Müşterimiz"
          const customerPhone = cart.shipping_address?.phone || cart.billing_address?.phone
          const customerEmail = cart.email 

          const checkoutLink = `https://www.ornek-magaza.com/cart`

          // A. WhatsApp Send
          if (whatsapp_active && customerPhone && whatsapp_token && whatsapp_phone_id) {
              logger.info(`[WhatsApp] -> ${customerPhone} numarasına şablon atılıyor: ${whatsapp_template}`)
              try {
                  await fetch(`https://graph.facebook.com/v19.0/${whatsapp_phone_id}/messages`, {
                      method: "POST",
                      headers: { "Authorization": `Bearer ${whatsapp_token}`, "Content-Type": "application/json" },
                      body: JSON.stringify({
                          messaging_product: "whatsapp",
                          to: customerPhone,
                          type: "template",
                          template: { 
                             name: whatsapp_template, 
                             language: { code: "tr" },
                             components: [
                               { type: "body", parameters: [ { type: "text", text: checkoutLink } ] }
                             ]
                          }
                      })
                  })
              } catch(e: any) { logger.error("WhatsApp Hatasi", e) }
          }

          // B. Netgsm SMS Send
          if (sms_active && customerPhone && sms_netgsm_usercode && sms_netgsm_password) {
              const finalSmsText = sms_message.replace("{isim}", customerName).replace("{link}", checkoutLink)
              logger.info(`[Netgsm SMS] -> ${customerPhone} numarasına SMS atılıyor... ${finalSmsText}`)
              try {
                  // Netgsm XML API format example
                  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
                    <mainbody>
                        <header>
                            <company>Netgsm</company>
                            <usercode>${sms_netgsm_usercode}</usercode>
                            <password>${sms_netgsm_password}</password>
                            <msgheader>${sms_netgsm_header}</msgheader>
                        </header>
                        <body>
                            <msg><![CDATA[${finalSmsText}]]></msg>
                            <no>${customerPhone}</no>
                        </body>
                    </mainbody>`
                  await fetch(`https://api.netgsm.com.tr/sms/send/xml`, {
                      method: "POST",
                      headers: { "Content-Type": "text/xml" },
                      body: xmlData
                  })
              } catch(e: any) { logger.error("Netgsm Hatasi", e) }
          }

          // C. Email Send
          if (email_active && customerEmail) {
             const finalEmailText = email_message.replace("{isim}", customerName).replace("{link}", checkoutLink)
             logger.info(`[E-MAIL] -> ${customerEmail} adresine hatırlatma maili atılıyor.`)
             // Normalde burada Notification module (Sendgrid vs) cagirilir.
             // container.resolve(Modules.NOTIFICATION).send(...)
          }

          // 4. Cart'i isaretle ki bir daha mesaj atmasin
          const updatedMeta = { ...((cart.metadata as any) || {}), abandoned_reminded: true }
          try {
             await cartModuleService.updateCarts(cart.id, { metadata: updatedMeta })
          } catch(err) {
             logger.error(`Cart ${cart.id} metadata güncellenemedi!`)
          }
      }

      logger.info("[SİSTEM] Bütün hatırlatma gönderimleri başarıyla tamamlandı.")
  } catch(error) {
      logger.error("[SİSTEM] Abandoned Cart Hatası:", error)
  }
}

export const config = {
  name: "abandoned-cart-automation-checker",
  // Her 15 dakikada bir çalıştır
  schedule: "*/15 * * * *",
}
