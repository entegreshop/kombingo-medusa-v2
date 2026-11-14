"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useParams } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "tr"
  const inputRef = useRef<HTMLInputElement>(null)

  // Enable client-side mounting for Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Fetch region on mount/countryCode change
  useEffect(() => {
    const fetchRegion = async () => {
      const r = await getRegion(countryCode)
      setRegion(r)
    }
    fetchRegion()
  }, [countryCode])

  // Focus input when opened and toggle body scroll lock
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { response } = await listProducts({
          countryCode,
          queryParams: {
            q: query,
            limit: 20,
          },
        })
        setResults(response.products)
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, countryCode])

  const getProductPriceMarkup = (product: HttpTypes.StoreProduct) => {
    const { cheapestPrice } = getProductPrice({ product })
    if (!cheapestPrice) return null

    if (cheapestPrice.price_type === "sale") {
      return (
        <div className="flex items-center justify-center gap-x-2 mt-1.5 h-[42px]">
          <div className="flex items-center justify-center bg-[#15803d] text-white font-bold text-[13px] px-2 py-0.5 rounded-sm">
            %{cheapestPrice.percentage_diff}
          </div>
          <div className="flex flex-col items-start leading-none justify-center">
            <span className="line-through text-[#15803d] text-[13px] font-medium">
              {cheapestPrice.original_price}
            </span>
            <span className="text-[#15803d] font-bold text-[16px] mt-0.5">
              {cheapestPrice.calculated_price}
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center mt-1.5 h-[42px]">
        <span className="text-zinc-950 font-bold text-[16px]">
          {cheapestPrice.calculated_price}
        </span>
      </div>
    )
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto flex flex-col animate-fade-in">
      {/* Header */}
      <div className="w-full bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 small:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <LocalizedClientLink
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center transition-opacity hover:opacity-85"
            >
              <img
                src="/logo.png"
                alt="Kombingo"
                className="h-8 w-auto object-contain"
              />
            </LocalizedClientLink>
          </div>

          {/* Search Bar Input */}
          <div className="flex-1 max-w-[640px] mx-4 small:mx-8 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
                />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ne aramıştınız?"
              className="w-full h-12 pl-12 pr-4 bg-zinc-50/50 border border-zinc-300 rounded-none focus:outline-none focus:border-zinc-500 focus:bg-white text-zinc-800 transition-all text-sm"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsOpen(false)
              setQuery("")
              setResults([])
            }}
            className="p-2 text-zinc-400 hover:text-zinc-800 transition-colors flex items-center justify-center border border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
            aria-label="Kapat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 w-full bg-[#fdfdfd]">
        <div className="max-w-[1440px] mx-auto px-4 small:px-8 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-500 text-sm">Ürünler aranıyor...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 medium:grid-cols-3 large:grid-cols-5 gap-x-6 gap-y-10">
              {results.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white rounded-none border border-zinc-100 p-2 shadow-sm transition-all hover:shadow-md">
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col"
                  >
                    <div className="relative overflow-hidden bg-zinc-50 transition-all duration-300">
                      <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="full"
                        className="transition-transform duration-500 group-hover:scale-105 !rounded-none !shadow-none !p-0 !border-none !bg-transparent"
                      />
                    </div>
                    <div className="flex flex-col items-center text-center mt-3 px-2 pb-1 gap-y-1">
                      <span className="text-zinc-800 font-normal text-sm leading-tight group-hover:text-zinc-950 transition-colors duration-300 min-h-[40px] flex items-center justify-center">
                        {product.title}
                      </span>
                      {getProductPriceMarkup(product)}
                    </div>
                  </LocalizedClientLink>
                  <div className="mt-auto pt-3">
                    {region && <AddToCartButton product={product} region={region} />}
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-20">
              <span className="text-zinc-500 text-base">
                "{query}" ile eşleşen bir ürün bulunamadı.
              </span>
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-zinc-400 text-sm">
                Aramak istediğiniz ürün adını veya detayını yukarıdaki kutuya yazın.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Search Icon Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 text-zinc-700 hover:text-zinc-950 transition-colors flex items-center justify-center"
        aria-label="Arama Yap"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
          />
        </svg>
      </button>

      {/* Render via Portal to avoid containing block issues from header filters */}
      {mounted && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  )
}
