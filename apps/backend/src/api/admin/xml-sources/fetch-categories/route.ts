import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { XMLParser } from "fast-xml-parser"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { url } = req.body as { url: string }
    
    if (!url) {
      return res.status(400).json({ message: "URL gerekli." })
    }

    const response = await fetch(url)
    const xmlData = await response.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    })
    const jsonObj = parser.parse(xmlData)

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
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "XML içerisinde ürün bulunamadı." })
    }

    const categories = new Set<string>()

    items.forEach(item => {
      // Look for category_path first, then fallback to other common category fields
      if (item.category_path) {
        categories.add(String(item.category_path))
      } else {
        // Try to construct from cat1name, cat2name etc.
        const cats: string[] = []
        if (item.cat1name) cats.push(item.cat1name)
        if (item.cat2name) cats.push(item.cat2name)
        if (item.cat3name) cats.push(item.cat3name)
        
        if (cats.length > 0) {
          categories.add(cats.join(" >>> "))
        } else if (item.category) {
          categories.add(String(item.category))
        }
      }
    })

    const uniqueCategories = Array.from(categories).sort()

    res.json({ categories: uniqueCategories })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
