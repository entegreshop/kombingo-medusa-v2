import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const query = req.scope.resolve("query")
    
    // Fetch all products (or a reasonable limit) to filter by metadata
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "metadata"],
      pagination: {
        take: 1000,
        skip: 0
      }
    })
    
    // Filter products that have coupon_badge active
    const specialOffers = products.filter((p: any) => p.metadata?.coupon_badge?.active === true)
    
    res.json({ specialOffers })
  } catch (error: any) {
    console.error("Error fetching special offers:", error)
    res.status(500).json({ specialOffers: [], error: error.message })
  }
}
