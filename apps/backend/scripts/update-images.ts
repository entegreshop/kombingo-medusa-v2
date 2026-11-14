import { Modules } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"

export default async function ({ container }: { container: any }) {
  console.log("Loading updateProductsWorkflow...")
  const { updateProductsWorkflow } = require("@medusajs/medusa/core-flows")
  const query = container.resolve("query")
  
  console.log("Reading products_with_all_images.json...")
  // The script runs in apps/backend context
  const dataPath = path.resolve("..", "..", "..", "trendyol-scraper", "products_with_all_images.json")
  let rawData;
  try {
      rawData = fs.readFileSync(dataPath, "utf-8")
  } catch (e) {
      const altPath = path.resolve("C:\\Users\\Asus\\Desktop\\trendyol-scraper\\products_with_all_images.json")
      rawData = fs.readFileSync(altPath, "utf-8")
  }
  
  const scrapedData = JSON.parse(rawData)

  console.log("Fetching Medusa products...")
  const { data: dbProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })

  // Map scraped data by title for quick lookup
  const imageMap = new Map()
  for (const item of scrapedData) {
    if (item && item.title && item.images) {
        // format Trendyol image object structure just in case
        let urls = item.images;
        
        // Sometimes Trendyol images are strings, sometimes they are objects like "/mnresize/..."
        // Our script extracts the full URL strings. Let's make sure.
        let formattedUrls = urls.map(img => typeof img === 'string' ? img : (img.url ? img.url : null)).filter(Boolean);
        
        // Trendyol images sometimes don't have https
        formattedUrls = formattedUrls.map(url => url.startsWith('http') ? url : `https://cdn.dsmcdn.com${url.startsWith('/') ? '' : '/'}${url}`);
        
        imageMap.set(item.title.toLowerCase().trim(), formattedUrls)
    }
  }

  const batchUpdates: any[] = []

  for (const product of dbProducts) {
    const titleLower = product.title.toLowerCase().trim()
    const images = imageMap.get(titleLower)

    if (images && images.length > 0) {
      batchUpdates.push({
        id: product.id,
        images: images.map(url => ({ url }))
      })
    }
  }

  console.log(`Found ${batchUpdates.length} products to update images for.`)
  
  let successCount = 0
  const chunkSize = 20
  for (let i = 0; i < batchUpdates.length; i += chunkSize) {
    const chunk = batchUpdates.slice(i, i + chunkSize)
    try {
      await updateProductsWorkflow(container).run({
        input: {
          products: chunk
        }
      })
      successCount += chunk.length
      console.log(`Updated ${successCount} / ${batchUpdates.length}...`)
    } catch(err) {
      console.log("Error updating chunk:", err.message)
    }
  }

  console.log(`Successfully updated images for ${successCount} products.`)
}
