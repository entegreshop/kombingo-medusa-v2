// @ts-nocheck
import { AbstractPaymentProvider } from "@medusajs/framework/utils"

export class CashOnDeliveryProvider extends AbstractPaymentProvider<any> {
  static identifier = "CASH-ON-DELIVERY"

  async capturePayment(paymentData) { return {} }
  async authorizePayment(paymentSessionData, context) { return { status: "authorized", data: {} } }
  async cancelPayment(paymentData) { return {} }
  async initiatePayment(context) { return { session_data: {} } }
  async deletePayment(paymentSessionData) { return {} }
  async getPaymentStatus(paymentSessionData) { return "authorized" }
  async refundPayment(paymentData, refundAmount) { return {} }
  async retrievePayment(paymentSessionData) { return {} }
  async updatePayment(context) { return { session_data: {} } }
  async getWebhookActionAndData(data) { return { action: "not_supported", data: {} } }
}

export class CardOnDeliveryProvider extends AbstractPaymentProvider<any> {
  static identifier = "CARD-ON-DELIVERY"

  async capturePayment(paymentData) { return {} }
  async authorizePayment(paymentSessionData, context) { return { status: "authorized", data: {} } }
  async cancelPayment(paymentData) { return {} }
  async initiatePayment(context) { return { session_data: {} } }
  async deletePayment(paymentSessionData) { return {} }
  async getPaymentStatus(paymentSessionData) { return "authorized" }
  async refundPayment(paymentData, refundAmount) { return {} }
  async retrievePayment(paymentSessionData) { return {} }
  async updatePayment(context) { return { session_data: {} } }
  async getWebhookActionAndData(data) { return { action: "not_supported", data: {} } }
}

export class BankTransferProvider extends AbstractPaymentProvider<any> {
  static identifier = "BANK-TRANSFER"

  async capturePayment(paymentData) { return {} }
  async authorizePayment(paymentSessionData, context) { return { status: "pending", data: {} } }
  async cancelPayment(paymentData) { return {} }
  async initiatePayment(context) { return { session_data: {} } }
  async deletePayment(paymentSessionData) { return {} }
  async getPaymentStatus(paymentSessionData) { return "pending" }
  async refundPayment(paymentData, refundAmount) { return {} }
  async retrievePayment(paymentSessionData) { return {} }
  async updatePayment(context) { return { session_data: {} } }
  async getWebhookActionAndData(data) { return { action: "not_supported", data: {} } }
}

export class PaytrProvider extends AbstractPaymentProvider<any> {
  static identifier = "PAYTR"

  async capturePayment(paymentData) { return {} }
  async authorizePayment(paymentSessionData, context) { return { status: "authorized", data: {} } }
  async cancelPayment(paymentData) { return {} }
  async initiatePayment(context) { return { session_data: {} } }
  async deletePayment(paymentSessionData) { return {} }
  async getPaymentStatus(paymentSessionData) { return "authorized" }
  async refundPayment(paymentData, refundAmount) { return {} }
  async retrievePayment(paymentSessionData) { return {} }
  async updatePayment(context) { return { session_data: {} } }
  async getWebhookActionAndData(data) { return { action: "not_supported", data: {} } }
}
