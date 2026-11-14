import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const filename = req.params.filename as string
    if (!filename) {
      return res.status(400).send("No filename provided")
    }

    // `process.cwd()` in production usually points to the project root
    const filePath = path.join(process.cwd(), "uploads", filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found")
    }

    // Set correct content type for mp4 or image
    const ext = path.extname(filename).toLowerCase()
    let contentType = "application/octet-stream"
    if (ext === ".mp4") contentType = "video/mp4"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".webp") contentType = "image/webp"

    res.setHeader("Content-Type", contentType)

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
}
