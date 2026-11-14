import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig, syncMedusaShippingOptionPrices } from "../../admin/shipping-settings/route"

let hasSyncedShippingOnBoot = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  if (!hasSyncedShippingOnBoot) {
    hasSyncedShippingOnBoot = true
    syncMedusaShippingOptionPrices(req.scope, config).catch(() => {})
  }
  res.json({ config })
}
