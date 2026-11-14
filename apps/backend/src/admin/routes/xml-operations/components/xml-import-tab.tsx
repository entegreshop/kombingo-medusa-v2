import React, { useState } from "react"
import { Container, Heading, Button, Tabs, Input, Select, Switch, Label, toast } from "@medusajs/ui"
import { Plus, DocumentText, CogSixTooth, CurrencyDollar, ArrowDownTray, ListBullet } from "@medusajs/icons"

const XmlImportTab = () => {
  const [activeTab, setActiveTab] = useState("bilgiler")
  const [isTagMappingOpen, setIsTagMappingOpen] = useState(false)
  const [isCategoryMappingOpen, setIsCategoryMappingOpen] = useState(false)
  const [tagOptions, setTagOptions] = useState<string[]>([])
  const [isRefreshingTags, setIsRefreshingTags] = useState(false)

  // Form State
  const [kaynakAdi, setKaynakAdi] = useState("BYM")
  const [dosyaLinki, setDosyaLinki] = useState("https://www.bymfashion.com/xml/?R=19701&K=3657&AltUrun=1&TamLink=1&Dislink=1&Seo=1&Imgs=1&start=0&limit=99999&pass=C96k4zm7")
  const [zamanlama, setZamanlama] = useState("Hiçbir Zaman")
  const [isSaving, setIsSaving] = useState(false)

  const handleRefreshTags = async () => {
    if (!dosyaLinki) {
      toast.error("Hata", { description: "Lütfen bir dosya linki girin." })
      return
    }
    setIsRefreshingTags(true)
    try {
      const response = await fetch("/admin/xml-sources/fetch-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: dosyaLinki })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.tags && data.tags.length > 0) {
          setTagOptions(data.tags)
          toast.success("Başarılı", { description: `${data.tags.length} adet etiket bulundu.` })
        } else {
          toast.warning("Uyarı", { description: "Etiket bulunamadı." })
        }
      } else {
        toast.error("Hata", { description: "Etiketler çekilemedi." })
      }
    } catch (e) {
      toast.error("Hata", { description: "Bağlantı hatası." })
    } finally {
      setIsRefreshingTags(false)
    }
  }

  // Mapping State
  const [mappedTags, setMappedTags] = useState<Record<string, string>>({
    "Ürün Kodu": "productCode", "Barkod": "barcode", "Ürün Adı": "name", 
    "Marka": "brand", "Ana Kategori": "category", "Üst Kategori": "top_category", 
    "Kategori": "sub_category", "Piyasa Fiyatı": "listPrice", "KDV": "tax", 
    "Satış Fiyatı": "price", "Alış Fiyatı": "price", "Para Birimi": "currency", 
    "Desi": "desi", "Stok": "stockAmount", "Ana Resim": "image1",
    "İçerik": "description", "1. Ürün Varyant Başlığı": "variant_name",
    "Ürün Varyant Stoğu": "variant_stock", "Ürün Varyant Barkodu": "variant_barcode",
    "Ürün Varyant Fiyatı": "price", "Ürün Varyant Görseli": "image1"
  })
  
  // Category State
  const [xmlCategories, setXmlCategories] = useState<{ src: string, dst: string, marginAmt: string, marginPct: string, active: boolean }[]>([
    { src: "ALT GİYİM > Etek", dst: "", marginAmt: "0", marginPct: "0", active: true }
  ])
  const [medusaCategories, setMedusaCategories] = useState<{id: string, name: string}[]>([])
  const [isRefreshingCats, setIsRefreshingCats] = useState(false)

  React.useEffect(() => {
    fetch("/admin/product-categories?limit=500")
      .then(res => res.json())
      .then(data => {
        if (data.product_categories) setMedusaCategories(data.product_categories)
      })
      .catch(console.error)
  }, [])

  const handleRefreshCategories = async () => {
    if (!dosyaLinki) {
      toast.error("Hata", { description: "Lütfen bir dosya linki girin." })
      return
    }
    setIsRefreshingCats(true)
    try {
      const response = await fetch("/admin/xml-sources/fetch-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: dosyaLinki })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.categories && data.categories.length > 0) {
          const newCats = data.categories.map((c: string) => ({
             src: c, dst: "", marginAmt: "0", marginPct: "0", active: true
          }))
          setXmlCategories(newCats)
          toast.success("Başarılı", { description: `${data.categories.length} adet kategori bulundu.` })
        } else {
          toast.warning("Uyarı", { description: "Kategori bulunamadı." })
        }
      } else {
        toast.error("Hata", { description: "Kategoriler çekilemedi." })
      }
    } catch (e) {
      toast.error("Hata", { description: "Bağlantı hatası." })
    } finally {
      setIsRefreshingCats(false)
    }
  }

  const [isImporting, setIsImporting] = useState(false)

  const handleImportProducts = async () => {
    setIsImporting(true)
    toast.info("İçe Aktarma Başladı", { description: "Ürünler arka planda aktarılıyor. Bu işlem birkaç dakika sürebilir." })
    try {
      const response = await fetch("/admin/xml-sources/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: dosyaLinki, tag_mappings: mappedTags })
      })
      if (response.ok) {
        const data = await response.json()
        toast.success("Başarılı", { description: `${data.importedCount || 0} ürün işlendi.` })
      } else {
        const err = await response.json()
        toast.error("Hata", { description: err.message || "Bilinmeyen hata" })
      }
    } catch (e) {
      toast.error("Hata", { description: "Sunucuya bağlanılamadı." })
    } finally {
      setIsImporting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        name: kaynakAdi,
        url: dosyaLinki,
        schedule: zamanlama,
        tag_mappings: mappedTags,
        category_mappings: xmlCategories
      }
      const response = await fetch("/admin/xml-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success("XML Kaynağı Başarıyla Kaydedildi", {
          description: `${kaynakAdi} yapılandırması veritabanına eklendi.`,
        })
      } else {
        const err = await response.json()
        toast.error("Hata", { description: err.message || "Bilinmeyen hata" })
      }
    } catch (e) {
      toast.error("Hata", { description: "Sunucuya bağlanılamadı." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="p-6 bg-white min-h-[600px] border border-zinc-200 shadow-sm rounded-lg flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-4 border-b border-zinc-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-zinc-800">XML İçeri Aktar</h2>
            <p className="text-sm text-zinc-500 mt-1">Yeni XML Kaynağı</p>
          </div>
        </div>

        {/* Custom Header Tabs */}
        <div className="flex gap-x-2 mt-2">
          <button 
            onClick={() => setActiveTab("bilgiler")}
            className={`flex items-center gap-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'bilgiler' ? 'bg-zinc-100 text-blue-600' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            <CogSixTooth /> Bilgiler
          </button>
          <button 
            onClick={() => setActiveTab("ayarlar")}
            className={`flex items-center gap-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'ayarlar' ? 'bg-zinc-100 text-blue-600' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            <ListBullet /> Ayarlar
          </button>
          <button 
            onClick={() => setActiveTab("eslestirme")}
            className={`flex items-center gap-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'eslestirme' ? 'bg-zinc-100 text-blue-600' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            <DocumentText /> Eşleştirme
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1">
        {activeTab === "bilgiler" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Kaynak Adı <span className="text-red-500">*</span></Label>
              <Input 
                value={kaynakAdi}
                onChange={(e) => setKaynakAdi(e.target.value)}
                placeholder="BYM TEKSTİL" 
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Kaynak Kısa Adı</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Dosya Tipi</Label>
              <Select defaultValue="dosya_linki">
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="dosya_linki">Dosya Linki</Select.Item>
                  <Select.Item value="dosya_yukle">Dosya Yükle</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Dosya Linki <span className="text-red-500">*</span></Label>
              <Input 
                value={dosyaLinki}
                onChange={(e) => setDosyaLinki(e.target.value)}
                placeholder="https://www.ornek.com/xml" 
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Zamanlama <span className="text-red-500">*</span></Label>
              <Select value={zamanlama} onValueChange={setZamanlama}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="Hiçbir Zaman">Hiçbir Zaman</Select.Item>
                  <Select.Item value="Saatte bir">Saatte bir</Select.Item>
                  <Select.Item value="Günde bir">Günde bir</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Ürün Kodu Ön Eki</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Ürün Barkodu Ön Eki</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">Resim CDN Linki</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">XML Ana Etiketi</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">XML Ürünler Etiketi</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label className="text-zinc-600 text-xs">XML Ürün Etiketi</Label>
              <Input />
            </div>
          </div>
        )}

        {activeTab === "ayarlar" && (
          <div className="flex flex-col gap-y-6">
            
            {/* Section 1 */}
            <div className="flex flex-col gap-y-4">
              <div className="bg-zinc-100/80 p-2 border-l-4 border-zinc-300 rounded-r text-sm font-semibold text-zinc-700">Varsayılan ürün ayarları</div>
              <div className="grid grid-cols-3 gap-6 px-2">
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ortak Ürün Kodları <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Satış Fiyatlarına KDV ekle <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Özel Karakterleri HTML'e Çevir <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Varyantlarda Özel Karakterleri Düzelt <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Varyant Stoklarını Ana Stokla Eşitle <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ürünler Her Zaman Aktif Edilsin <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Kargo Ödemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="alici_oder"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="alici_oder">Alıcı Öder</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Kapıda Ödeme <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col gap-y-4">
              <div className="bg-zinc-100/80 p-2 border-l-4 border-zinc-300 rounded-r text-sm font-semibold text-zinc-700">Aşağıdaki ayarlar sadece yeni ürün eklenirken geçerlidir</div>
              <div className="grid grid-cols-3 gap-6 px-2">
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ürünleri Pasif Olarak Ekle <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Resimsiz Ürünleri Pasif Olarak Ekle</Label>
                  <div><Switch checked={true} /></div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-y-4">
              <div className="bg-zinc-100/80 p-2 border-l-4 border-zinc-300 rounded-r text-sm font-semibold text-zinc-700">Aşağıdaki ayarlar sadece ürün güncellenirken geçerlidir</div>
              <div className="grid grid-cols-3 gap-6 px-2">
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Meta Bilgileri Güncellemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <div><Switch checked={true} /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Stok Güncellemesi</Label>
                  <div><Switch checked={true} /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Fiyat Güncellemesi</Label>
                  <div><Switch checked={true} /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Kategori Güncellemesi</Label>
                  <div><Switch checked={true} /></div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Resim Güncellemesi</Label>
                  <div><Switch checked={true} /></div>
                </div>
                <div className="col-span-3"></div> {/* spacer */}
                
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ürün Adı Güncellemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Nitelik Güncellemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Varyant Güncellemesi</Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ürün Durum Güncellemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Barkod Güncellemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ürün Açıklaması Güncellemesi <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="aktif"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="aktif">Aktif</Select.Item></Select.Content></Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs flex items-center gap-x-1">XML'den Silinen Ürünler <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="sifirla"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="sifirla">Stoğunu Sıfırla</Select.Item></Select.Content></Select>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="flex flex-col gap-y-4">
              <div className="bg-zinc-100/80 p-2 border-l-4 border-zinc-300 rounded-r text-sm font-semibold text-zinc-700">Ürünlere özel alan eklemek için aşağıdaki alanı kullanabilirsiniz</div>
              <div className="px-2">
                <Input />
              </div>
            </div>

            {/* Section 5 */}
            <div className="flex flex-col gap-y-4">
              <div className="bg-zinc-100/80 p-2 border-l-4 border-zinc-300 rounded-r text-sm font-semibold text-zinc-700">Ürünlere etiket eklemek için aşağıdaki alanı kullanabilirsiniz</div>
              <div className="flex flex-col gap-y-2 px-2">
                <Label className="text-zinc-600 text-xs flex items-center gap-x-1">Ürün Etiketleri</Label>
                <Select defaultValue="secilmedi"><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="secilmedi">Etiket Seçilmedi</Select.Item></Select.Content></Select>
              </div>
            </div>

          </div>
        )}

        {activeTab === "eslestirme" && (
          <div className="flex flex-col gap-y-6">
            <div className="bg-zinc-50 border border-zinc-200 text-zinc-700 p-4 rounded text-sm mb-2 shadow-sm">
              <p className="font-semibold mb-2">Ürünlerin aktarımı için aşağıdaki işlemlerin sırasıyla geçerli/doğru bir şekilde tamamlanması gerekmektedir.</p>
              <p className="text-blue-600 font-medium">Kaynak etiketlerindeki "Marka", "Ana Kategori", "Üst Kategori", "Kategori" alanında değişiklikler yapıldığında "Kategori Filtreleme / Eşleştirme" ve "Marka Filtreleme" alanlarında "Yenileme" işlemi yapılması gerekir. Aksi halde stoklarınız sıfırlanabilir.</p>
            </div>

            {/* Step 1 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-lg">1</div>
                <h3 className="text-lg font-semibold text-zinc-800">Kaynak Etiketleri Eşleştirme</h3>
              </div>
              <div className="ml-14 mt-1">
                <Button 
                  onClick={() => setIsTagMappingOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-sm"
                >
                  İşlemi Tamamla
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">2</div>
                <h3 className="text-lg font-semibold text-zinc-800">Kategori Filtreleme / Eşleştirme</h3>
              </div>
              <div className="ml-14 mt-1">
                <Button 
                  onClick={() => setIsCategoryMappingOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
                >
                  İşlemi Tamamla
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col gap-y-4 opacity-80">
              <div className="flex items-center gap-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="text-lg font-semibold text-zinc-800">Marka Filtreleme</h3>
              </div>
              <div className="ml-14 mt-1">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm">İşlemi Tamamla</Button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col gap-y-4 opacity-80">
              <div className="flex items-center gap-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">4</div>
                <h3 className="text-lg font-semibold text-zinc-800">Ürün Filtreleme</h3>
              </div>
              <div className="ml-14 mt-1">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm">İşlemi Tamamla</Button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer / Actions */}
      <div className="mt-auto border-t border-zinc-200 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          <div className="text-sm font-semibold text-zinc-700 bg-zinc-100 py-2 px-3 rounded border border-zinc-200">İşlemler *</div>
          <Button 
            onClick={handleImportProducts}
            isLoading={isImporting}
            className="bg-[#a855f7] hover:bg-[#9333ea] text-white border-0 flex items-center gap-x-2 px-6"
          >
            ▶ Ürünleri Aktar
          </Button>
          <div className="flex flex-col text-[11px]">
            <span className="text-emerald-500 font-bold">Ürünler Aktarıldı</span>
            <span className="text-emerald-600 font-semibold">Son İşlem tarihi: 25.06.2026 19:56</span>
          </div>
        </div>
        <Button 
          className="bg-[#10b981] hover:bg-[#059669] text-white border-0 px-8 flex items-center gap-x-2"
          onClick={handleSave}
          isLoading={isSaving}
        >
          ✔ Kaydet
        </Button>
      </div>

      {/* MODALS */}
      {isTagMappingOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0066cc] p-4 flex justify-between items-start text-white">
              <div>
                <p className="text-sm font-semibold mb-1">1 Nolu XML Kaynağı</p>
                <h2 className="text-xl font-bold">Kaynak Etiketleri Eşleştirme</h2>
              </div>
              <button onClick={() => setIsTagMappingOpen(false)} className="text-white hover:text-zinc-200">
                <span className="text-2xl font-bold">×</span>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="bg-zinc-50 p-4 rounded mb-6 text-sm font-semibold text-zinc-700">
                Aşağıdaki alandan kaynak dosyanızın etiketlerini eşleştirebilirsiniz.
              </div>
              
              <div className="flex justify-between items-center mb-4 text-sm text-zinc-600">
                <div className="flex items-center gap-x-2">
                  <span>Sayfada</span>
                  <Input defaultValue="100" className="w-16 text-center h-8" />
                  <span>kayıt göster</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <span>Ara:</span>
                  <Input className="w-48 h-8" />
                </div>
              </div>

              <div className="border border-zinc-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-600 w-16">Sıra ↑↓</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-600 w-1/3">Ürün Değeri ↑↓</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-600">Etiket Değeri ↑↓</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      { id: 1, name: "Ürün Kodu", val: "productCode" },
                      { id: 2, name: "Barkod", val: "barcode" },
                      { id: 3, name: "Ürün Adı", val: "name" },
                      { id: 4, name: "Marka", val: "brand" },
                      { id: 5, name: "Ana Kategori", val: "category" },
                      { id: 6, name: "Üst Kategori", val: "top_category" },
                      { id: 7, name: "Kategori", val: "sub_category" },
                      { id: 8, name: "Piyasa Fiyatı", val: "listPrice" },
                      { id: 9, name: "KDV", val: "tax" },
                      { id: 10, name: "Satış Fiyatı", val: "price" },
                      { id: 11, name: "Alış Fiyatı", val: "price" },
                      { id: 12, name: "Para Birimi", val: "currency" },
                      { id: 13, name: "Desi", val: "desi" },
                      { id: 14, name: "Stok", val: "stockAmount" },
                      { id: 15, name: "Ana Resim", val: "image1" },
                      { id: 16, name: "Resim 2", val: "image2" },
                      { id: 17, name: "Resim 3", val: "image3" },
                      { id: 18, name: "Resim 4", val: "image4" },
                      { id: 19, name: "Resim 5", val: "image5" },
                      { id: 20, name: "Resim 6", val: "image6" },
                      { id: 21, name: "Resim 7", val: "image7" },
                      { id: 22, name: "Resim 8", val: "image8" },
                      { id: 23, name: "Resim 9", val: "secin" },
                      { id: 24, name: "Resim 10", val: "secin" },
                      { id: 25, name: "Resim 11", val: "secin" },
                      { id: 26, name: "Resim 12", val: "secin" },
                      { id: 27, name: "Resim 13", val: "secin" },
                      { id: 28, name: "Resim 14", val: "secin" },
                      { id: 29, name: "Resim 15", val: "secin" },
                      { id: 30, name: "Resim 16", val: "secin" },
                      { id: 31, name: "Birim Birimi", val: "unit" },
                      { id: 32, name: "Kısa Detay", val: "secin" },
                      { id: 33, name: "İçerik", val: "description" },
                      { id: 34, name: "Nitelik Başlığı", val: "secin" },
                      { id: 35, name: "Nitelik Değeri", val: "secin" },
                      { id: 36, name: "1. Ürün Varyant Başlığı", val: "variant_name" },
                      { id: 37, name: "1. Ürün Varyant Değeri", val: "secin" },
                      { id: 38, name: "Ürün Varyant Stoğu", val: "variant_stock" },
                      { id: 39, name: "Ürün Varyant Barkodu", val: "variant_barcode" },
                      { id: 40, name: "Ürün Varyant Fiyatı", val: "price" },
                      { id: 41, name: "Ürün Varyant Görseli", val: "image1" },
                      { id: 42, name: "Bayi Fiyatı 1", val: "secin" },
                      { id: 43, name: "Bayi Fiyatı 2", val: "secin" },
                      { id: 44, name: "Bayi Fiyatı 3", val: "secin" },
                      { id: 45, name: "Bayi Fiyatı 4", val: "secin" },
                      { id: 46, name: "Ürün URL", val: "secin" },
                      { id: 47, name: "SEO Başlığı", val: "name" },
                      { id: 48, name: "SEO Açıklaması", val: "description" },
                      { id: 49, name: "SEO Anahtar Kelimesi", val: "name" },
                      { id: 50, name: "Model Kodu", val: "productCode" },
                      { id: 51, name: "Garanti Süresi", val: "secin" },
                      { id: 52, name: "Menşei", val: "secin" }
                    ].map((row) => {
                      const currentVal = mappedTags[row.name] || row.val;
                      return (
                      <tr key={row.id}>
                        <td className="px-4 py-2 text-zinc-500">{row.id}</td>
                        <td className="px-4 py-2 text-zinc-700">{row.name}</td>
                        <td className="px-4 py-1">
                          <Select 
                            value={currentVal} 
                            onValueChange={(val) => setMappedTags(prev => ({ ...prev, [row.name]: val }))}
                          >
                            <Select.Trigger className="h-8 text-xs"><Select.Value /></Select.Trigger>
                            <Select.Content>
                              <Select.Item value="secin">Seçin</Select.Item>
                              {tagOptions.map(tag => (
                                <Select.Item key={tag} value={tag}>{tag}</Select.Item>
                              ))}
                              {currentVal !== 'secin' && !tagOptions.includes(currentVal) && (
                                <Select.Item value={currentVal}>{currentVal}</Select.Item>
                              )}
                            </Select.Content>
                          </Select>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center text-xs text-zinc-500 font-medium">
                <span>52 kayıttan 1 ile 52 arası gösteriliyor</span>
                <div className="flex items-center gap-x-1">
                  <button className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-400 cursor-not-allowed">Önceki</button>
                  <button className="px-3 py-1.5 bg-blue-500 text-white rounded">1</button>
                  <button className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-400 cursor-not-allowed">Sonraki</button>
                </div>
              </div>

            </div>
            {/* Modal Footer */}
            <div className="bg-zinc-100 p-4 border-t border-zinc-200 flex justify-between items-center rounded-b-lg">
              <Button 
                onClick={handleRefreshTags}
                isLoading={isRefreshingTags}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 flex items-center gap-x-2"
              >
                <ArrowDownTray className="w-4 h-4" /> Etiketleri Yenile
              </Button>
              <Button onClick={() => setIsTagMappingOpen(false)} className="bg-[#10b981] hover:bg-[#059669] text-white border-0">
                ✔ Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCategoryMappingOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-[#0066cc] p-4 flex justify-between items-start text-white">
              <div>
                <p className="text-sm font-semibold mb-1">1 Nolu XML Kaynağı</p>
                <h2 className="text-xl font-bold">Kategori Filtreleme / Eşleştirme</h2>
              </div>
              <button onClick={() => setIsCategoryMappingOpen(false)} className="text-white hover:text-zinc-200">
                <span className="text-2xl font-bold">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="bg-blue-50/50 text-zinc-700 border border-zinc-200 p-4 rounded mb-6 text-sm">
                Aşağıdaki alandan kaynak dosyanızın kategorilerini filtreleyebilir ve eşleştirebilirsiniz. Kategori bazlı kar oranları, kaynak kar oranları ve marka kar oranlarından önce satış fiyatına uygulanmaktadır.
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs">Kategori Eşleştirme Tipi * <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Select defaultValue="site">
                    <Select.Trigger className="h-9"><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="site">Sitedeki kategoriler ile eşleştir</Select.Item>
                      <Select.Item value="kaynak">Kategorileri kaynaktan aktar</Select.Item>
                      <Select.Item value="aktarilmasin">Kategoriler aktarılmasın</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label className="text-zinc-600 text-xs">Kategori Ayrıştırma <span className="text-zinc-400 cursor-help border border-zinc-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px]">?</span></Label>
                  <Input className="h-9" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4 text-sm text-zinc-600">
                <div className="flex items-center gap-x-2">
                  <span>Sayfada</span>
                  <Input defaultValue="10" className="w-16 text-center h-8" />
                  <span>kayıt göster</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <span>Ara:</span>
                  <Input className="w-48 h-8" />
                </div>
              </div>

              <div className="border border-zinc-200 rounded overflow-hidden mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-600 w-1/4">Kaynak Kategorisi ↑↓</th>
                      <th className="px-4 py-3 text-left font-semibold text-zinc-600 w-1/3">Sitedeki Kategori ↑↓</th>
                      <th className="px-4 py-3 text-center font-semibold text-zinc-600 w-20">Kar Tutarı (TRY) ↑↓</th>
                      <th className="px-4 py-3 text-center font-semibold text-zinc-600 w-20">Kar Oranı (%) ↑↓</th>
                      <th className="px-4 py-3 text-center font-semibold text-zinc-600 w-20">Durum ↑↓</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {xmlCategories.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-zinc-700 text-[11px] leading-relaxed">{row.src}</td>
                        <td className="px-4 py-2">
                          <Input 
                            list="medusa-categories" 
                            value={row.dst} 
                            onChange={(e) => {
                               const newCats = [...xmlCategories];
                               newCats[idx].dst = e.target.value;
                               setXmlCategories(newCats);
                            }}
                            className="bg-zinc-50 h-8 text-xs text-zinc-600" 
                          />
                        </td>
                        <td className="px-4 py-2 text-center"><Input defaultValue={row.marginAmt} className="text-center h-8" /></td>
                        <td className="px-4 py-2 text-center"><Input defaultValue={row.marginPct} className="text-center h-8" /></td>
                        <td className="px-4 py-2 flex justify-center">
                          <Switch 
                            checked={row.active} 
                            onCheckedChange={(val) => {
                               const newCats = [...xmlCategories];
                               newCats[idx].active = val;
                               setXmlCategories(newCats);
                            }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <datalist id="medusa-categories">
                  {medusaCategories.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-zinc-500 font-medium">
                <span>16 kayıttan 11 ile 16 arası gösteriliyor</span>
                <div className="flex items-center gap-x-1">
                  <button className="px-3 py-1.5 border border-zinc-200 rounded text-blue-500 hover:bg-zinc-50">Önceki</button>
                  <button className="px-3 py-1.5 border border-zinc-200 rounded text-blue-500 hover:bg-zinc-50">1</button>
                  <button className="px-3 py-1.5 bg-blue-500 text-white rounded">2</button>
                  <button className="px-3 py-1.5 border border-zinc-200 rounded text-zinc-400 cursor-not-allowed">Sonraki</button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-x-2">
                <input type="checkbox" id="autoAdd" className="w-4 h-4 rounded border-zinc-300 text-blue-600" />
                <label htmlFor="autoAdd" className="text-xs text-zinc-600">XML kaynağına yeni eklenen ve eşleştirme bulunmayan kategorilere ait ürünleri otomatik ekle</label>
              </div>

            </div>
            {/* Modal Footer */}
            <div className="bg-zinc-100 p-4 border-t border-zinc-200 flex justify-between items-center rounded-b-lg">
              <div className="flex gap-x-2">
                <Button 
                  onClick={handleRefreshCategories}
                  isLoading={isRefreshingCats}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 flex items-center gap-x-2"
                >
                  <ArrowDownTray className="w-4 h-4" /> Kategorileri Yenile
                </Button>
                <Button 
                  onClick={() => {
                    const newCats = xmlCategories.map(c => ({...c, active: true}))
                    setXmlCategories(newCats)
                  }}
                  variant="secondary" className="bg-white text-zinc-700 border-zinc-300"
                >
                  <span className="text-[#10b981] font-bold mr-1">✔</span> Tümünü Aktif Yap
                </Button>
                <Button 
                  onClick={() => {
                    const newCats = xmlCategories.map(c => ({...c, active: false}))
                    setXmlCategories(newCats)
                  }}
                  variant="secondary" className="bg-white text-zinc-700 border-zinc-300"
                >
                  <span className="text-red-500 font-bold mr-1">✖</span> Tümünü Pasif Yap
                </Button>
              </div>
              <Button onClick={() => setIsCategoryMappingOpen(false)} className="bg-[#10b981] hover:bg-[#059669] text-white border-0 px-6">
                ✔ Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

    </Container>
  )
}

export default XmlImportTab
