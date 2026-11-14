// @ts-nocheck
import { PaymentSessionStatus } from "@medusajs/framework/utils"
import { CreatePaymentProviderSession, PaymentProviderSessionResponse } from "@medusajs/types"
import { BasePaymentProvider } from "../../core/base-payment"

export class CodPaymentProvider extends BasePaymentProvider {
  static identifier = "cod_cash"

  constructor(container: any, config: any) {
    super(container)
    // You can inject DB models or configs here if needed later.
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderSessionResponse> {

    // For Cash on Delivery, we immediately say the session is PENDING (awaiting delivery)
    return {
      data: {
         status: "COD_PENDING",
         customer_email: context.customer?.email,
      }
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      // COD is authorized immediately because the payment will happen later.
      return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: paymentSessionData
      }
  }

  async capturePayment(paymentSessionData: Record<string, unknown>): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      // In Medusa Admin, when the admin hits "Capture Payment" on the order details,
      // this means the courier brought the money back. We update status to captured!
      return {
          status: PaymentSessionStatus.CAPTURED,
          data: { ...paymentSessionData, capture_date: new Date().toISOString() }
      }
  }
}
