"use client"
import { useEffect } from "react"
import { clearQuickCheckoutCart } from "@lib/data/cart"

export default function ClearCartOnCompleted() {
    useEffect(() => {
        clearQuickCheckoutCart()
    }, [])
    return null
}
