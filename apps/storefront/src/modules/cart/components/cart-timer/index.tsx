"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"

type CartTimerProps = {
  cart: HttpTypes.StoreCart
  timerSettings: any
}

const CartTimer = ({ cart, timerSettings }: CartTimerProps) => {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  
  useEffect(() => {
    if (!timerSettings?.timer_enabled || !cart) return

    const cycleStart = cart.metadata?.discount_cycle_start 
      ? new Date(cart.metadata.discount_cycle_start as string).getTime() 
      : new Date(cart.created_at || 0).getTime()
      
    const timerMinutes = timerSettings.timer_minutes || 15
    const endTime = cycleStart + timerMinutes * 60000

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = endTime - now
      
      if (remaining <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
        // Refresh to strip discounts from backend
        router.refresh()
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [cart, timerSettings, router])

  if (!timerSettings?.timer_enabled || timeLeft === null || timeLeft <= 0) {
    return null
  }

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-600 to-orange-500 text-white p-3 z-50 shadow-2xl flex items-center justify-center gap-x-4 animate-slide-up">
      <div className="flex items-center gap-x-2">
        <span className="text-xl animate-pulse">⏰</span>
        <p className="font-medium text-sm sm:text-base">
          Fırsatı Kaçırma! Sepetindeki indirimlerin bitmesine:
        </p>
      </div>
      <div className="bg-white/20 px-3 py-1 rounded-md font-mono font-bold text-lg backdrop-blur-sm">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </div>
    </div>
  )
}

export default CartTimer
