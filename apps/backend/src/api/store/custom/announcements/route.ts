import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = (req.scope as any).resolve("query")
  
  // Sadece is_active: true olan duyuruları çekiyoruz
  const { data: announcements } = await query.graph({
    entity: "announcement",
    fields: ["id", "text", "sort_order", "location", "bg_color", "text_color"],
    filters: {
      is_active: true
    },
    pagination: {
      order: {
        sort_order: "ASC"
      }
    }
  })

  res.json({ announcements })
}
