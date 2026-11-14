import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import { readCatalogState, writeCatalogState, DEFAULT_REVIEWS } from "../../admin/catalog-operations/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const state = readCatalogState()
    const productId = String(req.query?.product_id || "").trim()
    const allActive = (state.reviews || DEFAULT_REVIEWS).filter((r) => r.active !== false)

    // Product-specific reviews + general reviews ("all") so every product page has rich reviews
    const filtered = productId
      ? allActive.filter((r) => r.product_id === productId || r.product_id === "all")
      : allActive

    const totalCount = filtered.length
    const averageRating =
      totalCount > 0
        ? Number((filtered.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalCount).toFixed(1))
        : 5.0

    return res.json({
      success: true,
      reviews: filtered,
      total_count: totalCount,
      average_rating: averageRating,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as any
    const state = readCatalogState()
    const list = [...(state.reviews || DEFAULT_REVIEWS)]

    if (body.action === "helpful" && body.id) {
      const idx = list.findIndex((r) => r.id === body.id)
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          helpful_count: Number(list[idx].helpful_count || 0) + 1,
        }
        state.reviews = list
        writeCatalogState(state)
      }
      return res.json({ success: true, reviews: state.reviews })
    }

    const comment = String(body.comment || "").trim()
    if (!comment) {
      return res.status(400).json({ success: false, error: "Lütfen yorumunuzu yazınız." })
    }

    let mediaUrl = String(body.media_url || "").trim()
    let mediaType: "image" | "video" = body.media_type === "video" ? "video" : "image"

    // If storefront sends base64 file upload
    if (body.base64 && body.filename) {
      try {
        const base64Data = String(body.base64).includes(",")
          ? String(body.base64).split(",")[1]
          : String(body.base64)
        const buffer = Buffer.from(base64Data, "base64")
        const uploadDir = path.join(process.cwd(), "uploads")
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const ext = path.extname(String(body.filename)) || ".jpg"
        const base = path
          .basename(String(body.filename), ext)
          .replace(/[^a-zA-Z0-9\-_]/g, "")
          .slice(0, 40)
        const safeFilename = `review-${Date.now()}-${base || "media"}${ext}`
        fs.writeFileSync(path.join(uploadDir, safeFilename), buffer)

        const host = req.headers["x-forwarded-host"] || req.headers.host || "api.kombingo.com"
        const protocol = req.headers["x-forwarded-proto"] || "https"
        mediaUrl = `${protocol}://${host}/uploads/${safeFilename}`
        if (
          String(body.filetype || "").startsWith("video/") ||
          /\.(mp4|webm|mov|ogg|avi)$/i.test(safeFilename)
        ) {
          mediaType = "video"
        }
      } catch (uploadErr) {
        console.error("Failed to save review media:", uploadErr)
      }
    }

    const maxNo = list.reduce((max, r) => (r.no > max ? r.no : max), 0)
    const nowStr = new Date().toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const rawName = String(body.customer_name || body.author || "Ziyaretçi").trim()

    const newReview = {
      id: `rev_${Date.now()}`,
      no: maxNo + 1,
      product_id: String(body.product_id || "all"),
      product_title: String(body.product_title || "Ürün Değerlendirmesi"),
      product_handle: String(body.product_handle || ""),
      product_thumbnail: String(body.product_thumbnail || ""),
      customer_name: rawName || "Müşteri",
      color: String(body.color || "STANDART").trim(),
      size: String(body.size || "").trim(),
      rating: Math.min(5, Math.max(1, Number(body.rating || 5))),
      comment,
      media_url: mediaUrl,
      media_type: mediaType,
      media_urls: mediaUrl ? [mediaUrl] : [],
      active: true,
      verified_purchase: true,
      helpful_count: 1,
      created_at: nowStr,
      source: "storefront" as const,
    }

    list.unshift(newReview)
    state.reviews = list
    writeCatalogState(state)

    return res.json({
      success: true,
      review: newReview,
      message: "Değerlendirmeniz başarıyla eklendi.",
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
