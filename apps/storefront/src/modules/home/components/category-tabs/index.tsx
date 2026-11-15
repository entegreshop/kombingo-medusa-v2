"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"

export interface CategoryConfig {
  name: string
  handle: string
  icon?: string
  active?: boolean
}

export interface CategoryTabSectionConfig {
  title?: string
  view_all_text?: string
  view_all_link?: string
  accent_color?: string
  free_shipping_text?: string
  show_installment_badge?: boolean
  show_coupon_badge?: boolean
  sepette_badge_text?: string
}

function toTitleCaseTr(str: string) {
  if (!str) return ""
  if (str === str.toUpperCase() && str.length > 2) {
    return str
      .toLocaleLowerCase("tr-TR")
      .split(" ")
      .map((w) => (w.length > 0 ? w[0].toLocaleUpperCase("tr-TR") + w.slice(1) : w))
      .join(" ")
  }
  return str
}

export function N11ProductCard({
  product,
  region,
  index,
  accentColor = "#c91d82",
  freeShippingText = "HIZLI KARGO",
}: {
  product: HttpTypes.StoreProduct
  region?: HttpTypes.StoreRegion
  index: number
  accentColor?: string
  freeShippingText?: string
  showInstallmentBadge?: boolean
  showCouponBadge?: boolean
  sepetteBadgeText?: string
}) {
  const [liked, setLiked] = useState(false)

  const { cheapestPrice } = useMemo(() => {
    try {
      return getProductPrice({ product })
    } catch {
      return { cheapestPrice: null }
    }
  }, [product])

  const imgUrl = product.thumbnail || product.images?.[0]?.url || "/placeholder.png"

  // Calculate discount percentage & original price for the green price block & top-left black circular badge
  const calculatedNum = cheapestPrice?.calculated_price_number || 0
  const fallbackRates = [41, 31, 31, 35, 41]
  const fallbackRate = fallbackRates[index % fallbackRates.length]

  const discountPercent =
    cheapestPrice?.price_type === "sale" && Number(cheapestPrice?.percentage_diff) > 0
      ? Number(cheapestPrice.percentage_diff)
      : fallbackRate

  const originalPriceStr =
    cheapestPrice?.price_type === "sale" && cheapestPrice?.original_price
      ? cheapestPrice.original_price
      : calculatedNum > 0
      ? `₺${Math.round(calculatedNum / (1 - discountPercent / 100)).toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : ""

  return (
    <div className="group/card relative flex flex-col justify-between rounded-[8px] border border-[#e5e7eb] bg-white overflow-hidden transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[#d1d5db] h-full">
      {/* Top Image & Overlay Badges */}
      <div className="relative w-full aspect-[3/4] bg-[#f8f9fa] overflow-hidden">
        <LocalizedClientLink href={`/products/${product.handle}`} className="block w-full h-full">
          <img
            src={imgUrl}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />
        </LocalizedClientLink>

        {/* Top-Left Black Circular Discount Rate Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <div
            className="w-[46px] h-[46px] rounded-full bg-[#18181b] text-white flex flex-col items-center justify-center text-center leading-none shadow-md border-[1.5px]"
            style={{ borderColor: accentColor }}
          >
            <span className="text-[12.5px] font-black leading-none text-white">
              %{discountPercent}
            </span>
            <span
              className="text-[6.5px] font-extrabold uppercase tracking-tight mt-0.5"
              style={{ color: "#f472b6" }}
            >
              İNDİRİM
            </span>
          </div>
        </div>

        {/* Top-Right Heart Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked((prev) => !prev)
          }}
          aria-label="Favorilere Ekle"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-zinc-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex items-center justify-center text-zinc-700 hover:scale-110 transition cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "#e11d48" : "none"}
            stroke={liked ? "#e11d48" : "currentColor"}
            strokeWidth="1.9"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>
      </div>

      {/* Full-Width Dark Fast Shipping Banner ("HIZLI KARGO") */}
      <div className="w-full bg-[#1b1b1e] text-white text-[11px] font-bold tracking-[0.6px] uppercase text-center py-[5px] shrink-0">
        {freeShippingText || "HIZLI KARGO"}
      </div>

      {/* Card Body: Centered Title + Green Discount & Price Block + SEPETE EKLE Button */}
      <div className="flex flex-col flex-1 justify-between bg-white pt-3">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex flex-col items-center text-center px-2.5 pb-1"
        >
          {/* Centered Product Title */}
          <h3
            className="text-[13px] text-zinc-800 font-normal leading-tight group-hover/card:text-zinc-950 transition-colors line-clamp-2 min-h-[36px] flex items-center justify-center"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Green Discount Box + Crossed-out Original Price + Sale Price (as in Image) */}
          {cheapestPrice ? (
            <div className="flex items-center justify-center gap-x-2 mt-2 h-[42px]">
              <div className="flex items-center justify-center bg-[#15803d] text-white font-bold text-[12.5px] px-2 py-0.5 rounded-xs">
                %{discountPercent}
              </div>
              <div className="flex flex-col items-start leading-none justify-center">
                {originalPriceStr && (
                  <span className="line-through text-[#15803d] text-[12.5px] font-medium">
                    {originalPriceStr}
                  </span>
                )}
                <span className="text-[#15803d] font-bold text-[15.5px] mt-0.5">
                  {cheapestPrice.calculated_price}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mt-2 h-[42px]">
              <span className="text-zinc-950 font-bold text-[15px]">İncele</span>
            </div>
          )}
        </LocalizedClientLink>

        {/* Bottom Full-Width Black "SEPETE EKLE" Button */}
        {region ? (
          <div className="w-full px-2 pb-2">
            <AddToCartButton product={product} region={region} />
          </div>
        ) : (
          <div className="w-full px-2 pb-2 mt-2">
            <LocalizedClientLink
              href={`/products/${product.handle}`}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold text-[11px] uppercase tracking-wider py-3 flex items-center justify-center transition-colors"
            >
              SEPETE EKLE
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CategoryTabs({
  categories,
  activeCategory,
  products = [],
  allProducts = [],
  region,
  sectionConfig,
}: {
  categories: CategoryConfig[]
  activeCategory: string
  products?: HttpTypes.StoreProduct[]
  allProducts?: HttpTypes.StoreProduct[]
  region?: HttpTypes.StoreRegion
  sectionConfig?: CategoryTabSectionConfig
}) {
  const pillScrollRef = useRef<HTMLDivElement>(null)
  const productTrackRef = useRef<HTMLDivElement>(null)

  const [selectedTab, setSelectedTab] = useState<string>(activeCategory || "yeni-gelenler")
  const [showPillLeft, setShowPillLeft] = useState(false)
  const [showPillRight, setShowPillRight] = useState(true)

  useEffect(() => {
    if (activeCategory) {
      setSelectedTab(activeCategory)
    }
  }, [activeCategory])

  // Pill Tabs: ONLY the categories present on the page (Yeni Gelenler, Çok Satanlar + configured store categories)
  const allTabs = useMemo(() => {
    const baseTabs = [
      { name: "Yeni Gelenler", handle: "yeni-gelenler" },
      { name: "Çok Satanlar", handle: "cok-satanlar" },
    ]

    const defaultStoreCategories = [
      { name: "Jean Pantolon", handle: "jean-pantolon" },
      { name: "Tayt", handle: "tayt" },
      { name: "Sweat", handle: "sweat" },
      { name: "Mont & Kürk", handle: "mont" },
      { name: "Kombin", handle: "kombin" },
      { name: "Tshirt", handle: "tshirt" },
      { name: "Gözlük", handle: "gozluk" },
      { name: "Çanta", handle: "canta" },
    ]

    const sourceCategories =
      categories && categories.length > 0 ? categories : defaultStoreCategories

    const existingHandles = new Set(baseTabs.map((t) => t.handle))
    const dynamicTabs = sourceCategories
      .filter((c) => c && c.handle && !existingHandles.has(c.handle))
      .map((c) => ({
        name: toTitleCaseTr(c.name),
        handle: c.handle,
      }))

    return [...baseTabs, ...dynamicTabs]
  }, [categories])

  const checkPillScroll = () => {
    const el = pillScrollRef.current
    if (!el) return
    setShowPillLeft(el.scrollLeft > 8)
    setShowPillRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = pillScrollRef.current
    if (el) {
      el.addEventListener("scroll", checkPillScroll)
      checkPillScroll()
      window.addEventListener("resize", checkPillScroll)
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkPillScroll)
      window.removeEventListener("resize", checkPillScroll)
    }
  }, [allTabs])

  const scrollPills = (dir: "left" | "right") => {
    const el = pillScrollRef.current
    if (!el) return
    el.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    })
  }

  const scrollProducts = (dir: "left" | "right") => {
    const el = productTrackRef.current
    if (!el) return
    const amount = el.clientWidth > 768 ? el.clientWidth * 0.8 : el.clientWidth * 0.85
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  // Filter or reorder products based on selected category tab
  const displayedProducts = useMemo(() => {
    const pool = products && products.length > 0 ? products : allProducts
    if (!pool || pool.length === 0) return []

    if (selectedTab === "yeni-gelenler" || selectedTab === "tumu") {
      return pool
    }
    if (selectedTab === "cok-satanlar") {
      const rotated = [...pool]
      if (rotated.length > 2) {
        const firstTwo = rotated.splice(0, 2)
        rotated.push(...firstTwo)
      }
      return rotated
    }
    const keyword = selectedTab.replace(/-/g, " ").toLocaleLowerCase("tr-TR")
    const matched = pool.filter((p) => {
      const t = (p.title || "").toLocaleLowerCase("tr-TR")
      const h = (p.handle || "").toLocaleLowerCase("tr-TR")
      return t.includes(keyword) || h.includes(selectedTab)
    })
    return matched.length > 0 ? matched : pool
  }, [products, allProducts, selectedTab])

  const accentColor = sectionConfig?.accent_color || "#c91d82"
  const sectionTitle =
    !sectionConfig?.title || sectionConfig.title === "Yeni Sezon & Öne Çıkan Ürünler"
      ? "Kombingo Collection"
      : sectionConfig.title
  const viewAllText = sectionConfig?.view_all_text || "Tümünü Gör"
  const viewAllLink = sectionConfig?.view_all_link || "/store"
  const shippingBarText =
    !sectionConfig?.free_shipping_text || sectionConfig.free_shipping_text === "ÜCRETSİZ KARGO"
      ? "HIZLI KARGO"
      : sectionConfig.free_shipping_text

  return (
    <section className="w-full bg-white pt-8 pb-6 select-none border-b border-zinc-100">
      <div className="content-container px-4 md:px-8">
        {/* 1. Header Row: Left Title ("Kombingo Collection") & Right "Tümünü Gör >" Link */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-[19px] md:text-[22px] font-bold text-[#1f2937] tracking-tight">
            {sectionTitle}
          </h2>
          <LocalizedClientLink
            href={viewAllLink}
            className="inline-flex items-center gap-1 text-[13.5px] font-semibold hover:underline transition-opacity hover:opacity-85 shrink-0"
            style={{ color: accentColor }}
          >
            <span>{viewAllText}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* 2. n11-Style Horizontal Pill Category Tabs Bar (Store Categories) */}
        <div className="relative mb-5">
          {showPillLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-white via-white/95 to-transparent">
              <button
                type="button"
                onClick={() => scrollPills("left")}
                aria-label="Kategorileri Sola Kaydır"
                className="w-8 h-8 rounded-full bg-white border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#374151] hover:text-black transition cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}

          <div
            ref={pillScrollRef}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none scroll-smooth py-1 pr-10"
          >
            {allTabs.map((tab) => {
              const isActive =
                selectedTab === tab.handle ||
                (selectedTab === "tumu" && tab.handle === "yeni-gelenler")
              return (
                <LocalizedClientLink
                  key={tab.handle}
                  href={tab.handle === "yeni-gelenler" ? "/" : `/?category=${tab.handle}`}
                  scroll={false}
                  onClick={() => {
                    setSelectedTab(tab.handle)
                    if (productTrackRef.current) {
                      productTrackRef.current.scrollTo({ left: 0, behavior: "smooth" })
                    }
                  }}
                  className={`h-[38px] px-4 md:px-5 rounded-full inline-flex items-center justify-center text-[13px] whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                    isActive
                      ? "font-bold text-[#111827] shadow-2xs"
                      : "border border-[#e2e5ec] bg-white text-[#374151] font-medium hover:border-[#cbd5e1] hover:text-[#111827]"
                  }`}
                  style={
                    isActive
                      ? {
                          border: `1.5px solid ${accentColor}`,
                          backgroundColor: `${accentColor}0F`,
                        }
                      : undefined
                  }
                >
                  {tab.name}
                </LocalizedClientLink>
              )
            })}
          </div>

          {showPillRight && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-white via-white/95 to-transparent">
              <button
                type="button"
                onClick={() => scrollPills("right")}
                aria-label="Kategorileri Sağa Kaydır"
                className="w-8 h-8 rounded-full bg-white border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#374151] hover:text-black transition cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 3. 5-Column Product Carousel with Left/Right Floating Arrows */}
        {displayedProducts.length > 0 && (
          <div className="relative group/track">
            {/* Left Floating Carousel Arrow */}
            <button
              type="button"
              onClick={() => scrollProducts("left")}
              aria-label="Önceki Ürünler"
              className="absolute -left-2 md:-left-4 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#e5e7eb] shadow-[0_4px_14px_rgba(0,0,0,0.14)] flex items-center justify-center text-[#374151] hover:text-black hover:scale-105 transition cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Floating Carousel Arrow */}
            <button
              type="button"
              onClick={() => scrollProducts("right")}
              aria-label="Sonraki Ürünler"
              className="absolute -right-2 md:-right-4 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#e5e7eb] shadow-[0_4px_14px_rgba(0,0,0,0.14)] flex items-center justify-center text-[#374151] hover:text-black hover:scale-105 transition cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 5-Column Horizontal Scroll Track */}
            <div
              ref={productTrackRef}
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none scroll-smooth"
            >
              {displayedProducts.map((product, idx) => (
                <div
                  key={`${product.id}-${idx}`}
                  className="snap-start shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-9.6px)] min-w-[165px]"
                >
                  <N11ProductCard
                    product={product}
                    region={region}
                    index={idx}
                    accentColor={accentColor}
                    freeShippingText={shippingBarText}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
