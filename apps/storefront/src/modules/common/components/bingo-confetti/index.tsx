"use client"

import { useEffect, useState, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import confetti from "canvas-confetti"

type BingoConfettiProps = {
  cart: HttpTypes.StoreCart | null
  settings?: any
}

const BingoConfetti = ({ cart, settings }: BingoConfettiProps) => {
  const [showBingo, setShowBingo] = useState(false)
  const [discountRate, setDiscountRate] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const previousQuantityRef = useRef(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!cart?.items) return

    const currentTotalQuantity = cart.items.reduce(
      (sum, item) => sum + (item.quantity || 1), 
      0
    )

    const prevQuantity = previousQuantityRef.current

    // Sadece ürün sayısı arttığında ve toplam adet >= 2 olduğunda çalıştır
    if (prevQuantity > 0 && currentTotalQuantity > prevQuantity && currentTotalQuantity >= 2) {
      // İndirim oranını hesapla
      let rate = 0;
      if (settings?.tiers) {
        const itemIndex = currentTotalQuantity - 1; // 2. ürün index 1'dir
        const tier = settings.tiers.find((t: any) => t.index === itemIndex);
        if (tier) {
          rate = tier.percent;
        } else {
          rate = settings.winner_mode_percent || 30;
        }
      } else {
        // Fallback default rates
        const defaultTiers = [0, 10, 15, 20, 25];
        rate = currentTotalQuantity - 1 < defaultTiers.length 
          ? defaultTiers[currentTotalQuantity - 1] 
          : 30;
      }
      
      if (rate > 0) {
        setDiscountRate(rate);
        setShowBingo(true)
        
        // Konfeti patlat
        const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff']
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff']
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        } else {
          setShowBingo(false)
        }
      }
      
      frame()
      }
    }

    // Güncel adedi kaydet
    previousQuantityRef.current = currentTotalQuantity
  }, [cart])

  if (!isMounted || !showBingo) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center gap-y-6 bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div className="animate-bounce flex flex-col items-center">
        <h1 
          className="text-7xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 uppercase tracking-tighter"
          style={{
            WebkitTextStroke: "2px white",
            textShadow: "0px 10px 30px rgba(255, 0, 0, 0.7)",
            transform: "rotate(-5deg)"
          }}
        >
          BİNGO!
        </h1>
        
        <div 
          className="mt-6 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border-4 border-red-500 text-center transform -rotate-2"
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.4)" }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 uppercase">
            TEBRİKLER <span className="text-red-600">%</span><span className="text-red-600 text-3xl sm:text-4xl md:text-5xl">{discountRate}</span> EKSTRA İNDİRİM KAZANDINIZ
          </p>
          <p className="text-sm sm:text-base md:text-lg font-bold text-gray-600 mt-2 uppercase tracking-wide">
            İNDİRİMLİ FİYATI SEPETİNİZDE GÖREBİLİRSİNİZ
          </p>
        </div>
      </div>
    </div>
  )
}

export default BingoConfetti
