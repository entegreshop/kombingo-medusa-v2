import Link from "next/link"
import { Button, Heading } from "@medusajs/ui"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const defaultBannersList = [
  {
    tag: "Trend Koleksiyon",
    title: "PREMIUM JEAN KOLEKSİYONU",
    description: "En boy likralı kot taytlar ve yüksek bel toparlayıcı jean pantolonlar şimdi en popüler kesimleriyle vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/categories/jean-pantolon",
    image_url: ""
  },
  {
    tag: "Özel Seçki",
    title: "YAZ SEZONU KOMBİNLERİ",
    description: "Oysho modal kumaş şalvar takımlar ve çift şerit paraşüt kargo pantolonlar ile konforlu ve şık kombinler.",
    btn_text: "Şimdi İncele",
    btn_link: "/categories/kombin",
    image_url: ""
  }
]

async function getBannersConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      cache: "no-store", // Ensure real-time configuration loading
      headers,
    })
    const data = await res.json()
    return data?.config?.banners || defaultBannersList
  } catch (err) {
    console.error("Failed to fetch banners config in Storefront:", err)
    return defaultBannersList
  }
}

export default async function PromoBanners() {
  const banners = await getBannersConfig()

  return (
    <div className="w-full bg-white py-12 border-b border-zinc-200">
      <div className="content-container">
        {/* Double column grid, stacking on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {banners.slice(0, 2).map((banner, idx) => {
            const isFirst = idx === 0
            const accentClass = isFirst ? "indigo" : "violet"
            
            return (
              <div 
                key={idx} 
                className={`h-[280px] rounded-2xl border border-zinc-200 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500 ${
                  isFirst 
                    ? "bg-gradient-to-br from-zinc-50 to-indigo-50/50 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.08)]" 
                    : "bg-gradient-to-br from-zinc-50 to-violet-50/50 hover:border-violet-300 hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)]"
                }`}
              >
                {/* Background image & gradient overlay */}
                {banner.image_url ? (
                  <>
                    <img 
                      src={banner.image_url} 
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" 
                      alt={banner.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 z-0" />
                  </>
                ) : (
                  <>
                    {/* Tech grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 group-hover:opacity-60 transition-opacity duration-500 z-0" />
                    
                    {/* Glowing orb in bottom-right */}
                    <div className={`absolute -bottom-10 -right-10 w-[200px] h-[200px] rounded-full blur-[50px] transition-all duration-500 z-0 ${
                      isFirst 
                        ? "bg-indigo-500/5 group-hover:bg-indigo-500/10" 
                        : "bg-violet-500/5 group-hover:bg-violet-500/10"
                    }`} />
                  </>
                )}
                
                {/* Content Container */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between items-start">
                  <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                    isFirst 
                      ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-600" 
                      : "border-violet-500/20 bg-violet-500/5 text-violet-600"
                  }`}>
                    {banner.tag}
                  </span>
                  
                  <div className="flex flex-col gap-2 max-w-sm">
                    <Heading level="h2" className="text-2xl md:text-3xl font-bold text-zinc-950 tracking-tight">
                      {banner.title}
                    </Heading>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      {banner.description}
                    </p>
                  </div>
                  
                  <Link href={banner.btn_link}>
                    <Button className={`text-white px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform group-hover:translate-x-1 flex items-center gap-2 ${
                      isFirst 
                        ? "bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.2)]" 
                        : "bg-violet-600 hover:bg-violet-700 border border-violet-600 shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
                    }`}>
                      {banner.btn_text}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

