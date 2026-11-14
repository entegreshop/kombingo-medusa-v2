import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "payment-settings.json")
const legacyConfigFilePath = path.join(process.cwd(), ".xoox-payment-settings.json")
const legacyHomeConfigFilePath = path.join(os.homedir(), ".xoox-payment-settings.json")

const defaultInstallments = [
  { taksit: "Tek Çekim", oran: 0, active: true },
  { taksit: "2 Taksit", oran: 7.31, active: true },
  { taksit: "3 Taksit", oran: 9.35, active: true },
  { taksit: "4 Taksit", oran: 11.38, active: true },
  { taksit: "5 Taksit", oran: 13.43, active: true },
  { taksit: "6 Taksit", oran: 15.46, active: true },
  { taksit: "7 Taksit", oran: 17.49, active: true },
  { taksit: "8 Taksit", oran: 18.53, active: true },
  { taksit: "9 Taksit", oran: 21.58, active: true },
  { taksit: "10 Taksit", oran: 23.8, active: true },
  { taksit: "11 Taksit", oran: 25.84, active: true },
  { taksit: "12 Taksit", oran: 27.68, active: true }
]

const defaultData = {
  free_shipping_threshold: 3000,
  paytr: {
    active: true,
    min_total: 0,
    max_total: 100000,
    merchant_id: process.env.PAYTR_MERCHANT_ID || "629307",
    merchant_key: process.env.PAYTR_MERCHANT_KEY || "9FMJdoSkaUX87q8F",
    merchant_salt: process.env.PAYTR_MERCHANT_SALT || "1uFDNEN7PX3a6CR2",
    test_mode: "Kapalı",
    disable_3d_secure_intl: false,
    installments: defaultInstallments
  },
  bank_transfer: {
    active: true,
    name: "Havale / EFT",
    adjustment_type: "discount_percentage", // "none", "discount_percentage", "surcharge_amount"
    adjustment_value: 5,
    instructions: "Havale - EFT ile şimdi ödemeyi gönder. Sonra siparişi tamamla...\n\nÖdeme Bilgileri\nTR77 0011 1000 0000 0146 7748 72\n\nHesap Sahibi: NUH ŞAHİN\nHesap Bilgisi: Finans Bank",
    min_total: 0,
    max_total: 100000
  },
  cash_on_delivery: {
    active: true,
    name: "Kapıda Ödeme (Nakit)",
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda nakit ödeme ile teslimat sırasında ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000
  },
  card_on_delivery: {
    active: true,
    name: "Kapıda Ödeme (Kredi Kartı)",
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda kredi kartı ödemesi ile teslimat sırasında kartınızla ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000
  }
}

export function readConfig() {
  try {
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyConfigFilePath)
        ? legacyConfigFilePath
        : fs.existsSync(legacyHomeConfigFilePath)
          ? legacyHomeConfigFilePath
          : null

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      const parsedPaytr = { ...(parsed.paytr || {}) }
      if (parsedPaytr.merchant_id === "647433" || parsedPaytr.merchant_key === "Xon89DCuBQGLIM7" || parsedPaytr.merchant_key === "9FMjdoSkaUX87q8F" || parsedPaytr.merchant_salt === "1uFDNFN7PX3a6CR7") {
        delete parsedPaytr.merchant_id
        delete parsedPaytr.merchant_key
        delete parsedPaytr.merchant_salt
      }
      return {
        ...defaultData,
        ...parsed,
        paytr: { ...defaultData.paytr, ...parsedPaytr },
        bank_transfer: { ...defaultData.bank_transfer, ...(parsed.bank_transfer || {}) },
        cash_on_delivery: { ...defaultData.cash_on_delivery, ...(parsed.cash_on_delivery || {}) },
        card_on_delivery: { ...defaultData.card_on_delivery, ...(parsed.card_on_delivery || {}) }
      }
    }
  } catch (err) {
    console.error("Error reading payment config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing payment config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const success = writeConfig(body)
  
  if (success) {
    try {
      // Background Sync with Medusa Core
      const query = req.scope.resolve("query")
      
      // 1. Fetch all existing regions
      const { data: regions } = await query.graph({
        entity: "region",
        fields: ["id", "payment_providers.*"]
      })

      if (regions && regions.length > 0) {
        // Collect active providers from our config
        const activeProviders: string[] = []
        if (body.paytr?.active) activeProviders.push("pp_PAYTR_PAYTR")
        if (body.bank_transfer?.active) activeProviders.push("pp_BANK-TRANSFER_BANK-TRANSFER")
        if (body.cash_on_delivery?.active) activeProviders.push("pp_CASH-ON-DELIVERY_CASH-ON-DELIVERY")
        if (body.card_on_delivery?.active) activeProviders.push("pp_CARD-ON-DELIVERY_CARD-ON-DELIVERY")

        // Update all regions to include these providers
        for (const region of regions as any[]) {
          // We can optionally merge with existing providers, or just set them to the active ones.
          // Medusa also has "pp_system_default". We will include it so admin manual payment works.
          const finalProviders = ["pp_system_default", ...activeProviders]

          await updateRegionsWorkflow(req.scope).run({
            input: {
              selector: { id: region.id },
              update: {
                payment_providers: finalProviders
              }
            }
          })
        }
        console.log("Successfully synced payment providers to regions.")
      }
    } catch (syncError) {
      console.error("Error syncing payment providers with Medusa Core:", syncError)
    }

    res.json({ success: true, config: body })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
