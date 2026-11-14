import { MedusaContainer } from "@medusajs/framework/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"

export default async function importTrendyol({ container }: { container: MedusaContainer }) {
  console.log("Resolving modules...")
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)

  console.log("Fetching default sales channel...")
  const salesChannels = await salesChannelModule.listSalesChannels()
  const scId = salesChannels[0]?.id
  
  if (!scId) {
      throw new Error("No sales channels found!")
  }

  console.log("Reading products JSON...")
  // The script runs in apps/backend context
  const dataPath = path.resolve("..", "..", "..", "trendyol-scraper", "trendyol_products.json")
  let rawData;
  try {
      rawData = fs.readFileSync(dataPath, "utf-8")
  } catch (e) {
      // Try alternative path if run from root
      const altPath = path.resolve("C:\\Users\\Asus\\Desktop\\trendyol-scraper\\trendyol_products.json")
      rawData = fs.readFileSync(altPath, "utf-8")
  }
  
  const products = JSON.parse(rawData)

  console.log(`Starting import of ${products.length} products...`)

  const BATCH_SIZE = 50;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    
    const payload = batch.map((p: any) => ({
      title: p.title,
      handle: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random()*10000),
      description: `Trendyol'dan Otomatik İçe Aktarıldı.\nOrijinal Link: ${p.product_url}`,
      images: p.image_url ? [{ url: p.image_url }] : [],
      thumbnail: p.image_url,
      options: [
        {
          title: "Beden",
          values: ["Standart"]
        }
      ],
      variants: [
        {
          title: "Standart",
          options: {
            "Beden": "Standart"
          },
          prices: [
            {
              amount: p.price * 100,
              currency_code: "try"
            }
          ],
          manage_inventory: false
        }
      ],
      sales_channels: [
        {
          id: scId
        }
      ],
      status: "published"
    }))

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: payload
        }
      })
      console.log(`Imported batch ${Math.floor(i / BATCH_SIZE) + 1} (${Math.min(i + BATCH_SIZE, products.length)}/${products.length})`)
    } catch (e: any) {
      console.error(`Error importing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, e.message || e)
    }
  }

  console.log("Import complete!")
}
