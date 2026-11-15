import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readLogoConfig } from "../../admin/logo-config/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const config = readLogoConfig()
    res.json({ config })
  } catch (error: any) {
    res.status(500).json({ message: "Failed to read logo config", error: error.message })
  }
}
