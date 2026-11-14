import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as fs from "fs"
import * as path from "path"
import { randomUUID } from "crypto"

export interface XmlFeedConfig {
  id: string
  no?: number
  name: string
  format: string
  currency: string
  language: string
  product_source: string
  categories: string[]
  brands: string
  tags?: string
  price_type: string
  status: string
  title_case?: string
  short_desc_case?: string
  stock_status: string
  min_stock: number
  add_barcode: string
  profit_margin: number
  sort_by_date?: boolean
  webp_images?: boolean
  hide_no_image: boolean
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "uploads", "xml-feeds.json")

const DEFAULT_FEEDS: XmlFeedConfig[] = [
  {
    id: "d071279e-210e-4a33-beca-10f169f8ef4f",
    no: 11,
    name: "Ön Tampon & Lip Katalog",
    format: "Facebook - Instagram Katalog",
    currency: "TL",
    language: "Varsayılan",
    product_source: "Hiçbiri seçilmedi",
    categories: [],
    brands: "Marka Seçilmedi",
    tags: "Etiket Seçilmedi",
    price_type: "Varsayılan Satış Fiyatı",
    status: "Aktif Olanlar",
    title_case: "Varsayılan",
    short_desc_case: "Varsayılan",
    stock_status: "Tümü",
    min_stock: -9999,
    add_barcode: "Eklensin",
    profit_margin: 0,
    sort_by_date: false,
    webp_images: true,
    hide_no_image: true,
  },
  {
    id: "61b7ee0a-733e-4384-ba60-a746ce4f1e78",
    no: 10,
    name: "Arka Difüzör & Spoiler",
    format: "Facebook - Instagram Katalog",
    currency: "TL",
    language: "Varsayılan",
    product_source: "Hiçbiri seçilmedi",
    categories: [],
    brands: "Marka Seçilmedi",
    tags: "Etiket Seçilmedi",
    price_type: "Varsayılan Satış Fiyatı",
    status: "Aktif Olanlar",
    title_case: "Varsayılan",
    short_desc_case: "Varsayılan",
    stock_status: "Tümü",
    min_stock: -9999,
    add_barcode: "Eklensin",
    profit_margin: 0,
    sort_by_date: false,
    webp_images: true,
    hide_no_image: true,
  },
  {
    id: "bb0ed7f4-538d-4148-950b-788c2053d7ba",
    no: 9,
    name: "Yan Marşpiyel & Aksesuar",
    format: "Facebook - Instagram Katalog",
    currency: "TL",
    language: "Varsayılan",
    product_source: "Hiçbiri seçilmedi",
    categories: [],
    brands: "Marka Seçilmedi",
    tags: "Etiket Seçilmedi",
    price_type: "Varsayılan Satış Fiyatı",
    status: "Aktif Olanlar",
    title_case: "Varsayılan",
    short_desc_case: "Varsayılan",
    stock_status: "Tümü",
    min_stock: -9999,
    add_barcode: "Eklensin",
    profit_margin: 0,
    sort_by_date: false,
    webp_images: true,
    hide_no_image: true,
  },
  {
    id: "9d6ccd92-9415-47c5-bf3c-854444433122",
    no: 8,
    name: "Google Merchant Tüm Ürünler",
    format: "Google Merchant Katalog",
    currency: "TL",
    language: "Varsayılan",
    product_source: "Hiçbiri seçilmedi",
    categories: [],
    brands: "Marka Seçilmedi",
    tags: "Etiket Seçilmedi",
    price_type: "Varsayılan Satış Fiyatı",
    status: "Aktif Olanlar",
    title_case: "Varsayılan",
    short_desc_case: "Varsayılan",
    stock_status: "Tümü",
    min_stock: -9999,
    add_barcode: "Eklensin",
    profit_margin: 0,
    sort_by_date: false,
    webp_images: true,
    hide_no_image: true,
  },
  {
    id: "1cea239f-0208-4731-b728-bcfb300807e0",
    no: 7,
    name: "Cimri & Akakçe Fiyat Karşılaştırma",
    format: "Akakçe",
    currency: "TL",
    language: "Varsayılan",
    product_source: "Hiçbiri seçilmedi",
    categories: [],
    brands: "Marka Seçilmedi",
    tags: "Etiket Seçilmedi",
    price_type: "Varsayılan Satış Fiyatı",
    status: "Aktif Olanlar",
    title_case: "Varsayılan",
    short_desc_case: "Varsayılan",
    stock_status: "Tümü",
    min_stock: -9999,
    add_barcode: "Eklensin",
    profit_margin: 0,
    sort_by_date: false,
    webp_images: true,
    hide_no_image: true,
  },
  {
    id: "660f0322-0b26-4731-925f-c1981d905a09",
    no: 6,
    name: "Meta",
    format: "Facebook - Instagram Katalog",
    currency: "TL",
    language: "Varsayılan",
    product_source: "Hiçbiri seçilmedi",
    categories: [],
    brands: "Marka Seçilmedi",
    tags: "Etiket Seçilmedi",
    price_type: "Varsayılan Satış Fiyatı",
    status: "Aktif Olanlar",
    title_case: "Varsayılan",
    short_desc_case: "Varsayılan",
    stock_status: "Tümü",
    min_stock: -9999,
    add_barcode: "Eklensin",
    profit_margin: 0,
    sort_by_date: false,
    webp_images: true,
    hide_no_image: true,
  },
]

export const getXmlFeeds = (): XmlFeedConfig[] => {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8")
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.error("Error reading xml feeds file:", error)
  }
  saveXmlFeeds(DEFAULT_FEEDS)
  return DEFAULT_FEEDS
}

export const saveXmlFeeds = (feeds: XmlFeedConfig[]) => {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(feeds, null, 2), "utf-8")
  } catch (error) {
    console.error("Error writing xml feeds file:", error)
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const feeds = getXmlFeeds()
    res.json({ feeds })
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const payload = req.body as Partial<XmlFeedConfig>
    const feeds = getXmlFeeds()

    if (payload.id) {
      const index = feeds.findIndex((f) => f.id === payload.id)
      if (index !== -1) {
        feeds[index] = { ...feeds[index], ...payload }
      } else {
        return res.status(404).json({ success: false, error: "Feed not found" })
      }
    } else {
      const maxNo = feeds.reduce((max, f, i) => Math.max(max, f.no ?? feeds.length - i + 5), 5)
      const newFeed: XmlFeedConfig = {
        id: randomUUID(),
        no: maxNo + 1,
        name: payload.name || "Yeni XML",
        format: payload.format || "Standart XML",
        currency: payload.currency || "TL",
        language: payload.language || "Varsayılan",
        product_source: payload.product_source || "Hiçbiri seçilmedi",
        categories: payload.categories || [],
        brands: payload.brands || "Marka Seçilmedi",
        tags: payload.tags || "Etiket Seçilmedi",
        price_type: payload.price_type || "Varsayılan Satış Fiyatı",
        status: payload.status || "Aktif Olanlar",
        title_case: payload.title_case || "Varsayılan",
        short_desc_case: payload.short_desc_case || "Varsayılan",
        stock_status: payload.stock_status || "Tümü",
        min_stock: payload.min_stock !== undefined ? payload.min_stock : -9999,
        add_barcode: payload.add_barcode || "Eklensin",
        profit_margin: Number(payload.profit_margin) || 0,
        sort_by_date: payload.sort_by_date ?? false,
        webp_images: payload.webp_images ?? true,
        hide_no_image: payload.hide_no_image ?? true,
      }
      feeds.unshift(newFeed)
    }

    saveXmlFeeds(feeds)
    res.json({ success: true, feeds })
  } catch (error) {
    console.error("Error saving xml feed:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}
