import { HttpTypes } from "@medusajs/types"
import { getCartSpecialOffersIds } from "../../../../app/actions/coupons"
import { listProducts } from "@lib/data/products"
import SpecialOfferItem from "./special-offer-item"

async function CartSpecialOffers({ cart }: { cart?: HttpTypes.StoreCart }) {
  if (!cart?.region?.id) return null

  // 1. Get product IDs and their metadata (which has the discount info)
  const specialOffers = await getCartSpecialOffersIds()
  if (!specialOffers || specialOffers.length === 0) return null
  
  // 2. Fetch the actual products using those IDs
  const productIds = specialOffers.map(o => o.id)
  
  // get country code from cart region
  const countryCode = cart.region?.countries?.[0]?.iso_2 || "tr"

  const { response } = await listProducts({
    queryParams: {
      id: productIds,
      limit: 10,
    },
    countryCode,
  }).catch(() => ({ response: { products: [] } }))

  if (!response.products || response.products.length === 0) return null

  // 3. Filter out products that are ALREADY in the cart
  const cartProductIds = cart.items?.map(i => i.product_id).filter(Boolean) || []
  const availableProducts = response.products.filter(p => !cartProductIds.includes(p.id))

  if (availableProducts.length === 0) return null

  return (
    <div className="mt-8 border border-[#f5dcd2] rounded-md p-4 bg-white relative">
      <div className="absolute -top-3 left-4 bg-white px-2">
        <span className="text-sm font-semibold text-[#f27a1a] flex items-center gap-x-1">
          🎉 Sepetine Özel İndirimler!
        </span>
      </div>
      <p className="text-[11px] text-gray-500 mt-2 mb-4">Satıcının ilgini çekebilecek diğer ürünlerini burada görebilirsin.</p>
      
      <div className="flex flex-col gap-y-4">
        {availableProducts.map((product) => {
          return (
            <div key={product.id}>
              {product.title}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CartSpecialOffers
