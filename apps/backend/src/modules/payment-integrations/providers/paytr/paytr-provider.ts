// @ts-nocheck
import { PaymentProviderError, PaymentSessionStatus } from "@medusajs/framework/utils"
import { CreatePaymentProviderSession, PaymentProviderSessionResponse } from "@medusajs/types"
import { BasePaymentProvider } from "../../core/base-payment"
import crypto from "crypto"
import axios from "axios"

export class PayTRProvider extends BasePaymentProvider {
  static identifier = "paytr"
  private merchantId = process.env.PAYTR_MERCHANT_ID || ""
  private merchantKey = process.env.PAYTR_MERCHANT_KEY || ""
  private merchantSalt = process.env.PAYTR_MERCHANT_SALT || ""

  constructor(container: any, config: any) {
    super(container)
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    
    try {
      const cartId = context.cart_id || "TEMP"
      const amount = context.amount * 100 // Kuruş bazında
      
      const { readConfig } = await import("../../../../api/admin/payment-settings/route")
      const config = readConfig()
      const paytrConfig = config.paytr || {}

      const merchant_id = paytrConfig.merchant_id
      const merchant_key = paytrConfig.merchant_key
      const merchant_salt = paytrConfig.merchant_salt
      const test_mode = paytrConfig.test_mode === "Açık" ? "1" : "0"

      if (!merchant_id || !merchant_key || !merchant_salt) {
         throw new Error("PayTR API settings missing")
      }

      const email = context.customer?.email || "guest@website.com"
      const ip = "127.0.0.1"
      const merchant_oid = cartId.substring(0, 64)

      const user_name = "Guest User"
      const user_address = "Adres girilmedi"
      const user_phone = "0000000000"
      const currency = (context.currency_code || "TL").toUpperCase()

      // Mock user basket (real implementation requires cart items)
      const user_basket = [["Siparis Toplami", (amount / 100).toFixed(2), 1]]
      const user_basket_str = Buffer.from(JSON.stringify(user_basket)).toString("base64")
      
      const max_installment = "0"
      const no_installment = "0"
      const storeUrl = process.env.STORE_URL || (process.env.STORE_CORS ? process.env.STORE_CORS.split(",")[0] : "https://kombingo.com")
      const merchant_ok_url = `${storeUrl}/checkout/success?order_id=${merchant_oid}`
      const merchant_fail_url = `${storeUrl}/checkout/failed`

      const hash_str = merchant_id + ip + merchant_oid + email + amount + user_basket_str + no_installment + max_installment + currency + test_mode + merchant_salt
      const paytr_token = crypto.createHmac("sha256", merchant_key).update(hash_str).digest("base64")

      const formData = new URLSearchParams()
      formData.append("merchant_id", merchant_id)
      formData.append("user_ip", ip)
      formData.append("merchant_oid", merchant_oid)
      formData.append("email", email)
      formData.append("payment_amount", amount.toString())
      formData.append("paytr_token", paytr_token)
      formData.append("user_basket", user_basket_str)
      formData.append("debug_on", "1")
      formData.append("no_installment", no_installment)
      formData.append("max_installment", max_installment)
      formData.append("user_name", user_name)
      formData.append("user_address", user_address)
      formData.append("user_phone", user_phone)
      formData.append("merchant_ok_url", merchant_ok_url)
      formData.append("merchant_fail_url", merchant_fail_url)
      formData.append("timeout_limit", "30")
      formData.append("currency", currency)
      formData.append("test_mode", test_mode)

      const response = await axios.post("https://www.paytr.com/odeme/api/get-token", formData.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })

      if (response.data?.status === "success") {
        return {
          data: {
              cart_id: cartId,
              iframe_token: response.data.token,
              amount,
              status: "pending_3d_secure"
          }
        }
      } else {
        throw new Error(response.data?.reason || "PayTR token could not be generated")
      }
    } catch (e: any) {
       return { error: e.message }
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      // PayTR Callback will hit the webhook and Medusa will call authorizePayment or capture.
      return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: paymentSessionData
      }
  }
}
