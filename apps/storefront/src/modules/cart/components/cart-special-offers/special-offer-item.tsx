"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { addToCart } from "@lib/data/cart"
import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"

type SpecialOfferItemProps = {
  product: HttpTypes.StoreProduct
  offerMeta: any
  region: HttpTypes.StoreRegion
}

export default function SpecialOfferItem({ product, offerMeta, region }: SpecialOfferItemProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id)

  const variant = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0]
  if (!variant) return null

  // Calculate prices
  const { cheapestPrice } = getProductPrice({
    product,
    variantId: variant.id
  })

  // The original price
  const originalPriceStr = cheapestPrice?.calculated_price
  let originalPriceNum = 0
  let currencyCode = region.currency_code.toUpperCase()
  
  if (originalPriceStr) {
    // try to parse the number
    const match = originalPriceStr.match(/[\d.,]+/)
    if (match) {
        originalPriceNum = parseFloat(match[0].replace('.', '').replace(',', '.'))
    }
  }

  // Calculate discounted price
  let discountedPrice = originalPriceNum
  if (offerMeta.type === "percent") {
    discountedPrice = originalPriceNum * (1 - (Number(offerMeta.amount) / 100))
  } else {
    discountedPrice = Math.max(0, originalPriceNum - Number(offerMeta.amount))
  }

  // Format the discounted price
  const formattedDiscountedPrice = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: region.currency_code,
  }).format(discountedPrice)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode: region.countries?.[0]?.iso_2 || "tr",
        metadata: {
          is_special_offer: true,
          special_offer_type: offerMeta.type,
          special_offer_amount: Number(offerMeta.amount)
        }
      })
      // The cart will auto-refresh if addToCart calls revalidateTag/revalidatePath
    } catch (e) {
      console.error(e)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex border border-gray-100 hover:border-[#f27a1a] transition-colors p-2 rounded-lg relative min-w-[320px] w-[320px] shrink-0 snap-start bg-white">
      {/* Top Left Badge (En İyi Fırsat etc.) - Optional, we can put the discount badge here */}
      <div className="absolute -top-2 left-2 bg-[#fce8e8] text-[#f27a1a] px-1.5 py-0.5 rounded-sm text-[9px] font-bold flex items-center gap-x-1 border border-[#f27a1a]">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        Sepetine Özel
      </div>

      <div className="w-[90px] h-[110px] shrink-0 mr-3 relative mt-2">
         <LocalizedClientLink href={`/products/${product.handle}`}>
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured
            />
         </LocalizedClientLink>
      </div>

      <div className="flex flex-col flex-1 py-1 mt-2">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h4 className="text-xs text-gray-800 line-clamp-2 hover:text-[#f27a1a] transition-colors font-medium">
            {product.title}
          </h4>
        </LocalizedClientLink>
        
        <div className="mt-1 flex flex-col">
          <span className="text-[10px] text-gray-400 line-through leading-none">
            {originalPriceStr}
          </span>
          <span className="text-[15px] font-bold text-[#f27a1a] leading-none mt-1">
            {formattedDiscountedPrice}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-x-2">
          {/* If variant title is not Default Title, show it */}
          {product.variants && product.variants.length > 0 && product.variants[0].title.toLowerCase() !== "default title" && (
            <select 
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="text-[11px] text-gray-600 border border-gray-200 px-1 py-1 h-7 rounded w-[35%] bg-white focus:outline-none focus:border-[#f27a1a]"
            >
              {product.variants.map((v: any) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
          )}
          
          <Button 
            size="small"
            className={`h-7 text-[11px] px-2 flex-1 bg-white text-[#f27a1a] border border-[#f27a1a] hover:bg-[#f27a1a] hover:text-white transition-colors`}
            isLoading={isAdding}
            onClick={handleAddToCart}
          >
            Sepete Ekle
          </Button>
        </div>
      </div>
    </div>
  )
}
