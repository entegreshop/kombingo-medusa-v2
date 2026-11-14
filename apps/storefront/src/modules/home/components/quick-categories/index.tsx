import Link from "next/link"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const defaultCategoriesList = [
  {
    name: "YENİ GELENLER",
    handle: "yeni-gelenler",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`
  },
  {
    name: "Çok Satanlar",
    handle: "cok-satanlar",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`
  },
  {
    name: "Jean Pantolon",
    handle: "jean-pantolon",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l1.5 16h-4.5L12 9l-2 11H5.5L7 4z"/><path d="M7 7h10"/><path d="M9 4v3"/><path d="M15 4v3"/></svg>`
  },
  {
    name: "Tayt",
    handle: "tayt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l1 16h-3.5L12 9.5 10.5 20H7.0L8 4z"/><path d="M8 7.5h8"/></svg>`
  },
  {
    name: "Sweat",
    handle: "sweat",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l-3 3.5L5.5 15l1.5-2v6.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5V13l1.5 2 2.5-2.5L18 9V6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v3z"/><path d="M9 10a3 3 0 0 0 6 0"/><path d="M12 3v5"/></svg>`
  },
  {
    name: "Mont & Kürk",
    handle: "mont",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a3 3 0 0 0-3-3h-2L12 3.5 10 5H8a3 3 0 0 0-3 3z"/><path d="M12 3.5V21"/><path d="M5 9h14"/><path d="M5 13h14"/><path d="M5 17h14"/></svg>`
  },
  {
    name: "Kombin",
    handle: "kombin",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a2 2 0 0 0-2 2c0 .5.2.9.5 1.2L5 8.5v3l4.5 1V19A1.5 1.5 0 0 0 11 20.5h2a1.5 1.5 0 0 0 1.5-1.5v-6.5l4.5-1v-3L13.5 6.2c.3-.3.5-.7.5-1.2a2 2 0 0 0-2-2z"/><path d="M8 8.5V17"/><path d="M16 8.5V17"/></svg>`
  },
  {
    name: "Tshirt",
    handle: "tshirt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5.5L3.5 8 5.5 11l2-1.5v10.0A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5V9.5l2 1.5 2-3L18 5.5V3.5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 6 3.5v2.0z"/><path d="M9.5 2h5A2.5 2.5 0 0 1 12 4.5 2.5 2.5 0 0 1 9.5 2z"/></svg>`
  },
  {
    name: "Gözlük",
    handle: "gozluk",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a3 3 0 0 1 3-3h3.5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v0z"/><path d="M11.5 11a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-3.5a3 3 0 0 1-3-3v0z"/><path d="M9.5 11h2.5"/><path d="M3 11.5c.5-3 2-4.5 3.5-4.5"/><path d="M21 11.5c-.5-3-2-4.5-3.5-4.5"/></svg>`
  },
  {
    name: "Çanta",
    handle: "canta",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 8z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8"/></svg>`
  }
]

async function getCategoriesConfig() {
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
    return data?.config?.categories || defaultCategoriesList
  } catch (err) {
    console.error("Failed to fetch categories config in Storefront:", err)
    return defaultCategoriesList
  }
}

export default async function QuickCategories() {
  const categoriesList = await getCategoriesConfig()

  return (
    <div className="w-full bg-white py-10 border-b border-zinc-200">
      <div className="content-container">
        {/* Horizontal scroll container on mobile, flex row on desktop */}
        <div className="flex items-center justify-start md:justify-center gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth">
          {categoriesList.map((cat, idx) => (
            <Link
              key={idx}
              href={`/categories/${cat.handle}`}
              className="flex flex-col items-center gap-3 group min-w-[85px] snap-center cursor-pointer transition-all duration-300"
            >
              {/* Circular Icon container with premium light violet hover border */}
              <div className="w-16 h-16 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-600 relative transition-all duration-300 group-hover:text-violet-600 group-hover:border-violet-500/30 group-hover:bg-violet-500/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_8px_20px_rgba(124,58,237,0.12)] transform group-hover:scale-105">
                {/* SVG or Image Icon rendered dynamically */}
                {cat.icon && cat.icon.trim().startsWith("<svg") ? (
                  <div 
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    dangerouslySetInnerHTML={{ __html: cat.icon }} 
                  />
                ) : (
                  <img 
                    src={cat.icon} 
                    className="w-8 h-8 object-contain shrink-0" 
                    alt={cat.name} 
                  />
                )}
                
                {/* Tiny absolute neon pulse dot */}
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-zinc-200 border border-white group-hover:bg-violet-500 group-hover:border-violet-200 transition-colors duration-300" />
              </div>
              
              {/* Category Name */}
              <span className="text-xs md:text-sm text-zinc-600 font-semibold tracking-wide group-hover:text-zinc-950 transition-colors duration-300 whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

