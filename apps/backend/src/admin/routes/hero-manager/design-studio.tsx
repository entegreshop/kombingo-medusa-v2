import React, { useState, useEffect } from "react"

export type StudioSectionKey =
  | "ai_studio"
  | "hero"
  | "coupon_popup"
  | "vitrin"
  | "carousel"
  | "buttons"
  | "header_footer"
  | "product_detail"
  | "cart"
  | "checkout"

export interface HeroSlide {
  id: string
  tag: string
  title: string
  subtitle: string
  btn_text: string
  btn_link: string
  media_type: "image" | "video"
  media_url: string
  mobile_media_url?: string
  active: boolean
}

export interface CategoryCircle {
  name: string
  handle: string
  icon: string
  active?: boolean
}

export interface PromoBannerItem {
  tag: string
  title: string
  description: string
  btn_text: string
  btn_link: string
  image_url: string
  btn_bg?: string
  btn_text_color?: string
  active?: boolean
}

export interface CarouselBlockItem {
  id: string
  title: string
  subtitle: string
  badge_text: string
  source_type: "latest" | "category" | "collection"
  handle: string
  limit: number
  position: "above_banners" | "below_banners" | "below_categories" | "below_products"
  bg_color: string
  text_color: string
  accent_color: string
  btn_text: string
  btn_link: string
  autoplay: boolean
  active: boolean
}

export interface BannerCarouselItem {
  id: string
  title: string
  title_color: string
  cta_text: string
  cta_link: string
  cta_color: string
  footer_note: string
  badge_text: string
  bg_image_url: string
  bg_color: string
  source_type: "latest" | "category" | "collection"
  handle: string
  limit: number
  position: "replace_hero" | "above_banners" | "below_banners" | "below_collection" | "below_products"
  free_shipping_text: string
  active: boolean
}

export interface TrustBadgeItem {
  title: string
  description: string
  icon: string
  active: boolean
}

interface DesignStudioProps {
  initialSection?: StudioSectionKey
  onToast?: (msg: string) => void
}

const STUDIO_TABS: { key: StudioSectionKey; icon: string; label: string; badge?: string }[] = [
  { key: "ai_studio", icon: "✨", label: "Entegre AI Studio", badge: "AI PRO" },
  { key: "hero", icon: "🎯", label: "Hero Banner & Slider" },
  { key: "coupon_popup", icon: "🎟️", label: "Hero Üstü Kupon & Popup", badge: "YENİ" },
  { key: "vitrin", icon: "🏪", label: "Vitrin, Banner & Kategoriler" },
  { key: "carousel", icon: "🎠", label: "Carousel Blok Ayarları", badge: "YENİ" },
  { key: "buttons", icon: "🔘", label: "Buton Ayarları" },
  { key: "header_footer", icon: "🔝", label: "Header & Footer Ayarları" },
  { key: "product_detail", icon: "👗", label: "Ürün Detay Tasarım" },
  { key: "cart", icon: "🛒", label: "Sepet Tasarım & Ayarları" },
  { key: "checkout", icon: "💳", label: "Ödeme Formu Ayarları" },
]

const DEFAULT_ALL_CATEGORY_BANNER_CAROUSELS: BannerCarouselItem[] = [
  {
    id: "banner-carousel-kombin",
    title: "Trend İkili Kombinler",
    title_color: "#111827",
    cta_text: "Fırsatları Kaçırma",
    cta_link: "/categories/kombin",
    cta_color: "#f02d9c",
    footer_note: "Sezon sonuna kadar geçerlidir. Fırsat; kupon ve sepette indirim avantajlarını kapsar.",
    badge_text: "KOMBİN FIRSATI",
    bg_image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#dce6f2",
    source_type: "category",
    handle: "kombin",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-jean",
    title: "Jean Pantolon Koleksiyonu",
    title_color: "#111827",
    cta_text: "Denim Modellerini Keşfet",
    cta_link: "/categories/jean-pantolon",
    cta_color: "#1d4ed8",
    footer_note: "Yüksek bel, Palazzo, Mom ve İspanyol paça jean modellerinde sepette ekstra kupon fırsatı.",
    badge_text: "DENİM SEZONU",
    bg_image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#dbeafe",
    source_type: "category",
    handle: "jean-pantolon",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-tayt",
    title: "Toparlayıcı & Likralı Taytlar",
    title_color: "#111827",
    cta_text: "Tayt Fırsatlarını İncele",
    cta_link: "/categories/tayt",
    cta_color: "#c91d82",
    footer_note: "Yüksek bel fitilli, deri görünümlü ve çelik örme taytlarda hızlı kargo avantajı.",
    badge_text: "FAVORİ TAYTLAR",
    bg_image_url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#fce7f3",
    source_type: "category",
    handle: "tayt",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-sweat",
    title: "Oversize Sweat & Eşofman",
    title_color: "#111827",
    cta_text: "Rahat Stili Yakala",
    cta_link: "/categories/sweat",
    cta_color: "#7c3aed",
    footer_note: "Şardonlu 3 iplik oversize sweatshirt ve kapüşonlu modellerde özel indirimler.",
    badge_text: "STREET STYLE",
    bg_image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#ede9fe",
    source_type: "category",
    handle: "sweat",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-mont",
    title: "Mont & Kürk Koleksiyonu",
    title_color: "#111827",
    cta_text: "Dış Giyim Fırsatları",
    cta_link: "/categories/mont",
    cta_color: "#b45309",
    footer_note: "Sıcak tutan şişme mont, peluş kürk ve kaşe kabanlarda sezonun en iyi fiyatları.",
    badge_text: "KIŞ KOLEKSİYONU",
    bg_image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#fef3c7",
    source_type: "category",
    handle: "mont",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-tshirt",
    title: "Yeni Sezon T-Shirt Seçkisi",
    title_color: "#111827",
    cta_text: "Tüm Modelleri Gör",
    cta_link: "/categories/tshirt",
    cta_color: "#059669",
    footer_note: "%100 pamuklu basic, baskılı ve crop t-shirt modellerinde sepette ekstra indirim.",
    badge_text: "HER MEVSİM STİL",
    bg_image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#d1fae5",
    source_type: "category",
    handle: "tshirt",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-gozluk",
    title: "Güneş Gözlüğü Koleksiyonu",
    title_color: "#111827",
    cta_text: "Aksesuarları Keşfet",
    cta_link: "/categories/gozluk",
    cta_color: "#e11d48",
    footer_note: "UV400 korumalı retro, cat-eye ve kemik çerçeve gözlüklerde kaçırılmayacak fiyatlar.",
    badge_text: "TREND AKSESUAR",
    bg_image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#ffe4e6",
    source_type: "category",
    handle: "gozluk",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-canta",
    title: "Şık & Trend Çanta Modelleri",
    title_color: "#111827",
    cta_text: "Çanta Koleksiyonunu Gör",
    cta_link: "/categories/canta",
    cta_color: "#9333ea",
    footer_note: "Omuz çantası, baget ve çapraz askılı modellerle kombininizi tamamlayın.",
    badge_text: "İMZA DETAYLAR",
    bg_image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#f3e8ff",
    source_type: "category",
    handle: "canta",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-yeni",
    title: "Yeni Gelenler Vitrini",
    title_color: "#111827",
    cta_text: "Yeni Sezonu Keşfet",
    cta_link: "/store",
    cta_color: "#f02d9c",
    footer_note: "Haftanın en yeni Kombingo tasarımları stoklarla sınırlı özel lansman fiyatlarıyla.",
    badge_text: "YENİ SEZON",
    bg_image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#fce7f3",
    source_type: "latest",
    handle: "",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
  {
    id: "banner-carousel-coksatan",
    title: "Çok Satan Favori Ürünler",
    title_color: "#111827",
    cta_text: "Popüler Ürünleri İncele",
    cta_link: "/store",
    cta_color: "#ea580c",
    footer_note: "Müşterilerimizin en çok tercih ettiği yıldız parçalar hızlı kargo fırsatıyla.",
    badge_text: "BEST SELLER 🔥",
    bg_image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop&q=80",
    bg_color: "#ffedd5",
    source_type: "collection",
    handle: "cok-satanlar",
    limit: 8,
    position: "below_collection",
    free_shipping_text: "HIZLI KARGO",
    active: true,
  },
]

export const DesignStudio: React.FC<DesignStudioProps> = ({ initialSection = "hero", onToast }) => {
  const [section, setSection] = useState<StudioSectionKey>(initialSection)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [localToast, setLocalToast] = useState("")

  // Entegre AI Studio States
  const [aiModel, setAiModel] = useState("entegre-ai-fashion-v4")
  const [aiTone, setAiTone] = useState("luxury_editorial")
  const [aiTarget, setAiTarget] = useState<"hero" | "banner_carousel" | "coupon" | "promo_banner">("banner_carousel")
  const [aiTargetCategoryIdx, setAiTargetCategoryIdx] = useState<number>(0)
  const [aiPrompt, setAiPrompt] = useState(
    "Yeni sezon kışlık kombinler ve ikili modal takımlar için yüksek dönüşümlü, sepette ekstra %15 indirim vurgulu lüks kampanya bannerı oluştur"
  )
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiCredits, setAiCredits] = useState(18741)
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState({
    tag: "AI ÖZEL SEÇKİ • YENİ SEZON",
    title: "Kışlık İkili Kombinlerde Kusursuz Şıklık",
    subtitle: "Modal kumaş ikili takımlar, şardonlu eşofmanlar ve dış giyim koleksiyonunda sepette ekstra %15 indirim fırsatı.",
    cta_text: "Koleksiyonu & Fırsatları Keşfet",
    cta_color: "#f02d9c",
    badge_text: "AI KAMPANYA 🔥",
    footer_note: "Stoklarla sınırlı özel lansman fiyatları. Kupon ve sepette ekstra indirim avantajlarını kapsar.",
    coupon_code: "AISTIL15",
    discount_rate: "%15",
    bg_color: "#fce7f3",
    bg_image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
  })

  // Sync external initialSection prop changes
  useEffect(() => {
    if (initialSection) setSection(initialSection)
  }, [initialSection])

  // Full hero-config state
  const [config, setConfig] = useState<Record<string, any>>({
    tag: "2026 YENİ SEZON KOLEKSİYONU",
    title: "Kombingo'ya Hoş Geldiniz",
    subtitle: "Yeni sezonun en trend kadın giyim, jean, tayt ve kombin modellerini hemen keşfedin",
    btn_text: "Şimdi Alışverişe Başla",
    btn_link: "/store",
    media_type: "image",
    media_url: "",
    mobile_media_url: "",
    hero_height: "75vh",
    hero_overlay_opacity: 15,
    hero_text_color: "#09090B",
    hero_btn_bg: "#7C3AED",
    hero_btn_text_color: "#ffffff",
    hero_autoplay: true,
    hero_interval: 5000,
    show_hero_banner: true,
    hero_display_mode: "standard_hero",
    hero_slides: [] as HeroSlide[],
    categories: [] as CategoryCircle[],
    banners: [] as PromoBannerItem[],
    carousel_blocks: [] as CarouselBlockItem[],
    banner_carousels: DEFAULT_ALL_CATEGORY_BANNER_CAROUSELS,
    trust_badges: [] as TrustBadgeItem[],
    show_promo_banners: true,
    show_category_circles: true,
    show_trust_badges: true,
    top_announcement: "2026 YAZ SEZONU MODELLERİ",
    top_announcement_enabled: true,
    top_announcement_bg: "#000000",
    top_announcement_text_color: "#ffffff",
    scrolling_text_home: "3000 ₺ Üzeri Alışverişlerinizde Kargo Ücretsiz",
    scrolling_text_home_enabled: true,
    scrolling_text_home_bg: "#000000",
    scrolling_text_home_text_color: "#ffffff",
    scrolling_text_product: "Sepette %10 İndirim Kodu : MDS10 • 3000 ₺ Üzeri Ücretsiz Kargo",
    scrolling_text_product_enabled: true,
    scrolling_text_product_bg: "#FFD700",
    scrolling_text_product_text_color: "#000000",
    buy_now_enabled: true,
    buy_now_text: "HEMEN AL",
    buy_now_bg: "#E50000",
    buy_now_text_color: "#ffffff",
    add_to_cart_enabled: true,
    add_to_cart_text: "SEPETE EKLE",
    add_to_cart_bg: "#000000",
    add_to_cart_text_color: "#ffffff",
    whatsapp_enabled: true,
    whatsapp_text: "WHATSAPP İLE SİPARİŞ",
    whatsapp_number: "905323370081",
    whatsapp_bg: "#ffffff",
    whatsapp_text_color: "#25D366",
    button_border_radius: "0px",
    header_settings: {
      sticky: true,
      bg_color: "#ffffff",
      text_color: "#000000",
      border_color: "#e5e7eb",
      logo_height_desktop: 44,
      logo_height_mobile: 36,
      show_search: true,
      show_account: true,
      show_cart: true,
    },
    footer_settings: {
      bg_color: "#0a0a0c",
      text_color: "#ffffff",
      accent_color: "#ffffff",
      show_social: true,
      instagram_url: "https://instagram.com/kombingo",
      facebook_url: "https://facebook.com/kombingo",
      whatsapp_url: "https://wa.me/905323370081",
      tiktok_url: "",
      youtube_url: "",
      ssl_badge_text: "Bu site 256 Bit SSL sertifikası ile korunmaktadır.",
      show_payment_icons: true,
    },
    product_detail_settings: {
      show_live_viewers: true,
      live_viewers_min: 12,
      live_viewers_max: 34,
      show_favorite_button: true,
      show_reviews_link: true,
      show_trust_row: true,
      trust_badge_1_text: "Güvenli Ödeme",
      trust_badge_2_text: "Aynı Gün Kargo",
      shipping_info_text:
        "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür.",
      return_policy_text:
        "Siparişinizdeki ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve etiketleri sökülmemiş olması şartıyla iade edebilirsiniz.",
      show_sticky_mobile_bar: true,
    },
    cart_settings: {
      page_title: "Alışveriş Sepetim",
      show_free_shipping_bar: true,
      free_shipping_threshold: 3000,
      free_shipping_bar_color: "#10B981",
      show_coupon_box: true,
      checkout_btn_text: "Güvenli Ödemeye Geç",
      checkout_btn_bg: "#000000",
      checkout_btn_text_color: "#ffffff",
      trust_note_text: "256-Bit SSL Güvencesiyle Hızlı & Güvenli Alışveriş",
    },
    checkout_settings: {
      modal_title: "Hızlı ve Güvenli Ödeme",
      delivery_section_title: "Teslimat Adresi",
      payment_section_title: "Ödeme Yöntemi",
      accent_color: "#111827",
      submit_btn_text: "Siparişi Tamamla",
      submit_btn_bg: "#1A1A1A",
      submit_btn_text_color: "#ffffff",
      show_email: true,
      require_email: true,
      show_order_note: true,
      show_coupon: true,
      show_invoice_type: true,
      default_payment_method: "credit_card",
      ssl_badge_text: "Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.",
      copyright_text: "© 2026 Kombingo Tüm Hakları Saklıdır",
    },
    coupon_banner: {
      enabled: true,
      eyebrow: "KOMBİNGO'YA ÖZEL",
      title_prefix: "SEPETTE EKSTRA",
      highlight_text: "%10",
      title_suffix: "İNDİRİM",
      description: "Kupon kodunu sepette veya hızlı ödeme ekranında girmeniz yeterli. Kampanya tüm yeni sezon ürünlerinde geçerlidir.",
      code_label: "KOD",
      code: "KOMBINGO10",
      copy_text: "KOPYALA",
      copied_text: "KOPYALANDI",
      bg_color: "#0b0b0c",
      glow_color: "#c81e2d",
      accent_color: "#ff6a6a",
      show_popup_on_copy: true,
      popup_title: "Kupon Kodunuz Tanımlandı! 🎉",
      popup_description: "İndirim kuponunuz panoya kopyalandı ve ödeme formunuza otomatik olarak tanımlandı. Alışverişinizi tamamlarken ekstra indiriminiz anında uygulanacaktır.",
      popup_btn_text: "Alışverişe Başla & İndirimi Kullan",
      popup_btn_link: "/store",
      auto_apply_checkout: true,
    },
    category_tab_carousel: {
      title: "Kombingo Collection",
      view_all_text: "Tümünü Gör",
      view_all_link: "/store",
      accent_color: "#c91d82",
      free_shipping_text: "HIZLI KARGO",
      show_installment_badge: true,
      show_coupon_badge: true,
      sepette_badge_text: "Sepette Ekstra %10 İndirim",
    },
  })

  // Logo & Corporate Config (/admin/logo-config)
  const [logoConfig, setLogoConfig] = useState<Record<string, any>>({
    headerLogo: "/logo.png",
    footerLogo: "/logo.png",
    mobileLogo: "/logo.png",
    checkoutLogo: "/logo.png",
    favicon: "/favicon.ico",
    siteTitle: "Kombingo",
    contactCompany: "KOMBİNGO MODA & TEKSTİL",
    contactAddress: "Merkez Mah. Moda Cad. No:12 İstanbul / Türkiye",
    contactHours: "Hafta İçi: 09:00 - 19:00 | Cumartesi: 10:00 - 18:00",
    contactPhone: "0532 337 00 81",
    contactEmail: "info@kombingo.com",
    footerCopyrightText: "© 2026 Kombingo. Tüm Hakları Saklıdır.",
  })

  const notify = (msg: string) => {
    setLocalToast(msg)
    if (onToast) onToast(msg)
    setTimeout(() => setLocalToast(""), 4000)
  }

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [heroRes, logoRes] = await Promise.all([
          fetch("/admin/hero-config").then((r) => r.json()).catch(() => null),
          fetch("/admin/logo-config").then((r) => r.json()).catch(() => null),
        ])
        if (heroRes?.config) {
          setConfig((prev) => ({
            ...prev,
            ...heroRes.config,
            header_settings: { ...prev.header_settings, ...(heroRes.config.header_settings || {}) },
            footer_settings: { ...prev.footer_settings, ...(heroRes.config.footer_settings || {}) },
            product_detail_settings: { ...prev.product_detail_settings, ...(heroRes.config.product_detail_settings || {}) },
            cart_settings: { ...prev.cart_settings, ...(heroRes.config.cart_settings || {}) },
            checkout_settings: { ...prev.checkout_settings, ...(heroRes.config.checkout_settings || {}) },
            coupon_banner: { ...prev.coupon_banner, ...(heroRes.config.coupon_banner || {}) },
            category_tab_carousel: { ...prev.category_tab_carousel, ...(heroRes.config.category_tab_carousel || {}) },
          }))
        }
        if (logoRes?.config) {
          setLogoConfig((prev) => ({ ...prev, ...logoRes.config }))
        }
      } catch (e) {
        console.error("Failed to load design studio configs:", e)
      }
    }
    loadAll()
  }, [])

  const updateField = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const updateNested = (group: string, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: value,
      },
    }))
  }

  const updateLogoField = (key: string, value: any) => {
    setLogoConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const [resHero, resLogo] = await Promise.all([
        fetch("/admin/hero-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }).then((r) => r.json()),
        fetch("/admin/logo-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: logoConfig }),
        }).then((r) => r.json()),
      ])

      if (resHero?.success || resLogo?.success) {
        notify("Tasarım, Vitrin, Carousel, Sepet ve Ödeme ayarları başarıyla kaydedildi! ✔")
      } else {
        alert("Ayarlar kaydedilirken bir sorun oluştu.")
      }
    } catch (err) {
      console.error("Save error:", err)
      alert("Sunucuyla bağlantı kurulamadı.")
    } finally {
      setSaving(false)
    }
  }

  const uploadMediaFile = async (file: File, trackerKey: string, onUrl: (url: string, type: "image" | "video") => void) => {
    setUploadingKey(trackerKey)
    const isVideo = file.type.startsWith("video/")
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
        if (data?.success && data?.url) {
          onUrl(data.url, isVideo ? "video" : "image")
          notify("Medya dosyası başarıyla yüklendi: " + data.url)
        } else {
          alert("Yükleme hatası: " + (data?.message || "Bilinmeyen hata"))
        }
      } catch (err) {
        alert("Dosya yüklenirken bağlantı hatası oluştu.")
      } finally {
        setUploadingKey(null)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white rounded-[8px] border border-[#ebedf2] shadow-2xs overflow-hidden mb-8">
      {/* Studio Top Bar */}
      <div className="bg-gradient-to-r from-[#1e1e2d] to-[#2c2e3e] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0abb87] text-white text-[11px] font-bold uppercase tracking-wider">
              PRO TASARIM STÜDYOSU
            </span>
            <h3 className="text-[17px] font-bold text-white">Tam Kapsamlı Mağaza Tasarım &amp; Tema Yönetimi</h3>
          </div>
          <p className="text-[12.5px] text-slate-300 mt-1">
            Hero Banner, Vitrin, Carousel Blokları, Butonlar, Header/Footer, Ürün Detay, Sepet ve Ödeme Formu ayarlarını tek noktadan yönetin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSection("ai_studio")}
            className={`h-[38px] px-4 rounded-[5px] text-[12.5px] font-extrabold inline-flex items-center gap-2 cursor-pointer transition shadow-sm ${
              section === "ai_studio"
                ? "bg-gradient-to-r from-[#f02d9c] via-[#9333ea] to-[#4f46e5] text-white ring-2 ring-white/50"
                : "bg-gradient-to-r from-[#c91d82] to-[#7c3aed] hover:opacity-95 text-white"
            }`}
          >
            <span>✨</span>
            <span>Entegre AI Studio</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-black uppercase">AI PRO</span>
          </button>
          <a
            href="https://kombingo.com/tr"
            target="_blank"
            rel="noreferrer"
            className="h-[38px] px-4 rounded-[5px] bg-white/10 hover:bg-white/20 text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition"
          >
            <span>🌐</span> Canlı Mağazayı Gör
          </a>
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="h-[38px] px-5 rounded-[5px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-sm transition"
          >
            {saving ? "Kaydediliyor..." : "✓ Tüm Tasarım Ayarlarını Kaydet"}
          </button>
        </div>
      </div>

      {/* Studio Navigation Pills */}
      <div className="bg-[#f8f9fb] border-b border-[#ebedf2] px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        {STUDIO_TABS.map((t) => {
          const active = section === t.key
          const isAiTab = t.key === "ai_studio"
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSection(t.key)}
              className={`px-3.5 py-2 rounded-[6px] text-[12.5px] font-semibold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                active
                  ? isAiTab
                    ? "bg-gradient-to-r from-[#c91d82] to-[#7c3aed] text-white shadow-xs"
                    : "bg-[#3d94fb] text-white shadow-xs"
                  : isAiTab
                  ? "bg-[#fdf4ff] text-[#9333ea] border border-[#d8b4fe] hover:border-[#9333ea] font-bold"
                  : "bg-white text-[#48465b] border border-[#e2e5ec] hover:border-[#3d94fb] hover:text-[#3d94fb]"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                    active
                      ? "bg-white text-[#111827]"
                      : isAiTab
                      ? "bg-gradient-to-r from-[#c91d82] to-[#7c3aed] text-white"
                      : "bg-[#0abb87] text-white"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {localToast && (
        <div className="mx-6 mt-4 p-3 rounded-[5px] bg-[#e0f6e7] border border-[#0abb87] text-[#08976d] text-[13px] font-bold flex items-center justify-between">
          <span>{localToast}</span>
          <button type="button" onClick={() => setLocalToast("")} className="text-[12px] underline">
            Kapat
          </button>
        </div>
      )}

      <div className="p-6">
        {/* =========================================================
            0. ENTEGRE AI STUDIO (YAPAY ZEKA TASARIM, BANNER & TEMA MERKEZİ)
        ========================================================= */}
        {section === "ai_studio" && (
          <div className="space-y-6">
            {/* AI Studio Header Banner */}
            <div className="p-5 rounded-[10px] bg-gradient-to-r from-[#1e1b4b] via-[#311042] to-[#0f172a] text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#f02d9c] to-[#7c3aed] text-white text-[11px] font-black uppercase tracking-wider">
                    ✨ ENTEGRE AI STUDIO v4.5
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                    ● {aiCredits.toLocaleString("tr-TR")} AI Kontör Aktif
                  </span>
                </div>
                <h4 className="text-[18px] font-extrabold tracking-tight">
                  Yapay Zeka Destekli Mağaza, Banner Carousel, Kupon &amp; Tema Tasarım Stüdyosu
                </h4>
                <p className="text-[12.5px] text-slate-300 max-w-3xl">
                  Tek bir komutla (prompt) Hero Banner, n11 Stili Kategori Carousel, BellButik Kupon Barı, kampanya sloganları ve mağaza renk paletlerini yapay zeka ile saniyeler içinde üretip vitrine uygulayın.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="h-[36px] px-3 rounded-[6px] bg-white/10 border border-white/20 text-white text-[12px] font-bold cursor-pointer"
                >
                  <option value="entegre-ai-fashion-v4" className="text-black">🧠 Model: Entegre AI Fashion Pro v4</option>
                  <option value="gemini-2.5-pro-vision" className="text-black">✨ Model: Gemini 2.5 Pro Vision</option>
                  <option value="flux-1-ultra-realism" className="text-black">📸 Model: Flux.1 Ultra Editorial</option>
                </select>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="h-[36px] px-3 rounded-[6px] bg-white/10 border border-white/20 text-white text-[12px] font-bold cursor-pointer"
                >
                  <option value="luxury_editorial" className="text-black">💎 Ton: Lüks &amp; Editoryal Butik</option>
                  <option value="high_conversion" className="text-black">🔥 Ton: Yüksek Dönüşüm &amp; Fırsat (n11 / Trendyol)</option>
                  <option value="bellbutik_glam" className="text-black">🖤 Ton: BellButik Gece &amp; Kupon Vurgulu</option>
                  <option value="minimal_modern" className="text-black">🌿 Ton: Minimalist &amp; Modern</option>
                </select>
              </div>
            </div>

            {/* 1. AI PROMPT & BANNER / CAMPAIGN GENERATOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-5 rounded-[10px] border-2 border-[#c91d82]/30 bg-[#fdf8fc] space-y-4">
                <div className="flex items-center justify-between border-b border-[#f3d6e8] pb-3">
                  <div>
                    <h5 className="text-[15.5px] font-extrabold text-[#1e293b]">
                      🪄 1. AI Kampanya, Manşet &amp; Banner Carousel Üretici
                    </h5>
                    <p className="text-[12px] text-[#74788d]">
                      Nasıl bir kampanya, kategori vitrini veya kupon alanı istediğinizi yazın; AI metin, renk ve görseli hazırlasın.
                    </p>
                  </div>
                </div>

                {/* Hazır AI Prompt Şablonları */}
                <div>
                  <label className="block text-[11.5px] font-bold text-[#48465b] mb-1.5">
                    ⚡ Hazır AI Kampanya Komutları (Tek Tıkla Seçin):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: "🧥 Kışlık Mont & Kürk Fırsatı",
                        prompt: "Mont ve Kürk kategorisi için sıcak tutan kış koleksiyonu, %35 indirim ve hızlı kargo vurgulu lüks kampanya bannerı üret",
                        preset: {
                          tag: "KIŞ KOLEKSİYONU • ÖZEL SEÇKİ",
                          title: "Mont & Kürk Koleksiyonunda Kış Fırsatı",
                          subtitle: "Peluş kürk, şişme mont ve kaşe kaban modellerinde sepette ekstra indirim + aynı gün hızlı kargo.",
                          cta_text: "Dış Giyim Fırsatlarını Yakala",
                          cta_color: "#b45309",
                          badge_text: "KIŞ FIRSATI ❄️",
                          footer_note: "Sezon sonuna kadar geçerlidir. Kupon ve sepette indirim avantajlarını kapsar.",
                          coupon_code: "KIS20",
                          discount_rate: "%20",
                          bg_color: "#fef3c7",
                          bg_image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1600&auto=format&fit=crop&q=80",
                        },
                      },
                      {
                        label: "👖 Denim & Jean Pantolon Sezonu",
                        prompt: "Yüksek bel toparlayıcı Jean Pantolon ve Palazzo denim modelleri için n11 stili yüksek dönüşümlü kategori bannerı tasarla",
                        preset: {
                          tag: "DENİM SEZONU • YENİ KESİMLER",
                          title: "Kusursuz Kalıp Jean Pantolon Koleksiyonu",
                          subtitle: "Yüksek bel, Palazzo, Mom ve İspanyol paça likralı jean modellerinde kaçırılmayacak sezon fiyatları.",
                          cta_text: "Denim Modellerini Keşfet",
                          cta_color: "#1d4ed8",
                          badge_text: "DENİM FEST 💙",
                          footer_note: "Tüm jean pantolonlarda ücretsiz değişim ve hızlı kargo fırsatı.",
                          coupon_code: "JEAN15",
                          discount_rate: "%15",
                          bg_color: "#dbeafe",
                          bg_image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1600&auto=format&fit=crop&q=80",
                        },
                      },
                      {
                        label: "👗 İkili Kombin & Modal Takım",
                        prompt: "Trend ikili kombinler ve modal eşofman takımları için Kombingo imza kampanya manşeti oluştur",
                        preset: {
                          tag: "KOMBİNGO COLLECTION • İMZA SERİSİ",
                          title: "Trend İkili Kombinler & Modal Takımlar",
                          subtitle: "Fermuarlı, şerit detaylı modal ikili takımlarda %41'e varan indirim ve hızlı kargo avantajı.",
                          cta_text: "Fırsatları Kaçırma",
                          cta_color: "#f02d9c",
                          badge_text: "KOMBİN FIRSATI ✨",
                          footer_note: "Sezon sonuna kadar geçerlidir. Fırsat; kupon ve sepette indirim avantajlarını kapsar.",
                          coupon_code: "KOMBIN10",
                          discount_rate: "%10",
                          bg_color: "#dce6f2",
                          bg_image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
                        },
                      },
                      {
                        label: "🎟️ BellButik Gece İndirimi & Kupon",
                        prompt: "BellButik tarzı koyu lüks kupon barı ve sepette ekstra %15 gece indirimi kampanya kurgusu üret",
                        preset: {
                          tag: "BU GECEYE ÖZEL • EKSTRA İNDİRİM",
                          title: "Sepette Ekstra %15 Gece İndirimi Başladı",
                          subtitle: "Kupon kodunu sepette veya hızlı ödeme ekranında girmeniz yeterli. Tüm yeni sezon ürünlerinde geçerlidir.",
                          cta_text: "İndirimli Ürünleri Gör",
                          cta_color: "#e11d48",
                          badge_text: "GECE FIRSATI 🔥",
                          footer_note: "Gece 02:00'a kadar verilen siparişlerde ekstra %15 kupon indirimi anında uygulanır.",
                          coupon_code: "GECE15",
                          discount_rate: "%15",
                          bg_color: "#ffe4e6",
                          bg_image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80",
                        },
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiPrompt(item.prompt)
                          setAiGeneratedPreview(item.preset)
                          notify(`"${item.label}" AI şablonu önizlemeye yüklendi!`)
                        }}
                        className="px-3 py-1.5 rounded-full bg-white border border-[#e2e5ec] hover:border-[#c91d82] text-[11.5px] font-bold text-[#1e293b] hover:text-[#c91d82] cursor-pointer transition shadow-2xs"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Prompt Textarea */}
                <div>
                  <label className="block text-[12px] font-bold text-[#1e293b] mb-1">
                    AI Tasarım Komutunuz (Prompt):
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Örn: Tayt ve spor giyim kategorisi için pembe tonlarda, %30 indirim vurgulu dinamik bir kampanya alanı tasarla..."
                    className="w-full p-3 rounded-[6px] border border-[#cbd5e1] bg-white text-[13px] text-[#1e293b]"
                  />
                </div>

                {/* Hedef Alan Seçimi & Üret Butonu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#48465b] mb-1">
                      Uygulanacak Vitrin Alanı:
                    </label>
                    <select
                      value={aiTarget}
                      onChange={(e) => setAiTarget(e.target.value as any)}
                      className="w-full h-[38px] px-3 rounded-[6px] border border-[#cbd5e1] bg-white text-[12.5px] font-bold text-[#1e293b]"
                    >
                      <option value="banner_carousel">🖼️ Banner Üstü Kategori Carousel Bloğu</option>
                      <option value="hero">🎯 Ana Sayfa Hero Banner (Karşılama Manşeti)</option>
                      <option value="coupon">🎟️ Hero Üstü Kupon Barı &amp; Popup</option>
                      <option value="promo_banner">🏪 İkili Vitrin Kampanya Bannerı</option>
                    </select>
                  </div>

                  {aiTarget === "banner_carousel" && (
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#48465b] mb-1">
                        Hedef Kategori Carousel Bloğu:
                      </label>
                      <select
                        value={aiTargetCategoryIdx}
                        onChange={(e) => setAiTargetCategoryIdx(Number(e.target.value))}
                        className="w-full h-[38px] px-3 rounded-[6px] border border-[#c91d82] bg-white text-[12.5px] font-bold text-[#c91d82]"
                      >
                        {(config.banner_carousels || []).map((bc: BannerCarouselItem, idx: number) => (
                          <option key={bc.id || idx} value={idx}>
                            #{idx + 1} - {bc.title} ({bc.handle || "Tümü"})
                          </option>
                        ))}
                        <option value={-1}>➕ Yeni Kategori Carousel Bloğu Olarak Ekle</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={() => {
                      setAiGenerating(true)
                      setTimeout(() => {
                        const lower = aiPrompt.toLowerCase()
                        const isJean = lower.includes("jean") || lower.includes("denim") || lower.includes("pantolon")
                        const isMont = lower.includes("mont") || lower.includes("kürk") || lower.includes("kış")
                        const isTayt = lower.includes("tayt") || lower.includes("spor")
                        const isCanta = lower.includes("çanta") || lower.includes("gözlük") || lower.includes("aksesuar")

                        setAiGeneratedPreview({
                          tag: isMont
                            ? "KIŞ SEZONU • AI ÖZEL SEÇKİ"
                            : isJean
                            ? "DENİM KOLEKSİYONU • YENİ SEZON"
                            : isTayt
                            ? "AKTİF & ŞIK • TAYT KOLEKSİYONU"
                            : "KOMBİNGO • AI KAMPANYA",
                          title: isMont
                            ? "Mont & Kürk Koleksiyonunda Sezon İndirimi"
                            : isJean
                            ? "Yüksek Bel & Palazzo Jean Fırsatları"
                            : isTayt
                            ? "Toparlayıcı & Likralı Tayt Vitrini"
                            : isCanta
                            ? "İmza Çanta & Gözlük Koleksiyonu"
                            : "Yeni Sezon Kombinlerde Ekstra İndirim",
                          subtitle: aiPrompt,
                          cta_text: isMont
                            ? "Kış Fırsatlarını İncele"
                            : isJean
                            ? "Denim Modellerini Keşfet"
                            : "Fırsatları Kaçırma",
                          cta_color: isJean ? "#1d4ed8" : isMont ? "#b45309" : "#f02d9c",
                          badge_text: isMont ? "KIŞ FIRSATI ❄️" : isJean ? "DENİM SEZONU" : "AI FIRSATI ✨",
                          footer_note: "Sezon sonuna kadar geçerlidir. Fırsat; kupon ve sepette indirim avantajlarını kapsar.",
                          coupon_code: isMont ? "KIS15" : isJean ? "DENIM15" : "KOMBINGOAI15",
                          discount_rate: "%15",
                          bg_color: isJean ? "#dbeafe" : isMont ? "#fef3c7" : "#fce7f3",
                          bg_image_url: isMont
                            ? "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1600&auto=format&fit=crop&q=80"
                            : isJean
                            ? "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1600&auto=format&fit=crop&q=80"
                            : isTayt
                            ? "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1600&auto=format&fit=crop&q=80"
                            : "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
                        })
                        setAiCredits((c) => Math.max(0, c - 5))
                        setAiGenerating(false)
                        notify("✨ Entegre AI Studio yeni kampanya tasarımını oluşturdu!")
                      }, 450)
                    }}
                    className="h-[42px] px-5 rounded-[6px] bg-gradient-to-r from-[#c91d82] via-[#9333ea] to-[#4f46e5] hover:opacity-95 text-white text-[13px] font-extrabold cursor-pointer shadow-sm inline-flex items-center gap-2"
                  >
                    <span>✨</span>
                    <span>{aiGenerating ? "AI Tasarlıyor..." : "Yapay Zeka İle Tasarla (5 Kontör)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (aiTarget === "hero") {
                        updateField("tag", aiGeneratedPreview.tag)
                        updateField("title", aiGeneratedPreview.title)
                        updateField("subtitle", aiGeneratedPreview.subtitle)
                        updateField("btn_text", aiGeneratedPreview.cta_text)
                        updateField("hero_btn_bg", aiGeneratedPreview.cta_color)
                        updateField("media_url", aiGeneratedPreview.bg_image_url)
                        notify("🎯 AI tasarımı Ana Hero Banner'a başarıyla uygulandı! Kaydetmeyi unutmayın.")
                      } else if (aiTarget === "coupon") {
                        updateNested("coupon_banner", "eyebrow", aiGeneratedPreview.tag)
                        updateNested("coupon_banner", "highlight_text", aiGeneratedPreview.discount_rate)
                        updateNested("coupon_banner", "description", aiGeneratedPreview.subtitle)
                        updateNested("coupon_banner", "code", aiGeneratedPreview.coupon_code)
                        notify("🎟️ AI tasarımı Hero Üstü Kupon & Popup alanına uygulandı! Kaydetmeyi unutmayın.")
                      } else if (aiTarget === "promo_banner") {
                        const nextBanners = [...(config.banners || [])]
                        if (nextBanners.length > 0) {
                          nextBanners[0] = {
                            ...nextBanners[0],
                            tag: aiGeneratedPreview.tag,
                            title: aiGeneratedPreview.title,
                            description: aiGeneratedPreview.subtitle,
                            btn_text: aiGeneratedPreview.cta_text,
                            image_url: aiGeneratedPreview.bg_image_url,
                          }
                          updateField("banners", nextBanners)
                        }
                        notify("🏪 AI tasarımı 1. Vitrin Kampanya Bannerına uygulandı!")
                      } else {
                        const list = [...(config.banner_carousels || [])]
                        if (aiTargetCategoryIdx === -1 || list.length === 0) {
                          list.push({
                            id: "banner-carousel-ai-" + Date.now(),
                            title: aiGeneratedPreview.title,
                            title_color: "#111827",
                            cta_text: aiGeneratedPreview.cta_text,
                            cta_link: "/store",
                            cta_color: aiGeneratedPreview.cta_color,
                            footer_note: aiGeneratedPreview.footer_note,
                            badge_text: aiGeneratedPreview.badge_text,
                            bg_image_url: aiGeneratedPreview.bg_image_url,
                            bg_color: aiGeneratedPreview.bg_color,
                            source_type: "latest",
                            handle: "",
                            limit: 8,
                            position: "below_collection",
                            free_shipping_text: "HIZLI KARGO",
                            active: true,
                          })
                        } else if (list[aiTargetCategoryIdx]) {
                          list[aiTargetCategoryIdx] = {
                            ...list[aiTargetCategoryIdx],
                            title: aiGeneratedPreview.title,
                            cta_text: aiGeneratedPreview.cta_text,
                            cta_color: aiGeneratedPreview.cta_color,
                            badge_text: aiGeneratedPreview.badge_text,
                            footer_note: aiGeneratedPreview.footer_note,
                            bg_image_url: aiGeneratedPreview.bg_image_url,
                            bg_color: aiGeneratedPreview.bg_color,
                          }
                        }
                        updateField("banner_carousels", list)
                        notify("🖼️ AI tasarımı seçili Banner Üstü Kategori Carousel bloğuna uygulandı!")
                      }
                    }}
                    className="h-[42px] px-5 rounded-[6px] bg-[#0abb87] hover:bg-[#08976d] text-white text-[13px] font-extrabold cursor-pointer shadow-sm"
                  >
                    ✓ Tek Tıkla Seçili Alana Uygula
                  </button>
                </div>
              </div>

              {/* AI Canlı Tasarım Önizleme Kartı */}
              <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-[10px] border border-[#e2e5ec] bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-extrabold text-[#1e293b]">
                    👁️ Entegre AI Canlı Tasarım Önizlemesi
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                    Hazır Şablon
                  </span>
                </div>

                <div
                  className="relative rounded-[14px] overflow-hidden border border-zinc-200 min-h-[260px] p-5 flex flex-col justify-between shadow-sm"
                  style={{ backgroundColor: aiGeneratedPreview.bg_color }}
                >
                  <img
                    src={aiGeneratedPreview.bg_image_url}
                    alt={aiGeneratedPreview.title}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.45) 55%, rgba(0,0,0,0.35) 100%)",
                    }}
                  />
                  <div className="relative z-10 space-y-1.5 max-w-[320px]">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      {aiGeneratedPreview.tag}
                    </span>
                    <h4 className="text-[22px] font-black text-[#111827] leading-tight">
                      {aiGeneratedPreview.title}
                    </h4>
                    <div
                      className="text-[15px] font-extrabold inline-flex items-center gap-1"
                      style={{ color: aiGeneratedPreview.cta_color }}
                    >
                      <span>{aiGeneratedPreview.cta_text}</span>
                      <span>&gt;</span>
                    </div>
                    <p className="text-[11.5px] text-zinc-800 font-medium line-clamp-2 pt-1">
                      {aiGeneratedPreview.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-end justify-between gap-2 pt-4">
                    <div className="px-3 py-1 rounded-lg bg-black/80 text-white text-[11px] font-bold">
                      Kupon: <span className="text-amber-300 font-black">{aiGeneratedPreview.coupon_code}</span> ({aiGeneratedPreview.discount_rate})
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-gradient-to-tr from-fuchsia-700 via-pink-600 to-amber-500 text-white font-black text-[10.5px] uppercase tracking-wider shadow-md">
                      {aiGeneratedPreview.badge_text}
                    </div>
                  </div>
                </div>

                <div className="text-[11.5px] text-[#74788d] bg-[#f8f9fb] p-3 rounded-[6px] border border-[#ebedf2]">
                  💡 <strong>İpucu:</strong> Üretilen bu AI tasarımını soldaki <strong>&quot;✓ Tek Tıkla Seçili Alana Uygula&quot;</strong> butonuyla doğrudan Hero Banner&apos;a, istediğiniz Kategori Carousel bloğuna veya Kupon Barına aktarabilirsiniz.
                </div>
              </div>
            </div>

            {/* 2. AI TEK TIKLA MAĞAZA RENK & TEMA KONSEPTLERİ */}
            <div className="p-5 rounded-[10px] border border-[#ebedf2] bg-[#fafbfe] space-y-4">
              <div>
                <h5 className="text-[15.5px] font-extrabold text-[#1e293b]">
                  🎨 2. AI Tek Tıkla Mağaza Renk &amp; Atmosfer Sihirbazı
                </h5>
                <p className="text-[12px] text-[#74788d]">
                  Hero Banner, Kupon Barı, Kombingo Collection sekme vurgusu ve Satın Al butonlarını tek tıkla profesyonel moda renk paletleriyle eşleştirin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    name: "BellButik Luxury Crimson",
                    desc: "Koyu obsidyen kupon barı, yakut kırmızı ışık efektleri ve yüksek kontrastlı siyah-beyaz vitrin.",
                    colors: ["#0b0b0c", "#c81e2d", "#ff6a6a", "#111827"],
                    apply: () => {
                      updateNested("coupon_banner", "bg_color", "#0b0b0c")
                      updateNested("coupon_banner", "glow_color", "#c81e2d")
                      updateNested("coupon_banner", "accent_color", "#ff6a6a")
                      updateNested("category_tab_carousel", "accent_color", "#c81e2d")
                      updateField("hero_btn_bg", "#c81e2d")
                      updateField("buy_now_bg", "#c81e2d")
                      notify("🎨 'BellButik Luxury Crimson' AI tema paleti mağazaya uygulandı!")
                    },
                  },
                  {
                    name: "n11 Kampanya & Fırsat Enerjisi",
                    desc: "Canlı fuşya-pembe kategori vurguları, yeşil sepette indirim rozetleri ve dikkat çekici kampanya tonları.",
                    colors: ["#c91d82", "#f02d9c", "#15803d", "#18181b"],
                    apply: () => {
                      updateNested("category_tab_carousel", "accent_color", "#c91d82")
                      updateField("hero_btn_bg", "#c91d82")
                      updateField("buy_now_bg", "#c91d82")
                      updateField("add_to_cart_bg", "#111827")
                      notify("🎨 'n11 Kampanya & Fırsat Enerjisi' AI tema paleti mağazaya uygulandı!")
                    },
                  },
                  {
                    name: "Zara Editorial Monochrome",
                    desc: "Minimalist siyah, antrasit ve taş tonlarıyla sofistike lüks moda evi görünümü.",
                    colors: ["#09090b", "#27272a", "#52525b", "#f4f4f5"],
                    apply: () => {
                      updateNested("category_tab_carousel", "accent_color", "#18181b")
                      updateField("hero_btn_bg", "#09090b")
                      updateField("buy_now_bg", "#18181b")
                      updateField("add_to_cart_bg", "#09090b")
                      notify("🎨 'Zara Editorial Monochrome' AI tema paleti mağazaya uygulandı!")
                    },
                  },
                  {
                    name: "Parisian Rose & Violet",
                    desc: "Kadın giyim ve butik koleksiyonları için zarif gül kurusu ve kraliyet moru uyumu.",
                    colors: ["#7c3aed", "#db2777", "#f472b6", "#fdf2f8"],
                    apply: () => {
                      updateNested("category_tab_carousel", "accent_color", "#db2777")
                      updateField("hero_btn_bg", "#7c3aed")
                      updateField("buy_now_bg", "#db2777")
                      notify("🎨 'Parisian Rose & Violet' AI tema paleti mağazaya uygulandı!")
                    },
                  },
                ].map((theme, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[8px] bg-white border border-[#e2e5ec] flex flex-col justify-between gap-3 hover:border-[#9333ea] transition"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        {theme.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="text-[13.5px] font-extrabold text-[#1e293b]">{theme.name}</div>
                      <p className="text-[11.5px] text-[#74788d] mt-1">{theme.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={theme.apply}
                      className="w-full h-[34px] rounded-[5px] bg-[#111827] hover:bg-[#9333ea] text-white text-[12px] font-bold cursor-pointer transition"
                    >
                      ✨ Bu AI Paletini Uygula
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            1. HERO BANNER & SLIDER AYARLARI
        ========================================================= */}
        {section === "hero" && (
          <div className="space-y-6">
            {/* Hero Banner Aktif / Pasif & Hero Yerine Banner Carousel Koyma Ayarı */}
            <div className="p-4 rounded-[8px] border-2 border-[#3d94fb]/30 bg-[#f4f8ff] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14.5px] font-bold text-[#1e293b]">
                    🎛️ Ana Sayfa Üst Karşılama (Hero) Alanı Görünüm &amp; Konum Kontrolü
                  </span>
                </div>
                <p className="text-[12px] text-[#74788d]">
                  Hero Banner&apos;ı aktif/pasif yapabilir veya Hero Banner yerine doğrudan &quot;Banner Üstü Kategori Carousel&quot; bloğunu en üste koyabilirsiniz.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 px-3.5 py-2 rounded-[6px] bg-white border border-[#e2e5ec] text-[12.5px] font-bold text-[#1e293b] cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={config.show_hero_banner ?? true}
                    onChange={(e) => updateField("show_hero_banner", e.target.checked)}
                    className="w-4 h-4 accent-[#0abb87]"
                  />
                  Hero Banner Aktif
                </label>

                <select
                  value={config.hero_display_mode || "standard_hero"}
                  onChange={(e) => updateField("hero_display_mode", e.target.value)}
                  className="h-[38px] px-3 rounded-[6px] border border-[#3d94fb] bg-white text-[12.5px] font-bold text-[#1e293b] cursor-pointer"
                >
                  <option value="standard_hero">Mod: Standart Hero Banner Göster (Varsayılan)</option>
                  <option value="banner_carousel">Mod: Hero Banner Yerine Banner Üstü Kategori Carousel Koy</option>
                  <option value="both">Mod: İkisini Birlikte Göster (Üstte Hero + Altta Banner Carousel)</option>
                  <option value="hidden">Mod: Hero Alanını Tamamen Gizle (Pasif)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ebedf2]">
              <div>
                <h4 className="text-[16px] font-bold text-[#1e293b]">🎯 Hero Banner &amp; Çoklu Manşet Slider Ayarları</h4>
                <p className="text-[12.5px] text-[#74788d]">
                  Ana sayfa karşılama alanındaki görsel/video, başlık, alt metin, buton renkleri ve çoklu manşet slaytlarını özelleştirin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSlide: HeroSlide = {
                    id: "slide-" + Date.now(),
                    tag: "YENİ KAMPANYA",
                    title: "Yeni Sezon Fırsatlarını Keşfedin",
                    subtitle: "Seçili ürünlerde sepette ekstra indirim ve aynı gün kargo avantajı",
                    btn_text: "Hemen İncele",
                    btn_link: "/store",
                    media_type: "image",
                    media_url: "",
                    mobile_media_url: "",
                    active: true,
                  }
                  updateField("hero_slides", [...(config.hero_slides || []), newSlide])
                }}
                className="h-[36px] px-4 rounded-[5px] bg-[#3d94fb] text-white text-[12.5px] font-semibold cursor-pointer"
              >
                + Çoklu Slider İçin Yeni Slayt Ekle
              </button>
            </div>

            {/* Primary Hero Banner Config + Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4 bg-[#fafbfe] p-5 rounded-[8px] border border-[#ebedf2]">
                <div className="text-[14px] font-bold text-[#1e293b] border-b border-[#ebedf2] pb-2">
                  Ana Hero Karşılama Alanı (Varsayılan / 1. Manşet)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#48465b] mb-1">Üst Rozet / Etiket (Tag)</label>
                    <input
                      type="text"
                      value={config.tag || ""}
                      onChange={(e) => updateField("tag", e.target.value)}
                      placeholder="Örn: 2026 YENİ SEZON KOLEKSİYONU"
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#48465b] mb-1">Ana Başlık (Title)</label>
                    <input
                      type="text"
                      value={config.title || ""}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Örn: Kombingo'ya Hoş Geldiniz"
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] bg-white font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#48465b] mb-1">Alt Açıklama Metni (Subtitle)</label>
                    <input
                      type="text"
                      value={config.subtitle || ""}
                      onChange={(e) => updateField("subtitle", e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#48465b] mb-1">Buton Yazısı</label>
                    <input
                      type="text"
                      value={config.btn_text || ""}
                      onChange={(e) => updateField("btn_text", e.target.value)}
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#48465b] mb-1">Buton Yönlendirme Linki</label>
                    <input
                      type="text"
                      value={config.btn_link || ""}
                      onChange={(e) => updateField("btn_link", e.target.value)}
                      placeholder="/store veya /categories/jean-pantolon"
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Desktop & Mobile Media Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-white rounded-[6px] border border-[#e2e5ec]">
                    <label className="block text-[12px] font-bold text-[#1e293b] mb-1.5">Masaüstü Arka Plan (Görsel veya MP4 Video)</label>
                    <input
                      type="text"
                      value={config.media_url || ""}
                      onChange={(e) => updateField("media_url", e.target.value)}
                      placeholder="Görsel/Video URL veya aşağıdan yükleyin"
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px] mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded bg-[#eef4ff] text-[#3d94fb] text-[12px] font-semibold cursor-pointer hover:bg-[#dbeafe]">
                        {uploadingKey === "hero-desktop" ? "Yükleniyor..." : "📁 Dosya Seç & Yükle"}
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/webm"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              uploadMediaFile(f, "hero-desktop", (url, mType) => {
                                updateField("media_url", url)
                                updateField("media_type", mType)
                              })
                            }
                          }}
                        />
                      </label>
                      {config.media_url && (
                        <button
                          type="button"
                          onClick={() => updateField("media_url", "")}
                          className="px-2.5 py-1.5 rounded bg-red-50 text-red-600 text-[11.5px] font-semibold cursor-pointer"
                        >
                          Temizle
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-[6px] border border-[#e2e5ec]">
                    <label className="block text-[12px] font-bold text-[#1e293b] mb-1.5">Mobil Özel Görsel (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      value={config.mobile_media_url || ""}
                      onChange={(e) => updateField("mobile_media_url", e.target.value)}
                      placeholder="Boş bırakılırsa masaüstü görseli kullanılır"
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px] mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded bg-[#eef4ff] text-[#3d94fb] text-[12px] font-semibold cursor-pointer hover:bg-[#dbeafe]">
                        {uploadingKey === "hero-mobile" ? "Yükleniyor..." : "📱 Mobil Görsel Yükle"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              uploadMediaFile(f, "hero-mobile", (url) => {
                                updateField("mobile_media_url", url)
                              })
                            }
                          }}
                        />
                      </label>
                      {config.mobile_media_url && (
                        <button
                          type="button"
                          onClick={() => updateField("mobile_media_url", "")}
                          className="px-2.5 py-1.5 rounded bg-red-50 text-red-600 text-[11.5px] font-semibold cursor-pointer"
                        >
                          Temizle
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Style Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Banner Yüksekliği</label>
                    <select
                      value={config.hero_height || "75vh"}
                      onChange={(e) => updateField("hero_height", e.target.value)}
                      className="w-full h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                    >
                      <option value="55vh">Kompakt (55vh)</option>
                      <option value="65vh">Orta (65vh)</option>
                      <option value="75vh">Standart (75vh)</option>
                      <option value="85vh">Geniş (85vh)</option>
                      <option value="92vh">Tam Ekran (92vh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">
                      Karartma (%{config.hero_overlay_opacity ?? 15})
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={75}
                      value={config.hero_overlay_opacity ?? 15}
                      onChange={(e) => updateField("hero_overlay_opacity", Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Arka Plan</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.hero_btn_bg || "#7C3AED"}
                        onChange={(e) => updateField("hero_btn_bg", e.target.value)}
                        className="w-9 h-[36px] rounded border border-[#e2e5ec] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.hero_btn_bg || "#7C3AED"}
                        onChange={(e) => updateField("hero_btn_bg", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Yazı Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.hero_btn_text_color || "#ffffff"}
                        onChange={(e) => updateField("hero_btn_text_color", e.target.value)}
                        className="w-9 h-[36px] rounded border border-[#e2e5ec] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.hero_btn_text_color || "#ffffff"}
                        onChange={(e) => updateField("hero_btn_text_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="text-[12.5px] font-bold text-[#48465b] mb-2 flex items-center justify-between">
                  <span>Canlı Hero Banner Önizlemesi</span>
                  <span className="text-[11px] text-[#0abb87] font-semibold">● Anlık Önizleme</span>
                </div>
                <div
                  className="relative flex-1 min-h-[290px] rounded-[10px] border border-[#e2e5ec] overflow-hidden flex flex-col items-center justify-center text-center p-6"
                  style={{
                    backgroundImage: config.media_url ? `url(${config.media_url})` : "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `rgba(0,0,0,${(config.hero_overlay_opacity ?? 15) / 100})` }}
                  />
                  <div className="relative z-10 max-w-md space-y-3">
                    {config.tag && (
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/90 text-purple-900 shadow-xs">
                        {config.tag}
                      </span>
                    )}
                    <h2
                      className="text-[24px] font-extrabold leading-tight"
                      style={{ color: config.media_url ? "#ffffff" : config.hero_text_color || "#09090B" }}
                    >
                      {config.title || "Kombingo'ya Hoş Geldiniz"}
                    </h2>
                    <p
                      className="text-[13px] opacity-90"
                      style={{ color: config.media_url ? "#f1f5f9" : "#4b5563" }}
                    >
                      {config.subtitle}
                    </p>
                    {config.btn_text && (
                      <div className="pt-2">
                        <span
                          className="inline-block px-6 py-2.5 rounded-[8px] text-[13px] font-bold shadow-md"
                          style={{
                            backgroundColor: config.hero_btn_bg || "#7C3AED",
                            color: config.hero_btn_text_color || "#ffffff",
                          }}
                        >
                          {config.btn_text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Slide List (If user adds extra slides) */}
            {Array.isArray(config.hero_slides) && config.hero_slides.length > 0 && (
              <div className="pt-4 border-t border-[#ebedf2] space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-[14.5px] font-bold text-[#1e293b]">
                    Ek Manşet Slaytları ({config.hero_slides.length} Adet)
                  </h5>
                  <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#48465b]">
                    <input
                      type="checkbox"
                      checked={config.hero_autoplay ?? true}
                      onChange={(e) => updateField("hero_autoplay", e.target.checked)}
                    />
                    Otomatik Slayt Geçişi Aktif ({Math.round((config.hero_interval || 5000) / 1000)} sn)
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.hero_slides.map((slide: HeroSlide, idx: number) => (
                    <div key={slide.id || idx} className="p-4 rounded-[8px] border border-[#e2e5ec] bg-white space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-bold text-[#3d94fb]">Slayt #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[12px] font-semibold">
                            <input
                              type="checkbox"
                              checked={slide.active !== false}
                              onChange={(e) => {
                                const next = [...config.hero_slides]
                                next[idx] = { ...slide, active: e.target.checked }
                                updateField("hero_slides", next)
                              }}
                            />
                            Aktif
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const next = config.hero_slides.filter((_: any, i: number) => i !== idx)
                              updateField("hero_slides", next)
                            }}
                            className="px-2 py-1 rounded bg-red-50 text-red-600 text-[11.5px] font-semibold cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={slide.tag || ""}
                          placeholder="Etiket (Tag)"
                          onChange={(e) => {
                            const next = [...config.hero_slides]
                            next[idx] = { ...slide, tag: e.target.value }
                            updateField("hero_slides", next)
                          }}
                          className="h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px]"
                        />
                        <input
                          type="text"
                          value={slide.title || ""}
                          placeholder="Başlık"
                          onChange={(e) => {
                            const next = [...config.hero_slides]
                            next[idx] = { ...slide, title: e.target.value }
                            updateField("hero_slides", next)
                          }}
                          className="h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-semibold"
                        />
                        <input
                          type="text"
                          value={slide.subtitle || ""}
                          placeholder="Alt Açıklama"
                          onChange={(e) => {
                            const next = [...config.hero_slides]
                            next[idx] = { ...slide, subtitle: e.target.value }
                            updateField("hero_slides", next)
                          }}
                          className="col-span-2 h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px]"
                        />
                        <input
                          type="text"
                          value={slide.btn_text || ""}
                          placeholder="Buton Metni"
                          onChange={(e) => {
                            const next = [...config.hero_slides]
                            next[idx] = { ...slide, btn_text: e.target.value }
                            updateField("hero_slides", next)
                          }}
                          className="h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px]"
                        />
                        <input
                          type="text"
                          value={slide.btn_link || ""}
                          placeholder="Buton Linki (/store)"
                          onChange={(e) => {
                            const next = [...config.hero_slides]
                            next[idx] = { ...slide, btn_link: e.target.value }
                            updateField("hero_slides", next)
                          }}
                          className="h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-mono"
                        />
                        <div className="col-span-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={slide.media_url || ""}
                            placeholder="Görsel URL"
                            onChange={(e) => {
                              const next = [...config.hero_slides]
                              next[idx] = { ...slide, media_url: e.target.value }
                              updateField("hero_slides", next)
                            }}
                            className="flex-1 h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px]"
                          />
                          <label className="px-3 py-1.5 rounded bg-[#eef4ff] text-[#3d94fb] text-[11.5px] font-semibold cursor-pointer shrink-0">
                            {uploadingKey === `slide-${idx}` ? "..." : "📁 Yükle"}
                            <input
                              type="file"
                              accept="image/*,video/mp4"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  uploadMediaFile(f, `slide-${idx}`, (url, mType) => {
                                    const next = [...config.hero_slides]
                                    next[idx] = { ...slide, media_url: url, media_type: mType }
                                    updateField("hero_slides", next)
                                  })
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            1.5 HERO BANNER ÜSTÜ KUPON KODU BARI & AKSİYON POPUP (BELL BUTİK LUXURY STİLİ)
        ========================================================= */}
        {section === "coupon_popup" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-[16px] font-bold text-[#1e293b]">
                  🎟️ Hero Banner Üstü Kupon Kodu Tanımlama Barı &amp; Aksiyon Popup Ayarları
                </h4>
                <p className="text-[12.5px] text-[#74788d] mt-0.5">
                  Ana sayfada Hero Banner&apos;ın hemen üstünde yer alan lüks cam efektli (Glassmorphism) kupon barını, kopyalama aksiyonunu, ödeme formuna otomatik kupon tanımlamasını ve onay popup penceresini buradan özelleştirin.
                </p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#eefbf5] border border-[#0abb87] text-[#08976d] font-bold text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.coupon_banner?.enabled ?? true}
                  onChange={(e) => updateNested("coupon_banner", "enabled", e.target.checked)}
                  className="w-4 h-4 accent-[#0abb87]"
                />
                Hero Üstü Kupon Barı Aktif
              </label>
            </div>

            {/* CANLI BELL BUTİK STİLİ KUPON BARI ÖNİZLEMESİ */}
            <div className="rounded-[10px] overflow-hidden border border-[#ebedf2] shadow-sm">
              <div className="bg-[#f8f9fb] px-4 py-2 border-b border-[#ebedf2] flex items-center justify-between text-[11.5px] font-semibold text-[#74788d]">
                <span>CANLI VİTRİN ÖNİZLEMESİ (Hero Banner Üstü Görünüm)</span>
                <span className="text-[#0abb87] font-bold">● Kopyalama &amp; Popup Aksiyonu Aktif</span>
              </div>
              <div
                style={{
                  position: "relative",
                  padding: "16px 20px",
                  backgroundColor: config.coupon_banner?.bg_color || "#0b0b0c",
                  backgroundImage: `radial-gradient(600px 200px at 15% 20%, ${config.coupon_banner?.glow_color || "#c81e2d"}66, transparent 60%), radial-gradient(600px 200px at 85% 80%, ${config.coupon_banner?.glow_color || "#c81e2d"}66, transparent 60%)`,
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "12px 18px",
                    borderRadius: "14px",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
                    border: "1px solid rgba(255,255,255,0.16)",
                    backdropFilter: "blur(14px)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "11px",
                        background: "radial-gradient(circle at 30% 30%, #ffffff, #f3f3f3 60%, #dadada)",
                        color: "#111",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 900,
                      }}
                    >
                      🎟️
                    </div>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[1.4px] opacity-85">
                        {config.coupon_banner?.eyebrow || "KOMBİNGO'YA ÖZEL"}
                      </div>
                      <div className="text-[15.5px] font-extrabold tracking-wide">
                        {config.coupon_banner?.title_prefix || "SEPETTE EKSTRA"}{" "}
                        <span
                          style={{
                            background: `linear-gradient(90deg, #fff, ${config.coupon_banner?.accent_color || "#ff6a6a"})`,
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                            fontWeight: 900,
                          }}
                        >
                          {config.coupon_banner?.highlight_text || "%10"}
                        </span>{" "}
                        {config.coupon_banner?.title_suffix || "İNDİRİM"}
                      </div>
                    </div>
                  </div>

                  <div className="text-[12.5px] text-white/90 text-center flex-1 min-w-[220px]">
                    {config.coupon_banner?.description ||
                      "Kupon kodunu sepette veya hızlı ödeme ekranında girmeniz yeterli."}
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      borderRadius: "11px",
                      border: "1px dashed rgba(255,255,255,0.38)",
                      background: "rgba(15,15,17,0.55)",
                    }}
                  >
                    <span className="text-[10px] tracking-[1.4px] opacity-75 uppercase">
                      {config.coupon_banner?.code_label || "KOD"}
                    </span>
                    <strong className="text-[13.5px] tracking-[1.5px] font-extrabold">
                      {config.coupon_banner?.code || "KOMBINGO10"}
                    </strong>
                    <span className="px-2.5 py-1 rounded-[7px] bg-white text-[#121214] text-[11px] font-extrabold">
                      📋 {config.coupon_banner?.copy_text || "KOPYALA"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* HAZIR RENK TEMA ŞABLONLARI */}
            <div className="p-4 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12.5px] font-bold text-[#1e293b]">🎨 Hazır Lüks Kupon Barı Renk Temaları:</div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: "Bell Bordo Luxury (Orijinal)", bg: "#0b0b0c", glow: "#c81e2d", accent: "#ff6a6a" },
                  { name: "Kombingo Mor / Violet", bg: "#09070f", glow: "#7c3aed", accent: "#c4b5fd" },
                  { name: "Zümrüt Yeşili", bg: "#070d0a", glow: "#059669", accent: "#6ee7b7" },
                  { name: "Altın & Şampanya", bg: "#0c0a07", glow: "#d97706", accent: "#fde68a" },
                  { name: "Gece Siyahı Minimal", bg: "#09090b", glow: "#3f3f46", accent: "#f4f4f5" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      updateNested("coupon_banner", "bg_color", preset.bg)
                      updateNested("coupon_banner", "glow_color", preset.glow)
                      updateNested("coupon_banner", "accent_color", preset.accent)
                      notify(`${preset.name} renk şablonu uygulandı!`)
                    }}
                    className="px-3 py-1.5 rounded-[6px] border border-[#e2e5ec] bg-white hover:border-[#3d94fb] text-[11.5px] font-semibold text-[#1e293b] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.glow }} />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol: Kupon Barı Metin, Kod ve Renk Ayarları */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="text-[14px] font-bold text-[#1e293b]">1. Kupon Barı Metinleri, Kupon Kodu &amp; Renkler</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Üst Mini Başlık (Eyebrow)</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.eyebrow || ""}
                      onChange={(e) => updateNested("coupon_banner", "eyebrow", e.target.value)}
                      placeholder="Örn: KOMBİNGO'YA ÖZEL"
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Aktif Kupon Kodu</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.code || ""}
                      onChange={(e) => updateNested("coupon_banner", "code", e.target.value.toUpperCase())}
                      placeholder="Örn: KOMBINGO10"
                      className="w-full h-[36px] px-3 rounded border border-[#0abb87] text-[13px] font-extrabold font-mono bg-white text-[#08976d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Başlık Başlangıcı</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.title_prefix || ""}
                      onChange={(e) => updateNested("coupon_banner", "title_prefix", e.target.value)}
                      placeholder="SEPETTE EKSTRA"
                      className="w-full h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Vurgulu Oran / Tutar</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.highlight_text || ""}
                      onChange={(e) => updateNested("coupon_banner", "highlight_text", e.target.value)}
                      placeholder="%10"
                      className="w-full h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[13px] bg-white font-extrabold text-[#e11d48]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Başlık Sonu</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.title_suffix || ""}
                      onChange={(e) => updateNested("coupon_banner", "title_suffix", e.target.value)}
                      placeholder="İNDİRİM"
                      className="w-full h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Orta Kampanya Açıklama Metni</label>
                  <input
                    type="text"
                    value={config.coupon_banner?.description || ""}
                    onChange={(e) => updateNested("coupon_banner", "description", e.target.value)}
                    placeholder="Kupon kodunu sepette girmeniz yeterli..."
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Kod Etiketi</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.code_label || "KOD"}
                      onChange={(e) => updateNested("coupon_banner", "code_label", e.target.value)}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Kopyala Buton Yazısı</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.copy_text || "KOPYALA"}
                      onChange={(e) => updateNested("coupon_banner", "copy_text", e.target.value)}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Kopyalandı Yazısı</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.copied_text || "KOPYALANDI"}
                      onChange={(e) => updateNested("coupon_banner", "copied_text", e.target.value)}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Zemin Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.coupon_banner?.bg_color || "#0b0b0c"}
                        onChange={(e) => updateNested("coupon_banner", "bg_color", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.coupon_banner?.bg_color || "#0b0b0c"}
                        onChange={(e) => updateNested("coupon_banner", "bg_color", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[11.5px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Işıltı (Glow) Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.coupon_banner?.glow_color || "#c81e2d"}
                        onChange={(e) => updateNested("coupon_banner", "glow_color", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.coupon_banner?.glow_color || "#c81e2d"}
                        onChange={(e) => updateNested("coupon_banner", "glow_color", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[11.5px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Yüzde Vurgu Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.coupon_banner?.accent_color || "#ff6a6a"}
                        onChange={(e) => updateNested("coupon_banner", "accent_color", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.coupon_banner?.accent_color || "#ff6a6a"}
                        onChange={(e) => updateNested("coupon_banner", "accent_color", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[11.5px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ: Kupon Kopyalama Aksiyonu & Tanımlama Popup Ayarları */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="text-[14px] font-bold text-[#1e293b]">
                  2. Kupon Kodu Tıklama Aksiyonu &amp; Tanımlama Popup Penceresi
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 bg-white rounded-[6px] border border-[#e2e5ec] cursor-pointer">
                    <div>
                      <div className="text-[13px] font-bold text-[#1e293b]">
                        Kupona Tıklandığında Ödeme Formuna Otomatik Tanımla
                      </div>
                      <div className="text-[11.5px] text-[#74788d]">
                        Müşteri kuponu kopyaladığında Hızlı Ödeme (Checkout) formundaki kupon alanına otomatik yazılır.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.coupon_banner?.auto_apply_checkout ?? true}
                      onChange={(e) => updateNested("coupon_banner", "auto_apply_checkout", e.target.checked)}
                      className="w-4 h-4 accent-[#0abb87]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-[6px] border border-[#e2e5ec] cursor-pointer">
                    <div>
                      <div className="text-[13px] font-bold text-[#1e293b]">
                        Kupon Kopyalandığında &quot;Kupon Tanımlandı&quot; Popup&apos;ı Aç
                      </div>
                      <div className="text-[11.5px] text-[#74788d]">
                        Butondaki yeşil &quot;KOPYALANDI&quot; animasyonuna ek olarak şık bir bilgilendirme ve yönlendirme popup&apos;ı gösterir.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.coupon_banner?.show_popup_on_copy ?? true}
                      onChange={(e) => updateNested("coupon_banner", "show_popup_on_copy", e.target.checked)}
                      className="w-4 h-4 accent-[#0abb87]"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Popup Başlığı</label>
                  <input
                    type="text"
                    value={config.coupon_banner?.popup_title || ""}
                    onChange={(e) => updateNested("coupon_banner", "popup_title", e.target.value)}
                    placeholder="Kupon Kodunuz Tanımlandı! 🎉"
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Popup Açıklama Mesajı</label>
                  <textarea
                    rows={3}
                    value={config.coupon_banner?.popup_description || ""}
                    onChange={(e) => updateNested("coupon_banner", "popup_description", e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Popup Aksiyon Buton Metni</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.popup_btn_text || ""}
                      onChange={(e) => updateNested("coupon_banner", "popup_btn_text", e.target.value)}
                      placeholder="Alışverişe Başla & İndirimi Kullan"
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Popup Buton Yönlendirme Linki</label>
                    <input
                      type="text"
                      value={config.coupon_banner?.popup_btn_link || "/store"}
                      onChange={(e) => updateNested("coupon_banner", "popup_btn_link", e.target.value)}
                      placeholder="/store"
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            2. VİTRİN, DUYURU BARLARI, KAMPANYA BANNERLARI & KATEGORİLER
        ========================================================= */}
        {section === "vitrin" && (
          <div className="space-y-8">
            {/* A. Duyuru & Kayan Yazı Bantları */}
            <div className="p-5 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] space-y-4">
              <h4 className="text-[15.5px] font-bold text-[#1e293b]">📢 Tepe Duyuru Barı &amp; Ana Sayfa Kayan Yazı (Marquee)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Tepe Duyuru */}
                <div className="p-4 bg-white rounded-[6px] border border-[#e2e5ec] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-bold text-[#1e293b]">1. En Üst Sabit Duyuru Barı</span>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.top_announcement_enabled ?? true}
                        onChange={(e) => updateField("top_announcement_enabled", e.target.checked)}
                      />
                      Aktif
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.top_announcement || ""}
                    onChange={(e) => updateField("top_announcement", e.target.value)}
                    placeholder="Örn: 2026 YAZ SEZONU MODELLERİ"
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Arka Plan Rengi</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.top_announcement_bg || "#000000"}
                          onChange={(e) => updateField("top_announcement_bg", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.top_announcement_bg || "#000000"}
                          onChange={(e) => updateField("top_announcement_bg", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[12px] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Yazı Rengi</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.top_announcement_text_color || "#ffffff"}
                          onChange={(e) => updateField("top_announcement_text_color", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.top_announcement_text_color || "#ffffff"}
                          onChange={(e) => updateField("top_announcement_text_color", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[12px] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="py-2 px-3 rounded text-center text-[11px] font-bold tracking-widest uppercase"
                    style={{
                      backgroundColor: config.top_announcement_bg || "#000000",
                      color: config.top_announcement_text_color || "#ffffff",
                    }}
                  >
                    {config.top_announcement || "2026 YAZ SEZONU MODELLERİ"}
                  </div>
                </div>

                {/* Ana Sayfa Kayan Yazı */}
                <div className="p-4 bg-white rounded-[6px] border border-[#e2e5ec] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-bold text-[#1e293b]">2. Hero Altı Kayan Yazı (Marquee)</span>
                    <label className="flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.scrolling_text_home_enabled ?? true}
                        onChange={(e) => updateField("scrolling_text_home_enabled", e.target.checked)}
                      />
                      Aktif
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.scrolling_text_home || ""}
                    onChange={(e) => updateField("scrolling_text_home", e.target.value)}
                    placeholder="Örn: 3000 ₺ Üzeri Alışverişlerinizde Kargo Ücretsiz"
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Arka Plan Rengi</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.scrolling_text_home_bg || "#000000"}
                          onChange={(e) => updateField("scrolling_text_home_bg", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.scrolling_text_home_bg || "#000000"}
                          onChange={(e) => updateField("scrolling_text_home_bg", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[12px] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Yazı Rengi</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.scrolling_text_home_text_color || "#ffffff"}
                          onChange={(e) => updateField("scrolling_text_home_text_color", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.scrolling_text_home_text_color || "#ffffff"}
                          onChange={(e) => updateField("scrolling_text_home_text_color", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[12px] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="py-2 px-3 rounded text-center text-[11px] font-bold tracking-widest uppercase truncate"
                    style={{
                      backgroundColor: config.scrolling_text_home_bg || "#000000",
                      color: config.scrolling_text_home_text_color || "#ffffff",
                    }}
                  >
                    {config.scrolling_text_home} • {config.scrolling_text_home}
                  </div>
                </div>
              </div>
            </div>

            {/* B. İkili / Bento Kampanya Bannerları */}
            <div className="p-5 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-[15.5px] font-bold text-[#1e293b]">🖼️ Vitrin Kampanya Bannerları (İkili / Bento Kartlar)</h4>
                  <p className="text-[12px] text-[#74788d]">
                    Ana sayfada Hero'nun hemen altında yer alan 2'li veya 3'lü koleksiyon tanıtım kartları.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[12.5px] font-semibold">
                    <input
                      type="checkbox"
                      checked={config.show_promo_banners ?? true}
                      onChange={(e) => updateField("show_promo_banners", e.target.checked)}
                    />
                    Vitrinde Göster
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next: PromoBannerItem = {
                        tag: "Yeni Koleksiyon",
                        title: "SEZONUN FAVORİLERİ",
                        description: "Özel tasarım kesimler ve yüksek kumaş kalitesiyle yeni sezon ürünleri.",
                        btn_text: "Şimdi Keşfet",
                        btn_link: "/store",
                        image_url: "",
                        btn_bg: "#4F46E5",
                        btn_text_color: "#ffffff",
                        active: true,
                      }
                      updateField("banners", [...(config.banners || []), next])
                    }}
                    className="h-[34px] px-3.5 rounded bg-[#0abb87] text-white text-[12px] font-bold cursor-pointer"
                  >
                    + Yeni Banner Kartı Ekle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(config.banners || []).map((b: PromoBannerItem, idx: number) => (
                  <div key={idx} className="p-4 bg-white rounded-[8px] border border-[#e2e5ec] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[13px] font-bold text-[#48465b]">Kampanya Banner #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = config.banners.filter((_: any, i: number) => i !== idx)
                          updateField("banners", next)
                        }}
                        className="px-2.5 py-1 rounded bg-red-50 text-red-600 text-[11.5px] font-semibold cursor-pointer"
                      >
                        🗑 Kartı Sil
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Üst Rozet (Tag)</label>
                        <input
                          type="text"
                          value={b.tag || ""}
                          onChange={(e) => {
                            const next = [...config.banners]
                            next[idx] = { ...b, tag: e.target.value }
                            updateField("banners", next)
                          }}
                          className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Ana Başlık</label>
                        <input
                          type="text"
                          value={b.title || ""}
                          onChange={(e) => {
                            const next = [...config.banners]
                            next[idx] = { ...b, title: e.target.value }
                            updateField("banners", next)
                          }}
                          className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-bold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Açıklama Metni</label>
                        <textarea
                          rows={2}
                          value={b.description || ""}
                          onChange={(e) => {
                            const next = [...config.banners]
                            next[idx] = { ...b, description: e.target.value }
                            updateField("banners", next)
                          }}
                          className="w-full p-2.5 rounded border border-[#e2e5ec] text-[12.5px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Buton Metni</label>
                        <input
                          type="text"
                          value={b.btn_text || ""}
                          onChange={(e) => {
                            const next = [...config.banners]
                            next[idx] = { ...b, btn_text: e.target.value }
                            updateField("banners", next)
                          }}
                          className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Yönlendirme Linki</label>
                        <input
                          type="text"
                          value={b.btn_link || ""}
                          onChange={(e) => {
                            const next = [...config.banners]
                            next[idx] = { ...b, btn_link: e.target.value }
                            updateField("banners", next)
                          }}
                          className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Arka Plan Görseli (İsteğe Bağlı)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={b.image_url || ""}
                            placeholder="Görsel URL veya bilgisayardan yükleyin"
                            onChange={(e) => {
                              const next = [...config.banners]
                              next[idx] = { ...b, image_url: e.target.value }
                              updateField("banners", next)
                            }}
                            className="flex-1 h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px]"
                          />
                          <label className="px-3 py-1.5 rounded bg-[#eef4ff] text-[#3d94fb] text-[12px] font-semibold cursor-pointer shrink-0">
                            {uploadingKey === `banner-${idx}` ? "..." : "📁 Görsel Yükle"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  uploadMediaFile(f, `banner-${idx}`, (url) => {
                                    const next = [...config.banners]
                                    next[idx] = { ...b, image_url: url }
                                    updateField("banners", next)
                                  })
                                }
                              }}
                            />
                          </label>
                          {b.image_url && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...config.banners]
                                next[idx] = { ...b, image_url: "" }
                                updateField("banners", next)
                              }}
                              className="px-2 py-1.5 rounded bg-red-50 text-red-600 text-[11px] font-semibold"
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* C. n11 Stili Kategori Tab & 5'li Ürün Carousel Ayarları */}
            <div className="p-5 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-[15.5px] font-bold text-[#1e293b]">
                    🏷️ n11 Stili Kategori Tab &amp; 5&apos;li Ürün Carousel Ayarları
                  </h4>
                  <p className="text-[12px] text-[#74788d]">
                    Ana sayfada oval hap (Pill) kategori sekmeleri, &quot;Tümünü Gör &gt;&quot; bağlantısı ve 5&apos;li kaydırılabilir ürün vitrini ayarları.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next: CategoryCircle = {
                      name: "Yeni Kategori",
                      handle: "yeni-kategori",
                      icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 8z"/></svg>`,
                      active: true,
                    }
                    updateField("categories", [...(config.categories || []), next])
                  }}
                  className="h-[34px] px-3.5 rounded bg-[#3d94fb] text-white text-[12px] font-bold cursor-pointer"
                >
                  + Yeni Kategori Tabı Ekle
                </button>
              </div>

              {/* n11 Kategori Tab Carousel Başlık, Renk ve Rozet Ayarları */}
              <div className="p-4 bg-white rounded-[8px] border border-[#e2e5ec] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Bölüm Başlığı (Sol Üst)</label>
                    <input
                      type="text"
                      value={config.category_tab_carousel?.title || "Yeni Sezon & Öne Çıkan Ürünler"}
                      onChange={(e) => updateNested("category_tab_carousel", "title", e.target.value)}
                      placeholder="Yeni Mağazalardan Ürünler"
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Sağ Üst Link Metni</label>
                    <input
                      type="text"
                      value={config.category_tab_carousel?.view_all_text || "Tümünü Gör"}
                      onChange={(e) => updateNested("category_tab_carousel", "view_all_text", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Kart Altı Siyah Bant Metni</label>
                    <input
                      type="text"
                      value={config.category_tab_carousel?.free_shipping_text ?? "ÜCRETSİZ KARGO"}
                      onChange={(e) => updateNested("category_tab_carousel", "free_shipping_text", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#48465b] mb-1">Aktif Tab &amp; Vurgu Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.category_tab_carousel?.accent_color || "#c91d82"}
                        onChange={(e) => updateNested("category_tab_carousel", "accent_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.category_tab_carousel?.accent_color || "#c91d82"}
                        onChange={(e) => updateNested("category_tab_carousel", "accent_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Canlı n11 Pill Tab Önizlemesi */}
                <div className="pt-2 border-t border-[#f1f3f9]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[15px] font-bold text-[#1f2937]">
                      {config.category_tab_carousel?.title || "Yeni Sezon & Öne Çıkan Ürünler"}
                    </span>
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: config.category_tab_carousel?.accent_color || "#c91d82" }}
                    >
                      {config.category_tab_carousel?.view_all_text || "Tümünü Gör"} &gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {["Tümü", "Kuponlu Ürün", "İndirimli Ürün", "Çok Al Az Öde", ...(config.categories || []).map((c: any) => c.name)].map(
                      (tabName, i) => (
                        <span
                          key={i}
                          className="h-[34px] px-4 rounded-full inline-flex items-center justify-center text-[12px] whitespace-nowrap"
                          style={
                            i === 0
                              ? {
                                  border: `1.5px solid ${config.category_tab_carousel?.accent_color || "#c91d82"}`,
                                  backgroundColor: `${config.category_tab_carousel?.accent_color || "#c91d82"}12`,
                                  fontWeight: 700,
                                  color: "#111827",
                                }
                              : {
                                  border: "1px solid #e2e5ec",
                                  backgroundColor: "#ffffff",
                                  color: "#374151",
                                }
                          }
                        >
                          {tabName}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(config.categories || []).map((cat: CategoryCircle, idx: number) => (
                  <div key={idx} className="p-3.5 bg-white rounded-[8px] border border-[#e2e5ec] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden text-slate-700">
                        {cat.icon?.trim().startsWith("<svg") ? (
                          <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                        ) : cat.icon ? (
                          <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold">{cat.name?.slice(0, 2)}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = config.categories.filter((_: any, i: number) => i !== idx)
                          updateField("categories", next)
                        }}
                        className="text-red-500 hover:text-red-700 text-[11.5px] font-semibold cursor-pointer"
                      >
                        🗑 Sil
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-0.5">Kategori Başlığı</label>
                      <input
                        type="text"
                        value={cat.name || ""}
                        onChange={(e) => {
                          const next = [...config.categories]
                          next[idx] = { ...cat, name: e.target.value }
                          updateField("categories", next)
                        }}
                        className="w-full h-[32px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-0.5">Kategori Handle (Slug)</label>
                      <input
                        type="text"
                        value={cat.handle || ""}
                        onChange={(e) => {
                          const next = [...config.categories]
                          next[idx] = { ...cat, handle: e.target.value }
                          updateField("categories", next)
                        }}
                        className="w-full h-[32px] px-2.5 rounded border border-[#e2e5ec] text-[12px] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-0.5">SVG Kodu veya Görsel URL</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={cat.icon || ""}
                          onChange={(e) => {
                            const next = [...config.categories]
                            next[idx] = { ...cat, icon: e.target.value }
                            updateField("categories", next)
                          }}
                          className="flex-1 h-[30px] px-2 rounded border border-[#e2e5ec] text-[11px] font-mono"
                        />
                        <label className="px-2 py-1 rounded bg-[#eef4ff] text-[#3d94fb] text-[11px] font-semibold cursor-pointer shrink-0">
                          📁
                          <input
                            type="file"
                            accept="image/*,.svg"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) {
                                uploadMediaFile(f, `cat-${idx}`, (url) => {
                                  const next = [...config.categories]
                                  next[idx] = { ...cat, icon: url }
                                  updateField("categories", next)
                                })
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* D. Güvence Rozetleri (Trust Badges) */}
            <div className="p-5 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[15.5px] font-bold text-[#1e293b]">🛡️ Ana Sayfa Alt Güvence Rozetleri</h4>
                  <p className="text-[12px] text-[#74788d]">Footer üstünde yer alan 3'lü müşteri güven rozetleri.</p>
                </div>
                <label className="flex items-center gap-1.5 text-[12.5px] font-semibold">
                  <input
                    type="checkbox"
                    checked={config.show_trust_badges ?? true}
                    onChange={(e) => updateField("show_trust_badges", e.target.checked)}
                  />
                  Aktif
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(config.trust_badges || []).map((tb: TrustBadgeItem, idx: number) => (
                  <div key={idx} className="p-3.5 bg-white rounded-[6px] border border-[#e2e5ec] space-y-2">
                    <input
                      type="text"
                      value={tb.title || ""}
                      onChange={(e) => {
                        const next = [...config.trust_badges]
                        next[idx] = { ...tb, title: e.target.value }
                        updateField("trust_badges", next)
                      }}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-bold"
                    />
                    <input
                      type="text"
                      value={tb.description || ""}
                      onChange={(e) => {
                        const next = [...config.trust_badges]
                        next[idx] = { ...tb, description: e.target.value }
                        updateField("trust_badges", next)
                      }}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            3. ANA SAYFA CAROUSEL BLOK AYARLARI (BANNER ÜSTÜ CAROUSEL & STANDART CAROUSEL)
        ========================================================= */}
        {section === "carousel" && (
          <div className="space-y-8">
            {/* A. BANNER ÜSTÜ KATEGORİ & ÜRÜN CAROUSEL BLOKLARI (n11 Stili - Üst Yuvarlak Marka Etiketleri Olmadan) */}
            <div className="p-5 rounded-[8px] border-2 border-[#c91d82]/30 bg-[#fdf8fc] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f3d6e8]">
                <div>
                  <h4 className="text-[16px] font-bold text-[#1e293b]">
                    🖼️ Banner Üstü Kategori &amp; Ürün Carousel Blokları (n11 Stili Kampanya Alanı)
                  </h4>
                  <p className="text-[12.5px] text-[#74788d] mt-0.5">
                    Geniş kampanya görseli üzerinde sol tarafta başlık (&quot;Kışlık Kombinler&quot;, &quot;Fırsatları Kaçırma &gt;&quot;), sağ tarafta ise üst yuvarlak marka ikonları olmadan doğrudan kaydırılabilir ürün kartları gösterir.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateField("banner_carousels", DEFAULT_ALL_CATEGORY_BANNER_CAROUSELS)
                      notify("Tüm 10 kategori için Banner Carousel tasarımları yüklendi! Kaydetmeyi unutmayın.")
                    }}
                    className="h-[38px] px-3.5 rounded-[5px] bg-[#111827] hover:opacity-95 text-white text-[12.5px] font-bold cursor-pointer shadow-xs"
                  >
                    ⚡ Tüm Kategorileri Yükle (10 Kategori)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newBannerCarousel: BannerCarouselItem = {
                        id: "banner-carousel-" + Date.now(),
                        title: "Kışlık Kombinler",
                        title_color: "#111827",
                        cta_text: "Fırsatları Kaçırma",
                        cta_link: "/store",
                        cta_color: "#f02d9c",
                        footer_note: "Sezon sonuna kadar geçerlidir. Fırsat; kupon ve sepette indirim avantajlarını kapsar.",
                        badge_text: "YENİ SEZON FIRSATI",
                        bg_image_url:
                          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
                        bg_color: "#dce6f2",
                        source_type: "latest",
                        handle: "",
                        limit: 8,
                        position: "below_collection",
                        free_shipping_text: "HIZLI KARGO",
                        active: true,
                      }
                      updateField("banner_carousels", [...(config.banner_carousels || []), newBannerCarousel])
                    }}
                    className="h-[38px] px-4 rounded-[5px] bg-[#c91d82] hover:opacity-95 text-white text-[13px] font-bold cursor-pointer shadow-xs"
                  >
                    + Yeni Banner Üstü Carousel Ekle
                  </button>
                </div>
              </div>

              {(config.banner_carousels || []).map((bBlock: BannerCarouselItem, bIdx: number) => (
                <div
                  key={bBlock.id || bIdx}
                  className="p-5 rounded-[8px] border border-[#e2e5ec] bg-white space-y-4 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ebedf2]">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded bg-[#c91d82] text-white text-[11.5px] font-bold">
                        Banner Carousel #{bIdx + 1}
                      </span>
                      <span className="text-[14.5px] font-bold text-[#1e293b]">
                        {bBlock.title || "Kışlık Kombinler"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[12.5px] font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bBlock.active !== false}
                          onChange={(e) => {
                            const next = [...(config.banner_carousels || [])]
                            next[bIdx] = { ...bBlock, active: e.target.checked }
                            updateField("banner_carousels", next)
                          }}
                        />
                        Aktif
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (config.banner_carousels || []).filter((_: any, i: number) => i !== bIdx)
                          updateField("banner_carousels", next)
                        }}
                        className="px-3 py-1 rounded bg-red-50 text-red-600 text-[12px] font-semibold cursor-pointer"
                      >
                        🗑 Sil
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Sol Ana Başlık</label>
                      <input
                        type="text"
                        value={bBlock.title || ""}
                        onChange={(e) => {
                          const next = [...(config.banner_carousels || [])]
                          next[bIdx] = { ...bBlock, title: e.target.value }
                          updateField("banner_carousels", next)
                        }}
                        placeholder="Örn: Kışlık Kombinler"
                        className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Alt Başlık / Link Metni</label>
                      <input
                        type="text"
                        value={bBlock.cta_text || ""}
                        onChange={(e) => {
                          const next = [...(config.banner_carousels || [])]
                          next[bIdx] = { ...bBlock, cta_text: e.target.value }
                          updateField("banner_carousels", next)
                        }}
                        placeholder="Örn: Fırsatları Kaçırma"
                        className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-semibold text-[#f02d9c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Yönlendirme Linki</label>
                      <input
                        type="text"
                        value={bBlock.cta_link || "/store"}
                        onChange={(e) => {
                          const next = [...(config.banner_carousels || [])]
                          next[bIdx] = { ...bBlock, cta_link: e.target.value }
                          updateField("banner_carousels", next)
                        }}
                        className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12px] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Kart Kargo Şerit Yazısı</label>
                      <input
                        type="text"
                        value={bBlock.free_shipping_text || "HIZLI KARGO"}
                        onChange={(e) => {
                          const next = [...(config.banner_carousels || [])]
                          next[bIdx] = { ...bBlock, free_shipping_text: e.target.value }
                          updateField("banner_carousels", next)
                        }}
                        className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12px] font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Sol Alt Kampanya Açıklama Notu</label>
                      <input
                        type="text"
                        value={bBlock.footer_note || ""}
                        onChange={(e) => {
                          const next = [...(config.banner_carousels || [])]
                          next[bIdx] = { ...bBlock, footer_note: e.target.value }
                          updateField("banner_carousels", next)
                        }}
                        className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Ürün Kaynağı</label>
                      <select
                        value={bBlock.source_type || "latest"}
                        onChange={(e) => {
                          const next = [...(config.banner_carousels || [])]
                          next[bIdx] = { ...bBlock, source_type: e.target.value as any }
                          updateField("banner_carousels", next)
                        }}
                        className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                      >
                        <option value="latest">Son Eklenen Ürünler</option>
                        <option value="category">Belirli Bir Kategori (Handle)</option>
                        <option value="collection">Belirli Bir Koleksiyon (Handle)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Kategori Handle / Konum</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={bBlock.handle || ""}
                          onChange={(e) => {
                            const next = [...(config.banner_carousels || [])]
                            next[bIdx] = { ...bBlock, handle: e.target.value }
                            updateField("banner_carousels", next)
                          }}
                          placeholder="kombin"
                          className="h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[12px] font-mono"
                        />
                        <select
                          value={bBlock.position || "below_collection"}
                          onChange={(e) => {
                            const next = [...(config.banner_carousels || [])]
                            next[bIdx] = { ...bBlock, position: e.target.value as any }
                            updateField("banner_carousels", next)
                          }}
                          className="h-[36px] px-2 rounded border border-[#e2e5ec] text-[11.5px] bg-white font-semibold"
                        >
                          <option value="below_collection">Kombingo Collection Altında (Varsayılan)</option>
                          <option value="replace_hero">Hero Banner Yerinde (En Üstte)</option>
                          <option value="above_banners">İkili Kampanya Banner Üstünde</option>
                          <option value="below_banners">İkili Kampanya Banner Altında</option>
                          <option value="below_products">Tüm Ürün Vitrini Altında</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">
                        Arka Plan Kampanya Görseli (Sol Model / Konsept Görseli)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bBlock.bg_image_url || ""}
                          onChange={(e) => {
                            const next = [...(config.banner_carousels || [])]
                            next[bIdx] = { ...bBlock, bg_image_url: e.target.value }
                            updateField("banner_carousels", next)
                          }}
                          placeholder="Görsel URL veya bilgisayardan yükleyin"
                          className="flex-1 h-[36px] px-3 rounded border border-[#e2e5ec] text-[12px]"
                        />
                        <label className="px-3.5 py-2 rounded bg-[#eef4ff] text-[#3d94fb] text-[12px] font-bold cursor-pointer shrink-0">
                          {uploadingKey === `bcarousel-${bIdx}` ? "Yükleniyor..." : "📁 Görsel Yükle"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) {
                                uploadMediaFile(f, `bcarousel-${bIdx}`, (url) => {
                                  const next = [...(config.banner_carousels || [])]
                                  next[bIdx] = { ...bBlock, bg_image_url: url }
                                  updateField("banner_carousels", next)
                                })
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ebedf2]">
              <div>
                <h4 className="text-[16px] font-bold text-[#1e293b]">🎠 Ana Sayfa Ürün / Koleksiyon Carousel Blok Ayarları</h4>
                <p className="text-[12.5px] text-[#74788d]">
                  Ana sayfaya istediğiniz sayıda yatay kaydırılabilir (Carousel) ürün vitrin bloğu ekleyin, kaynağını ve konumunu seçin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newBlock: CarouselBlockItem = {
                    id: "carousel-" + Date.now(),
                    title: "Yeni Sezon Kombin Seçkisi",
                    subtitle: "Editörün seçtiği en popüler kombin ve parçalar",
                    badge_text: "ÖZEL SEÇKİ",
                    source_type: "latest",
                    handle: "",
                    limit: 8,
                    position: "below_banners",
                    bg_color: "#ffffff",
                    text_color: "#111827",
                    accent_color: "#7C3AED",
                    btn_text: "Tümünü Gör",
                    btn_link: "/store",
                    autoplay: true,
                    active: true,
                  }
                  updateField("carousel_blocks", [...(config.carousel_blocks || []), newBlock])
                }}
                className="h-[38px] px-4 rounded-[5px] bg-[#0abb87] text-white text-[13px] font-bold cursor-pointer shadow-xs"
              >
                + Yeni Carousel Bloğu Ekle
              </button>
            </div>

            {(!config.carousel_blocks || config.carousel_blocks.length === 0) ? (
              <div className="p-8 text-center bg-[#fafbfe] rounded-[8px] border border-dashed border-[#cbd5e1]">
                <p className="text-[14px] font-semibold text-[#48465b]">Henüz eklenmiş bir Carousel Bloğu bulunmuyor.</p>
                <p className="text-[12.5px] text-[#74788d] mt-1">
                  Yukarıdaki &quot;+ Yeni Carousel Bloğu Ekle&quot; butonuna tıklayarak ana sayfanıza yatay ürün karuseli ekleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {config.carousel_blocks.map((block: CarouselBlockItem, idx: number) => (
                  <div key={block.id || idx} className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ebedf2]">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-[#3d94fb] text-white text-[12px] font-bold">
                          Carousel #{idx + 1}
                        </span>
                        <span className="text-[14.5px] font-bold text-[#1e293b]">{block.title || "İsimsiz Carousel Bloğu"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-[12.5px] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={block.active !== false}
                            onChange={(e) => {
                              const next = [...config.carousel_blocks]
                              next[idx] = { ...block, active: e.target.checked }
                              updateField("carousel_blocks", next)
                            }}
                          />
                          Aktif
                        </label>
                        <label className="flex items-center gap-1.5 text-[12.5px] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={block.autoplay ?? true}
                            onChange={(e) => {
                              const next = [...config.carousel_blocks]
                              next[idx] = { ...block, autoplay: e.target.checked }
                              updateField("carousel_blocks", next)
                            }}
                          />
                          Otomatik Kaydır
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const next = config.carousel_blocks.filter((_: any, i: number) => i !== idx)
                            updateField("carousel_blocks", next)
                          }}
                          className="px-3 py-1 rounded bg-red-50 text-red-600 text-[12px] font-semibold cursor-pointer"
                        >
                          🗑 Bloğu Sil
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Üst Rozet Metni</label>
                        <input
                          type="text"
                          value={block.badge_text || ""}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, badge_text: e.target.value }
                            updateField("carousel_blocks", next)
                          }}
                          placeholder="Örn: VİTRİN SEÇKİSİ"
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Carousel Başlığı</label>
                        <input
                          type="text"
                          value={block.title || ""}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, title: e.target.value }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-bold bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Alt Açıklama Metni</label>
                        <input
                          type="text"
                          value={block.subtitle || ""}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, subtitle: e.target.value }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Ürün Kaynağı</label>
                        <select
                          value={block.source_type || "latest"}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, source_type: e.target.value as any }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                        >
                          <option value="latest">Son Eklenen Ürünler (Yeni Gelenler)</option>
                          <option value="category">Belirli Bir Kategori (Handle ile)</option>
                          <option value="collection">Belirli Bir Koleksiyon (Handle ile)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">
                          Kategori / Koleksiyon Handle
                        </label>
                        <input
                          type="text"
                          value={block.handle || ""}
                          disabled={block.source_type === "latest"}
                          placeholder={block.source_type === "latest" ? "Tüm yeni ürünler" : "Örn: jean-pantolon, kombin"}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, handle: e.target.value }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-mono bg-white disabled:bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Ana Sayfadaki Konumu</label>
                        <select
                          value={block.position || "below_banners"}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, position: e.target.value as any }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                        >
                          <option value="above_banners">Hero Altı (Kampanya Bannerları Üstü)</option>
                          <option value="below_banners">Kampanya Bannerları Altı</option>
                          <option value="below_products">Ana Ürün Vitrini Altı</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Maksimum Ürün Sayısı</label>
                        <input
                          type="number"
                          min={4}
                          max={24}
                          value={block.limit || 8}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, limit: Number(e.target.value) || 8 }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Tümünü Gör Buton Metni</label>
                        <input
                          type="text"
                          value={block.btn_text || ""}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, btn_text: e.target.value }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Tümünü Gör Linki</label>
                        <input
                          type="text"
                          value={block.btn_link || ""}
                          onChange={(e) => {
                            const next = [...config.carousel_blocks]
                            next[idx] = { ...block, btn_link: e.target.value }
                            updateField("carousel_blocks", next)
                          }}
                          className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Blok Arka Plan Rengi</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={block.bg_color || "#ffffff"}
                            onChange={(e) => {
                              const next = [...config.carousel_blocks]
                              next[idx] = { ...block, bg_color: e.target.value }
                              updateField("carousel_blocks", next)
                            }}
                            className="w-9 h-[36px] rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={block.bg_color || "#ffffff"}
                            onChange={(e) => {
                              const next = [...config.carousel_blocks]
                              next[idx] = { ...block, bg_color: e.target.value }
                              updateField("carousel_blocks", next)
                            }}
                            className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Vurgu / Rozet Rengi</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={block.accent_color || "#7C3AED"}
                            onChange={(e) => {
                              const next = [...config.carousel_blocks]
                              next[idx] = { ...block, accent_color: e.target.value }
                              updateField("carousel_blocks", next)
                            }}
                            className="w-9 h-[36px] rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={block.accent_color || "#7C3AED"}
                            onChange={(e) => {
                              const next = [...config.carousel_blocks]
                              next[idx] = { ...block, accent_color: e.target.value }
                              updateField("carousel_blocks", next)
                            }}
                            className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            4. BUTON TASARIM & EYLEM AYARLARI
        ========================================================= */}
        {section === "buttons" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[16px] font-bold text-[#1e293b]">🔘 Satın Alma &amp; Eylem Butonları Tasarımı</h4>
              <p className="text-[12.5px] text-[#74788d]">
                Ürün detay sayfasındaki Hemen Al, Sepete Ekle ve WhatsApp ile Sipariş butonlarının metinlerini, renklerini ve köşe stillerini özelleştirin.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Hemen Al */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="flex items-center justify-between border-b border-[#ebedf2] pb-2.5">
                  <span className="text-[14px] font-bold text-[#1e293b]">⚡ Hemen Al Butonu</span>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.buy_now_enabled ?? true}
                      onChange={(e) => updateField("buy_now_enabled", e.target.checked)}
                    />
                    Aktif
                  </label>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Metni</label>
                  <input
                    type="text"
                    value={config.buy_now_text || "HEMEN AL"}
                    onChange={(e) => updateField("buy_now_text", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Arka Plan Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.buy_now_bg || "#E50000"}
                        onChange={(e) => updateField("buy_now_bg", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.buy_now_bg || "#E50000"}
                        onChange={(e) => updateField("buy_now_bg", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Yazı Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.buy_now_text_color || "#ffffff"}
                        onChange={(e) => updateField("buy_now_text_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.buy_now_text_color || "#ffffff"}
                        onChange={(e) => updateField("buy_now_text_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full h-12 font-bold text-[14px] tracking-widest uppercase transition"
                  style={{
                    backgroundColor: config.buy_now_bg || "#E50000",
                    color: config.buy_now_text_color || "#ffffff",
                    borderRadius: config.button_border_radius || "0px",
                  }}
                >
                  {config.buy_now_text || "HEMEN AL"}
                </button>
              </div>

              {/* Sepete Ekle */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="flex items-center justify-between border-b border-[#ebedf2] pb-2.5">
                  <span className="text-[14px] font-bold text-[#1e293b]">🛍️ Sepete Ekle Butonu</span>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.add_to_cart_enabled ?? true}
                      onChange={(e) => updateField("add_to_cart_enabled", e.target.checked)}
                    />
                    Aktif
                  </label>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Metni</label>
                  <input
                    type="text"
                    value={config.add_to_cart_text || "SEPETE EKLE"}
                    onChange={(e) => updateField("add_to_cart_text", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Arka Plan Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.add_to_cart_bg || "#000000"}
                        onChange={(e) => updateField("add_to_cart_bg", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.add_to_cart_bg || "#000000"}
                        onChange={(e) => updateField("add_to_cart_bg", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Yazı Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.add_to_cart_text_color || "#ffffff"}
                        onChange={(e) => updateField("add_to_cart_text_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.add_to_cart_text_color || "#ffffff"}
                        onChange={(e) => updateField("add_to_cart_text_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full h-12 font-bold text-[14px] tracking-widest uppercase transition"
                  style={{
                    backgroundColor: config.add_to_cart_bg || "#000000",
                    color: config.add_to_cart_text_color || "#ffffff",
                    borderRadius: config.button_border_radius || "0px",
                  }}
                >
                  {config.add_to_cart_text || "SEPETE EKLE"}
                </button>
              </div>

              {/* WhatsApp Sipariş */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="flex items-center justify-between border-b border-[#ebedf2] pb-2.5">
                  <span className="text-[14px] font-bold text-[#1e293b]">💬 WhatsApp Sipariş Butonu</span>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.whatsapp_enabled ?? true}
                      onChange={(e) => updateField("whatsapp_enabled", e.target.checked)}
                    />
                    Aktif
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Metni</label>
                    <input
                      type="text"
                      value={config.whatsapp_text || "WHATSAPP İLE SİPARİŞ"}
                      onChange={(e) => updateField("whatsapp_text", e.target.value)}
                      className="w-full h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">WhatsApp Numarası</label>
                    <input
                      type="text"
                      value={config.whatsapp_number || "905323370081"}
                      onChange={(e) => updateField("whatsapp_number", e.target.value)}
                      placeholder="90532..."
                      className="w-full h-[36px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] font-mono bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Arka Plan Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.whatsapp_bg || "#ffffff"}
                        onChange={(e) => updateField("whatsapp_bg", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.whatsapp_bg || "#ffffff"}
                        onChange={(e) => updateField("whatsapp_bg", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Yazı &amp; Çerçeve Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.whatsapp_text_color || "#25D366"}
                        onChange={(e) => updateField("whatsapp_text_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.whatsapp_text_color || "#25D366"}
                        onChange={(e) => updateField("whatsapp_text_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full h-12 font-bold text-[13px] tracking-widest uppercase border transition"
                  style={{
                    backgroundColor: config.whatsapp_bg || "#ffffff",
                    color: config.whatsapp_text_color || "#25D366",
                    borderColor: config.whatsapp_text_color || "#25D366",
                    borderRadius: config.button_border_radius || "0px",
                  }}
                >
                  {config.whatsapp_text || "WHATSAPP İLE SİPARİŞ"}
                </button>
              </div>
            </div>

            {/* Global Button Radius */}
            <div className="p-4 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[13.5px] font-bold text-[#1e293b]">Genel Buton Köşe Yuvarlaklığı (Border Radius)</div>
                <div className="text-[12px] text-[#74788d]">Tüm aksiyon butonlarının köşe keskinliğini belirler.</div>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: "Keskin (0px)", val: "0px" },
                  { label: "Hafif (6px)", val: "6px" },
                  { label: "Modern (10px)", val: "10px" },
                  { label: "Tam Yuvarlak (Pill)", val: "9999px" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => updateField("button_border_radius", opt.val)}
                    className={`px-3.5 py-2 rounded text-[12px] font-semibold cursor-pointer border ${
                      (config.button_border_radius || "0px") === opt.val
                        ? "bg-[#3d94fb] text-white border-[#3d94fb]"
                        : "bg-white text-[#48465b] border-[#e2e5ec]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            5. HEADER & FOOTER AYARLARI
        ========================================================= */}
        {section === "header_footer" && (
          <div className="space-y-8">
            {/* Header Settings */}
            <div className="p-5 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] space-y-5">
              <h4 className="text-[16px] font-bold text-[#1e293b] border-b border-[#ebedf2] pb-2.5">
                🔝 Üst Alan (Header) &amp; Mağaza Logosu Ayarları
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Header Logo Upload */}
                <div className="p-4 bg-white rounded-[8px] border border-[#e2e5ec] space-y-3">
                  <div className="text-[13px] font-bold text-[#1e293b]">Üst Menü (Header) Logosu</div>
                  <div className="h-16 bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center p-2">
                    <img
                      src={logoConfig.headerLogo || "/logo.png"}
                      alt="Header Logo"
                      className="max-h-12 object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    value={logoConfig.headerLogo || ""}
                    onChange={(e) => updateLogoField("headerLogo", e.target.value)}
                    placeholder="/logo.png veya URL"
                    className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px]"
                  />
                  <label className="inline-flex px-3 py-1.5 rounded bg-[#eef4ff] text-[#3d94fb] text-[12px] font-semibold cursor-pointer">
                    {uploadingKey === "logo-header" ? "Yükleniyor..." : "📁 Yeni Header Logosu Yükle"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) {
                          uploadMediaFile(f, "logo-header", (url) => updateLogoField("headerLogo", url))
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Footer Logo Upload */}
                <div className="p-4 bg-white rounded-[8px] border border-[#e2e5ec] space-y-3">
                  <div className="text-[13px] font-bold text-[#1e293b]">Alt Alan (Footer) Logosu</div>
                  <div className="h-16 bg-slate-900 rounded border border-slate-700 flex items-center justify-center p-2">
                    <img
                      src={logoConfig.footerLogo || logoConfig.headerLogo || "/logo.png"}
                      alt="Footer Logo"
                      className="max-h-12 object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    value={logoConfig.footerLogo || ""}
                    onChange={(e) => updateLogoField("footerLogo", e.target.value)}
                    placeholder="/logo.png veya URL"
                    className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12px]"
                  />
                  <label className="inline-flex px-3 py-1.5 rounded bg-[#eef4ff] text-[#3d94fb] text-[12px] font-semibold cursor-pointer">
                    {uploadingKey === "logo-footer" ? "Yükleniyor..." : "📁 Yeni Footer Logosu Yükle"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) {
                          uploadMediaFile(f, "logo-footer", (url) => updateLogoField("footerLogo", url))
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Header Behavior & Colors */}
                <div className="p-4 bg-white rounded-[8px] border border-[#e2e5ec] space-y-3">
                  <div className="text-[13px] font-bold text-[#1e293b]">Header Görünüm &amp; İkonlar</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Arka Plan Rengi</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={config.header_settings?.bg_color || "#ffffff"}
                          onChange={(e) => updateNested("header_settings", "bg_color", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.header_settings?.bg_color || "#ffffff"}
                          onChange={(e) => updateNested("header_settings", "bg_color", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[11.5px] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#74788d] mb-1">İkon &amp; Yazı Rengi</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={config.header_settings?.text_color || "#000000"}
                          onChange={(e) => updateNested("header_settings", "text_color", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.header_settings?.text_color || "#000000"}
                          onChange={(e) => updateNested("header_settings", "text_color", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-[#e2e5ec] text-[11.5px] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1 text-[12.5px] font-medium text-[#48465b]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.header_settings?.sticky ?? true}
                        onChange={(e) => updateNested("header_settings", "sticky", e.target.checked)}
                      />
                      Kaydırırken Sabit Kalsın (Sticky Header)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.header_settings?.show_search ?? true}
                        onChange={(e) => updateNested("header_settings", "show_search", e.target.checked)}
                      />
                      Arama (Büyüteç) İkonunu Göster
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.header_settings?.show_account ?? true}
                        onChange={(e) => updateNested("header_settings", "show_account", e.target.checked)}
                      />
                      Hesabım İkonunu Göster
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Corporate & Social Settings */}
            <div className="p-5 rounded-[8px] border border-[#ebedf2] bg-[#fafbfe] space-y-5">
              <h4 className="text-[16px] font-bold text-[#1e293b] border-b border-[#ebedf2] pb-2.5">
                🔻 Alt Alan (Footer) Kurumsal Bilgiler, İletişim &amp; Sosyal Medya
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Firma Resmi Ünvanı</label>
                  <input
                    type="text"
                    value={logoConfig.contactCompany || ""}
                    onChange={(e) => updateLogoField("contactCompany", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Müşteri Hizmetleri Telefonu</label>
                  <input
                    type="text"
                    value={logoConfig.contactPhone || ""}
                    onChange={(e) => updateLogoField("contactPhone", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Destek E-Posta Adresi</label>
                  <input
                    type="text"
                    value={logoConfig.contactEmail || ""}
                    onChange={(e) => updateLogoField("contactEmail", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Açık Adres Bilgisi</label>
                  <input
                    type="text"
                    value={logoConfig.contactAddress || ""}
                    onChange={(e) => updateLogoField("contactAddress", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Çalışma Saatleri</label>
                  <input
                    type="text"
                    value={logoConfig.contactHours || ""}
                    onChange={(e) => updateLogoField("contactHours", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Telif Hakkı (Copyright) Metni</label>
                  <input
                    type="text"
                    value={logoConfig.footerCopyrightText || ""}
                    onChange={(e) => updateLogoField("footerCopyrightText", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Instagram Profil URL</label>
                  <input
                    type="text"
                    value={config.footer_settings?.instagram_url || ""}
                    onChange={(e) => updateNested("footer_settings", "instagram_url", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Facebook Sayfa URL</label>
                  <input
                    type="text"
                    value={config.footer_settings?.facebook_url || ""}
                    onChange={(e) => updateNested("footer_settings", "facebook_url", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            6. ÜRÜN DETAY TASARIM VE AYAR İŞLEMLERİ
        ========================================================= */}
        {section === "product_detail" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[16px] font-bold text-[#1e293b]">👗 Ürün Detay Sayfası Tasarım &amp; Dönüşüm Ayarları</h4>
              <p className="text-[12.5px] text-[#74788d]">
                Ürün sayfasındaki kayan kampanya şeridi, canlı ziyaretçi sayacı, güven rozetleri ve kargo/iade bilgilendirme metinlerini yönetin.
              </p>
            </div>

            {/* Ürün Detay Kayan Yazı */}
            <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1e293b]">Ürün Detay Kayan Kampanya Şeridi (Marquee)</span>
                <label className="flex items-center gap-1.5 text-[12.5px] font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.scrolling_text_product_enabled ?? true}
                    onChange={(e) => updateField("scrolling_text_product_enabled", e.target.checked)}
                  />
                  Aktif
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Kayan Kampanya Metni</label>
                  <input
                    type="text"
                    value={config.scrolling_text_product || ""}
                    onChange={(e) => updateField("scrolling_text_product", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Arka Plan Rengi</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.scrolling_text_product_bg || "#FFD700"}
                      onChange={(e) => updateField("scrolling_text_product_bg", e.target.value)}
                      className="w-9 h-[36px] rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.scrolling_text_product_bg || "#FFD700"}
                      onChange={(e) => updateField("scrolling_text_product_bg", e.target.value)}
                      className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Yazı Rengi</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.scrolling_text_product_text_color || "#000000"}
                      onChange={(e) => updateField("scrolling_text_product_text_color", e.target.value)}
                      className="w-9 h-[36px] rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.scrolling_text_product_text_color || "#000000"}
                      onChange={(e) => updateField("scrolling_text_product_text_color", e.target.value)}
                      className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Canlı İnceleyen Kişi & Rozetler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-3">
                <div className="text-[14px] font-bold text-[#1e293b]">👁️ Sosyal Kanıt &amp; Modül Görünürlüğü</div>
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#48465b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.product_detail_settings?.show_live_viewers ?? true}
                    onChange={(e) => updateNested("product_detail_settings", "show_live_viewers", e.target.checked)}
                  />
                  &quot;Şu an X kişi bu ürünü inceliyor&quot; Canlı Sayacını Göster
                </label>
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Min. Ziyaretçi</label>
                    <input
                      type="number"
                      value={config.product_detail_settings?.live_viewers_min ?? 12}
                      onChange={(e) => updateNested("product_detail_settings", "live_viewers_min", Number(e.target.value))}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#74788d] mb-1">Maks. Ziyaretçi</label>
                    <input
                      type="number"
                      value={config.product_detail_settings?.live_viewers_max ?? 34}
                      onChange={(e) => updateNested("product_detail_settings", "live_viewers_max", Number(e.target.value))}
                      className="w-full h-[34px] px-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#48465b] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={config.product_detail_settings?.show_favorite_button ?? true}
                    onChange={(e) => updateNested("product_detail_settings", "show_favorite_button", e.target.checked)}
                  />
                  Favorilere Ekle (Kalp) Butonunu Göster
                </label>
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#48465b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.product_detail_settings?.show_trust_row ?? true}
                    onChange={(e) => updateNested("product_detail_settings", "show_trust_row", e.target.checked)}
                  />
                  Buton Altı &quot;Güvenli Ödeme &amp; Aynı Gün Kargo&quot; İkonlarını Göster
                </label>
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#48465b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.product_detail_settings?.show_sticky_mobile_bar ?? true}
                    onChange={(e) => updateNested("product_detail_settings", "show_sticky_mobile_bar", e.target.checked)}
                  />
                  Mobilde Alt Yapışkan Sepete Ekle Çubuğunu Göster
                </label>
              </div>

              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-3">
                <div className="text-[14px] font-bold text-[#1e293b]">📦 Kargo &amp; İade Akordiyon Metinleri</div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Aynı Gün Kargo &amp; Teslimat Bilgilendirmesi</label>
                  <textarea
                    rows={3}
                    value={config.product_detail_settings?.shipping_info_text || ""}
                    onChange={(e) => updateNested("product_detail_settings", "shipping_info_text", e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Kolay İade &amp; Değişim Koşulları Metni</label>
                  <textarea
                    rows={3}
                    value={config.product_detail_settings?.return_policy_text || ""}
                    onChange={(e) => updateNested("product_detail_settings", "return_policy_text", e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            7. SEPET TASARIM VE AYAR İŞLEMLERİ
        ========================================================= */}
        {section === "cart" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[16px] font-bold text-[#1e293b]">🛒 Sepet Sayfası Tasarım &amp; Dönüşüm Ayarları</h4>
              <p className="text-[12.5px] text-[#74788d]">
                Sepet sayfasındaki ücretsiz kargo ilerleme çubuğu, kupon kodu alanı ve &quot;Güvenli Ödemeye Geç&quot; butonunun tasarımını yönetin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="text-[14px] font-bold text-[#1e293b]">Ücretsiz Kargo Barı &amp; Sepet Modülleri</div>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-[#48465b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cart_settings?.show_free_shipping_bar ?? true}
                    onChange={(e) => updateNested("cart_settings", "show_free_shipping_bar", e.target.checked)}
                  />
                  Sepette Ücretsiz Kargo İlerleme Çubuğunu Göster
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Ücretsiz Kargo Hedefi (₺)</label>
                    <input
                      type="number"
                      value={config.cart_settings?.free_shipping_threshold ?? 3000}
                      onChange={(e) => updateNested("cart_settings", "free_shipping_threshold", Number(e.target.value))}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">İlerleme Çubuğu Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.cart_settings?.free_shipping_bar_color || "#10B981"}
                        onChange={(e) => updateNested("cart_settings", "free_shipping_bar_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.cart_settings?.free_shipping_bar_color || "#10B981"}
                        onChange={(e) => updateNested("cart_settings", "free_shipping_bar_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-[#48465b] cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={config.cart_settings?.show_coupon_box ?? true}
                    onChange={(e) => updateNested("cart_settings", "show_coupon_box", e.target.checked)}
                  />
                  Sepet Özetinde İndirim Kuponu Alanını Göster
                </label>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Sepet Altı Güven Notu</label>
                  <input
                    type="text"
                    value={config.cart_settings?.trust_note_text || ""}
                    onChange={(e) => updateNested("cart_settings", "trust_note_text", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                  />
                </div>
              </div>

              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="text-[14px] font-bold text-[#1e293b]">Sepet Onay (&quot;Güvenli Ödemeye Geç&quot;) Butonu</div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Metni</label>
                  <input
                    type="text"
                    value={config.cart_settings?.checkout_btn_text || "Güvenli Ödemeye Geç"}
                    onChange={(e) => updateNested("cart_settings", "checkout_btn_text", e.target.value)}
                    className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Arka Plan Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.cart_settings?.checkout_btn_bg || "#000000"}
                        onChange={(e) => updateNested("cart_settings", "checkout_btn_bg", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.cart_settings?.checkout_btn_bg || "#000000"}
                        onChange={(e) => updateNested("cart_settings", "checkout_btn_bg", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Yazı Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.cart_settings?.checkout_btn_text_color || "#ffffff"}
                        onChange={(e) => updateNested("cart_settings", "checkout_btn_text_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.cart_settings?.checkout_btn_text_color || "#ffffff"}
                        onChange={(e) => updateNested("cart_settings", "checkout_btn_text_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[#74788d] mb-1.5">Canlı Sepet Butonu Önizlemesi:</div>
                  <button
                    type="button"
                    className="w-full h-12 rounded-[6px] font-bold text-[14px] shadow-sm"
                    style={{
                      backgroundColor: config.cart_settings?.checkout_btn_bg || "#000000",
                      color: config.cart_settings?.checkout_btn_text_color || "#ffffff",
                    }}
                  >
                    {config.cart_settings?.checkout_btn_text || "Güvenli Ödemeye Geç"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            8. ÖDEME FORMU (CHECKOUT) TASARIM VE AYAR İŞLEMLERİ
        ========================================================= */}
        {section === "checkout" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[16px] font-bold text-[#1e293b]">💳 Tek Sayfa Ödeme Formu (Hızlı Checkout) Tasarım &amp; Alan Ayarları</h4>
              <p className="text-[12.5px] text-[#74788d]">
                Ödeme modalındaki logo, başlıklar, zorunlu/opsiyonel form alanları, varsayılan ödeme yöntemi ve &quot;Siparişi Tamamla&quot; butonunu özelleştirin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Form Fields & Toggles */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="text-[14px] font-bold text-[#1e293b]">Form Alanları Görünürlük &amp; Zorunluluk Ayarları</div>
                <div className="space-y-2.5 text-[13px] font-medium text-[#48465b]">
                  <label className="flex items-center justify-between p-2.5 bg-white rounded border border-[#e2e5ec] cursor-pointer">
                    <span>E-Posta Adresi Alanını Göster</span>
                    <input
                      type="checkbox"
                      checked={config.checkout_settings?.show_email ?? true}
                      onChange={(e) => updateNested("checkout_settings", "show_email", e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-white rounded border border-[#e2e5ec] cursor-pointer">
                    <span>E-Posta Adresini Zorunlu Tut</span>
                    <input
                      type="checkbox"
                      checked={config.checkout_settings?.require_email ?? true}
                      onChange={(e) => updateNested("checkout_settings", "require_email", e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-white rounded border border-[#e2e5ec] cursor-pointer">
                    <span>Apartman / Daire / Sipariş Notu Alanını Göster</span>
                    <input
                      type="checkbox"
                      checked={config.checkout_settings?.show_order_note ?? true}
                      onChange={(e) => updateNested("checkout_settings", "show_order_note", e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-white rounded border border-[#e2e5ec] cursor-pointer">
                    <span>Bireysel / Kurumsal E-Fatura (TCKN / VKN) Seçimini Göster</span>
                    <input
                      type="checkbox"
                      checked={config.checkout_settings?.show_invoice_type ?? true}
                      onChange={(e) => updateNested("checkout_settings", "show_invoice_type", e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-white rounded border border-[#e2e5ec] cursor-pointer">
                    <span>Sipariş Özetinde İndirim Kuponu Alanını Göster</span>
                    <input
                      type="checkbox"
                      checked={config.checkout_settings?.show_coupon ?? true}
                      onChange={(e) => updateNested("checkout_settings", "show_coupon", e.target.checked)}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Varsayılan Seçili Ödeme Yöntemi</label>
                  <select
                    value={config.checkout_settings?.default_payment_method || "credit_card"}
                    onChange={(e) => updateNested("checkout_settings", "default_payment_method", e.target.value)}
                    className="w-full h-[38px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white font-semibold"
                  >
                    <option value="credit_card">Kredi / Banka Kartı (PayTR 3D Secure)</option>
                    <option value="cash_on_delivery">Kapıda Nakit Ödeme</option>
                    <option value="cod_cc">Kapıda Kredi Kartı ile Ödeme</option>
                    <option value="havale">Havale / EFT</option>
                  </select>
                </div>
              </div>

              {/* Right: Titles, Logo & Submit Button */}
              <div className="p-5 rounded-[8px] border border-[#e2e5ec] bg-[#fafbfe] space-y-4">
                <div className="text-[14px] font-bold text-[#1e293b]">Ödeme Formu Görünüm, Logo &amp; Buton Tasarımı</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Teslimat Bölümü Başlığı</label>
                    <input
                      type="text"
                      value={config.checkout_settings?.delivery_section_title || "Teslimat Adresi"}
                      onChange={(e) => updateNested("checkout_settings", "delivery_section_title", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Ödeme Bölümü Başlığı</label>
                    <input
                      type="text"
                      value={config.checkout_settings?.payment_section_title || "Ödeme"}
                      onChange={(e) => updateNested("checkout_settings", "payment_section_title", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12.5px] bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Siparişi Tamamla Buton Metni</label>
                    <input
                      type="text"
                      value={config.checkout_settings?.submit_btn_text || "Siparişi Tamamla"}
                      onChange={(e) => updateNested("checkout_settings", "submit_btn_text", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[13px] bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Arka Plan Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.checkout_settings?.submit_btn_bg || "#1A1A1A"}
                        onChange={(e) => updateNested("checkout_settings", "submit_btn_bg", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.checkout_settings?.submit_btn_bg || "#1A1A1A"}
                        onChange={(e) => updateNested("checkout_settings", "submit_btn_bg", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Buton Yazı Rengi</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.checkout_settings?.submit_btn_text_color || "#ffffff"}
                        onChange={(e) => updateNested("checkout_settings", "submit_btn_text_color", e.target.value)}
                        className="w-9 h-[36px] rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.checkout_settings?.submit_btn_text_color || "#ffffff"}
                        onChange={(e) => updateNested("checkout_settings", "submit_btn_text_color", e.target.value)}
                        className="w-full h-[36px] px-2 rounded border border-[#e2e5ec] text-[12px] font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">SSL Güvenlik Alt Metni</label>
                    <input
                      type="text"
                      value={config.checkout_settings?.ssl_badge_text || ""}
                      onChange={(e) => updateNested("checkout_settings", "ssl_badge_text", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#48465b] mb-1">Ödeme Altı Copyright Metni</label>
                    <input
                      type="text"
                      value={config.checkout_settings?.copyright_text || ""}
                      onChange={(e) => updateNested("checkout_settings", "copyright_text", e.target.value)}
                      className="w-full h-[36px] px-3 rounded border border-[#e2e5ec] text-[12px] bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-3.5 rounded-[6px] font-bold text-[15px] shadow-sm"
                    style={{
                      backgroundColor: config.checkout_settings?.submit_btn_bg || "#1A1A1A",
                      color: config.checkout_settings?.submit_btn_text_color || "#ffffff",
                    }}
                  >
                    {config.checkout_settings?.submit_btn_text || "Siparişi Tamamla"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DesignStudio
