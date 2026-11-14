import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { campaign_type, data } = req.body as any
    const promotionsData: any[] = []

    if (campaign_type === "yuzde") {
      promotionsData.push({
        code: data.code,
        type: "standard",
        is_automatic: false,
        application_method: {
          type: data.type === "percent" ? "percentage" : "fixed",
          target_type: "order",
          value: Number(data.amount),
          ...(data.type !== "percent" ? { currency_code: "try" } : {})
        },
        rules: data.minCart ? [
          {
            attribute: "cart.item_total",
            operator: "gte",
            values: [data.minCart]
          }
        ] : []
      })
    } else if (campaign_type === "sepette") {
      promotionsData.push({
        code: `SEPETTE_${Date.now()}`,
        type: "standard",
        is_automatic: data.active !== false,
        application_method: {
          type: data.type === "percent" ? "percentage" : "fixed",
          target_type: "order",
          value: Number(data.amount),
          ...(data.type !== "percent" ? { currency_code: "try" } : {})
        },
        rules: data.minCart ? [
          {
            attribute: "cart.item_total",
            operator: "gte",
            values: [data.minCart]
          }
        ] : []
      })
    } else if (campaign_type === "bogo") {
      promotionsData.push({
        code: data.code,
        type: "standard",
        is_automatic: data.active !== false,
        application_method: {
          type: "buyget",
          target_type: "items",
          buy_rules_min_quantity: Number(data.buyQty),
          apply_to_quantity: Number(data.getQty),
          value: 100 // 100% indirim
        }
      })
    } else if (campaign_type === "kargo") {
      promotionsData.push({
        code: data.code,
        type: "standard",
        is_automatic: data.active !== false,
        application_method: {
          type: "percentage",
          target_type: "shipping_methods",
          value: 100
        },
        rules: data.minCart ? [
          {
            attribute: "cart.item_total",
            operator: "gte",
            values: [data.minCart]
          }
        ] : []
      })
    }

    if (promotionsData.length > 0) {
      const { result } = await createPromotionsWorkflow(req.scope).run({
        input: { promotionsData }
      })
      return res.json({ success: true, promotions: result })
    }

    return res.status(400).json({ success: false, error: "Bilinmeyen kampanya tipi" })

  } catch (error: any) {
    console.error("Marketing API Error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
