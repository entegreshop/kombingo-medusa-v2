import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { BasePaymentProviderService } from "../../base-service"

class PaytrPaymentProviderService extends BasePaymentProviderService {
  static identifier = "paytr"
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [PaytrPaymentProviderService],
})
