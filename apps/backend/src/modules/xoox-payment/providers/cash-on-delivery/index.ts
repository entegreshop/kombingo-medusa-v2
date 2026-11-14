import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { BasePaymentProviderService } from "../../base-service"

class CashOnDeliveryPaymentProviderService extends BasePaymentProviderService {
  static identifier = "cash-on-delivery"
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [CashOnDeliveryPaymentProviderService],
})
