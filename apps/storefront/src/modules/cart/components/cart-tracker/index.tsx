"use client"

import { useEffect } from "react"
import { trackViewCart } from "@lib/util/tracking"

export default function CartTracker({ cart }: { cart: any }) {
  useEffect(() => {
    if (cart) {
      trackViewCart({
        id: cart.id,
        total: (cart.total ?? 0) / 100, // convert from cents
        currency: (cart.currency_code || "TRY").toUpperCase(),
        items: cart.items || []
      })
    }
  }, [cart?.id])

  return null
}
