import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(os.homedir(), ".xoox-sms-settings.json")

interface SMSConfig {
  active: boolean
  usercode: string
  password: string
  msgheader: string
  admin_phone: string
  sms_service: string
}

function getSmsSettings(): SMSConfig {
  const defaults = {
    active: false,
    usercode: process.env.NETGSM_USERCODE || "",
    password: process.env.NETGSM_PASSWORD || "",
    msgheader: process.env.NETGSM_HEADER || "",
    admin_phone: process.env.NETGSM_ADMIN_PHONE || "",
    sms_service: "netgsm"
  }

  let active = false
  if (defaults.usercode && defaults.password && defaults.msgheader) {
    active = true
  }

  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        active: typeof parsed.active === "boolean" ? parsed.active : active,
        usercode: parsed.usercode !== undefined ? parsed.usercode : defaults.usercode,
        password: parsed.password !== undefined ? parsed.password : defaults.password,
        msgheader: parsed.msgheader !== undefined ? parsed.msgheader : defaults.msgheader,
        admin_phone: parsed.admin_phone !== undefined ? parsed.admin_phone : defaults.admin_phone,
        sms_service: parsed.sms_service !== undefined ? parsed.sms_service : defaults.sms_service,
      }
    }
  } catch (err) {
    console.error("Error reading SMS config in subscriber:", err)
  }
  return {
    ...defaults,
    active
  }
}

// Helper to send SMS via Netgsm
async function sendNetgsmSms(phone: string, message: string) {
  const settings = getSmsSettings()
  if (!settings.active) {
    console.log("[Netgsm SMS] SMS sending is disabled in settings")
    return { success: false, error: "SMS sending is disabled" }
  }

  const usercode = settings.usercode
  const password = settings.password
  const header = settings.msgheader

  if (!usercode || !password || !header) {
    console.error("[Netgsm SMS] Credentials are missing in settings");
    return { success: false, error: "Credentials missing" };
  }

  // Format phone number (strip non-digits)
  let cleanPhone = phone.replace(/\D/g, "");
  // Strip leading 0
  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.substring(1);
  }
  // Strip country code if it is 90
  if (cleanPhone.startsWith("90") && cleanPhone.length > 10) {
    cleanPhone = cleanPhone.substring(2);
  }

  // Netgsm expects Turkish numbers to be exactly 10 digits (e.g. 5323370081)
  if (cleanPhone.length !== 10) {
    console.warn(`[Netgsm SMS] Invalid phone number length: ${cleanPhone}`);
    return { success: false, error: "Invalid phone number length" };
  }

  try {
    const params = new URLSearchParams();
    params.append("usercode", usercode);
    params.append("password", password);
    params.append("gsmno", cleanPhone);
    params.append("message", message);
    params.append("msgheader", header);

    const response = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params.toString()}`, {
      method: "GET",
      headers: {
        "Accept": "text/html"
      }
    });

    const body = await response.text();
    console.log(`[Netgsm SMS] Sent to ${cleanPhone}. Status: ${response.status}, Response: ${body}`);

    if (body.startsWith("00")) {
      return { success: true, code: body };
    } else {
      return { success: false, error: body };
    }
  } catch (err: any) {
    console.error("[Netgsm SMS] Error sending SMS:", err);
    return { success: false, error: err.message };
  }
}

export default async function netgsmSmsNotifierHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  const eventName = event.name
  const orderId = event.data.id
  
  const settings = getSmsSettings()
  if (!settings.active) {
    console.log(`[Netgsm SMS] Ignored event ${eventName} because SMS sending is inactive`)
    return
  }

  const query = container.resolve("query")
  const orderModuleService = container.resolve(Modules.ORDER)

  try {
    // 1. Fetch order details
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "metadata",
        "shipping_address.*",
        "billing_address.*",
        "customer.*"
      ],
      filters: { id: orderId },
    })

    const order = orders[0]
    if (!order) {
      console.warn(`[Netgsm SMS] Order not found for ID: ${orderId}`)
      return
    }

    const orderNo = order.display_id || order.id.slice(-8)
    const customerPhone = order.shipping_address?.phone || order.billing_address?.phone || order.customer?.phone
    const firstName = order.shipping_address?.first_name || order.customer?.first_name || "Müşteri"
    const lastName = order.shipping_address?.last_name || order.customer?.last_name || ""
    const totalVal = (order.total || 0) / 100
    const metadata = order.metadata || {}

    // 2. Handle order placement
    if (eventName === "order.placed") {
      console.log(`[Netgsm SMS] Processing order.placed event for Order #${orderNo}`)

      // Send SMS to customer
      if (customerPhone) {
        const customerMsg = `Sayın ${firstName} ${lastName}, #${orderNo} nolu siparişiniz başarıyla alınmıştır. Toplam Tutar: ${totalVal.toFixed(2)} TL. Teşekkür ederiz.`
        await sendNetgsmSms(customerPhone, customerMsg)
      } else {
        console.warn(`[Netgsm SMS] Customer phone not found for Order #${orderNo}`)
      }

      // Send SMS to admin
      const adminPhone = settings.admin_phone
      if (adminPhone) {
        const adminMsg = `Yeni Sipariş! Sipariş No: #${orderNo}, Tutar: ${totalVal.toFixed(2)} TL, Müşteri: ${firstName} ${lastName}`
        await sendNetgsmSms(adminPhone, adminMsg)
      }
    }

    // 3. Handle order updates (Fulfillment/Status transitions)
    else if (eventName === "order.updated") {
      const deliveryStatus = metadata.delivery_status
      console.log(`[Netgsm SMS] Processing order.updated event for Order #${orderNo}. Delivery status: ${deliveryStatus}`)

      if (!deliveryStatus || !customerPhone) return

      // A. SHIPPED (Kargolanan) SMS Notification
      if (deliveryStatus === "kargolanan" && metadata.sent_sms_kargolanan !== true) {
        const carrierBarcode = metadata.carrier_barcode || ""
        const trackingMsg = carrierBarcode ? ` Kargo Takip No: ${carrierBarcode}` : ""
        const msg = `Sayın ${firstName} ${lastName}, #${orderNo} nolu siparişiniz kargoya verilmiştir.${trackingMsg} İyi günler dileriz.`

        const res = await sendNetgsmSms(customerPhone, msg)
        if (res.success) {
          await orderModuleService.updateOrders(orderId, {
            metadata: {
              ...metadata,
              sent_sms_kargolanan: true
            }
          })
        }
      }

      // B. CANCELED (İptal Edilen) SMS Notification
      else if (deliveryStatus === "iptal_edilen" && metadata.sent_sms_iptal !== true) {
        const msg = `Sayın ${firstName} ${lastName}, #${orderNo} nolu siparişiniz iptal edilmiştir.`

        const res = await sendNetgsmSms(customerPhone, msg)
        if (res.success) {
          await orderModuleService.updateOrders(orderId, {
            metadata: {
              ...metadata,
              sent_sms_iptal: true
            }
          })
        }
      }
    }
  } catch (error) {
    console.error(`[Netgsm SMS] Error in subscriber handler on event ${eventName}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.updated"],
}
