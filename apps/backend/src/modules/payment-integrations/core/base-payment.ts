// @ts-nocheck
import { AbstractPaymentProvider, PaymentSessionStatus, PaymentProviderError } from "@medusajs/framework/utils"
import { ProviderContext, CreatePaymentProviderSession, UpdatePaymentProviderSession, PaymentProviderSessionResponse } from "@medusajs/types"

/**
 * BasePaymentProvider
 * Handles common functionality for all 9 payment providers (Iyzico, PayTR, Cash on delivery, Bank transfer etc.)
 */
export abstract class BasePaymentProvider extends AbstractPaymentProvider<any> {

  /**
   * Common helper to validate if the provider should be shown to the customer (e.g., Min cart amount check)
   */
  protected validateLimits(cartTotal: number, minAmt: number, maxAmt: number | null): boolean {
       if (minAmt > 0 && cartTotal < minAmt) return false;
       if (maxAmt && maxAmt > 0 && cartTotal > maxAmt) return false;
       return true;
  }

  // Base Native Medusa V2 Stubs that child classes must override or inherit

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      error: "Not implemented in child provider",
      code: "not_implemented"
    };
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>, context: Record<string, unknown>): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: paymentSessionData
      }
  }

  async cancelPayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      return {
          status: PaymentSessionStatus.CANCELED,
          data: paymentSessionData
      }
  }

  async capturePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown>; }> {
      return {
          status: PaymentSessionStatus.CAPTURED,
          data: paymentSessionData
      }
  }

  async refundPayment(paymentSessionData: Record<string, unknown>, refundAmount: number): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown>; }> {
       return {
           status: PaymentSessionStatus.AUTHORIZED,
           data: paymentSessionData
       }
  }

  async deletePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | Record<string, unknown>> {
      return {}
  }

  async getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus> {
      return PaymentSessionStatus.AUTHORIZED
  }

  async updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
      return {
          data: context.data || {}
      }
  }
}
