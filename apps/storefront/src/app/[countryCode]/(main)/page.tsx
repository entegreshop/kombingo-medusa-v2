import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import PromoBanners from "@modules/home/components/promo-banners"
import TrustBadges from "@modules/home/components/trust-badges"
import CategoryTabs from "@modules/home/components/category-tabs"
import ProductPreview from "@modules/products/components/product-preview"
import InteractiveLink from "@modules/common/components/interactive-link"
import { Text } from "@medusajs/ui"
import InfiniteProducts from "@modules/store/components/infinite-products"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getDictionary } from "@lib/util/get-dictionary"
import { getCategoryByHandle } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"

export const metadata: Metadata = {
  title: "XOOX Medusa Storefront",
  description: "A performant international storefront for XOOX Commerce.",
}

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      cache: "no-store",
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch hero config in Home page:", err)
    return null
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  const dict = await getDictionary(countryCode)
  const config = await getHeroConfig()

  const marqueeText = config?.scrolling_text_home
  const repeatedText = marqueeText ? Array(8).fill(marqueeText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0" : ""

  const categoryQuery = searchParams.category || "cok-satanlar"
  
  let products: any[] = []
  let count = 0
  let sectionTitle = "Çok Satanlar"
  let viewAllLink = "/store"
  let activeCategoryId: string | undefined = undefined
  let activeCollectionId: string | undefined = undefined

  if (categoryQuery === "cok-satanlar") {
    const cokSatanlarCollection = collections.find(
      (c) => c.handle === "çok-satanlar" || c.handle === "cok-satanlar"
    ) || collections[0]
    
    if (cokSatanlarCollection) {
      activeCollectionId = cokSatanlarCollection.id
      const res = await listProducts({
        regionId: region.id,
        queryParams: {
          collection_id: [cokSatanlarCollection.id],
          fields: "*variants.calculated_price",
          limit: 12,
        },
      })
      products = res.response.products
      count = res.response.count
      sectionTitle = cokSatanlarCollection.title
      viewAllLink = `/collections/${cokSatanlarCollection.handle}`
    }
  } else {
    const categoryObj = await getCategoryByHandle([categoryQuery])
    if (categoryObj) {
      activeCategoryId = categoryObj.id
      const res = await listProducts({
        regionId: region.id,
        queryParams: {
          category_id: [categoryObj.id],
          fields: "*variants.calculated_price",
          limit: 12,
        },
      })
      products = res.response.products
      count = res.response.count
      sectionTitle = categoryObj.name
      viewAllLink = `/categories/${categoryObj.handle}`
    }
  }

  const configuredCategories = config?.categories || []

  return (
    <>
      {/* 1. Campaign Hero Slider */}
      <Hero dict={dict} />

      {/* Home page scrolling announcement marquee (placed below Hero) */}
      {config?.scrolling_text_home_enabled !== false && marqueeText && (
        <div
          className="overflow-hidden relative w-full select-none border-b border-black/10"
          style={{ backgroundColor: config.scrolling_text_home_bg || "#000000" }}
        >
          <style>{`
            @keyframes marquee-home {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee-home {
              display: inline-flex;
              white-space: nowrap;
              animation: marquee-home 40s linear infinite;
            }
          `}</style>
          <div className="flex w-max py-2.5">
            <div
              className="animate-marquee-home flex items-center text-xs font-semibold uppercase tracking-wider"
              style={{ color: config.scrolling_text_home_text_color || "#ffffff" }}
            >
              <span>{repeatedText}</span>
              <span>{repeatedText}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 2. Campaign Double Bento Banners */}
      <PromoBanners />

      {/* 3. Category Tab Bar Carousel */}
      <CategoryTabs categories={configuredCategories} activeCategory={categoryQuery} />
      
      {/* 4. Products Grid Section */}
      <div className="bg-white py-12 border-b border-zinc-200">
        <div className="content-container">

          {products && products.length > 0 ? (
            <InfiniteProducts
              initialProducts={products}
              count={count}
              region={region}
              countryCode={countryCode}
              categoryId={activeCategoryId}
              collectionId={activeCollectionId}
              className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <Text className="text-zinc-500 font-semibold text-sm">
                Bu kategoride henüz sergilenecek ürün bulunmuyor.
              </Text>
            </div>
          )}
        </div>
      </div>
      
      {/* 5. Trust and Security Badges */}
      <TrustBadges />
    </>
  )
}
