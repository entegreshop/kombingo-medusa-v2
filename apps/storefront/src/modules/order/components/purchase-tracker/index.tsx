"use client"

import { useEffect, useRef } from "react"
import { trackPurchase } from "@lib/util/tracking"

export default function PurchaseTracker({ order }: { order: any }) {
  const lastTrackedOrderIdRef = useRef<string>("")

  useEffect(() => {
    if (order && lastTrackedOrderIdRef.current !== order.id) {
      lastTrackedOrderIdRef.current = order.id
      const finalTotal = order.metadata?.adjusted_total !== undefined 
        ? Number(order.metadata.adjusted_total) / 100 
        : (order.total ?? 0) / 100;

      trackPurchase({
        id: order.id,
        total: finalTotal,
        currency: (order.currency_code || "TRY").toUpperCase(),
        items: order.items || []
      })
    }
  }, [order?.id])

  return null
}
