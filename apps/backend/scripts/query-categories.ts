import { Modules } from "@medusajs/framework/utils"

export default async function ({ container }: { container: any }) {
  const query = container.resolve("query")
  
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "parent_category_id"],
  })

  console.log(JSON.stringify(categories, null, 2))
}
