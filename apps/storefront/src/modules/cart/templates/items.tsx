import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import SpecialOffersSlider from "../components/cart-special-offers/special-offers-slider"
import { listProducts } from "@lib/data/products"

async function CartSpecialOffersInline({ cart }: { cart?: HttpTypes.StoreCart }) {
  if (!cart?.region?.id) return null

  // Fetch special offers from backend API to avoid pg import in Next.js edge/server runtime
  const res = await fetch("http://localhost:9000/store/special-offers", { 
    headers: {
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    },
    next: { revalidate: 0 } 
  }).catch(() => null)
  
  if (!res?.ok) return null
  const data = await res.json().catch(() => null)
  const specialOffers = data?.specialOffers || []
  
  if (specialOffers.length === 0) return null
  
  const productIds = specialOffers.map((o: any) => o.id)
  const countryCode = cart.region?.countries?.[0]?.iso_2 || "tr"

  const { response } = await listProducts({
    queryParams: { id: productIds, limit: 50 },
    countryCode,
  }).catch(() => ({ response: { products: [] } }))

  if (!response?.products || response.products.length === 0) return null

  const cartProductIds = cart.items?.map(i => i.product_id).filter(Boolean) || []
  const availableProducts = response.products.filter(p => !cartProductIds.includes(p.id))

  if (availableProducts.length === 0) return null

  return (
    <div className="w-full min-w-0">
      <SpecialOffersSlider 
        availableProducts={availableProducts} 
        specialOffers={specialOffers} 
        region={cart.region} 
      />
    </div>
  )
}

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Sepetim</Heading>
      </div>

      <Suspense fallback={null}>
        <CartSpecialOffersInline cart={cart} />
      </Suspense>

      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-black bg-gray-50 border-y border-gray-200 txt-medium-plus font-medium">
            <Table.HeaderCell className="pl-4 py-3 text-left" colSpan={2}>Ürün</Table.HeaderCell>
            <Table.HeaderCell className="py-3 text-left">Adet</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell py-3 text-left">
              Fiyat
            </Table.HeaderCell>
            <Table.HeaderCell className="pr-4 py-3 text-right">
              Toplam
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
