import React, { useState, useEffect, useRef } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ComputerDesktop } from "@medusajs/icons"

interface Category {
  name: string
  handle: string
  icon: string
}

interface Banner {
  tag: string
  title: string
  description: string
  btn_text: string
  btn_link: string
  image_url: string
}

const defaultCategories: Category[] = [
  {
    name: "Jean Pantolon",
    handle: "jean-pantolon",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v18M15.75 3v18M8.25 8.25h7.5M8.25 15.75h7.5M3.75 5.25h16.5M3.75 18.75h16.5" /></svg>`,
  },
  {
    name: "Tayt",
    handle: "tayt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v18l3-4 3 4V3H9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 5.25h12M6 18.75h12" /></svg>`,
  },
  {
    name: "Sweat",
    handle: "sweat",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.25h13.5v15H5.25z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 5.25V3h6v2.25M9.75 10.5h4.5M9.75 14.25h4.5" /></svg>`,
  },
  {
    name: "Mont & Kürk",
    handle: "mont",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 5.25v15a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-15a3 3 0 0 0-3-3h-9a3 3 0 0 0-3 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25v19.5M8.25 7.5h7.5M8.25 11.25h7.5" /></svg>`,
  },
  {
    name: "Kombin",
    handle: "kombin",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18M3 12h18M6.75 6.75h10.5v10.5H6.75z" /></svg>`,
  },
]

const defaultBanners: Banner[] = [
  {
    tag: "Trend Koleksiyon",
    title: "PREMIUM JEAN KOLEKSİYONU",
    description: "En boy likralı kot taytlar ve yüksek bel toparlayıcı jean pantolonlar şimdi en popüler kesimleriyle vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/categories/jean-pantolon",
    image_url: "",
  },
  {
    tag: "Özel Seçki",
    title: "YAZ SEZONU KOMBİNLERİ",
    description: "Oysho modal kumaş şalvar takımlar ve çift şerit paraşüt kargo pantolonlar ile konforlu ve şık kombinler.",
    btn_text: "Şimdi İncele",
    btn_link: "/categories/kombin",
    image_url: "",
  },
]

const PREVIEW_IMG_1 =
  "data:image/jpeg;base64,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"

const PREVIEW_IMG_2 =
  "data:image/jpeg;base64,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"

const PREVIEW_IMG_3 =
  "data:image/jpeg;base64,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"

const PREVIEW_IMG_4 =
  "data:image/jpeg;base64,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"

type ThemeTabKey =
  | "theme"
  | "modules"
  | "image"
  | "seo"
  | "redirect301"
  | "page404"
  | "sitemap"
  | "upload"
  | "pages"
  | "help"
  | "sss"
  | "blog"
  | "headlines"
  | "banners"
  | "popup"
  | "story"

const VALID_THEME_TABS: ThemeTabKey[] = [
  "theme",
  "modules",
  "image",
  "seo",
  "redirect301",
  "page404",
  "sitemap",
  "upload",
  "pages",
  "help",
  "sss",
  "blog",
  "headlines",
  "banners",
  "popup",
  "story",
]

const HeroManagerPage = () => {
  const [activeTab, setActiveTab] = useState<ThemeTabKey>(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("tab") as ThemeTabKey | null
      if (t && VALID_THEME_TABS.includes(t)) return t
    }
    return "theme"
  })

  // Sync activeTab with URL ?tab=...
  useEffect(() => {
    const syncTabFromUrl = () => {
      const t = new URLSearchParams(window.location.search).get("tab") as ThemeTabKey | null
      if (t && VALID_THEME_TABS.includes(t)) {
        setActiveTab((prev) => (prev !== t ? t : prev))
      } else if (!t) {
        setActiveTab((prev) => (prev !== "theme" ? "theme" : prev))
      }
    }
    window.addEventListener("popstate", syncTabFromUrl)
    const timer = window.setInterval(syncTabFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      window.clearInterval(timer)
    }
  }, [])

  // Live Hero & Vitrin Config States (/admin/hero-config)
  const [showLiveHeroCustomizer, setShowLiveHeroCustomizer] = useState(false)
  const [tag, setTag] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [btnText, setBtnText] = useState("")
  const [btnLink, setBtnLink] = useState("")
  const [mediaType, setMediaType] = useState("image")
  const [mediaUrl, setMediaUrl] = useState("")
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [banners, setBanners] = useState<Banner[]>(defaultBanners)
  const [topAnnouncement, setTopAnnouncement] = useState("")
  const [topAnnouncementEnabled, setTopAnnouncementEnabled] = useState(true)
  const [topAnnouncementBg, setTopAnnouncementBg] = useState("#000000")
  const [topAnnouncementTextColor, setTopAnnouncementTextColor] = useState("#ffffff")
  const [scrollingTextHome, setScrollingTextHome] = useState("")
  const [scrollingTextHomeEnabled, setScrollingTextHomeEnabled] = useState(true)
  const [scrollingTextHomeBg, setScrollingTextHomeBg] = useState("#000000")
  const [scrollingTextHomeTextColor, setScrollingTextHomeTextColor] = useState("#ffffff")
  const [scrollingTextProduct, setScrollingTextProduct] = useState("")
  const [scrollingTextProductEnabled, setScrollingTextProductEnabled] = useState(true)
  const [scrollingTextProductBg, setScrollingTextProductBg] = useState("#FFD700")
  const [scrollingTextProductTextColor, setScrollingTextProductTextColor] = useState("#000000")
  const [buyNowEnabled, setBuyNowEnabled] = useState(true)
  const [buyNowBg, setBuyNowBg] = useState("#E50000")
  const [buyNowTextColor, setBuyNowTextColor] = useState("#ffffff")
  const [addToCartEnabled, setAddToCartEnabled] = useState(true)
  const [addToCartBg, setAddToCartBg] = useState("#000000")
  const [addToCartTextColor, setAddToCartTextColor] = useState("#ffffff")
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState("905323370081")
  const [whatsappBg, setWhatsappBg] = useState("#ffffff")
  const [whatsappTextColor, setWhatsappTextColor] = useState("#25D366")

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const cdnInputRef = useRef<HTMLInputElement>(null)
  const [cdnImages, setCdnImages] = useState<string[]>([
    PREVIEW_IMG_1,
    PREVIEW_IMG_2,
    PREVIEW_IMG_1,
    PREVIEW_IMG_1,
    PREVIEW_IMG_3,
    PREVIEW_IMG_4,
  ])

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/hero-config")
        const data = await res.json()
        if (data && data.config) {
          setTag(data.config.tag || "")
          setTitle(data.config.title || "")
          setSubtitle(data.config.subtitle || "")
          setBtnText(data.config.btn_text || "")
          setBtnLink(data.config.btn_link || "")
          setMediaType(data.config.media_type || "image")
          setMediaUrl(data.config.media_url || "")
          setCategories(data.config.categories || defaultCategories)
          setBanners(data.config.banners || defaultBanners)
          setTopAnnouncement(data.config.top_announcement || "")
          setTopAnnouncementEnabled(data.config.top_announcement_enabled ?? true)
          setTopAnnouncementBg(data.config.top_announcement_bg || "#000000")
          setTopAnnouncementTextColor(data.config.top_announcement_text_color || "#ffffff")
          setScrollingTextHome(data.config.scrolling_text_home || "")
          setScrollingTextHomeEnabled(data.config.scrolling_text_home_enabled ?? true)
          setScrollingTextHomeBg(data.config.scrolling_text_home_bg || "#000000")
          setScrollingTextHomeTextColor(data.config.scrolling_text_home_text_color || "#ffffff")
          setScrollingTextProduct(data.config.scrolling_text_product || "")
          setScrollingTextProductEnabled(data.config.scrolling_text_product_enabled ?? true)
          setScrollingTextProductBg(data.config.scrolling_text_product_bg || "#FFD700")
          setScrollingTextProductTextColor(data.config.scrolling_text_product_text_color || "#000000")
          setBuyNowEnabled(data.config.buy_now_enabled ?? true)
          setBuyNowBg(data.config.buy_now_bg || "#E50000")
          setBuyNowTextColor(data.config.buy_now_text_color || "#ffffff")
          setAddToCartEnabled(data.config.add_to_cart_enabled ?? true)
          setAddToCartBg(data.config.add_to_cart_bg || "#000000")
          setAddToCartTextColor(data.config.add_to_cart_text_color || "#ffffff")
          setWhatsappEnabled(data.config.whatsapp_enabled ?? true)
          setWhatsappNumber(data.config.whatsapp_number || "905323370081")
          setWhatsappBg(data.config.whatsapp_bg || "#ffffff")
          setWhatsappTextColor(data.config.whatsapp_text_color || "#25D366")
        }
      } catch (err) {
        console.error("Failed to load hero configuration:", err)
      }
    }
    fetchConfig()
  }, [])

  const handleSaveHeroConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setToastMessage("")
    try {
      const res = await fetch("/admin/hero-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag,
          title,
          subtitle,
          btn_text: btnText,
          btn_link: btnLink,
          media_type: mediaType,
          media_url: mediaUrl,
          categories,
          banners,
          top_announcement: topAnnouncement,
          top_announcement_enabled: topAnnouncementEnabled,
          top_announcement_bg: topAnnouncementBg,
          top_announcement_text_color: topAnnouncementTextColor,
          scrolling_text_home: scrollingTextHome,
          scrolling_text_home_enabled: scrollingTextHomeEnabled,
          scrolling_text_home_bg: scrollingTextHomeBg,
          scrolling_text_home_text_color: scrollingTextHomeTextColor,
          scrolling_text_product: scrollingTextProduct,
          scrolling_text_product_enabled: scrollingTextProductEnabled,
          scrolling_text_product_bg: scrollingTextProductBg,
          scrolling_text_product_text_color: scrollingTextProductTextColor,
          buy_now_enabled: buyNowEnabled,
          buy_now_bg: buyNowBg,
          buy_now_text_color: buyNowTextColor,
          add_to_cart_enabled: addToCartEnabled,
          add_to_cart_bg: addToCartBg,
          add_to_cart_text_color: addToCartTextColor,
          whatsapp_enabled: whatsappEnabled,
          whatsapp_number: whatsappNumber,
          whatsapp_bg: whatsappBg,
          whatsapp_text_color: whatsappTextColor,
        }),
      })
      const data = await res.json()
      if (data && data.success) {
        setToastMessage("Vitrin, Kategori ve Kampanya ayarları başarıyla güncellendi! ✔")
        setTimeout(() => setToastMessage(""), 4000)
      } else {
        alert("Ayarlar kaydedilirken bir hata oluştu.")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      alert("Sunucuyla bağlantı kurulamadı.")
    } finally {
      setSaving(false)
    }
  }

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "hero" | "cdn") => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    if (target === "hero") {
      if (file.type.startsWith("video/")) setMediaType("video")
      else if (file.type.startsWith("image/")) setMediaType("image")
    }
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch("/admin/hero-config/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            base64,
          }),
        })
        const data = await res.json()
        if (data && data.success) {
          if (target === "hero") {
            setMediaUrl(data.url)
          } else {
            setCdnImages((prev) => [data.url, ...prev])
          }
          setToastMessage("Görsel başarıyla yüklendi: " + data.url)
          setTimeout(() => setToastMessage(""), 4000)
        } else {
          alert("Dosya yüklenirken hata oluştu: " + (data.message || "Bilinmeyen hata"))
        }
      } catch (err) {
        console.error("Upload error:", err)
        alert("Dosya yüklenirken bağlantı hatası oluştu.")
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <section id="theme-view-section" className="w-full bg-[#f2f3f8] min-h-screen pb-16">
      {toastMessage && (
        <div className="max-w-[1260px] mx-auto px-5 pt-4">
          <div className="p-3.5 rounded-[4px] bg-[#e0f6e7] border border-[#0abb87] text-[#08976d] text-[13px] font-bold flex items-center justify-between">
            <span>{toastMessage}</span>
            <button type="button" onClick={() => setToastMessage("")} className="text-[12px] underline cursor-pointer">
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* 1. TEMALAR (/admin/store/theme - .selected-theme-v2 & .theme-list-v2) */}
      {activeTab === "theme" && (
        <div id="subview-theme-theme" className="theme-subview max-w-[1260px] w-full mx-auto px-5 py-7">
          {/* .selected-theme-v2 */}
          <div className="bg-white rounded-[8px] border border-[#ebedf2] p-[30px] mb-[30px] shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f6e7] text-[#08976d] text-[12px] font-bold mb-3">
                <span>✓</span> Aktif Mağaza Teması
              </div>
              <div className="text-[28px] font-bold text-[#0abb87] leading-tight">EntegreShop Pro V5.2</div>
              <p className="text-[14px] text-[#74788d] mt-2 mb-6 leading-relaxed">
                Yüksek dönüşüm odaklı, %100 mobil uyumlu (Responsive), Google Core Web Vitals &amp; Rocket Cache hız optimizasyonlu yeni nesil e-ticaret teması.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                <button
                  type="button"
                  onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                  className="p-[14px] rounded-[5px] border border-[#e6e6e6] bg-[#f8f9fb] hover:bg-[#eef4ff] hover:border-[#3d94fb] text-left text-[13px] font-semibold text-[#48465b] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-[16px]">🎨</span>
                  <span>Renkler &amp; Görünüm Ayarları</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                  className="p-[14px] rounded-[5px] border border-[#e6e6e6] bg-[#f8f9fb] hover:bg-[#eef4ff] hover:border-[#3d94fb] text-left text-[13px] font-semibold text-[#48465b] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-[16px]">🔤</span>
                  <span>Yazı Tipleri (Fontlar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                  className="p-[14px] rounded-[5px] border border-[#e6e6e6] bg-[#f8f9fb] hover:bg-[#eef4ff] hover:border-[#3d94fb] text-left text-[13px] font-semibold text-[#48465b] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-[16px]">🔝</span>
                  <span>Üst Alan (Header) Tasarımı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                  className="p-[14px] rounded-[5px] border border-[#e6e6e6] bg-[#f8f9fb] hover:bg-[#eef4ff] hover:border-[#3d94fb] text-left text-[13px] font-semibold text-[#48465b] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-[16px]">🔻</span>
                  <span>Alt Alan (Footer) Tasarımı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                  className="p-[14px] rounded-[5px] border border-[#e6e6e6] bg-[#f8f9fb] hover:bg-[#eef4ff] hover:border-[#3d94fb] text-left text-[13px] font-semibold text-[#48465b] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-[16px]">🛍️</span>
                  <span>Ürün Kartı &amp; Liste Görünümü</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                  className="p-[14px] rounded-[5px] border border-[#e6e6e6] bg-[#f8f9fb] hover:bg-[#eef4ff] hover:border-[#3d94fb] text-left text-[13px] font-semibold text-[#48465b] flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span className="text-[16px]">&lt;/&gt;</span>
                  <span>Özel CSS / JS Düzenleyici</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-[10px] border border-[#e6e6e6] bg-[#f8fafc] p-4 shadow-inner">
                <div className="bg-white rounded-[6px] border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <span className="font-mono text-slate-300">Canlı Tema Önizleme (Masaüstü &amp; Mobil)</span>
                    <span className="text-emerald-400 font-bold">100/100 Hız</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <div className="text-[15px] font-extrabold text-slate-900 tracking-tight">EntegreShop</div>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                        <span>YENİ GELENLER</span>
                        <span>KATEGORİLER</span>
                        <span>KAMPANYALAR</span>
                        <span className="px-2 py-0.5 rounded bg-[#0abb87] text-white">SEPET (2)</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <img src={PREVIEW_IMG_1} alt="Önizleme 1" className="w-full h-28 object-cover rounded border border-slate-200" />
                      <img src={PREVIEW_IMG_2} alt="Önizleme 2" className="w-full h-28 object-cover rounded border border-slate-200" />
                      <img src={PREVIEW_IMG_1} alt="Önizleme 3" className="w-full h-28 object-cover rounded border border-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showLiveHeroCustomizer && (
            <form onSubmit={handleSaveHeroConfig} className="bg-white rounded-[8px] border border-[#3d94fb] p-[25px] mb-[30px] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebedf2]">
                <div>
                  <h4 className="text-[16px] font-bold text-[#48465b]">Canlı Vitrin, Kayan Yazı &amp; Satın Alma Butonları Özelleştirme</h4>
                  <p className="text-[12.5px] text-[#74788d]">Değişiklikleriniz canlı mağaza vitrinine (/admin/hero-config) anında yansır.</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[36px] px-5 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-semibold cursor-pointer"
                >
                  {saving ? "Kaydediliyor..." : "✓ Değişiklikleri Kaydet"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">1. Tepe Duyuru Metni</label>
                  <input
                    type="text"
                    value={topAnnouncement}
                    onChange={(e) => setTopAnnouncement(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">2. Ana Sayfa Kayan Yazı</label>
                  <input
                    type="text"
                    value={scrollingTextHome}
                    onChange={(e) => setScrollingTextHome(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">3. Ürün Detay Kayan Yazı</label>
                  <input
                    type="text"
                    value={scrollingTextProduct}
                    onChange={(e) => setScrollingTextProduct(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Hemen Al Butonu Rengi</label>
                  <input
                    type="text"
                    value={buyNowBg}
                    onChange={(e) => setBuyNowBg(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Sepete Ekle Butonu Rengi</label>
                  <input
                    type="text"
                    value={addToCartBg}
                    onChange={(e) => setAddToCartBg(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">WhatsApp Sipariş Hattı</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] font-mono"
                  />
                </div>
              </div>
            </form>
          )}

          {/* .theme-list-v2 */}
          <h3 className="text-[16px] font-bold text-[#48465b] mb-4">Hazır Tema Kütüphanesi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-[8px] border-2 border-[#0abb87] p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-[6px] overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                  <img src={PREVIEW_IMG_1} alt="EntegreShop Pro V5.2" className="w-full h-full object-cover" />
                </div>
                <div className="text-[14.5px] font-bold text-[#1e293b]">EntegreShop Pro V5.2</div>
                <div className="text-[12px] text-[#74788d] mt-0.5 mb-4">Genel &amp; Çok Amaçlı</div>
              </div>
              <button type="button" className="w-full h-[34px] rounded-[4px] bg-[#e0f6e7] text-[#08976d] text-[12.5px] font-bold cursor-default">
                ✓ Etkin Tema
              </button>
            </div>

            <div className="bg-white rounded-[8px] border border-[#ebedf2] p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-[6px] overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                  <img src={PREVIEW_IMG_2} alt="Moda & Butik Luxury V5" className="w-full h-full object-cover" />
                </div>
                <div className="text-[14.5px] font-bold text-[#1e293b]">Moda &amp; Butik Luxury V5</div>
                <div className="text-[12px] text-[#74788d] mt-0.5 mb-4">Kadın / Erkek Giyim &amp; Tekstil</div>
              </div>
              <button
                type="button"
                onClick={() => alert("Moda & Butik Luxury V5 teması aktif edildi!")}
                className="w-full h-[34px] rounded-[4px] bg-[#3d94fb] hover:bg-[#2b82ec] text-white text-[12.5px] font-semibold cursor-pointer"
              >
                Temayı Etkinleştir
              </button>
            </div>

            <div className="bg-white rounded-[8px] border border-[#ebedf2] p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-[6px] overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                  <img src={PREVIEW_IMG_1} alt="AutoParts & Bodykit Pro" className="w-full h-full object-cover" />
                </div>
                <div className="text-[14.5px] font-bold text-[#1e293b]">AutoParts &amp; Bodykit Pro</div>
                <div className="text-[12px] text-[#74788d] mt-0.5 mb-4">Otomotiv &amp; Yedek Parça</div>
              </div>
              <button
                type="button"
                onClick={() => alert("AutoParts & Bodykit Pro teması aktif edildi!")}
                className="w-full h-[34px] rounded-[4px] bg-[#3d94fb] hover:bg-[#2b82ec] text-white text-[12.5px] font-semibold cursor-pointer"
              >
                Temayı Etkinleştir
              </button>
            </div>

            <div className="bg-white rounded-[8px] border border-[#ebedf2] p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="h-44 rounded-[6px] overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                  <img src={PREVIEW_IMG_3} alt="MegaStore Elektronik V5" className="w-full h-full object-cover" />
                </div>
                <div className="text-[14.5px] font-bold text-[#1e293b]">MegaStore Elektronik V5</div>
                <div className="text-[12px] text-[#74788d] mt-0.5 mb-4">Teknoloji &amp; Yapı Market</div>
              </div>
              <button
                type="button"
                onClick={() => alert("MegaStore Elektronik V5 teması aktif edildi!")}
                className="w-full h-[34px] rounded-[4px] bg-[#3d94fb] hover:bg-[#2b82ec] text-white text-[12.5px] font-semibold cursor-pointer"
              >
                Temayı Etkinleştir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BLOK YÖNETİMİ (/admin/store/modules - .pattern-modules & .pattern-module-groups) */}
      {activeTab === "modules" && (
        <div id="subview-theme-modules" className="theme-subview max-w-[1260px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[6px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-[#ebedf2]">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Blok Yönetimi (Sürükle &amp; Bırak Sayfa Düzeni)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Ana sayfa, ürün detay ve kategori sayfalarındaki modül bloklarının sırasını ve genişliklerini yönetebilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select id="modules-theme-id" className="h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px] font-medium">
                  <option>Sayfa: Ana Sayfa Şablonu</option>
                  <option>Sayfa: Ürün Detay Şablonu</option>
                  <option>Sayfa: Kategori Listeleme Şablonu</option>
                  <option>Sayfa: Sepet &amp; Ödeme Şablonu</option>
                </select>
                <button
                  type="button"
                  onClick={() => alert("Yeni Blok Grubu eklendi!")}
                  className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
                >
                  + Yeni Blok Satırı Ekle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Available Modules (.pattern-modules) */}
              <div className="lg:col-span-4 border border-[#e6e8f2] rounded-[4px] p-4 bg-[#fafbfe]">
                <div className="text-[13.5px] font-bold text-[#48465b] mb-3">Eklenebilir Modül Blokları</div>
                <div className="space-y-2">
                  {[
                    { name: "☰ Yuvarlak Story (Hikayeler) Barı", badge: "Story" },
                    { name: "☰ Ana Manşet Slider (Tam Genişlik)", badge: "Slider" },
                    { name: "☰ 3'lü Kampanya Vitrin Banner", badge: "Banner" },
                    { name: "☰ Çok Satan Ürünler Karuseli", badge: "Ürünler" },
                    { name: "☰ Yeni Eklenen Ürünler Vitrini", badge: "Ürünler" },
                    { name: "☰ Hızlı İndirim / Fırsat Sayacı", badge: "Kampanya" },
                    { name: "☰ Popüler Kategoriler Grid", badge: "Kategori" },
                    { name: "☰ Müşteri Yorumları & Güvence İkonları", badge: "Güven" },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="bg-[#e8edf7] border border-[#cad2e3] rounded-[4px] px-3.5 py-2.5 flex items-center justify-between text-[12.5px] font-semibold text-[#1e293b] cursor-move"
                    >
                      <span>{m.name}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-[#3d94fb] text-[11px] font-bold">{m.badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Active Page Layout (.pattern-module-groups) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="border border-dashed border-[#cccccc] rounded-[4px] p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#eef1f8] text-[#48465b] text-[12px] font-bold">
                        1. Satır — Üst Hikayeler &amp; Geniş Manşet Alanı
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#f0f3ff] text-[#3d94fb] text-[11px] font-semibold">Tam Genişlik (12 Sütun)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="h-[26px] px-2.5 rounded border border-slate-200 text-[11.5px] font-semibold text-slate-600 cursor-pointer">
                        + Sütun
                      </button>
                      <button type="button" className="w-[26px] h-[26px] rounded bg-red-50 text-red-600 text-[12px] cursor-pointer">
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Yuvarlak Story (Hikayeler) Barı</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Ana Manşet Slider (Masaüstü + Mobil)</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="border border-dashed border-[#cccccc] rounded-[4px] p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#eef1f8] text-[#48465b] text-[12px] font-bold">
                        2. Satır — 3'lü Kategori &amp; Kampanya Bannerları
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#f0f3ff] text-[#3d94fb] text-[11px] font-semibold">Kutu İçi (Container)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="h-[26px] px-2.5 rounded border border-slate-200 text-[11.5px] font-semibold text-slate-600 cursor-pointer">
                        + Sütun
                      </button>
                      <button type="button" className="w-[26px] h-[26px] rounded bg-red-50 text-red-600 text-[12px] cursor-pointer">
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Sol Banner (4 Sütun)</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Orta Banner (4 Sütun)</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Sağ Banner (4 Sütun)</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="border border-dashed border-[#cccccc] rounded-[4px] p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#eef1f8] text-[#48465b] text-[12px] font-bold">3. Satır — Vitrin &amp; Çok Satan Ürünler</span>
                      <span className="px-2.5 py-1 rounded bg-[#f0f3ff] text-[#3d94fb] text-[11px] font-semibold">Kutu İçi (Container)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="h-[26px] px-2.5 rounded border border-slate-200 text-[11.5px] font-semibold text-slate-600 cursor-pointer">
                        + Sütun
                      </button>
                      <button type="button" className="w-[26px] h-[26px] rounded bg-red-50 text-red-600 text-[12px] cursor-pointer">
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Çok Satan Ürünler (12 Sütun - 4'lü Dizilim)</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="border border-dashed border-[#cccccc] rounded-[4px] p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#eef1f8] text-[#48465b] text-[12px] font-bold">
                        4. Satır — Yeni Gelenler &amp; Mağaza Güvence Şeridi
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#f0f3ff] text-[#3d94fb] text-[11px] font-semibold">Kutu İçi (Container)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="h-[26px] px-2.5 rounded border border-slate-200 text-[11.5px] font-semibold text-slate-600 cursor-pointer">
                        + Sütun
                      </button>
                      <button type="button" className="w-[26px] h-[26px] rounded bg-red-50 text-red-600 text-[12px] cursor-pointer">
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Yeni Eklenen Ürünler Vitrini</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                    <div className="border border-dashed border-[#cad2e3] rounded-[4px] p-3 bg-[#f8fafc] flex items-center justify-between text-[12.5px] font-semibold text-[#334155]">
                      <span>Güvenli Alışveriş &amp; Hızlı Kargo İkonları</span>
                      <span className="text-[#0abb87] text-[11px] font-bold">✓ Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => alert("Sayfa blok düzeni kaydedildi!")}
                    className="h-[38px] px-6 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-bold cursor-pointer"
                  >
                    ✓ Blok Düzenini Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GÖRSEL OPTİMİZASYONU (/admin/store/image) */}
      {activeTab === "image" && (
        <div id="subview-theme-image" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[6px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#ebedf2]">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Görsel Optimizasyonu &amp; WebP Dönüştürücü</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Ürün, kategori ve banner görsellerinizi otomatik WebP formatına dönüştürerek sayfa açılış hızınızı %60'a kadar artırın.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Mevcut tüm görseller için WebP optimizasyon kuyruğu başlatıldı!")}
                className="h-[38px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer"
              >
                ⚡ Tüm Görselleri Şimdi Optimize Et
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-[13px] text-[#48465b] mb-2">Otomatik WebP Dönüşümü</label>
                <select defaultValue="aktif" className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px]">
                  <option value="aktif">Aktif (Önerilen - Google PageSpeed Uyumlu)</option>
                  <option value="pasif">Pasif (Orijinal JPG/PNG Kalsın)</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-[#48465b] mb-2">Görsel Sıkıştırma Kalitesi (%)</label>
                <input type="number" defaultValue={85} className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]" />
              </div>
              <div>
                <label className="block text-[13px] text-[#48465b] mb-2">Lazy Load (Geç Yükleme)</label>
                <select defaultValue="aktif" className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px]">
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-[#48465b] mb-2">Küçük Ürün Görseli (Thumbnail) Ölçüsü</label>
                <input type="text" defaultValue="300 x 450 px" className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]" />
              </div>
              <div>
                <label className="block text-[13px] text-[#48465b] mb-2">Orta Ürün Görseli (Liste) Ölçüsü</label>
                <input type="text" defaultValue="600 x 900 px" className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]" />
              </div>
              <div>
                <label className="block text-[13px] text-[#48465b] mb-2">Büyük Ürün Görseli (Zoom) Ölçüsü</label>
                <input type="text" defaultValue="1200 x 1800 px" className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert("Görsel optimizasyon ayarları kaydedildi!")}
              className="h-[38px] px-5 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
            >
              ✓ Ayarları Kaydet
            </button>
          </div>
        </div>
      )}

      {/* 4. SEO OPTİMİZASYONU (/admin/store/seo - seoSettingsTable) */}
      {activeTab === "seo" && (
        <div id="subview-theme-seo" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="mb-5">
              <h3 className="text-[18px] font-medium text-[#48465b]">SEO Optimizasyonu (Varsayılan Sayfa Meta Ayarları)</h3>
              <p className="text-[13px] text-[#74788d] mt-1">
                Sistemdeki sabit sayfaların SEO başlık (Title) ve açıklama (Description) şablonlarını düzenleyebilirsiniz.
              </p>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[190px]">Sayfa Adı</th>
                  <th className="py-3 px-3">SEO Başlığı</th>
                  <th className="py-3 px-3">SEO Açıklama</th>
                  <th className="py-3 px-3 w-[90px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                {[
                  {
                    page: "Ana Sayfa",
                    title: "Kombingo | Kadın Giyim, Elbise, Takım ve Yeni Sezon Kombinler",
                    desc: "Yeni sezon kadın giyim, elbise, ikili takım ve şık kombin modelleri.",
                  },
                  {
                    page: "Yeni Ürünler",
                    title: "Yeni Gelen Ürünler | Kombingo",
                    desc: "En yeni sezon ürünleri ve güncel stoklarımızı hemen inceleyin.",
                  },
                  {
                    page: "İndirimdeki Ürünler",
                    title: "Fırsat & İndirimli Ürünler | Kombingo",
                    desc: "Kampanyalı ve özel indirimli ürünleri kaçırmayın.",
                  },
                  {
                    page: "Çok Satan Ürünler",
                    title: "En Çok Satanlar | Kombingo",
                    desc: "Müşterilerimizin en çok tercih ettiği popüler ürünler.",
                  },
                  {
                    page: "İletişim Sayfası",
                    title: "İletişim & Mağaza Adresimiz | Kombingo",
                    desc: "Bize ulaşın, adres, telefon ve WhatsApp destek hattımız.",
                  },
                  {
                    page: "Blog Ana Sayfa",
                    title: "Blog & Rehber Yazıları | Kombingo",
                    desc: "Modifiye, bakım ve stil önerileri hakkında güncel blog yazıları.",
                  },
                ].map((r) => (
                  <tr key={r.page}>
                    <td className="py-3 px-3 font-bold">{r.page}</td>
                    <td className="py-3 px-3">{r.title}</td>
                    <td className="py-3 px-3 text-[#74788d]">{r.desc}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`${r.page} SEO düzenleme ekranı`)}
                        className="w-[30px] h-[30px] rounded-[4px] bg-[#9b59b6] text-white inline-flex items-center justify-center text-[12px] cursor-pointer"
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. 301 YÖNLENDİRMELERİ (/admin/store/redirect301 - linksTable) */}
      {activeTab === "redirect301" && (
        <div id="subview-theme-redirect301" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">301 Yönlendirmeleri</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Değişen ürün veya kategori URL adreslerinizi SEO değerini kaybetmeden yeni adreslerine yönlendirebilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("Yeni 301 Yönlendirmesi ekleme modalı")}
                  className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
                >
                  + Yeni Yönlendirme
                </button>
                <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer">
                  📊 Excel İşlemleri
                </button>
              </div>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[40px] text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3">Link (Eski URL)</th>
                  <th className="py-3 px-3">Yönlendirme Linki (Yeni URL)</th>
                  <th className="py-3 px-3 w-[120px]">Tip</th>
                  <th className="py-3 px-3 w-[100px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                {[
                  { no: 104, oldUrl: "/eski-sezon-urunler", newUrl: "/yeni-urunler" },
                  { no: 103, oldUrl: "/kampanya-2025", newUrl: "/kampanyalar" },
                  { no: 102, oldUrl: "/iletisim.html", newUrl: "/iletisim" },
                ].map((r) => (
                  <tr key={r.no}>
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="py-3 px-3">{r.no}</td>
                    <td className="py-3 px-3 font-mono text-[12px] text-red-600">{r.oldUrl}</td>
                    <td className="py-3 px-3 font-mono text-[12px] text-[#0abb87]">{r.newUrl}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1565c0] text-[11.5px] font-semibold">301 (Kalıcı)</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#9b59b6] text-white text-[12px] cursor-pointer">
                        👁
                      </button>
                      <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#e74c3c] text-white text-[12px] cursor-pointer ml-1">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. 404 KIRIK LİNKLER (/admin/store/page404 - links404Table) */}
      {activeTab === "page404" && (
        <div id="subview-theme-page404" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">404 Kırık Linkler</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Ziyaretçilerin veya arama motoru botlarının karşılaştığı 404 bulunamayan sayfaları tek tıkla 301 yönlendirmesine dönüştürebilirsiniz.
                </p>
              </div>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[40px] text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="py-3 px-3 w-[65px]">No</th>
                  <th className="py-3 px-3">Link</th>
                  <th className="py-3 px-3 w-[110px]">Ziyaret Sayısı</th>
                  <th className="py-3 px-3">İlk Ziyaret Tarihi</th>
                  <th className="py-3 px-3">Son Ziyaret Tarihi</th>
                  <th className="py-3 px-3 w-[175px]">Yönlendirme</th>
                  <th className="py-3 px-3 w-[70px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                <tr>
                  <td className="py-3 px-3 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="py-3 px-3">41</td>
                  <td className="py-3 px-3 font-mono text-[12px]">/urun/eski-model-on-tampon-eki</td>
                  <td className="py-3 px-3 font-bold">28</td>
                  <td className="py-3 px-3 text-[12px]">
                    10.11.2026 14:12<div className="text-[#74788d]">88.241.19.104</div>
                  </td>
                  <td className="py-3 px-3 text-[12px]">
                    13.11.2026 09:45<div className="text-[#74788d]">88.241.19.104</div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => alert("/urun/eski-model-on-tampon-eki için 301 Yönlendirmesi oluşturuldu!")}
                      className="h-[28px] px-2.5 rounded-[4px] bg-[#0abb87] text-white text-[11.5px] font-medium cursor-pointer"
                    >
                      + Yönlendirme Oluştur
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#e74c3c] text-white text-[12px] cursor-pointer">
                      🗑
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="py-3 px-3">40</td>
                  <td className="py-3 px-3 font-mono text-[12px]">/kategori/kis-koleksiyonu-2024</td>
                  <td className="py-3 px-3 font-bold">14</td>
                  <td className="py-3 px-3 text-[12px]">
                    08.11.2026 11:05<div className="text-[#74788d]">176.88.42.11</div>
                  </td>
                  <td className="py-3 px-3 text-[12px]">
                    12.11.2026 21:18<div className="text-[#74788d]">176.88.42.11</div>
                  </td>
                  <td className="py-3 px-3">
                    <button type="button" className="h-[28px] px-2.5 rounded-[4px] bg-[#3d94fb] text-white text-[11.5px] font-medium cursor-pointer">
                      Yönlendirmeyi Görüntüle
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#e74c3c] text-white text-[12px] cursor-pointer">
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SITEMAP (/admin/store/sitemap) */}
      {activeTab === "sitemap" && (
        <div id="subview-theme-sitemap" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">XML Sitemap (Site Haritası) Yönetimi</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Google, Yandex ve Bing arama motorları için otomatik oluşturulan site haritası adresleriniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Tüm XML Sitemap dosyaları yeniden oluşturuldu!")}
                className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
              >
                🔄 Sitemap Dosyalarını Şimdi Güncelle
              </button>
            </div>
            <div className="divide-y divide-[#ebedf2] text-[13px]">
              {[
                { name: "Ana Sitemap İndeksi", url: "https://kombingo.com/sitemap.xml", count: "Tüm Alt Haritalar" },
                { name: "Ürünler Sitemap", url: "https://kombingo.com/sitemap-products-1.xml", count: "1.420 Ürün URL" },
                { name: "Kategoriler Sitemap", url: "https://kombingo.com/sitemap-categories.xml", count: "48 Kategori URL" },
                { name: "Sayfalar Sitemap", url: "https://kombingo.com/sitemap-pages.xml", count: "12 Sayfa URL" },
                { name: "Blog Yazıları Sitemap", url: "https://kombingo.com/sitemap-blog.xml", count: "24 Blog URL" },
              ].map((s) => (
                <div key={s.url} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[#48465b]">{s.name}</div>
                    <div className="font-mono text-[12px] text-[#3d94fb] mt-0.5">{s.url}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[12px] font-semibold">{s.count}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(s.url)
                        alert("Link kopyalandı!")
                      }}
                      className="h-[30px] px-3 rounded border border-slate-300 bg-white hover:bg-slate-50 text-[12px] font-semibold cursor-pointer"
                    >
                      📋 Linki Kopyala
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. GÖRSEL YÜKLE (/admin/store/upload-image - .lag-banner-uploader) */}
      {activeTab === "upload" && (
        <div id="subview-theme-upload" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <h3 className="text-[18px] font-medium text-[#48465b] mb-2">Görsel Yükle (CDN Medya Kütüphanesi)</h3>
            <p className="text-[13px] text-[#74788d] mb-5">
              Açıklama alanlarında, özel HTML bloklarında veya pazaryeri şablonlarında kullanmak üzere görsel yükleyip direkt link alabilirsiniz.
            </p>
            <input
              ref={cdnInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleHeroFileUpload(e, "cdn")}
              className="hidden"
            />
            <div
              onClick={() => cdnInputRef.current?.click()}
              className="border-2 border-dashed border-[#3d94fb] rounded-[8px] bg-[#f8faff] p-10 text-center cursor-pointer hover:bg-[#eef4ff] transition mb-6"
            >
              <div className="text-[32px] mb-2">☁️</div>
              <div className="text-[15px] font-bold text-[#1e293b]">
                {uploading ? "Görsel Yükleniyor..." : "Görselleri buraya sürükleyin veya bilgisayarınızdan seçmek için tıklayın"}
              </div>
              <div className="text-[12px] text-[#74788d] mt-1">PNG, JPG, WEBP, SVG veya GIF (Maks. 10 MB)</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {cdnImages.map((imgUrl, idx) => (
                <div key={idx} className="border border-[#ebedf2] rounded-[6px] p-2 bg-white">
                  <img src={imgUrl} alt={`CDN ${idx + 1}`} className="w-full h-28 object-cover rounded mb-2" />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(imgUrl)
                      alert("CDN Görsel Linki Kopyalandı!")
                    }}
                    className="w-full h-[28px] rounded bg-[#f0f3ff] hover:bg-[#3d94fb] hover:text-white text-[#3d94fb] text-[11.5px] font-semibold transition cursor-pointer"
                  >
                    📋 URL Kopyala
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. SAYFALAR (/admin/store/pages - pagesTable) */}
      {activeTab === "pages" && (
        <div id="subview-theme-pages" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Sayfalar (Kurumsal İçerik Sayfaları)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Hakkımızda, Banka Hesaplarımız, Kargo &amp; Teslimat gibi bilgi sayfalarını yönetebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Yeni Sayfa Oluşturma editörü")}
                className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
              >
                + Yeni Sayfa
              </button>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[40px] text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3">Başlık</th>
                  <th className="py-3 px-3 text-center">Durum</th>
                  <th className="py-3 px-3 text-center">Listede Göster</th>
                  <th className="py-3 px-3 text-center">Özel Kodlar</th>
                  <th className="py-3 px-3 w-[80px]">Sıra</th>
                  <th className="py-3 px-3 w-[125px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                {[
                  { no: 1, title: "Hakkımızda & Kurumsal Bilgiler", order: 1 },
                  { no: 2, title: "Banka Hesap Numaralarımız (Havale / EFT)", order: 2 },
                  { no: 3, title: "Kargo, Teslimat ve Montaj Hizmetlerimiz", order: 3 },
                  { no: 4, title: "İptal, İade ve Değişim Şartları", order: 4 },
                  { no: 5, title: "Gizlilik ve Güvenlik Politikası", order: 5 },
                ].map((p) => (
                  <tr key={p.no}>
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="py-3 px-3">{p.no}</td>
                    <td className="py-3 px-3 font-semibold">{p.title}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                        ✓
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                        ✓
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#282a3c] text-[#282a3c] items-center justify-center text-[11px] font-bold">
                        ✕
                      </span>
                    </td>
                    <td className="py-3 px-3">{p.order}</td>
                    <td className="py-3 px-3 text-right">
                      <button type="button" className="w-[28px] h-[28px] rounded-[4px] bg-[#9b59b6] text-white text-[12px] cursor-pointer">
                        👁
                      </button>
                      <button type="button" className="w-[28px] h-[28px] rounded-[4px] border border-slate-200 bg-white text-[12px] cursor-pointer ml-1">
                        🔗
                      </button>
                      <button type="button" className="w-[28px] h-[28px] rounded-[4px] bg-[#e74c3c] text-white text-[12px] cursor-pointer ml-1">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. YARDIM İÇERİKLERİ (/admin/store/help - helpTitlesTable) */}
      {activeTab === "help" && (
        <div id="subview-theme-help" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Yardım İçerikleri (Müşteri Destek Rehberi)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Müşteri yardım merkezinde yer alan kategori başlıklarını ve rehber maddelerini yönetebilirsiniz.
                </p>
              </div>
              <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer">
                + Yeni Yardım Başlığı
              </button>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3">Başlık</th>
                  <th className="py-3 px-3">Kısa Başlık</th>
                  <th className="py-3 px-3 text-center">Durum</th>
                  <th className="py-3 px-3 w-[80px]">Sıra</th>
                  <th className="py-3 px-3 w-[110px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                <tr>
                  <td className="py-3 px-3">1</td>
                  <td className="py-3 px-3 font-semibold">Sipariş ve Teslimat Süreçleri</td>
                  <td className="py-3 px-3">Sipariş &amp; Kargo</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3">1</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">2</td>
                  <td className="py-3 px-3 font-semibold">Ödeme, Taksit ve Güvenlik</td>
                  <td className="py-3 px-3">Ödeme İşlemleri</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3">2</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">3</td>
                  <td className="py-3 px-3 font-semibold">İade, Değişim ve Garanti Koşulları</td>
                  <td className="py-3 px-3">İade &amp; Değişim</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3">3</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. SIKÇA SORULAN SORULAR (/admin/store/sss - FAQTable) */}
      {activeTab === "sss" && (
        <div id="subview-theme-sss" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Sıkça Sorulan Sorular (S.S.S.)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Müşterilerinizin en sık yönelttiği soruları ve cevaplarını akordiyon yapısında yayınlayın.
                </p>
              </div>
              <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer">
                + Yeni Soru Ekle
              </button>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3">Soru</th>
                  <th className="py-3 px-3 w-[80px]">Sıra</th>
                  <th className="py-3 px-3 w-[110px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                <tr>
                  <td className="py-3 px-3">1</td>
                  <td className="py-3 px-3 font-semibold">Siparişim ne zaman kargoya verilir?</td>
                  <td className="py-3 px-3">1</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">2</td>
                  <td className="py-3 px-3 font-semibold">Kapıda ödeme ve kredi kartına taksit imkanınız var mı?</td>
                  <td className="py-3 px-3">2</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">3</td>
                  <td className="py-3 px-3 font-semibold">Satın aldığım ürünü nasıl iade edebilir veya değiştirebilirim?</td>
                  <td className="py-3 px-3">3</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 12. BLOG (/admin/store/blog - blogsTable) */}
      {activeTab === "blog" && (
        <div id="subview-theme-blog" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Blog Yönetimi</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Organik SEO trafiğinizi artırmak için blog makaleleri, rehber içerikler ve duyurular yayınlayın.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer">
                  + Yeni Blog Yazısı
                </button>
                <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer">
                  📂 Blog Kategorileri
                </button>
              </div>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3">Başlık</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 w-[95px]">Okunma</th>
                  <th className="py-3 px-3 w-[150px]">Yayınlanma Tarihi</th>
                  <th className="py-3 px-3 text-center w-[85px]">Durum</th>
                  <th className="py-3 px-3 w-[110px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                <tr>
                  <td className="py-3 px-3">12</td>
                  <td className="py-3 px-3 font-semibold">2026 Sezonunun En Çok Tercih Edilen Kombin ve Modelleri</td>
                  <td className="py-3 px-3">Moda &amp; Trend</td>
                  <td className="py-3 px-3 font-bold">1.482</td>
                  <td className="py-3 px-3">10.11.2026 15:30</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3">11</td>
                  <td className="py-3 px-3 font-semibold">Aracınız İçin Doğru Bodykit ve Lip Seçimi Rehberi</td>
                  <td className="py-3 px-3">Uygulama Rehberi</td>
                  <td className="py-3 px-3 font-bold">2.910</td>
                  <td className="py-3 px-3">02.11.2026 11:20</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 13. MANŞETLER (/admin/store/headlines - headlineSort) */}
      {activeTab === "headlines" && (
        <div id="subview-theme-headlines" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Manşetler (Ana Sayfa Slider Yönetimi)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Masaüstü ve mobil cihazlar için ayrı görseller tanımlayabilir, sürükle-bırak ile manşet sırasını değiştirebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
              >
                + Yeni Manşet Ekle / Hero Düzenle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-[#ebedf2] rounded-[6px] p-4 bg-[#fafbfe] flex items-center gap-4">
                <img src={mediaUrl || PREVIEW_IMG_1} alt="Manşet 1" className="w-28 h-20 object-cover rounded border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#1e293b] truncate">
                    {title || "Yeni Sezon Koleksiyonu — %30'a Varan İndirim"}
                  </div>
                  <div className="text-[12px] text-[#3d94fb] font-mono mt-0.5">{btnLink || "/kampanyalar"}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded bg-[#e0f6e7] text-[#08976d] text-[11px] font-bold">✓ Aktif</span>
                    <span className="text-[11.5px] text-slate-500">Sıra: 1</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                    className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white text-[12px] cursor-pointer"
                  >
                    ✎
                  </button>
                  <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white text-[12px] cursor-pointer">
                    🗑
                  </button>
                </div>
              </div>

              <div className="border border-[#ebedf2] rounded-[6px] p-4 bg-[#fafbfe] flex items-center gap-4">
                <img src={PREVIEW_IMG_2} alt="Manşet 2" className="w-28 h-20 object-cover rounded border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#1e293b] truncate">1.000 TL ve Üzeri Siparişlerde Ücretsiz Kargo</div>
                  <div className="text-[12px] text-[#3d94fb] font-mono mt-0.5">/yeni-urunler</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded bg-[#e0f6e7] text-[#08976d] text-[11px] font-bold">✓ Aktif</span>
                    <span className="text-[11.5px] text-slate-500">Sıra: 2</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setShowLiveHeroCustomizer((v) => !v)}
                    className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white text-[12px] cursor-pointer"
                  >
                    ✎
                  </button>
                  <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white text-[12px] cursor-pointer">
                    🗑
                  </button>
                </div>
              </div>
            </div>

            {showLiveHeroCustomizer && (
              <form onSubmit={handleSaveHeroConfig} className="mt-6 pt-5 border-t border-[#ebedf2] space-y-4">
                <h4 className="text-[15px] font-bold text-[#48465b]">Canlı Hero Manşet İçeriği (/admin/hero-config)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Üst Etiket (Tag)</label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Ana Başlık (Title)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Alt Başlık (Subtitle)</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Buton Yazısı</label>
                    <input
                      type="text"
                      value={btnText}
                      onChange={(e) => setBtnText(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Buton Linki</label>
                    <input
                      type="text"
                      value={btnLink}
                      onChange={(e) => setBtnLink(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Arka Plan Görsel/Video URL</label>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#48465b] mb-1">Bilgisayardan Yükle</label>
                    <input
                      type="file"
                      accept="image/*,video/mp4"
                      onChange={(e) => handleHeroFileUpload(e, "hero")}
                      className="w-full text-[12.5px]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[36px] px-5 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-semibold cursor-pointer"
                >
                  {saving ? "Kaydediliyor..." : "✓ Manşet Ayarlarını Kaydet"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 14. BANNERLAR (/admin/store/banners - bannersTable) */}
      {activeTab === "banners" && (
        <div id="subview-theme-banners" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Bannerlar (Vitrin &amp; Kampanya Görsel Grupları)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Blok yönetiminde kullandığınız 2'li, 3'lü veya tam genişlikteki görsel banner gruplarını yönetebilirsiniz.
                </p>
              </div>
              <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer">
                + Yeni Banner Grubu
              </button>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[40px] text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="py-3 px-3 w-[80px]">No</th>
                  <th className="py-3 px-3">Banner Adı</th>
                  <th className="py-3 px-3 w-[110px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                <tr>
                  <td className="py-3 px-3 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="py-3 px-3">1</td>
                  <td className="py-3 px-3 font-semibold">Ana Sayfa Üst 3'lü Kategori Vitrin Bannerları</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="py-3 px-3">2</td>
                  <td className="py-3 px-3 font-semibold">Ana Sayfa Orta Geniş Kampanya &amp; Kargo Bannerı</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="py-3 px-3">3</td>
                  <td className="py-3 px-3 font-semibold">Mobil Uygulama &amp; WhatsApp Sipariş Hattı Bannerı</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 15. POPUP (/admin/store/popup - popupsTable) */}
      {activeTab === "popup" && (
        <div id="subview-theme-popup" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Popup (Açılır Pencere Kampanya &amp; Duyuru)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Siteye ilk girişte veya belirli tarih aralıklarında müşterilere gösterilecek kupon ve kampanya popuplarını yönetin.
                </p>
              </div>
              <button type="button" className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer">
                + Yeni Popup Ekle
              </button>
            </div>
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3">Başlık</th>
                  <th className="py-3 px-3 text-center w-[90px]">Mobil</th>
                  <th className="py-3 px-3 text-center w-[90px]">Masaüstü</th>
                  <th className="py-3 px-3 w-[160px]">Başlangıç Tarihi</th>
                  <th className="py-3 px-3 w-[160px]">Bitiş Tarihi</th>
                  <th className="py-3 px-3 w-[100px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                <tr>
                  <td className="py-3 px-3">1</td>
                  <td className="py-3 px-3 font-semibold">Hoş Geldin %15 İndirim Kuponu (HOSGELDIN15)</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                  </td>
                  <td className="py-3 px-3">01.11.2026 00:00</td>
                  <td className="py-3 px-3">31.12.2026 23:59</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#9b59b6] text-white">
                      👁
                    </button>{" "}
                    <button type="button" className="w-[28px] h-[28px] rounded bg-[#e74c3c] text-white">
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 16. STORY (/admin/store/story - .story-items .item from style.min.css) */}
      {activeTab === "story" && (
        <div id="subview-theme-story" className="theme-subview max-w-[1140px] w-full mx-auto px-5 py-7">
          <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-[18px] font-medium text-[#48465b]">Story (Instagram Tarzı Yuvarlak Hikaye Vitrini)</h3>
                <p className="text-[13px] text-[#74788d] mt-1">
                  Ana sayfanın en üstünde yer alan dairesel kampanya ve kategori hikayelerini yönetebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Yeni Story Halkası ekleme modalı")}
                className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
              >
                + Yeni Story Ekle
              </button>
            </div>

            {/* .story-items flex-wrap (160px dashed cards from style.min.css) */}
            <div className="flex flex-wrap gap-4">
              {[
                { title: "Yeni Gelenler", link: "/yeni-urunler", img: PREVIEW_IMG_1 },
                { title: "Çok Satanlar", link: "/cok-satanlar", img: PREVIEW_IMG_2 },
                { title: "Fırsat Ürünleri", link: "/indirimdekiler", img: PREVIEW_IMG_1 },
                { title: "Kombini Tamamla", link: "/kombinler", img: PREVIEW_IMG_1 },
                { title: "Müşteri Memnuniyeti", link: "/yorumlar", img: PREVIEW_IMG_3 },
                { title: "Aynı Gün Kargo", link: "/kargo-takip", img: PREVIEW_IMG_4 },
              ].map((st) => (
                <div
                  key={st.title}
                  className="w-[165px] border border-dashed border-[#cccccc] rounded-[6px] p-[10px] bg-white flex flex-col items-center text-center"
                >
                  <div className="w-[130px] h-[130px] rounded-full p-1 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 mb-2.5">
                    <img src={st.img} alt={st.title} className="w-full h-full object-cover rounded-full border-2 border-white" />
                  </div>
                  <div className="text-[13.5px] font-bold text-[#1e293b] truncate w-full">{st.title}</div>
                  <div className="text-[11.5px] text-[#74788d] truncate w-full mt-0.5">{st.link}</div>
                  <div className="grid grid-cols-2 gap-1.5 w-full mt-3 pt-2.5 border-t border-dashed border-[#cccccc]">
                    <button type="button" className="h-[26px] rounded bg-[#f0f3ff] text-[#3d94fb] text-[11.5px] font-semibold cursor-pointer">
                      ✎ Düzenle
                    </button>
                    <button type="button" className="h-[26px] rounded bg-red-50 text-red-600 text-[11.5px] font-semibold cursor-pointer">
                      🗑 Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export const config = defineRouteConfig({
  label: "Tasarım & Tema Yönetimi",
  icon: ComputerDesktop,
})

export default HeroManagerPage
