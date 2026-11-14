import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import AddToCartButton from "./add-to-cart-button"

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const variantId = product.variants?.[0]?.id

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper" className="flex flex-col bg-white rounded-none">
        <div className="relative overflow-hidden bg-zinc-50 transition-all duration-300">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="transition-transform duration-500 group-hover:scale-105 !rounded-none !shadow-none !p-0 !border-none !bg-transparent"
          />
        </div>
        
        {/* Centered Product Title and Prices */}
        <div className="flex flex-col items-center text-center mt-3 px-2 pb-1 gap-y-1">
          <Text className="text-zinc-800 font-normal text-sm leading-tight group-hover:text-zinc-950 transition-colors duration-300 min-h-[40px] flex items-center justify-center" data-testid="product-title">
            {product.title}
          </Text>
          
          {cheapestPrice ? (
            cheapestPrice.price_type === "sale" ? (
              <div className="flex items-center justify-center gap-x-2 mt-1.5 h-[42px]">
                {/* Green discount box */}
                <div className="flex items-center justify-center bg-[#15803d] text-white font-bold text-[13px] px-2 py-0.5 rounded-sm">
                  %{cheapestPrice.percentage_diff}
                </div>
                {/* Prices block */}
                <div className="flex flex-col items-start leading-none justify-center">
                  <span className="line-through text-[#15803d] text-[13px] font-medium">
                    {cheapestPrice.original_price}
                  </span>
                  <span className="text-[#15803d] font-bold text-[16px] mt-0.5">
                    {cheapestPrice.calculated_price}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center mt-1.5 h-[42px]">
                <span className="text-zinc-950 font-bold text-[16px]">
                  {cheapestPrice.calculated_price}
                </span>
              </div>
            )
          ) : null}
        </div>

        {/* Sepete Ekle Button */}
        <AddToCartButton product={product} region={region} />
      </div>
    </LocalizedClientLink>
  )
}
