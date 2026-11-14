import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"
import { readConfig as readPaymentConfig } from "../../../../admin/payment-settings/route"
import { syncCartShippingMethods } from "../../../../admin/shipping-settings/route"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cartModule = req.scope.resolve<ICartModuleService>(Modules.CART)

    const body = req.body as { cart_id: string; method_id: string }

    if (!body.cart_id) {
      return res.status(400).json({ error: "cart_id is required" })
    }

    // 1. Get Payment settings from admin config (with fallback defaults)
    const paymentConfig = readPaymentConfig()
    const codSettings = {
      is_active: Boolean(paymentConfig.cash_on_delivery?.active),
      additional_fee: Number(paymentConfig.cash_on_delivery?.adjustment_value ?? 0),
      max_amount: Number(paymentConfig.cash_on_delivery?.max_total ?? 10000)
    }
    const codCcSettings = {
      is_active: Boolean(paymentConfig.card_on_delivery?.active),
      additional_fee: Number(paymentConfig.card_on_delivery?.adjustment_value ?? 0),
      max_amount: Number(paymentConfig.card_on_delivery?.max_total ?? 10000)
    }

    // 2. Fetch the cart
    const cart = await cartModule.retrieveCart(body.cart_id, {
      relations: ["items"]
    })

    const COD_ITEM_TITLE = "Kapıda Ödeme Ek Hizmet Bedeli"
    const COD_CC_ITEM_TITLE = "Kapıda Kredi Kartı Ek Hizmet Bedeli"

    // Remove any existing COD fee items first to avoid duplicates or wrong type
    const existingCodItems = cart.items?.filter((i: any) => i.title?.includes("Kapıda") || i.metadata?.is_cod_fee) || []
    if (existingCodItems.length > 0) {
      for (const item of existingCodItems) {
        await cartModule.deleteLineItems(item.id)
      }
    }

    // 3. Evaluate logic
    const isCodMethod = body.method_id === "cod" || body.method_id === "cash_on_delivery" || body.method_id === "cod_cash"
    const isCodCcMethod = body.method_id === "cod_cc" || body.method_id === "cash_on_delivery_cc" || body.method_id === "card_on_delivery"

    if ((isCodMethod && codSettings.is_active) || (isCodCcMethod && codCcSettings.is_active)) {
      const activeSettings = isCodCcMethod ? codCcSettings : codSettings
      const maxAmountKurus = (activeSettings.max_amount || Infinity) * 100

      // Calculate subtotal in kurus from items without the COD item
      const subtotalKurus = cart.items
        ?.filter((i: any) => !i.title?.includes("Kapıda") && !i.metadata?.is_cod_fee)
        .reduce((acc: number, item: any) => acc + (Number(item.unit_price || 0) * Number(item.quantity || 1)), 0) || 0

      if (subtotalKurus <= maxAmountKurus) {
        const feeKurus = Math.round((activeSettings.additional_fee || 0) * 100)
        if (feeKurus > 0) {
          await cartModule.addLineItems(cart.id, [
            {
              title: isCodCcMethod ? COD_CC_ITEM_TITLE : COD_ITEM_TITLE,
              quantity: 1,
              unit_price: feeKurus,
              metadata: { is_cod_fee: true }
            } as any
          ])
        }
      }
    }

    // 4. Sync cart shipping methods amount with effective shipping settings (0 if disabled or free threshold met)
    const effectiveShippingKurus = await syncCartShippingMethods(req.scope, body.cart_id)

    res.json({ success: true, effective_shipping_kurus: effectiveShippingKurus })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
