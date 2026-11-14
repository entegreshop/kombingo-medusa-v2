import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncCartShippingMethods } from "../../../../admin/shipping-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cartId = req.query.cart_id as string
    const completeIfNeeded = req.query.complete_if_needed === "1"

    if (!cartId) {
      return res.status(400).json({ success: false, error: "cart_id parametresi gerekli" })
    }

    const query = req.scope.resolve("query")

    const findOrderId = async (): Promise<string | null> => {
      try {
        const { data: carts } = await query.graph({
          entity: "cart",
          fields: ["id", "completed_at", "order.*"],
          filters: { id: cartId }
        })
        const cart = carts[0] as any
        if (cart && cart.order?.id) {
          return cart.order.id
        }
      } catch (e) {
        console.log("Graph query failed for cart.order", e)
      }

      try {
        const { data: ordersByCart } = await query.graph({
          entity: "order",
          fields: ["id", "cart_id"],
          filters: { cart_id: cartId } as any
        })
        if (ordersByCart && ordersByCart.length > 0) {
          return ordersByCart[0].id
        }
      } catch (e) {}

      return null
    }

    let orderId = await findOrderId()
    if (orderId) {
      return res.json({ success: true, order_id: orderId })
    }

    if (completeIfNeeded) {
      try {
        await syncCartShippingMethods(req.scope, cartId)
        const { completeCartWorkflow } = await import("@medusajs/core-flows")
        const { result } = await completeCartWorkflow(req.scope).run({
          input: { id: cartId }
        })
        if (result && (result as any).id) {
          return res.json({ success: true, order_id: (result as any).id })
        }
      } catch (err: any) {
        console.warn("get-order completeCartWorkflow fallback note:", err?.message)
      }

      orderId = await findOrderId()
      if (orderId) {
        return res.json({ success: true, order_id: orderId })
      }
    }

    return res.json({ success: false, error: "Sipariş henüz bulunamadı" })
  } catch (error: any) {
    console.error("Get Order by Cart ID Error:", error)
    return res.status(400).json({ success: false, error: error.message })
  }
}
