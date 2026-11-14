"use client"

import { addToCart, applyPromotions } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import MobileActions from "./mobile-actions"
import { trackViewContent, trackAddToCart } from "@lib/util/tracking"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  children?: React.ReactNode
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
  children
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedGiftVariantId, setSelectedGiftVariantId] = useState<string | null>(null)

  useEffect(() => {
    const handleGiftSelected = (e: any) => {
      setSelectedGiftVariantId(e.detail.variantId)
    }
    
    if (typeof window !== "undefined") {
      window.addEventListener("giftSelected", handleGiftSelected)
      return () => window.removeEventListener("giftSelected", handleGiftSelected)
    }
  }, [])

  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [viewerCount, setViewerCount] = useState(14)
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description")
  const [scrollingText, setScrollingText] = useState("")
  const [scrollingTextEnabled, setScrollingTextEnabled] = useState(true)
  const [scrollingTextBg, setScrollingTextBg] = useState("#FFD700")
  const [scrollingTextTextColor, setScrollingTextTextColor] = useState("#000000")
  
  // Button settings state
  const [btnConfig, setBtnConfig] = useState({
    buy_now_enabled: true,
    buy_now_bg: "#E50000",
    buy_now_text_color: "#ffffff",
    add_to_cart_enabled: true,
    add_to_cart_bg: "#000000",
    add_to_cart_text_color: "#ffffff",
    whatsapp_enabled: true,
    whatsapp_number: "905323370081",
    whatsapp_bg: "#ffffff",
    whatsapp_text_color: "#25D366",
  })

  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponTimeLeft, setCouponTimeLeft] = useState("")
  const [couponUrgentText, setCouponUrgentText] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Tarih ayarlanmışsa kullan, yoksa gün sonu (gece yarısı)
      const endDateStr = (product.metadata?.coupon_badge as any)?.end_date;
      let targetDate = new Date(now);
      
      if (endDateStr) {
         targetDate = new Date(endDateStr);
      } else {
         targetDate.setHours(23, 59, 59, 999);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCouponTimeLeft("0 saat 0 dk 0 sn kaldı!");
        setCouponUrgentText("Süresi Doldu");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      let timeLeftStr = "";
      if (days > 0) timeLeftStr += `${days} gün `;
      timeLeftStr += `${hours} saat ${minutes} dk ${seconds} sn kaldı!`;
      setCouponTimeLeft(timeLeftStr);

      let urgentStr = "";
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      if (days >= 1) {
        urgentStr = `Son ${days} gün`;
      } else if (totalHours > 0) {
        urgentStr = `Son ${totalHours} saat`;
      } else {
        urgentStr = `Son ${minutes} dakika`;
      }
      setCouponUrgentText(urgentStr);
    };
    
    calculateTimeLeft();
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [product.metadata?.coupon_badge]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        const headers: Record<string, string> = {}
        if (publishableKey) {
          headers["x-publishable-api-key"] = publishableKey
        }
        const res = await fetch(`${backendUrl}/store/hero-config`, { headers })
        const data = await res.json()
        if (data?.config) {
          setScrollingText(data.config.scrolling_text_product || "")
          setScrollingTextEnabled(data.config.scrolling_text_product_enabled ?? true)
          setScrollingTextBg(data.config.scrolling_text_product_bg || "#FFD700")
          setScrollingTextTextColor(data.config.scrolling_text_product_text_color || "#000000")
          
          setBtnConfig({
            buy_now_enabled: data.config.buy_now_enabled ?? true,
            buy_now_bg: data.config.buy_now_bg || "#E50000",
            buy_now_text_color: data.config.buy_now_text_color || "#ffffff",
            add_to_cart_enabled: data.config.add_to_cart_enabled ?? true,
            add_to_cart_bg: data.config.add_to_cart_bg || "#000000",
            add_to_cart_text_color: data.config.add_to_cart_text_color || "#ffffff",
            whatsapp_enabled: data.config.whatsapp_enabled ?? true,
            whatsapp_number: data.config.whatsapp_number || "905323370081",
            whatsapp_bg: data.config.whatsapp_bg || "#ffffff",
            whatsapp_text_color: data.config.whatsapp_text_color || "#25D366",
          })
        }
      } catch (err) {
        console.error("Failed to fetch scrolling text in product-actions:", err)
      }
    }
    fetchConfig()
  }, [])

  const toggleAccordion = (tab: string) => {
    setActiveAccordion((prev) => (prev === tab ? null : tab))
  }

  const countryCode = useParams().countryCode as string

  // Wishlist state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`favorite-${product.id}`)
      setIsFavorite(saved === "true")
    }
  }, [product.id])

  const toggleFavorite = () => {
    const nextValue = !isFavorite
    setIsFavorite(nextValue)
    if (typeof window !== "undefined") {
      localStorage.setItem(`favorite-${product.id}`, String(nextValue))
    }
  }

  // Live viewer count
  useEffect(() => {
    const initialCount = ((product.id?.charCodeAt(0) || 0) % 15) + 10
    setViewerCount(initialCount)
  }, [product.id])

  // Initialize options on mount or searchParams change
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    const getOptionByTitle = (titlePattern: "RENK" | "BEDEN") => {
      return product.options?.find((o) => {
        const t = (o.title || "").toLowerCase()
        if (titlePattern === "RENK") {
          return t === "renk" || t === "color" || t === "colour"
        }
        if (titlePattern === "BEDEN") {
          return t === "beden" || t === "size"
        }
        return false
      })
    }

    const renkOption = getOptionByTitle("RENK")
    const bedenOption = getOptionByTitle("BEDEN")

    const urlRenk = searchParams.get("RENK") || searchParams.get("renk")
    const urlBeden = searchParams.get("BEDEN") || searchParams.get("beden")

    let matchedVariant: any = null

    // If there is a v_id in URL, try to match it first
    const urlVId = searchParams.get("v_id")
    if (urlVId) {
      matchedVariant = product.variants.find((v) => v.id === urlVId)
    }

    if (!matchedVariant && (urlRenk || urlBeden)) {
      matchedVariant = product.variants.find((v) => {
        return v.options?.every((opt: any) => {
          if (renkOption && opt.option_id === renkOption.id) {
            if (!urlRenk) return true
            return opt.value?.toLowerCase() === urlRenk.toLowerCase()
          }
          if (bedenOption && opt.option_id === bedenOption.id) {
            if (!urlBeden) return true
            return opt.value?.toLowerCase() === urlBeden.toLowerCase()
          }
          return true
        })
      })
    }

    // If no variant matches the URL params, or URL params not specified
    if (!matchedVariant) {
      // Try to find first variant in stock
      matchedVariant = product.variants.find((v) => {
        const inStock = !v.manage_inventory || v.allow_backorder || (v.inventory_quantity || 0) > 0
        return inStock
      })
      // Fallback to first variant
      if (!matchedVariant) {
        matchedVariant = product.variants[0]
      }
    }

    if (matchedVariant) {
      const variantOptions = optionsAsKeymap(matchedVariant.options)
      setOptions((prev) => {
        if (isEqual(prev, variantOptions)) {
          return prev
        }
        return variantOptions ?? {}
      })
    }
  }, [product.variants, product.options, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    params.delete("v_id")

    const renkOption = product.options?.find((o) => {
      const t = (o.title || "").toLowerCase()
      return t === "renk" || t === "color" || t === "colour"
    })
    const bedenOption = product.options?.find((o) => {
      const t = (o.title || "").toLowerCase()
      return t === "beden" || t === "size"
    })

    if (renkOption && options[renkOption.id]) {
      params.set("RENK", options[renkOption.id]!)
      params.delete("renk")
    } else {
      params.delete("RENK")
      params.delete("renk")
    }

    if (bedenOption && options[bedenOption.id]) {
      params.set("BEDEN", options[bedenOption.id]!)
      params.delete("beden")
    } else {
      params.delete("BEDEN")
      params.delete("beden")
    }

    const newSearch = params.toString()
    if (searchParams.toString() !== newSearch) {
      router.replace(pathname + "?" + newSearch, { scroll: false })
    }
  }, [selectedVariant, isValidVariant, options, product.options, searchParams, pathname, router])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // In Medusa V2, inventory_quantity on storefront might not always reflect properly
    // depending on sales channel stock location links.
    // Rely on the backend API to reject if genuinely out of stock.
    return true
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })

      if (selectedGiftVariantId) {
        const { addGiftToCart } = await import("@lib/data/cart")
        await addGiftToCart({
          variantId: selectedGiftVariantId,
          countryCode
        }).catch(err => {
          console.error("Failed to add gift:", err)
        })
      }

      if (selectedPrice) {
        trackAddToCart({
          id: product.id,
          title: product.title || "",
          price: selectedPrice.calculated_price_number || 0,
          currency: (region?.currency_code || "TRY").toUpperCase(),
          quantity: 1
        })
      }

      // Automatic kupon olduğu için sepete eklendiğinde Medusa kendisi uygulayacak.
      setIsAdded(true)
      
      // Fire confetti if gift is added
      if (selectedGiftVariantId) {
        const confetti = (await import("canvas-confetti")).default
        confetti({
           particleCount: 100,
           spread: 70,
           origin: { y: 0.6 },
           colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        })
      }

      setTimeout(() => {
        setIsAdded(false)
      }, 1500)
    } catch (e: any) {
      alert("Ürün sepete eklenirken bir hata oluştu. " + (e?.message?.includes("inventory") ? "Ürün stokta kalmamış olabilir." : (e?.message || "")))
    } finally {
      setIsAdding(false)
    }
  }

  // Buy Now
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null

    setIsBuyingNow(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })

      if (selectedPrice) {
        trackAddToCart({
          id: product.id,
          title: product.title || "",
          price: selectedPrice.calculated_price_number || 0,
          currency: (region?.currency_code || "TRY").toUpperCase(),
          quantity: 1
        })
      }

      // Automatic kupon olduğu için sepete eklendiğinde Medusa kendisi uygulayacak.

      router.push(`/${countryCode}/cart`)
    } catch (e: any) {
      alert("Hemen al işlemi başlatılamadı. " + (e?.message?.includes("inventory") ? "Ürün stokta kalmamış olabilir." : (e?.message || "")))
    } finally {
      setIsBuyingNow(false)
    }
  }

  // Calculate pricing
  const price = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })

  const selectedPrice = selectedVariant ? price.variantPrice : price.cheapestPrice

  // Hesaplanan yeni fiyat için değişkenler
  let finalPriceNumber = selectedPrice?.calculated_price_number || 0
  let hasActiveCoupon = false
  
  if (couponApplied && product.metadata?.coupon_badge && (product.metadata.coupon_badge as any).active) {
    const couponInfo = product.metadata.coupon_badge as any
    hasActiveCoupon = true
    if (couponInfo.type === "percent") {
      finalPriceNumber = finalPriceNumber * (1 - Number(couponInfo.amount) / 100)
    } else {
      // Amount (e.g. 50 TL) needs to be multiplied by 100 to match cents
      finalPriceNumber = Math.max(0, finalPriceNumber - Number(couponInfo.amount) * 100)
    }
  }

  const finalPriceFormatted = convertToLocale({
    amount: finalPriceNumber,
    currency_code: region?.currency_code || 'TRY'
  })

  const lastTrackedProductRef = useRef<{ id: string; price: number } | null>(null)

  // Track ViewContent event
  useEffect(() => {
    if (product && selectedPrice) {
      const priceNum = selectedPrice.calculated_price_number || 0
      if (
        lastTrackedProductRef.current?.id === product.id &&
        lastTrackedProductRef.current?.price === priceNum
      ) {
        return
      }
      lastTrackedProductRef.current = { id: product.id, price: priceNum }

      trackViewContent({
        id: product.id,
        title: product.title || "",
        price: priceNum,
        currency: (region?.currency_code || "TRY").toUpperCase()
      })
    }
  }, [product.id, selectedPrice?.calculated_price_number])

  const whatsappUrl = `https://wa.me/${btnConfig.whatsapp_number}?text=${encodeURIComponent(
    `Merhaba, ${product.title} ürününü satın almak istiyorum.`
  )}`

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        {/* Title & Favorites */}
        <div className="flex flex-col gap-y-2">
          <div className="flex items-start justify-between">
            <h1 className="font-sans text-3xl sm:text-4xl leading-tight text-black font-medium tracking-wide pr-4" data-testid="product-title">
              {product.title}
            </h1>
            <button
              onClick={toggleFavorite}
              aria-label="Favorilere Ekle"
              className="p-2 mt-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 text-black"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isFavorite ? "text-[#E50000]" : "text-black"}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Star review trigger */}
          <a
            href="#product-reviews"
            className="flex items-center gap-2 mt-1 text-sm text-gray-500 hover:text-black cursor-pointer w-max"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 fill-gray-200 text-gray-200"
                  aria-hidden="true"
                >
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                </svg>
              ))}
            </div>
            <span>İlk değerlendiren siz olun</span>
          </a>
        </div>

        {/* Pricing Block */}
        <div className="flex flex-col gap-y-4">
          {selectedPrice && (
            <div className="flex items-center gap-x-4">
              {(selectedPrice.price_type === "sale" || hasActiveCoupon) && (
                <div className="bg-[#E50000] text-white text-sm font-bold px-3 py-1.5 flex items-center justify-center tracking-widest shadow-sm">
                  %{hasActiveCoupon && (product.metadata?.coupon_badge as any)?.type === 'percent' 
                     ? (product.metadata?.coupon_badge as any)?.amount 
                     : selectedPrice.percentage_diff || ' İndirim'}
                </div>
              )}
              <div className="flex flex-col items-start leading-[1.2]">
                {(selectedPrice.price_type === "sale" || hasActiveCoupon) && (
                  <span
                    className="line-through text-[#666666] text-[15px] font-medium"
                    data-testid="original-product-price"
                    data-value={selectedPrice.original_price_number}
                  >
                    {selectedPrice.price_type === "sale" ? selectedPrice.original_price : selectedPrice.calculated_price}
                  </span>
                )}
                <span
                  className={`font-bold text-3xl transition-colors duration-300 ${hasActiveCoupon ? 'text-[#E50000]' : 'text-black'}`}
                  data-testid="product-price"
                  data-value={finalPriceNumber}
                >
                  {finalPriceFormatted}
                </span>
              </div>
            </div>
          )}

          {/* Live view count */}
          <div className="flex items-center gap-x-3 bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-black mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
            <span className="tracking-wide">
              Şu an <strong>{viewerCount} kişi</strong> bu ürünü inceliyor.
            </span>
          </div>
        </div>

        {/* Trendyol Style Coupon Badge */}
        {product.metadata?.coupon_badge && (product.metadata.coupon_badge as any).active && (
          <div className="flex flex-col gap-y-2 mt-2">
            <div className="relative mt-4">
              {/* Countdown badge */}
              <div className="absolute -top-3 left-3 bg-[#b90000] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10 shadow-sm border border-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {couponTimeLeft}
              </div>
              <div className="flex items-center gap-4 bg-[#fdf5f2] border border-[#f5dcd2] rounded-lg p-3 pt-4 w-max max-w-full relative">
                {/* Left side */}
                <div className="flex flex-col gap-1 pr-6 border-r border-[#f5dcd2] border-dashed">
                  <span className="text-[#000] text-center font-semibold text-xl tracking-tight">
                    {(product.metadata.coupon_badge as any).type === "percent" ? "%" : ""}{(product.metadata.coupon_badge as any).amount}
                    {(product.metadata.coupon_badge as any).type === "fixed" ? " TL" : ""}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText((product.metadata?.coupon_badge as any).code);
                      setShowCouponModal(true);
                      setCouponApplied(true);
                    }}
                    className="bg-[#f27a1a] text-white text-xs font-bold py-1.5 px-6 rounded hover:bg-[#e06912] transition-colors mt-1"
                  >
                    Kazan
                  </button>
                </div>
                {/* Right side */}
                <div className="flex flex-col text-[13px] text-gray-700 justify-center">
                  <span className="flex items-center gap-1.5 font-medium text-[#b90000]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {couponUrgentText}
                  </span>
                  <span className="flex items-center gap-1 mt-3 font-semibold text-[#005288] hover:underline cursor-pointer">
                    Kuponun Ürünleri 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Options Selection */}
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-6">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding || isBuyingNow}
                      product={product}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Scrolling Announcement Marquee for Product Details */}
        {scrollingTextEnabled && scrollingText && (
          <div
            className="overflow-hidden relative w-full select-none rounded-md my-2 shadow-sm border border-black/5"
            style={{ backgroundColor: scrollingTextBg }}
          >
            <style>{`
              @keyframes marquee-product {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .animate-marquee-product {
                display: inline-flex;
                white-space: nowrap;
                animation: marquee-product 35s linear infinite;
              }
            `}</style>
            <div className="flex w-max py-2.5">
              <div
                className="animate-marquee-product flex items-center text-[11px] font-bold uppercase tracking-wider"
                style={{ color: scrollingTextTextColor }}
              >
                <span>{scrollingText ? Array(6).fill(scrollingText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0" : ""}</span>
                <span>{scrollingText ? Array(6).fill(scrollingText).join("\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0" : ""}</span>
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-y-3 mt-2">
          {/* HEMEN AL */}
          {btnConfig.buy_now_enabled && (
            <button
              onClick={handleBuyNow}
              disabled={
                !inStock ||
                !selectedVariant ||
                !!disabled ||
                isAdding ||
                isBuyingNow ||
                !isValidVariant
              }
              className="w-full h-14 uppercase tracking-widest text-[15px] transition-opacity border-none rounded-none font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:opacity-90"
              style={{ backgroundColor: btnConfig.buy_now_bg, color: btnConfig.buy_now_text_color }}
            >
              {isBuyingNow ? "Satın Alınıyor..." : "HEMEN AL"}
            </button>
          )}

          {/* Sepete Ekle */}
          {btnConfig.add_to_cart_enabled && (
            <button
              onClick={handleAddToCart}
              disabled={
                !inStock ||
                !selectedVariant ||
                !!disabled ||
                isAdding ||
                isBuyingNow ||
                !isValidVariant
              }
              className={`w-full h-14 uppercase tracking-widest text-[15px] transition-all duration-300 border-none rounded-none font-bold flex items-center justify-center hover:opacity-90 ${
                !inStock || !isValidVariant || !selectedVariant || disabled
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50"
                  : isAdded
                  ? "bg-emerald-600 text-white"
                  : "cursor-pointer"
              }`}
              style={
                !(!inStock || !isValidVariant || !selectedVariant || disabled) && !isAdded
                  ? { backgroundColor: btnConfig.add_to_cart_bg, color: btnConfig.add_to_cart_text_color }
                  : undefined
              }
              data-testid="add-product-button"
            >
              {!selectedVariant && !options
                ? "VARYANT SEÇİN"
                : !inStock || !isValidVariant
                ? "TÜKENDİ"
                : isAdding
                ? "EKLENİYOR..."
                : isAdded
                ? "EKLENDİ ✔"
                : "SEPETE EKLE"}
            </button>
          )}

          {/* WhatsApp Order */}
          {btnConfig.whatsapp_enabled && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 flex items-center justify-center gap-x-2 uppercase tracking-widest text-sm font-bold transition-opacity hover:opacity-90 border rounded-none"
              style={{
                backgroundColor: btnConfig.whatsapp_bg,
                color: btnConfig.whatsapp_text_color,
                borderColor: btnConfig.whatsapp_text_color
              }}
            >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WHATSAPP İLE SİPARİŞ
          </a>
          )}


          {/* Secure / Shipping Info */}
          <div className="flex items-center justify-center gap-x-6 mt-4 opacity-70">
            <div className="flex items-center gap-x-2 text-[11px] uppercase tracking-wide font-medium">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Güvenli Ödeme
            </div>
            <div className="flex items-center gap-x-2 text-[11px] uppercase tracking-wide font-medium">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="16.5" cy="18.5" r="2.5" />
              </svg>
              Aynı Gün Kargo
            </div>
          </div>
        </div>

        {children}

        {/* Collapsible Accordion Tabs */}
        <div className="w-full flex flex-col mt-2">
          {/* Description */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleAccordion("description")}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#111]">
                Ürün Açıklaması
              </span>
              <span className="text-2xl font-light text-[#111] leading-none mb-1">
                {activeAccordion === "description" ? "-" : "+"}
              </span>
            </button>
            {activeAccordion === "description" && (
              <div className="mt-4 transition-all duration-300">
                <div className="text-sm text-gray-600 leading-relaxed font-light">
                  <p className="font-normal font-sans txt-medium whitespace-pre-line text-[#444] text-[15px]">
                    {product.description || "Açıklama bulunmuyor."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleAccordion("specs")}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#111]">
                Özellikler
              </span>
              <span className="text-2xl font-light text-[#111] leading-none mb-1">
                {activeAccordion === "specs" ? "-" : "+"}
              </span>
            </button>
            {activeAccordion === "specs" && (
              <div className="mt-4 transition-all duration-300">
                <div className="text-sm text-gray-600 leading-relaxed font-light">
                  <ul className="list-inside list-disc space-y-2 text-[#444] text-[15px]">
                    {product.material && (
                      <li>
                        <strong>Materyal:</strong> {product.material}
                      </li>
                    )}
                    {product.origin_country && (
                      <li>
                        <strong>Üretim Yeri:</strong> {product.origin_country}
                      </li>
                    )}
                    {product.type && (
                      <li>
                        <strong>Tür:</strong> {product.type.value}
                      </li>
                    )}
                    {product.weight && (
                      <li>
                        <strong>Ağırlık:</strong> {product.weight} g
                      </li>
                    )}
                    {!product.material &&
                      !product.origin_country &&
                      !product.type &&
                      !product.weight && <li>Ek özellik belirtilmemiş.</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleAccordion("shipping")}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-[#111]">
                Kargo & İade
              </span>
              <span className="text-2xl font-light text-[#111] leading-none mb-1">
                {activeAccordion === "shipping" ? "-" : "+"}
              </span>
            </button>
            {activeAccordion === "shipping" && (
              <div className="mt-4 transition-all duration-300">
                <div className="text-sm text-gray-600 leading-relaxed font-light">
                  <div className="space-y-4 text-[#444] text-[15px]">
                    <p>
                      <strong className="text-black font-medium">Aynı Gün Kargo:</strong> Saat 15:00&apos;a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür.
                    </p>
                    <p>
                      <strong className="text-black font-medium">Kolay İade:</strong> Siparişinizdeki ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve etiketleri sökülmemiş olması şartıyla iade edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200"></div>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isBuyingNow}
        />
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCouponModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 border-2 border-green-500 text-green-500 rounded-full flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kupon Tanımlandı</h3>
              <p className="text-[13px] text-gray-700 mb-6 px-4">
                Topladığın kupon hesabına tanımlandı. Daha fazla topla daha fazla kazan!
              </p>
              
              <p className="text-[12px] text-gray-500 mb-4">
                Gün içinde kalan kupon kazanma limitiniz: 49
              </p>
              
              <p className="text-[12px] text-gray-500">
                Toplanan tüm kuponlara hesap altından ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
