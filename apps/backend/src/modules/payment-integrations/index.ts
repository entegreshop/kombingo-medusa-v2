// @ts-nocheck
import { Module } from "@medusajs/framework/utils"
// Service
import PaymentIntegrationService from "./services/payment-integration-service"
// Providers
import { PayTRProvider } from "./providers/paytr/paytr-provider"
import { IyzicoProvider } from "./providers/iyzico/iyzico-provider"
import { CodPaymentProvider } from "./providers/cod/cod-payment-provider"
import { BankTransferProvider } from "./providers/bank-transfer/bank-transfer-provider"

export const MULTI_PAYMENT_MODULE = "multiPaymentModuleService"

export default Module(MULTI_PAYMENT_MODULE, {
  service: PaymentIntegrationService,
  providers: [
      {
          resolve: PayTRProvider,
          id: "paytr",
          is_payment_provider: true
      },
      {
          resolve: IyzicoProvider,
          id: "iyzico",
          is_payment_provider: true
      },
      {
          resolve: CodPaymentProvider,
          id: "cod_cash",
          is_payment_provider: true
      },
      {
          resolve: BankTransferProvider,
          id: "bank_transfer",
          is_payment_provider: true
      }
  ]
})
