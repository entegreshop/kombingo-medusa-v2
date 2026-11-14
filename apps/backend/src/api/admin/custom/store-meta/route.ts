import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"

// No manual config needed, Medusa parses JSON bodies by default

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]
  
  res.json({ metadata: store?.metadata || {} })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  
  // Mağazayı bul
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]
  
  if (!store) {
    return res.status(404).json({ error: "Store not found" })
  }

  let payload: Record<string, any> = req.body as Record<string, any>;
  console.log("RECEIVED PAYLOAD:", payload);
  
  if (typeof payload !== 'object' || payload === null) {
      payload = {};
  }
  
  // Mevcut meta datayı koruyarak yeni verileri üstüne yaz
  const newMetadata = {
    ...(store.metadata || {}),
    ...payload
  }

  // Mağazayı güncelle
  try {
     const { updateStoresWorkflow } = require("@medusajs/medusa/core-flows");
     await updateStoresWorkflow(req.scope).run({
        input: {
           selector: { id: store.id },
           update: { metadata: newMetadata }
        }
     });
  } catch (err: any) {
     console.error("Store update workflow failed:", err);
     
     // Fallback to store module update
     try {
       await storeModule.updateStores(store.id, { metadata: newMetadata });
     } catch(fallbackErr: any) {
       console.error("Fallback update failed:", fallbackErr);
       return res.status(500).json({ 
          message: "Store update failed completely", 
          error1: err.message || String(err),
          error2: fallbackErr.message || String(fallbackErr)
       });
     }
  }

  res.json({ success: true, metadata: newMetadata, payload_received: payload })
}
