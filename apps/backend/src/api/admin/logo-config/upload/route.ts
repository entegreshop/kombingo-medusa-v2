import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { filename, filetype, base64 } = req.body as {
      filename: string
      filetype: string
      base64: string
    }

    if (!filename || !base64) {
      return res.status(400).json({ success: false, message: "Dosya adı veya veri eksik" })
    }

    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64
    const buffer = Buffer.from(base64Data, "base64")

    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const ext = path.extname(filename)
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9\-_]/g, "")
    const safeFilename = `logo-${Date.now()}-${base}${ext}`
    const filePath = path.join(uploadDir, safeFilename)

    fs.writeFileSync(filePath, buffer)

    // Generate public URL using the backend's host as per Coolify deployment rule
    const protocol = req.headers["x-forwarded-proto"] || "http"
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:9000"
    const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`

    res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    })
  } catch (err: any) {
    console.error("Error uploading logo media:", err)
    res.status(500).json({ success: false, message: err.message || "Yükleme başarısız oldu" })
  }
}
