import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"
import { readConfig as readPaymentConfig } from "../../../admin/payment-settings/route"
import { readConfig as readShippingConfig, syncMedusaShippingOptionPrices } from "../../../admin/shipping-settings/route"

let hasSyncedShippingFromSettings = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]

  const settings: Record<string, any> = { ...(store?.metadata || {}) }

  // Read payment settings (with defaults if file not yet written)
  try {
    const paymentParsed = readPaymentConfig()
    settings.payment_bank = {
      active: paymentParsed.bank_transfer?.active !== false,
      name: paymentParsed.bank_transfer?.name || "Havale / EFT",
      instructions: paymentParsed.bank_transfer?.instructions || "",
      adjustment_type: paymentParsed.bank_transfer?.adjustment_type || "none",
      adjustment_value: paymentParsed.bank_transfer?.adjustment_value ?? 0
    }
    settings.payment_paytr = {
      active: paymentParsed.paytr?.active !== false
    }
    settings.payment_cod = {
      is_active: Boolean(paymentParsed.cash_on_delivery?.active),
      additional_fee: paymentParsed.cash_on_delivery?.adjustment_value ?? 0,
      min_amount: paymentParsed.cash_on_delivery?.max_total ?? 10000
    }
    settings.payment_cod_cc = {
      is_active: Boolean(paymentParsed.card_on_delivery?.active),
      additional_fee: paymentParsed.card_on_delivery?.adjustment_value ?? 0,
      min_amount: paymentParsed.card_on_delivery?.max_total ?? 10000
    }
    settings.shipping_settings = {
      standard_rate: 100,
      free_shipping_limit: paymentParsed.free_shipping_threshold ?? 3000,
      free_shipping_enabled: true
    }
  } catch (err) {}

  // Read shipping settings (with defaults if file not yet written)
  try {
    const shippingParsed = readShippingConfig()
    if (!hasSyncedShippingFromSettings) {
      hasSyncedShippingFromSettings = true
      syncMedusaShippingOptionPrices(req.scope, shippingParsed).catch(() => {})
    }
    settings.shipping_settings = {
      ...settings.shipping_settings,
      standard_rate: shippingParsed.standardShippingEnabled === false
        ? 0
        : (shippingParsed.standardShippingFee !== undefined ? Number(shippingParsed.standardShippingFee) : 100),
      free_shipping_limit: shippingParsed.freeShippingThreshold !== undefined
        ? Number(shippingParsed.freeShippingThreshold)
        : settings.shipping_settings?.free_shipping_limit,
      free_shipping_enabled: shippingParsed.freeShippingEnabled !== undefined
        ? Boolean(shippingParsed.freeShippingEnabled)
        : true
    }
  } catch (err) {}

  // Read logo settings from JSON
  const logoConfigFilePath = path.join(process.cwd(), "uploads", "logo-config.json")
  if (fs.existsSync(logoConfigFilePath)) {
    try {
      const content = fs.readFileSync(logoConfigFilePath, "utf-8")
      const parsed = JSON.parse(content)
      settings.admin_logos = {
        main: parsed.checkoutLogo || parsed.logo
      }
    } catch (err) {}
  }

  settings["footer-telif"] = "Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.\n© 2026 XOOX.com Tüm Hakları Saklıdır"

  res.json({ settings })
}
