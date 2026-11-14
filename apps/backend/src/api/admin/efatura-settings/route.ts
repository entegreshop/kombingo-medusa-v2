import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  EfaturaConfig,
  EfaturaInvoiceRecord,
  readEfaturaConfig,
  writeEfaturaConfig,
  readEfaturaInvoices,
  saveEfaturaInvoice,
} from "../efatura/route"

export {
  EfaturaConfig,
  EfaturaInvoiceRecord,
  readEfaturaConfig,
  writeEfaturaConfig,
  readEfaturaInvoices,
  saveEfaturaInvoice,
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const config = readEfaturaConfig()
  res.json({ config })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const current = readEfaturaConfig()
    const body = (req.body as Partial<EfaturaConfig>) || {}
    const updated = writeEfaturaConfig({ ...current, ...body })
    res.json({ config: updated, success: true })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "Ayarlar kaydedilemedi" })
  }
}
