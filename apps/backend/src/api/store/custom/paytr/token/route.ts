import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import crypto from "crypto"
import axios from "axios"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { cart_id } = req.body as { cart_id: string }

    if (!cart_id) {
      return res.status(400).json({ success: false, error: "cart_id is required" })
    }

    // 1. Fetch Cart
    const query = req.scope.resolve("query")
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "email", "total", "shipping_address.*", "billing_address.*", "items.*", "region.*"],
      filters: { id: cart_id }
    })

    const cart = carts[0] as any
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" })
    }

    // 2. Fetch PayTR Keys from Settings
    // @ts-ignore
    const { readConfig } = await import("../../../../admin/payment-settings/route")
    const config = readConfig()
    const paytrConfig = config.paytr || {}

    const merchant_id = paytrConfig.merchant_id
    const merchant_key = paytrConfig.merchant_key
    const merchant_salt = paytrConfig.merchant_salt
    
    if (!merchant_id || !merchant_key || !merchant_salt) {
      return res.status(400).json({ success: false, error: "PayTR API keys are missing in store settings" })
    }

    // 3. Prepare PayTR Payload
    // user_ip can be extracted from req.headers["x-forwarded-for"] or connection.remoteAddress
    let user_ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "127.0.0.1"
    if (Array.isArray(user_ip)) user_ip = user_ip[0]
    user_ip = user_ip.split(",")[0].trim()

    const email = cart.email || "guest@website.com"
    // Convert float total to integer string in Kurus (e.g. 15.50 -> 1550)
    // Wait, cart.total is already in the lowest denominator in Medusa (if TRY, it's kurus)
    // But let's be careful. Let's assume cart.total is in kurus already if region currency is TRY.
    // If it's a float, we multiply by 100.
    // Let's use cart.total safely. Medusa usually stores total in the lowest unit (integer).
    let payment_amount = Math.round(Number(cart.total))
    
    const merchant_oid = cart.id.substring(0, 64) // cart_id limit 64 in PayTR
    
    const user_name = `${cart.shipping_address?.first_name || ""} ${cart.shipping_address?.last_name || ""}`.trim() || "Guest"
    const user_address = `${cart.shipping_address?.address_1 || ""}, ${cart.shipping_address?.city || ""}`.trim() || "Girilmedi"
    const user_phone = cart.shipping_address?.phone || "0000000000"
    
    const currency = (cart.region?.currency_code || "TL").toUpperCase()
    const test_mode = paytrConfig.test_mode === "Açık" ? "1" : "0"
    
    // Basket data needs to be a serialized JSON array of arrays
    // e.g. [["Item 1", "50.00", 1], ["Item 2", "10.00", 2]]
    const user_basket = cart.items.map((item: any) => [
       item.title.substring(0, 50),
       (Number(item.unit_price) / 100).toFixed(2), // Fiyat TL cinsinden string olmalı
       item.quantity
    ])
    const user_basket_str = Buffer.from(JSON.stringify(user_basket)).toString("base64")
    
    const max_installment = "0" // 0 means no limit on installments
    const no_installment = "0" // 0 means installments allowed
    const merchant_ok_url = `${process.env.STORE_CORS || "http://localhost:8000"}/checkout/success?order_id=${merchant_oid}`
    const merchant_fail_url = `${process.env.STORE_CORS || "http://localhost:8000"}/checkout/failed`

    const timeout_limit = "30"
    const debug_on = "1"

    // 4. Calculate HMAC Hash
    // Hash format: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket_str + no_installment + max_installment + currency + test_mode
    const hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket_str + no_installment + max_installment + currency + test_mode + merchant_salt
    const paytr_token = crypto.createHmac("sha256", merchant_key).update(hash_str).digest("base64")

    // 5. Send Request to PayTR
    const formData = new URLSearchParams()
    formData.append("merchant_id", merchant_id)
    formData.append("user_ip", user_ip)
    formData.append("merchant_oid", merchant_oid)
    formData.append("email", email)
    formData.append("payment_amount", payment_amount.toString())
    formData.append("paytr_token", paytr_token)
    formData.append("user_basket", user_basket_str)
    formData.append("debug_on", debug_on)
    formData.append("no_installment", no_installment)
    formData.append("max_installment", max_installment)
    formData.append("user_name", user_name)
    formData.append("user_address", user_address)
    formData.append("user_phone", user_phone)
    formData.append("merchant_ok_url", merchant_ok_url)
    formData.append("merchant_fail_url", merchant_fail_url)
    formData.append("timeout_limit", timeout_limit)
    formData.append("currency", currency)
    formData.append("test_mode", test_mode)

    const response = await axios.post("https://www.paytr.com/odeme/api/get-token", formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })

    if (response.data?.status === "success") {
      return res.json({ success: true, token: response.data.token })
    } else {
      console.error("PayTR Token Error:", response.data)
      return res.status(400).json({ success: false, error: response.data?.reason || "PayTR token could not be generated" })
    }

  } catch (error: any) {
    console.error("PayTR Endpoint Error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
