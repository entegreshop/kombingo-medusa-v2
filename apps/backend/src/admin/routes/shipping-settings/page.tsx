import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { CARGO_ITEMS_META, CARGO_LOGO_SVGS } from "../payment-settings/pos-cargo-logos"

// ─── Types matching /admin/shipping-settings/route.ts ─────────────────────────

interface ShippingRegion {
  id: string
  countryCode: string
  countryName: string
  name: string
  cities: string[]
}

interface CarrierGeneralInfo {
  name: string
  active: boolean
  description: string
  sortOrder: number
  taxNumber: string
  customerType: string
  companyCode: string
  logoUrl?: string
  customDeliveryTime: boolean
  limitCartTotal: boolean
  limitVolumetricWeight: boolean
  limitProductQuantity: boolean
}

interface CarrierApiSettings {
  apiActive: boolean
  autoGenerateBarcode: boolean
  generateBarcodeForNonCarrier: boolean
  markAsShippedOnBranchReceive: boolean
  barcodeGenerationStage: string
  sendFixedVolumetricWeight: boolean
  apiAuthorization: string
  apiFrom: string
  branchName: string
}

interface CarrierItem {
  id: string
  key: string
  general: CarrierGeneralInfo
  api: CarrierApiSettings
  regions: {
    deliveryType: "all" | "selected"
    countries: Array<{
      countryCode: string
      countryName: string
      regions: string[]
    }>
  }
}

interface GeneralShippingFeeItem {
  id: string
  name: string
  min_order_total: number
  max_order_total: number
  price: number
  currency: string
}

interface ProductSpecificFeeItem {
  id: string
  title: string
  sku_or_category: string
  extra_fee: number
  currency: string
}

interface ShippingConfig {
  systemType: "advanced" | "simple"
  standardShippingEnabled: boolean
  standardShippingFee: number
  standardShippingCurrency: string
  standardShippingCartType: string
  freeShippingEnabled: boolean
  freeShippingThreshold: number
  freeShippingCurrency: string
  regions: ShippingRegion[]
  carriers: CarrierItem[]
  generalShippingFees: GeneralShippingFeeItem[]
  productSpecificFees: ProductSpecificFeeItem[]
}

const DEFAULT_CARGO_ROWS = [
  { key: "yurtici", id: "9", name: "Yurtiçi Kargo", active: true, code: "1191", sortOrder: 0 },
  { key: "aras", id: "8", name: "ARAS KARGO", active: false, code: "1192", sortOrder: 0 },
  { key: "kargoist", id: "7", name: "KARGOİST", active: false, code: "1193", sortOrder: 0 },
  { key: "ptt", id: "6", name: "PTT Kargo", active: false, code: "1194", sortOrder: 0 },
  { key: "mng", id: "5", name: "MNG Kargo", active: false, code: "1195", sortOrder: 0 },
  { key: "surat", id: "4", name: "Sürat Kargo", active: false, code: "1196", sortOrder: 0 },
]

function buildDefaultCarriers(): CarrierItem[] {
  return DEFAULT_CARGO_ROWS.map((row) => ({
    id: `carrier_${row.key}`,
    key: row.key,
    general: {
      name: row.name,
      active: row.active,
      description: "",
      sortOrder: row.sortOrder,
      taxNumber: "",
      customerType: "Hepsi",
      companyCode: row.code,
      logoUrl: "",
      customDeliveryTime: false,
      limitCartTotal: false,
      limitVolumetricWeight: false,
      limitProductQuantity: false,
    },
    api: {
      apiActive: false,
      autoGenerateBarcode: true,
      generateBarcodeForNonCarrier: false,
      markAsShippedOnBranchReceive: true,
      barcodeGenerationStage: "Yeni Sipariş",
      sendFixedVolumetricWeight: false,
      apiAuthorization: "",
      apiFrom: "",
      branchName: "",
    },
    regions: {
      deliveryType: "all",
      countries: [],
    },
  }))
}

const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  systemType: "advanced",
  standardShippingEnabled: true,
  standardShippingFee: 100,
  standardShippingCurrency: "TL",
  standardShippingCartType: "Tüm sepetlere ekle",
  freeShippingEnabled: true,
  freeShippingThreshold: 1000,
  freeShippingCurrency: "TL",
  regions: [
    {
      id: "reg_tr",
      countryCode: "tr",
      countryName: "Türkiye",
      name: "Asya",
      cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],
    },
  ],
  carriers: buildDefaultCarriers(),
  generalShippingFees: [],
  productSpecificFees: [],
}

// ─── Component ────────────────────────────────────────────────────────────────

const ShippingSettingsPage = () => {
  const [config, setConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargo Company Modal (Matches #cargo-company-modal in preview)
  const [cargoModalOpen, setCargoModalOpen] = useState(false)
  const [cargoModalTab, setCargoModalTab] = useState<
    "genel" | "api" | "bolgeler" | "saatler"
  >("genel")
  const [editingCargoKey, setEditingCargoKey] = useState<string>("yurtici")
  const [cargoModalForm, setCargoModalForm] = useState<{
    id: string
    key: string
    name: string
    active: boolean
    description: string
    sortOrder: number
    taxNumber: string
    customerType: string
    companyCode: string
    useCustomLogo: boolean
    customDeliveryTime: boolean
    limitCartTotal: boolean
    apiAuthorization: string
    apiFrom: string
    branchName: string
    deliveryHours: string
  }>({
    id: "9",
    key: "yurtici",
    name: "Yurtiçi Kargo",
    active: true,
    description: "",
    sortOrder: 0,
    taxNumber: "",
    customerType: "Hepsi",
    companyCode: "1191",
    useCustomLogo: true,
    customDeliveryTime: false,
    limitCartTotal: false,
    apiAuthorization: "",
    apiFrom: "",
    branchName: "",
    deliveryHours: "09:00 - 18:00",
  })

  // Region & Cities Modals
  const [regionModalOpen, setRegionModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<ShippingRegion | null>(null)
  const [citiesModalRegion, setCitiesModalRegion] = useState<ShippingRegion | null>(null)
  const [citySearch, setCitySearch] = useState("")

  // General Rule & Product Rule Modals
  const [generalRuleModalOpen, setGeneralRuleModalOpen] = useState(false)
  const [editingGeneralRule, setEditingGeneralRule] =
    useState<GeneralShippingFeeItem | null>(null)
  const [productRuleModalOpen, setProductRuleModalOpen] = useState(false)
  const [editingProductRule, setEditingProductRule] =
    useState<ProductSpecificFeeItem | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/shipping-settings", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const raw = data?.config || {}

      const existingMap = new Map<string, CarrierItem>()
      if (Array.isArray(raw.carriers)) {
        for (const c of raw.carriers) {
          const k = String(c.key || c.code || "").toLowerCase()
          if (k) {
            existingMap.set(k, {
              id: c.id || `carrier_${k}`,
              key: k,
              general: {
                name: c.general?.name || c.name || k.toUpperCase(),
                active: c.general?.active ?? c.active ?? false,
                description: c.general?.description || c.short_description || "",
                sortOrder: c.general?.sortOrder ?? c.sort_order ?? 0,
                taxNumber: c.general?.taxNumber || c.tax_number || "",
                customerType: c.general?.customerType || "Hepsi",
                companyCode: c.general?.companyCode || c.company_code || "",
                logoUrl: c.general?.logoUrl || "",
                customDeliveryTime: Boolean(c.general?.customDeliveryTime),
                limitCartTotal: Boolean(c.general?.limitCartTotal),
                limitVolumetricWeight: Boolean(c.general?.limitVolumetricWeight),
                limitProductQuantity: Boolean(c.general?.limitProductQuantity),
              },
              api: {
                apiActive: Boolean(c.api?.apiActive),
                autoGenerateBarcode: c.api?.autoGenerateBarcode ?? true,
                generateBarcodeForNonCarrier: Boolean(c.api?.generateBarcodeForNonCarrier),
                markAsShippedOnBranchReceive: c.api?.markAsShippedOnBranchReceive ?? true,
                barcodeGenerationStage: c.api?.barcodeGenerationStage || "Yeni Sipariş",
                sendFixedVolumetricWeight: Boolean(c.api?.sendFixedVolumetricWeight),
                apiAuthorization: c.api?.apiAuthorization || "",
                apiFrom: c.api?.apiFrom || "",
                branchName: c.api?.branchName || "",
              },
              regions: c.regions || { deliveryType: "all", countries: [] },
            })
          }
        }
      }

      const mergedCarriers: CarrierItem[] = DEFAULT_CARGO_ROWS.map((row) => {
        const found = existingMap.get(row.key)
        if (found) {
          return {
            ...found,
            general: {
              ...found.general,
              name: row.name,
              companyCode: found.general.companyCode || row.code,
            },
          }
        }
        return {
          id: `carrier_${row.key}`,
          key: row.key,
          general: {
            name: row.name,
            active: row.active,
            description: "",
            sortOrder: row.sortOrder,
            taxNumber: "",
            customerType: "Hepsi",
            companyCode: row.code,
            logoUrl: "",
            customDeliveryTime: false,
            limitCartTotal: false,
            limitVolumetricWeight: false,
            limitProductQuantity: false,
          },
          api: {
            apiActive: false,
            autoGenerateBarcode: true,
            generateBarcodeForNonCarrier: false,
            markAsShippedOnBranchReceive: true,
            barcodeGenerationStage: "Yeni Sipariş",
            sendFixedVolumetricWeight: false,
            apiAuthorization: "",
            apiFrom: "",
            branchName: "",
          },
          regions: { deliveryType: "all", countries: [] },
        }
      })

      const normalizedRegions: ShippingRegion[] =
        Array.isArray(raw.regions) && raw.regions.length > 0
          ? raw.regions.map((r: any) => ({
              id: r.id || "reg_tr",
              countryCode: String(r.countryCode || r.country_code || "tr").toLowerCase(),
              countryName: r.countryName || r.name || "Türkiye",
              name: r.name || r.continent || "Asya",
              cities: Array.isArray(r.cities)
                ? r.cities
                : ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],
            }))
          : DEFAULT_SHIPPING_CONFIG.regions

      setConfig({
        systemType: raw.systemType || raw.system_mode || "advanced",
        standardShippingEnabled:
          raw.standardShippingEnabled ?? raw.standard_fee_enabled ?? true,
        standardShippingFee: Number(
          raw.standardShippingFee ?? raw.standard_fee_amount ?? 100
        ),
        standardShippingCurrency: "TL",
        standardShippingCartType:
          raw.standardShippingCartType || "Tüm sepetlere ekle",
        freeShippingEnabled:
          raw.freeShippingEnabled ?? raw.free_shipping_enabled ?? true,
        freeShippingThreshold: Number(
          raw.freeShippingThreshold ?? raw.free_shipping_threshold ?? 1000
        ),
        freeShippingCurrency: "TL",
        regions: normalizedRegions,
        carriers: mergedCarriers,
        generalShippingFees: Array.isArray(raw.generalShippingFees)
          ? raw.generalShippingFees
          : [],
        productSpecificFees: Array.isArray(raw.productSpecificFees)
          ? raw.productSpecificFees
          : [],
      })
    } catch (err: any) {
      toast.error("Kargo ayarları yüklenemedi: " + (err?.message || "Bilinmeyen hata"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const saveConfigToServer = async (
    nextConfig: ShippingConfig,
    successMsg = "Kargo ve teslimat ayarları kaydedildi"
  ) => {
    const payloadToSave: ShippingConfig = {
      ...nextConfig,
      standardShippingCurrency: "TL",
      standardShippingFee: Math.max(0, Number(nextConfig.standardShippingFee) || 0),
    }

    setSaving(true)
    try {
      const res = await fetch("/admin/shipping-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadToSave),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `HTTP ${res.status}`)
      }
      toast.success(successMsg)
    } catch (err: any) {
      toast.error("Kaydetme hatası: " + (err?.message || "Bilinmeyen hata"))
    } finally {
      setSaving(false)
    }
  }

  const openCargoCompanyModal = (cargoKey: string) => {
    const meta = CARGO_ITEMS_META.find((m) => m.key === cargoKey) || {
      id: 9,
      key: cargoKey,
      name: "Yurtiçi Kargo",
      active: true,
      count: 0,
      code: "1191",
    }
    const carrier = config.carriers.find(
      (c) => c.key.toLowerCase() === cargoKey.toLowerCase()
    )

    setEditingCargoKey(cargoKey)
    setCargoModalTab("genel")
    setCargoModalForm({
      id: String(meta.id),
      key: cargoKey,
      name: carrier?.general.name || meta.name,
      active: carrier ? carrier.general.active : meta.active,
      description: carrier?.general.description || "",
      sortOrder: carrier?.general.sortOrder ?? 0,
      taxNumber: carrier?.general.taxNumber || "",
      customerType: carrier?.general.customerType || "Hepsi",
      companyCode: carrier?.general.companyCode || meta.code,
      useCustomLogo: true,
      customDeliveryTime: Boolean(carrier?.general.customDeliveryTime),
      limitCartTotal: Boolean(carrier?.general.limitCartTotal),
      apiAuthorization: carrier?.api.apiAuthorization || "",
      apiFrom: carrier?.api.apiFrom || "",
      branchName: carrier?.api.branchName || "",
      deliveryHours: "09:00 - 18:00",
    })
    setCargoModalOpen(true)
  }

  const handleSaveCargoModal = async () => {
    const exists = config.carriers.some(
      (c) => c.key.toLowerCase() === editingCargoKey.toLowerCase()
    )
    const updatedCarriers: CarrierItem[] = exists
      ? config.carriers.map((c) =>
          c.key.toLowerCase() !== editingCargoKey.toLowerCase()
            ? c
            : {
                ...c,
                general: {
                  ...c.general,
                  name: cargoModalForm.name,
                  active: cargoModalForm.active,
                  description: cargoModalForm.description,
                  sortOrder: Number(cargoModalForm.sortOrder) || 0,
                  taxNumber: cargoModalForm.taxNumber,
                  customerType: cargoModalForm.customerType,
                  companyCode: cargoModalForm.companyCode,
                  customDeliveryTime: cargoModalForm.customDeliveryTime,
                  limitCartTotal: cargoModalForm.limitCartTotal,
                },
                api: {
                  ...c.api,
                  apiAuthorization: cargoModalForm.apiAuthorization,
                  apiFrom: cargoModalForm.apiFrom,
                  branchName: cargoModalForm.branchName,
                },
              }
        )
      : [
          ...config.carriers,
          {
            id: `carrier_${Date.now()}`,
            key: editingCargoKey,
            general: {
              name: cargoModalForm.name,
              active: cargoModalForm.active,
              description: cargoModalForm.description,
              sortOrder: Number(cargoModalForm.sortOrder) || 0,
              taxNumber: cargoModalForm.taxNumber,
              customerType: cargoModalForm.customerType,
              companyCode: cargoModalForm.companyCode,
              logoUrl: "",
              customDeliveryTime: cargoModalForm.customDeliveryTime,
              limitCartTotal: cargoModalForm.limitCartTotal,
              limitVolumetricWeight: false,
              limitProductQuantity: false,
            },
            api: {
              apiActive: false,
              autoGenerateBarcode: true,
              generateBarcodeForNonCarrier: false,
              markAsShippedOnBranchReceive: true,
              barcodeGenerationStage: "Yeni Sipariş",
              sendFixedVolumetricWeight: false,
              apiAuthorization: cargoModalForm.apiAuthorization,
              apiFrom: cargoModalForm.apiFrom,
              branchName: cargoModalForm.branchName,
            },
            regions: { deliveryType: "all", countries: [] },
          },
        ]

    const nextConfig = {
      ...config,
      carriers: updatedCarriers,
    }
    setConfig(nextConfig)
    setCargoModalOpen(false)
    await saveConfigToServer(
      nextConfig,
      `${cargoModalForm.name} ayarları kaydedildi`
    )
  }

  const handleToggleCarrierQuick = async (cargoKey: string) => {
    const nextCarriers = config.carriers.map((c) =>
      c.key.toLowerCase() === cargoKey.toLowerCase()
        ? { ...c, general: { ...c.general, active: !c.general.active } }
        : c
    )
    const target = nextCarriers.find(
      (c) => c.key.toLowerCase() === cargoKey.toLowerCase()
    )
    const nextConfig = { ...config, carriers: nextCarriers }
    setConfig(nextConfig)
    await saveConfigToServer(
      nextConfig,
      `${target?.general.name || "Kargo firması"} durumu ${
        target?.general.active ? "Aktif" : "Pasif"
      } olarak güncellendi`
    )
  }

  const openAddRegionModal = () => {
    setEditingRegion({
      id: `reg_${Date.now()}`,
      countryCode: "eu",
      countryName: "",
      name: "Avrupa",
      cities: ["Merkez"],
    })
    setRegionModalOpen(true)
  }

  const saveRegionModal = async () => {
    if (!editingRegion) return
    if (!editingRegion.countryName.trim()) {
      toast.error("Ülke / Bölge adı zorunludur")
      return
    }
    const exists = config.regions.some((r) => r.id === editingRegion.id)
    const nextConfig = {
      ...config,
      regions: exists
        ? config.regions.map((r) => (r.id === editingRegion.id ? editingRegion : r))
        : [...config.regions, editingRegion],
    }
    setConfig(nextConfig)
    setRegionModalOpen(false)
    setEditingRegion(null)
    await saveConfigToServer(nextConfig, "Teslimat bölgesi kaydedildi")
  }

  const openAddGeneralRule = () => {
    setEditingGeneralRule({
      id: `grule_${Date.now()}`,
      name: "Standart Kargo Ücreti",
      min_order_total: 0,
      max_order_total: 1000,
      price: 100,
      currency: "TL",
    })
    setGeneralRuleModalOpen(true)
  }

  const saveGeneralRuleModal = async () => {
    if (!editingGeneralRule) return
    const exists = config.generalShippingFees.some(
      (r) => r.id === editingGeneralRule.id
    )
    const nextConfig = {
      ...config,
      generalShippingFees: exists
        ? config.generalShippingFees.map((r) =>
            r.id === editingGeneralRule.id ? editingGeneralRule : r
          )
        : [...config.generalShippingFees, editingGeneralRule],
    }
    setConfig(nextConfig)
    setGeneralRuleModalOpen(false)
    setEditingGeneralRule(null)
    await saveConfigToServer(nextConfig, "Genel kargo ücreti kaydedildi")
  }

  const openAddProductRule = () => {
    setEditingProductRule({
      id: `prule_${Date.now()}`,
      title: "Özel Koleksiyon Ek Kargo Ücreti",
      sku_or_category: "Mont & Kürk Koleksiyonu",
      extra_fee: 250,
      currency: "TL",
    })
    setProductRuleModalOpen(true)
  }

  const saveProductRuleModal = async () => {
    if (!editingProductRule) return
    const exists = config.productSpecificFees.some(
      (r) => r.id === editingProductRule.id
    )
    const nextConfig = {
      ...config,
      productSpecificFees: exists
        ? config.productSpecificFees.map((r) =>
            r.id === editingProductRule.id ? editingProductRule : r
          )
        : [...config.productSpecificFees, editingProductRule],
    }
    setConfig(nextConfig)
    setProductRuleModalOpen(false)
    setEditingProductRule(null)
    await saveConfigToServer(nextConfig, "Ürünlere özel kargo ücreti kaydedildi")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-12 text-[13px] text-[#64748b]">
        Kargo ve teslimat ayarları yükleniyor...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#1e293b] pb-16">
      {/* Main Content Container (max-w-[1040px] mx-auto px-4 py-7) */}
      <div className="max-w-[1040px] mx-auto px-4 py-7">
        {/* Top 2-Column Grid: Teslimat Bölgeleri & Kargo Firmaları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Left Card: Teslimat Bölgeleri */}
          <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#1e293b]">
                Teslimat Bölgeleri
              </h3>
              <button
                type="button"
                onClick={openAddRegionModal}
                className="h-[28px] px-3 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>+</span> Ekle
              </button>
            </div>
            <p className="text-[11.5px] text-[#64748b] leading-relaxed mb-5">
              Teslimat yapacağınız ülkeleri, şehirleri veya bölgeleri bu bölümden
              yönetebilirsiniz. Yeni bir bölge eklemek için &quot;Ekle&quot; butonuna
              tıklayınız.
            </p>

            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {config.regions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    {/* Turkish Flag SVG for TR, or badge for others */}
                    {region.countryCode?.toLowerCase() === "tr" ? (
                      <div
                        style={{
                          width: "34px",
                          height: "23px",
                          borderRadius: "3px",
                          overflow: "hidden",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          viewBox="0 0 36 24"
                          width="34"
                          height="23"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="36" height="24" fill="#E30A17" />
                          <circle cx="13.5" cy="12" r="6" fill="#ffffff" />
                          <circle cx="15" cy="12" r="4.8" fill="#E30A17" />
                          <polygon
                            points="21.5,12 17.9,13.2 19.3,9.8 19.3,14.2 17.9,10.8"
                            fill="#ffffff"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-[34px] h-[23px] rounded-[3px] bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-[#475569]">
                        {region.countryCode?.toUpperCase() || "TR"}
                      </div>
                    )}
                    <div>
                      <div className="text-[12.5px] font-bold text-[#1e293b]">
                        {region.countryName || "Türkiye"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                        <span>{region.name || "Asya"}</span>
                        <span className="px-1.5 py-0.2 bg-gray-100 rounded text-[10px] font-bold text-[#475569]">
                          1
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCitiesModalRegion(region)
                        setCitySearch("")
                      }}
                      className="h-[26px] px-2.5 rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] font-medium transition-colors"
                    >
                      İller
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRegion({ ...region })
                        setRegionModalOpen(true)
                      }}
                      className="w-[26px] h-[26px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px] transition-colors"
                    >
                      ✎
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Kargo Firmaları */}
          <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#1e293b]">
                Kargo Firmaları
              </h3>
              <button
                type="button"
                onClick={() => openCargoCompanyModal("yurtici")}
                className="h-[28px] px-3 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>+</span> Ekle
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {config.carriers.map((carrier) => {
                const cargoKey = carrier.key.toLowerCase()
                const logoHtml =
                  CARGO_LOGO_SVGS[cargoKey] || CARGO_LOGO_SVGS.yurtici

                return (
                  <div
                    key={carrier.id}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="shrink-0"
                        dangerouslySetInnerHTML={{ __html: logoHtml }}
                      />
                      <div>
                        <div className="text-[12.5px] font-bold text-[#1e293b]">
                          {carrier.general.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCarrierQuick(cargoKey)}
                            title="Durumu Değiştir"
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-opacity hover:opacity-85 ${
                              carrier.general.active
                                ? "bg-[#d1fae5] text-[#059669]"
                                : "bg-gray-100 text-[#64748b]"
                            }`}
                          >
                            {carrier.general.active ? "✓ Aktif" : "Pasif"}
                          </button>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[#64748b] text-[10px] font-bold">
                            {carrier.general.sortOrder ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCargoCompanyModal(cargoKey)}
                      className="w-[26px] h-[26px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px] transition-colors"
                      title="Kargo Firmasını Düzenle"
                    >
                      ✎
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Card: Kargo Sistemi */}
        <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs p-6">
          <h3 className="text-[15px] font-bold text-[#1e293b] mb-3">
            Kargo Sistemi
          </h3>
          <div className="flex items-center gap-5 mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-[#1e293b]">
              <input
                type="radio"
                name="kargo_sistem"
                checked={config.systemType === "advanced"}
                onChange={() => {
                  const next = { ...config, systemType: "advanced" as const }
                  setConfig(next)
                  saveConfigToServer(next, "Kargo sistemi Gelişmiş olarak güncellendi")
                }}
                className="w-4 h-4 text-[#0284c7] accent-[#0284c7]"
              />
              <span>Gelişmiş</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#475569]">
              <input
                type="radio"
                name="kargo_sistem"
                checked={config.systemType === "simple"}
                onChange={() => {
                  const next = { ...config, systemType: "simple" as const }
                  setConfig(next)
                  saveConfigToServer(next, "Kargo sistemi Basit olarak güncellendi")
                }}
                className="w-4 h-4 text-[#0284c7] accent-[#0284c7]"
              />
              <span>Basit</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Checkbox 1: Standart Kargo Ücreti */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#334155] mb-3">
                <input
                  type="checkbox"
                  checked={config.standardShippingEnabled}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      standardShippingEnabled: e.target.checked,
                    }
                    setConfig(next)
                    saveConfigToServer(next)
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                />
                <span>Tüm bölgeler için standart kargo ücreti belirle</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[680px]">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Kargo Ücreti
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={config.standardShippingFee}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          standardShippingFee: Number(e.target.value) || 0,
                        })
                      }
                      onBlur={() => saveConfigToServer(config)}
                      className="flex-1 h-[32px] px-3 rounded-l-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0284c7]"
                    />
                    <select
                      value={config.standardShippingCurrency}
                      onChange={(e) => {
                        const next = {
                          ...config,
                          standardShippingCurrency: e.target.value,
                        }
                        setConfig(next)
                        saveConfigToServer(next)
                      }}
                      className="h-[32px] px-2.5 rounded-r-[4px] border border-l-0 border-gray-300 bg-gray-50 text-[11.5px] font-semibold text-[#475569] focus:outline-none"
                    >
                      <option value="TL">TL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Sepet Tipi
                  </label>
                  <select
                    value={config.standardShippingCartType}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        standardShippingCartType: e.target.value,
                      }
                      setConfig(next)
                      saveConfigToServer(next)
                    }}
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 bg-white text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0284c7]"
                  >
                    <option value="Tüm sepetlere ekle">Tüm sepetlere ekle</option>
                    <option value="Sadece kargo ücreti olmayanlara ekle">
                      Sadece kargo ücreti olmayanlara ekle
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Checkbox 2: Ücretsiz Kargo Limiti */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#334155] mb-3">
                <input
                  type="checkbox"
                  checked={config.freeShippingEnabled}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      freeShippingEnabled: e.target.checked,
                    }
                    setConfig(next)
                    saveConfigToServer(next)
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                />
                <span>Tüm bölgeler için ücretsiz kargo limiti belirle</span>
              </label>
              <div className="max-w-[330px]">
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Sipariş tutarı ve üzeri
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={config.freeShippingThreshold}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        freeShippingThreshold: Number(e.target.value) || 0,
                      })
                    }
                    onBlur={() => saveConfigToServer(config)}
                    className="flex-1 h-[32px] px-3 rounded-l-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0284c7]"
                  />
                  <select
                    value={config.freeShippingCurrency}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        freeShippingCurrency: e.target.value,
                      }
                      setConfig(next)
                      saveConfigToServer(next)
                    }}
                    className="h-[32px] px-2.5 rounded-r-[4px] border border-l-0 border-gray-300 bg-gray-50 text-[11.5px] font-semibold text-[#475569] focus:outline-none"
                  >
                    <option value="TL">TL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Genel Kargo Ücretleri */}
            <div className="pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[13.5px] font-bold text-[#1e293b]">
                  Genel Kargo Ücretleri
                </h4>
                <button
                  type="button"
                  onClick={openAddGeneralRule}
                  className="h-[26px] px-2.5 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>+</span> Ekle
                </button>
              </div>
              <p className="text-[11.5px] text-[#64748b] mb-3">
                Sipariş tutarlarına veya desilere göre kargo ücreti
                belirleyebilirsiniz. Yeni bir kargo ücreti eklemek için &quot;Ekle&quot;
                butonuna tıklayınız.
              </p>

              {config.generalShippingFees.length === 0 ? (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] py-3 px-4 text-center text-[11.5px] text-[#64748b]">
                  Genel kargo ücreti bulunmamaktadır.
                </div>
              ) : (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] divide-y divide-gray-200/60">
                  {config.generalShippingFees.map((rule) => (
                    <div
                      key={rule.id}
                      className="py-2.5 px-4 flex items-center justify-between text-[12px]"
                    >
                      <div>
                        <span className="font-bold text-[#1e293b]">
                          {rule.name}
                        </span>
                        <span className="text-[#64748b] ml-2 text-[11px]">
                          ({rule.min_order_total} - {rule.max_order_total} TL •{" "}
                          {rule.price} {rule.currency})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGeneralRule({ ...rule })
                            setGeneralRuleModalOpen(true)
                          }}
                          className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px]"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = {
                              ...config,
                              generalShippingFees: config.generalShippingFees.filter(
                                (r) => r.id !== rule.id
                              ),
                            }
                            setConfig(next)
                            saveConfigToServer(next, "Kargo ücreti silindi")
                          }}
                          className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-red-50 text-[#ef4444] flex items-center justify-center text-[11px]"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ürünlere Özel Ücretler */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[13.5px] font-bold text-[#1e293b]">
                  Ürünlere Özel Ücretler
                </h4>
                <button
                  type="button"
                  onClick={openAddProductRule}
                  className="h-[26px] px-2.5 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>+</span> Ekle
                </button>
              </div>
              <p className="text-[11.5px] text-[#64748b] mb-3">
                Ürünlere özel kargo ücreti veya ücretsiz kargo tanımlaması
                yapabilirsiniz. Yeni bir kargo ücreti eklemek için &quot;Ekle&quot;
                butonuna tıklayınız.
              </p>

              {config.productSpecificFees.length === 0 ? (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] py-3 px-4 text-center text-[11.5px] text-[#64748b]">
                  Ürünlere özel kargo ücreti bulunmamaktadır.
                </div>
              ) : (
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-[4px] divide-y divide-gray-200/60">
                  {config.productSpecificFees.map((prule) => (
                    <div
                      key={prule.id}
                      className="py-2.5 px-4 flex items-center justify-between text-[12px]"
                    >
                      <div>
                        <span className="font-bold text-[#1e293b]">
                          {prule.title}
                        </span>
                        <span className="text-[#64748b] ml-2 text-[11px]">
                          ({prule.sku_or_category} • +{prule.extra_fee}{" "}
                          {prule.currency})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductRule({ ...prule })
                            setProductRuleModalOpen(true)
                          }}
                          className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] flex items-center justify-center text-[11px]"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = {
                              ...config,
                              productSpecificFees: config.productSpecificFees.filter(
                                (r) => r.id !== prule.id
                              ),
                            }
                            setConfig(next)
                            saveConfigToServer(next, "Özel kargo kuralı silindi")
                          }}
                          className="w-[24px] h-[24px] rounded-[4px] border border-gray-200 bg-white hover:bg-red-50 text-[#ef4444] flex items-center justify-center text-[11px]"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cargo Company Edit Modal (9 Nolu Kargo Firması) ───────────────────── */}
      {cargoModalOpen && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setCargoModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[650px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blue Modal Header */}
            <div className="bg-[#0b5ed7] px-6 pt-4 pb-0 text-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] text-white/80 font-medium">
                    Kargo Firmaları
                  </div>
                  <div className="text-[18px] font-bold tracking-tight">
                    {cargoModalForm.id} Nolu Kargo Firması
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCargoModalOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-6 text-[11.5px] font-semibold">
                <button
                  type="button"
                  onClick={() => setCargoModalTab("genel")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "genel"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white text-[#0b5ed7] text-[9px] font-black flex items-center justify-center">
                    i
                  </span>
                  Genel Bilgiler
                </button>
                <button
                  type="button"
                  onClick={() => setCargoModalTab("api")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "api"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span>&lt;/&gt;</span> API Ayarları
                </button>
                <button
                  type="button"
                  onClick={() => setCargoModalTab("bolgeler")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "bolgeler"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span>🌍</span> Bölgeler
                </button>
                <button
                  type="button"
                  onClick={() => setCargoModalTab("saatler")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                    cargoModalTab === "saatler"
                      ? "border-white text-white"
                      : "border-transparent text-white/75 hover:text-white"
                  }`}
                >
                  <span>🕒</span> Teslimat Saatleri
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {cargoModalTab === "genel" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.name}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Durum
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            active: !cargoModalForm.active,
                          })
                        }
                        className={`w-[42px] h-[22px] rounded-full relative transition-colors p-0.5 flex items-center ${
                          cargoModalForm.active ? "bg-[#10b981]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-full bg-white shadow transition-transform transform ${
                            cargoModalForm.active
                              ? "translate-x-[20px]"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Kısa Açıklaması
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.description}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Sıra
                      </label>
                      <input
                        type="number"
                        value={cargoModalForm.sortOrder}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            sortOrder: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Taşıyıcı VKN
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.taxNumber}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            taxNumber: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Müşteri Tipi
                      </label>
                      <select
                        value={cargoModalForm.customerType}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            customerType: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-2.5 rounded-[4px] border border-gray-300 bg-white text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                      >
                        <option value="Hepsi">Hepsi</option>
                        <option value="Bireysel">Bireysel</option>
                        <option value="Kurumsal">Kurumsal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="flex items-center gap-1 text-[11.5px] font-bold text-[#334155] mb-1">
                        <span>Firma Kodu</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#334155] text-white text-[9px] flex items-center justify-center">
                          ?
                        </span>
                      </label>
                      <input
                        type="text"
                        value={cargoModalForm.companyCode}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            companyCode: e.target.value,
                          })
                        }
                        className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 bg-gray-50 text-[12px] text-[#475569] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Logo Belirle */}
                  <div className="pt-1 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#334155]">
                      <input
                        type="checkbox"
                        checked={cargoModalForm.useCustomLogo}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            useCustomLogo: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                      />
                      <span>Kargo firması için logo belirle</span>
                    </label>
                    <div className="w-[96px]">
                      <div
                        className="w-[96px] h-[72px] rounded-[4px] border border-gray-200 bg-white flex items-center justify-center p-2 shadow-2xs"
                        dangerouslySetInnerHTML={{
                          __html:
                            CARGO_LOGO_SVGS[editingCargoKey] ||
                            CARGO_LOGO_SVGS.yurtici,
                        }}
                      />
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            toast.info("Varsayılan kargo logosu kullanılıyor")
                          }
                          className="w-[24px] h-[24px] rounded-[3px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] flex items-center justify-center"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCargoModalForm({
                              ...cargoModalForm,
                              useCustomLogo: false,
                            })
                          }
                          className="w-[24px] h-[24px] rounded-[3px] border border-gray-200 bg-white hover:bg-red-50 text-[#ef4444] text-[11px] flex items-center justify-center"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#334155]">
                      <input
                        type="checkbox"
                        checked={cargoModalForm.customDeliveryTime}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            customDeliveryTime: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                      />
                      <span>Bayilere özel teslimat süresi belirle</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#334155]">
                      <input
                        type="checkbox"
                        checked={cargoModalForm.limitCartTotal}
                        onChange={(e) =>
                          setCargoModalForm({
                            ...cargoModalForm,
                            limitCartTotal: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                      />
                      <span>Taşınabilecek sepet tutarlarını sınırla</span>
                    </label>
                  </div>
                </>
              )}

              {cargoModalTab === "api" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      API Yetki Anahtarı (Authorization / Key)
                    </label>
                    <input
                      type="text"
                      value={cargoModalForm.apiAuthorization}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          apiAuthorization: e.target.value,
                        })
                      }
                      placeholder="API Anahtarı"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Gönderici Hesap / E-Posta
                    </label>
                    <input
                      type="text"
                      value={cargoModalForm.apiFrom}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          apiFrom: e.target.value,
                        })
                      }
                      placeholder="Örn: info@kombingo.com"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Şube Kodu / Adı
                    </label>
                    <input
                      type="text"
                      value={cargoModalForm.branchName}
                      onChange={(e) =>
                        setCargoModalForm({
                          ...cargoModalForm,
                          branchName: e.target.value,
                        })
                      }
                      placeholder="Örn: MERKEZ"
                      className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                    />
                  </div>
                </div>
              )}

              {cargoModalTab === "bolgeler" && (
                <div className="space-y-3">
                  <p className="text-[12px] text-[#64748b]">
                    Bu kargo firmasının gönderim yapabileceği aktif teslimat
                    bölgeleri:
                  </p>
                  <div className="border border-gray-200 rounded-[4px] divide-y divide-gray-100">
                    {config.regions.map((r) => (
                      <label
                        key={r.id}
                        className="flex items-center justify-between px-4 py-2.5 text-[12px] cursor-pointer hover:bg-gray-50"
                      >
                        <span className="font-semibold text-[#1e293b]">
                          {r.countryName} ({r.name})
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded border-gray-300 text-[#10b981] accent-[#10b981]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {cargoModalTab === "saatler" && (
                <div className="space-y-3">
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Teslimat / Kargo Çıkış Saat Aralığı
                  </label>
                  <input
                    type="text"
                    value={cargoModalForm.deliveryHours}
                    onChange={(e) =>
                      setCargoModalForm({
                        ...cargoModalForm,
                        deliveryHours: e.target.value,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                  <p className="text-[11px] text-[#64748b]">
                    Belirtilen saat aralığında verilen siparişler aynı gün kargo
                    planlamasına dahil edilir.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setCargoModalForm({
                    ...cargoModalForm,
                    active: !cargoModalForm.active,
                  })
                }
                className="h-[32px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[12px] font-semibold flex items-center gap-1.5"
              >
                <span>İşlemler</span>
                <span className="text-[10px]">^</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveCargoModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>✓</span> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Teslimat Bölgesi Ekle/Düzenle Modal ───────────────────────────────── */}
      {regionModalOpen && editingRegion && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setRegionModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[460px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Teslimat Bölgeleri
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Bölge Tanımı
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegionModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Ülke Adı *
                </label>
                <input
                  type="text"
                  value={editingRegion.countryName}
                  onChange={(e) =>
                    setEditingRegion({
                      ...editingRegion,
                      countryName: e.target.value,
                    })
                  }
                  placeholder="Örn: Türkiye, KKTC, Almanya"
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Bölge / Kıta Adı
                  </label>
                  <input
                    type="text"
                    value={editingRegion.name}
                    onChange={(e) =>
                      setEditingRegion({
                        ...editingRegion,
                        name: e.target.value,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Ülke Kodu
                  </label>
                  <input
                    type="text"
                    value={editingRegion.countryCode}
                    onChange={(e) =>
                      setEditingRegion({
                        ...editingRegion,
                        countryCode: e.target.value.toLowerCase(),
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRegionModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveRegionModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── İller Modal ───────────────────────────────────────────────────────── */}
      {citiesModalRegion && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setCitiesModalRegion(null)}
        >
          <div
            className="bg-white w-full max-w-[640px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Teslimat Bölgeleri
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  {citiesModalRegion.countryName} — İller (
                  {citiesModalRegion.cities.length})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCitiesModalRegion(null)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="İl ara..."
                className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 bg-white text-[12px]"
              />
            </div>
            <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
              {citiesModalRegion.cities
                .filter((c) =>
                  c
                    .toLocaleLowerCase("tr-TR")
                    .includes(citySearch.toLocaleLowerCase("tr-TR"))
                )
                .map((city) => (
                  <div
                    key={city}
                    className="px-3 py-1.5 rounded-[4px] border border-gray-200 bg-[#f8fafc] text-[11.5px] font-medium text-[#334155] flex items-center justify-between"
                  >
                    <span>{city}</span>
                    <span className="text-[#10b981] font-bold">✓</span>
                  </div>
                ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setCitiesModalRegion(null)}
                className="h-[32px] px-4 rounded-[4px] bg-[#0b5ed7] text-white text-[12px] font-bold"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Genel Kargo Ücreti Modal ──────────────────────────────────────────── */}
      {generalRuleModalOpen && editingGeneralRule && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setGeneralRuleModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[520px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Kargo Sistemi
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Genel Kargo Ücreti
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeneralRuleModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Kural Adı
                </label>
                <input
                  type="text"
                  value={editingGeneralRule.name}
                  onChange={(e) =>
                    setEditingGeneralRule({
                      ...editingGeneralRule,
                      name: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Min. Sepet Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={editingGeneralRule.min_order_total}
                    onChange={(e) =>
                      setEditingGeneralRule({
                        ...editingGeneralRule,
                        min_order_total: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Maks. Sepet Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={editingGeneralRule.max_order_total}
                    onChange={(e) =>
                      setEditingGeneralRule({
                        ...editingGeneralRule,
                        max_order_total: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Kargo Ücreti (TL)
                </label>
                <input
                  type="number"
                  value={editingGeneralRule.price}
                  onChange={(e) =>
                    setEditingGeneralRule({
                      ...editingGeneralRule,
                      price: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setGeneralRuleModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveGeneralRuleModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Ürünlere Özel Kargo Ücreti Modal ──────────────────────────────────── */}
      {productRuleModalOpen && editingProductRule && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setProductRuleModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[520px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Kargo Sistemi
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Ürünlere Özel Kargo Ücreti
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductRuleModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={editingProductRule.title}
                  onChange={(e) =>
                    setEditingProductRule({
                      ...editingProductRule,
                      title: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Ürün SKU veya Kategori Adı
                </label>
                <input
                  type="text"
                  value={editingProductRule.sku_or_category}
                  onChange={(e) =>
                    setEditingProductRule({
                      ...editingProductRule,
                      sku_or_category: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Ek Kargo Ücreti (TL)
                </label>
                <input
                  type="number"
                  value={editingProductRule.extra_fee}
                  onChange={(e) =>
                    setEditingProductRule({
                      ...editingProductRule,
                      extra_fee: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProductRuleModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveProductRuleModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Kargo ve Teslimat",
  icon: Buildings,
})

export default ShippingSettingsPage
