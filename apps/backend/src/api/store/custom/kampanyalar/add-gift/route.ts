import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/core-flows"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cart_id, variant_id } = req.body as { cart_id: string, variant_id: string }

  if (!cart_id || !variant_id) {
    return res.status(400).json({ message: "cart_id and variant_id are required" })
  }

  try {
    const { result } = await addToCartWorkflow(req.scope).run({
      input: {
        cart_id,
        items: [
          {
            variant_id,
            quantity: 1,
            unit_price: 0,
            metadata: { is_gift: true }
          }
        ]
      }
    })

    res.json({ success: true, cart: result })
  } catch (error: any) {
    console.error("Error adding gift to cart:", error)
    res.status(500).json({ message: error.message })
  }
}
