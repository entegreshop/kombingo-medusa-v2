import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag, Plus, Trash, ArrowPath, CheckCircle, ChevronLeft, Pencil } from "@medusajs/icons"

interface ProductImage {
  url: string
  filename?: string
  type?: "image" | "video"
  color?: string
}

const isVideoUrl = (url: string) => {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg|avi)($|\?)/i.test(url) || url.includes("/video")
}

interface SelectedVariant {
  id?: string
  color: string
  size: string
  price: string
  discountedPrice: string
  costPrice: string
  sku: string
  barcode: string
  stock: string
  image: string
}

const INITIAL_COLORS = ["SİYAH", "KAHVE", "KREM", "LACİVERT", "BEYAZ", "PEMBE", "YEŞİL"]
const INITIAL_SIZES = ["S", "M", "L", "XL", "XXL"]

const IkasProductsPage = () => {
  // --- Navigation & Mode ---
  const [view, setView] = useState<"list" | "create" | "edit">("list")
  const [activeSubTab, setActiveSubTab] = useState<string>("urunler")
  const [lastSyncedSearch, setLastSyncedSearch] = useState<string>("")

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return
      const currentSearch = window.location.search
      setLastSyncedSearch((prev) => {
        if (prev === currentSearch) return prev
        const params = new URLSearchParams(currentSearch)
        const tabParam = params.get("tab")
        if (tabParam) {
          setActiveSubTab(tabParam)
          setView("list")
        } else {
          setActiveSubTab("urunler")
        }
        return currentSearch
      })
    }
    syncTabFromUrl()
    window.addEventListener("popstate", syncTabFromUrl)
    const interval = setInterval(syncTabFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      clearInterval(interval)
    }
  }, [])
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  // --- Catalog Operations Data (Markalar, Etiketler, Stok Birimleri, Arama Sonuçları - Görsel 2, 3, 4, 5) ---
  const [catalogData, setCatalogData] = useState<{
    brands: any[]
    tags: any[]
    units: any[]
    searchResults: any[]
    reviews: any[]
  }>({
    brands: [
      { id: "brand_3", no: 3, name: "Bym Fashion", active: true, sort_order: 0, slug: "bym-fashion" },
      { id: "brand_2", no: 2, name: "Sıla Butik", active: true, sort_order: 0, slug: "sila-butik" },
      { id: "brand_1", no: 1, name: "XOOX", active: true, sort_order: 0, slug: "xoox" },
    ],
    tags: [],
    units: [
      { id: "unit_16", no: 16, name: "Kilogram", listing_name: "Kilogram", abbreviation: "Kg.", decimal_places: "1 Basamak", cart_increment: 0.1, default_cart_qty: 1 },
      { id: "unit_15", no: 15, name: "Palet", listing_name: "Palet", abbreviation: "palet", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_14", no: 14, name: "Bidon", listing_name: "Bidon", abbreviation: "bidon", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_13", no: 13, name: "Kasa", listing_name: "Kasa", abbreviation: "kasa", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_12", no: 12, name: "Metreküp", listing_name: "Metreküp", abbreviation: "m3", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_11", no: 11, name: "Santimetre", listing_name: "Santimetre", abbreviation: "cm", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_10", no: 10, name: "Kutu", listing_name: "Kutu", abbreviation: "kutu", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_9", no: 9, name: "Litre", listing_name: "Litre", abbreviation: "Lt.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_8", no: 8, name: "Metrekare", listing_name: "Metrekare", abbreviation: "m2", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_7", no: 7, name: "Rulo", listing_name: "Rulo", abbreviation: "rulo", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_6", no: 6, name: "Çift", listing_name: "Çift", abbreviation: "çift", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_5", no: 5, name: "Set", listing_name: "Set", abbreviation: "set", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_4", no: 4, name: "Paket", listing_name: "Paket", abbreviation: "Pk.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_3", no: 3, name: "Gram", listing_name: "Gram", abbreviation: "Gr.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_2", no: 2, name: "Metre", listing_name: "Metre", abbreviation: "Mt.", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
      { id: "unit_1", no: 1, name: "Adet", listing_name: "Adet", abbreviation: "Adet", decimal_places: "Tam Sayı", cart_increment: 1, default_cart_qty: 1 },
    ],
    searchResults: [
      { id: "sr_1314", no: 1314, keyword: "1247", search_count: 1, result_count: 17, first_searched_at: "10.11.2026 13:51", last_searched_at: "10.11.2026 13:51", mapped_keyword: "-" },
      { id: "sr_530", no: 530, keyword: "70130", search_count: 5691, result_count: 10, first_searched_at: "08.09.2026 00:29", last_searched_at: "10.11.2026 13:47", mapped_keyword: "-" },
      { id: "sr_1311", no: 1311, keyword: "kaşe uzun kaban 1221", search_count: 29, result_count: 4, first_searched_at: "10.11.2026 00:46", last_searched_at: "10.11.2026 13:47", mapped_keyword: "-" },
      { id: "sr_137", no: 137, keyword: "9001", search_count: 86, result_count: 8, first_searched_at: "31.07.2026 22:21", last_searched_at: "10.11.2026 13:43", mapped_keyword: "-" },
      { id: "sr_1120", no: 1120, keyword: "6050", search_count: 16, result_count: 7, first_searched_at: "24.10.2026 01:32", last_searched_at: "10.11.2026 13:38", mapped_keyword: "-" },
      { id: "sr_330", no: 330, keyword: "7091", search_count: 389, result_count: 7, first_searched_at: "19.08.2026 21:41", last_searched_at: "10.11.2026 13:38", mapped_keyword: "-" },
      { id: "sr_835", no: 835, keyword: "1205", search_count: 28, result_count: 18, first_searched_at: "01.10.2026 18:28", last_searched_at: "10.11.2026 13:33", mapped_keyword: "-" },
      { id: "sr_986", no: 986, keyword: "1220", search_count: 125, result_count: 22, first_searched_at: "15.10.2026 23:40", last_searched_at: "10.11.2026 13:30", mapped_keyword: "-" },
      { id: "sr_958", no: 958, keyword: "1209", search_count: 554, result_count: 16, first_searched_at: "14.10.2026 04:16", last_searched_at: "10.11.2026 13:29", mapped_keyword: "-" },
      { id: "sr_616", no: 616, keyword: "70060", search_count: 29, result_count: 0, first_searched_at: "11.09.2026 22:19", last_searched_at: "10.11.2026 13:13", mapped_keyword: "-" },
      { id: "sr_1223", no: 1223, keyword: "ceket pantolon", search_count: 2, result_count: 5, first_searched_at: "31.10.2026 11:56", last_searched_at: "10.11.2026 13:08", mapped_keyword: "-" },
      { id: "sr_575", no: 575, keyword: "9205", search_count: 1003, result_count: 6, first_searched_at: "09.09.2026 21:36", last_searched_at: "10.11.2026 13:06", mapped_keyword: "-" },
      { id: "sr_1203", no: 1203, keyword: "1235", search_count: 95, result_count: 18, first_searched_at: "28.10.2026 23:43", last_searched_at: "10.11.2026 12:55", mapped_keyword: "-" },
      { id: "sr_981", no: 981, keyword: "1225", search_count: 24, result_count: 14, first_searched_at: "15.10.2026 19:00", last_searched_at: "10.11.2026 12:53", mapped_keyword: "-" },
      { id: "sr_80", no: 80, keyword: "uzun hırkalı üçlü takım 8713", search_count: 6106, result_count: 7, first_searched_at: "28.07.2026 17:58", last_searched_at: "10.11.2026 12:51", mapped_keyword: "-" },
    ],
    reviews: [
      {
        id: "rev_3",
        no: 3,
        product_id: "all",
        product_title: "Genel Vitrin Yorumu",
        customer_name: "Mehmet A.",
        color: "STANDART",
        rating: 5,
        comment: "Malzeme kalitesi harika, birebir uyumlu geldi. Paketleme çok özenliydi ve hızlı kargolandı. Kesinlikle tavsiye ederim!",
        media_url: "",
        media_type: "image",
        active: true,
        verified_purchase: true,
        helpful_count: 14,
        created_at: "10.11.2026 12:40",
      },
      {
        id: "rev_2",
        no: 2,
        product_id: "all",
        product_title: "Genel Vitrin Yorumu",
        customer_name: "Seda K.",
        color: "PARLAK SİYAH",
        rating: 5,
        comment: "Rengi, dokusu ve duruşu muazzam. Montajı çok kolay oldu, araca tam oturdu. Çok memnun kaldık :)",
        media_url: "",
        media_type: "image",
        active: true,
        verified_purchase: true,
        helpful_count: 9,
        created_at: "09.11.2026 18:15",
      },
      {
        id: "rev_1",
        no: 1,
        product_id: "all",
        product_title: "Genel Vitrin Yorumu",
        customer_name: "Emre T.",
        color: "STANDART",
        rating: 5,
        comment: "Gerçekten fiyat performans olarak çok başarılı. Müşteri temsilcisi de çok ilgiliydi, teşekkürler.",
        media_url: "",
        media_type: "image",
        active: true,
        verified_purchase: true,
        helpful_count: 6,
        created_at: "08.11.2026 15:20",
      },
    ],
  })
  const [catalogQuickSearch, setCatalogQuickSearch] = useState("")
  const [catalogPageSize, setCatalogPageSize] = useState(15)
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([])
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [minSearchCountFilter, setMinSearchCountFilter] = useState("")
  const [zeroResultsOnlyFilter, setZeroResultsOnlyFilter] = useState(false)

  // Modals for Markalar, Etiketler, Stok Birimleri, Arama Sonuçları
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [brandModalTab, setBrandModalTab] = useState<"genel" | "seo" | "urunler" | "diger">("genel")
  const [editingBrand, setEditingBrand] = useState<{
    id?: string
    no?: number
    name: string
    active: boolean
    sort_order: number
    slug: string
    image: string
    seo_title: string
    seo_desc: string
    seo_keywords: string
    product_ids: string[]
  }>({
    name: "",
    active: true,
    sort_order: 0,
    slug: "",
    image: "",
    seo_title: "",
    seo_desc: "",
    seo_keywords: "",
    product_ids: [],
  })

  const [showTagModal, setShowTagModal] = useState(false)
  const [tagModalTab, setTagModalTab] = useState<"genel" | "seo" | "urunler" | "diger">("genel")
  const [editingTag, setEditingTag] = useState<{
    id?: string
    no?: number
    name: string
    image: string
    top_left: boolean
    top_right: boolean
    bottom_left: boolean
    bottom_right: boolean
    seo_title: string
    seo_desc: string
    seo_keywords: string
    slug: string
    product_ids: string[]
    active: boolean
    sort_order: number
  }>({
    name: "",
    image: "",
    top_left: false,
    top_right: false,
    bottom_left: false,
    bottom_right: false,
    seo_title: "",
    seo_desc: "",
    seo_keywords: "",
    slug: "",
    product_ids: [],
    active: true,
    sort_order: 0,
  })

  const [showUnitModal, setShowUnitModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<{
    id?: string
    no?: number
    name: string
    listing_name: string
    abbreviation: string
    decimal_places: string
    cart_increment: number
    default_cart_qty: number
  }>({
    name: "",
    listing_name: "",
    abbreviation: "",
    decimal_places: "Tam Sayı",
    cart_increment: 1,
    default_cart_qty: 1,
  })

  const [showSearchResultModal, setShowSearchResultModal] = useState(false)
  const [editingSearchResult, setEditingSearchResult] = useState<{
    id?: string
    no?: number
    keyword: string
    search_count: number
    result_count: number
    mapped_keyword: string
  }>({
    keyword: "",
    search_count: 1,
    result_count: 0,
    mapped_keyword: "-",
  })

  // --- 1. ÜRÜN SIRALAMA STATES (GÖRSEL 1 BİREBİR) ---
  const DEFAULT_SORT_ITEMS = [
    { id: "akilli", label: "Akıllı Sıralama", active: true, info: true },
    { id: "en-yeniler", label: "En Yeniler", active: true },
    { id: "cok-satanlar", label: "En Çok Satanlar", active: true },
    { id: "ad-az", label: "Ürün Adı (A-Z)", active: true },
    { id: "ad-za", label: "Ürün Adı (Z-A)", active: true },
    { id: "fiyat-artan", label: "En Düşük Fiyat", active: true },
    { id: "fiyat-azalan", label: "En Yüksek Fiyat", active: true },
    { id: "cok-oylananlar", label: "En Çok Oylananlar", active: true },
  ]
  const [sortingTypeTab, setSortingTypeTab] = useState<"kategori" | "marka" | "nitelik" | "etiket" | "arama">("kategori")
  const [sortingTypesMap, setSortingTypesMap] = useState<Record<string, any[]>>({
    kategori: [...DEFAULT_SORT_ITEMS],
    marka: [...DEFAULT_SORT_ITEMS],
    nitelik: [...DEFAULT_SORT_ITEMS],
    etiket: [...DEFAULT_SORT_ITEMS],
    arama: [...DEFAULT_SORT_ITEMS],
  })
  const [dragSortIdx, setDragSortIdx] = useState<number | null>(null)
  const [smartSortRules, setSmartSortRules] = useState<any[]>([])
  const [showSmartSortModal, setShowSmartSortModal] = useState(false)
  const [editingSmartSort, setEditingSmartSort] = useState<{
    id?: string
    no?: number
    page_type: "Kategori" | "Marka" | "Ürün Etiketi"
    name: string
    rule_type: string
  }>({
    page_type: "Kategori",
    name: "",
    rule_type: "En Çok Satanlar Önde",
  })

  // --- 2. HIZLI SEO GÜNCELLEME STATES (GÖRSEL 2 BİREBİR) ---
  const [fastSeoActiveSection, setFastSeoActiveSection] = useState<"urun" | "kategori" | "marka" | "etiket">("urun")
  const [fastSeoProdFilter, setFastSeoProdFilter] = useState({
    advanced: "Seçilmedi",
    category: "",
    brand: "",
    source: "Kaynak Seçilmedi",
    tag: "",
    stockMin: "0.00",
    stockMax: "0.00",
    marketPriceMin: "0.00",
    marketPriceMax: "0.00",
    salePriceMin: "0.00",
    salePriceMax: "0.00",
    currency: "Hiçbiri seçilmedi",
    seoTitleStatus: "Boş Olanlar",
    seoDescStatus: "Boş Olanlar",
    seoKeywordStatus: "Boş Olanlar",
  })
  const [fastSeoCatFilter, setFastSeoCatFilter] = useState({
    advanced: "Seçilmedi",
    category: "",
    seoTitleStatus: "Boş Olanlar",
    seoDescStatus: "Boş Olanlar",
    seoKeywordStatus: "Boş Olanlar",
  })
  const [fastSeoBrandFilter, setFastSeoBrandFilter] = useState({
    brand: "",
    seoTitleStatus: "Boş Olanlar",
    seoDescStatus: "Boş Olanlar",
    seoKeywordStatus: "Boş Olanlar",
  })
  const [fastSeoTagFilter, setFastSeoTagFilter] = useState({
    tag: "",
    seoTitleStatus: "Boş Olanlar",
    seoDescStatus: "Boş Olanlar",
    seoKeywordStatus: "Boş Olanlar",
  })
  const [fastSeoFilteredResults, setFastSeoFilteredResults] = useState<any[] | null>(null)
  const [fastSeoInlineEdits, setFastSeoInlineEdits] = useState<Record<string, { title: string; desc: string; keywords: string }>>({})
  const [savingFastSeoId, setSavingFastSeoId] = useState<string | null>(null)

  // --- 3. TOPLU ÜRÜN GÜNCELLEME STATES (GÖRSEL 3, 4, 5 BİREBİR) ---
  const [bulkOperationSearch, setBulkOperationSearch] = useState("")
  const [selectedBulkOperationCard, setSelectedBulkOperationCard] = useState<{
    id: string
    label: string
    badge?: string
    badgeBg?: string
    badgeColor?: string
  } | null>(null)
  const [bulkOpTargetCategory, setBulkOpTargetCategory] = useState("")
  const [bulkOpTargetBrand, setBulkOpTargetBrand] = useState("")
  const [bulkOpValueMode, setBulkOpValueMode] = useState<"set" | "increase_pct" | "decrease_pct" | "increase_amt" | "decrease_amt" | "replace">("increase_pct")
  const [bulkOpValueInput, setBulkOpValueInput] = useState("")
  const [bulkOpFindText, setBulkOpFindText] = useState("")
  const [bulkOpReplaceText, setBulkOpReplaceText] = useState("")
  const [bulkOpRunning, setBulkOpRunning] = useState(false)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [uploadingReviewMedia, setUploadingReviewMedia] = useState(false)
  const [editingReview, setEditingReview] = useState<{
    id?: string
    no?: number
    product_id: string
    product_title: string
    product_handle?: string
    product_thumbnail?: string
    customer_name: string
    color: string
    rating: number
    comment: string
    media_url: string
    media_type: "image" | "video"
    active: boolean
  }>({
    product_id: "all",
    product_title: "Genel Vitrin Yorumu",
    customer_name: "",
    color: "STANDART",
    rating: 5,
    comment: "",
    media_url: "",
    media_type: "image",
    active: true,
  })

  const fetchCatalogOperations = async () => {
    try {
      const res = await fetch("/admin/catalog-operations")
      if (res.ok) {
        const data = await res.json()
        if (data?.success) {
          setCatalogData({
            brands: data.brands || [],
            tags: data.tags || [],
            units: data.units || [],
            searchResults: data.searchResults || [],
            reviews: data.reviews || [],
          })
          if (data.sortingTypes) {
            setSortingTypesMap(data.sortingTypes)
          }
          if (Array.isArray(data.smartSortRules)) {
            setSmartSortRules(data.smartSortRules)
          }
        }
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchCatalogOperations()
  }, [])

  useEffect(() => {
    setCatalogQuickSearch("")
    setSelectedCatalogIds([])
    if (
      activeSubTab === "markalar" ||
      activeSubTab === "etiketler" ||
      activeSubTab === "stok-birimleri" ||
      activeSubTab === "arama-sonuclari" ||
      activeSubTab === "urun-yorumlari" ||
      activeSubTab === "urun-siralama" ||
      activeSubTab === "hizli-seo" ||
      activeSubTab === "toplu-guncelleme"
    ) {
      fetchCatalogOperations()
    }
  }, [activeSubTab])

  const handleSaveBrand = async () => {
    if (!editingBrand.name.trim()) {
      alert("Lütfen marka adı giriniz.")
      return
    }
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_brand", brand: editingBrand }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, brands: data.brands }))
        setShowBrandModal(false)
      }
    } catch (e) {}
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_brand", id }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, brands: data.brands }))
      }
    } catch (e) {}
  }

  const handleSaveTag = async () => {
    if (!editingTag.name.trim()) {
      alert("Lütfen etiket adı giriniz.")
      return
    }
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_tag", tag: editingTag }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, tags: data.tags }))
        setShowTagModal(false)
      }
    } catch (e) {}
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Bu etiketi silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_tag", id }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, tags: data.tags }))
      }
    } catch (e) {}
  }

  const handleSaveUnit = async () => {
    if (!editingUnit.name.trim()) {
      alert("Lütfen birim adı giriniz.")
      return
    }
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_unit", unit: editingUnit }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, units: data.units }))
        setShowUnitModal(false)
      }
    } catch (e) {}
  }

  const handleSaveSearchResult = async () => {
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_search_result", item: editingSearchResult }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, searchResults: data.searchResults }))
        setShowSearchResultModal(false)
      }
    } catch (e) {}
  }

  const handleDeleteSearchResult = async (id: string) => {
    if (!confirm("Bu arama kaydını silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_search_result", id }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, searchResults: data.searchResults }))
      }
    } catch (e) {}
  }

  const handleReviewMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingReviewMedia(true)
    try {
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
            const isVid = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|avi)$/i.test(file.name)
            setEditingReview((prev) => ({
              ...prev,
              media_url: data.url,
              media_type: isVid ? "video" : "image",
            }))
          } else {
            alert("Medya yüklenemedi: " + (data?.message || ""))
          }
        } catch (err) {
          alert("Medya yüklenirken hata oluştu.")
        } finally {
          setUploadingReviewMedia(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setUploadingReviewMedia(false)
    }
  }

  const handleSaveReview = async () => {
    if (!editingReview.customer_name.trim()) {
      alert("Lütfen müşteri adı giriniz.")
      return
    }
    if (!editingReview.comment.trim()) {
      alert("Lütfen müşteri yorumunu giriniz.")
      return
    }
    try {
      const selectedProd = products.find((p) => p.id === editingReview.product_id)
      const payloadReview = {
        ...editingReview,
        product_title:
          editingReview.product_id === "all"
            ? "Genel Vitrin Yorumu (Tüm Ürünler)"
            : selectedProd?.title || editingReview.product_title || "Ürün Yorumu",
        product_handle: selectedProd?.handle || editingReview.product_handle || "",
        product_thumbnail: selectedProd?.thumbnail || editingReview.product_thumbnail || "",
      }
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_review", review: payloadReview }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, reviews: data.reviews }))
        setShowReviewModal(false)
      }
    } catch (e) {}
  }

  const handleToggleReviewStatus = async (id: string) => {
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_review_status", id }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, reviews: data.reviews }))
      }
    } catch (e) {}
  }

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Bu müşteri yorumunu silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/catalog-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_review", id }),
      })
      const data = await res.json()
      if (data?.success) {
        setCatalogData((prev) => ({ ...prev, reviews: data.reviews }))
      }
    } catch (e) {}
  }

  // --- API Data States ---
  const [products, setProducts] = useState<any[]>([])
  const [priceLists, setPriceLists] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- Search & Filters ---
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // --- Bulk Actions ---
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkModalStep, setBulkModalStep] = useState<1 | 2>(1)
  const [bulkActionType, setBulkActionType] = useState("")
  const [bulkActionCategory, setBulkActionCategory] = useState("")
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  // --- Form States (IKAS Fields) ---
  const [productName, setProductName] = useState("")
  const [productType, setProductType] = useState("physical")
  const [generalPrice, setGeneralPrice] = useState("")
  const [generalDiscountedPrice, setGeneralDiscountedPrice] = useState("")
  const [generalCostPrice, setGeneralCostPrice] = useState("")
  
  const [images, setImages] = useState<ProductImage[]>([])
  const [brand, setBrand] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [canonicalUrl, setCanonicalUrl] = useState("")
  const [seoUrl, setSeoUrl] = useState("")
  const [tags, setTags] = useState("")

  // --- Variant Options ---
  const [isVariantProduct, setIsVariantProduct] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [variantsTable, setVariantsTable] = useState<SelectedVariant[]>([])
  const [checkedIndices, setCheckedIndices] = useState<number[]>([])

  const [availableColors, setAvailableColors] = useState<string[]>(INITIAL_COLORS)
  const [availableSizes, setAvailableSizes] = useState<string[]>(INITIAL_SIZES)
  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")

  const handleAddColor = () => {
    const val = newColor.trim().toLocaleUpperCase("tr-TR")
    if (!val) return
    if (availableColors.includes(val)) return alert("Bu renk zaten mevcut.")
    setAvailableColors(prev => [...prev, val])
    setSelectedColors(prev => [...prev, val])
    setNewColor("")
  }

  const handleAddSize = () => {
    const val = newSize.trim().toLocaleUpperCase("tr-TR")
    if (!val) return
    if (availableSizes.includes(val)) return alert("Bu beden zaten mevcut.")
    setAvailableSizes(prev => [...prev, val])
    setSelectedSizes(prev => [...prev, val])
    setNewSize("")
  }

  const handleRemoveColor = (color: string) => {
    setAvailableColors(prev => prev.filter(c => c !== color))
    setSelectedColors(prev => prev.filter(c => c !== color))
  }

  const handleRemoveSize = (size: string) => {
    setAvailableSizes(prev => prev.filter(s => s !== size))
    setSelectedSizes(prev => prev.filter(s => s !== size))
  }

  // --- Drawer / Image Picker State for Variants ---
  const [activeVariantIndexForImage, setActiveVariantIndexForImage] = useState<number | null>(null)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return
    const updated = [...images]
    const [removed] = updated.splice(draggedIndex, 1)
    updated.splice(index, 0, removed)
    setImages(updated)
    setDraggedIndex(null)
  }

  // --- Fetch Initial Data ---
  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, priceListsRes, categoriesRes, collectionsRes, inventoryItemsRes] = await Promise.all([
        fetch("/admin/products?limit=3000&order=-created_at&fields=id,title,handle,status,metadata,description,thumbnail,images,collection_id,categories.id,categories.name,options.id,options.title,options.values.id,options.values.value,variants.id,variants.title,variants.sku,variants.barcode,variants.manage_inventory,variants.prices.amount,variants.prices.currency_code,variants.metadata,variants.inventory_items.inventory_item_id,variants.options.id,variants.options.value,variants.options.option_id").then(res => res.json()).catch(() => ({ products: [] })),
        fetch("/admin/price-lists?fields=id,title,type,status,prices.id,prices.amount,prices.currency_code,prices.price_set.variant.id").then(res => res.json()).catch(() => ({ price_lists: [] })),
        fetch("/admin/product-categories?limit=500&fields=id,name,handle,description,is_active,rank,parent_category_id,parent_category.id,parent_category.name,metadata").then(res => res.json()).catch(() => ({ product_categories: [] })),
        fetch("/admin/collections").then(res => res.json()).catch(() => ({ collections: [] })),
        fetch("/admin/inventory-items?limit=3000").then(res => res.json()).catch(() => ({ inventory_items: [] }))
      ])

      const inventoryItemsMap = new Map<string, number>()
      if (inventoryItemsRes && inventoryItemsRes.inventory_items) {
        for (const item of inventoryItemsRes.inventory_items) {
          const totalStock = item.location_levels?.reduce((sum: number, lvl: any) => sum + (lvl.stocked_quantity || 0), 0) || 0
          inventoryItemsMap.set(item.id, totalStock)
        }
      }

      const productsWithStock = (productsRes.products || []).map((prod: any) => {
        if (prod.variants) {
          prod.variants = prod.variants.map((v: any) => {
            const inventoryItemId = v.inventory_items?.[0]?.inventory_item_id
            const stock = inventoryItemId ? (inventoryItemsMap.get(inventoryItemId) ?? v.metadata?.stock ?? 0) : (v.metadata?.stock ?? 0)
            return {
              ...v,
              inventory_quantity: stock
            }
          })
        }
        return prod
      })

      setProducts(productsWithStock)
      setPriceLists(priceListsRes.price_lists || [])
      setCategories(categoriesRes.product_categories || [])
      setCollections(collectionsRes.collections || [])
    } catch (err) {
      console.error("Error loading IKAS panel data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const linkId = "plus-jakarta-sans-font";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    fetchData()
  }, [])

  // --- Helper to Slugify Handle ---
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
  }

  // --- Auto-generate Variants Table based on Color and Size selections ---
  useEffect(() => {
    if (!isVariantProduct) return

    // If options are selected, generate combinations
    const newVariants: SelectedVariant[] = []
    const colorsToUse = selectedColors.length > 0 ? selectedColors : ["Standart"]
    const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ["Standart"]

    colorsToUse.forEach(color => {
      sizesToUse.forEach(size => {
        // Try to preserve existing variant data (like custom prices, sku, stock) if options match
        const label = `${color} / ${size}`
        const existing = variantsTable.find(v => v.color === color && v.size === size)

        newVariants.push({
          color,
          size,
          price: existing?.price || generalPrice || "",
          discountedPrice: existing?.discountedPrice || generalDiscountedPrice || "",
          costPrice: existing?.costPrice || generalCostPrice || "",
          sku: existing?.sku || `${slugify(productName)}-${color}-${size}`.toUpperCase(),
          barcode: existing?.barcode || "",
          stock: existing?.stock || "100",
          image: existing?.image || ""
        })
      })
    })

    setVariantsTable(newVariants)
    setCheckedIndices([])
  }, [selectedColors, selectedSizes, generalPrice, generalDiscountedPrice, generalCostPrice, productName, isVariantProduct])

  // --- Image Upload Handler ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      
      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string
            const res = await fetch("/admin/hero-config/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                filetype: file.type,
                base64
              })
            })
            const data = await res.json()
            if (data && data.success) {
              const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|avi)$/i.test(file.name)
              const activeColor = activeVariantIndexForImage !== null ? variantsTable[activeVariantIndexForImage]?.color : undefined
              
              setImages(prev => [...prev, { 
                url: data.url, 
                filename: data.filename || file.name, 
                type: isVideo ? "video" : "image",
                color: activeColor
              }])

              // Auto-assign to the active and checked variants if uploaded from drawer
              if (activeVariantIndexForImage !== null) {
                setVariantsTable(prevTable => {
                  const updated = [...prevTable]
                  const isChecked = checkedIndices.includes(activeVariantIndexForImage)
                  if (isChecked) {
                    checkedIndices.forEach(i => {
                      updated[i].image = data.url
                    })
                  } else {
                    updated[activeVariantIndexForImage].image = data.url
                  }
                  return updated
                })
              }
              resolve()
            } else {
              reject(new Error(data.message || "Yükleme başarısız"))
            }
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error("Dosya okunamadı"))
      })

      reader.readAsDataURL(file)
      try {
        await uploadPromise
      } catch (err: any) {
        alert("Görsel yüklenirken hata oluştu: " + err.message)
      }
    }
    setUploading(false)
  }

  const removeImage = (index: number) => {
    const targetImg = images[index]
    if (targetImg) {
      setVariantsTable(prev => prev.map(v => v.image === targetImg.url ? { ...v, image: "" } : v))
    }
    setImages(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleDeleteImageFromPool = (url: string) => {
    setVariantsTable(prev => prev.map(v => v.image === url ? { ...v, image: "" } : v))
    setImages(prev => prev.filter(img => img.url !== url))
  }

  // --- Find Discounted Price for a Variant in Medusa Price Lists ---
  const getSalePriceForVariant = (variantId: string) => {
    // Find active overrides in Type=sale price lists
    for (const plist of priceLists) {
      if (plist.type === "sale" && plist.prices) {
        const pMatch = plist.prices.find((p: any) => p.variant_id === variantId && p.currency_code === "try")
        if (pMatch) {
          return pMatch.amount / 100
        }
      }
    }
    return null
  }

  // --- Reset Form for Create ---
  const initCreateMode = () => {
    setProductName("")
    setProductType("physical")
    setGeneralPrice("")
    setGeneralDiscountedPrice("")
    setGeneralCostPrice("")
    setImages([])
    setBrand("")
    setCategory("")
    setDescription("")
    setTags("")
    setSelectedColors([])
    setSelectedSizes([])
    setAvailableColors(INITIAL_COLORS)
    setAvailableSizes(INITIAL_SIZES)
    setVariantsTable([])
    setCheckedIndices([])
    setIsVariantProduct(false)
    setEditingProductId(null)
    setView("create")
  }

  // --- Load Form for Edit ---
  const initEditMode = async (prod: any) => {
    setLoading(true)
    setEditingProductId(prod.id)
    setProductName(prod.title || "")
    setDescription(prod.description || "")
    setCategory(prod.categories?.[0]?.id || "")
    setBrand(prod.collection_id || "")
    
    // Detach options
    const colorOpt = prod.options?.find((o: any) => o.title.toLowerCase() === "renk")
    const sizeOpt = prod.options?.find((o: any) => o.title.toLowerCase() === "beden")

    // Set Images with variant color mapping
    const prodImages = prod.images?.map((img: any) => {
      const isVideo = isVideoUrl(img.url)
      const matchingVariant = prod.variants?.find((v: any) => v.metadata?.image === img.url)
      const colorVal = matchingVariant?.options?.find((o: any) => o.option_id === colorOpt?.id)?.value
      return {
        url: img.url,
        filename: img.url.split("/").pop() || "",
        type: isVideo ? "video" : "image" as const,
        color: colorVal
      }
    }) || []
    setImages(prodImages)
    
    const colors = colorOpt?.values?.map((v: any) => typeof v === "string" ? v : v.value) || []
    const sizes = sizeOpt?.values?.map((v: any) => typeof v === "string" ? v : v.value) || []
    setSelectedColors(colors)
    setSelectedSizes(sizes)
    setAvailableColors((prev) => {
      const merged = [...prev]
      colors.forEach(c => {
        if (!merged.includes(c)) merged.push(c)
      })
      return merged
    })
    setAvailableSizes((prev) => {
      const merged = [...prev]
      sizes.forEach(s => {
        if (!merged.includes(s)) merged.push(s)
      })
      return merged
    })

    const hasRealOpts = colors.some((c: string) => c.toLowerCase() !== "standart" && c.toLowerCase() !== "default title") || sizes.some((s: string) => s.toLowerCase() !== "standart" && s.toLowerCase() !== "default title");
    setIsVariantProduct((prod.variants?.length || 0) > 1 || hasRealOpts)

    // Load variants details
    const loadedVariants: SelectedVariant[] = prod.variants?.map((v: any) => {
      const originalPrice = (v.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100
      const salePrice = getSalePriceForVariant(v.id) || originalPrice

      // Option values
      const cVal = v.options?.find((o: any) => o.option_id === colorOpt?.id)?.value || "Standart"
      const sVal = v.options?.find((o: any) => o.option_id === sizeOpt?.id)?.value || "Standart"

      return {
        id: v.id,
        color: cVal,
        size: sVal,
        price: originalPrice.toString(),
        discountedPrice: salePrice.toString(),
        costPrice: (v.metadata?.cost_price || 0).toString(),
        sku: v.sku || "",
        barcode: v.barcode || "",
        stock: (v.inventory_quantity ?? v.metadata?.stock ?? 0).toString(), // Fallback quantity
        image: v.metadata?.image || prod.thumbnail || ""
      }
    }) || []

    // Set general values from the first variant as a baseline default
    if (prod.variants?.length > 0) {
      const v = prod.variants[0]
      const op = (v.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100
      const sp = getSalePriceForVariant(v.id) || op
      setGeneralPrice(op.toString())
      setGeneralDiscountedPrice(sp.toString())
      setGeneralCostPrice((v.metadata?.cost_price || 0).toString())
    }

    setVariantsTable(loadedVariants)
    setCheckedIndices([])
    setView("edit")
    setLoading(false)
  }

  // --- Submit Handler (Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName) return alert("Lütfen ürün adını doldurun.")

    setSubmitting(true)
    try {
      let url = "/admin/products"
      let method = "POST"
      
      // Collect all variant images and uploaded images to construct product media
      const variantImages: string[] = []
      if (isVariantProduct) {
        variantsTable.forEach(v => {
          if (v.image && !variantImages.includes(v.image)) {
            variantImages.push(v.image)
          }
        })
      }
      const globalImages = images.map(img => img.url)
      const uniqueImageUrls = Array.from(new Set([...globalImages, ...variantImages]))

      // Determine Medusa V2 Payload
      const payload: any = {
        title: productName,
        description: description,
        status: "published",
        thumbnail: uniqueImageUrls[0] || "",
        images: uniqueImageUrls.map(url => ({ url })),
        collection_id: brand || undefined,
        categories: category ? [{ id: category }] : []
      }

      if (isVariantProduct) {
        payload.options = [
          { title: "Renk", values: selectedColors.length > 0 ? selectedColors : ["Standart"] },
          { title: "Beden", values: selectedSizes.length > 0 ? selectedSizes : ["Standart"] }
        ]
        payload.variants = variantsTable.map(v => ({
          title: `${v.color} / ${v.size}`,
          sku: v.sku,
          barcode: v.barcode || undefined,
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Renk": v.color,
            "Beden": v.size
          },
          prices: [
            { currency_code: "try", amount: parseFloat(v.price) * 100 }
          ],
          metadata: {
            cost_price: parseFloat(v.costPrice) || 0,
            image: v.image || ""
          }
        }))
      } else {
        // Simple product has no options, single default variant
        payload.options = [{ title: "Title", values: ["Default Title"] }]
        payload.variants = [
          {
            title: "Standart",
            options: { "Title": "Default Title" },
            sku: `${slugify(productName)}-STD`.toUpperCase(),
            manage_inventory: false,
          allow_backorder: true,
            prices: [
              { currency_code: "try", amount: parseFloat(generalPrice || "0") * 100 }
            ],
            metadata: {
              cost_price: parseFloat(generalCostPrice || "0") || 0
            }
          }
        ]
      }

      let savedProduct: any = null

      if (view === "edit" && editingProductId) {
        url = `/admin/products/${editingProductId}`
        method = "POST" // Medusa update is POST
        
        // 1. Update basic product fields (title, desc, categories, collection, images, etc.)
        const updateRes = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        const data = await updateRes.json()
        savedProduct = data.product

        // 2. Fetch current product options and variants to delete them
        const currentRes = await fetch(`/admin/products/${editingProductId}?fields=options.id,variants.id`)
        if (currentRes.ok) {
          const currentData = await currentRes.json()
          const currentProduct = currentData.product

          // Delete all current variants
          if (currentProduct.variants) {
            for (const v of currentProduct.variants) {
              await fetch(`/admin/products/${editingProductId}/variants/${v.id}`, { method: "DELETE" })
            }
          }

          // Delete all current options
          if (currentProduct.options) {
            for (const opt of currentProduct.options) {
              await fetch(`/admin/products/${editingProductId}/options/${opt.id}`, { method: "DELETE" })
            }
          }
        }

        // 3. Create new options
        if (isVariantProduct) {
          await fetch(`/admin/products/${editingProductId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Renk",
              values: selectedColors.length > 0 ? selectedColors : ["Standart"]
            })
          })

          await fetch(`/admin/products/${editingProductId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Beden",
              values: selectedSizes.length > 0 ? selectedSizes : ["Standart"]
            })
          })
        }

        // 4. Create new variants
        if (isVariantProduct) {
          for (const v of variantsTable) {
            await fetch(`/admin/products/${editingProductId}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `${v.color} / ${v.size}`,
                sku: v.sku,
                barcode: v.barcode || undefined,
                manage_inventory: false,
          allow_backorder: true,
                options: {
                  "Renk": v.color,
                  "Beden": v.size
                },
                prices: [
                  { currency_code: "try", amount: parseFloat(v.price) * 100 }
                ],
                metadata: {
                  cost_price: parseFloat(v.costPrice) || 0,
                  image: v.image || ""
                }
              })
            })
          }
        } else {
          await fetch(`/admin/products/${editingProductId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Title", values: ["Default Title"] })
          })
          // Simple product default variant
          await fetch(`/admin/products/${editingProductId}/variants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Standart",
              options: { "Title": "Default Title" },
              sku: `${slugify(productName)}-STD`.toUpperCase(),
              manage_inventory: false,
          allow_backorder: true,
              prices: [
                { currency_code: "try", amount: parseFloat(generalPrice || "0") * 100 }
              ],
              metadata: {
                cost_price: parseFloat(generalCostPrice || "0") || 0
              }
            })
          })
        }

        // 5. Re-fetch product to get the newly created variants with correct Medusa V2 format and IDs
        const refreshedRes = await fetch(`/admin/products/${editingProductId}?fields=id,title,variants.id,variants.sku,variants.title,variants.options.id,variants.options.value,variants.options.option_id`)
        if (refreshedRes.ok) {
          const refreshedData = await refreshedRes.json()
          savedProduct = refreshedData.product
        }
      } else {
        const createRes = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        const data = await createRes.json()
        savedProduct = data.product
      }

      if (!savedProduct) {
        throw new Error("Ürün kaydedilemedi.")
      }

      // --- Sync Stock Levels to default stock location ---
      try {
        const slocRes = await fetch("/admin/stock-locations")
        if (slocRes.ok) {
          const slocData = await slocRes.json()
          const locationId = slocData.stock_locations?.[0]?.id

          if (locationId) {
            // Re-fetch the product to get variants with inventory item links
            const productUrl = `/admin/products/${savedProduct.id}?fields=id,title,variants.id,variants.sku,variants.barcode,variants.manage_inventory,variants.metadata,variants.inventory_items.inventory_item_id`
            const prodRes = await fetch(productUrl)
            if (prodRes.ok) {
              const prodJson = await prodRes.json()
              const refreshedVariants = prodJson.product?.variants || []

              for (const sv of refreshedVariants) {
                const sku = sv.sku
                const inventoryItemId = sv.inventory_items?.[0]?.inventory_item_id

                if (!inventoryItemId) {
                  console.warn(`No inventory item found for variant ${sv.id} (SKU: ${sku})`)
                  continue
                }

                // Match with target stock from the variantsTable or standard state
                let targetStock = 0
                if (isVariantProduct) {
                  const formV = variantsTable.find(v => v.sku === sku || `${v.color} / ${v.size}` === sv.title)
                  if (formV) {
                    targetStock = parseInt(formV.stock) || 0
                  }
                } else {
                  targetStock = parseInt(variantsTable[0]?.stock || "0") || 0
                }

                // Query existing location levels for this item
                const levelsRes = await fetch(`/admin/inventory-items/${inventoryItemId}/location-levels`)
                if (levelsRes.ok) {
                  const levelsData = await levelsRes.json()
                  const existingLevel = levelsData.inventory_levels?.find((l: any) => l.location_id === locationId)

                  if (existingLevel) {
                    // Update location level
                    await fetch(`/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        stocked_quantity: targetStock
                      })
                    })
                  } else {
                    // Create location level association
                    await fetch(`/admin/inventory-items/${inventoryItemId}/location-levels`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        location_id: locationId,
                        stocked_quantity: targetStock
                      })
                    })
                  }
                }
              }
            }
          }
        }
      } catch (stockErr) {
        console.error("Error syncing stock levels:", stockErr)
      }

      // --- Price List overridden sync for Discounted Prices (İKAS İndirimli Fiyat) ---
      const activeSalePrices: any[] = []
      
      if (isVariantProduct) {
        variantsTable.forEach(v => {
          const matchV = savedProduct.variants?.find((sv: any) => {
            const sc = sv.options?.find((o: any) => o.value === v.color)
            const ss = sv.options?.find((o: any) => o.value === v.size)
            return sc && ss
          })
          
          if (matchV && parseFloat(v.discountedPrice) < parseFloat(v.price)) {
            activeSalePrices.push({
              variant_id: matchV.id,
              currency_code: "try",
              amount: parseFloat(v.discountedPrice) * 100
            })
          }
        })
      } else {
        const matchV = savedProduct.variants?.[0]
        if (matchV && parseFloat(generalDiscountedPrice) < parseFloat(generalPrice)) {
          activeSalePrices.push({
            variant_id: matchV.id,
            currency_code: "try",
            amount: parseFloat(generalDiscountedPrice) * 100
          })
        }
      }

      if (activeSalePrices.length > 0) {
        // Look for "Ürün İndirim Listesi" or "İKAS İndirim Listesi"
        let targetList = priceLists.find(pl => pl.title === "Ürün İndirim Listesi" || pl.title === "İKAS İndirim Listesi")
        
        if (targetList) {
          // Update list prices
          await fetch(`/admin/price-lists/${targetList.id}/prices/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              create: activeSalePrices
            })
          })
        } else {
          // Create list
          await fetch("/admin/price-lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Ürün İndirim Listesi",
              description: "Ürün Yönetimi arayüzü tarafından otomatik oluşturulmuştur.",
              type: "sale",
              status: "active",
              prices: activeSalePrices
            })
          })
        }
      }

      // Refresh list and return
      await fetchData()
      setView("list")
    } catch (err: any) {
      console.error(err)
      alert("Hata oluştu: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // --- Delete Product Handler ---
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return

    try {
      const res = await fetch(`/admin/products/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
      } else {
        alert("Ürün silinemedi.")
      }
    } catch (err) {
      console.error(err)
      alert("Hata oluştu.")
    }
  }

  // --- Bulk Delete Handler ---
  const handleBulkDelete = async () => {
    if (!confirm(`Seçili ${selectedProductIds.length} ürünü silmek istediğinize emin misiniz?`)) return
    
    try {
      // Basic loop to delete selected products (in production, batch delete API might be better if supported)
      for (const id of selectedProductIds) {
        await fetch(`/admin/products/${id}`, { method: "DELETE" })
      }
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)))
      setSelectedProductIds([])
    } catch (err) {
      console.error(err)
      alert("Toplu silme işleminde hata oluştu.")
    }
  }

  // --- Calculate total stock of product ---
  const getProductTotalStock = (prod: any) => {
    return prod.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || v.inventory_items?.[0]?.inventory_quantity || 0), 0) || 0
  }

  // --- GÖRSEL 1 & 2: ÜRÜNLER FİLTRELEME ALANI STATE'LERİ ---
  const DEFAULT_PRODUCT_FILTER = {
    searchTerm: "",
    searchField: "Ürün No, Ürün Adı, Ürün Kodu",
    advanced: "Seçilmedi",
    sortField: "Varsayılan",
    sortDir: "Azalan (Z -> A)",
    source: "Kaynak Seçilmedi",
    category: "",
    brand: "",
    tag: "",
    productType: "Seçilmedi",
    stockMin: "0.00",
    stockMax: "0.00",
    desiMin: "0.00",
    desiMax: "0.00",
    costPriceMin: "0.00",
    costPriceMax: "0.00",
    marketPriceMin: "0.00",
    marketPriceMax: "0.00",
    salePriceMin: "0.00",
    salePriceMax: "0.00",
    currency: "Seçilmedi",
  }
  const [showProductFilters, setShowProductFilters] = useState(false)
  const [prodFilter, setProdFilter] = useState({ ...DEFAULT_PRODUCT_FILTER })
  const [appliedProdFilter, setAppliedProdFilter] = useState({ ...DEFAULT_PRODUCT_FILTER })

  // --- GÖRSEL 3: KATEGORİLER FİLTRELEME VE MODAL STATE'LERİ ---
  const DEFAULT_CATEGORY_FILTER = {
    searchTerm: "",
    searchField: "Kategori No, Kategori Adı",
    parentCategoryId: "",
    advanced: "Seçilmedi",
  }
  const [showCategoryFilters, setShowCategoryFilters] = useState(false)
  const [catQuickSearch, setCatQuickSearch] = useState("")
  const [catFilter, setCatFilter] = useState({ ...DEFAULT_CATEGORY_FILTER })
  const [appliedCatFilter, setAppliedCatFilter] = useState({ ...DEFAULT_CATEGORY_FILTER })
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [categoryPageSize, setCategoryPageSize] = useState(15)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showCategoryTreeModal, setShowCategoryTreeModal] = useState(false)
  const [showCategoryMarketplaceModal, setShowCategoryMarketplaceModal] = useState(false)
  const [marketplaceModalTitle, setMarketplaceModalTitle] = useState<string>("")

  const renderCircularMarketplaceSvg = (key: string) => {
    switch (key) {
      case "n11":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#5B2D90" stroke="#4C1D95" strokeWidth="1" />
            <circle cx="11" cy="10.5" r="2" fill="#F59E0B" />
            <circle cx="18" cy="8.5" r="1.6" fill="#EF4444" />
            <circle cx="24.5" cy="10.5" r="2" fill="#F59E0B" />
            <circle cx="27.5" cy="17" r="1.7" fill="#10B981" />
            <circle cx="8.5" cy="17" r="1.7" fill="#EC4899" />
            <circle cx="11.5" cy="25.5" r="1.9" fill="#F59E0B" />
            <circle cx="24.5" cy="25.5" r="1.9" fill="#F59E0B" />
            <text x="18" y="21.5" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="11" letterSpacing="-0.4">
              n11
            </text>
          </svg>
        )
      case "hb":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
            <text x="18" y="15.5" textAnchor="middle" fill="#FF6000" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="7.4" letterSpacing="-0.2">
              hepsi
            </text>
            <text x="18" y="23" textAnchor="middle" fill="#FF6000" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="7.4" letterSpacing="-0.2">
              burada
            </text>
            <rect x="7" y="25.5" width="5.5" height="2.2" rx="1" fill="#FF6000" />
            <rect x="13.2" y="25.5" width="4.5" height="2.2" rx="1" fill="#00B4D8" />
            <rect x="18.4" y="25.5" width="4.5" height="2.2" rx="1" fill="#7209B7" />
            <rect x="23.6" y="25.5" width="5" height="2.2" rx="1" fill="#2EC4B6" />
          </svg>
        )
      case "ptt":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#1E40AF" stroke="#1D4ED8" strokeWidth="1" />
            <path d="M10 4.5H26L24 7.5H12L10 4.5Z" fill="#FACC15" />
            <text x="18" y="17" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="-0.2">
              ptt
            </text>
            <text x="18" y="26.5" textAnchor="middle" fill="#FACC15" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="8.8" letterSpacing="-0.2">
              avm
            </text>
          </svg>
        )
      case "amz":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <path d="M22.2 17.5V13.8C22.2 10.9 20.2 9 16.8 9C13.8 9 11.9 10.5 11.6 12.7L14.5 13.1C14.7 11.9 15.6 11.3 16.8 11.3C18.2 11.3 19 12 19 13.3V13.9L15.5 14.3C12.5 14.7 10.9 16.1 10.9 18.5C10.9 20.9 12.7 22.5 15.2 22.5C17.1 22.5 18.5 21.7 19.3 20.4C19.5 21.1 19.8 21.7 20.4 22.2L22.9 20.7C22.4 20 22.2 19.1 22.2 17.5ZM19 17C19 18.7 17.8 20 16.1 20C14.8 20 14 19.3 14 18.3C14 17.1 15 16.4 16.8 16.2L19 15.9V17Z" fill="#0F172A" />
            <path d="M8.5 25C12.8 28.2 19.8 28.8 26.5 25.2" stroke="#FF9900" strokeWidth="2.3" strokeLinecap="round" />
            <path d="M24.5 23.5L27.5 24.9L26 27.8" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case "ty":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#F27A1A" stroke="#EA580C" strokeWidth="1" />
            <rect x="4.5" y="12.5" width="27" height="11" rx="2" fill="#111827" />
            <text x="18" y="20" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="6.2" letterSpacing="0.1">
              trendyol
            </text>
          </svg>
        )
      case "cs":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <path d="M16.5 16.5C16.5 10.5 10.5 7 7 10C4 13 9 16.5 16.5 16.5Z" fill="#84CC16" />
            <path d="M19.5 16.5C19.5 10.5 25.5 7 29 10C32 13 27 16.5 19.5 16.5Z" fill="#F97316" />
            <path d="M16.5 19.5C16.5 25.5 10.5 29 7 26C4 23 9 19.5 16.5 19.5Z" fill="#EF4444" />
            <path d="M19.5 19.5C19.5 25.5 25.5 29 29 26C32 23 27 19.5 19.5 19.5Z" fill="#0EA5E9" />
            <circle cx="18" cy="18" r="2.2" fill="#FFFFFF" />
          </svg>
        )
      case "modanisa":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
            <g fill="#F26522">
              <ellipse cx="18" cy="9.5" rx="2.8" ry="5.5" />
              <ellipse cx="18" cy="26.5" rx="2.8" ry="5.5" />
              <ellipse cx="9.5" cy="18" rx="5.5" ry="2.8" />
              <ellipse cx="26.5" cy="18" rx="5.5" ry="2.8" />
              <ellipse cx="12" cy="12" rx="2.8" ry="5.5" transform="rotate(-45 12 12)" />
              <ellipse cx="24" cy="24" rx="2.8" ry="5.5" transform="rotate(-45 24 24)" />
              <ellipse cx="24" cy="12" rx="2.8" ry="5.5" transform="rotate(45 24 12)" />
              <ellipse cx="12" cy="24" rx="2.8" ry="5.5" transform="rotate(45 12 24)" />
            </g>
          </svg>
        )
      case "pzr":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <path d="M10 29V14C10 9.5 13.6 6.5 18.5 6.5C23.2 6.5 26.5 9.5 26.5 14C26.5 18.5 23.2 21.5 18.5 21.5H14.5V29H10Z" fill="#1D4ED8" />
            <path d="M18.5 6.5C23.2 6.5 26.5 9.5 26.5 14C26.5 18.5 23.2 21.5 18.5 21.5H15V17H18.5C20.5 17 22 15.7 22 14C22 12.3 20.5 11 18.5 11H14.5V6.5H18.5Z" fill="#EC4899" />
            <circle cx="18.2" cy="14" r="3.4" fill="#FFFFFF" />
          </svg>
        )
      case "idf":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <rect x="15" y="6" width="6" height="5.5" rx="1" fill="#E11D48" />
            <path d="M15 14.5L21 12.5V25.5L15 30.5V14.5Z" fill="#0284C7" />
            <path d="M15 14.5L21 18V23L15 19.5V14.5Z" fill="#E11D48" />
          </svg>
        )
      case "lcw":
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#003876" stroke="#1E3A8A" strokeWidth="1" />
            <text x="18" y="18.5" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.3">
              LCW
            </text>
            <text x="18" y="25.5" textAnchor="middle" fill="#93C5FD" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="5" letterSpacing="0.4">
              LCW.COM
            </text>
          </svg>
        )
      case "temu":
      default:
        return (
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16.5" fill="#FB7701" stroke="#EA580C" strokeWidth="1" />
            <circle cx="11" cy="12" r="1.5" fill="#FFFFFF" />
            <rect x="15.8" y="10.4" width="3.2" height="3.2" rx="0.8" fill="#FFFFFF" />
            <path d="M22 13.6L23.8 10.4L25.6 13.6H22Z" fill="#FFFFFF" />
            <text x="18" y="25" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="8.2" letterSpacing="0.5">
              TEMU
            </text>
          </svg>
        )
    }
  }
  const [editingCategory, setEditingCategory] = useState<{
    id?: string
    name: string
    handle: string
    parent_category_id: string
    is_active: boolean
    rank: number
    description: string
  }>({
    name: "",
    handle: "",
    parent_category_id: "",
    is_active: true,
    rank: 0,
    description: "",
  })

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      alert("Lütfen kategori adını girin.")
      return
    }
    try {
      const payload: any = {
        name: editingCategory.name.trim(),
        handle: (editingCategory.handle || slugify(editingCategory.name)).trim(),
        description: editingCategory.description || "",
        is_active: editingCategory.is_active,
        rank: Number(editingCategory.rank) || 0,
        parent_category_id: editingCategory.parent_category_id || null,
      }
      const url = editingCategory.id
        ? `/admin/product-categories/${editingCategory.id}`
        : "/admin/product-categories"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Kategori kaydedilemedi.")
      }
      await fetchData()
      setShowCategoryModal(false)
    } catch (e: any) {
      alert("Hata: " + e.message)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/admin/product-categories/${catId}`, { method: "DELETE" })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== catId))
      } else {
        alert("Kategori silinemedi.")
      }
    } catch (e) {
      alert("Kategori silinirken hata oluştu.")
    }
  }

  const handleDuplicateProduct = async (prod: any) => {
    if (!confirm(`"${prod.title}" ürününü kopyalamak istediğinize emin misiniz?`)) return
    try {
      const firstV = prod.variants?.[0]
      const origPrice = firstV?.prices?.find((p: any) => p.currency_code === "try")?.amount || 10000
      const copyPayload: any = {
        title: `${prod.title} (Kopya)`,
        handle: `${prod.handle || slugify(prod.title)}-kopya-${Date.now().toString().slice(-4)}`,
        description: prod.description || "",
        status: "published",
        thumbnail: prod.thumbnail || undefined,
        images: (prod.images || []).map((img: any) => ({ url: img.url })),
        categories: (prod.categories || []).map((c: any) => ({ id: c.id })),
        collection_id: prod.collection_id || undefined,
        options: [{ title: "Varsayılan", values: ["Standart"] }],
        variants: [
          {
            title: "Standart",
            sku: firstV?.sku ? `${firstV.sku}-COPY` : `SKU-${Date.now().toString().slice(-5)}`,
            barcode: firstV?.barcode || undefined,
            manage_inventory: false,
            options: { Varsayılan: "Standart" },
            prices: [{ currency_code: "try", amount: origPrice }],
            metadata: firstV?.metadata || {},
          },
        ],
      }
      const res = await fetch("/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyPayload),
      })
      if (res.ok) {
        await fetchData()
      } else {
        alert("Ürün kopyalanamadı.")
      }
    } catch (e) {
      alert("Ürün kopyalanırken hata oluştu.")
    }
  }

  // --- Filtered Products list ---
  const filteredProducts = products
    .filter((p, idx) => {
      const prodNo = String(5556 - idx)
      const firstV = p.variants?.[0]
      const sku = String(firstV?.sku || p.handle || "")
      const barcode = String(firstV?.barcode || sku)
      const originalPrice = (firstV?.prices?.find((pr: any) => pr.currency_code === "try")?.amount || 0) / 100
      const salePrice = getSalePriceForVariant(firstV?.id) || originalPrice
      const costPrice = Number(firstV?.metadata?.cost_price || 0)
      const stockCount = getProductTotalStock(p)
      const desi = Number(firstV?.metadata?.desi || p.metadata?.desi || 0)

      // Quick search bar
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchQuick =
          String(p.title || "").toLowerCase().includes(q) ||
          sku.toLowerCase().includes(q) ||
          barcode.toLowerCase().includes(q) ||
          prodNo.includes(q)
        if (!matchQuick) return false
      }

      // Detailed Filter Box: Arama Terimi
      if (appliedProdFilter.searchTerm.trim()) {
        const term = appliedProdFilter.searchTerm.toLowerCase().trim()
        if (appliedProdFilter.searchField === "Ürün No") {
          if (!prodNo.includes(term)) return false
        } else if (appliedProdFilter.searchField === "Ürün Adı") {
          if (!String(p.title || "").toLowerCase().includes(term)) return false
        } else if (appliedProdFilter.searchField === "Ürün Kodu") {
          if (!sku.toLowerCase().includes(term)) return false
        } else if (appliedProdFilter.searchField === "Barkod") {
          if (!barcode.toLowerCase().includes(term)) return false
        } else {
          const matchAny =
            prodNo.includes(term) ||
            String(p.title || "").toLowerCase().includes(term) ||
            sku.toLowerCase().includes(term) ||
            barcode.toLowerCase().includes(term)
          if (!matchAny) return false
        }
      }

      // Gelişmiş Filtreleme
      if (appliedProdFilter.advanced === "Stokta Olanlar" && stockCount <= 0) return false
      if (appliedProdFilter.advanced === "Stokta Olmayanlar" && stockCount > 0) return false
      if (appliedProdFilter.advanced === "Resimsiz Ürünler" && p.thumbnail) return false
      if (appliedProdFilter.advanced === "İndirimli Ürünler" && salePrice >= originalPrice) return false
      if (appliedProdFilter.advanced === "Aktif Ürünler" && p.status === "draft") return false
      if (appliedProdFilter.advanced === "Pasif Ürünler" && p.status !== "draft") return false

      // Kategori
      if (appliedProdFilter.category) {
        const hasCat = (p.categories || []).some((c: any) => c.id === appliedProdFilter.category || c.name === appliedProdFilter.category)
        if (!hasCat) return false
      }

      // Marka
      if (appliedProdFilter.brand) {
        const col = collections.find((c: any) => c.id === p.collection_id)
        const brandName = col?.title || p.metadata?.brand || "BODYKİT MERKEZİ"
        if (p.collection_id !== appliedProdFilter.brand && brandName !== appliedProdFilter.brand) return false
      }

      // Ürün Tipi
      if (appliedProdFilter.productType === "Standart Ürün" && (p.variants?.length || 0) > 1) return false
      if (appliedProdFilter.productType === "Varyantlı Ürün" && (p.variants?.length || 0) <= 1) return false

      // Numeric ranges (ignore when both min & max are 0.00)
      const checkRange = (val: number, minStr: string, maxStr: string) => {
        const min = parseFloat(minStr) || 0
        const max = parseFloat(maxStr) || 0
        if (min === 0 && max === 0) return true
        if (min > 0 && val < min) return false
        if (max > 0 && val > max) return false
        return true
      }

      if (!checkRange(stockCount, appliedProdFilter.stockMin, appliedProdFilter.stockMax)) return false
      if (!checkRange(desi, appliedProdFilter.desiMin, appliedProdFilter.desiMax)) return false
      if (!checkRange(costPrice, appliedProdFilter.costPriceMin, appliedProdFilter.costPriceMax)) return false
      if (!checkRange(originalPrice, appliedProdFilter.marketPriceMin, appliedProdFilter.marketPriceMax)) return false
      if (!checkRange(salePrice, appliedProdFilter.salePriceMin, appliedProdFilter.salePriceMax)) return false

      return true
    })
    .sort((a, b) => {
      const dir = appliedProdFilter.sortDir.includes("Artan") ? 1 : -1
      if (appliedProdFilter.sortField === "Ürün Adı") {
        return String(a.title || "").localeCompare(String(b.title || ""), "tr") * dir
      }
      if (appliedProdFilter.sortField === "Fiyat") {
        const pa = (a.variants?.[0]?.prices?.[0]?.amount || 0)
        const pb = (b.variants?.[0]?.prices?.[0]?.amount || 0)
        return (pa - pb) * dir
      }
      if (appliedProdFilter.sortField === "Stok") {
        return (getProductTotalStock(a) - getProductTotalStock(b)) * dir
      }
      return 0
    })
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div
      className="bg-[#f1f3f6] min-h-screen text-slate-800 custom-admin-wrapper px-6 py-5"
      style={{
        backgroundColor: "#f1f3f6",
        paddingTop: "20px",
        paddingBottom: "40px",
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .custom-admin-wrapper {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
        }
        
        .custom-admin-wrapper * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        @keyframes slideOver {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideOver {
          animation: slideOver 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* -------------------- 1. LIST VIEW -------------------- */}
      {view === "list" && (
        <div>
          {activeSubTab === "markalar" ? (
            /* GÖRSEL 2: MARKALAR (/product-management?tab=markalar) */
            <div className="flex flex-col gap-5 max-w-[1600px] mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-[330px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Hızlı ara.."
                    value={catalogQuickSearch}
                    onChange={(e) => setCatalogQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBrand({
                        name: "",
                        active: true,
                        sort_order: 0,
                        slug: "",
                        image: "",
                        seo_title: "",
                        seo_desc: "",
                        seo_keywords: "",
                        product_ids: [],
                      })
                      setBrandModalTab("genel")
                      setShowBrandModal(true)
                    }}
                    className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none font-black">+</span>
                    <span>Yeni Marka</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const csvRows = [
                        ["No", "Marka Adı", "Durum", "Sıra"].join(";"),
                        ...(catalogData.brands || []).map((b: any) =>
                          [b.no, b.name, b.active !== false ? "Aktif" : "Pasif", b.sort_order ?? 0].join(";")
                        ),
                      ].join("\n")
                      const blob = new Blob(["\uFEFF" + csvRows], { type: "text/csv;charset=utf-8;" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "markalar.csv"
                      a.click()
                    }}
                    className="bg-[#1e88e5] hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>📄</span>
                    <span>Excel İşlemleri</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="border border-zinc-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left bg-white text-[12px]">
                      <thead>
                        <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                          <th className="py-3.5 px-4 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={
                                (catalogData.brands || []).length > 0 &&
                                selectedCatalogIds.length === (catalogData.brands || []).length
                              }
                              onChange={(e) =>
                                setSelectedCatalogIds(
                                  e.target.checked ? (catalogData.brands || []).map((b: any) => b.id) : []
                                )
                              }
                              className="w-4 h-4 rounded border-zinc-300 cursor-pointer"
                            />
                          </th>
                          <th className="py-3.5 px-4 w-[10%]">No</th>
                          <th className="py-3.5 px-4 w-[32%]">Marka Adı</th>
                          <th className="py-3.5 px-4 w-[20%]">Durum</th>
                          <th className="py-3.5 px-4 w-[18%]">Sıra</th>
                          <th className="py-3.5 px-4 w-[16%]">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700">
                        {(() => {
                          const list = (catalogData.brands || []).filter((b: any) => {
                            if (!catalogQuickSearch.trim()) return true
                            const q = catalogQuickSearch.toLowerCase()
                            return (
                              String(b.name || "").toLowerCase().includes(q) ||
                              String(b.no || "").toLowerCase().includes(q)
                            )
                          })
                          if (list.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-zinc-400 font-semibold">
                                  Marka bulunamadı.
                                </td>
                              </tr>
                            )
                          }
                          return list.slice(0, catalogPageSize).map((item: any, idx: number) => (
                            <tr
                              key={item.id || idx}
                              className={`divide-x divide-zinc-200 transition-colors ${
                                idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                              } hover:bg-zinc-50`}
                            >
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedCatalogIds.includes(item.id)}
                                  onChange={(e) =>
                                    setSelectedCatalogIds(
                                      e.target.checked
                                        ? [...selectedCatalogIds, item.id]
                                        : selectedCatalogIds.filter((x) => x !== item.id)
                                    )
                                  }
                                  className="w-4 h-4 rounded border-zinc-300 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  onClick={() => {
                                    setEditingBrand({
                                      id: item.id,
                                      no: item.no,
                                      name: item.name,
                                      active: item.active !== false,
                                      sort_order: item.sort_order ?? 0,
                                      slug: item.slug || "",
                                      image: item.image || "",
                                      seo_title: item.seo_title || "",
                                      seo_desc: item.seo_desc || "",
                                      seo_keywords: item.seo_keywords || "",
                                      product_ids: item.product_ids || [],
                                    })
                                    setBrandModalTab("genel")
                                    setShowBrandModal(true)
                                  }}
                                  className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                                >
                                  {item.no}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.name}</td>
                              <td className="py-3 px-4">
                                {item.active !== false ? (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-zinc-300 text-zinc-400">
                                    ✕
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.sort_order ?? 0}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBrand({
                                        id: item.id,
                                        no: item.no,
                                        name: item.name,
                                        active: item.active !== false,
                                        sort_order: item.sort_order ?? 0,
                                        slug: item.slug || "",
                                        image: item.image || "",
                                        seo_title: item.seo_title || "",
                                        seo_desc: item.seo_desc || "",
                                        seo_keywords: item.seo_keywords || "",
                                        product_ids: item.product_ids || [],
                                      })
                                      setBrandModalTab("genel")
                                      setShowBrandModal(true)
                                    }}
                                    className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Markayı Düzenle"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.open(`https://kombingo.com/marka/${item.slug || slugify(item.name)}`, "_blank")
                                    }
                                    className="w-7 h-7 rounded bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Mağazada Görüntüle"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBrand(item.id)}
                                    className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Sil"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <select
                    value={catalogPageSize}
                    onChange={(e) => setCatalogPageSize(Number(e.target.value))}
                    className="border border-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs font-medium text-zinc-600">
                    {(catalogData.brands || []).length} kayıttan {(catalogData.brands || []).length > 0 ? 1 : 0} ile{" "}
                    {Math.min(catalogPageSize, (catalogData.brands || []).length)} arası gösteriliyor
                  </span>
                </div>
              </div>
            </div>
          ) : activeSubTab === "etiketler" ? (
            /* GÖRSEL 3: ETİKETLER (/product-management?tab=etiketler) */
            <div className="flex flex-col gap-5 max-w-[1600px] mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-[330px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Hızlı ara.."
                    value={catalogQuickSearch}
                    onChange={(e) => setCatalogQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingTag({
                      name: "",
                      image: "",
                      top_left: false,
                      top_right: false,
                      bottom_left: false,
                      bottom_right: false,
                      seo_title: "",
                      seo_desc: "",
                      seo_keywords: "",
                      slug: "",
                      product_ids: [],
                      active: true,
                      sort_order: 0,
                    })
                    setTagModalTab("genel")
                    setShowTagModal(true)
                  }}
                  className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span className="text-sm leading-none font-black">+</span>
                  <span>Yeni Etiket</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="border border-zinc-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left bg-white text-[12px]">
                      <thead>
                        <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                          <th className="py-3.5 px-4 w-16">#</th>
                          <th className="py-3.5 px-4 w-24">No</th>
                          <th className="py-3.5 px-4">Etiket Adı</th>
                          <th className="py-3.5 px-4">Sol Üst</th>
                          <th className="py-3.5 px-4">Sağ Üst</th>
                          <th className="py-3.5 px-4">Sol Alt</th>
                          <th className="py-3.5 px-4">Sağ Alt</th>
                          <th className="py-3.5 px-4 w-36">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700">
                        {(() => {
                          const list = (catalogData.tags || []).filter((t: any) => {
                            if (!catalogQuickSearch.trim()) return true
                            const q = catalogQuickSearch.toLowerCase()
                            return String(t.name || "").toLowerCase().includes(q)
                          })
                          if (list.length === 0) {
                            return null
                          }
                          return list.slice(0, catalogPageSize).map((item: any, idx: number) => (
                            <tr
                              key={item.id || idx}
                              className={`divide-x divide-zinc-200 transition-colors ${
                                idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                              } hover:bg-zinc-50`}
                            >
                              <td className="py-3 px-4">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded border border-zinc-200" />
                                ) : (
                                  <span className="text-zinc-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  onClick={() => {
                                    setEditingTag({
                                      id: item.id,
                                      no: item.no,
                                      name: item.name,
                                      image: item.image || "",
                                      top_left: Boolean(item.top_left),
                                      top_right: Boolean(item.top_right),
                                      bottom_left: Boolean(item.bottom_left),
                                      bottom_right: Boolean(item.bottom_right),
                                      seo_title: item.seo_title || "",
                                      seo_desc: item.seo_desc || "",
                                      seo_keywords: item.seo_keywords || "",
                                      slug: item.slug || "",
                                      product_ids: item.product_ids || [],
                                      active: item.active !== false,
                                      sort_order: item.sort_order ?? 0,
                                    })
                                    setTagModalTab("genel")
                                    setShowTagModal(true)
                                  }}
                                  className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                                >
                                  {item.no}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.name}</td>
                              <td className="py-3 px-4">{item.top_left ? "✓" : "-"}</td>
                              <td className="py-3 px-4">{item.top_right ? "✓" : "-"}</td>
                              <td className="py-3 px-4">{item.bottom_left ? "✓" : "-"}</td>
                              <td className="py-3 px-4">{item.bottom_right ? "✓" : "-"}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTag({
                                        id: item.id,
                                        no: item.no,
                                        name: item.name,
                                        image: item.image || "",
                                        top_left: Boolean(item.top_left),
                                        top_right: Boolean(item.top_right),
                                        bottom_left: Boolean(item.bottom_left),
                                        bottom_right: Boolean(item.bottom_right),
                                        seo_title: item.seo_title || "",
                                        seo_desc: item.seo_desc || "",
                                        seo_keywords: item.seo_keywords || "",
                                        slug: item.slug || "",
                                        product_ids: item.product_ids || [],
                                        active: item.active !== false,
                                        sort_order: item.sort_order ?? 0,
                                      })
                                      setTagModalTab("genel")
                                      setShowTagModal(true)
                                    }}
                                    className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Etiketi Düzenle"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTag(item.id)}
                                    className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Sil"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <select
                    value={catalogPageSize}
                    onChange={(e) => setCatalogPageSize(Number(e.target.value))}
                    className="border border-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs font-medium text-zinc-600">
                    {(catalogData.tags || []).length} kayıttan {(catalogData.tags || []).length > 0 ? 1 : 0} ile{" "}
                    {Math.min(catalogPageSize, (catalogData.tags || []).length)} arası gösteriliyor
                  </span>
                </div>
              </div>
            </div>
          ) : activeSubTab === "stok-birimleri" ? (
            /* GÖRSEL 4: STOK BİRİMLERİ (/product-management?tab=stok-birimleri) */
            <div className="flex flex-col gap-5 max-w-[1600px] mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-[330px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Hızlı ara.."
                    value={catalogQuickSearch}
                    onChange={(e) => setCatalogQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingUnit({
                      name: "",
                      listing_name: "",
                      abbreviation: "",
                      decimal_places: "Tam Sayı",
                      cart_increment: 1,
                      default_cart_qty: 1,
                    })
                    setShowUnitModal(true)
                  }}
                  className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span className="text-sm leading-none font-black">+</span>
                  <span>Yeni Birim</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="border border-zinc-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left bg-white text-[12px]">
                      <thead>
                        <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                          <th className="py-3.5 px-4 w-12 text-center">
                            <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 cursor-pointer" />
                          </th>
                          <th className="py-3.5 px-4">No</th>
                          <th className="py-3.5 px-4">Birim Adı</th>
                          <th className="py-3.5 px-4">Listeleme Adı</th>
                          <th className="py-3.5 px-4">Kısaltma</th>
                          <th className="py-3.5 px-4">Ondalık Alan Sayısı</th>
                          <th className="py-3.5 px-4">Sepet Artış Miktarı</th>
                          <th className="py-3.5 px-4">Öntanımlı Sepet Miktarı</th>
                          <th className="py-3.5 px-4 w-24">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700">
                        {(() => {
                          const list = (catalogData.units || []).filter((u: any) => {
                            if (!catalogQuickSearch.trim()) return true
                            const q = catalogQuickSearch.toLowerCase()
                            return (
                              String(u.name || "").toLowerCase().includes(q) ||
                              String(u.abbreviation || "").toLowerCase().includes(q)
                            )
                          })
                          return list.slice(0, catalogPageSize).map((item: any, idx: number) => (
                            <tr
                              key={item.id || idx}
                              className={`divide-x divide-zinc-200 transition-colors ${
                                idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                              } hover:bg-zinc-50`}
                            >
                              <td className="py-3 px-4 text-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 cursor-pointer" />
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  onClick={() => {
                                    setEditingUnit({
                                      id: item.id,
                                      no: item.no,
                                      name: item.name,
                                      listing_name: item.listing_name || item.name,
                                      abbreviation: item.abbreviation || item.name,
                                      decimal_places: item.decimal_places || "Tam Sayı",
                                      cart_increment: item.cart_increment ?? 1,
                                      default_cart_qty: item.default_cart_qty ?? 1,
                                    })
                                    setShowUnitModal(true)
                                  }}
                                  className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                                >
                                  {item.no}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.name}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.listing_name || item.name}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.abbreviation}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.decimal_places}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.cart_increment}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.default_cart_qty}</td>
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUnit({
                                      id: item.id,
                                      no: item.no,
                                      name: item.name,
                                      listing_name: item.listing_name || item.name,
                                      abbreviation: item.abbreviation || item.name,
                                      decimal_places: item.decimal_places || "Tam Sayı",
                                      cart_increment: item.cart_increment ?? 1,
                                      default_cart_qty: item.default_cart_qty ?? 1,
                                    })
                                    setShowUnitModal(true)
                                  }}
                                  className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                  title="Birimi Düzenle"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <select
                    value={catalogPageSize}
                    onChange={(e) => setCatalogPageSize(Number(e.target.value))}
                    className="border border-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs font-medium text-zinc-600">
                    {(catalogData.units || []).length} kayıttan {(catalogData.units || []).length > 0 ? 1 : 0} ile{" "}
                    {Math.min(catalogPageSize, (catalogData.units || []).length)} arası gösteriliyor
                  </span>
                </div>
              </div>
            </div>
          ) : activeSubTab === "arama-sonuclari" ? (
            /* GÖRSEL 5: ARAMA SONUÇLARI (/product-management?tab=arama-sonuclari) */
            <div className="flex flex-col gap-5 max-w-[1600px] mx-auto">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSearchFilters(!showSearchFilters)}
                  className="bg-white border border-zinc-200 px-3.5 py-2 rounded-md text-xs font-semibold text-zinc-700 hover:bg-zinc-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Filtreler</span>
                  <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showSearchFilters ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="relative w-full max-w-[300px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Hızlı ara.."
                    value={catalogQuickSearch}
                    onChange={(e) => setCatalogQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-2xs"
                  />
                </div>
              </div>

              {showSearchFilters && (
                <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-wrap items-center gap-4 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-zinc-700">Min. Aranma Sayısı:</label>
                    <input
                      type="number"
                      value={minSearchCountFilter}
                      onChange={(e) => setMinSearchCountFilter(e.target.value)}
                      placeholder="Örn: 10"
                      className="border border-zinc-200 rounded px-3 py-1.5 text-xs w-28 focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zeroResultsOnlyFilter}
                      onChange={(e) => setZeroResultsOnlyFilter(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span>Sadece Sonuç Bulunamayan Aramalar (0 Sonuç)</span>
                  </label>
                </div>
              )}

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="border border-zinc-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left bg-white text-[12px]">
                      <thead>
                        <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                          <th className="py-3.5 px-4 w-12 text-center">
                            <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 cursor-pointer" />
                          </th>
                          <th className="py-3.5 px-4">No</th>
                          <th className="py-3.5 px-4">Aranan Kelime</th>
                          <th className="py-3.5 px-4">Aranma Sayısı</th>
                          <th className="py-3.5 px-4">Sonuç Sayısı</th>
                          <th className="py-3.5 px-4">İlk Arama Tarihi</th>
                          <th className="py-3.5 px-4">Son Arama Tarihi</th>
                          <th className="py-3.5 px-4">Arama Eşleştirme</th>
                          <th className="py-3.5 px-4 w-32">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700">
                        {(() => {
                          const list = (catalogData.searchResults || []).filter((s: any) => {
                            if (catalogQuickSearch.trim()) {
                              const q = catalogQuickSearch.toLowerCase()
                              if (
                                !String(s.keyword || "").toLowerCase().includes(q) &&
                                !String(s.no || "").toLowerCase().includes(q)
                              ) {
                                return false
                              }
                            }
                            if (minSearchCountFilter && Number(s.search_count) < Number(minSearchCountFilter)) {
                              return false
                            }
                            if (zeroResultsOnlyFilter && Number(s.result_count) > 0) {
                              return false
                            }
                            return true
                          })
                          return list.slice(0, catalogPageSize).map((item: any, idx: number) => (
                            <tr
                              key={item.id || idx}
                              className={`divide-x divide-zinc-200 transition-colors ${
                                idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                              } hover:bg-zinc-50`}
                            >
                              <td className="py-3 px-4 text-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 cursor-pointer" />
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  onClick={() => {
                                    setEditingSearchResult({
                                      id: item.id,
                                      no: item.no,
                                      keyword: item.keyword,
                                      search_count: item.search_count,
                                      result_count: item.result_count,
                                      mapped_keyword: item.mapped_keyword || "-",
                                    })
                                    setShowSearchResultModal(true)
                                  }}
                                  className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                                >
                                  {item.no}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.keyword}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.search_count}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.result_count}</td>
                              <td className="py-3 px-4 font-medium text-zinc-600">{item.first_searched_at}</td>
                              <td className="py-3 px-4 font-medium text-zinc-600">{item.last_searched_at}</td>
                              <td className="py-3 px-4 font-medium text-zinc-700">{item.mapped_keyword || "-"}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSearchResult({
                                        id: item.id,
                                        no: item.no,
                                        keyword: item.keyword,
                                        search_count: item.search_count,
                                        result_count: item.result_count,
                                        mapped_keyword: item.mapped_keyword || "-",
                                      })
                                      setShowSearchResultModal(true)
                                    }}
                                    className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Arama Detayı / Eşleştir"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.open(`https://kombingo.com/?q=${encodeURIComponent(item.keyword)}`, "_blank")
                                    }
                                    className="w-7 h-7 rounded bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Mağazada Arama Sonucunu Gör"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSearchResult(item.id)}
                                    className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                    title="Sil"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSubTab === "urun-yorumlari" ? (
            /* ÜRÜN YORUMLARI VE DEĞERLENDİRMELER (/product-management?tab=urun-yorumlari) */
            <div className="flex flex-col gap-5 max-w-[1600px] mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-[330px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Müşteri adı, ürün veya yorum ara.."
                    value={catalogQuickSearch}
                    onChange={(e) => setCatalogQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview({
                        product_id: "all",
                        product_title: "Genel Vitrin Yorumu",
                        customer_name: "",
                        color: selectedColors[0] || "STANDART",
                        rating: 5,
                        comment: "",
                        media_url: "",
                        media_type: "image",
                        active: true,
                      })
                      setShowReviewModal(true)
                    }}
                    className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none font-black">+</span>
                    <span>Yeni Müşteri Yorumu Ekle</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="border border-zinc-200 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left bg-white text-[12px]">
                      <thead>
                        <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                          <th className="py-3.5 px-4 w-16">No</th>
                          <th className="py-3.5 px-4 w-20">Görsel / Video</th>
                          <th className="py-3.5 px-4">Müşteri Adı</th>
                          <th className="py-3.5 px-4">Ürün / Renk Seçimi</th>
                          <th className="py-3.5 px-4 w-36">Yıldız Puanı</th>
                          <th className="py-3.5 px-4">Yorum</th>
                          <th className="py-3.5 px-4 w-24 text-center">Durum</th>
                          <th className="py-3.5 px-4 w-32">Tarih</th>
                          <th className="py-3.5 px-4 w-28">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700">
                        {(() => {
                          const list = (catalogData.reviews || []).filter((r: any) => {
                            if (!catalogQuickSearch.trim()) return true
                            const q = catalogQuickSearch.toLowerCase()
                            return (
                              String(r.customer_name || "").toLowerCase().includes(q) ||
                              String(r.comment || "").toLowerCase().includes(q) ||
                              String(r.product_title || "").toLowerCase().includes(q) ||
                              String(r.color || "").toLowerCase().includes(q)
                            )
                          })
                          if (list.length === 0) {
                            return (
                              <tr>
                                <td colSpan={9} className="py-12 text-center text-zinc-400 font-semibold">
                                  Henüz yorum bulunmuyor. &quot;+ Yeni Müşteri Yorumu Ekle&quot; butonuna tıklayarak ilk yorumu ekleyebilirsiniz.
                                </td>
                              </tr>
                            )
                          }
                          return list.slice(0, catalogPageSize).map((item: any, idx: number) => {
                            const isVid = item.media_type === "video" || isVideoUrl(item.media_url || "")
                            return (
                              <tr
                                key={item.id || idx}
                                className={"divide-x divide-zinc-200 transition-colors hover:bg-zinc-50 " + (idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white")}
                              >
                                <td className="py-3 px-4">
                                  <span
                                    onClick={() => {
                                      setEditingReview({
                                        id: item.id,
                                        no: item.no,
                                        product_id: item.product_id || "all",
                                        product_title: item.product_title || "Genel Vitrin Yorumu",
                                        product_handle: item.product_handle || "",
                                        product_thumbnail: item.product_thumbnail || "",
                                        customer_name: item.customer_name || "",
                                        color: item.color || "STANDART",
                                        rating: Number(item.rating || 5),
                                        comment: item.comment || "",
                                        media_url: item.media_url || "",
                                        media_type: isVid ? "video" : "image",
                                        active: item.active !== false,
                                      })
                                      setShowReviewModal(true)
                                    }}
                                    className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                                  >
                                    {item.no || idx + 1}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {item.media_url ? (
                                    isVid ? (
                                      <div className="w-12 h-12 rounded-md border border-zinc-200 overflow-hidden bg-black relative">
                                        <video src={item.media_url} className="w-full h-full object-cover" muted playsInline />
                                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                                          VİDEO
                                        </span>
                                      </div>
                                    ) : (
                                      <img
                                        src={item.media_url}
                                        alt={item.customer_name}
                                        className="w-12 h-12 rounded-md object-cover border border-zinc-200"
                                      />
                                    )
                                  ) : (
                                    <span className="text-zinc-400 text-xs">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 font-bold text-zinc-800">{item.customer_name}</td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-zinc-800">
                                      {item.product_id === "all" ? "Tüm Ürünler (Genel Vitrin)" : item.product_title}
                                    </span>
                                    {item.color && (
                                      <span className="text-[11px] text-zinc-500 mt-0.5">Renk: {item.color}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1">
                                    <div className="flex text-amber-400 text-sm">
                                      {"★".repeat(Number(item.rating || 5))}
                                      <span className="text-zinc-200">{"★".repeat(5 - Number(item.rating || 5))}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-zinc-700 ml-1">
                                      {Number(item.rating || 5).toFixed(1)} / 5
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 max-w-md">
                                  <p className="text-zinc-700 line-clamp-2 leading-relaxed">{item.comment}</p>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleReviewStatus(item.id)}
                                    className="cursor-pointer"
                                    title="Durumu Değiştir"
                                  >
                                    {item.active !== false ? (
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-zinc-300 text-zinc-400">
                                        ✕
                                      </span>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-zinc-500 text-[11px]">{item.created_at || "-"}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingReview({
                                          id: item.id,
                                          no: item.no,
                                          product_id: item.product_id || "all",
                                          product_title: item.product_title || "Genel Vitrin Yorumu",
                                          product_handle: item.product_handle || "",
                                          product_thumbnail: item.product_thumbnail || "",
                                          customer_name: item.customer_name || "",
                                          color: item.color || "STANDART",
                                          rating: Number(item.rating || 5),
                                          comment: item.comment || "",
                                          media_url: item.media_url || "",
                                          media_type: isVid ? "video" : "image",
                                          active: item.active !== false,
                                        })
                                        setShowReviewModal(true)
                                      }}
                                      className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                      title="Yorumu Düzenle"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReview(item.id)}
                                      className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                                      title="Yorumu Sil"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <select
                    value={catalogPageSize}
                    onChange={(e) => setCatalogPageSize(Number(e.target.value))}
                    className="border border-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs font-medium text-zinc-600">
                    {(catalogData.reviews || []).length} kayıttan {(catalogData.reviews || []).length > 0 ? 1 : 0} ile{" "}
                    {Math.min(catalogPageSize, (catalogData.reviews || []).length)} arası gösteriliyor
                  </span>
                </div>
              </div>
            </div>
          ) : activeSubTab === "urun-siralama" ? (
            /* GÖRSEL 1: ÜRÜN SIRALAMA (/product-management?tab=urun-siralama) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto items-start">
              {/* Sol Kutu: Sıralama Tipleri (5 Kolon) */}
              <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[15px] font-semibold text-zinc-700">Sıralama Tipleri</h2>
                  <div className="flex items-center gap-4 text-[12px] font-semibold">
                    {[
                      { key: "kategori", label: "Kategori" },
                      { key: "marka", label: "Marka" },
                      { key: "nitelik", label: "Nitelik" },
                      { key: "etiket", label: "Etiket" },
                      { key: "arama", label: "Arama" },
                    ].map((tab) => {
                      const isAct = sortingTypeTab === tab.key
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setSortingTypeTab(tab.key as any)}
                          className={"cursor-pointer transition-colors " + (isAct ? "text-[#1e88e5] font-bold" : "text-zinc-600 hover:text-zinc-900")}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Gri Bilgi Kutusu */}
                <div className="bg-[#f4f5f7] border-l-[3px] border-[#9fa6b2] rounded-r-md px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-800">
                    {sortingTypeTab === "kategori" && "Kategori Sıralama Tipleri"}
                    {sortingTypeTab === "marka" && "Marka Sıralama Tipleri"}
                    {sortingTypeTab === "nitelik" && "Nitelik Sıralama Tipleri"}
                    {sortingTypeTab === "etiket" && "Etiket Sıralama Tipleri"}
                    {sortingTypeTab === "arama" && "Arama Sıralama Tipleri"}
                  </span>
                  <span className="text-[11.5px] text-zinc-600">Sürükle-bırak ile yer değiştirebilirsiniz.</span>
                </div>

                {/* Sürükle-Bırak Sıralama Satırları */}
                <div className="flex flex-col gap-2">
                  {(sortingTypesMap[sortingTypeTab] || DEFAULT_SORT_ITEMS).map((opt: any, idx: number) => (
                    <div
                      key={opt.id || idx}
                      draggable
                      onDragStart={() => setDragSortIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragSortIdx === null || dragSortIdx === idx) return
                        const currentList = [...(sortingTypesMap[sortingTypeTab] || DEFAULT_SORT_ITEMS)]
                        const [moved] = currentList.splice(dragSortIdx, 1)
                        currentList.splice(idx, 0, moved)
                        setSortingTypesMap({ ...sortingTypesMap, [sortingTypeTab]: currentList })
                        setDragSortIdx(null)
                      }}
                      className="bg-[#f4f5f7] border border-zinc-200/80 rounded-md px-4 py-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-zinc-800">{opt.label}</span>
                        {opt.info && (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-600 text-white text-[10px] font-bold"
                            title="Akıllı sıralama kurallarına göre ürünleri otomatik sıralar"
                          >
                            i
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const currentList = [...(sortingTypesMap[sortingTypeTab] || DEFAULT_SORT_ITEMS)]
                          currentList[idx] = { ...currentList[idx], active: !currentList[idx].active }
                          setSortingTypesMap({ ...sortingTypesMap, [sortingTypeTab]: currentList })
                        }}
                        className={"w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center " + (opt.active !== false ? "bg-[#2ebd85]" : "bg-zinc-300")}
                      >
                        <span
                          className={"w-5 h-5 rounded-full bg-white shadow transition-transform " + (opt.active !== false ? "translate-x-5" : "translate-x-0")}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/admin/catalog-operations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "save_sorting_types", sortingTypes: sortingTypesMap }),
                        })
                        const data = await res.json()
                        if (data?.success) {
                          alert("Sıralama tipleri başarıyla kaydedildi.")
                        }
                      } catch (e) {}
                    }}
                    className="bg-[#2ebd85] hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </div>

              {/* Sağ Kutu: Akıllı Sıralamalar (7 Kolon) */}
              <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-bold text-[#1e88e5]">Akıllı Sıralamalar</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSmartSort({
                        page_type: "Kategori",
                        name: "",
                        rule_type: "En Çok Satanlar Önde",
                      })
                      setShowSmartSortModal(true)
                    }}
                    className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none font-black">+</span>
                    <span>Yeni Sıralama</span>
                  </button>
                </div>

                <div className="bg-[#f4f5f7] border-l-[3px] border-[#9fa6b2] rounded-r-md px-4 py-3 text-xs text-zinc-700">
                  Kategori, marka veya ürün etiket sayfalarında yer alan ürünlerin sıralamalarını akıllı sıralamalar oluşturarak özelleştirebilirsiniz.
                </div>

                <div className="border border-zinc-200 rounded-md overflow-hidden">
                  <table className="w-full border-collapse text-left bg-white text-[12px]">
                    <thead>
                      <tr className="bg-zinc-100/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                        <th className="py-3.5 px-4 w-14">#</th>
                        <th className="py-3.5 px-4 w-20">No</th>
                        <th className="py-3.5 px-4">Sayfa Tipi</th>
                        <th className="py-3.5 px-4">Adı</th>
                        <th className="py-3.5 px-4">Son Güncellenme</th>
                        <th className="py-3.5 px-4 w-28">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-700">
                      {smartSortRules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs font-medium">
                            Kayıt bulunamadı
                          </td>
                        </tr>
                      ) : (
                        smartSortRules.map((rule: any, idx: number) => (
                          <tr key={rule.id || idx} className="divide-x divide-zinc-200 hover:bg-zinc-50">
                            <td className="py-3 px-4">{idx + 1}</td>
                            <td className="py-3 px-4 font-bold text-[#1e88e5]">{rule.no}</td>
                            <td className="py-3 px-4 font-medium">{rule.page_type}</td>
                            <td className="py-3 px-4 font-semibold text-zinc-800">{rule.name}</td>
                            <td className="py-3 px-4 text-zinc-500">{rule.updated_at}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSmartSort({
                                      id: rule.id,
                                      no: rule.no,
                                      page_type: rule.page_type || "Kategori",
                                      name: rule.name || "",
                                      rule_type: rule.rule_type || "En Çok Satanlar Önde",
                                    })
                                    setShowSmartSortModal(true)
                                  }}
                                  className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-2xs cursor-pointer"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm("Bu akıllı sıralamayı silmek istediğinize emin misiniz?")) return
                                    const res = await fetch("/admin/catalog-operations", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ action: "delete_smart_sort_rule", id: rule.id }),
                                    })
                                    const data = await res.json()
                                    if (data?.success) setSmartSortRules(data.smartSortRules || [])
                                  }}
                                  className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-2xs cursor-pointer"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <select className="border border-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none">
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                  </select>
                  <span className="text-xs font-medium text-zinc-600">
                    {smartSortRules.length} kayıttan {smartSortRules.length > 0 ? 1 : 1} ile {smartSortRules.length} arası gösteriliyor
                  </span>
                </div>
              </div>
            </div>
          ) : activeSubTab === "hizli-seo" ? (
            /* GÖRSEL 2: HIZLI SEO GÜNCELLEME (/product-management?tab=hizli-seo) */
            <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sol Dikey Menü (3 Kolon) */}
              <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden divide-y divide-zinc-100 sticky top-6">
                {[
                  { key: "urun", label: "Ürün SEO Bilgileri", icon: "☰", anchor: "fast-seo-urun" },
                  { key: "kategori", label: "Kategori SEO Bilgileri", icon: "品", anchor: "fast-seo-kategori" },
                  { key: "marka", label: "Marka SEO Bilgileri", icon: "✳", anchor: "fast-seo-marka" },
                  { key: "etiket", label: "Etiket SEO Bilgileri", icon: "🏷", anchor: "fast-seo-etiket" },
                ].map((nav) => {
                  const isAct = fastSeoActiveSection === nav.key
                  return (
                    <button
                      key={nav.key}
                      type="button"
                      onClick={() => {
                        setFastSeoActiveSection(nav.key as any)
                        const el = document.getElementById(nav.anchor)
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                      }}
                      className={"w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer " + (isAct ? "bg-blue-50/50 text-[#1e88e5]" : "text-zinc-600 hover:bg-zinc-50")}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-zinc-400 text-sm">{nav.icon}</span>
                        <span>{nav.label}</span>
                      </span>
                      <span className="text-zinc-400">›</span>
                    </button>
                  )
                })}
              </div>

              {/* Sağ Form Kartları (9 Kolon) */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                {/* 1. KART: ÜRÜN SEO BİLGİLERİ */}
                <div id="fast-seo-urun" className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-zinc-700">
                    <span>☰</span>
                    <span>Ürün SEO Bilgileri</span>
                  </div>

                  <div className="bg-[#f4f5f7] border-l-[3px] border-[#9fa6b2] rounded-r-md px-4 py-3 text-xs text-zinc-700">
                    Güncellemek istediğiniz ürünleri filtreleyebilirsiniz.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Gelişmiş Filtreleme</label>
                      <select
                        value={fastSeoProdFilter.advanced}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, advanced: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Seçilmedi">Seçilmedi</option>
                        <option value="Yeni Ürünler">Yeni Ürünler</option>
                        <option value="İndirimli Ürünler">İndirimli Ürünler</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Kategori</label>
                      <select
                        value={fastSeoProdFilter.category}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, category: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="">Kategori Seçilmedi</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Marka</label>
                      <select
                        value={fastSeoProdFilter.brand}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, brand: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="">Marka Seçilmedi</option>
                        {(catalogData.brands || []).map((b: any) => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Ürün Kaynağı</label>
                      <select
                        value={fastSeoProdFilter.source}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, source: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Kaynak Seçilmedi">Kaynak Seçilmedi</option>
                        <option value="Panel">Yönetim Paneli</option>
                        <option value="XML">XML Tedarikçi</option>
                        <option value="Excel">Excel Aktarımı</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Ürün Etiketleri</label>
                      <select
                        value={fastSeoProdFilter.tag}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, tag: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="">Etiket Seçilmedi</option>
                        {(catalogData.tags || []).map((t: any) => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Stok Miktarı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fastSeoProdFilter.stockMin}
                          onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, stockMin: e.target.value })}
                          className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 focus:outline-none"
                        />
                        <span className="text-xs text-zinc-500">ile</span>
                        <input
                          type="text"
                          value={fastSeoProdFilter.stockMax}
                          onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, stockMax: e.target.value })}
                          className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Piyasa Fiyatı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fastSeoProdFilter.marketPriceMin}
                          onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, marketPriceMin: e.target.value })}
                          className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 focus:outline-none"
                        />
                        <span className="text-xs text-zinc-500">ile</span>
                        <input
                          type="text"
                          value={fastSeoProdFilter.marketPriceMax}
                          onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, marketPriceMax: e.target.value })}
                          className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Satış Fiyatı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fastSeoProdFilter.salePriceMin}
                          onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, salePriceMin: e.target.value })}
                          className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 focus:outline-none"
                        />
                        <span className="text-xs text-zinc-500">ile</span>
                        <input
                          type="text"
                          value={fastSeoProdFilter.salePriceMax}
                          onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, salePriceMax: e.target.value })}
                          className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Para Birimi</label>
                      <select
                        value={fastSeoProdFilter.currency}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, currency: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Hiçbiri seçilmedi">Hiçbiri seçilmedi</option>
                        <option value="TRY">TL (TRY)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Başlığı</label>
                      <select
                        value={fastSeoProdFilter.seoTitleStatus}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, seoTitleStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Açıklaması</label>
                      <select
                        value={fastSeoProdFilter.seoDescStatus}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, seoDescStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Anahtar Kelimeleri</label>
                      <select
                        value={fastSeoProdFilter.seoKeywordStatus}
                        onChange={(e) => setFastSeoProdFilter({ ...fastSeoProdFilter, seoKeywordStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = products.filter((p: any) => {
                          if (fastSeoProdFilter.category && !p.categories?.some((c: any) => c.id === fastSeoProdFilter.category)) {
                            return false
                          }
                          return true
                        })
                        const initialMap: Record<string, { title: string; desc: string; keywords: string }> = {}
                        filtered.slice(0, 30).forEach((p: any) => {
                          initialMap[p.id] = {
                            title: p.metadata?.seo_title || (p.title + " | En Uygun Fiyat"),
                            desc: p.metadata?.seo_description || (p.title + " ürünü indirimli fiyat ve hızlı kargo avantajıyla."),
                            keywords: p.metadata?.seo_keywords || p.title,
                          }
                        })
                        setFastSeoInlineEdits(initialMap)
                        setFastSeoFilteredResults(filtered.slice(0, 30))
                      }}
                      className="bg-[#2ebd85] hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Filtrele
                    </button>
                    {fastSeoFilteredResults && (
                      <button
                        type="button"
                        onClick={() => setFastSeoFilteredResults(null)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                      >
                        Sonuçları Gizle ({fastSeoFilteredResults.length} ürün)
                      </button>
                    )}
                  </div>

                  {/* Filtrelenen Ürünler İçin Hızlı SEO Düzenleme Tablosu */}
                  {fastSeoFilteredResults && (
                    <div className="mt-3 border border-zinc-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-700">
                            <th className="py-2.5 px-3">Ürün Adı</th>
                            <th className="py-2.5 px-3">SEO Başlığı (Title)</th>
                            <th className="py-2.5 px-3">SEO Açıklaması (Description)</th>
                            <th className="py-2.5 px-3 w-24 text-right">Kaydet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {fastSeoFilteredResults.map((prod: any) => {
                            const editRow = fastSeoInlineEdits[prod.id] || { title: "", desc: "", keywords: "" }
                            return (
                              <tr key={prod.id} className="hover:bg-zinc-50/60">
                                <td className="py-2.5 px-3 font-semibold text-zinc-800 max-w-[200px] truncate">{prod.title}</td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={editRow.title}
                                    onChange={(e) =>
                                      setFastSeoInlineEdits({
                                        ...fastSeoInlineEdits,
                                        [prod.id]: { ...editRow, title: e.target.value },
                                      })
                                    }
                                    className="w-full border border-zinc-200 rounded px-2.5 py-1.5 text-xs"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={editRow.desc}
                                    onChange={(e) =>
                                      setFastSeoInlineEdits({
                                        ...fastSeoInlineEdits,
                                        [prod.id]: { ...editRow, desc: e.target.value },
                                      })
                                    }
                                    className="w-full border border-zinc-200 rounded px-2.5 py-1.5 text-xs"
                                  />
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    type="button"
                                    disabled={savingFastSeoId === prod.id}
                                    onClick={async () => {
                                      setSavingFastSeoId(prod.id)
                                      try {
                                        await fetch("/admin/products/" + prod.id, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            metadata: {
                                              ...(prod.metadata || {}),
                                              seo_title: editRow.title,
                                              seo_description: editRow.desc,
                                              seo_keywords: editRow.keywords,
                                            },
                                          }),
                                        })
                                      } catch (e) {}
                                      setSavingFastSeoId(null)
                                    }}
                                    className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-[11px] cursor-pointer"
                                  >
                                    {savingFastSeoId === prod.id ? "..." : "✓ Kaydet"}
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. KART: KATEGORİ SEO BİLGİLERİ */}
                <div id="fast-seo-kategori" className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-zinc-700">
                    <span>品</span>
                    <span>Kategori SEO Bilgileri</span>
                  </div>

                  <div className="bg-[#f4f5f7] border-l-[3px] border-[#9fa6b2] rounded-r-md px-4 py-3 text-xs text-zinc-700">
                    Güncellemek istediğiniz kategorileri filtreleyebilirsiniz.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Gelişmiş Filtreleme</label>
                      <select
                        value={fastSeoCatFilter.advanced}
                        onChange={(e) => setFastSeoCatFilter({ ...fastSeoCatFilter, advanced: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Seçilmedi">Seçilmedi</option>
                        <option value="Ana Kategoriler">Ana Kategoriler</option>
                        <option value="Alt Kategoriler">Alt Kategoriler</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Kategori</label>
                      <select
                        value={fastSeoCatFilter.category}
                        onChange={(e) => setFastSeoCatFilter({ ...fastSeoCatFilter, category: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="">Kategori Seçilmedi</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Başlığı</label>
                      <select
                        value={fastSeoCatFilter.seoTitleStatus}
                        onChange={(e) => setFastSeoCatFilter({ ...fastSeoCatFilter, seoTitleStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Açıklaması</label>
                      <select
                        value={fastSeoCatFilter.seoDescStatus}
                        onChange={(e) => setFastSeoCatFilter({ ...fastSeoCatFilter, seoDescStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Anahtar Kelimeleri</label>
                      <select
                        value={fastSeoCatFilter.seoKeywordStatus}
                        onChange={(e) => setFastSeoCatFilter({ ...fastSeoCatFilter, seoKeywordStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => alert("Toplam " + categories.length + " kategori SEO güncellemesi için listelendi.")}
                      className="bg-[#2ebd85] hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Filtrele
                    </button>
                  </div>
                </div>

                {/* 3. KART: MARKA SEO BİLGİLERİ */}
                <div id="fast-seo-marka" className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-zinc-700">
                    <span>✳</span>
                    <span>Marka SEO Bilgileri</span>
                  </div>

                  <div className="bg-[#f4f5f7] border-l-[3px] border-[#9fa6b2] rounded-r-md px-4 py-3 text-xs text-zinc-700">
                    Güncellemek istediğiniz markaları filtreleyebilirsiniz.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Marka</label>
                      <select
                        value={fastSeoBrandFilter.brand}
                        onChange={(e) => setFastSeoBrandFilter({ ...fastSeoBrandFilter, brand: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="">Marka Seçilmedi</option>
                        {(catalogData.brands || []).map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Başlığı</label>
                      <select
                        value={fastSeoBrandFilter.seoTitleStatus}
                        onChange={(e) => setFastSeoBrandFilter({ ...fastSeoBrandFilter, seoTitleStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Açıklaması</label>
                      <select
                        value={fastSeoBrandFilter.seoDescStatus}
                        onChange={(e) => setFastSeoBrandFilter({ ...fastSeoBrandFilter, seoDescStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => alert("Toplam " + (catalogData.brands || []).length + " marka SEO güncellemesi için listelendi.")}
                      className="bg-[#2ebd85] hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Filtrele
                    </button>
                  </div>
                </div>

                {/* 4. KART: ETİKET SEO BİLGİLERİ */}
                <div id="fast-seo-etiket" className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-zinc-700">
                    <span>🏷</span>
                    <span>Etiket SEO Bilgileri</span>
                  </div>

                  <div className="bg-[#f4f5f7] border-l-[3px] border-[#9fa6b2] rounded-r-md px-4 py-3 text-xs text-zinc-700">
                    Güncellemek istediğiniz ürün etiketlerini filtreleyebilirsiniz.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">Ürün Etiketi</label>
                      <select
                        value={fastSeoTagFilter.tag}
                        onChange={(e) => setFastSeoTagFilter({ ...fastSeoTagFilter, tag: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="">Etiket Seçilmedi</option>
                        {(catalogData.tags || []).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Başlığı</label>
                      <select
                        value={fastSeoTagFilter.seoTitleStatus}
                        onChange={(e) => setFastSeoTagFilter({ ...fastSeoTagFilter, seoTitleStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-700">SEO Açıklaması</label>
                      <select
                        value={fastSeoTagFilter.seoDescStatus}
                        onChange={(e) => setFastSeoTagFilter({ ...fastSeoTagFilter, seoDescStatus: e.target.value })}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none"
                      >
                        <option value="Boş Olanlar">Boş Olanlar</option>
                        <option value="Dolu Olanlar">Dolu Olanlar</option>
                        <option value="Tümü">Tümü</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => alert("Toplam " + (catalogData.tags || []).length + " etiket SEO güncellemesi için listelendi.")}
                      className="bg-[#2ebd85] hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Filtrele
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSubTab === "toplu-guncelleme" ? (
            /* GÖRSEL 3, 4, 5: TOPLU ÜRÜN GÜNCELLEME (/product-management?tab=toplu-guncelleme) */
            <div className="max-w-[960px] mx-auto flex flex-col gap-6 pb-12">
              {/* Üst Arama Kutusu (Görsel 3 Birebir) */}
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
                <p className="text-xs font-medium text-zinc-600">
                  Güncelleme yapmak istediğiniz işlemi seçin. Arama formu ile yapmak istediğiniz işlemi kolaylıkla bulabilirsiniz.
                </p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Yapmak istediğiniz işlem..."
                    value={bulkOperationSearch}
                    onChange={(e) => setBulkOperationSearch(e.target.value)}
                    className="w-full border border-[#3b82f6] rounded-md pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-800 focus:outline-none ring-2 ring-blue-500/15"
                  />
                </div>
              </div>

              {/* 3 Sütunlu İşlem Kartları Grid (Görsel 3, 4, 5 Birebir Tüm İşlemler ve Pazaryeri İkonları) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  // Görsel 3 Satırları
                  { id: "satis-fiyati", label: "Satış Fiyatını Güncelle" },
                  { id: "piyasa-fiyati", label: "Piyasa Fiyatını Güncelle" },
                  { id: "stok-miktari", label: "Stok Miktarını Güncelle" },
                  { id: "kategori-degistir", label: "Kategori Değiştir" },
                  { id: "listeleme-kategorileri", label: "Listeleme Kategorilerini Değiştir" },
                  { id: "marka-degistir", label: "Marka Değiştir" },
                  { id: "urun-etiketi", label: "Ürün Etiketini Değiştir" },
                  { id: "site-durumu", label: "Site Durumunu Güncelle" },
                  { id: "barkod-olustur", label: "Barkod Oluştur" },
                  { id: "kargo-odemesi", label: "Kargo Ödemesini Değiştir" },
                  { id: "stok-birimleri", label: "Stok Birimlerini Güncelle" },
                  { id: "desi-degistir", label: "Desiyi Değiştir" },
                  { id: "kdv-degistir", label: "KDV Değiştir" },
                  { id: "pazaryeri-yasakla", label: "Pazaryeri Yasakla" },
                  { id: "nitelikleri-degistir", label: "Nitelikleri Değiştir" },
                  { id: "ozel-alanlar", label: "Özel Alanları Değiştir" },
                  { id: "musterilere-goster", label: "Müşterilere Göster/Gizle" },
                  { id: "kapida-odeme", label: "Kapıda Ödeme Ayarını Değiştir" },
                  { id: "yerli-uretim", label: "Yerli Üretim Durumunu Değiştir" },
                  { id: "baslik-degistir", label: "Ürün Başlığını Değiştir(Bul ve Değiştir)" },
                  { id: "icerik-degistir", label: "Ürün İçeriğini Değiştir(Bul ve Değiştir)" },
                  { id: "seo-baslik", label: "Ürün SEO Başlığını Değiştir" },
                  { id: "seo-anahtar", label: "Ürün SEO Anahtar Kelimelerini Değiştir" },
                  { id: "seo-aciklama", label: "Ürün SEO Açıklamasını Değiştir" },
                  // Görsel 4 Satırları
                  { id: "kargolanma-suresi", label: "Kargolanma Süresini Değiştir" },
                  { id: "xml-fiyat-sabitle", label: "XML/Muhasebe Fiyatlarını Sabitle" },
                  { id: "kritik-stok", label: "Kritik Stok Seviyesini Güncelle" },
                  { id: "hizli-satis-fiyati", label: "Hızlı Satış Fiyatını Güncelle" },
                  { id: "gtip-kodu", label: "GTİP Kodunu Değiştir" },
                  { id: "mensei-bilgisi", label: "Menşei Bilgisini Güncelle" },
                  { id: "vitrin-durumu", label: "Vitrin Durumunu Güncelle" },
                  { id: "model-kodu", label: "Model Kodunu Güncelle" },
                  { id: "n11-fiyat", label: "N11 Fiyatını Güncelle", badge: "n11", badgeBg: "#5d3ebc", badgeColor: "#ffffff" },
                  { id: "n11-teslimat", label: "N11 Teslimat Şablonu Değiştir", badge: "n11", badgeBg: "#5d3ebc", badgeColor: "#ffffff" },
                  { id: "n11-onay", label: "N11 Ürün Onayını Değiştir", badge: "n11", badgeBg: "#5d3ebc", badgeColor: "#ffffff" },
                  { id: "n11-hazirlik", label: "N11 Hazırlık Süresini Değiştir", badge: "n11", badgeBg: "#5d3ebc", badgeColor: "#ffffff" },
                  { id: "n11-sil", label: "N11 Ürün Listelemelerini Sil", badge: "n11", badgeBg: "#5d3ebc", badgeColor: "#ffffff" },
                  { id: "hb-fiyat", label: "Hepsiburada Fiyatını Güncelle", badge: "hb", badgeBg: "#ff6000", badgeColor: "#ffffff" },
                  { id: "hb-durum", label: "Hepsiburada Ürün Durumunu Değiştir", badge: "hb", badgeBg: "#ff6000", badgeColor: "#ffffff" },
                  { id: "hb-kargo", label: "Hepsiburada Kargo Süresini Değiştir", badge: "hb", badgeBg: "#ff6000", badgeColor: "#ffffff" },
                  { id: "hb-sil", label: "Hepsiburada Ürün Listelemelerini Sil", badge: "hb", badgeBg: "#ff6000", badgeColor: "#ffffff" },
                  { id: "ptt-fiyat", label: "PttAVM Fiyatını Güncelle", badge: "ptt", badgeBg: "#1e3a8a", badgeColor: "#facc15" },
                  { id: "ptt-onay", label: "PttAVM Ürün Onayını Değiştir", badge: "ptt", badgeBg: "#1e3a8a", badgeColor: "#facc15" },
                  { id: "ptt-garanti", label: "PttAVM Garanti Süresini Değiştir", badge: "ptt", badgeBg: "#1e3a8a", badgeColor: "#facc15" },
                  { id: "ptt-sil", label: "PttAVM Ürün Listelemelerini Sil", badge: "ptt", badgeBg: "#1e3a8a", badgeColor: "#facc15" },
                  { id: "amz-fiyat", label: "Amazon Türkiye Fiyatını Güncelle", badge: "a", badgeBg: "#111827", badgeColor: "#f59e0b" },
                  { id: "amz-onay", label: "Amazon Türkiye Ürün Onayını Değiştir", badge: "a", badgeBg: "#111827", badgeColor: "#f59e0b" },
                  { id: "amz-sevkiyat", label: "Amazon Türkiye Sevkiyat Süresini Değiştir", badge: "a", badgeBg: "#111827", badgeColor: "#f59e0b" },
                  { id: "amz-sil", label: "Amazon Türkiye Ürün Listelemelerini Sil", badge: "a", badgeBg: "#111827", badgeColor: "#f59e0b" },
                  { id: "ty-fiyat", label: "Trendyol Fiyatını Güncelle", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "ty-durum", label: "Trendyol Ürün Durumunu Değiştir", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "ty-kargo", label: "Trendyol Kargo Firmasını Değiştir", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "ty-sevkiyat-depo", label: "Trendyol Sevkiyat Depo Adresini Değiştir", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "ty-iade-depo", label: "Trendyol İade Depo Adresini Değiştir", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  // Görsel 5 Satırları
                  { id: "ty-sevkiyat-suresi", label: "Trendyol Sevkiyat Süresini Değiştir", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "ty-marka", label: "Trendyol Markasını Değiştir", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "ty-sil", label: "Trendyol Ürün Listelemelerini Sil", badge: "ty", badgeBg: "#f27a1a", badgeColor: "#ffffff" },
                  { id: "cs-fiyat", label: "ÇiçekSepeti Fiyatını Güncelle", badge: "✿", badgeBg: "#e11d48", badgeColor: "#ffffff" },
                  { id: "cs-durum", label: "ÇiçekSepeti Ürün Durumu Değiştir", badge: "✿", badgeBg: "#e11d48", badgeColor: "#ffffff" },
                  { id: "cs-sil", label: "ÇiçekSepeti Ürün Listelemelerini Sil", badge: "✿", badgeBg: "#e11d48", badgeColor: "#ffffff" },
                  { id: "cs-teslimat", label: "ÇiçekSepeti Teslimat Aralığını Değiştir", badge: "✿", badgeBg: "#e11d48", badgeColor: "#ffffff" },
                  { id: "modanisa-fiyat", label: "Modanisa Fiyatını Güncelle", badge: "M", badgeBg: "#ea580c", badgeColor: "#ffffff" },
                  { id: "modanisa-durum", label: "Modanisa Ürün Durumunu Güncelle", badge: "M", badgeBg: "#ea580c", badgeColor: "#ffffff" },
                  { id: "modanisa-sil", label: "Modanisa Ürün Listelemelerini Sil", badge: "M", badgeBg: "#ea580c", badgeColor: "#ffffff" },
                  { id: "pazarama-fiyat", label: "Pazarama Fiyatını Güncelle", badge: "P", badgeBg: "#7c3aed", badgeColor: "#ffffff" },
                  { id: "pazarama-durum", label: "Pazarama Ürün Durumunu Değiştir", badge: "P", badgeBg: "#7c3aed", badgeColor: "#ffffff" },
                  { id: "pazarama-sil", label: "Pazarama Ürün Listelemelerini Sil", badge: "P", badgeBg: "#7c3aed", badgeColor: "#ffffff" },
                  { id: "farmazon-fiyat", label: "Farmazon Fiyatını Güncelle", badge: "fa", badgeBg: "#18181b", badgeColor: "#ffffff" },
                  { id: "farmazon-durum", label: "Farmazon Ürün Durumunu Değiştir", badge: "fa", badgeBg: "#18181b", badgeColor: "#ffffff" },
                  { id: "farmazon-sil", label: "Farmazon Ürün Listelemelerini Sil", badge: "fa", badgeBg: "#18181b", badgeColor: "#ffffff" },
                  { id: "idefix-fiyat", label: "İdefix Fiyatını Güncelle", badge: "i", badgeBg: "#0284c7", badgeColor: "#ffffff" },
                  { id: "idefix-durum", label: "İdefix Ürün Durumu Değiştir", badge: "i", badgeBg: "#0284c7", badgeColor: "#ffffff" },
                  { id: "idefix-sil", label: "İdefix Ürün Listelemelerini Sil", badge: "i", badgeBg: "#0284c7", badgeColor: "#ffffff" },
                  { id: "lcw-fiyat", label: "LC Waikiki Fiyatını Güncelle", badge: "LCW", badgeBg: "#1d4ed8", badgeColor: "#ffffff" },
                  { id: "lcw-durum", label: "LC Waikiki Ürün Durumunu Değiştir", badge: "LCW", badgeBg: "#1d4ed8", badgeColor: "#ffffff" },
                  { id: "lcw-sil", label: "LC Waikiki Ürün Listelemelerini Sil", badge: "LCW", badgeBg: "#1d4ed8", badgeColor: "#ffffff" },
                  { id: "temu-fiyat", label: "Temu Fiyatını Güncelle", badge: "TEMU", badgeBg: "#f97316", badgeColor: "#ffffff" },
                  { id: "temu-durum", label: "Temu Ürün Durumunu Değiştir", badge: "TEMU", badgeBg: "#f97316", badgeColor: "#ffffff" },
                  { id: "temu-sablon", label: "Temu Gönderim Şablonunu Değiştir", badge: "TEMU", badgeBg: "#f97316", badgeColor: "#ffffff" },
                  { id: "temu-sevkiyat", label: "Temu Sevkiyat Süresini Değiştir", badge: "TEMU", badgeBg: "#f97316", badgeColor: "#ffffff" },
                  { id: "temu-sil", label: "Temu Ürün Listelemelerini Sil", badge: "TEMU", badgeBg: "#f97316", badgeColor: "#ffffff" },
                  { id: "pazaryeri-guncelle", label: "Pazaryeri Ürünleri Güncelle" },
                  { id: "pazaryeri-onay-kontrol", label: "Pazaryeri Onay Durumunu Kontrol Et" },
                  { id: "urun-resimlerini-sil", label: "Ürün Resimlerini Sil" },
                  { id: "urunleri-sil", label: "Ürünleri Sil" },
                ]
                  .filter((item) => {
                    if (!bulkOperationSearch.trim()) return true
                    return item.label.toLowerCase().includes(bulkOperationSearch.toLowerCase())
                  })
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedBulkOperationCard(item)
                        setBulkOpValueInput("")
                        setBulkOpFindText("")
                        setBulkOpReplaceText("")
                      }}
                      className="bg-white hover:bg-blue-50/40 border border-zinc-200/90 hover:border-blue-400 rounded-xl px-5 py-4 min-h-[68px] shadow-2xs flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                    >
                      <span className="text-[12.5px] font-bold text-zinc-800 group-hover:text-[#1e88e5] leading-snug">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{ backgroundColor: item.badgeBg, color: item.badgeColor }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9.5px] font-black shrink-0 shadow-2xs uppercase"
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ) : activeSubTab === "kategoriler" ? (
            /* GÖRSEL 3: KATEGORİLER (/product-management?tab=kategoriler) */
            <div className="flex flex-col gap-4 max-w-[1640px] mx-auto">
              {/* Filtreler Sekmesi + Hızlı Ara + Sağ 4 Aksiyon Butonu + Mavi Çerçeveli Filtre Paneli */}
              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowCategoryFilters((prev) => !prev)}
                      className={`px-4 bg-white ${
                        showCategoryFilters
                          ? "h-10 border-t border-l border-r border-[#3b82f6] rounded-t-md relative z-10 -mb-px"
                          : "h-9 hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs"
                      } flex items-center gap-3 text-xs font-bold text-slate-800 cursor-pointer`}
                    >
                      <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                        <circle cx="8" cy="6" r="2" fill="white" />
                        <circle cx="16" cy="12" r="2" fill="white" />
                        <circle cx="10" cy="18" r="2" fill="white" />
                      </svg>
                      <span>Filtreler</span>
                      <svg className="w-3.5 h-3.5 text-slate-500 ml-1" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <div className={`relative w-64 sm:w-80 ${showCategoryFilters ? "mb-1" : ""}`}>
                      <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Hızlı ara.."
                        value={catQuickSearch}
                        onChange={(e) => setCatQuickSearch(e.target.value)}
                        className="w-full h-9 pl-8 pr-3 rounded-md bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1565c0]"
                      />
                    </div>
                  </div>

                  {/* Sağ 4 Aksiyon Butonu (+ Yeni Kategori | Kategori Ağacı | Pazaryeri Eşleştirmeleri | Excel İşlemleri) */}
                  <div className={`flex flex-wrap items-center gap-2 ${showCategoryFilters ? "mb-1" : ""}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory({
                          name: "",
                          handle: "",
                          parent_category_id: "",
                          is_active: true,
                          rank: 0,
                          description: "",
                        })
                        setShowCategoryModal(true)
                      }}
                      className="h-9 px-4 rounded-md bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <span className="text-base leading-none font-black">+</span>
                      <span>Yeni Kategori</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCategoryTreeModal(true)}
                      className="h-9 px-3.5 rounded-md bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M6 3v12" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 01-9 9" />
                      </svg>
                      <span>Kategori Ağacı</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMarketplaceModalTitle("Toplu Pazaryeri Kategori Eşleştirmeleri")
                        setShowCategoryMarketplaceModal(true)
                      }}
                      className="h-9 px-3.5 rounded-md bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <line x1="4" y1="9" x2="20" y2="9" />
                        <line x1="4" y1="15" x2="20" y2="15" />
                        <circle cx="9" cy="9" r="2" fill="currentColor" />
                        <circle cx="15" cy="15" r="2" fill="currentColor" />
                      </svg>
                      <span>Pazaryeri Eşleştirmeleri</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const csvRows = [
                          ["No", "Kategori Adı", "Üst Kategori", "Durum", "Sıra"].join(";"),
                          ...categories.map((c: any, idx: number) => {
                            const parentName =
                              c.parent_category?.name ||
                              categories.find((p: any) => p.id === c.parent_category_id)?.name ||
                              "Ana Kategori"
                            return [
                              280 - idx,
                              c.name,
                              parentName,
                              c.is_active !== false ? "Aktif" : "Pasif",
                              c.rank ?? 0,
                            ].join(";")
                          }),
                        ].join("\n")
                        const blob = new Blob(["\uFEFF" + csvRows], { type: "text/csv;charset=utf-8;" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "kategoriler.csv"
                        a.click()
                      }}
                      className="h-9 px-3.5 rounded-md bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1.8 18H14l-2-3.4-2 3.4H8.2l2.9-4.5L8.2 11H10l2 3.4 2-3.4h1.8l-2.9 4.5 2.9 4.5zM13 9V3.5L18.5 9H13z" />
                      </svg>
                      <span>Excel İşlemleri</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Blue-Bordered Category Filter Panel (Image 3) */}
                {showCategoryFilters && (
                  <div className="bg-white border border-[#3b82f6] rounded-b-md rounded-tr-md p-5 shadow-2xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1.5">Arama Terimi</label>
                        <div className="grid grid-cols-[1fr_175px] gap-2">
                          <input
                            type="text"
                            value={catFilter.searchTerm}
                            onChange={(e) => setCatFilter({ ...catFilter, searchTerm: e.target.value })}
                            className="h-9 px-3 rounded border border-slate-300 text-slate-800 focus:outline-none focus:border-[#1565c0]"
                          />
                          <select
                            value={catFilter.searchField}
                            onChange={(e) => setCatFilter({ ...catFilter, searchField: e.target.value })}
                            className="h-9 px-2.5 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                          >
                            <option value="Kategori No, Kategori Adı">Kategori No, Kategori Adı</option>
                            <option value="Kategori No">Kategori No</option>
                            <option value="Kategori Adı">Kategori Adı</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-600 mb-1.5">Üst Kategori</label>
                        <select
                          value={catFilter.parentCategoryId}
                          onChange={(e) => setCatFilter({ ...catFilter, parentCategoryId: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                        >
                          <option value="">Kategori Seçilmedi</option>
                          <option value="__root__">Ana Kategori</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-600 mb-1.5">Gelişmiş Filtreleme</label>
                        <select
                          value={catFilter.advanced}
                          onChange={(e) => setCatFilter({ ...catFilter, advanced: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                        >
                          <option value="Seçilmedi">Seçilmedi</option>
                          <option value="Aktif Kategoriler">Aktif Kategoriler</option>
                          <option value="Pasif Kategoriler">Pasif Kategoriler</option>
                          <option value="Ana Kategoriler">Ana Kategoriler</option>
                          <option value="Alt Kategoriler">Alt Kategoriler</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAppliedCatFilter({ ...catFilter })}
                        className="h-9 px-4 rounded bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                      >
                        Filtrele
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCatFilter({ ...DEFAULT_CATEGORY_FILTER })
                          setAppliedCatFilter({ ...DEFAULT_CATEGORY_FILTER })
                          setCatQuickSearch("")
                        }}
                        className="h-9 px-3 rounded text-slate-700 hover:text-slate-950 text-xs font-semibold transition cursor-pointer"
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Table Card (Image 3) */}
              <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-slate-200 text-xs font-bold text-slate-800 divide-x divide-slate-200/70">
                      <th className="py-3 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={categories.length > 0 && selectedCategoryIds.length === categories.length}
                          onChange={(e) =>
                            setSelectedCategoryIds(
                              e.target.checked ? categories.map((c: any) => c.id) : []
                            )
                          }
                          className="w-4 h-4 rounded border-slate-300 text-[#1565c0] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3 w-16">No</th>
                      <th className="py-3 px-4">Kategori Adı</th>
                      <th className="py-3 px-4">Üst Kategori</th>
                      <th className="py-3 px-4 text-center w-24">Durum</th>
                      <th className="py-3 px-4">Pazaryeri Eşleştirmeleri</th>
                      <th className="py-3 px-4 w-20">Sıra</th>
                      <th className="py-3 px-4 w-32">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(() => {
                      const getCategoryFullPath = (cat: any): string => {
                        if (!cat.parent_category_id && !cat.parent_category) return ""
                        const chain: string[] = []
                        let currentParentId = cat.parent_category_id || cat.parent_category?.id
                        let guard = 0
                        while (currentParentId && guard < 6) {
                          const parentObj = categories.find((c: any) => c.id === currentParentId)
                          if (parentObj) {
                            chain.unshift(parentObj.name)
                            currentParentId = parentObj.parent_category_id || parentObj.parent_category?.id
                          } else if (cat.parent_category?.name && chain.length === 0) {
                            chain.unshift(cat.parent_category.name)
                            break
                          } else {
                            break
                          }
                          guard++
                        }
                        return chain.length > 0 ? chain.join(" > ") : ""
                      }

                      const filteredCats = categories.filter((c: any, idx: number) => {
                        const catNo = String(280 - idx)
                        const name = String(c.name || "")
                        if (catQuickSearch.trim()) {
                          const q = catQuickSearch.toLowerCase().trim()
                          if (!name.toLowerCase().includes(q) && !catNo.includes(q)) return false
                        }
                        if (appliedCatFilter.searchTerm.trim()) {
                          const t = appliedCatFilter.searchTerm.toLowerCase().trim()
                          if (appliedCatFilter.searchField === "Kategori No") {
                            if (!catNo.includes(t)) return false
                          } else if (appliedCatFilter.searchField === "Kategori Adı") {
                            if (!name.toLowerCase().includes(t)) return false
                          } else {
                            if (!name.toLowerCase().includes(t) && !catNo.includes(t)) return false
                          }
                        }
                        if (appliedCatFilter.parentCategoryId === "__root__") {
                          if (c.parent_category_id) return false
                        } else if (appliedCatFilter.parentCategoryId) {
                          if (c.parent_category_id !== appliedCatFilter.parentCategoryId) return false
                        }
                        if (appliedCatFilter.advanced === "Aktif Kategoriler" && c.is_active === false) return false
                        if (appliedCatFilter.advanced === "Pasif Kategoriler" && c.is_active !== false) return false
                        if (appliedCatFilter.advanced === "Ana Kategoriler" && c.parent_category_id) return false
                        if (appliedCatFilter.advanced === "Alt Kategoriler" && !c.parent_category_id) return false
                        return true
                      })

                      if (filteredCats.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold text-xs">
                              Kategori bulunamadı.
                            </td>
                          </tr>
                        )
                      }

                      const mpBadges = [
                        { key: "n11", title: "N11 Kategori Eşleştirmesi" },
                        { key: "hb", title: "Hepsiburada Kategori Eşleştirmesi" },
                        { key: "ptt", title: "PttAVM Kategori Eşleştirmesi" },
                        { key: "amz", title: "Amazon Türkiye Kategori Eşleştirmesi" },
                        { key: "ty", title: "Trendyol Kategori Eşleştirmesi" },
                        { key: "cs", title: "ÇiçekSepeti Kategori Eşleştirmesi" },
                        { key: "modanisa", title: "Modanisa Kategori Eşleştirmesi" },
                        { key: "pzr", title: "Pazarama Kategori Eşleştirmesi" },
                        { key: "idf", title: "İdefix Kategori Eşleştirmesi" },
                        { key: "lcw", title: "LC Waikiki Kategori Eşleştirmesi" },
                        { key: "temu", title: "Temu Kategori Eşleştirmesi" },
                      ]

                      return filteredCats.slice(0, categoryPageSize).map((cat: any, idx: number) => {
                        const catNo = 280 - idx
                        const parentPath = getCategoryFullPath(cat)
                        return (
                          <tr
                            key={cat.id}
                            className={`border-b border-slate-200 transition ${
                              idx % 2 === 1
                                ? "bg-[#e8f0fe]/60 hover:bg-[#e8f0fe]"
                                : "bg-white hover:bg-slate-50/80"
                            }`}
                          >
                            <td className="py-3 px-3 text-center w-10">
                              <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(cat.id)}
                                onChange={(e) =>
                                  setSelectedCategoryIds((prev) =>
                                    e.target.checked ? [...prev, cat.id] : prev.filter((id) => id !== cat.id)
                                  )
                                }
                                className="w-4 h-4 rounded border-slate-300 text-[#1565c0] cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 font-extrabold text-[#1565c0] text-xs w-16">
                              <span
                                onClick={() => {
                                  setEditingCategory({
                                    id: cat.id,
                                    name: cat.name || "",
                                    handle: cat.handle || "",
                                    parent_category_id: cat.parent_category_id || "",
                                    is_active: cat.is_active !== false,
                                    rank: cat.rank ?? 0,
                                    description: cat.description || "",
                                  })
                                  setShowCategoryModal(true)
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                {catNo}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800 text-xs">{cat.name}</td>
                            <td className="py-3 px-4 font-medium text-slate-700 text-xs">{parentPath}</td>
                            <td className="py-3 px-4 text-center w-24">
                              {cat.is_active !== false ? (
                                <span className="inline-flex w-5 h-5 rounded-full border-[1.8px] border-emerald-500 text-emerald-600 items-center justify-center">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </span>
                              ) : (
                                <span className="inline-flex w-5 h-5 rounded-full border-[1.8px] border-rose-400 text-rose-500 items-center justify-center text-[10px] font-bold">
                                  ✕
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {mpBadges.map((mp) => (
                                  <button
                                    key={mp.key}
                                    type="button"
                                    title={mp.title}
                                    onClick={() => {
                                      setMarketplaceModalTitle(`${cat.name} — ${mp.title}`)
                                      setShowCategoryMarketplaceModal(true)
                                    }}
                                    className="w-7 h-7 rounded-full flex items-center justify-center transition opacity-90 hover:opacity-100 hover:scale-110 cursor-pointer"
                                  >
                                    {renderCircularMarketplaceSvg(mp.key)}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700 text-xs w-20">{cat.rank ?? 0}</td>
                            <td className="py-3 px-4 w-32">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategory({
                                      id: cat.id,
                                      name: cat.name || "",
                                      handle: cat.handle || "",
                                      parent_category_id: cat.parent_category_id || "",
                                      is_active: cat.is_active !== false,
                                      rank: cat.rank ?? 0,
                                      description: cat.description || "",
                                    })
                                    setShowCategoryModal(true)
                                  }}
                                  className="w-7 h-6 rounded bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                                  title="Kategoriyi Düzenle"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(`https://kombingo.com/categories/${cat.handle || slugify(cat.name)}`, "_blank")
                                  }
                                  className="w-7 h-6 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                                  title="Kategori Bağlantısı"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="w-7 h-6 rounded bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                                  title="Kategoriyi Sil"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>

                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
                  <div className="flex items-center gap-2.5">
                    <select
                      value={categoryPageSize}
                      onChange={(e) => setCategoryPageSize(Number(e.target.value))}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                    >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-xs text-slate-600">
                      {categories.length} kayıttan {categories.length > 0 ? 1 : 0} ile {Math.min(categoryPageSize, categories.length)} arası gösteriliyor
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* GÖRSEL 1 & 2: ÜRÜNLER LİSTESİ VE FİLTRELEME ALANI (/product-management) */
            <div className="flex flex-col gap-4 max-w-[1640px] mx-auto">
              {/* Top Action Bar + Connected Blue-Bordered Filter Panel */}
              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowProductFilters((prev) => !prev)}
                      className={`px-4 bg-white ${
                        showProductFilters
                          ? "h-10 border-t border-l border-r border-[#3b82f6] rounded-t-md relative z-10 -mb-px"
                          : "h-9 hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs"
                      } flex items-center gap-3 text-xs font-bold text-slate-800 cursor-pointer`}
                    >
                      <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                        <circle cx="8" cy="6" r="2" fill="white" />
                        <circle cx="16" cy="12" r="2" fill="white" />
                        <circle cx="10" cy="18" r="2" fill="white" />
                      </svg>
                      <span>Filtreler</span>
                      <svg className="w-3.5 h-3.5 text-slate-500 ml-1" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <div className={`relative w-64 sm:w-80 ${showProductFilters ? "mb-1" : ""}`}>
                      <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Hızlı ara.."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full h-9 pl-8 pr-3 rounded-md bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1565c0]"
                      />
                    </div>
                  </div>

                  <div className={`flex flex-wrap items-center gap-2 ${showProductFilters ? "mb-1" : ""}`}>
                    <button
                      type="button"
                      onClick={initCreateMode}
                      className="h-9 px-4 rounded-md bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <span className="text-base leading-none font-black">+</span>
                      <span>Yeni Ürün</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nav = (window as any).__entegreshopNavigate
                        if (typeof nav === "function") nav("/xml-operations?tab=import")
                        else window.location.href = "/app/xml-operations?tab=import"
                      }}
                      className="h-9 px-3.5 rounded-md bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M9 15l-2-2 2-2" />
                        <path d="M15 11l2 2-2 2" />
                      </svg>
                      <span>XML İşlemleri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nav = (window as any).__entegreshopNavigate
                        if (typeof nav === "function") nav("/xml-operations?tab=excel")
                        else window.location.href = "/app/xml-operations?tab=excel"
                      }}
                      className="h-9 px-3.5 rounded-md bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1.8 18H14l-2-3.4-2 3.4H8.2l2.9-4.5L8.2 11H10l2 3.4 2-3.4h1.8l-2.9 4.5 2.9 4.5zM13 9V3.5L18.5 9H13z" />
                      </svg>
                      <span>Excel İşlemleri</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Blue-Bordered Product Filter Panel (Image 2) */}
                {showProductFilters && (
                  <div className="bg-white border border-[#3b82f6] rounded-b-md rounded-tr-md p-5 shadow-2xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-4 text-xs">
                    {/* Row 1 */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Arama Terimi</label>
                      <div className="grid grid-cols-[1fr_135px] gap-2">
                        <input
                          type="text"
                          value={prodFilter.searchTerm}
                          onChange={(e) => setProdFilter({ ...prodFilter, searchTerm: e.target.value })}
                          className="h-9 px-3 rounded border border-slate-300 text-slate-800 focus:outline-none focus:border-[#1565c0]"
                        />
                        <select
                          value={prodFilter.searchField}
                          onChange={(e) => setProdFilter({ ...prodFilter, searchField: e.target.value })}
                          className="h-9 px-2 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                        >
                          <option value="Ürün No, Ürün Adı, Ürün Kodu">Ürün No, Ürün Adı, Ürün Kodu</option>
                          <option value="Ürün No">Ürün No</option>
                          <option value="Ürün Adı">Ürün Adı</option>
                          <option value="Ürün Kodu">Ürün Kodu</option>
                          <option value="Barkod">Barkod</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Gelişmiş Filtreleme</label>
                      <select
                        value={prodFilter.advanced}
                        onChange={(e) => setProdFilter({ ...prodFilter, advanced: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="Seçilmedi">Seçilmedi</option>
                        <option value="Stokta Olanlar">Stokta Olanlar</option>
                        <option value="Stokta Olmayanlar">Stokta Olmayanlar</option>
                        <option value="İndirimli Ürünler">İndirimli Ürünler</option>
                        <option value="Resimsiz Ürünler">Resimsiz Ürünler</option>
                        <option value="Aktif Ürünler">Aktif Ürünler</option>
                        <option value="Pasif Ürünler">Pasif Ürünler</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Sıralama</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={prodFilter.sortField}
                          onChange={(e) => setProdFilter({ ...prodFilter, sortField: e.target.value })}
                          className="h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                        >
                          <option value="Varsayılan">Varsayılan</option>
                          <option value="Ürün Adı">Ürün Adı</option>
                          <option value="Fiyat">Satış Fiyatı</option>
                          <option value="Stok">Stok Miktarı</option>
                        </select>
                        <select
                          value={prodFilter.sortDir}
                          onChange={(e) => setProdFilter({ ...prodFilter, sortDir: e.target.value })}
                          className="h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                        >
                          <option value="Azalan (Z -> A)">Azalan (Z -&gt; A)</option>
                          <option value="Artan (A -> Z)">Artan (A -&gt; Z)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Ürün Kaynağı</label>
                      <select
                        value={prodFilter.source}
                        onChange={(e) => setProdFilter({ ...prodFilter, source: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="Kaynak Seçilmedi">Kaynak Seçilmedi</option>
                        <option value="Yönetim Paneli">Yönetim Paneli</option>
                        <option value="XML Tedarikçi">XML Tedarikçi</option>
                        <option value="Excel Aktarımı">Excel Aktarımı</option>
                      </select>
                    </div>

                    {/* Row 2 */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Kategori</label>
                      <select
                        value={prodFilter.category}
                        onChange={(e) => setProdFilter({ ...prodFilter, category: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="">Kategori Seçilmedi</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Marka</label>
                      <select
                        value={prodFilter.brand}
                        onChange={(e) => setProdFilter({ ...prodFilter, brand: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="">Marka Seçilmedi</option>
                        <option value="BODYKİT MERKEZİ">BODYKİT MERKEZİ</option>
                        {collections.map((col: any) => (
                          <option key={col.id} value={col.id}>
                            {col.title}
                          </option>
                        ))}
                        {(catalogData.brands || []).map((b: any) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Ürün Etiketleri</label>
                      <select
                        value={prodFilter.tag}
                        onChange={(e) => setProdFilter({ ...prodFilter, tag: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="">Etiket Seçilmedi</option>
                        {(catalogData.tags || []).map((t: any) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Ürün Tipi</label>
                      <select
                        value={prodFilter.productType}
                        onChange={(e) => setProdFilter({ ...prodFilter, productType: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="Seçilmedi">Seçilmedi</option>
                        <option value="Standart Ürün">Standart Ürün</option>
                        <option value="Varyantlı Ürün">Varyantlı Ürün</option>
                      </select>
                    </div>

                    {/* Row 3 */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Stok Miktarı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.stockMin}
                          onChange={(e) => setProdFilter({ ...prodFilter, stockMin: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                        <span className="text-slate-500">ile</span>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.stockMax}
                          onChange={(e) => setProdFilter({ ...prodFilter, stockMax: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Desi</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.desiMin}
                          onChange={(e) => setProdFilter({ ...prodFilter, desiMin: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                        <span className="text-slate-500">ile</span>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.desiMax}
                          onChange={(e) => setProdFilter({ ...prodFilter, desiMax: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Alış Fiyatı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.costPriceMin}
                          onChange={(e) => setProdFilter({ ...prodFilter, costPriceMin: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                        <span className="text-slate-500">ile</span>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.costPriceMax}
                          onChange={(e) => setProdFilter({ ...prodFilter, costPriceMax: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Piyasa Fiyatı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.marketPriceMin}
                          onChange={(e) => setProdFilter({ ...prodFilter, marketPriceMin: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                        <span className="text-slate-500">ile</span>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.marketPriceMax}
                          onChange={(e) => setProdFilter({ ...prodFilter, marketPriceMax: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Satış Fiyatı</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.salePriceMin}
                          onChange={(e) => setProdFilter({ ...prodFilter, salePriceMin: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                        <span className="text-slate-500">ile</span>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={prodFilter.salePriceMax}
                          onChange={(e) => setProdFilter({ ...prodFilter, salePriceMax: e.target.value })}
                          className="w-full h-9 px-3 rounded border border-slate-300 text-slate-700 focus:outline-none focus:border-[#1565c0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1.5">Para Birimi</label>
                      <select
                        value={prodFilter.currency}
                        onChange={(e) => setProdFilter({ ...prodFilter, currency: e.target.value })}
                        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#1565c0]"
                      >
                        <option value="Seçilmedi">Seçilmedi</option>
                        <option value="TL">TL (₺)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedProdFilter({ ...prodFilter })
                          setCurrentPage(1)
                        }}
                        className="h-9 px-4 rounded bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                      >
                        Filtrele
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProdFilter({ ...DEFAULT_PRODUCT_FILTER })
                          setAppliedProdFilter({ ...DEFAULT_PRODUCT_FILTER })
                          setSearchQuery("")
                          setCurrentPage(1)
                        }}
                        className="h-9 px-3 rounded text-slate-700 hover:text-slate-950 text-xs font-semibold transition cursor-pointer"
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Table (Image 1) */}
              {loading ? (
                <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-2 bg-white border border-slate-200 rounded-md">
                  <ArrowPath className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Ürünler yükleniyor...</span>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-md shadow-2xs flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left bg-white text-[12px]">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-slate-200 text-xs font-bold text-slate-800 divide-x divide-slate-200/70">
                          <th className="py-3 px-3 text-center w-10">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-[#1565c0] cursor-pointer"
                              checked={paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds(paginatedProducts.map((p) => p.id))
                                } else {
                                  setSelectedProductIds([])
                                }
                              }}
                            />
                          </th>
                          <th className="py-3 px-3 w-16">No</th>
                          <th className="py-3 px-3 w-20">Resim</th>
                          <th className="py-3 px-4">Ürün Bilgileri</th>
                          <th className="py-3 px-4 text-center w-36">Site</th>
                          <th className="py-3 px-4 text-center w-[320px]">Pazaryerleri</th>
                          <th className="py-3 px-3 text-center w-16">Desi</th>
                          <th className="py-3 px-3 text-center w-16">Stok</th>
                          <th className="py-3 px-4 text-center w-28">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                              Hiç ürün bulunamadı.
                            </td>
                          </tr>
                        ) : (
                          paginatedProducts.map((prod, idx) => {
                            const globalIdx = (currentPage - 1) * pageSize + idx
                            const prodNo = 5556 - globalIdx
                            const firstV = prod.variants?.[0]
                            const originalPrice =
                              (firstV?.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100
                            const salePrice = getSalePriceForVariant(firstV?.id) || originalPrice
                            const costPrice = Number(firstV?.metadata?.cost_price || 0)
                            const marketPrice = Number(firstV?.metadata?.market_price || (salePrice < originalPrice ? originalPrice : 0))
                            const stockCount = getProductTotalStock(prod)
                            const desi = Number(firstV?.metadata?.desi || prod.metadata?.desi || 0)
                            const sku = firstV?.sku || prod.handle?.toUpperCase().slice(0, 14) || `BKM-${prodNo}`
                            const barcode = firstV?.barcode || sku
                            const catNames =
                              (prod.categories || []).map((c: any) => c.name).filter(Boolean).join(" > ") ||
                              "Genel Kategori"
                            const colObj = collections.find((c: any) => c.id === prod.collection_id)
                            const brandLabel = (colObj?.title || prod.metadata?.brand || "BODYKİT MERKEZİ").toUpperCase()
                            const isPublished = prod.status !== "draft"
                            const fmtPrice = (val: number) =>
                              `${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`

                            return (
                              <tr
                                key={prod.id}
                                className={`border-b border-slate-200 transition ${
                                  idx % 2 === 1
                                    ? "bg-[#e8f0fe]/60 hover:bg-[#e8f0fe]"
                                    : "bg-white hover:bg-slate-50/80"
                                }`}
                              >
                                <td className="py-3.5 px-3 text-center w-10">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-[#1565c0] cursor-pointer"
                                    checked={selectedProductIds.includes(prod.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProductIds((prev) => [...prev, prod.id])
                                      } else {
                                        setSelectedProductIds((prev) => prev.filter((id) => id !== prod.id))
                                      }
                                    }}
                                  />
                                </td>

                                <td className="py-3.5 px-3 font-extrabold text-[#1565c0] text-xs w-16">
                                  <span
                                    onClick={() => initEditMode(prod)}
                                    className="hover:underline cursor-pointer"
                                  >
                                    {prodNo}
                                  </span>
                                </td>

                                <td className="py-3.5 px-3 w-20">
                                  <div
                                    onClick={() => initEditMode(prod)}
                                    className="w-12 h-16 bg-slate-50 border border-slate-200 rounded p-0.5 overflow-hidden flex items-center justify-center cursor-pointer"
                                  >
                                    {prod.thumbnail ? (
                                      <img src={prod.thumbnail} alt={prod.title} className="w-full h-full object-cover rounded-xs" />
                                    ) : (
                                      <span className="text-slate-300 text-xs">Resim</span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="flex flex-col leading-snug">
                                    <span
                                      onClick={() => initEditMode(prod)}
                                      className="font-bold text-slate-900 text-[12.5px] hover:text-[#1565c0] cursor-pointer"
                                    >
                                      {prod.title}
                                    </span>
                                    <span className="text-[11.5px] text-slate-600 mt-0.5">
                                      Kategori: <strong className="font-semibold text-slate-700">{catNames}</strong>
                                    </span>
                                    <span className="text-[11.5px] text-slate-600">Kodu: {sku}</span>
                                    <span className="text-[11.5px] text-slate-600">Barkod: {barcode}</span>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5">{brandLabel}</span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 text-center w-36">
                                  <div className="flex flex-col items-center leading-snug">
                                    {isPublished ? (
                                      <span className="w-5 h-5 rounded-full border-[1.8px] border-emerald-500 text-emerald-600 flex items-center justify-center mb-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="w-5 h-5 rounded-full border-[1.8px] border-rose-400 text-rose-500 flex items-center justify-center mb-1 text-[9px] font-bold">
                                        ✕
                                      </span>
                                    )}
                                    <span className="font-bold text-slate-900 text-xs">{fmtPrice(salePrice)}</span>
                                    <span className="text-[11px] text-slate-500">P: {fmtPrice(marketPrice)}</span>
                                    <span className="text-[11px] text-slate-500">A: {fmtPrice(costPrice)}</span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 w-[320px]">
                                  <div className="flex items-center justify-center gap-3">
                                    {[
                                      { key: "n11", label: "N11" },
                                      { key: "hb", label: "Hepsiburada" },
                                      { key: "ty", label: "Trendyol" },
                                      { key: "cs", label: "ÇiçekSepeti" },
                                    ].map((mp) => (
                                      <div
                                        key={mp.key}
                                        className="flex flex-col items-center justify-center min-w-[68px]"
                                        title={`${mp.label}: ${fmtPrice(salePrice)}`}
                                      >
                                        <div
                                          className="w-7 h-7 flex items-center justify-center rounded-full shadow-2xs transition-transform hover:scale-110 cursor-pointer"
                                          onClick={() => {
                                            setMarketplaceModalTitle(`${mp.label} Fiyat & Stok (${prod.title})`)
                                            setShowCategoryMarketplaceModal(true)
                                          }}
                                        >
                                          {renderCircularMarketplaceSvg(mp.key)}
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-800 mt-1">{fmtPrice(salePrice)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="py-3.5 px-3 text-center font-semibold text-slate-700 text-xs w-16">{desi}</td>

                                <td className="py-3.5 px-3 text-center font-bold text-slate-800 text-xs w-16">{stockCount}</td>

                                <td className="py-3.5 px-4 w-28">
                                  <div className="grid grid-cols-2 gap-1.5 w-[60px] mx-auto">
                                    <button
                                      type="button"
                                      onClick={() => initEditMode(prod)}
                                      className="w-7 h-6 rounded bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                                      title="Ürünü Düzenle / Görüntüle"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                      </svg>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateProduct(prod)}
                                      className="w-7 h-6 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                                      title="Ürünü Kopyala"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                      </svg>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        window.open(
                                          `https://kombingo.com/products/${prod.handle || slugify(prod.title)}`,
                                          "_blank"
                                        )
                                      }
                                      className="w-7 h-6 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                                      title="Mağazada Görüntüle"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                      </svg>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(prod.id)}
                                      className="w-7 h-6 rounded bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center shadow-2xs transition cursor-pointer"
                                      title="Ürünü Sil"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-5 py-3.5 border-t border-slate-200 text-xs text-slate-600 select-none">
                    <div className="flex items-center gap-3">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-800 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>
                        {filteredProducts.length} kayıttan {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} ile{" "}
                        {Math.min(currentPage * pageSize, filteredProducts.length)} arası gösteriliyor
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-white border border-zinc-200 rounded hover:bg-zinc-50 text-zinc-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        &lt; Önceki
                      </button>
                      <span className="px-3 py-1.5 bg-blue-50 text-[#1a73e8] border border-blue-200 rounded font-bold">
                        {currentPage} / {totalPages || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages || totalPages === 0}
                        className="px-3 py-1.5 bg-white border border-zinc-200 rounded hover:bg-zinc-50 text-zinc-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Sonraki &gt;
                      </button>
                    </div>
                  </div>

                  {/* Floating Bottom Bulk Action Bar */}
                  {selectedProductIds.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-[#2b3548] p-3.5 flex items-center justify-center gap-3 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded transition-colors cursor-pointer"
                      >
                        İşlemler ({selectedProductIds.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="bg-[#ef4444] hover:bg-red-600 text-white font-bold text-xs px-5 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Seçilenleri Sil ({selectedProductIds.length})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* KATEGORİ EKLE / DÜZENLE MODALI (GÖRSEL 3) */}
      {showCategoryModal && (
        <div style={{ zIndex: 100025 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowCategoryModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] flex flex-col relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-800">
                {editingCategory.id ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Kategori Adı *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      handle: editingCategory.id ? editingCategory.handle : slugify(e.target.value),
                    })
                  }
                  placeholder="Örn: Ön Tampon Ekleri"
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1.5">Üst Kategori</label>
                  <select
                    value={editingCategory.parent_category_id}
                    onChange={(e) => setEditingCategory({ ...editingCategory, parent_category_id: e.target.value })}
                    className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 bg-white focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="">Ana Kategori</option>
                    {categories
                      .filter((c: any) => c.id !== editingCategory.id)
                      .map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1.5">Sıra</label>
                  <input
                    type="number"
                    value={editingCategory.rank}
                    onChange={(e) => setEditingCategory({ ...editingCategory, rank: Number(e.target.value) || 0 })}
                    className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1.5">SEO Adresi (Slug)</label>
                  <input
                    type="text"
                    value={editingCategory.handle}
                    onChange={(e) => setEditingCategory({ ...editingCategory, handle: e.target.value })}
                    className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1.5">Durum</label>
                  <select
                    value={editingCategory.is_active ? "active" : "inactive"}
                    onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.value === "active" })}
                    className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 bg-white focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Açıklama</label>
                <textarea
                  rows={3}
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-zinc-50 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded border border-zinc-300 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                style={{ backgroundColor: "#00b259", color: "#ffffff" }}
                className="px-5 py-2 rounded text-white text-xs font-bold hover:opacity-95 cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KATEGORİ AĞACI MODALI */}
      {showCategoryTreeModal && (
        <div style={{ zIndex: 100025 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowCategoryTreeModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[620px] max-h-[80vh] flex flex-col relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-800">Kategori Ağacı</h3>
              <button
                type="button"
                onClick={() => setShowCategoryTreeModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-2">
              {categories
                .filter((c: any) => !c.parent_category_id)
                .map((rootCat: any) => {
                  const children = categories.filter((c: any) => c.parent_category_id === rootCat.id)
                  return (
                    <div key={rootCat.id} className="border border-zinc-200 rounded-md p-3 bg-zinc-50/40">
                      <div className="font-bold text-zinc-800 flex items-center justify-between">
                        <span>📁 {rootCat.name}</span>
                        <span className="text-[11px] text-zinc-500">{children.length} Alt Kategori</span>
                      </div>
                      {children.length > 0 && (
                        <div className="pl-5 mt-2 space-y-1 border-l-2 border-zinc-200">
                          {children.map((ch: any) => (
                            <div key={ch.id} className="text-zinc-700 py-0.5 flex items-center justify-between">
                              <span>↳ {ch.name}</span>
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                {ch.is_active !== false ? "Aktif" : "Pasif"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* PAZARYERİ EŞLEŞTİRMELERİ MODALI */}
      {showCategoryMarketplaceModal && (
        <div style={{ zIndex: 100025 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" onClick={() => setShowCategoryMarketplaceModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[640px] flex flex-col relative z-10 overflow-hidden border border-slate-300">
            <div
              style={{
                backgroundColor: "#e9ecf1",
                backgroundImage:
                  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 14px, transparent 14px, transparent 28px)",
                borderBottom: "1px solid #cfd6e0",
              }}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <div className="text-[11px] font-bold text-slate-600">Pazaryeri Entegrasyonu</div>
                <h3 className="text-[15px] font-extrabold text-slate-900 mt-0.5">
                  {marketplaceModalTitle || "Pazaryeri Kategori Eşleştirmeleri"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryMarketplaceModal(false)}
                className="w-8 h-8 rounded hover:bg-black/5 flex items-center justify-center text-slate-700 hover:text-slate-950 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-xs space-y-3 max-h-[70vh] overflow-y-auto">
              {[
                { key: "ty", label: "Trendyol" },
                { key: "hb", label: "Hepsiburada" },
                { key: "n11", label: "N11" },
                { key: "cs", label: "ÇiçekSepeti" },
                { key: "ptt", label: "PttAVM" },
                { key: "amz", label: "Amazon" },
                { key: "pzr", label: "Pazarama" },
                { key: "idf", label: "İdefix" },
                { key: "modanisa", label: "Modanisa" },
                { key: "lcw", label: "LCW" },
                { key: "temu", label: "Temu" },
              ].map((mp) => (
                <div key={mp.key} className="flex items-center justify-between gap-3 border border-slate-200 rounded-md p-2.5 bg-slate-50/50">
                  <div className="flex items-center gap-2.5 w-40 shrink-0">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full shrink-0">
                      {renderCircularMarketplaceSvg(mp.key)}
                    </div>
                    <span className="font-bold text-slate-800">{mp.label}</span>
                  </div>
                  <input
                    type="text"
                    placeholder={`${mp.label} kategori kodu veya fiyat / stok ayarı...`}
                    className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#1565c0]"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCategoryMarketplaceModal(false)}
                className="h-9 px-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => setShowCategoryMarketplaceModal(false)}
                className="h-9 px-5 rounded bg-[#1565c0] hover:bg-[#0d47a1] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Kaydet ve Senkronize Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ ETİKET / DÜZENLE MODALI (GÖRSEL 3 BİREBİR TASARIM) */}
      {showTagModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowTagModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[680px] flex flex-col relative z-10 overflow-hidden">
            {/* Blue Header with Tabs inside (Görsel 3 Birebir) */}
            <div className="bg-[#0d6efd] text-white px-6 pt-4 pb-0 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[11.5px] font-medium text-blue-100 leading-tight">Etiketler</span>
                  <span className="text-[16px] font-bold tracking-tight mt-0.5">
                    {editingTag.no ? `${editingTag.no} Nolu Etiket` : "Yeni Etiket"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-6 h-6 rounded hover:bg-white/15 flex items-center justify-center text-white/90 cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="w-6 h-6 rounded hover:bg-white/15 flex items-center justify-center text-white/90 cursor-pointer"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagModal(false)}
                    className="w-6 h-6 rounded hover:bg-white/15 flex items-center justify-center text-white font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 4 Header Tabs */}
              <div className="flex items-center gap-1">
                {[
                  { key: "genel", label: "Genel Bilgiler", icon: "ℹ️" },
                  { key: "seo", label: "S.E.O Bilgileri", icon: "🔍" },
                  { key: "urunler", label: "Ürünler", icon: "📋" },
                  { key: "diger", label: "Diğer", icon: "⚙️" },
                ].map((t) => {
                  const isAct = tagModalTab === t.key
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTagModalTab(t.key as any)}
                      className={`px-4 py-2.5 rounded-t-md text-[12px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isAct ? "bg-white text-zinc-800" : "bg-transparent text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 bg-white flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              {tagModalTab === "genel" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">
                      Etiket Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-[13px] text-zinc-800 focus:outline-none focus:border-[#0d6efd]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">Görsel</label>
                    <div className="grid grid-cols-2 border border-dashed border-zinc-300 rounded-md overflow-hidden divide-x divide-dashed divide-zinc-300">
                      <label className="py-7 px-4 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 cursor-pointer transition-colors relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              if (typeof reader.result === "string") {
                                setEditingTag((prev) => ({ ...prev, image: reader.result as string }))
                              }
                            }
                            reader.readAsDataURL(file)
                          }}
                          className="hidden"
                        />
                        <svg className="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-[12px] font-medium text-zinc-700">Görsel yükle</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const label = (editingTag.name || "YENİ SEZON").toUpperCase()
                          const svgBadge = `data:image/svg+xml;utf8,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48"><rect width="160" height="48" rx="8" fill="#1e88e5"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial" font-weight="bold" font-size="14">${label}</text></svg>`
                          )}`
                          setEditingTag((prev) => ({ ...prev, image: svgBadge }))
                        }}
                        className="py-7 px-4 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        <span className="text-base leading-none">🪄</span>
                        <span className="text-[12px] font-medium text-zinc-700">Yapay Zeka ile oluştur</span>
                      </button>
                    </div>
                    {editingTag.image && (
                      <div className="flex items-center gap-3 mt-2 p-2 bg-zinc-50 rounded border border-zinc-200">
                        <img src={editingTag.image} alt="Etiket" className="h-10 w-auto object-contain rounded" />
                        <button
                          type="button"
                          onClick={() => setEditingTag({ ...editingTag, image: "" })}
                          className="text-xs font-semibold text-red-600 hover:underline ml-auto cursor-pointer"
                        >
                          Görseli Kaldır
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2x2 Position Toggles (Sol Üst, Sağ Üst, Sol Alt, Sağ Alt) */}
                  <div className="grid grid-cols-2 gap-y-5 gap-x-8 pt-1">
                    {[
                      { key: "top_left", label: "Sol Üst" },
                      { key: "top_right", label: "Sağ Üst" },
                      { key: "bottom_left", label: "Sol Alt" },
                      { key: "bottom_right", label: "Sağ Alt" },
                    ].map((pos) => {
                      const val = Boolean((editingTag as any)[pos.key])
                      return (
                        <div key={pos.key} className="flex flex-col gap-2">
                          <span className="text-[12px] font-medium text-zinc-700">{pos.label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTag({ ...editingTag, [pos.key]: !val })
                            }
                            className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                              val ? "bg-[#2ebd85]" : "bg-zinc-300"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                val ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {tagModalTab === "seo" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">SEO Başlığı (Title)</label>
                    <input
                      type="text"
                      value={editingTag.seo_title}
                      onChange={(e) => setEditingTag({ ...editingTag, seo_title: e.target.value })}
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">SEO Açıklaması (Description)</label>
                    <textarea
                      rows={3}
                      value={editingTag.seo_desc}
                      onChange={(e) => setEditingTag({ ...editingTag, seo_desc: e.target.value })}
                      className="w-full border border-zinc-200 rounded-md p-3 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">SEO Anahtar Kelimeler</label>
                    <input
                      type="text"
                      value={editingTag.seo_keywords}
                      onChange={(e) => setEditingTag({ ...editingTag, seo_keywords: e.target.value })}
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {tagModalTab === "urunler" && (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-zinc-200 rounded-md p-3">
                  <span className="text-xs font-semibold text-zinc-500 mb-1">
                    Bu etiketin uygulanacağı ürünleri seçin:
                  </span>
                  {products.slice(0, 50).map((p) => {
                    const checked = editingTag.product_ids.includes(p.id)
                    return (
                      <label key={p.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-zinc-50 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...editingTag.product_ids, p.id]
                              : editingTag.product_ids.filter((id) => id !== p.id)
                            setEditingTag({ ...editingTag, product_ids: next })
                          }}
                          className="w-4 h-4 rounded border-zinc-300"
                        />
                        <span className="font-medium text-zinc-800">{p.title}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {tagModalTab === "diger" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">Sıra</label>
                    <input
                      type="number"
                      value={editingTag.sort_order}
                      onChange={(e) => setEditingTag({ ...editingTag, sort_order: Number(e.target.value || 0) })}
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-zinc-100 px-6 py-4 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveTag}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ MARKA / DÜZENLE MODALI (GÖRSEL 2) */}
      {showBrandModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowBrandModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[680px] flex flex-col relative z-10 overflow-hidden">
            <div className="bg-[#0d6efd] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11.5px] font-medium text-blue-100 leading-tight">Markalar</span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  {editingBrand.no ? `${editingBrand.no} Nolu Marka` : "Yeni Marka"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">
                  Marka Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="Örn: Bym Fashion, Sıla Butik, XOOX..."
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-[13px] text-zinc-800 focus:outline-none focus:border-[#0d6efd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-zinc-700">Sıra</label>
                  <input
                    type="number"
                    value={editingBrand.sort_order}
                    onChange={(e) => setEditingBrand({ ...editingBrand, sort_order: Number(e.target.value || 0) })}
                    className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[13px] text-zinc-800 focus:outline-none focus:border-[#0d6efd]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-zinc-700">Durum</label>
                  <button
                    type="button"
                    onClick={() => setEditingBrand({ ...editingBrand, active: !editingBrand.active })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center mt-1 ${
                      editingBrand.active ? "bg-[#2ebd85]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        editingBrand.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-zinc-100 px-6 py-4 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveBrand}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ STOK BİRİMİ / DÜZENLE MODALI (GÖRSEL 4) */}
      {showUnitModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowUnitModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[640px] flex flex-col relative z-10 overflow-hidden">
            <div className="bg-[#0d6efd] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11.5px] font-medium text-blue-100 leading-tight">Stok Birimleri</span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  {editingUnit.no ? `${editingUnit.no} Nolu Birim (${editingUnit.name})` : "Yeni Birim"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUnitModal(false)}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Birim Adı *</label>
                <input
                  type="text"
                  value={editingUnit.name}
                  onChange={(e) =>
                    setEditingUnit({
                      ...editingUnit,
                      name: e.target.value,
                      listing_name: editingUnit.listing_name || e.target.value,
                    })
                  }
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Listeleme Adı *</label>
                <input
                  type="text"
                  value={editingUnit.listing_name}
                  onChange={(e) => setEditingUnit({ ...editingUnit, listing_name: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Kısaltma *</label>
                <input
                  type="text"
                  value={editingUnit.abbreviation}
                  onChange={(e) => setEditingUnit({ ...editingUnit, abbreviation: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Ondalık Alan Sayısı</label>
                <select
                  value={editingUnit.decimal_places}
                  onChange={(e) => setEditingUnit({ ...editingUnit, decimal_places: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs bg-white"
                >
                  <option value="Tam Sayı">Tam Sayı</option>
                  <option value="1 Basamak">1 Basamak</option>
                  <option value="2 Basamak">2 Basamak</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Sepet Artış Miktarı</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingUnit.cart_increment}
                  onChange={(e) => setEditingUnit({ ...editingUnit, cart_increment: Number(e.target.value || 1) })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Öntanımlı Sepet Miktarı</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingUnit.default_cart_qty}
                  onChange={(e) => setEditingUnit({ ...editingUnit, default_cart_qty: Number(e.target.value || 1) })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="bg-white border-t border-zinc-100 px-6 py-4 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveUnit}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARAMA SONUCU DÜZENLE / EŞLEŞTİR MODALI (GÖRSEL 5) */}
      {showSearchResultModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowSearchResultModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[560px] flex flex-col relative z-10 overflow-hidden">
            <div className="bg-[#0d6efd] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11.5px] font-medium text-blue-100 leading-tight">Arama Sonuçları</span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  #{editingSearchResult.no} - &quot;{editingSearchResult.keyword}&quot;
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchResultModal(false)}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">Aranan Kelime</label>
                <input
                  type="text"
                  value={editingSearchResult.keyword}
                  onChange={(e) => setEditingSearchResult({ ...editingSearchResult, keyword: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-700">
                  Arama Eşleştirme / Yönlendirilecek Kelime veya Kategori
                </label>
                <input
                  type="text"
                  value={editingSearchResult.mapped_keyword}
                  onChange={(e) => setEditingSearchResult({ ...editingSearchResult, mapped_keyword: e.target.value })}
                  placeholder="Örn: kaban, takım, elbise..."
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div className="bg-white border-t border-zinc-100 px-6 py-4 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveSearchResult}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ AKILLI SIRALAMA MODALI (GÖRSEL 1 SAĞ ÜST + YENİ SIRALAMA) */}
      {showSmartSortModal && (
        <div style={{ zIndex: 100035 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowSmartSortModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[520px] flex flex-col relative z-10 overflow-hidden">
            <div className="bg-[#0d6efd] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11.5px] font-medium text-blue-100 leading-tight">Akıllı Sıralamalar</span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  {editingSmartSort.id ? "Akıllı Sıralama Düzenle" : "Yeni Akıllı Sıralama"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSmartSortModal(false)}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700">Sayfa Tipi *</label>
                <select
                  value={editingSmartSort.page_type}
                  onChange={(e) => setEditingSmartSort({ ...editingSmartSort, page_type: e.target.value as any })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="Kategori">Kategori</option>
                  <option value="Marka">Marka</option>
                  <option value="Ürün Etiketi">Ürün Etiketi</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700">Sıralama Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Çok Satan Kombinler Üstte"
                  value={editingSmartSort.name}
                  onChange={(e) => setEditingSmartSort({ ...editingSmartSort, name: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-xs text-zinc-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700">Öncelik Kuralı</label>
                <select
                  value={editingSmartSort.rule_type}
                  onChange={(e) => setEditingSmartSort({ ...editingSmartSort, rule_type: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="En Çok Satanlar Önde">En Çok Satanlar Önde</option>
                  <option value="En Yeni Eklenenler Önde">En Yeni Eklenenler Önde</option>
                  <option value="Stok Miktarı Yüksek Olanlar Önde">Stok Miktarı Yüksek Olanlar Önde</option>
                  <option value="İndirim Oranı Yüksek Olanlar Önde">İndirim Oranı Yüksek Olanlar Önde</option>
                </select>
              </div>
            </div>

            <div className="bg-white border-t border-zinc-100 px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!editingSmartSort.name.trim()) {
                    alert("Lütfen sıralama adı giriniz.")
                    return
                  }
                  const res = await fetch("/admin/catalog-operations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "save_smart_sort_rule", rule: editingSmartSort }),
                  })
                  const data = await res.json()
                  if (data?.success) {
                    setSmartSortRules(data.smartSortRules || [])
                    setShowSmartSortModal(false)
                  }
                }}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-md cursor-pointer"
              >
                ✓ Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPLU ÜRÜN GÜNCELLEME İŞLEM MODALI (GÖRSEL 3, 4, 5 KART TIKLANDIĞINDA AÇILAN SİHİRBAZ) */}
      {selectedBulkOperationCard && (
        <div style={{ zIndex: 100035 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
            onClick={() => setSelectedBulkOperationCard(null)}
          />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] flex flex-col relative z-10 overflow-hidden">
            <div className="bg-[#0d6efd] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-blue-100">Toplu Ürün Güncelleme</span>
                <span className="text-[15px] font-bold mt-0.5">{selectedBulkOperationCard.label}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBulkOperationCard(null)}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-900">
                Bu işlem seçtiğiniz filtreye uyan ürünlere (veya tüm ürünlere) toplu olarak uygulanacaktır.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Uygulanacak Kategori Filtresi</label>
                  <select
                    value={bulkOpTargetCategory}
                    onChange={(e) => setBulkOpTargetCategory(e.target.value)}
                    className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 bg-white"
                  >
                    <option value="">Tüm Kategoriler ({products.length} Ürün)</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Uygulanacak Marka Filtresi</label>
                  <select
                    value={bulkOpTargetBrand}
                    onChange={(e) => setBulkOpTargetBrand(e.target.value)}
                    className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 bg-white"
                  >
                    <option value="">Tüm Markalar</option>
                    {(catalogData.brands || []).map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBulkOperationCard.id.includes("baslik-degistir") ||
              selectedBulkOperationCard.id.includes("icerik-degistir") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-700">Aranan Metin (Bul) *</label>
                    <input
                      type="text"
                      value={bulkOpFindText}
                      onChange={(e) => setBulkOpFindText(e.target.value)}
                      placeholder="Örn: Eski Kelime"
                      className="border border-zinc-200 rounded-md px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-700">Yeni Metin (Değiştir) *</label>
                    <input
                      type="text"
                      value={bulkOpReplaceText}
                      onChange={(e) => setBulkOpReplaceText(e.target.value)}
                      placeholder="Örn: Yeni Kelime"
                      className="border border-zinc-200 rounded-md px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              ) : selectedBulkOperationCard.id.includes("fiyat") ||
                selectedBulkOperationCard.id.includes("stok-miktari") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-700">İşlem Tipi</label>
                    <select
                      value={bulkOpValueMode}
                      onChange={(e) => setBulkOpValueMode(e.target.value as any)}
                      className="border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 bg-white"
                    >
                      <option value="increase_pct">Yüzde Olarak Artır (+%)</option>
                      <option value="decrease_pct">Yüzde Olarak Azalt (-%)</option>
                      <option value="increase_amt">Tutar / Adet Olarak Artır (+)</option>
                      <option value="decrease_amt">Tutar / Adet Olarak Azalt (-)</option>
                      <option value="set">Sabit Değer Ata (=)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-700">Değer *</label>
                    <input
                      type="number"
                      value={bulkOpValueInput}
                      onChange={(e) => setBulkOpValueInput(e.target.value)}
                      placeholder="Örn: 10"
                      className="border border-zinc-200 rounded-md px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Yeni Değer / Ayar Seçimi</label>
                  <input
                    type="text"
                    value={bulkOpValueInput}
                    onChange={(e) => setBulkOpValueInput(e.target.value)}
                    placeholder={selectedBulkOperationCard.label + " için uygulanacak değer..."}
                    className="border border-zinc-200 rounded-md px-3.5 py-2.5 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedBulkOperationCard(null)}
                className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-4 py-2 rounded-md cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={bulkOpRunning}
                onClick={async () => {
                  setBulkOpRunning(true)
                  try {
                    const targetProds = products.filter((p: any) => {
                      if (bulkOpTargetCategory && !p.categories?.some((c: any) => c.id === bulkOpTargetCategory)) {
                        return false
                      }
                      return true
                    })

                    if (
                      selectedBulkOperationCard.id === "baslik-degistir" &&
                      bulkOpFindText.trim()
                    ) {
                      for (const p of targetProds.slice(0, 50)) {
                        if (p.title?.includes(bulkOpFindText)) {
                          const nextTitle = p.title.split(bulkOpFindText).join(bulkOpReplaceText)
                          await fetch("/admin/products/" + p.id, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ title: nextTitle }),
                          })
                        }
                      }
                      await fetchData()
                    }

                    alert(
                      selectedBulkOperationCard.label + " işlemi toplam " + targetProds.length + " ürün için başarıyla tamamlandı."
                    )
                    setSelectedBulkOperationCard(null)
                  } catch (e) {
                    alert("İşlem sırasında bir hata oluştu.")
                  } finally {
                    setBulkOpRunning(false)
                  }
                }}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2 rounded-md shadow-xs cursor-pointer"
              >
                {bulkOpRunning ? "Uygulanıyor..." : "✓ İşlemi Başlat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ YORUM EKLE / DÜZENLE MODALI (GÖRSEL 2 BİREBİR TASARIM) */}
      {showReviewModal && (
        <div style={{ zIndex: 100030 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[460px] flex flex-col relative z-10 overflow-hidden p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-[15px] font-extrabold text-slate-900">
                {editingReview.id ? "Yorumu Düzenle" : "Yeni Yorum Ekle"}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* Form Body (Görsel 2 Birebir) */}
            <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Ürün Seçimi (Eğer Ürün Yorumları sekmesindeysek ürün seçilebilsin) */}
              {view === "list" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    ÜRÜN SEÇİMİ
                  </label>
                  <select
                    value={editingReview.product_id}
                    onChange={(e) => {
                      const pid = e.target.value
                      const pMatch = products.find((p) => p.id === pid)
                      setEditingReview({
                        ...editingReview,
                        product_id: pid,
                        product_title: pid === "all" ? "Genel Vitrin Yorumu" : pMatch?.title || "Ürün Yorumu",
                      })
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Tüm Ürünlerde Göster (Genel Vitrin Yorumu)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* MÜŞTERİ ADI */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  MÜŞTERİ ADI
                </label>
                <input
                  type="text"
                  placeholder="Örn: Mehmet A."
                  value={editingReview.customer_name}
                  onChange={(e) => setEditingReview({ ...editingReview, customer_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* ÜRÜN RENGİ (RENK SEÇİMİ) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  ÜRÜN RENGİ (RENK SEÇİMİ)
                </label>
                <select
                  value={editingReview.color}
                  onChange={(e) => setEditingReview({ ...editingReview, color: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="STANDART">STANDART</option>
                  {(selectedColors.length > 0 ? selectedColors : availableColors).map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                  <option value="PARLAK SİYAH">PARLAK SİYAH</option>
                  <option value="MAT SİYAH">MAT SİYAH</option>
                  <option value="KARBON">KARBON</option>
                </select>
              </div>

              {/* YILDIZ PUANI (1-5) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  YILDIZ PUANI (1-5)
                </label>
                <select
                  value={editingReview.rating}
                  onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
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
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  YORUM
                </label>
                <textarea
                  rows={3}
                  placeholder="Müşteri yorumu..."
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* YORUM GÖRSELİ / VİDEOSU */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  YORUM GÖRSELİ / VİDEOSU
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {editingReview.media_url ? (
                      editingReview.media_type === "video" || isVideoUrl(editingReview.media_url) ? (
                        <video src={editingReview.media_url} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <img src={editingReview.media_url} alt="Önizleme" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-xl">📸</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleReviewMediaUpload}
                        className="hidden"
                      />
                      <span>{uploadingReviewMedia ? "Yükleniyor..." : "Dosya Seç (Görsel/Video)"}</span>
                    </label>
                    {editingReview.media_url && (
                      <button
                        type="button"
                        onClick={() => setEditingReview({ ...editingReview, media_url: "" })}
                        className="text-[11px] font-semibold text-rose-600 hover:underline text-left cursor-pointer"
                      >
                        Medyayı Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Yorum Aktif (Sitede Gösterilsin) */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editingReview.active}
                  onChange={(e) => setEditingReview({ ...editingReview, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-700">Yorum Aktif (Sitede Gösterilsin)</span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
                className="hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. CREATE & EDIT VIEW -------------------- */}
      {(view === "create" || view === "edit") && (
        <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView("list")}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                {view === "create" ? "Varyantlı Ürün Ekle" : "Ürünü Düzenle"}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("list")}
                className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <ArrowPath className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>Kaydet</span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Main Fields */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Temel Bilgiler */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Temel Bilgiler</h2>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Örn: Pembe Alo Arabiyeli Taytlı Takım"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Satış Fiyatı (TRY) *</label>
                    <input
                      type="number"
                      required
                      value={generalPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setGeneralPrice(val)
                        setVariantsTable(prev => prev.map(v => ({ ...v, price: val })))
                      }}
                      placeholder="₺ 2,200"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">İndirimli Fiyat (TRY)</label>
                    <input
                      type="number"
                      value={generalDiscountedPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setGeneralDiscountedPrice(val)
                        setVariantsTable(prev => prev.map(v => ({ ...v, discountedPrice: val })))
                      }}
                      placeholder="₺ 1,200"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alış Fiyatı (TRY)</label>
                    <input
                      type="number"
                      value={generalCostPrice}
                      onChange={(e) => {
                        const val = e.target.value
                        setGeneralCostPrice(val)
                        setVariantsTable(prev => prev.map(v => ({ ...v, costPrice: val })))
                      }}
                      placeholder="₺ 500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Medya (Görseller) - Only shown for simple products */}
              {!isVariantProduct && (
                <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Medya (Görseller)</h2>
                  
                  {/* Upload Zone */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl text-slate-350">📸</span>
                      <span className="text-xs font-bold text-slate-500">Maksimum 10MB boyutunda medya dosyası yükleyebilirsiniz.</span>
                      <span className="text-[11px] font-bold text-indigo-500">+ Görsel / Video Ekle</span>
                    </div>
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold justify-center py-2">
                      <ArrowPath className="w-4 h-4 animate-spin" />
                      <span>Medya dosyaları yükleniyor...</span>
                    </div>
                  )}

                  {/* Images grid preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                      {images.map((img, idx) => {
                        const isVideo = img.type === "video" || isVideoUrl(img.url)
                        return (
                          <div 
                            key={idx} 
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(idx)}
                            className={`relative group aspect-[3/4] rounded-lg border overflow-hidden shadow-sm bg-slate-50 cursor-grab active:cursor-grabbing transition-all ${
                              draggedIndex === idx ? 'opacity-40 border-dashed border-indigo-400' : 'border-slate-150 hover:border-slate-350'
                            }`}
                          >
                            {isVideo ? (
                              <video src={img.url} className="w-full h-full object-cover pointer-events-none" muted autoPlay loop playsInline />
                            ) : (
                              <img src={img.url} alt="preview" className="w-full h-full object-cover pointer-events-none" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-rose-600 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Card 3: Varyant Yönetimi */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-900">Varyant ve Seçenek Yönetimi</h2>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Varyantlı Ürün</span>
                    <input
                      type="checkbox"
                      checked={isVariantProduct}
                      onChange={(e) => setIsVariantProduct(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {isVariantProduct ? (
                  <div className="space-y-4">
                    {/* Renk Seçenekleri */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Renk Seçenekleri</label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Yeni renk ekle..."
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddColor()
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors w-32"
                          />
                          <button
                            type="button"
                            onClick={handleAddColor}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded-lg text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map(color => {
                          const active = selectedColors.includes(color)
                          return (
                            <div
                              key={color}
                              onClick={() => {
                                if (active) {
                                  setSelectedColors(prev => prev.filter(c => c !== color))
                                } else {
                                  setSelectedColors(prev => [...prev, color])
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all cursor-pointer ${
                                active 
                                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>{color}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveColor(color)
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors text-[10px] pl-0.5"
                                title="Sil"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Beden Seçenekleri */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Beden Seçenekleri</label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Yeni beden ekle..."
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddSize()
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors w-32"
                          />
                          <button
                            type="button"
                            onClick={handleAddSize}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded-lg text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map(size => {
                          const active = selectedSizes.includes(size)
                          return (
                            <div
                              key={size}
                              onClick={() => {
                                if (active) {
                                  setSelectedSizes(prev => prev.filter(s => s !== size))
                                } else {
                                  setSelectedSizes(prev => [...prev, size])
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all cursor-pointer ${
                                active 
                                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>{size}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSize(size)
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors text-[10px] pl-0.5"
                                title="Sil"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Generated Variants Table */}
                    {variantsTable.length > 0 && (
                      <div className="mt-6">
                        {/* Bulk Action / Selection info bar */}
                        {checkedIndices.length > 0 && (
                          <div className="flex items-center gap-4 bg-indigo-50/40 border border-indigo-100 rounded-lg px-4 py-2.5 text-xs text-indigo-900 mb-3.5 shadow-sm">
                            <span className="font-extrabold">{checkedIndices.length} Seçili Varyant var</span>
                            <div className="h-4 w-px bg-indigo-200" />
                            <span className="text-[11px] text-indigo-700 font-medium">Bir alana bilgi girdiğinizde seçili olanların tümü değişir.</span>
                            <button
                              type="button"
                              onClick={() => setCheckedIndices([])}
                              className="ml-auto text-indigo-600 hover:text-indigo-800 font-extrabold border border-indigo-200 hover:border-indigo-300 bg-white px-2.5 py-1 rounded-md transition-all shadow-sm"
                            >
                              Seçimi Temizle
                            </button>
                          </div>
                        )}
                        <div className="border border-slate-100 rounded-xl overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th className="py-2.5 px-3 w-10">
                                  <input
                                    type="checkbox"
                                    checked={checkedIndices.length === variantsTable.length && variantsTable.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setCheckedIndices(variantsTable.map((_, i) => i))
                                      } else {
                                        setCheckedIndices([])
                                      }
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                  />
                                </th>
                                <th className="py-2.5 px-3">Görsel</th>
                                <th className="py-2.5 px-3">Varyant</th>
                                <th className="py-2.5 px-3">Satış Fiyatı</th>
                                <th className="py-2.5 px-3">İndirimli Fiyat</th>
                                <th className="py-2.5 px-3">SKU</th>
                                <th className="py-2.5 px-3">Barkod <button type="button" onClick={() => setVariantsTable(variantsTable.map(v => ({...v, barcode: "7689887" + Math.floor(100000 + Math.random() * 900000).toString()})))} className="text-blue-500 hover:underline text-[10px] font-normal normal-case ml-1">(Rastgele)</button></th>
                                <th className="py-2.5 px-3">Stok</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 text-xs">
                              {variantsTable.map((v, idx) => {
                                const isChecked = checkedIndices.includes(idx)
                                return (
                                  <tr key={idx} className={`hover:bg-slate-50/30 ${isChecked ? 'bg-indigo-50/20' : ''}`}>
                                    <td className="py-2 px-3 w-10">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setCheckedIndices(prev => [...prev, idx])
                                          } else {
                                            setCheckedIndices(prev => prev.filter(i => i !== idx))
                                          }
                                        }}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveVariantIndexForImage(idx)
                                          setShowImagePicker(true)
                                        }}
                                        className="relative w-8 h-10 bg-slate-50 border border-slate-150 rounded overflow-hidden flex items-center justify-center hover:border-indigo-500 transition-colors shadow-sm"
                                      >
                                        {v.image ? (
                                          isVideoUrl(v.image) ? (
                                            <div className="relative w-full h-full">
                                              <video src={v.image} className="w-full h-full object-cover" muted playsInline />
                                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                                <span className="text-[8px] text-white font-extrabold bg-black/40 px-1 py-0.5 rounded">VİDEO</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <img src={v.image} alt="v-preview" className="w-full h-full object-cover" />
                                          )
                                        ) : (
                                          <span className="text-xs text-slate-400 font-bold">+</span>
                                        )}
                                      </button>
                                    </td>
                                    <td className="py-2 px-3 font-extrabold text-slate-900">
                                      {v.color} / {v.size}
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={v.price}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].price = val
                                            })
                                          } else {
                                            updated[idx].price = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={v.discountedPrice}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].discountedPrice = val
                                            })
                                          } else {
                                            updated[idx].discountedPrice = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={v.sku || ""}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].sku = val
                                            })
                                          } else {
                                            updated[idx].sku = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-28 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={v.barcode || ""}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].barcode = val
                                            })
                                          } else {
                                            updated[idx].barcode = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-28 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={v.stock}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          const updated = [...variantsTable]
                                          if (isChecked) {
                                            checkedIndices.forEach(i => {
                                              updated[i].stock = val
                                            })
                                          } else {
                                            updated[idx].stock = val
                                          }
                                          setVariantsTable(updated)
                                        }}
                                        className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 text-xs text-slate-400 font-bold text-center">
                    Varyantsız (Tek parçalı) basit ürün türü aktif. Yukarıdaki fiyatlar geçerli olacaktır.
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Details & Settings */}
            <div className="space-y-6">
              
              {/* Card 4: Ürün Detayı */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Ürün Detayı</h2>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Marka / Koleksiyon</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Marka Seçin</option>
                    {collections.map((col: any) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Etiketler</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Örn: jean, tayt, yeni-sezon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Card 5: Açıklama */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Açıklama</h2>
                
                <div className="space-y-1">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    placeholder="Ürün açıklamasını buraya girin..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Card 5.5: Müşteri Yorumları (Görsel 2 Birebir Tasarım) */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">Müşteri Yorumları</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Landing page üzerinde gösterilecek gerçek müşteri yorumları.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview({
                        product_id: editingProductId || "all",
                        product_title: productName || "Ürün Yorumu",
                        customer_name: "",
                        color: selectedColors[0] || availableColors[0] || "STANDART",
                        rating: 5,
                        comment: "",
                        media_url: "",
                        media_type: "image",
                        active: true,
                      })
                      setShowReviewModal(true)
                    }}
                    style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
                    className="hover:opacity-95 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <span>+ Ekle</span>
                  </button>
                </div>

                {(() => {
                  const prodReviews = (catalogData.reviews || []).filter(
                    (r: any) =>
                      (editingProductId && r.product_id === editingProductId) ||
                      (!editingProductId && r.product_title === productName) ||
                      r.product_id === "all"
                  )
                  if (prodReviews.length === 0) {
                    return (
                      <div className="py-6 text-center text-xs text-slate-400 font-medium">
                        Henüz yorum eklenmemiş. &quot;Ekle&quot; butonuna basarak ilk yorumu ekleyin.
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {prodReviews.map((rev: any) => (
                        <div
                          key={rev.id}
                          className="border border-slate-150 rounded-lg p-3 bg-slate-50/60 flex items-start gap-3"
                        >
                          {rev.media_url && (
                            <div className="w-11 h-11 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-white">
                              {rev.media_type === "video" || isVideoUrl(rev.media_url) ? (
                                <video src={rev.media_url} className="w-full h-full object-cover" muted playsInline />
                              ) : (
                                <img src={rev.media_url} alt={rev.customer_name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">{rev.customer_name}</span>
                              <span className="text-[11px] font-bold text-amber-500 shrink-0">
                                {"★".repeat(Number(rev.rating || 5))} {Number(rev.rating || 5).toFixed(1)}/5
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{rev.comment}</p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReview({
                                  id: rev.id,
                                  no: rev.no,
                                  product_id: rev.product_id || editingProductId || "all",
                                  product_title: rev.product_title || productName || "Ürün Yorumu",
                                  customer_name: rev.customer_name || "",
                                  color: rev.color || "STANDART",
                                  rating: Number(rev.rating || 5),
                                  comment: rev.comment || "",
                                  media_url: rev.media_url || "",
                                  media_type: rev.media_type === "video" ? "video" : "image",
                                  active: rev.active !== false,
                                })
                                setShowReviewModal(true)
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Card 6: SEO */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-6">
                <div className="space-y-1 relative">
                  <label className="text-[12px] text-slate-700 block font-normal">SEO Başlığı <span className="text-orange-600">({seoTitle.length})</span></label>
                  <div className="relative">
                    <textarea
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 pr-12 resize-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setSeoTitle(`${productName || "Ürün"} | En Uygun Fiyatlar ve İndirimler`)
                        if (!seoKeywords) setSeoKeywords(productName)
                      }}
                      className="absolute right-2 top-2 p-1 border border-slate-400 rounded hover:bg-slate-100 transition-colors text-slate-600 flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <text x="4" y="16" fontSize="13" fontWeight="bold" fill="currentColor" stroke="none">Ai</text>
                        <path d="M16 4l2 2l-2 2M18 6h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[12px] text-slate-700 block font-normal">SEO Açıklaması <span className="text-orange-600">({seoDescription.length})</span></label>
                  <div className="relative">
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 pr-12 resize-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setSeoDescription(`${productName || "Bu ürün"} modeli en ucuz fiyat avantajı ve indirim fırsatıyla burada. Hemen tıkla, güvenle satın al!`)
                        if (!seoKeywords) setSeoKeywords(productName)
                      }}
                      className="absolute right-2 top-2 p-1 border border-slate-400 rounded hover:bg-slate-100 transition-colors text-slate-600 flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <text x="4" y="16" fontSize="13" fontWeight="bold" fill="currentColor" stroke="none">Ai</text>
                        <path d="M16 4l2 2l-2 2M18 6h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] text-slate-700 block font-normal">SEO Anahtar Kelimeleri <span className="text-orange-600">({seoKeywords.length})</span></label>
                  <textarea
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[12px] text-slate-700 block font-normal">Arama Önizlemesi</label>
                  <div className="border border-slate-200 rounded p-4 bg-white shadow-sm flex flex-col gap-1">
                    <div className="text-[13px] text-[#202124] flex items-center gap-1">
                      fametarz.com/ <span className="text-[#4d5156]">{productName ? productName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') : "krem-desenli-oversize-tisort-ve-sort-takimi"}</span>
                    </div>
                    <div className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer truncate">
                      {seoTitle || (productName ? `${productName} | En Uygun Fiyatlar` : "Krem Desenli Oversize Tişört ve Şort Takımı")}
                    </div>
                    <div className="text-[13px] text-[#4d5156] line-clamp-2">
                      {seoDescription || (productName ? `${productName} modeli en ucuz fiyat avantajı ve indirim fırsatıyla burada.` : "Krem Desenli Oversize Tişört ve Şort Takımı")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* -------------------- 3. DIALOG / IMAGE PICKER FOR VARIANTS -------------------- */}
      {showImagePicker && activeVariantIndexForImage !== null && (() => {
        const isChecked = checkedIndices.includes(activeVariantIndexForImage)
        const selectionCount = isChecked ? checkedIndices.length : 1
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 transition-all">
            <div className="bg-white w-[380px] h-full flex flex-col shadow-2xl border-l border-slate-150 animate-slideOver overflow-hidden">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-900">Görseller</span>
                  <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    Seçili {selectionCount} varyant
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowImagePicker(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Upload media area directly in drawer */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-500/50 transition-colors relative cursor-pointer m-4 bg-slate-50/50 flex-shrink-0">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl text-slate-350">📸</span>
                  <span className="text-xs font-semibold text-slate-500">Görsel seç veya sürükle</span>
                  <span className="text-[11px] font-bold text-indigo-600">+ Görsel / Video Ekle</span>
                </div>
              </div>

              {/* Media selection section */}
              <div className="flex-1 overflow-y-auto min-h-0 py-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-4 mb-2.5">
                  Yüklenen Görseller
                </span>
                
                {(() => {
                  const activeColor = variantsTable[activeVariantIndexForImage]?.color
                  const filteredImages = images.filter(img => img.color === activeColor)
                  
                  if (filteredImages.length === 0) {
                    return (
                      <div className="mx-4 text-center py-10 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-fadeIn">
                        Bu renk ({activeColor || "Standart"}) için henüz görsel/video yüklenmedi.
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-2 px-4 pb-6">
                      {filteredImages.map((img) => {
                        const globalIdx = images.findIndex(item => item.url === img.url)
                        const isSelected = variantsTable[activeVariantIndexForImage].image === img.url
                        const isVideo = img.type === "video" || isVideoUrl(img.url)
                        return (
                          <div
                            key={img.url}
                            draggable
                            onDragStart={() => handleDragStart(globalIdx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(globalIdx)}
                            onClick={() => {
                              const updated = [...variantsTable]
                              if (isChecked) {
                                checkedIndices.forEach(i => {
                                  updated[i].image = img.url
                                })
                              } else {
                                updated[activeVariantIndexForImage].image = img.url
                              }
                              setVariantsTable(updated)
                            }}
                            className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-500/10"
                                : "border-slate-150 hover:border-slate-250 hover:bg-slate-50/40 bg-white"
                            } ${
                              draggedIndex === globalIdx ? 'opacity-40 border-dashed border-indigo-400' : ''
                            }`}
                          >
                            <div className="text-slate-350 font-extrabold select-none text-xs pl-1 cursor-grab active:cursor-grabbing">
                              ⋮⋮
                            </div>

                            <div className="w-10 h-14 rounded-lg border border-slate-150 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center relative pointer-events-none">
                              {isVideo ? (
                                <video src={img.url} className="w-full h-full object-cover" muted playsInline />
                              ) : (
                                <img src={img.url} className="w-full h-full object-cover" />
                              )}
                              {isVideo && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                  <span className="text-[8px] text-white font-extrabold bg-black/40 px-1 py-0.5 rounded">VİDEO</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 pointer-events-none">
                              <span className="text-[11px] font-bold text-slate-700 truncate">
                                {img.filename || `Medya`}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {isVideo ? "Video" : "Görsel"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm("Bu görseli silmek istediğinize emin misiniz?")) {
                                  handleDeleteImageFromPool(img.url)
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all mr-1 z-10 flex-shrink-0"
                              title="Sil"
                            >
                              <Trash className="w-4 h-4" />
                            </button>

                            {isSelected && (
                              <div className="bg-indigo-600 text-white rounded-full p-0.5 mr-2 flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-white fill-white" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-4 py-3.5 flex gap-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...variantsTable]
                    if (isChecked) {
                      checkedIndices.forEach(i => {
                        updated[i].image = ""
                      })
                    } else {
                      updated[activeVariantIndexForImage].image = ""
                    }
                    setVariantsTable(updated)
                    setShowImagePicker(false)
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
                >
                  Görseli Kaldır
                </button>
                <button 
                  type="button"
                  onClick={() => setShowImagePicker(false)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2 rounded-lg shadow-md transition-colors"
                >
                  Tamam
                </button>
              </div>

            </div>
          </div>
        )
      })()}

      {/* -------------------- 4. BULK ACTIONS MODAL -------------------- */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="bg-[#1d4ed8] px-5 py-4 flex justify-between items-center text-white">
              <h2 className="text-base font-bold">Toplu İşlemler</h2>
              <button onClick={() => { setIsBulkModalOpen(false); setBulkModalStep(1); }} className="text-white hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {bulkModalStep === 1 ? (
              /* Step 1: Select Action */
              <div className="p-6 space-y-6">
                <div className="bg-[#3b82f6] text-white p-4 rounded-lg text-sm font-medium">
                  Tabloda seçtiğiniz ürünlere aşağıdaki işlemleri uygulayabilirsiniz.
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">İşlemler</label>
                  <select 
                    value={bulkActionType}
                    onChange={(e) => setBulkActionType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="">İşlem Seçiniz</option>
                    <option value="category">Kategori Değiştir</option>
                    <option value="price">Satış Fiyatını Güncelle</option>
                    <option value="stock">Stok Miktarını Güncelle</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!bulkActionType) return alert("Lütfen bir işlem seçiniz.")
                      setBulkModalStep(2)
                    }}
                    className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded shadow transition-colors flex items-center gap-2"
                  >
                    <span>İleri</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Action Details */
              <div className="p-6 space-y-6">
                {bulkActionType === "category" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Kategori Seçin</label>
                    <select
                      value={bulkActionCategory}
                      onChange={(e) => setBulkActionCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                    >
                      <option value="">Hiçbiri seçilmedi</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBulkModalStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    <span>Geri</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBulkUpdating}
                    onClick={async () => {
                      if (bulkActionType === "category" && !bulkActionCategory) return alert("Lütfen bir kategori seçin.")
                      setIsBulkUpdating(true)
                      try {
                        for (const id of selectedProductIds) {
                          await fetch(`/admin/products/${id}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categories: [{ id: bulkActionCategory }] })
                          })
                        }
                        alert("Toplu güncelleme başarıyla tamamlandı.")
                        setIsBulkModalOpen(false)
                        setBulkModalStep(1)
                        setSelectedProductIds([])
                        await fetchData()
                      } catch (e: any) {
                        alert("Hata: " + e.message)
                      } finally {
                        setIsBulkUpdating(false)
                      }
                    }}
                    className="bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-5 rounded shadow transition-colors flex items-center gap-2"
                  >
                    {isBulkUpdating ? (
                      <ArrowPath className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    <span>İşlemi Tamamla</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Ürün Yönetimi",
  icon: Tag,
})

export default IkasProductsPage
