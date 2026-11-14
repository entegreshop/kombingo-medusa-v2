import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cart_id = req.query.cart_id as string
    if (!cart_id) {
      return res.status(400).json({ order_id: null })
    }

    const query = req.scope.resolve("query")
    // In V2, cart is linked to order? No, order is linked to cart via order.cart_id? 
    // Let's just run a raw SQL query using knex to be 100% sure we find the order!
    // Or we can try Graph first.
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "metadata"],
      filters: { 
      }
    })
    
    // Actually wait! Medusa API has SDK!
    return res.json({ order_id: null })

  } catch(e) {
    return res.status(500).json({ order_id: null })
  }
}
