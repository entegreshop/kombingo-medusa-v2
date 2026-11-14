import { HttpTypes } from "@medusajs/types"
import HediyeUrunlerClient from "./HediyeUrunlerClient"
import { listProducts } from "@lib/data/products"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export default async function HediyeUrunler({
  product,
  region
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  let settings = null
  let giftProducts: HttpTypes.StoreProduct[] = []

  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/custom/kampanyalar`, {
      cache: "no-store",
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274"
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      settings = data.hediye_urunler_settings
    } else {
      console.error("Failed to fetch hediye urunler:", await res.text())
    }
  } catch (error) {
    console.error("Error fetching hediye urunler settings:", error)
  }

  if (!settings || !settings.active) {
    return null
  }

  if (settings.selectedProducts && settings.selectedProducts.length > 0) {
    const productIds = settings.selectedProducts.map((p: any) => p.id)
    try {
      const { response } = await listProducts({
        queryParams: { id: productIds },
        regionId: region.id,
      })
      giftProducts = response.products
    } catch (e) {
      console.error("Error fetching gift products", e)
    }
  }

  if (giftProducts.length === 0) return null

  return <HediyeUrunlerClient product={product} region={region} settings={settings} giftProducts={giftProducts} />
}
