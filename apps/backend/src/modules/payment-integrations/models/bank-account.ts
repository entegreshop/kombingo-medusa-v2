import { model } from "@medusajs/framework/utils"

export const BankAccount = model.define("bank_account", {
  id: model.id().primaryKey(),
  bank_name: model.text(),
  account_holder: model.text(),
  iban: model.text(),
  is_active: model.boolean().default(true),
  branch_name: model.text().nullable(),
  account_number: model.text().nullable(),
  currency: model.text().default("TRY"),
  priority: model.number().default(100),
  metadata: model.json().nullable()
})
