import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig, recordGaRealtimeHit } from "../../admin/pixel-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as {
      client_id?: string
      device?: string
      path?: string
    }
    recordGaRealtimeHit(body)
    res.json({ ok: true })
  } catch (err) {
    res.status(200).json({ ok: false })
  }
}
