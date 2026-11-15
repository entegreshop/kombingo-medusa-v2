"use client"

import React, { useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { N11ProductCard } from "@modules/home/components/category-tabs"

export interface BannerCarouselConfig {
  id: string
  title: string
  title_color?: string
  cta_text?: string
  cta_link?: string
  cta_color?: string
  footer_note?: string
  badge_text?: string
  bg_image_url?: string
  bg_color?: string
  source_type?: "latest" | "category" | "collection"
  handle?: string
  limit?: number
  position?: "replace_hero" | "above_banners" | "below_banners" | "below_collection" | "below_products"
  free_shipping_text?: string
  active?: boolean
}

export default function BannerCategoryCarousel({
  bannerBlock,
  products,
  region,
}: {
  bannerBlock: BannerCarouselConfig
  products: HttpTypes.StoreProduct[]
  region?: HttpTypes.StoreRegion
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollTrack = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.72
    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  if (!products || products.length === 0) return null

  const titleColor = bannerBlock.title_color || "#111827"
  const ctaColor = bannerBlock.cta_color || "#f02d9c"
  const bgColor = bannerBlock.bg_color || "#dce6f2"
  const bgImage =
    bannerBlock.bg_image_url ||
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80"

  return (
    <section className="w-full py-5 md:py-7 bg-white select-none">
      <div className="content-container px-4 md:px-8">
        {/* Main Rounded Banner Container (n11 Style without top brand circles) */}
        <div
          className="relative w-full rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-zinc-200/70"
          style={{ backgroundColor: bgColor }}
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <img
              src={bgImage}
              alt={bannerBlock.title || "Kampanya"}
              className="w-full h-full object-cover object-left"
            />
            {/* Soft gradient so left text and bottom note remain crisp & readable */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.28) 100%)",
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.68) 100%)",
              }}
            />
          </div>

          {/* Content Grid: Left Editorial Campaign Info (38%) + Right Product Carousel (62%) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[430px] p-4 sm:p-6 md:p-7 gap-6">
            {/* Left Column: Title, Pink CTA Link & Bottom Campaign Note */}
            <div className="lg:col-span-5 flex flex-col justify-between min-h-[200px] lg:min-h-full pr-2">
              <div className="pt-1 md:pt-2">
                <h2
                  className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-tight leading-[1.12] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]"
                  style={{ color: titleColor }}
                >
                  {bannerBlock.title || "Kışlık Kombinler"}
                </h2>

                {bannerBlock.cta_text !== "" && (
                  <LocalizedClientLink
                    href={bannerBlock.cta_link || "/store"}
                    className="inline-flex items-center gap-1.5 text-lg sm:text-xl md:text-[23px] font-extrabold mt-1.5 hover:opacity-90 transition-opacity drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]"
                    style={{ color: ctaColor }}
                  >
                    <span>{bannerBlock.cta_text || "Fırsatları Kaçırma"}</span>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </LocalizedClientLink>
                )}
              </div>

              {/* Bottom Left Campaign Footnote & Optional Badge */}
              <div className="flex items-end justify-between gap-3 mt-auto pt-8">
                {bannerBlock.footer_note && (
                  <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-white leading-snug max-w-[310px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    {bannerBlock.footer_note}
                  </p>
                )}

                {bannerBlock.badge_text && (
                  <div className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-fuchsia-700 via-pink-600 to-amber-500 text-white font-black text-[11px] uppercase tracking-wider text-center shadow-lg border border-white/30">
                    {bannerBlock.badge_text}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Horizontal Product Cards Carousel (NO top circular brand icons) */}
            <div className="lg:col-span-7 flex items-center relative">
              {/* Left Floating Arrow */}
              <button
                type="button"
                onClick={() => scrollTrack("left")}
                aria-label="Önceki Ürünler"
                className="absolute -left-2 sm:-left-3 top-[42%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-zinc-200 shadow-[0_4px_14px_rgba(0,0,0,0.18)] flex items-center justify-center text-zinc-800 hover:text-black hover:scale-105 transition cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Floating Arrow */}
              <button
                type="button"
                onClick={() => scrollTrack("right")}
                aria-label="Sonraki Ürünler"
                className="absolute -right-2 sm:-right-3 top-[42%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-zinc-200 shadow-[0_4px_14px_rgba(0,0,0,0.18)] flex items-center justify-center text-zinc-800 hover:text-black hover:scale-105 transition cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Product Cards Track (Shows ~3.2 cards on desktop just like n11 screenshot) */}
              <div
                ref={trackRef}
                className="w-full flex gap-3 overflow-x-auto py-1 px-1 snap-x snap-mandatory scrollbar-none scroll-smooth"
              >
                {products.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className="snap-start shrink-0 w-[190px] sm:w-[210px] md:w-[215px]"
                  >
                    <N11ProductCard
                      product={product}
                      region={region}
                      index={idx}
                      accentColor={ctaColor}
                      freeShippingText={bannerBlock.free_shipping_text || "HIZLI KARGO"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
