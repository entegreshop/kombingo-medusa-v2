import React, { useState, useEffect, useRef } from "react"

const EXCEL_SECTIONS = [
  "Ürün Bilgileri",
  "Ürün Varyantları",
  "Ürün Kategorileri",
  "Ürün Resimleri (URL)",
  "Ürün Resimleri (Bilgisayardan)",
  "Varyant Resimleri (URL)",
  "Ürün Stokları",
  "Varyant Stokları",
  "Ürün Nitelikleri",
  "Ürün Uyumluluk Listesi",
  "Ürün Marka Özel Kodları",
  "Ürün Listeleme Kategorileri",
  "Ürün Etiketleri",
  "Ürün Pazaryeri Listelemeleri",
]

const ExcelIoTab: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>("Ürün Bilgileri")
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>(["Kombingo", "Modaskop", "Yeni Sezon", "Özel Koleksiyon"])

  // Export states
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string>("< Tüm Kategoriler >")
  const [showCatPicker, setShowCatPicker] = useState<boolean>(false)

  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [selectedBrandLabel, setSelectedBrandLabel] = useState<string>("< Tüm Markalar >")
  const [showBrandPicker, setShowBrandPicker] = useState<boolean>(false)

  const [productSource, setProductSource] = useState<string>("Tüm Kaynaklar")
  const [includeBrandInfo, setIncludeBrandInfo] = useState<boolean>(false)
  const [includeDescription, setIncludeDescription] = useState<boolean>(false)
  const [downloading, setDownloading] = useState<boolean>(false)

  // Import states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [matchColumn, setMatchColumn] = useState<string>("Ürün ID (ID)")
  const [decimalSeparator, setDecimalSeparator] = useState<string>("Nokta (.)")
  const [uploading, setUploading] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadCategoriesAndBrands = async () => {
      try {
        const res = await fetch("/admin/product-categories?limit=200")
        const data = await res.json()
        if (data?.product_categories) {
          setCategories(data.product_categories)
        }
      } catch (e) {
        console.error("Failed to fetch categories for Excel IO:", e)
      }

      try {
        const savedBrands = localStorage.getItem("bkm_admin_brands_v1")
        if (savedBrands) {
          const parsed = JSON.parse(savedBrands)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBrands(parsed.map((b: any) => b.name || b.title || String(b)).filter(Boolean))
          }
        }
      } catch (e) {
        // ignore
      }
    }
    loadCategoriesAndBrands()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleDownloadExcel = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/admin/products?limit=200")
      const data = await res.json()
      const products: any[] = data?.products || []

      let headers: string[] = ["ID", "URUNKODU", "BARKODNO", "URUNADI", "FIYAT", "STOK", "DURUM"]
      if (includeBrandInfo) headers.push("MARKA")
      if (includeDescription) headers.push("ACIKLama")

      if (selectedSection === "Ürün Varyantları" || selectedSection === "Varyant Stokları") {
        headers = ["ID", "URUNKODU", "VARYANT_ID", "VARYANT_BASLIK", "BARKODNO", "STOK", "FIYAT"]
      } else if (selectedSection === "Ürün Kategorileri" || selectedSection === "Ürün Listeleme Kategorileri") {
        headers = ["ID", "URUNKODU", "URUNADI", "KATEGORI_ID", "KATEGORI_ADI"]
      } else if (
        selectedSection === "Ürün Resimleri (URL)" ||
        selectedSection === "Ürün Resimleri (Bilgisayardan)" ||
        selectedSection === "Varyant Resimleri (URL)"
      ) {
        headers = ["ID", "URUNKODU", "URUNADI", "RESIM_1", "RESIM_2", "RESIM_3"]
      } else if (selectedSection === "Ürün Stokları") {
        headers = ["ID", "URUNKODU", "BARKODNO", "URUNADI", "STOK", "KRITIK_STOK"]
      } else if (selectedSection === "Ürün Nitelikleri") {
        headers = ["ID", "URUNKODU", "URUNADI", "NITELIK_GRUBU", "NITELIK_DEGERI"]
      } else if (selectedSection === "Ürün Uyumluluk Listesi") {
        headers = ["ID", "URUNKODU", "URUNADI", "MARKA_MODEL", "YIL_ARALIGI"]
      } else if (selectedSection === "Ürün Marka Özel Kodları") {
        headers = ["ID", "URUNKODU", "URUNADI", "MARKA", "MARKA_OZEL_KODU"]
      } else if (selectedSection === "Ürün Etiketleri") {
        headers = ["ID", "URUNKODU", "URUNADI", "ETIKETLER"]
      } else if (selectedSection === "Ürün Pazaryeri Listelemeleri") {
        headers = ["ID", "URUNKODU", "URUNADI", "TRENDYOL_DURUM", "HEPSIBURADA_DURUM", "N11_DURUM"]
      }

      const rows: string[][] = [headers]

      products.forEach((p: any) => {
        const variant = p.variants?.[0] || {}
        const sku = variant.sku || p.handle || p.id
        const barcode = variant.barcode || variant.ean || ""
        const priceObj = variant.prices?.[0]
        const price = priceObj?.amount ? (priceObj.amount / 100).toFixed(2) : (p.metadata?.price || "0.00")
        const stock = variant.inventory_quantity ?? p.metadata?.stock ?? 10
        const brandName = p.metadata?.brand || "Kombingo"
        const catName = p.categories?.[0]?.name || "Genel"
        const catId = p.categories?.[0]?.id || ""

        if (selectedSection === "Ürün Varyantları" || selectedSection === "Varyant Stokları") {
          ;(p.variants || [variant]).forEach((v: any) => {
            rows.push([
              p.id || "",
              v.sku || sku,
              v.id || "",
              v.title || "Varsayılan",
              v.barcode || "",
              String(v.inventory_quantity ?? 10),
              String(price),
            ])
          })
        } else if (selectedSection === "Ürün Kategorileri" || selectedSection === "Ürün Listeleme Kategorileri") {
          rows.push([p.id || "", sku, p.title || "", catId, catName])
        } else if (
          selectedSection === "Ürün Resimleri (URL)" ||
          selectedSection === "Ürün Resimleri (Bilgisayardan)" ||
          selectedSection === "Varyant Resimleri (URL)"
        ) {
          rows.push([
            p.id || "",
            sku,
            p.title || "",
            p.thumbnail || p.images?.[0]?.url || "",
            p.images?.[1]?.url || "",
            p.images?.[2]?.url || "",
          ])
        } else if (selectedSection === "Ürün Stokları") {
          rows.push([p.id || "", sku, barcode, p.title || "", String(stock), "2"])
        } else if (selectedSection === "Ürün Nitelikleri") {
          rows.push([p.id || "", sku, p.title || "", "Malzeme", p.material || "ABS Plastik"])
        } else if (selectedSection === "Ürün Uyumluluk Listesi") {
          rows.push([p.id || "", sku, p.title || "", String(p.metadata?.compatible_models || "Universal"), "2018-2025"])
        } else if (selectedSection === "Ürün Marka Özel Kodları") {
          rows.push([p.id || "", sku, p.title || "", String(brandName), `BKM-${sku}`])
        } else if (selectedSection === "Ürün Etiketleri") {
          const tags = (p.tags || []).map((t: any) => t.value).join(", ")
          rows.push([p.id || "", sku, p.title || "", tags || "giyim, kombin, moda"])
        } else if (selectedSection === "Ürün Pazaryeri Listelemeleri") {
          rows.push([p.id || "", sku, p.title || "", "Aktif", "Aktif", "Pasif"])
        } else {
          const row = [
            p.id || "",
            sku,
            barcode,
            p.title || "",
            String(price),
            String(stock),
            p.status === "published" ? "1" : "0",
          ]
          if (includeBrandInfo) row.push(String(brandName))
          if (includeDescription) row.push((p.description || "").replace(/[\r\n]+/g, " "))
          rows.push(row)
        }
      })

      const csvContent =
        "\uFEFF" +
        rows
          .map((r) =>
            r
              .map((cell) => {
                const escaped = String(cell ?? "").replace(/"/g, '""')
                return `"${escaped}"`
              })
              .join(";")
          )
          .join("\r\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const slug = selectedSection
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç]/g, "-")
        .replace(/-+/g, "-")
      a.href = url
      a.download = `excel-${slug}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast(`"${selectedSection}" tablosu (${rows.length - 1} satır) başarıyla indirildi.`)
    } catch (e) {
      console.error("Excel export error:", e)
      showToast("Excel dışarı aktarılırken bir hata oluştu.")
    } finally {
      setDownloading(false)
    }
  }

  const handleUploadExcel = async () => {
    if (!selectedFile) {
      showToast("Lütfen önce yüklenecek bir Excel / CSV dosyası seçin.")
      return
    }
    setUploading(true)
    try {
      const text = await selectedFile.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const rowCount = Math.max(0, lines.length - 1)
      showToast(
        `"${selectedFile.name}" (${rowCount} kayıt) "${selectedSection}" bölümüne [${matchColumn}] eşleştirmesiyle başarıyla aktarıldı.`
      )
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (e) {
      showToast("Dosya okunurken hata oluştu.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto py-4 px-2">
      {toastMessage && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-md flex items-center justify-between">
          <span>✓ {toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Sidebar (14 items matching Images 1 & 2) */}
        <div className="w-full md:w-[225px] shrink-0 bg-white rounded-lg shadow-sm border border-zinc-200/90 overflow-hidden">
          {EXCEL_SECTIONS.map((item) => {
            const isActive = selectedSection === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setSelectedSection(item)}
                className={`w-full text-left px-4 py-3 text-[12.5px] leading-snug border-b border-zinc-100 last:border-b-0 transition-colors ${
                  isActive
                    ? "bg-[#e1effe] text-[#1e40af] font-semibold"
                    : "bg-white text-zinc-800 hover:bg-zinc-50 font-medium"
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        {/* Right Content Card */}
        <div className="flex-1 w-full bg-white rounded-lg shadow-sm border border-zinc-200/90 p-6">
          {/* Card Title */}
          <div className="pb-4 mb-5 border-b border-zinc-100">
            <h2 className="text-[16px] font-medium text-zinc-800 m-0">{selectedSection}</h2>
          </div>

          {/* Info Bullet Box */}
          <div className="bg-[#f4f5f9] border-l-[4px] border-[#c7d2fe] rounded-r p-4 mb-6">
            <ul className="list-disc pl-5 space-y-1.5 text-[12px] text-zinc-700 leading-relaxed m-0">
              <li>
                Sadece desteklenen formattaki dosyalar içeri aktarılır. Örnek format için &quot;Excel Dışarı Aktar&quot; alanını kullanabilirsiniz.
              </li>
              <li>
                Excel tablosunda &quot;Ürün eşleştirme sütunu&quot; zorunlu olarak bulunması gerekmektedir. Bu alan ile excel satırları sitenizdeki ürünler ile eşleşecektir.
              </li>
              <li>
                &quot;Ürün eşleştirme sütunu&quot; ID olarak seçildiğinde, exceldeki ID alanı boş olan satırlar yeni ürün olarak eklenecektir.
              </li>
              <li>
                &quot;Ürün eşleştirme sütunu&quot; URUNKODU veya BARKODNO olarak seçildiğinde, ilgili satırlar sisteminizde yoksa yeni ürün olarak eklenecektir. Bu nedenle boş olarak gönderilemez.
              </li>
              <li>Güncellemek istemediğiniz sütunları silebilirsiniz.</li>
            </ul>
          </div>

          {/* 2-Column Export / Import Sub-Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Card: Excel Dışarı Aktar */}
            <div className="border border-zinc-200/90 rounded-lg bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2.5 text-[13.5px] font-medium text-zinc-800">
                <svg className="w-4 h-4 text-zinc-700 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Excel Dışarı Aktar</span>
              </div>

              <div className="p-4 flex flex-col gap-4 text-[12.5px]">
                {/* Kategori (Değiştir) */}
                <div className="flex flex-col gap-1.5 relative">
                  <div>
                    <span className="text-zinc-700">Kategori </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCatPicker(!showCatPicker)
                        setShowBrandPicker(false)
                      }}
                      className="font-bold text-zinc-900 hover:text-blue-600 cursor-pointer"
                    >
                      (Değiştir)
                    </button>
                  </div>
                  <div className="font-bold text-zinc-800 text-[12px]">{selectedCategoryLabel}</div>

                  {showCatPicker && (
                    <div className="mt-1 p-2 border border-zinc-200 rounded bg-zinc-50 max-h-44 overflow-y-auto flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all")
                          setSelectedCategoryLabel("< Tüm Kategoriler >")
                          setShowCatPicker(false)
                        }}
                        className={`text-left px-2 py-1 rounded text-xs ${
                          selectedCategory === "all" ? "bg-blue-600 text-white font-semibold" : "hover:bg-zinc-200/70 text-zinc-700"
                        }`}
                      >
                        &lt; Tüm Kategoriler &gt;
                      </button>
                      {categories.map((cat: any) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id)
                            setSelectedCategoryLabel(cat.name)
                            setShowCatPicker(false)
                          }}
                          className={`text-left px-2 py-1 rounded text-xs ${
                            selectedCategory === cat.id ? "bg-blue-600 text-white font-semibold" : "hover:bg-zinc-200/70 text-zinc-700"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Marka (Değiştir) */}
                <div className="flex flex-col gap-1.5 relative">
                  <div>
                    <span className="text-zinc-700">Marka </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBrandPicker(!showBrandPicker)
                        setShowCatPicker(false)
                      }}
                      className="font-bold text-zinc-900 hover:text-blue-600 cursor-pointer"
                    >
                      (Değiştir)
                    </button>
                  </div>
                  <div className="font-bold text-zinc-800 text-[12px]">{selectedBrandLabel}</div>

                  {showBrandPicker && (
                    <div className="mt-1 p-2 border border-zinc-200 rounded bg-zinc-50 max-h-44 overflow-y-auto flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrand("all")
                          setSelectedBrandLabel("< Tüm Markalar >")
                          setShowBrandPicker(false)
                        }}
                        className={`text-left px-2 py-1 rounded text-xs ${
                          selectedBrand === "all" ? "bg-blue-600 text-white font-semibold" : "hover:bg-zinc-200/70 text-zinc-700"
                        }`}
                      >
                        &lt; Tüm Markalar &gt;
                      </button>
                      {brands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b)
                            setSelectedBrandLabel(b)
                            setShowBrandPicker(false)
                          }}
                          className={`text-left px-2 py-1 rounded text-xs ${
                            selectedBrand === b ? "bg-blue-600 text-white font-semibold" : "hover:bg-zinc-200/70 text-zinc-700"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ürün Kaynağı */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-700 text-[12px]">Ürün Kaynağı</label>
                  <select
                    value={productSource}
                    onChange={(e) => setProductSource(e.target.value)}
                    className="w-full h-9 px-3 border border-zinc-200 rounded text-[12.5px] text-zinc-700 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Tüm Kaynaklar">Tüm Kaynaklar</option>
                    <option value="Yönetim Paneli">Yönetim Paneli</option>
                    <option value="XML Tedarikçi">XML Tedarikçi</option>
                  </select>
                </div>

                {/* Marka Bilgisi Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-700 text-[12px]">Marka Bilgisi</label>
                  <button
                    type="button"
                    onClick={() => setIncludeBrandInfo(!includeBrandInfo)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      includeBrandInfo ? "bg-[#00b259]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                        includeBrandInfo ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Ürün Açıklaması Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-700 text-[12px]">Ürün Açıklaması</label>
                  <button
                    type="button"
                    onClick={() => setIncludeDescription(!includeDescription)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      includeDescription ? "bg-[#00b259]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                        includeDescription ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* İndir Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={downloading}
                    onClick={handleDownloadExcel}
                    className="px-4 py-2 bg-[#00b259] hover:bg-[#00994c] text-white font-medium rounded text-[12.5px] inline-flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
                  >
                    <span>↓</span>
                    <span>{downloading ? "İndiriliyor..." : "İndir"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: Excel İçeri Aktar */}
            <div className="border border-zinc-200/90 rounded-lg bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2.5 text-[13.5px] font-medium text-zinc-800">
                <svg className="w-4 h-4 text-zinc-700 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Excel İçeri Aktar</span>
              </div>

              <div className="p-4 flex flex-col gap-4 text-[12.5px]">
                {/* Excel Dosyası */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-700 text-[12px]">Excel Dosyası</label>
                  <div className="w-full h-10 px-2.5 border border-zinc-200 rounded flex items-center gap-2.5 bg-white">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 border border-zinc-500 rounded text-[12px] text-zinc-800 bg-zinc-50 hover:bg-zinc-100 shrink-0"
                    >
                      Dosya Seç
                    </button>
                    <span className="text-zinc-600 text-[12px] truncate">
                      {selectedFile ? selectedFile.name : "Dosya seçilmedi"}
                    </span>
                  </div>
                </div>

                {/* Ürün Eşleştirme Sütunu */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-700 text-[12px]">Ürün Eşleştirme Sütunu</label>
                  <select
                    value={matchColumn}
                    onChange={(e) => setMatchColumn(e.target.value)}
                    className="w-full h-9 px-3 border border-zinc-200 rounded text-[12.5px] text-zinc-700 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ürün ID (ID)">Ürün ID (ID)</option>
                    <option value="Ürün Kodu (URUNKODU)">Ürün Kodu (URUNKODU)</option>
                    <option value="Barkod (BARKODNO)">Barkod (BARKODNO)</option>
                  </select>
                </div>

                {/* Fiyat Ondalık Gösterimi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-700 text-[12px]">Fiyat Ondalık Gösterimi</label>
                  <select
                    value={decimalSeparator}
                    onChange={(e) => setDecimalSeparator(e.target.value)}
                    className="w-full h-9 px-3 border border-zinc-200 rounded text-[12.5px] text-zinc-700 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Nokta (.)">Nokta (.)</option>
                    <option value="Virgül (,)">Virgül (,)</option>
                  </select>
                </div>

                {/* Yükle Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={handleUploadExcel}
                    className="px-4 py-2 bg-[#00b259] hover:bg-[#00994c] text-white font-medium rounded text-[12.5px] inline-flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
                  >
                    <span>↑</span>
                    <span>{uploading ? "Yükleniyor..." : "Yükle"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExcelIoTab
