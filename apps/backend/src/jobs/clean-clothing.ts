import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

let hasRun = false;

export default async function cleanClothingJob({
  container,
}: {
  container: MedusaContainer
}) {
  if (hasRun) return;
  
  console.log("Running clean-clothing job...");
  
  try {
    const productModule = container.resolve(Modules.PRODUCT);
    const inventoryModule = container.resolve(Modules.INVENTORY);
    
    // 1. Delete all reservations
    console.log("Fetching reservations...");
    const [reservations, count] = await inventoryModule.listReservations({}, { take: 10000 });
    if (reservations.length > 0) {
      await inventoryModule.deleteReservations(reservations.map((r: any) => r.id));
      console.log(`Deleted ${reservations.length} reservations`);
    } else {
      console.log("No reservations found.");
    }
    
    // 2. Find and delete clothing products
    console.log("Fetching products...");
    const [products, pCount] = await productModule.listProducts({}, { take: 10000 });
    
    const clothingKeywords = [
      "tayt", "pantolon", "kaban", "kürk", "ceket", "elbise", "likra", "oysho", 
      "bomber", "eşofman", "tulum", "şalvar", "jean", "yüksel bel", "yüksek bel",
      "toparlayıcı", "sıkılaştırıcı", "etek", "triko", "kazak", "hırka", "gömlek"
    ];
    
    let deletedCount = 0;
    
    for (const p of products) {
       const titleLower = p.title.toLowerCase();
       const isClothing = clothingKeywords.some(kw => titleLower.includes(kw));
       
       if (isClothing) {
           console.log(`Deleting clothing product: ${p.title}`);
           // Delete variants first to be safe
           const [variants] = await productModule.listProductVariants({ product_id: p.id }, { take: 100 });
           if (variants.length > 0) {
              await productModule.deleteProductVariants(variants.map((v: any) => v.id));
           }
           await productModule.deleteProducts([p.id]);
           deletedCount++;
       }
    }
    
    console.log(`Job finished. Deleted ${deletedCount} clothing products.`);
    hasRun = true; // Mark as run so it doesn't repeat
  } catch(e) {
    console.error("Cleanup error", e);
  }
}

export const config = {
  name: "clean-clothing",
  schedule: "* * * * *", // Every minute
}
