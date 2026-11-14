import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]
  
  if (!store) {
    return res.status(404).json({ error: "Store not found" })
  }

  let payload: Record<string, any> = req.body as Record<string, any>;
  
  if (typeof payload !== 'object' || payload === null) {
      payload = {};
  }
  
  const newMetadata = {
    ...(store.metadata || {}),
    ...payload
  }

  try {
     await updateStoresWorkflow(req.scope).run({
        input: {
           selector: { id: store.id },
           update: { metadata: newMetadata }
        }
     });
  } catch (err: any) {
     return res.status(500).json({ message: "Store update failed: " + (err.message || String(err)), details: err.message || String(err) });
  }

  res.json({ success: true, metadata: newMetadata, payload_received: payload })
}
