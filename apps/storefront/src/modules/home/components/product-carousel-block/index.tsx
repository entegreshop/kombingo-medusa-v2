"use client"

import React, { useRef, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { N11ProductCard } from "@modules/home/components/category-tabs"

export interface CarouselBlockConfig {
  id: string
  title: string
  subtitle?: string
  badge_text?: string
  source_type?: "latest" | "category" | "collection"
  handle?: string
  limit?: number
  position?: "above_banners" | "below_banners" | "below_categories" | "below_products"
  bg_color?: string
  text_color?: string
  accent_color?: string
  btn_text?: string
  btn_link?: string
  autoplay?: boolean
  active?: boolean
}

export default function ProductCarouselBlock({
  block,
  products,
  region,
}: {
  block: CarouselBlockConfig
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.clientWidth > 768 ? el.clientWidth * 0.8 : el.clientWidth * 0.85
    el.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    if (!block.autoplay || !products || products.length <= 5) return
    const timer = window.setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 260, behavior: "smooth" })
      }
    }, 4500)
    return () => window.clearInterval(timer)
  }, [block.autoplay, products])

  if (!products || products.length === 0) return null

  const accent = block.accent_color || "#c91d82"
  const bgColor = block.bg_color || "#ffffff"
  const textColor = block.text_color || "#1f2937"

  return (
    <section
      className="w-full py-7 md:py-9 border-b border-zinc-100 select-none"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="content-container px-4 md:px-8">
        {/* Header Row (n11 Style: Title Left, "Tümünü Gör >" Right) */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            {block.badge_text && (
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider mb-1.5"
                style={{
                  backgroundColor: `${accent}15`,
                  color: accent,
                }}
              >
                {block.badge_text}
              </span>
            )}
            <h2 className="text-[19px] md:text-[22px] font-bold tracking-tight" style={{ color: textColor }}>
              {block.title}
            </h2>
            {block.subtitle && (
              <p className="text-xs md:text-sm text-zinc-500 mt-0.5">{block.subtitle}</p>
            )}
          </div>

          <LocalizedClientLink
            href={block.btn_link || "/store"}
            className="inline-flex items-center gap-1 text-[13.5px] font-semibold hover:underline transition-opacity hover:opacity-85 shrink-0"
            style={{ color: accent }}
          >
            <span>{block.btn_text || "Tümünü Gör"}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* 5-Column Product Carousel Track with Floating Side Arrows */}
        <div className="relative group/track">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label="Önceki Ürünler"
            className="absolute -left-2 md:-left-4 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#e5e7eb] shadow-[0_4px_14px_rgba(0,0,0,0.14)] flex items-center justify-center text-[#374151] hover:text-black hover:scale-105 transition cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Sonraki Ürünler"
            className="absolute -right-2 md:-right-4 top-[42%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#e5e7eb] shadow-[0_4px_14px_rgba(0,0,0,0.14)] flex items-center justify-center text-[#374151] hover:text-black hover:scale-105 transition cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-9.6px)] min-w-[165px]"
              >
                <N11ProductCard product={product} region={region} index={idx} accentColor={accent} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
