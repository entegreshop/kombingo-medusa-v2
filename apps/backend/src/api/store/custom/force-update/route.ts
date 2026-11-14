import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]
  
  if (!store) {
    return res.status(404).json({ error: "Store not found" })
  }

  // Forcefully update the metadata with a test value
  const newMetadata = {
    ...(store.metadata || {}),
    "footer-telif": "Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.\n© 2026 BENİM FİRMAM Tüm Hakları Saklıdır. (ZORUNLU GÜNCELLEME)"
  }

  try {
     await storeModule.updateStores(store.id, { metadata: newMetadata } as any);
     res.json({ success: true, metadata: newMetadata })
  } catch(e) {
     res.json({ error: e.message })
  }
}
