"use client"

import React, { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

export type ReviewItem = {
  id: string
  no?: number
  product_id?: string
  product_title?: string
  customer_name: string
  color?: string
  size?: string
  rating: number
  comment: string
  media_url?: string
  media_type?: "image" | "video"
  media_urls?: string[]
  active?: boolean
  verified_purchase?: boolean
  helpful_count?: number
  created_at?: string
}

type ProductReviewsProps = {
  product: HttpTypes.StoreProduct
}

const isVideoMedia = (url?: string, type?: string) => {
  if (!url) return false
  if (type === "video") return true
  return /\.(mp4|webm|mov|ogg|avi)($|\?)/i.test(url) || url.startsWith("data:video/")
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: "rev_default_1",
      customer_name: "Mehmet A.",
      color: "STANDART",
      rating: 5,
      comment:
        "Malzeme kalitesi harika, birebir uyumlu geldi. Paketleme çok özenliydi ve hızlı kargolandı. Kesinlikle tavsiye ederim!",
      media_url: product.thumbnail || product.images?.[0]?.url || "",
      media_type: "image",
      verified_purchase: true,
      helpful_count: 14,
      created_at: "10.11.2026",
    },
    {
      id: "rev_default_2",
      customer_name: "Seda K.",
      color: "PARLAK SİYAH",
      rating: 5,
      comment:
        "Rengi, dokusu ve duruşu muazzam. Montajı çok kolay oldu, araca tam oturdu. Çok memnun kaldık :)",
      media_url: product.images?.[1]?.url || product.thumbnail || "",
      media_type: "image",
      verified_purchase: true,
      helpful_count: 9,
      created_at: "09.11.2026",
    },
    {
      id: "rev_default_3",
      customer_name: "Emre T.",
      color: "STANDART",
      rating: 5,
      comment:
        "Gerçekten fiyat performans olarak çok başarılı. Müşteri temsilcisi de çok ilgiliydi, teşekkürler.",
      media_url: product.images?.[2]?.url || product.thumbnail || "",
      media_type: "image",
      verified_purchase: true,
      helpful_count: 6,
      created_at: "08.11.2026",
    },
  ])

  const [showWriteModal, setShowWriteModal] = useState(false)
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: "image" | "video"; author: string; comment: string; rating: number } | null>(null)
  const [filterMode, setFilterMode] = useState<"all" | "media">("all")
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Modal Form State (Görsel 2 Birebir)
  const [customerName, setCustomerName] = useState("")
  const [selectedColor, setSelectedColor] = useState("STANDART")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [mediaPreview, setMediaPreview] = useState("")
  const [mediaFile, setMediaFile] = useState<{ name: string; type: string; base64: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Extract color options from product if available
  const productColors: string[] = React.useMemo(() => {
    const colorOpt = product.options?.find(
      (o) =>
        o.title?.toLowerCase().includes("renk") ||
        o.title?.toLowerCase().includes("color") ||
        o.title?.toLowerCase().includes("seçenek")
    )
    if (colorOpt?.values && colorOpt.values.length > 0) {
      return colorOpt.values.map((v: any) => String(v.value || v).toUpperCase())
    }
    return ["STANDART", "PARLAK SİYAH", "MAT SİYAH", "KARBON"]
  }, [product.options])

  useEffect(() => {
    if (productColors.length > 0) {
      setSelectedColor(productColors[0])
    }
  }, [productColors])

  const fetchReviews = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      const headers: Record<string, string> = {}
      if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
      }

      const res = await fetch(
        `${backendUrl}/store/product-reviews?product_id=${encodeURIComponent(product.id || "")}`,
        { headers }
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          // Enrich reviews without media with product images if they are default showcase reviews
          const enriched = data.reviews.map((r: ReviewItem, idx: number) => ({
            ...r,
            media_url:
              r.media_url ||
              product.images?.[idx % Math.max(1, product.images?.length || 1)]?.url ||
              product.thumbnail ||
              "",
          }))
          setReviews(enriched)
        }
      }
    } catch (e) {
      // Fallback to localStorage if offline
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`reviews-${product.id}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReviews(parsed)
            }
          } catch (err) {}
        }
      }
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [product.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setMediaPreview(base64)
      setMediaFile({
        name: file.name,
        type: file.type,
        base64,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setSubmitting(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
      }

      const payload: any = {
        product_id: product.id,
        product_title: product.title,
        product_handle: product.handle,
        product_thumbnail: product.thumbnail || product.images?.[0]?.url || "",
        customer_name: customerName.trim() || "Müşteri",
        color: selectedColor,
        rating,
        comment: comment.trim(),
      }

      if (mediaFile) {
        payload.filename = mediaFile.name
        payload.filetype = mediaFile.type
        payload.base64 = mediaFile.base64
        payload.media_type = mediaFile.type.startsWith("video/") ? "video" : "image"
      }

      const res = await fetch(`${backendUrl}/store/product-reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.review) {
          setReviews((prev) => [data.review, ...prev])
        } else {
          await fetchReviews()
        }
      } else {
        throw new Error("Sunucu hatası")
      }
    } catch (err) {
      // Fallback local add
      const fallbackReview: ReviewItem = {
        id: `local_${Date.now()}`,
        customer_name: customerName.trim() || "Müşteri",
        color: selectedColor,
        rating,
        comment: comment.trim(),
        media_url: mediaPreview || product.thumbnail || "",
        media_type: mediaFile?.type.startsWith("video/") ? "video" : "image",
        verified_purchase: true,
        helpful_count: 1,
        created_at: new Date().toLocaleDateString("tr-TR"),
      }
      const next = [fallbackReview, ...reviews]
      setReviews(next)
      if (typeof window !== "undefined") {
        localStorage.setItem(`reviews-${product.id}`, JSON.stringify(next))
      }
    } finally {
      setSubmitting(false)
      setCustomerName("")
      setComment("")
      setRating(5)
      setMediaPreview("")
      setMediaFile(null)
      setShowWriteModal(false)
    }
  }

  const displayedReviews =
    filterMode === "media" ? reviews.filter((r) => Boolean(r.media_url)) : reviews

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
      : "5.0"

  const mediaReviews = reviews.filter((r) => Boolean(r.media_url))

  const scrollToSlide = (idx: number) => {
    setActiveSlideIndex(idx)
    if (sliderRef.current) {
      const cardWidth = 360
      sliderRef.current.scrollTo({
        left: idx * cardWidth,
        behavior: "smooth",
      })
    }
  }

  return (
    <div id="product-reviews" className="mt-14 pt-10 border-t border-zinc-100 scroll-mt-24">
      {/* SİZDEN GELENLER & TRENDYOL YILDIZLI / FOTOĞRAFLI & VİDEOLU MÜŞTERİ YORUMLARI (GÖRSEL 3 BİREBİR TASARIM) */}
      <div className="bg-[#f8f9fa] rounded-3xl px-4 sm:px-8 py-10 sm:py-12 border border-zinc-200/70 shadow-xs">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 uppercase">
            SİZDEN GELENLER
          </h2>
          <p
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: "italic" }}
            className="text-lg sm:text-2xl text-[#8d495a] font-semibold mt-1.5"
          >
            Memnuniyetiniz Bize Güç Veriyor!
          </p>

          {/* Star Summary Row */}
          <div className="flex items-center gap-2.5 mt-4">
            <div className="flex items-center gap-1 text-[#ff8a00]">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-lg font-black text-zinc-900">{averageRating} / 5</span>
          </div>

          <span className="text-xs font-medium text-zinc-400 mt-1">
            Toplam {reviews.length} gerçek müşteri değerlendirmesi
          </span>

          {/* Orange Gradient CTA Button (Görsel 3 Birebir) */}
          <button
            type="button"
            onClick={() => setShowWriteModal(true)}
            style={{
              background: "linear-gradient(90deg, #dc2626 0%, #ea580c 50%, #f97316 100%)",
            }}
            className="mt-5 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wide px-7 py-3.5 rounded-full shadow-lg hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            DEĞERLENDİRME YAP (YORUM &amp; PUAN EKLE)
          </button>

          {/* Trendyol Style Filter Pills (Tüm Yorumlar / Fotoğraflı & Videolu Yorumlar) */}
          {mediaReviews.length > 0 && (
            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterMode === "all"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                Tüm Değerlendirmeler ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("media")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === "media"
                    ? "bg-[#f27a1a] text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <span>📸</span>
                <span>Fotoğraflı / Videolu ({mediaReviews.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Cards Carousel (Görsel 3 Birebir Kart Yapısı) */}
        <div
          ref={sliderRef}
          onScroll={(e) => {
            const el = e.currentTarget
            const idx = Math.round(el.scrollLeft / 340)
            setActiveSlideIndex(idx)
          }}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {displayedReviews.map((rev, idx) => {
            const isVid = isVideoMedia(rev.media_url, rev.media_type)
            const starCount = Math.min(5, Math.max(1, Number(rev.rating || 5)))
            return (
              <div
                key={rev.id || idx}
                className="snap-start shrink-0 w-[300px] sm:w-[350px] bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
              >
                <div>
                  {/* Stars + Pill Badge */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex items-center gap-0.5 text-[#8d495a]">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < starCount ? "fill-[#8d495a] text-[#8d495a]" : "fill-zinc-200 text-zinc-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="bg-[#f8f0f2] text-[#8d495a] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                      {starCount.toFixed(1)} / 5
                    </span>
                    {rev.verified_purchase !== false && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Onaylı Alıcı
                      </span>
                    )}
                  </div>

                  {/* Customer Name & Optional Variant Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-base font-black text-zinc-900">{rev.customer_name}</h4>
                    {rev.color && rev.color !== "STANDART" && (
                      <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        {rev.color}
                      </span>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-[13.5px] text-zinc-600 leading-relaxed mb-4">
                    {rev.comment}
                  </p>
                </div>

                {/* Review Image or Video Box */}
                {rev.media_url && (
                  <div
                    onClick={() =>
                      setLightboxMedia({
                        url: rev.media_url!,
                        type: isVid ? "video" : "image",
                        author: rev.customer_name,
                        comment: rev.comment,
                        rating: starCount,
                      })
                    }
                    className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-100 cursor-pointer group mt-auto"
                  >
                    {isVid ? (
                      <>
                        <video
                          src={rev.media_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          muted
                          loop
                          playsInline
                          autoPlay
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="w-11 h-11 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-md font-bold text-sm">
                            ▶
                          </span>
                        </div>
                        <span className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          VİDEO YORUM
                        </span>
                      </>
                    ) : (
                      <img
                        src={rev.media_url}
                        alt={rev.customer_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Carousel Pagination Dots (Görsel 3 Birebir) */}
        {displayedReviews.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {displayedReviews.slice(0, 6).map((_, idx) => {
              const isAct = activeSlideIndex === idx
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToSlide(idx)}
                  aria-label={`${idx + 1}. yorum slaytı`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isAct ? "w-7 bg-[#8d495a]" : "w-2 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Product Summary Strip (Görsel 3 En Alt Kutu) */}
      <div className="mt-6 bg-white rounded-2xl border border-zinc-200 px-6 py-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-zinc-900 uppercase tracking-tight">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-[#ff8a00] text-xs">
              {"★★★★★"}
            </div>
            <span className="text-xs font-bold text-zinc-600">
              {averageRating} / 5 ({reviews.length} Değerlendirme)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWriteModal(true)}
          className="text-xs font-extrabold text-[#ea580c] hover:underline cursor-pointer self-start sm:self-center"
        >
          + Sen de Fotoğraflı / Videolu Yorum Ekle
        </button>
      </div>

      {/* YENİ YORUM EKLE MODAL (GÖRSEL 2 BİREBİR TASARIM) */}
      {showWriteModal && (
        <div
          style={{ zIndex: 99999 }}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 relative animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
              <h3 className="text-[15px] font-extrabold text-zinc-900">Yeni Yorum Ekle</h3>
              <button
                type="button"
                onClick={() => setShowWriteModal(false)}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              {/* MÜŞTERİ ADI */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  MÜŞTERİ ADI
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet A."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* ÜRÜN RENGİ (RENK SEÇİMİ) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  ÜRÜN RENGİ (RENK SEÇİMİ)
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-indigo-600"
                >
                  {productColors.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* YILDIZ PUANI (1-5) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  YILDIZ PUANI (1-5)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value={5}>5 Yıldız (Mükemmel)</option>
                  <option value={4}>4 Yıldız (Çok İyi)</option>
                  <option value={3}>3 Yıldız (Orta)</option>
                  <option value={2}>2 Yıldız (Geliştirilmeli)</option>
                  <option value={1}>1 Yıldız (Kötü)</option>
                </select>
              </div>

              {/* YORUM */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  YORUM
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Müşteri yorumu..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              {/* YORUM GÖRSELİ / VİDEOSU */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  YORUM GÖRSELİ / VİDEOSU
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
                    {mediaPreview ? (
                      mediaFile?.type.startsWith("video/") ? (
                        <video src={mediaPreview} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <img src={mediaPreview} alt="Önizleme" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-xl">📸</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span>Dosya Seç (Görsel/Video)</span>
                    </label>
                    {mediaPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPreview("")
                          setMediaFile(null)
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:underline text-left cursor-pointer"
                      >
                        Görseli/Videoyu Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
                  className="hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR PHOTO / VIDEO REVIEW */}
      {lightboxMedia && (
        <div
          style={{ zIndex: 99999 }}
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="relative bg-black aspect-[4/3] max-h-[65vh] flex items-center justify-center">
              {lightboxMedia.type === "video" ? (
                <video
                  src={lightboxMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={lightboxMedia.url}
                  alt={lightboxMedia.author}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white font-bold flex items-center justify-center hover:bg-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-zinc-900 text-sm">{lightboxMedia.author}</span>
                <span className="text-amber-500 font-bold text-xs">
                  {"★".repeat(lightboxMedia.rating)} ({lightboxMedia.rating}.0 / 5)
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{lightboxMedia.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductReviews
