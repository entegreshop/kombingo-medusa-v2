import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { XMLParser } from "fast-xml-parser"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { url } = req.body as { url: string }
    if (!url) {
      return res.status(400).json({ message: "URL is required" })
    }

    const response = await fetch(url)
    const xmlData = await response.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    })
    const jsonObj = parser.parse(xmlData)

    let firstProduct: any = null;

    const findFirstArray = (obj: any): any[] | null => {
      for (const key in obj) {
        if (Array.isArray(obj[key])) return obj[key];
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const res = findFirstArray(obj[key]);
          if (res) return res;
        }
      }
      return null;
    }

    const items = findFirstArray(jsonObj);
    if (items && items.length > 0) {
      firstProduct = items[0];
    } else {
      firstProduct = jsonObj;
    }

    const tags: string[] = []
    
    const extractKeys = (obj: any, prefix = "") => {
      if (!obj) return;
      for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (Array.isArray(obj[key]) && obj[key].length > 0) {
            extractKeys(obj[key][0], prefix ? `${prefix} > ${key}` : key)
          } else if (!Array.isArray(obj[key])) {
            extractKeys(obj[key], prefix ? `${prefix} > ${key}` : key)
          }
        } else {
          tags.push(prefix ? `${prefix} > ${key}` : key)
        }
      }
    }

    extractKeys(firstProduct)
    const uniqueTags = [...new Set(tags)]

    res.json({ tags: uniqueTags })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}
