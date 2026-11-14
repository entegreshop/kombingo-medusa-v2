import { MedusaService } from "@medusajs/framework/utils"
import { PaymentCredential } from "../models/payment-credential"
import { BankAccount } from "../models/bank-account"

class PaymentIntegrationService extends MedusaService({
  PaymentCredential,
  BankAccount
}) {
  /**
   * Özel metodlarımızı (Örn: Webhook işlemleri, Aktif POS bulucular) buraya ekleyebiliriz.
   */
}

export default PaymentIntegrationService
