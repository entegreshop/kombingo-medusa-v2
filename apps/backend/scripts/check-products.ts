import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function checkProducts({ container }: { container: MedusaContainer }) {
  const productModule = container.resolve(Modules.PRODUCT)
  
  const [products, count] = await productModule.listAndCountProducts(
    {}, 
    { take: 5, order: { created_at: "DESC" } }
  )
  
  console.log(`Total products in DB: ${count}`)
  console.log("Last 5 products:")
  products.forEach(p => console.log(`- [${p.id}] ${p.title} (Status: ${p.status})`))
}
