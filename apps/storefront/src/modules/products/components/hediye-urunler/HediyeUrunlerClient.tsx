"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import confetti from "canvas-confetti"
import { getProductPrice } from "@lib/util/get-product-price"

type Props = {
  product: HttpTypes.StoreProduct
  settings: any
  region: HttpTypes.StoreRegion
  giftProducts: HttpTypes.StoreProduct[]
}

export default function HediyeUrunlerClient({ product, settings, region, giftProducts }: Props) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  
  const countryCode = useParams().countryCode as string

  const hasCategoryMatch = settings.categoryIds && settings.categoryIds.length > 0 && !settings.categoryIds.includes("all")
    ? product.categories?.some(c => settings.categoryIds.includes(c.id))
    : true

  if (!hasCategoryMatch) return null

  let cheapestProductPrice = 0
  if (product.variants) {
    const prices = product.variants.map(v => v.calculated_price?.calculated_amount || 0)
    cheapestProductPrice = Math.min(...prices)
  }
  
  const threshold = parseFloat(settings.minPrice) || 0
  
  if (cheapestProductPrice < threshold) return null

  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null)

  const handleSelectGift = (giftProduct: HttpTypes.StoreProduct) => {
    const variantId = selectedVariants[giftProduct.id] || giftProduct.variants?.[0]?.id

    if (!variantId) return

    if (selectedGiftId === giftProduct.id) {
      // Toggle off
      setSelectedGiftId(null)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("giftSelected", { detail: { variantId: null } }))
      }
    } else {
      // Select
      setSelectedGiftId(giftProduct.id)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("giftSelected", { detail: { variantId } }))
      }
    }
  }

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 180
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="mt-8 mb-6 border border-[#f5dcd2] rounded-md p-4 bg-white relative w-full group">
      <div className="absolute -top-3 left-4 bg-white px-2">
        <span className="text-[15px] font-bold text-[#e45b0a] flex items-center gap-x-1">
          🎁 Sana Özel Hediyeler!
        </span>
      </div>
      <p className="text-[12px] text-gray-500 mt-2 mb-4">Bu ürünü sepete eklediğinde aşağıdaki hediyelerden birini seçebilirsin.</p>
      
      {showSuccess && (
         <div className="bg-green-100 border border-green-300 text-green-800 p-2 rounded-md mb-4 text-xs font-medium animate-pulse text-center">
            Tebrikler hediye kazandınız! Sepetinize eklendi.
         </div>
      )}

      {/* Navigation Buttons */}
      {giftProducts.length > 2 && (
        <>
          <button 
            onClick={() => scroll("left")} 
            className="absolute left-[-15px] top-[60%] -translate-y-1/2 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-20 text-gray-600 hover:text-black hover:border-gray-400 transition-all focus:outline-none hidden md:flex"
            aria-label="Sola kaydır"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={() => scroll("right")} 
            className="absolute right-[-15px] top-[60%] -translate-y-1/2 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-20 text-gray-600 hover:text-black hover:border-gray-400 transition-all focus:outline-none hidden md:flex"
            aria-label="Sağa kaydır"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}

      <div className="w-full relative px-1">
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-4 pt-3 flex gap-x-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {giftProducts.map((p) => {
            const { cheapestPrice } = getProductPrice({ product: p as any })
            const variantOptions = p.variants || []
            const currentVariantId = selectedVariants[p.id] || variantOptions[0]?.id

            return (
              <div key={p.id} className="relative w-[160px] flex-shrink-0 flex flex-col border border-orange-200 rounded-lg p-2.5 bg-white shadow-sm hover:border-orange-300 transition-colors snap-start">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-600 border border-orange-300 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-x-1 z-10 shadow-sm whitespace-nowrap">
                    🎁 Hediye
                 </div>

                 <div className="w-full h-[120px] bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-3 border border-gray-100 relative mt-2">
                   {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover mix-blend-multiply" />
                   ) : (
                      <div className="bg-gray-200 w-full h-full"></div>
                   )}
                 </div>

                 <div className="flex flex-col flex-1">
                    <h3 className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-2 h-8 mb-2">{p.title}</h3>
                    
                    <div className="flex flex-col justify-center mb-3 h-[36px]">
                        {cheapestPrice?.calculated_price && (
                          <span className="text-[11px] text-gray-500 line-through leading-none font-medium mb-1">
                            {cheapestPrice.calculated_price}
                          </span>
                        )}
                        <span className="text-[16px] font-extrabold text-orange-600 leading-none tracking-tight">0 TL</span>
                    </div>

                    {variantOptions.length > 1 && (
                        <div className="mb-2">
                           <select 
                              className="w-full text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors cursor-pointer"
                              value={currentVariantId}
                              onChange={(e) => setSelectedVariants(prev => ({ ...prev, [p.id]: e.target.value }))}
                           >
                              {variantOptions.map((v: any) => (
                                 <option key={v.id} value={v.id}>{v.title}</option>
                              ))}
                           </select>
                        </div>
                    )}

                    <button 
                       onClick={() => handleSelectGift(p)}
                       className={`w-full py-2 mt-auto border font-bold text-[11px] rounded transition-all flex items-center justify-center uppercase tracking-wide ${
                         selectedGiftId === p.id 
                           ? "bg-[#e45b0a] text-white border-[#e45b0a]" 
                           : "bg-white text-[#e45b0a] border-[#e45b0a] hover:bg-orange-50"
                       }`}
                    >
                       {selectedGiftId === p.id ? "SEÇİLDİ" : "HEDİYENİ SEÇ"}
                    </button>
                 </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
