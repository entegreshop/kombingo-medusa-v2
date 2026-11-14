import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    res.json({ shipping_carriers: [] })
  } catch (e) {
    res.json({ shipping_carriers: [] })
  }
}
