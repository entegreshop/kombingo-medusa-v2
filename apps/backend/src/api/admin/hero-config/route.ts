import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "hero-config.json")
const legacyConfigFilePath = path.join(os.homedir(), ".xoox-hero-config.json")

const defaultCategories = [
  {
    name: "Jean Pantolon",
    handle: "jean-pantolon",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l1.5 16h-4.5L12 9l-2 11H5.5L7 4z"/><path d="M7 7h10"/><path d="M9 4v3"/><path d="M15 4v3"/></svg>`
  },
  {
    name: "Tayt",
    handle: "tayt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l1 16h-3.5L12 9.5 10.5 20H7.0L8 4z"/><path d="M8 7.5h8"/></svg>`
  },
  {
    name: "Sweat",
    handle: "sweat",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l-3 3.5L5.5 15l1.5-2v6.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5V13l1.5 2 2.5-2.5L18 9V6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v3z"/><path d="M9 10a3 3 0 0 0 6 0"/><path d="M12 3v5"/></svg>`
  },
  {
    name: "Mont & Kürk",
    handle: "mont",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a3 3 0 0 0-3-3h-2L12 3.5 10 5H8a3 3 0 0 0-3 3z"/><path d="M12 3.5V21"/><path d="M5 9h14"/><path d="M5 13h14"/><path d="M5 17h14"/></svg>`
  },
  {
    name: "Kombin",
    handle: "kombin",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a2 2 0 0 0-2 2c0 .5.2.9.5 1.2L5 8.5v3l4.5 1V19A1.5 1.5 0 0 0 11 20.5h2a1.5 1.5 0 0 0 1.5-1.5v-6.5l4.5-1v-3L13.5 6.2c.3-.3.5-.7.5-1.2a2 2 0 0 0-2-2z"/><path d="M8 8.5V17"/><path d="M16 8.5V17"/></svg>`
  },
  {
    name: "Tshirt",
    handle: "tshirt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5.5L3.5 8 5.5 11l2-1.5v10.0A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5V9.5l2 1.5 2-3L18 5.5V3.5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 6 3.5v2.0z"/><path d="M9.5 2h5A2.5 2.5 0 0 1 12 4.5 2.5 2.5 0 0 1 9.5 2z"/></svg>`
  },
  {
    name: "Gözlük",
    handle: "gozluk",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a3 3 0 0 1 3-3h3.5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v0z"/><path d="M11.5 11a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-3.5a3 3 0 0 1-3-3v0z"/><path d="M9.5 11h2.5"/><path d="M3 11.5c.5-3 2-4.5 3.5-4.5"/><path d="M21 11.5c-.5-3-2-4.5-3.5-4.5"/></svg>`
  },
  {
    name: "Çanta",
    handle: "canta",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 8z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8"/></svg>`
  }
]

const defaultBanners = [
  {
    tag: "Trend Koleksiyon",
    title: "PREMIUM JEAN KOLEKSİYONU",
    description: "En boy likralı kot taytlar ve yüksek bel toparlayıcı jean pantolonlar şimdi en popüler kesimleriyle vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/categories/jean-pantolon",
    image_url: "",
  },
  {
    tag: "Özel Seçki",
    title: "YAZ SEZONU KOMBİNLERİ",
    description: "Oysho modal kumaş şalvar takımlar ve çift şerit paraşüt kargo pantolonlar ile konforlu ve şık kombinler.",
    btn_text: "Şimdi İncele",
    btn_link: "/categories/kombin",
    image_url: "",
  }
]

const defaultData = {
  tag: "MEDUSA V2 × NEXT.JS",
  title: "XOOX Mağazasına Hoş Geldiniz",
  subtitle: "Medusa V2 altyapısıyla güçlendirilen yeni 2026 koleksiyonumuzu keşfedin",
  btn_text: "Şimdi Alışverişe Başla",
  btn_link: "/store",
  media_type: "image", // "image" or "video"
  media_url: "",
  categories: defaultCategories,
  banners: defaultBanners,
  top_announcement: "2026 YAZ SEZONU MODELLERİ",
  top_announcement_enabled: true,
  top_announcement_bg: "#000000",
  top_announcement_text_color: "#ffffff",
  scrolling_text_home: "3000 ₺ Üzeri Alışverişlerinizde Kargo Ücretsiz",
  scrolling_text_home_enabled: true,
  scrolling_text_home_bg: "#000000",
  scrolling_text_home_text_color: "#ffffff",
  scrolling_text_product: "Sepette %10 İndirim Kodu : MDS10 • 3000 ₺ Üzeri Ücretsiz Kargo",
  scrolling_text_product_enabled: true,
  scrolling_text_product_bg: "#FFD700",
  scrolling_text_product_text_color: "#000000",
  // Button Settings
  buy_now_enabled: true,
  buy_now_bg: "#E50000",
  buy_now_text_color: "#ffffff",
  add_to_cart_enabled: true,
  add_to_cart_bg: "#000000",
  add_to_cart_text_color: "#ffffff",
  whatsapp_enabled: true,
  whatsapp_number: "905323370081",
  whatsapp_bg: "#ffffff",
  whatsapp_text_color: "#25D366",
}

function readConfig() {
  try {
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : (fs.existsSync(legacyConfigFilePath) ? legacyConfigFilePath : null)
    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        categories: parsed.categories || defaultCategories,
        banners: parsed.banners || defaultBanners,
      }
    }
  } catch (err) {
    console.error("Error reading hero config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing hero config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const config = readConfig()

  const updatedConfig = {
    tag: body.tag ?? config.tag,
    title: body.title ?? config.title,
    subtitle: body.subtitle ?? config.subtitle,
    btn_text: body.btn_text ?? config.btn_text,
    btn_link: body.btn_link ?? config.btn_link,
    media_type: body.media_type ?? config.media_type,
    media_url: body.media_url ?? config.media_url,
    categories: body.categories ?? config.categories,
    banners: body.banners ?? config.banners,
    top_announcement: body.top_announcement ?? config.top_announcement,
    top_announcement_enabled: body.top_announcement_enabled ?? config.top_announcement_enabled,
    top_announcement_bg: body.top_announcement_bg ?? config.top_announcement_bg,
    top_announcement_text_color: body.top_announcement_text_color ?? config.top_announcement_text_color,
    scrolling_text_home: body.scrolling_text_home ?? config.scrolling_text_home,
    scrolling_text_home_enabled: body.scrolling_text_home_enabled ?? config.scrolling_text_home_enabled,
    scrolling_text_home_bg: body.scrolling_text_home_bg ?? config.scrolling_text_home_bg,
    scrolling_text_home_text_color: body.scrolling_text_home_text_color ?? config.scrolling_text_home_text_color,
    scrolling_text_product: body.scrolling_text_product ?? config.scrolling_text_product,
    scrolling_text_product_enabled: body.scrolling_text_product_enabled ?? config.scrolling_text_product_enabled,
    scrolling_text_product_bg: body.scrolling_text_product_bg ?? config.scrolling_text_product_bg,
    scrolling_text_product_text_color: body.scrolling_text_product_text_color ?? config.scrolling_text_product_text_color,
    // Button Settings
    buy_now_enabled: body.buy_now_enabled ?? config.buy_now_enabled,
    buy_now_bg: body.buy_now_bg ?? config.buy_now_bg,
    buy_now_text_color: body.buy_now_text_color ?? config.buy_now_text_color,
    add_to_cart_enabled: body.add_to_cart_enabled ?? config.add_to_cart_enabled,
    add_to_cart_bg: body.add_to_cart_bg ?? config.add_to_cart_bg,
    add_to_cart_text_color: body.add_to_cart_text_color ?? config.add_to_cart_text_color,
    whatsapp_enabled: body.whatsapp_enabled ?? config.whatsapp_enabled,
    whatsapp_number: body.whatsapp_number ?? config.whatsapp_number,
    whatsapp_bg: body.whatsapp_bg ?? config.whatsapp_bg,
    whatsapp_text_color: body.whatsapp_text_color ?? config.whatsapp_text_color,
  }

  const success = writeConfig(updatedConfig)
  if (success) {
    res.json({ success: true, config: updatedConfig })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}

