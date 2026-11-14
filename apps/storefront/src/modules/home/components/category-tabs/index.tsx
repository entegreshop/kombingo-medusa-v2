"use client"

import { useRef, useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryConfig {
  name: string
  handle: string
  icon: string
}

export default function CategoryTabs({
  categories,
  activeCategory,
}: {
  categories: CategoryConfig[]
  activeCategory: string
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Prepend default bestseller tab
  const allTabs = [
    {
      name: "ÇOK SATANLAR",
      handle: "cok-satanlar",
      icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    },
    ...categories,
  ]

  const checkScrollLimits = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 5)
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener("scroll", checkScrollLimits)
      // Initial check
      checkScrollLimits()
      
      // Resize check
      window.addEventListener("resize", checkScrollLimits)
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollLimits)
      window.removeEventListener("resize", checkScrollLimits)
    }
  }, [categories])

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.7
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const activeTab = activeCategory || "cok-satanlar"

  return (
    <div className="relative w-full bg-white py-6 select-none group/carousel border-b border-zinc-100">
      <div className="content-container relative px-4 md:px-8">
        
        {/* Left Arrow Navigation Overlay */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all duration-200 hidden md:flex"
            aria-label="Sola Kaydır"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow Navigation Overlay */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 shadow-md flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all duration-200 hidden md:flex"
            aria-label="Sağa Kaydır"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scrollable Tabs Wrapper */}
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-start md:justify-center gap-6 md:gap-8 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {allTabs.map((tab, idx) => {
            const isActive = activeTab === tab.handle
            
            return (
              <LocalizedClientLink
                key={idx}
                href={tab.handle === "cok-satanlar" ? "/" : `/?category=${tab.handle}`}
                scroll={false}
                className="flex flex-col items-center gap-2 group/tab min-w-[90px] snap-center cursor-pointer transition-all duration-300"
              >
                {/* Double Ring Circle Container */}
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full border flex items-center justify-center transition-all duration-300 relative bg-white transform group-hover/tab:scale-105 ${
                    isActive
                      ? "border-violet-600 border-2 shadow-[0_4px_16px_rgba(124,58,237,0.12)]"
                      : "border-zinc-200 group-hover/tab:border-violet-400 group-hover/tab:shadow-sm"
                  }`}
                >
                  {/* Outer circle sub-ring */}
                  <div
                    className={`absolute inset-1.5 rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-violet-600/30 bg-violet-50/5"
                        : "border-zinc-100 group-hover/tab:border-zinc-200/50"
                    }`}
                  />
                  
                  {/* SVG or Image Render */}
                  <div
                    className={`relative z-10 w-9 h-9 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isActive ? "text-violet-600" : "text-zinc-500 group-hover/tab:text-violet-500"
                    }`}
                  >
                    {tab.icon && tab.icon.trim().startsWith("<svg") ? (
                      <div
                        className="w-8 h-8 flex items-center justify-center svg-container"
                        dangerouslySetInnerHTML={{ __html: tab.icon }}
                      />
                    ) : (
                      <img
                        src={tab.icon}
                        className="w-8 h-8 object-contain"
                        alt={tab.name}
                      />
                    )}
                  </div>
                  
                  {/* Pulsing indicator dot */}
                  <span
                    className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 ${
                      isActive ? "bg-violet-600 scale-110" : "bg-zinc-200 group-hover/tab:bg-violet-400"
                    }`}
                  />
                </div>

                {/* Tab Label */}
                <span
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300 whitespace-nowrap mt-1 ${
                    isActive
                      ? "text-violet-600 font-extrabold"
                      : "text-zinc-500 group-hover/tab:text-zinc-800"
                  }`}
                >
                  {tab.name}
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
      
      {/* Inline styles for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .svg-container svg {
          width: 32px !important;
          height: 32px !important;
        }
      `}</style>
    </div>
  )
}
