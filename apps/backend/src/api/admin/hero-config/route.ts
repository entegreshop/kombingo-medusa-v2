import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "hero-config.json")
const legacyConfigFilePath = path.join(os.homedir(), ".xoox-hero-config.json")

export const defaultCategories = [
  {
    name: "Jean Pantolon",
    handle: "jean-pantolon",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l1.5 16h-4.5L12 9l-2 11H5.5L7 4z"/><path d="M7 7h10"/><path d="M9 4v3"/><path d="M15 4v3"/></svg>`,
    active: true,
  },
  {
    name: "Tayt",
    handle: "tayt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l1 16h-3.5L12 9.5 10.5 20H7.0L8 4z"/><path d="M8 7.5h8"/></svg>`,
    active: true,
  },
  {
    name: "Sweat",
    handle: "sweat",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l-3 3.5L5.5 15l1.5-2v6.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5V13l1.5 2 2.5-2.5L18 9V6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v3z"/><path d="M9 10a3 3 0 0 0 6 0"/><path d="M12 3v5"/></svg>`,
    active: true,
  },
  {
    name: "Mont & Kürk",
    handle: "mont",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a3 3 0 0 0-3-3h-2L12 3.5 10 5H8a3 3 0 0 0-3 3z"/><path d="M12 3.5V21"/><path d="M5 9h14"/><path d="M5 13h14"/><path d="M5 17h14"/></svg>`,
    active: true,
  },
  {
    name: "Kombin",
    handle: "kombin",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a2 2 0 0 0-2 2c0 .5.2.9.5 1.2L5 8.5v3l4.5 1V19A1.5 1.5 0 0 0 11 20.5h2a1.5 1.5 0 0 0 1.5-1.5v-6.5l4.5-1v-3L13.5 6.2c.3-.3.5-.7.5-1.2a2 2 0 0 0-2-2z"/><path d="M8 8.5V17"/><path d="M16 8.5V17"/></svg>`,
    active: true,
  },
  {
    name: "Tshirt",
    handle: "tshirt",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5.5L3.5 8 5.5 11l2-1.5v10.0A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5V9.5l2 1.5 2-3L18 5.5V3.5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 6 3.5v2.0z"/><path d="M9.5 2h5A2.5 2.5 0 0 1 12 4.5 2.5 2.5 0 0 1 9.5 2z"/></svg>`,
    active: true,
  },
  {
    name: "Gözlük",
    handle: "gozluk",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a3 3 0 0 1 3-3h3.5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v0z"/><path d="M11.5 11a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-3.5a3 3 0 0 1-3-3v0z"/><path d="M9.5 11h2.5"/><path d="M3 11.5c.5-3 2-4.5 3.5-4.5"/><path d="M21 11.5c-.5-3-2-4.5-3.5-4.5"/></svg>`,
    active: true,
  },
  {
    name: "Çanta",
    handle: "canta",
    icon: `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 8z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8"/></svg>`,
    active: true,
  },
]

export const defaultBanners = [
  {
    tag: "Trend Koleksiyon",
    title: "PREMIUM JEAN KOLEKSİYONU",
    description: "En boy likralı kot taytlar ve yüksek bel toparlayıcı jean pantolonlar şimdi en popüler kesimleriyle vitrinde.",
    btn_text: "Koleksiyonu Keşfet",
    btn_link: "/categories/jean-pantolon",
    image_url: "",
    btn_bg: "#4F46E5",
    btn_text_color: "#ffffff",
    active: true,
  },
  {
    tag: "Özel Seçki",
    title: "YAZ SEZONU KOMBİNLERİ",
    description: "Oysho modal kumaş şalvar takımlar ve çift şerit paraşüt kargo pantolonlar ile konforlu ve şık kombinler.",
    btn_text: "Şimdi İncele",
    btn_link: "/categories/kombin",
    image_url: "",
    btn_bg: "#7C3AED",
    btn_text_color: "#ffffff",
    active: true,
  },
]

export const defaultCarouselBlocks = [
  {
    id: "carousel-yeni-sezon",
    title: "Öne Çıkan Sezon Ürünleri",
    subtitle: "En çok tercih edilen yeni sezon kombin ve parçaları keşfedin",
    badge_text: "VİTRİN SEÇKİSİ",
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
  },
]

export const defaultBannerCarousels = [
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

export const defaultTrustBadges = [
  {
    title: "ÜCRETSİZ KARGO",
    description: "3000 ₺ ve üzeri tüm siparişlerinizde kargo bedava.",
    icon: "truck",
    active: true,
  },
  {
    title: "%100 GÜVENLİ ÖDEME",
    description: "256-Bit SSL sertifikası ve 3D Secure ile güvenli alışveriş.",
    icon: "shield",
    active: true,
  },
  {
    title: "KOLAY İADE & DEĞİŞİM",
    description: "14 gün içerisinde koşulsuz iade ve hızlı değişim garantisi.",
    icon: "refresh",
    active: true,
  },
]

export const defaultData = {
  // Hero Banner & Slider Settings
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
  hero_slides: [] as any[],

  // Vitrin Settings
  categories: defaultCategories,
  banners: defaultBanners,
  carousel_blocks: defaultCarouselBlocks,
  banner_carousels: defaultBannerCarousels,
  trust_badges: defaultTrustBadges,
  show_promo_banners: true,
  show_category_circles: true,
  show_trust_badges: true,

  // Announcement & Marquee Bars
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

  // Button Settings
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

  // Header & Footer Settings
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

  // Product Detail Settings
  product_detail_settings: {
    show_live_viewers: true,
    live_viewers_min: 12,
    live_viewers_max: 34,
    show_favorite_button: true,
    show_reviews_link: true,
    show_trust_row: true,
    trust_badge_1_text: "Güvenli Ödeme",
    trust_badge_2_text: "Aynı Gün Kargo",
    shipping_info_text: "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür.",
    return_policy_text: "Siparişinizdeki ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve etiketleri sökülmemiş olması şartıyla iade edebilirsiniz.",
    show_sticky_mobile_bar: true,
  },

  // Cart Settings
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

  // Checkout Modal / Form Settings
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

  // Hero-Top Luxury Coupon Banner & Action Popup (BellButik Style)
  coupon_banner: {
    enabled: true,
    eyebrow: "KOMBİNGO'YA ÖZEL",
    title_prefix: "SEPETTE EKSTRA",
    highlight_text: "%10",
    title_suffix: "İNDİRİM",
    description: "Kupon kodunu sepette girmeniz yeterli. Kampanya seçili yeni sezon ürünlerinde geçerlidir.",
    code_label: "KOD",
    code: "KOMBINGO10",
    copy_text: "KOPYALA",
    copied_text: "KOPYALANDI",
    bg_color: "#09090b",
    glow_color: "#c81e2d",
    accent_color: "#ffb4b4",
    auto_apply_checkout: true,
    show_popup_on_copy: true,
    popup_title: "Kupon Kodunuz Tanımlandı!",
    popup_description:
      "İndirim kuponunuz panoya kopyalandı ve ödeme adımınız için otomatik olarak kaydedildi. Sepette veya hızlı ödeme ekranında anında kullanabilirsiniz.",
    popup_btn_text: "Alışverişe Devam Et",
    popup_btn_link: "",
  },

  // n11-Style Category Pill Tab & 5-Column Product Carousel Settings
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
}

export function readHeroConfig() {
  try {
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyConfigFilePath)
      ? legacyConfigFilePath
      : null
    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : defaultCategories,
        banners: Array.isArray(parsed.banners) && parsed.banners.length > 0 ? parsed.banners : defaultBanners,
        carousel_blocks: Array.isArray(parsed.carousel_blocks) ? parsed.carousel_blocks : defaultCarouselBlocks,
        banner_carousels:
          Array.isArray(parsed.banner_carousels) &&
          parsed.banner_carousels.length > 0 &&
          !(parsed.banner_carousels.length === 1 && parsed.banner_carousels[0]?.id === "banner-carousel-1")
            ? parsed.banner_carousels
            : defaultBannerCarousels,
        trust_badges: Array.isArray(parsed.trust_badges) && parsed.trust_badges.length > 0 ? parsed.trust_badges : defaultTrustBadges,
        header_settings: { ...defaultData.header_settings, ...(parsed.header_settings || {}) },
        footer_settings: { ...defaultData.footer_settings, ...(parsed.footer_settings || {}) },
        product_detail_settings: { ...defaultData.product_detail_settings, ...(parsed.product_detail_settings || {}) },
        cart_settings: { ...defaultData.cart_settings, ...(parsed.cart_settings || {}) },
        checkout_settings: { ...defaultData.checkout_settings, ...(parsed.checkout_settings || {}) },
        coupon_banner: { ...defaultData.coupon_banner, ...(parsed.coupon_banner || {}) },
        category_tab_carousel: { ...defaultData.category_tab_carousel, ...(parsed.category_tab_carousel || {}) },
      }
    }
  } catch (err) {
    console.error("Error reading hero config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing hero config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readHeroConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body as any) || {}
  const incoming = body.config && typeof body.config === "object" ? body.config : body
  const config = readHeroConfig()

  const updatedConfig = {
    ...config,
    ...incoming,
    header_settings: {
      ...config.header_settings,
      ...(incoming.header_settings || {}),
    },
    footer_settings: {
      ...config.footer_settings,
      ...(incoming.footer_settings || {}),
    },
    product_detail_settings: {
      ...config.product_detail_settings,
      ...(incoming.product_detail_settings || {}),
    },
    cart_settings: {
      ...config.cart_settings,
      ...(incoming.cart_settings || {}),
    },
    checkout_settings: {
      ...config.checkout_settings,
      ...(incoming.checkout_settings || {}),
    },
    coupon_banner: {
      ...config.coupon_banner,
      ...(incoming.coupon_banner || {}),
    },
    category_tab_carousel: {
      ...config.category_tab_carousel,
      ...(incoming.category_tab_carousel || {}),
    },
  }

  // Keep primary hero fields synced with hero_slides[0] if hero_slides was updated
  if (Array.isArray(incoming.hero_slides) && incoming.hero_slides.length > 0) {
    const firstActive = incoming.hero_slides.find((s: any) => s.active !== false) || incoming.hero_slides[0]
    if (firstActive && incoming.title === undefined) {
      updatedConfig.tag = firstActive.tag ?? updatedConfig.tag
      updatedConfig.title = firstActive.title ?? updatedConfig.title
      updatedConfig.subtitle = firstActive.subtitle ?? updatedConfig.subtitle
      updatedConfig.btn_text = firstActive.btn_text ?? updatedConfig.btn_text
      updatedConfig.btn_link = firstActive.btn_link ?? updatedConfig.btn_link
      updatedConfig.media_url = firstActive.media_url ?? updatedConfig.media_url
      updatedConfig.mobile_media_url = firstActive.mobile_media_url ?? updatedConfig.mobile_media_url
      updatedConfig.media_type = firstActive.media_type ?? updatedConfig.media_type
    }
  }

  const success = writeConfig(updatedConfig)
  if (success) {
    res.json({ success: true, config: updatedConfig })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
