import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig } from "../../admin/payment-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}
