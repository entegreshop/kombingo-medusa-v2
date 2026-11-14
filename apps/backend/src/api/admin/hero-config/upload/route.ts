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

    // Extract the raw base64 data
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64
    const buffer = Buffer.from(base64Data, "base64")

    // Dosyaların kaydedileceği yol (Artık direkt backend'in kendi uploads klasörü)
    let uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Make filename safe
    const ext = path.extname(filename)
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9\-_]/g, "")
    const safeFilename = `${Date.now()}-${base}${ext}`
    const filePath = path.join(uploadDir, safeFilename)

    // Write file to backend uploads
    fs.writeFileSync(filePath, buffer)

    // Artık dosyaları Storefront'tan değil, kendi yazdığımız Backend rotasından okuyacağız!
    // Bu yüzden URL direkt olarak Backend adresimiz olmalı.
    const host = req.headers["x-forwarded-host"] || req.headers.host || "api.kombingo.com"
    const protocol = req.headers["x-forwarded-proto"] || "https"
    
    // Doğru URL: https://api.kombingo.com/uploads/dosya.mp4
    const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`

    res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    })
  } catch (err: any) {
    console.error("Error uploading hero media:", err)
    res.status(500).json({ success: false, message: err.message || "Yükleme başarısız oldu" })
  }
}
