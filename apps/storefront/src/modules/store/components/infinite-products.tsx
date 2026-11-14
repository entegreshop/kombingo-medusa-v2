"use client"

import { useEffect, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { listProductsWithSort } from "@lib/data/products"
import Spinner from "@modules/common/icons/spinner"

type InfiniteProductsProps = {
  initialProducts: HttpTypes.StoreProduct[]
  count: number
  region: HttpTypes.StoreRegion
  countryCode: string
  categoryId?: string
  collectionId?: string
  productsIds?: string[]
  sortBy?: any
  className?: string
}

export default function InfiniteProducts({
  initialProducts,
  count,
  region,
  countryCode,
  categoryId,
  collectionId,
  productsIds,
  sortBy,
  className = "grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8",
}: InfiniteProductsProps) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [page, setPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const limit = 12
  const totalPages = Math.ceil(count / limit)
  const [hasMore, setHasMore] = useState<boolean>(totalPages > 1)

  const observerRef = useRef<HTMLDivElement>(null)

  // Reset state when server-side props change (e.g. user toggles sorting, searchParams, or switches category tabs)
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    const newTotalPages = Math.ceil(count / limit)
    setHasMore(newTotalPages > 1)
    setIsLoading(false)
  }, [initialProducts, count, categoryId, collectionId, sortBy])

  useEffect(() => {
    if (!hasMore || isLoading) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true)
          const nextPage = page + 1
          
          try {
            const queryParams: any = {
              limit,
            }
            if (categoryId) {
              queryParams["category_id"] = [categoryId]
            }
            if (collectionId) {
              queryParams["collection_id"] = [collectionId]
            }
            if (productsIds) {
              queryParams["id"] = productsIds
            }

            const res = await listProductsWithSort({
              page: nextPage,
              queryParams,
              sortBy,
              countryCode,
            })

            if (res && res.response && res.response.products.length > 0) {
              setProducts((prev) => {
                // Deduplicate products just in case
                const existingIds = new Set(prev.map(p => p.id))
                const newProducts = res.response.products.filter(p => !existingIds.has(p.id))
                return [...prev, ...newProducts]
              })
              setPage(nextPage)
              
              const loadedCount = products.length + res.response.products.length
              setHasMore(count > loadedCount)
            } else {
              setHasMore(false)
            }
          } catch (err) {
            console.error("Failed to load more products:", err)
          } finally {
            setIsLoading(false)
          }
        }
      },
      { threshold: 0.1 }
    )

    const currentObserverRef = observerRef.current
    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
    }
  }, [page, hasMore, isLoading, categoryId, collectionId, productsIds, sortBy, countryCode, count, products.length])

  return (
    <div className="flex flex-col items-center w-full">
      <ul className={className} data-testid="products-list">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
      
      {hasMore && (
        <div ref={observerRef} className="w-full flex justify-center py-10">
          <Spinner size={32} />
        </div>
      )}
    </div>
  )
}
