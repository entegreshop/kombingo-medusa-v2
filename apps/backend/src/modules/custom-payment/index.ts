import { CashOnDeliveryProvider, CardOnDeliveryProvider, BankTransferProvider, PaytrProvider } from "./service"

export default {
  services: [CashOnDeliveryProvider, CardOnDeliveryProvider, BankTransferProvider, PaytrProvider],
}
