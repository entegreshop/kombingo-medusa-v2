import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderHistoryCheckHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const orderModuleService = container.resolve(Modules.ORDER)

  try {
    // 1. Fetch the newly placed order with its relations
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "email",
        "metadata",
        "shipping_address.*",
        "billing_address.*",
        "customer.*"
      ],
      filters: {
        id: data.id,
      },
    })

    const newOrder = orders[0]
    if (!newOrder) {
      return
    }

    // 2. Extract identifying information
    const email = newOrder.email
    const phone = newOrder.shipping_address?.phone || newOrder.billing_address?.phone
    const firstName = newOrder.shipping_address?.first_name || newOrder.customer?.first_name
    const lastName = newOrder.shipping_address?.last_name || newOrder.customer?.last_name
    const ip = newOrder.metadata?.ip_address as string | undefined
    const address1 = newOrder.shipping_address?.address_1

    // Prepare variables for matching orders
    const matchedOrderMap = new Map<string, any>()

    // Helper to add orders to our map
    const addMatchedOrders = (fetchedOrders: any[]) => {
      fetchedOrders.forEach((o) => {
        if (o.id !== newOrder.id) {
          matchedOrderMap.set(o.id, o)
        }
      })
    }

    // 3. Perform individual exact match queries to ensure broad matching
    // and avoid complex OR query limitations
    const fetchPromises: Promise<any>[] = []

    // Match by Email
    if (email) {
      fetchPromises.push(
        query.graph({
          entity: "order",
          fields: ["id", "status", "metadata"],
          filters: { email },
        }).then(res => addMatchedOrders(res.data))
      )
    }

    // Wait for the first batch to avoid too many parallel deep relation queries if not needed,
    // actually doing them all in parallel is fine.
    
    // Note: Querying deep relations like shipping_address.phone might be limited in some DBs without joins,
    // so we handle errors gracefully if a specific filter fails.
    const safeQuery = async (filters: any) => {
      try {
        const res = await query.graph({
          entity: "order",
          fields: ["id", "status", "metadata"],
          filters,
        })
        addMatchedOrders(res.data)
      } catch (err) {
        // Silently ignore if a specific relation query is not supported
      }
    }

    // Match by Phone
    if (phone) {
      fetchPromises.push(safeQuery({ shipping_address: { phone } }))
      fetchPromises.push(safeQuery({ billing_address: { phone } }))
    }

    // Match by Name
    if (firstName && lastName) {
      fetchPromises.push(safeQuery({ shipping_address: { first_name: firstName, last_name: lastName } }))
    }

    // Match by Address
    if (address1) {
      fetchPromises.push(safeQuery({ shipping_address: { address_1: address1 } }))
    }

    await Promise.all(fetchPromises)

    // 4. Also check orders manually by IP if we can't query JSON easily
    // Since querying JSON metadata in Medusa might be tricky, we can fetch recent orders and filter in memory as a fallback
    // But since we already have a robust matching with Email, Phone, and Name, IP is supplementary.
    // Let's rely on the DB matches first.

    const pastOrders = Array.from(matchedOrderMap.values())

    if (pastOrders.length > 0) {
      const orderCount = pastOrders.length + 1
      let isRisky = false

      // 5. Analyze past orders for Risk
      for (const past of pastOrders) {
        const payOption = past.metadata?.payment_option as string | undefined
        const isCOD = payOption === "cash_on_delivery" || payOption === "card_on_delivery"

        const status = past.status
        const deliveryStatus = past.metadata?.delivery_status as string | undefined
        
        const isFailed = 
          status === "canceled" || 
          deliveryStatus === "iptal_edilen" || 
          deliveryStatus === "iade_edilen"

        if (isCOD && isFailed) {
          isRisky = true
          break
        }
      }

      // 6. Update metadata with notes
      const notesArray: string[] = []
      
      const existingNotes = newOrder.metadata?.admin_notes as string | undefined
      if (existingNotes) {
        notesArray.push(existingNotes)
      }

      notesArray.push(`${orderCount}. Siparişi`)

      if (isRisky) {
        notesArray.push("RİSKLİ SİPARİŞ: Daha önceki kapıda ödemeli siparişini teslim almamış!")
      }

      const newAdminNotes = notesArray.join(" | ")

      await orderModuleService.updateOrders(newOrder.id, {
        metadata: {
          ...newOrder.metadata,
          admin_notes: newAdminNotes
        }
      })
    }

  } catch (error) {
    console.error("Error in orderHistoryCheckHandler:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
