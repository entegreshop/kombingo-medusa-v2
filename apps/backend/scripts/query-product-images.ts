import { Modules } from "@medusajs/framework/utils"

export default async function ({ container }: { container: any }) {
  const query = container.resolve("query")
  
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "images.*"],
  })

  // Log first product with dsmcdn images
  const pWithImages = products.find(p => p.images && p.images.length > 1 && p.images[0].url.includes("dsmcdn"))
  
  if (pWithImages) {
    console.log("Found product with images:", JSON.stringify(pWithImages, null, 2))
  } else {
    console.log("No products found with multiple Trendyol images!")
  }
}
