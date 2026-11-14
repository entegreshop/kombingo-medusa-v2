import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "metadata"],
    })

    if (!stores || stores.length === 0) {
      return res.status(404).json({ message: "Store not found" })
    }

    const store = stores[0]
    const hediyeSettings = store.metadata?.hediye_urunler_settings || null

    res.json({
      hediye_urunler_settings: hediyeSettings
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
