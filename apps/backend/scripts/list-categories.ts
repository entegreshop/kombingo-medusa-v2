import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IProductModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/framework/utils"

export default async function ({ container }: { container: any }) {
  const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)
  const categories = await productModuleService.listProductCategories({}, {
    relations: ["parent_category"]
  })
  
  const formatted = categories.map(c => ({
    id: c.id,
    name: c.name,
    parent: c.parent_category?.name || null
  }))

  console.log(JSON.stringify(formatted, null, 2))
}
