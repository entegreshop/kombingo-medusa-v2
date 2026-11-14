import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

async function fixVariantsInventory(req: MedusaRequest, targetVariantId?: string) {
  const productModuleService = req.scope.resolve(Modules.PRODUCT) as any
  let updatedCount = 0

  if (targetVariantId) {
    try {
      await productModuleService.updateProductVariants(targetVariantId, {
        manage_inventory: false,
        allow_backorder: true,
      })
      updatedCount++
    } catch (e) {
      // Fallback array signature
      try {
        await productModuleService.updateProductVariants([
          {
            id: targetVariantId,
            manage_inventory: false,
            allow_backorder: true,
          },
        ])
        updatedCount++
      } catch (err) {
        console.error("Failed to update single variant inventory:", err)
      }
    }
  }

  try {
    const variants = await productModuleService.listProductVariants(
      { manage_inventory: true },
      { take: 5000, select: ["id", "manage_inventory", "allow_backorder"] }
    )

    for (const v of variants || []) {
      try {
        await productModuleService.updateProductVariants(v.id, {
          manage_inventory: false,
          allow_backorder: true,
        })
        updatedCount++
      } catch {
        try {
          await productModuleService.updateProductVariants([
            {
              id: v.id,
              manage_inventory: false,
              allow_backorder: true,
            },
          ])
          updatedCount++
        } catch {}
      }
    }
  } catch (err) {
    console.error("Error listing variants for inventory fix:", err)
  }

  return updatedCount
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const variantId = req.query?.variant_id as string | undefined
    const updatedCount = await fixVariantsInventory(req, variantId)
    res.json({ success: true, updatedCount })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as { variant_id?: string }
    const updatedCount = await fixVariantsInventory(req, body.variant_id)
    res.json({ success: true, updatedCount })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
