import { model } from "@medusajs/framework/utils"

export const PaymentCredential = model.define("payment_credential", {
  id: model.id().primaryKey(),
  provider_id: model.text(),            // 'paytr', 'iyzico', 'cod_cash', 'bank_transfer' vs
  is_active: model.boolean().default(true),
  is_live: model.boolean().default(false),
  list_name: model.text(),              // Checkout'ta müşteriye görünecek isim (Örn: Havale / EFT)
  description: model.text().nullable(), // Checkout açıklaması
  api_key: model.text().nullable(),
  api_secret: model.text().nullable(),
  merchant_id: model.text().nullable(),
  extra_fee: model.number().default(0), // Kapıda ödeme hizmet bedeli vs.
  min_order_amount: model.number().default(0),
  max_order_amount: model.number().nullable(),
  priority: model.number().default(100),// Sıralama
  metadata: model.json().nullable(),    
})
