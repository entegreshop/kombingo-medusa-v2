import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { createInterlineConsignment, InterlineConsignmentData } from "../utils/interline-cargo"

export default async function interlineCargoNotifierHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  const eventName = event.name
  if (eventName !== "order.updated") return

  const orderId = event.data.id
  const query = container.resolve("query")
  const orderModuleService = container.resolve(Modules.ORDER)

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "total",
        "metadata",
        "shipping_address.*",
        "customer.*"
      ],
      filters: { id: orderId },
    })

    const order = orders[0]
    if (!order) return

    const metadata = order.metadata || {}
    const deliveryStatus = metadata.delivery_status

    // Check if the order was just marked as shipped and if the selected carrier is interline
    if (deliveryStatus === "kargolanan" && metadata.selected_carrier === "interline" && !metadata.interline_barcode) {
      console.log(`[Interline Cargo] Order #${order.display_id} marked as kargolanan. Sending to Interline...`)

      const firstName = order.shipping_address?.first_name || order.customer?.first_name || "Müşteri"
      const lastName = order.shipping_address?.last_name || order.customer?.last_name || ""
      const fullName = `${firstName} ${lastName}`.trim()
      
      const province = order.shipping_address?.province || "İstanbul" // Defaulting or mapping may be required
      const city = order.shipping_address?.city || "Merkez"
      const address = order.shipping_address?.address_1 || ""
      const phone = order.shipping_address?.phone || order.customer?.phone || ""
      const weight = metadata.weight ? parseInt(metadata.weight as string) : 1

      const isCodCash = metadata.payment_option === "cash_on_delivery"
      const isCodCard = metadata.payment_option === "card_on_delivery"

      const consignmentData: InterlineConsignmentData = {
        customer: fullName,
        province_name: province,
        county_name: city,
        address: address,
        telephone: phone,
        quantity: 1, // Defaulting to 1 box
        consignment_type_id: 2, // 2: Paket
        amount_type_id: isCodCard ? 6 : 3, // 3: Peşin Ödeme (Sender pays) veya Nakit Tahsilat, 6: Kapıda Kredi Kartı Tahsilat
        distribution_type_id: 1, // 1: Ertesi Gün
        order_number: order.display_id ? order.display_id.toString() : order.id,
        weight: weight
      }

      // Sadece kapıda ödemeli siparişlerde tahsilat tutarını gönder
      if (isCodCash || isCodCard) {
        consignmentData.amount = ((order.total || 0) / 100).toFixed(2)
      }

      const res = await createInterlineConsignment(consignmentData)
      if (res.success && res.barcode) {
        console.log(`[Interline Cargo] Successfully created consignment for Order #${order.display_id}. Barcode: ${res.barcode}`)
        
        await orderModuleService.updateOrders(orderId, {
          metadata: {
            ...metadata,
            interline_barcode: res.barcode,
            interline_record_id: res.record_id,
            carrier_barcode: res.barcode // Sync with general carrier barcode for NetGSM
          }
        })
      } else {
        console.error(`[Interline Cargo] Failed to create consignment for Order #${order.display_id}. Error: ${res.error}`)
      }
    }
  } catch (error) {
    console.error(`[Interline Cargo] Error in subscriber handler:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["order.updated"],
}
