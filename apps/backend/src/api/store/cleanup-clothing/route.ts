import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const productModule = req.scope.resolve(Modules.PRODUCT);
        const inventoryModule = req.scope.resolve(Modules.INVENTORY);
        
        let msg = [];
        
        // 1. Delete all reservations
        const reservations = await inventoryModule.listReservationItems({}, { take: 10000 });
        if (reservations && reservations.length > 0) {
          await inventoryModule.deleteReservationItems(reservations.map((r: any) => r.id));
          msg.push(`Deleted ${reservations.length} reservations`);
        } else {
          msg.push("No reservations found");
        }
        
        // 2. Find and delete clothing products
        const products = await productModule.listProducts({}, { take: 10000 });
        const clothingKeywords = [
          "tayt", "pantolon", "kaban", "kürk", "ceket", "elbise", "likra", "oysho", 
          "bomber", "eşofman", "tulum", "şalvar", "jean", "yüksel bel", "yüksek bel",
          "toparlayıcı", "sıkılaştırıcı", "etek", "triko", "kazak", "hırka", "gömlek",
          "mercedes içi astarlı", "porsche içi astarlı"
        ];
        
        let deletedCount = 0;
        if (products && products.length > 0) {
          for (const p of products) {
             const titleLower = p.title.toLowerCase();
             const isClothing = clothingKeywords.some(kw => titleLower.includes(kw));
             
             if (isClothing) {
                 const variants = await productModule.listProductVariants({ product_id: p.id }, { take: 100 });
                 if (variants && variants.length > 0) {
                    await productModule.deleteProductVariants(variants.map((v: any) => v.id));
                 }
                 await productModule.deleteProducts([p.id]);
                 deletedCount++;
             }
          }
        }
        
        msg.push(`Deleted ${deletedCount} clothing products`);
        
        res.json({ success: true, message: msg.join(" | ") });
    } catch(e: any) {
        res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
}
