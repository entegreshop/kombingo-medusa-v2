"use client"

import { useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import SpecialOfferItem from "./special-offer-item"

type SpecialOffersSliderProps = {
  availableProducts: HttpTypes.StoreProduct[]
  specialOffers: any[]
  region: HttpTypes.StoreRegion
}

export default function SpecialOffersSlider({ availableProducts, specialOffers, region }: SpecialOffersSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="mt-4 mb-8 border border-[#f5dcd2] rounded-md p-4 bg-white relative w-full min-w-0 group">
      <div className="absolute -top-3 left-4 bg-white px-2">
        <span className="text-sm font-semibold text-[#f27a1a] flex items-center gap-x-1">
          🎉 Sepetine Özel İndirimler!
        </span>
      </div>
      <p className="text-[11px] text-gray-500 mt-2 mb-4">Satıcının ilgini çekebilecek diğer ürünlerini burada görebilirsin.</p>
      
      {/* Left Arrow */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-sm rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#f27a1a] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      {/* Right Arrow */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-sm rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#f27a1a] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-x-4 pt-3 pb-2 snap-x snap-mandatory scrollbar-hide" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {availableProducts.map((product) => {
          const offerMeta = specialOffers.find((o: any) => o.id === product.id)?.metadata?.coupon_badge
          if (!offerMeta) return null
          
          return (
            <SpecialOfferItem 
              key={product.id} 
              product={product} 
              offerMeta={offerMeta} 
              region={region}
            />
          )
        })}
      </div>
    </div>
  )
}
