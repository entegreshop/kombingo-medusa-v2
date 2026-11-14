import React, { useState, useEffect } from "react"
import { Trash, Plus, Eye, MagnifyingGlass } from "@medusajs/icons"

const XML_FORMAT_OPTIONS = [
  "Standart XML",
  "Google Merchant Katalog",
  "Akakçe",
  "Facebook - Instagram Katalog",
  "Cimri",
  "Özelleştirilmiş XML",
  "RSS",
  "TikTok Katalog",
  "OpenAI Ads Katalog",
]

const CustomMultiSelect = ({ options, selected, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))

  const toggleOption = (val: string) => {
    if (val === "all") {
      if (selected.includes("all")) onChange([])
      else onChange(["all", ...options.filter((o: any) => o.value !== "all").map((o: any) => o.value)])
      return
    }
    let newSelected = selected.includes(val) ? selected.filter((s: string) => s !== val) : [...selected, val]
    if (newSelected.length === options.length - 1 && !newSelected.includes("all")) newSelected.push("all")
    if (selected.includes("all") && selected.includes(val)) newSelected = newSelected.filter((s: string) => s !== "all")
    onChange(newSelected)
  }

  const selectAll = () => onChange(options.map((o: any) => o.value))
  const clearAll = () => onChange([])

  let displayText = placeholder || "Kategori Seçilmedi"
  if (selected.includes("all") || (options.length > 1 && selected.length === options.length)) displayText = "Tümü Seçildi"
  else if (selected.length > 0) displayText = `${selected.length} Seçildi`

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="w-full h-9 border border-zinc-200 rounded px-3 flex items-center justify-between cursor-pointer bg-white hover:border-zinc-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[12.5px] text-zinc-700 truncate">{displayText}</span>
        <span className="text-zinc-500 text-[10px]">▾</span>
      </div>

      {isOpen && (
        <div className="absolute top-10 left-0 w-full bg-white border border-zinc-200 rounded shadow-xl z-[120] flex flex-col max-h-[260px]">
          <div className="p-2 border-b border-zinc-100">
            <input
              type="text"
              placeholder="Arayın.."
              className="w-full text-xs border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100 text-[11px] font-medium text-zinc-600 bg-zinc-50">
            <button type="button" onClick={selectAll} className="hover:text-blue-600">
              Tümünü Seç
            </button>
            <button type="button" onClick={clearAll} className="hover:text-red-600">
              Temizle
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filtered.map((opt: any) => (
              <label key={opt.value} className="flex items-center gap-x-2 px-2 py-1.5 hover:bg-zinc-50 cursor-pointer rounded">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300 w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                <span className="text-xs text-zinc-700">{opt.label}</span>
              </label>
            ))}
            {filtered.length === 0 && <div className="p-2 text-xs text-zinc-500 text-center">Sonuç bulunamadı</div>}
          </div>
        </div>
      )}
    </div>
  )
}

interface XmlFeedConfig {
  id: string
  no?: number
  name: string
  format: string
  currency: string
  language: string
  product_source: string
  categories: string[]
  brands: string
  tags?: string
  price_type: string
  status: string
  title_case?: string
  short_desc_case?: string
  stock_status: string
  min_stock: number
  add_barcode: string
  profit_margin: number | string
  sort_by_date?: boolean
  webp_images?: boolean
  hide_no_image: boolean
}

const XmlExportPage = () => {
  const [feeds, setFeeds] = useState<XmlFeedConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState<number>(15)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFeed, setCurrentFeed] = useState<Partial<XmlFeedConfig>>({})
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [medusaCategories, setMedusaCategories] = useState<any[]>([])

  const notify = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchFeeds = async () => {
    try {
      const res = await fetch("/admin/xml-export")
      const data = await res.json()
      if (data && data.feeds) {
        setFeeds(data.feeds)
      }
    } catch (err) {
      console.error("Failed to load xml feeds:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/admin/product-categories?limit=999")
      const data = await res.json()
      if (data && data.product_categories) {
        setMedusaCategories(data.product_categories)
      }
    } catch (err) {
      console.error("Failed to load categories:", err)
    }
  }

  useEffect(() => {
    fetchFeeds()
    fetchCategories()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFeed.name || !currentFeed.name.trim()) {
      notify("Lütfen XML Adı alanını doldurun.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/admin/xml-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentFeed),
      })
      const data = await res.json()
      if (data && data.success) {
        setFeeds(data.feeds)
        setIsModalOpen(false)
        setCurrentFeed({})
        notify("XML dosyası başarıyla kaydedildi.")
      }
    } catch (err) {
      notify("Kaydedilirken bir hata oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu XML dosyasını silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/admin/xml-export/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data && data.success) {
        setFeeds(feeds.filter((f) => f.id !== id))
        notify("XML dosyası silindi.")
      }
    } catch (err) {
      notify("Silinirken hata oluştu.")
    }
  }

  const openNewModal = (presetFormat?: string, presetName?: string) => {
    setCurrentFeed({
      name: presetName || "",
      format: presetFormat || "Standart XML",
      currency: "TL",
      language: "Varsayılan",
      product_source: "Hiçbiri seçilmedi",
      categories: [],
      brands: "Marka Seçilmedi",
      tags: "Etiket Seçilmedi",
      price_type: "Varsayılan Satış Fiyatı",
      status: "Aktif Olanlar",
      title_case: "Varsayılan",
      short_desc_case: "Varsayılan",
      stock_status: "Tümü",
      min_stock: -9999,
      add_barcode: "Eklensin",
      profit_margin: "",
      sort_by_date: false,
      webp_images: true,
      hide_no_image: true,
    })
    setIsModalOpen(true)
  }

  const getFeedUrl = (id: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://kombingo.com"
    return `${baseUrl}/export/${id}`
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    notify("XML adresi panoya kopyalandı!")
  }

  const filteredFeeds = feeds.filter((f) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (f.name || "").toLowerCase().includes(q) ||
      (f.format || "").toLowerCase().includes(q) ||
      (f.id || "").toLowerCase().includes(q) ||
      String(f.no || "").includes(q)
    )
  })

  const visibleFeeds = filteredFeeds.slice(0, pageSize)

  const toggleSelectAll = () => {
    if (selectedIds.length === visibleFeeds.length && visibleFeeds.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(visibleFeeds.map((f) => f.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[920px] mx-auto py-4 px-2 text-zinc-900">
      {toastMsg && (
        <div className="mb-4 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-medium shadow flex items-center justify-between">
          <span>✓ {toastMsg}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="text-white/80 hover:text-white ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Top Action Bar matching Image 3 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hızlı ara.."
            className="pl-9 pr-4 h-9 bg-white border border-zinc-200/90 rounded text-[12.5px] w-[260px] focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openNewModal()}
            className="h-9 px-3.5 bg-[#00b259] hover:bg-[#00994c] text-white font-medium rounded shadow-sm flex items-center gap-1.5 text-[12.5px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni XML Dosyası</span>
          </button>
          <button
            type="button"
            onClick={() => openNewModal("Google Merchant Katalog", "Google Merchant Katalog")}
            className="h-9 px-3.5 bg-[#1a73e8] hover:bg-[#155fc0] text-white font-medium rounded shadow-sm flex items-center gap-2 text-[12.5px] transition-colors"
          >
            <span className="font-bold text-[13px] leading-none">G</span>
            <span>Google Merchant Katalog</span>
          </button>
        </div>
      </div>

      {/* Table Card matching Image 3 */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-zinc-200/80 text-[12px] font-bold text-zinc-800">
                <th className="p-3.5 w-11 text-center border-r border-zinc-100">
                  <input
                    type="checkbox"
                    checked={visibleFeeds.length > 0 && selectedIds.length === visibleFeeds.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 text-blue-600"
                  />
                </th>
                <th className="p-3.5 w-14 border-r border-zinc-100">No</th>
                <th className="p-3.5 w-36 border-r border-zinc-100">Adı</th>
                <th className="p-3.5 w-40 border-r border-zinc-100">Format</th>
                <th className="p-3.5 border-r border-zinc-100">XML Adresi</th>
                <th className="p-3.5 w-24 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visibleFeeds.map((feed, idx) => {
                const displayNo = feed.no ?? Math.max(1, feeds.length - idx + 5)
                const fullUrl = getFeedUrl(feed.id)
                return (
                  <tr
                    key={feed.id}
                    className={`border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors ${
                      idx % 2 === 1 ? "bg-[#fafbfc]" : "bg-white"
                    }`}
                  >
                    <td className="p-3.5 text-center border-r border-zinc-100">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(feed.id)}
                        onChange={() => toggleSelectOne(feed.id)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600"
                      />
                    </td>
                    <td className="p-3.5 text-[12.5px] font-bold text-[#1a56db] border-r border-zinc-100">{displayNo}</td>
                    <td className="p-3.5 text-[12px] text-zinc-700 border-r border-zinc-100">{feed.name}</td>
                    <td className="p-3.5 text-[12px] text-zinc-600 leading-snug border-r border-zinc-100">{feed.format}</td>
                    <td className="p-3.5 text-[12px] font-bold text-zinc-900 leading-snug border-r border-zinc-100">
                      <button
                        type="button"
                        onClick={() => copyUrl(fullUrl)}
                        className="text-left break-all hover:text-blue-600 transition-colors"
                        title="Kopyalamak için tıklayın"
                      >
                        {fullUrl}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentFeed({
                              tags: "Etiket Seçilmedi",
                              title_case: "Varsayılan",
                              short_desc_case: "Varsayılan",
                              sort_by_date: false,
                              webp_images: true,
                              ...feed,
                              no: displayNo,
                            })
                            setIsModalOpen(true)
                          }}
                          className="w-7 h-6 bg-[#9353d3] hover:bg-[#7e3af2] text-white rounded flex items-center justify-center transition-colors"
                          title="Düzenle / Görüntüle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(feed.id)}
                          className="w-7 h-6 bg-[#f31260] hover:bg-[#e11d48] text-white rounded flex items-center justify-center transition-colors"
                          title="Sil"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {visibleFeeds.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-zinc-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Image 3 */}
        <div className="bg-white px-4 py-3.5 flex items-center gap-3 text-[12px] text-zinc-600 border-t border-zinc-100">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-zinc-200 rounded px-2 py-1 text-zinc-700 bg-white outline-none text-[12px]"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span>
            {filteredFeeds.length} kayıttan {filteredFeeds.length > 0 ? 1 : 0} ile {visibleFeeds.length} arası gösteriliyor
          </span>
        </div>
      </div>

      {/* Modal matching Image 4 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] flex flex-col max-h-[92vh] overflow-hidden my-auto">
            {/* Blue Header matching Image 4 */}
            <div className="bg-[#0d6efd] px-6 py-4 text-white flex justify-between items-start shrink-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-white/95">XML Dışarı Aktar</span>
                <h2 className="text-white font-bold text-[15px] m-0">
                  {!currentFeed.id ? "Yeni XML Dosyası" : `${currentFeed.no || ""} Nolu XML Dosyası`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none font-bold"
              >
                &times;
              </button>
            </div>

            {/* Form Body matching Image 4 */}
            <form id="xml-export-form" onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Row 1: XML Adı * | XML Formatı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">
                    XML Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={currentFeed.name || ""}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, name: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">XML Formatı</label>
                  <select
                    value={currentFeed.format || "Standart XML"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, format: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    {XML_FORMAT_OPTIONS.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Para Birimi | İçerik Dili */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Para Birimi</label>
                  <select
                    value={currentFeed.currency || "TL"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, currency: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="TL">TL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">İçerik Dili</label>
                  <select
                    value={currentFeed.language || "Varsayılan"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, language: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Varsayılan">Varsayılan</option>
                    <option value="Türkçe (Türkçe)">Türkçe (Türkçe)</option>
                    <option value="İngilizce (English)">İngilizce (English)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Ürün Kaynağı | Kategoriler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Ürün Kaynağı</label>
                  <select
                    value={currentFeed.product_source || "Hiçbiri seçilmedi"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, product_source: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Hiçbiri seçilmedi">Hiçbiri seçilmedi</option>
                    <option value="Yönetim Paneli">Yönetim Paneli</option>
                    <option value="XML Tedarikçi">XML Tedarikçi</option>
                    <option value="Tüm Kaynaklar">Tüm Kaynaklar</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 relative z-[100]">
                  <label className="text-[12px] text-zinc-700">Kategoriler</label>
                  <CustomMultiSelect
                    options={[
                      { label: "Tüm Kategoriler", value: "all" },
                      ...medusaCategories.map((cat) => ({ label: cat.name, value: cat.id })),
                    ]}
                    selected={currentFeed.categories || []}
                    onChange={(newCategories: string[]) => setCurrentFeed({ ...currentFeed, categories: newCategories })}
                    placeholder="Kategori Seçilmedi"
                  />
                </div>
              </div>

              {/* Row 4: Markalar | Ürün Etiketleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Markalar</label>
                  <select
                    value={currentFeed.brands || "Marka Seçilmedi"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, brands: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Marka Seçilmedi">Marka Seçilmedi</option>
                    <option value="Tüm Markalar">Tüm Markalar</option>
                    <option value="Kombingo">Kombingo</option>
                    <option value="Maxton Design">Maxton Design</option>
                    <option value="Rieger">Rieger</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Ürün Etiketleri</label>
                  <select
                    value={currentFeed.tags || "Etiket Seçilmedi"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, tags: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Etiket Seçilmedi">Etiket Seçilmedi</option>
                    <option value="Yeni Ürün">Yeni Ürün</option>
                    <option value="İndirimli Ürün">İndirimli Ürün</option>
                    <option value="Çok Satan">Çok Satan</option>
                    <option value="Fırsat Ürünü">Fırsat Ürünü</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Satış Fiyatı Tipi | Ürün Durumu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Satış Fiyatı Tipi</label>
                  <select
                    value={currentFeed.price_type || "Varsayılan Satış Fiyatı"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, price_type: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Varsayılan Satış Fiyatı">Varsayılan Satış Fiyatı</option>
                    <option value="İndirimli Satış Fiyatı">İndirimli Satış Fiyatı</option>
                    <option value="Piyasa Fiyatı">Piyasa Fiyatı</option>
                    <option value="Bayi Fiyatı">Bayi Fiyatı</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Ürün Durumu</label>
                  <select
                    value={currentFeed.status || "Aktif Olanlar"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, status: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Aktif Olanlar">Aktif Olanlar</option>
                    <option value="Tümü">Tümü</option>
                    <option value="Pasif Olanlar">Pasif Olanlar</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Ürün Başlıkları | Ürün Kısa Açıklaması (Ön Detay) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Ürün Başlıkları</label>
                  <select
                    value={currentFeed.title_case || "Varsayılan"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, title_case: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Varsayılan">Varsayılan</option>
                    <option value="Sadece Baş Harfler Büyük">Sadece Baş Harfler Büyük</option>
                    <option value="Tümü Büyük Harf">Tümü Büyük Harf</option>
                    <option value="Tümü Küçük Harf">Tümü Küçük Harf</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Ürün Kısa Açıklaması (Ön Detay)</label>
                  <select
                    value={currentFeed.short_desc_case || "Varsayılan"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, short_desc_case: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Varsayılan">Varsayılan</option>
                    <option value="Sadece Baş Harfler Büyük">Sadece Baş Harfler Büyük</option>
                    <option value="Tümü Büyük Harf">Tümü Büyük Harf</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Stok Durumu | Minimum Stok Miktarı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Stok Durumu</label>
                  <select
                    value={currentFeed.stock_status || "Tümü"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, stock_status: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Tümü">Tümü</option>
                    <option value="Stokta Olanlar">Stokta Olanlar</option>
                    <option value="Stokta Olmayanlar">Stokta Olmayanlar</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Minimum Stok Miktarı</label>
                  <input
                    type="number"
                    value={currentFeed.min_stock ?? -9999}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, min_stock: parseInt(e.target.value, 10) || 0 })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>
              </div>

              {/* Row 8: Ürün Barkodları | Kar Oranı (%) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Ürün Barkodları</label>
                  <select
                    value={currentFeed.add_barcode || "Eklensin"}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, add_barcode: e.target.value })}
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 bg-white w-full"
                  >
                    <option value="Eklensin">Eklensin</option>
                    <option value="Eklenmesin">Eklenmesin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-zinc-700">Kar Oranı (%)</label>
                  <input
                    type="number"
                    value={currentFeed.profit_margin ?? ""}
                    onChange={(e) =>
                      setCurrentFeed({
                        ...currentFeed,
                        profit_margin: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="h-9 px-3 border rounded border-zinc-200 text-[12.5px] text-zinc-800 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>
              </div>

              {/* 3 Checkboxes matching Image 4 */}
              <div className="flex flex-col gap-2.5 pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(currentFeed.sort_by_date)}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, sort_by_date: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-[#0d6efd] focus:ring-[#0d6efd]"
                  />
                  <span className="text-[12.5px] text-zinc-700">Ürün eklenme tarihine göre sırala</span>
                </label>

                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentFeed.webp_images !== false}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, webp_images: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-[#0d6efd] focus:ring-[#0d6efd]"
                  />
                  <span className="text-[12.5px] text-zinc-700">Görseller WEBP formatında olsun</span>
                </label>

                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentFeed.hide_no_image !== false}
                    onChange={(e) => setCurrentFeed({ ...currentFeed, hide_no_image: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-[#0d6efd] focus:ring-[#0d6efd]"
                  />
                  <span className="text-[12.5px] text-zinc-700">Görseli olmayan ürünler gizlensin</span>
                </label>
              </div>
            </form>

            {/* Modal Footer matching Image 4 */}
            <div className="bg-[#f8f9fa] px-6 py-3.5 flex items-center justify-end border-t border-zinc-200 shrink-0">
              <button
                type="submit"
                form="xml-export-form"
                disabled={saving}
                className="px-5 py-2 bg-[#00b259] hover:bg-[#00994c] text-white rounded font-medium text-[12.5px] flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
              >
                <span>✓</span>
                <span>{saving ? "Kaydediliyor..." : "Kaydet"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default XmlExportPage
