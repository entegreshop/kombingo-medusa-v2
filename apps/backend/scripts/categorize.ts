import { Modules } from "@medusajs/framework/utils"
import { IProductModuleService } from "@medusajs/types"

export default async function ({ container }: { container: any }) {
  const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)
  const query = container.resolve("query")
  
  console.log("Fetching all products...")
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })

  // Category map
  const catMap = {
    "body kit": "pcat_01KWDKQH0W9FYGX2XEXD7BC22Q",
    "ön tampon": "pcat_01KWDNADQDD3VJ7D04AQAXM3XR",
    "ön ek": "pcat_01KWDNADQDD3VJ7D04AQAXM3XR",
    "arka tampon": "pcat_01KWDNEM715MEWC704FKSV0NY0",
    "arka ek": "pcat_01KWDNEM715MEWC704FKSV0NY0",
    "marşpiyel": "pcat_01KWDNG2C3M5H7T00S3V7SHB5Z",
    "yan ek": "pcat_01KWDNG2C3M5H7T00S3V7SHB5Z",
    "bagaj": "pcat_01KWDNJC7SSC8X3CRYK9M4SPKV", // Map to Bagaz Havuzu
    "havuz": "pcat_01KWDNJC7SSC8X3CRYK9M4SPKV", // Map to Bagaz Havuzu
    "marş sistemi": "pcat_01KWDNK7CQ5F7VXAHSHZZTA4WG",
    "spoiler": "pcat_01KWDNMQHYACY249098TYN83P3",
    "rüzgarlık": "pcat_01KWDNNQCGZR69HVWXZ9T5ZPW7",
    "karlık": "pcat_01KWDNPJFKWC2EKDG9VDXMHRN4",
    "aks": "pcat_01KWDNQVQ008V1TZ9K76XFEPWV",
    "körük": "pcat_01KWDNQVQ008V1TZ9K76XFEPWV",
  }

  const otoAksesuarId = "pcat_01KWDKM9F793P7E3K7T5DEJP4G"

  let updatedCount = 0
  const batchUpdates: any[] = []

  console.log(`Checking ${products.length} products...`)

  for (const product of products) {
    const titleLower = product.title.toLowerCase()
    let assignedCategoryId: string | null = null

    for (const [keyword, catId] of Object.entries(catMap)) {
      if (titleLower.includes(keyword)) {
        assignedCategoryId = catId
        break
      }
    }

    // Default to main OTO AKSESUAR if no match
    if (!assignedCategoryId) {
      assignedCategoryId = otoAksesuarId
    }

    batchUpdates.push({
      id: product.id,
      category_ids: [assignedCategoryId]
    })
  }

  console.log(`Updating ${batchUpdates.length} products with their new categories...`)
  
  const { updateProductsWorkflow } = require("@medusajs/medusa/core-flows")
  
  let successCount = 0
  
  // Update in chunks to avoid overloading
  const chunkSize = 50
  for (let i = 0; i < batchUpdates.length; i += chunkSize) {
    const chunk = batchUpdates.slice(i, i + chunkSize)
    try {
      await updateProductsWorkflow(container).run({
        input: {
          products: chunk
        }
      })
      successCount += chunk.length
    } catch(err) {
      console.log("Error updating chunk:", err.message)
    }
  }

  console.log(`Successfully categorized ${successCount} products.`)
}
