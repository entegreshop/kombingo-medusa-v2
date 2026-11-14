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
