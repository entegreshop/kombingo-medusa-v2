import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { BasePaymentProviderService } from "../../base-service"

class BankTransferPaymentProviderService extends BasePaymentProviderService {
  static identifier = "bank-transfer"
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [BankTransferPaymentProviderService],
})
