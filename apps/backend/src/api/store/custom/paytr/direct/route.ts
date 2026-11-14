import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"
import { readConfig as readPaymentConfig } from "../../../../admin/payment-settings/route"
import { readConfig as readShippingConfig } from "../../../../admin/shipping-settings/route"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      cart_id,
      cc_owner,
      cc_number,
      cc_month,
      cc_year,
      cc_cvv,
      client_ip
    } = req.body as any

    if (!cart_id || !cc_number) {
      return res.status(400).json({ success: false, error: "Eksik parametre" })
    }

    // 1. Fetch Cart
    const query = req.scope.resolve("query")
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "email",
        "total",
        "subtotal",
        "item_subtotal",
        "discount_total",
        "shipping_total",
        "shipping_address.*",
        "billing_address.*",
        "items.*",
        "region.*"
      ],
      filters: { id: cart_id }
    })

    const cart = carts[0] as any
    if (!cart) {
      return res.status(404).json({ success: false, error: "Sepet bulunamadı" })
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: "Sepetiniz boş." })
    }

    // 2. Fetch PayTR & Shipping Config (with safe defaults if JSON file not yet written)
    const paymentConfig = readPaymentConfig()
    const paytrConfig: any = paymentConfig.paytr || {}
    const shippingConfig: any = readShippingConfig()

    const merchant_id = String(paytrConfig.merchant_id || "").trim()
    const merchant_key = String(paytrConfig.merchant_key || "").trim()
    const merchant_salt = String(paytrConfig.merchant_salt || "").trim()

    if (!merchant_id || !merchant_key || !merchant_salt) {
      return res.status(400).json({ success: false, error: "PayTR API ayarları eksik" })
    }

    // 3. Calculate canonical items + shipping total in kurus
    const rawTotalKurus = Number(cart.total || 0)
    const rawShippingKurus = Number(cart.shipping_total || 0)
    const itemsNetKurus = Math.max(0, rawTotalKurus - rawShippingKurus)

    let effectiveShippingKurus = rawShippingKurus
    if (shippingConfig) {
      const itemsNetTl = itemsNetKurus / 100
      if (shippingConfig.freeShippingEnabled && itemsNetTl >= Number(shippingConfig.freeShippingThreshold || 0)) {
        effectiveShippingKurus = 0
      } else if (shippingConfig.standardShippingEnabled !== false && shippingConfig.standardShippingFee !== undefined) {
        effectiveShippingKurus = Math.round(Number(shippingConfig.standardShippingFee) * 100)
      }
    }

    const finalTotalKurus = itemsNetKurus + effectiveShippingKurus
    if (finalTotalKurus <= 0) {
      return res.status(400).json({ success: false, error: "Sepet tutarı 0'dan büyük olmalıdır." })
    }

    // 4. Prepare PayTR Payload
    const forwardedFor = req.headers["x-forwarded-for"]
    const headerIp = typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : ""
    const cfIp = typeof req.headers["cf-connecting-ip"] === "string" ? req.headers["cf-connecting-ip"].trim() : ""
    const fallbackClientIp = client_ip && client_ip !== "1.1.1.1" && client_ip !== "127.0.0.1" ? String(client_ip).split(",")[0].trim() : ""
    const isIpv4 = (ip: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)
    const rawIp =
      (isIpv4(fallbackClientIp) ? fallbackClientIp : "") ||
      (isIpv4(cfIp) ? cfIp : "") ||
      (isIpv4(headerIp) ? headerIp : "") ||
      fallbackClientIp ||
      cfIp ||
      headerIp ||
      (req as any).ip ||
      "85.105.1.1"
    const user_ip = String(rawIp).replace(/^::ffff:/, "").trim() || "85.105.1.1"

    const email = cart.email || "guest@kombingo.com"
    const payment_amount = (finalTotalKurus / 100).toFixed(2)

    // PayTR Direct API requires merchant_oid to be STRICTLY alphanumeric
    const base_oid = cart.id.replace(/[^a-zA-Z0-9]/g, "")
    const merchant_oid = base_oid + Date.now().toString()
    try {
      const cartModule = req.scope.resolve("cart") as any
      if (cartModule?.updateCarts) {
        await cartModule.updateCarts(cart.id, {
          metadata: { ...(cart.metadata || {}), paytr_oid: merchant_oid, payment_method: "PayTR", payment_attempt: true }
        })
      }
    } catch (metaErr) {}

    const user_name = `${cart.shipping_address?.first_name || ""} ${cart.shipping_address?.last_name || ""}`.trim() || "Misafir"
    const user_address = `${cart.shipping_address?.address_1 || ""}, ${cart.shipping_address?.city || ""} ${cart.shipping_address?.province || ""}`.trim() || "Turkiye"
    const user_phone = cart.shipping_address?.phone || "05000000000"

    const currency = "TL"

    // Basket data needs to be a serialized JSON array of arrays
    const user_basket = cart.items.map((item: any) => [
      String(item.title || "Urun").substring(0, 50),
      (Number(item.unit_price || 0) / 100).toFixed(2),
      Number(item.quantity || 1)
    ])

    if (effectiveShippingKurus > 0) {
      user_basket.push([
        "Kargo Bedeli",
        (effectiveShippingKurus / 100).toFixed(2),
        1
      ])
    }
    const user_basket_str = Buffer.from(JSON.stringify(user_basket)).toString("base64")

    const storeUrl = process.env.STORE_URL || (process.env.STORE_CORS ? process.env.STORE_CORS.split(",")[0] : "https://kombingo.com")

    const merchant_ok_url = `${storeUrl}/api/paytr/callback?status=success&cart_id=${cart.id}`
    const merchant_fail_url = `${storeUrl}/api/paytr/callback?status=fail`

    const payment_type = "card"
    const installment_count = "0"
    const non_3d = "0"

    // Normalize card fields for PayTR Direct API (2-digit month & 2-digit year)
    const cleanCardNumber = String(cc_number || "").replace(/\D/g, "")
    const cleanMonth = String(cc_month || "").trim().padStart(2, "0")
    const cleanYear = String(cc_year || "").trim().slice(-2)
    const cleanCvv = String(cc_cvv || "").replace(/\D/g, "")

    const isTestCard = cleanCardNumber.startsWith("9792") || ["4355084355084358", "5406675406675403"].includes(cleanCardNumber)
    const test_mode = (isTestCard || (paytrConfig.test_mode && String(paytrConfig.test_mode).toLowerCase().startsWith("a"))) ? "1" : "0"

    // 5. Calculate HMAC Hash
    const hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type + installment_count + currency + test_mode + non_3d + merchant_salt
    const paytr_token = crypto.createHmac("sha256", merchant_key).update(hash_str).digest("base64")

    const formParams = {
      merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount: payment_amount.toString(),
      payment_type,
      installment_count,
      currency,
      test_mode,
      non_3d,
      merchant_ok_url,
      merchant_fail_url,
      user_name,
      user_address,
      user_phone,
      user_basket: user_basket_str,
      debug_on: "1",
      paytr_token,
      cc_owner: String(cc_owner || user_name).trim(),
      card_number: cleanCardNumber,
      expiry_month: cleanMonth,
      expiry_year: cleanYear,
      cvv: cleanCvv
    }

    return res.json({
      success: true,
      requiresDirectHtml: false,
      requiresClientPost: true,
      postUrl: "https://www.paytr.com/odeme",
      formParams
    })
  } catch (error: any) {
    console.error("PayTR Direct API Endpoint Error:", error)
    return res.status(400).json({ success: false, error: error.message || "Bilinmeyen bir hata oluştu" })
  }
}
