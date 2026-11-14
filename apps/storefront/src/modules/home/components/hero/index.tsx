import { Button, Heading } from "@medusajs/ui"
import Link from "next/link"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
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
    return data?.config || null
  } catch (err) {
    console.error("Failed to fetch hero config in Storefront:", err)
    return null
  }
}

const Hero = async ({ dict }: { dict: any }) => {
  const config = await getHeroConfig()

  // Extract config or use fallbacks
  const tag = config?.tag || "MEDUSA V2 × NEXT.JS"
  const title = config?.title || dict.hero.title
  const subtitle = config?.subtitle || dict.hero.subtitle
  const btnText = config?.btn_text || dict.hero.cta
  const btnLink = config?.btn_link || "/store"
  const mediaType = config?.media_type || "image"
  const mediaUrl = config?.media_url || ""

  return (
    <div className="h-[75vh] w-full relative bg-zinc-50 overflow-hidden border-b border-zinc-200">
      
      {/* Background rendering based on admin configuration */}
      {mediaUrl ? (
        <>
          {mediaType === "video" ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
              src={mediaUrl}
            />
          ) : (
            <img
              className="absolute inset-0 w-full h-full object-cover z-0"
              src={mediaUrl}
              alt="Hero Banner Background"
            />
          )}
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] z-0" />
        </>
      ) : (
        /* Default ultra-premium light tech grid background */
        <>
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none z-0" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 z-0" />
        </>
      )}

      {/* Content overlays exactly as designed */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 small:p-32 gap-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-600 text-xs font-semibold tracking-wider uppercase animate-pulse">
          {tag}
        </span>
        
        <span className="flex flex-col gap-3 max-w-3xl">
          <Heading
            level="h1"
            className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-950 font-sans leading-tight"
          >
            {title}
          </Heading>
          <p className="text-base md:text-xl text-zinc-600 font-medium max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </span>

        <div className="flex flex-col small:flex-row gap-4 mt-2">
          <Link href={btnLink}>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white border border-violet-600 px-8 py-3 rounded-lg shadow-[0_4px_15px_rgba(124,58,237,0.2)] transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2">
              {btnText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Hero
