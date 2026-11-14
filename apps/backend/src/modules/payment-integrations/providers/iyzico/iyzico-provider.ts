// @ts-nocheck
import { PaymentProviderError, PaymentSessionStatus } from "@medusajs/framework/utils"
// import Iyzipay from "iyzipay" // In a real project, we use the official package
import { CreatePaymentProviderSession, PaymentProviderSessionResponse } from "@medusajs/types"
import { BasePaymentProvider } from "../../core/base-payment"

export class IyzicoProvider extends BasePaymentProvider {
  static identifier = "iyzico"
  
  constructor(container: any, config: any) {
    super(container)
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    
    // In actual implementation: 
    // iyzipay.checkoutFormInitialize.create({...}, (err, res) => {...})

    return {
      data: {
          cart_id: context.cart_id,
          iyzico_token: "IYZICO_MOCK_TOKEN",
          iyzico_checkout_url: "https://sandbox-api.iyzipay.com/checkout/form/1312313",
          status: "pending_3d_secure"
      }
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      // Upon Callback webhook from iyzico
      return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: paymentSessionData
      }
  }

  async refundPayment(paymentSessionData: Record<string, unknown>, refundAmount: number): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
       // iyzipay.refund.create({...})
       return {
           status: PaymentSessionStatus.AUTHORIZED,
           data: { ...paymentSessionData, refund_state: "COMPLETED", refund_amount: refundAmount }
       }
  }
}
