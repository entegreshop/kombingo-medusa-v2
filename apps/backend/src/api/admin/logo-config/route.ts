import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "logo-config.json")

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    if (!fs.existsSync(configFilePath)) {
      return res.json({
        config: {
          logo: null,
          favicon: null,
          mobileLogo: null,
          footerLogo: null,
          emailLogo: null,
          defaultImage: null,
          checkoutLogo: null,
          sideMenuLogo: null,
          siteTitle: "",
          footerCopyrightText: "",
        }
      })
    }

    const fileContent = fs.readFileSync(configFilePath, "utf-8")
    const raw = JSON.parse(fileContent)
    const config = raw?.config ? { ...raw, ...raw.config } : raw

    res.json({ config })
  } catch (error) {
    res.status(500).json({ message: "Failed to read logo config", error: error.message })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const body = (req.body as any) || {}
    const incoming = body.config && typeof body.config === "object" ? body.config : body

    let existing: Record<string, any> = {}
    if (fs.existsSync(configFilePath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(configFilePath, "utf-8"))
        existing = parsed?.config ? { ...parsed, ...parsed.config } : parsed
      } catch {}
    }

    const merged: Record<string, any> = {
      ...existing,
      ...incoming,
    }
    if (incoming.logoUrl !== undefined && incoming.logo === undefined) {
      merged.logo = incoming.logoUrl
    } else if (incoming.logo !== undefined && incoming.logoUrl === undefined) {
      merged.logoUrl = incoming.logo
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

    // Ensure uploads directory exists
    const uploadsDir = path.dirname(configFilePath)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    fs.writeFileSync(configFilePath, JSON.stringify(merged, null, 2))

    res.json({ success: true, config: merged })
  } catch (error) {
    res.status(500).json({ message: "Failed to save logo config", error: error.message })
  }
}
