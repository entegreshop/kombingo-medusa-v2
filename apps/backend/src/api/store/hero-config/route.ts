import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readHeroConfig } from "../../admin/hero-config/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readHeroConfig()
  res.json({ config })
}
