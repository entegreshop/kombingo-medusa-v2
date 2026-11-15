import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "logo-config.json")

export const defaultLogoConfig = {
  logo: "/logo.png",
  logoUrl: "/logo.png",
  headerLogo: "/logo.png",
  favicon: "/favicon.ico",
  faviconUrl: "/favicon.ico",
  mobileLogo: "/logo.png",
  footerLogo: "/logo.png",
  emailLogo: "/logo.png",
  defaultImage: null,
  checkoutLogo: "/logo.png",
  sideMenuLogo: "/logo.png",
  siteTitle: "Kombingo",
  storeTitle: "Kombingo",
  contactCompany: "KOMBİNGO MODA & TEKSTİL",
  contactAddress: "Merkez Mah. Moda Cad. No:12 İstanbul / Türkiye",
  contactHours: "Hafta İçi: 09:00 - 19:00 | Cumartesi: 10:00 - 18:00",
  contactPhone: "0532 337 00 81",
  contactEmail: "info@kombingo.com",
  footerCopyrightText: `© ${new Date().getFullYear()} Kombingo. Tüm Hakları Saklıdır.`,
  copyrightText: `© ${new Date().getFullYear()} Kombingo. Tüm Hakları Saklıdır.`,
}

export function readLogoConfig() {
  try {
    if (!fs.existsSync(configFilePath)) {
      return defaultLogoConfig
    }
    const fileContent = fs.readFileSync(configFilePath, "utf-8")
    const raw = JSON.parse(fileContent)
    const parsed = raw?.config ? { ...raw, ...raw.config } : raw
    const merged = {
      ...defaultLogoConfig,
      ...parsed,
    }
    if (merged.headerLogo && !parsed.logo) merged.logo = merged.headerLogo
    if (merged.logo && !parsed.headerLogo) merged.headerLogo = merged.logo
    return merged
  } catch (error) {
    return defaultLogoConfig
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const config = readLogoConfig()
    res.json({ config })
  } catch (error: any) {
    res.status(500).json({ message: "Failed to read logo config", error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body as any) || {}
    const incoming = body.config && typeof body.config === "object" ? body.config : body
    const existing = readLogoConfig()

    const merged: Record<string, any> = {
      ...existing,
      ...incoming,
    }
    if (incoming.headerLogo !== undefined) {
      merged.logo = incoming.headerLogo
      merged.logoUrl = incoming.headerLogo
    } else if (incoming.logoUrl !== undefined && incoming.logo === undefined) {
      merged.logo = incoming.logoUrl
      merged.headerLogo = incoming.logoUrl
    } else if (incoming.logo !== undefined && incoming.logoUrl === undefined) {
      merged.logoUrl = incoming.logo
      merged.headerLogo = incoming.logo
    }
    if (incoming.faviconUrl !== undefined && incoming.favicon === undefined) {
      merged.favicon = incoming.faviconUrl
    } else if (incoming.favicon !== undefined && incoming.faviconUrl === undefined) {
      merged.faviconUrl = incoming.favicon
    }
    if (incoming.storeTitle !== undefined && incoming.siteTitle === undefined) {
      merged.siteTitle = incoming.storeTitle
    } else if (incoming.siteTitle !== undefined && incoming.storeTitle === undefined) {
      merged.storeTitle = incoming.siteTitle
    }
    if (incoming.copyrightText !== undefined && incoming.footerCopyrightText === undefined) {
      merged.footerCopyrightText = incoming.copyrightText
    } else if (incoming.footerCopyrightText !== undefined && incoming.copyrightText === undefined) {
      merged.copyrightText = incoming.footerCopyrightText
    }

    const uploadsDir = path.dirname(configFilePath)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    fs.writeFileSync(configFilePath, JSON.stringify(merged, null, 2))
    res.json({ success: true, config: merged })
  } catch (error: any) {
    res.status(500).json({ message: "Failed to save logo config", error: error.message })
  }
}
