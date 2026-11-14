import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { BasePaymentProviderService } from "../../base-service"

class CardOnDeliveryPaymentProviderService extends BasePaymentProviderService {
  static identifier = "card-on-delivery"
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [CardOnDeliveryPaymentProviderService],
})
