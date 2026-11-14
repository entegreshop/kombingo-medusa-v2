// @ts-nocheck
import { PaymentSessionStatus } from "@medusajs/framework/utils"
import { CreatePaymentProviderSession, PaymentProviderSessionResponse } from "@medusajs/types"
import { BasePaymentProvider } from "../../core/base-payment"

export class BankTransferProvider extends BasePaymentProvider {
  static identifier = "bank_transfer"

  constructor(container: any, config: any) {
    super(container)
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderSessionResponse> {
    
    // Storefront expects redirect URL to WhatsApp or Bank Info Page.
    // For WhatsApp redirection:
    const waLink = `https://wa.me/905554443322?text=Merhaba,%20Sipariş%20Numaram:%20${context.cart_id}%20Dekont%20iletmek%20istiyorum.`;

    return {
      data: {
         status: "TRANSFER_PENDING",
         customer_email: context.customer?.email,
         whatsapp_link: waLink,
      }
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      // Authorized immediately, awaiting manual marking via Admin.
      return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: paymentSessionData
      }
  }

  async capturePayment(paymentSessionData: Record<string, unknown>): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      // Admin clicks "Ödeme Alındı" button
      return {
          status: PaymentSessionStatus.CAPTURED,
          data: { ...paymentSessionData, approved_at: new Date().toISOString() }
      }
  }
}
