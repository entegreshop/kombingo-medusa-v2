"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { addToCart } from "@lib/data/cart"

type Props = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

import { getProductPrice } from "@lib/util/get-product-price"

  export default function CartUpsellCarousel({ products, region }: Props) {
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({})
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  if (!products || products.length === 0) return null

  const handleAddToCart = async (product: HttpTypes.StoreProduct) => {
    const variantIdToLoad = selectedVariants[product.id] || product.variants?.[0]?.id
    const variant = product.variants?.find((v) => v.id === variantIdToLoad)
    if (!variant || addingToCart[product.id]) return

    setAddingToCart(prev => ({ ...prev, [product.id]: true }))
    try {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode: region.countries?.[0]?.iso_2 || "tr"
      })
    } catch (e) {
      console.error("Error adding upsell to cart", e)
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }
  }

  return (
    <div className="mb-6 w-full overflow-hidden">
      <div className="flex items-center justify-center gap-x-2 mb-2 px-1 w-full">
         <h2 className="text-[15px] font-bold text-gray-800 uppercase tracking-wide text-center">Sepete Özel İndirim</h2>
      </div>
      <div className="w-full overflow-x-auto custom-scrollbar pb-3 pt-4">
        <div className="flex gap-x-4 w-max px-1">
          {products.map(p => {
             const { cheapestPrice } = getProductPrice({ product: p as any })
             const isDiscounted = cheapestPrice?.price_type === "sale" || (cheapestPrice?.percentage_diff && parseInt(cheapestPrice.percentage_diff) > 0)
             const discountRatio = cheapestPrice?.percentage_diff || 0
             
             const variantOptions = p.variants || []
             const currentVariantId = selectedVariants[p.id] || variantOptions[0]?.id

             return (
               <div key={p.id} className="relative w-[160px] flex-shrink-0 flex flex-col border border-orange-200 rounded-lg p-2.5 bg-white shadow-sm group hover:border-orange-300 transition-colors">
                 
                 {/* Avantajlı Badge */}
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-600 border border-orange-300 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-x-1 z-10 shadow-sm whitespace-nowrap">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M11.603 1.053a1.5 1.5 0 0 1 1.636-.2L18.42 3.42l2.568-5.181A1.5 1.5 0 0 1 23 9.42l-2 10A1.5 1.5 0 0 1 19.53 20.5H5.47a1.5 1.5 0 0 1-1.47-1.08l-2-10a1.5 1.5 0 0 1 2.01-1.181l2.567-5.18L11.603 1.053zM12 4.095L7.962 5.96a1.5 1.5 0 0 1-1.921-.767L4.542 2.22 6.07 9.854l12.86-.001 1.528-7.636-1.499 2.973a1.5 1.5 0 0 1-1.921.767L12 4.095z" opacity="0"/></svg>
                    🔥 Avantajlı
                 </div>

                 {/* Thumbnail */}
                 <div className="w-full h-[120px] bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-3 border border-gray-100 relative mt-2">
                   {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover mix-blend-multiply" />
                   ) : (
                      <div className="bg-gray-200 w-full h-full"></div>
                   )}
                 </div>

                 {/* Product Info */}
                 <div className="flex flex-col flex-1">
                    <h3 className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-2 h-8 mb-2">{p.title}</h3>
                    
                    <div className="flex items-center gap-x-2 mt-auto mb-3 h-[36px]">
                       {isDiscounted ? (
                           <div className="bg-[#e40000] text-white font-bold text-[13px] w-9 h-6 flex items-center justify-center rounded-sm flex-shrink-0">
                              %{discountRatio}
                           </div>
                       ) : null}
                       <div className="flex flex-col justify-center">
                           {isDiscounted && <span className="text-[11px] text-gray-500 line-through leading-none font-medium mb-1">{cheapestPrice?.original_price}</span>}
                           <span className="text-[17px] font-extrabold text-black leading-none tracking-tight">{cheapestPrice?.calculated_price}</span>
                       </div>
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
                       onClick={() => handleAddToCart(p)}
                       disabled={addingToCart[p.id]}
                       className="w-full py-2 bg-white border border-gray-300 text-gray-800 font-bold text-[11px] rounded transition-all hover:border-black hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                    >
                       {addingToCart[p.id] ? "Ekleniyor.." : "Sepete Ekle"}
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
