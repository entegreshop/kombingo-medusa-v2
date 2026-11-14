import { MedusaContainer } from "@medusajs/framework/types"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

export default async function deleteImportedProducts({ container }: { container: MedusaContainer }) {
  const productModule = container.resolve(Modules.PRODUCT)
  
  console.log("Fetching all imported products...")
  let limit = 100;
  let offset = 0;
  let hasMore = true;
  let idsToDelete: string[] = [];

  while (hasMore) {
    const [products, count] = await productModule.listAndCountProducts(
      { q: "Trendyol" },
      { take: limit, skip: offset }
    )

    const imported = products.filter(p => p.description && p.description.includes("Trendyol'dan Otomatik İçe Aktarıldı"));
    idsToDelete.push(...imported.map(p => p.id));
    
    offset += limit;
    if (offset >= count) {
      hasMore = false;
    }
  }

  console.log(`Found ${idsToDelete.length} imported products to delete.`)

  if (idsToDelete.length > 0) {
    const BATCH_SIZE = 50;
    for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        const batch = idsToDelete.slice(i, i + BATCH_SIZE);
        try {
            await deleteProductsWorkflow(container).run({
                input: { ids: batch }
            })
            console.log(`Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}`)
        } catch (e: any) {
            console.error(`Error deleting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, e.message || e)
        }
    }
    console.log("All imported products deleted.")
  } else {
    console.log("No imported products found to delete.")
  }
}
