import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SparklesSolid } from "@medusajs/icons"
import { Toaster, toast } from "@medusajs/ui"
import React, { useEffect, useState } from "react"
import { sdk } from "../../lib/config"

type CampaignRuleType =
  | "yuzde"
  | "hediye"
  | "sepette"
  | "bogo"
  | "hediye_urun"
  | "firsat"
  | "otomasyon"

type CampaignItem = {
  id: string
  title: string
  subtitle?: string
  code: string
  rule_type: CampaignRuleType
  discount_type: "percentage" | "fixed" | "bogo" | "free_shipping"
  discount_value: number
  min_cart_amount: number
  max_usage?: number
  usage_count?: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  badge_label?: string
  badge_color?: string
}

const DEFAULT_KURGULAR: CampaignItem[] = [
  {
    id: "camp-sepette15",
    title: "Tüm Bodykit Setlerinde %15 Sepet İndirimi",
    code: "SEPETTE15",
    rule_type: "sepette",
    discount_type: "percentage",
    discount_value: 15,
    min_cart_amount: 1500,
    usage_count: 84,
    is_active: true,
    badge_label: "SEPETTE OTOMATİK İNDİRİM",
    badge_color: "blue",
  },
  {
    id: "camp-kargo0",
    title: "3.000 TL ve Üzeri Siparişlerde Ücretsiz Kargo",
    code: "KARGO0",
    rule_type: "otomasyon",
    discount_type: "free_shipping",
    discount_value: 100,
    min_cart_amount: 3000,
    usage_count: 312,
    is_active: true,
    badge_label: "KARGO OTOMASYONU",
    badge_color: "emerald",
  },
  {
    id: "camp-3al2ode",
    title: "Seçili Aksesuar & Lip Ürünlerinde 3 Al 2 Öde",
    code: "3AL2ODE",
    rule_type: "bogo",
    discount_type: "bogo",
    discount_value: 33,
    min_cart_amount: 0,
    usage_count: 41,
    is_active: true,
    badge_label: "X AL Y ÖDE (BOGO)",
    badge_color: "purple",
  },
  {
    id: "camp-otomasyon-tiers",
    title: "2., 3., 4. ve 5. Ürüne Özel Sıralı Sepet İndirimi (%10-%30)",
    code: "SIRALI-INDIRIM",
    rule_type: "otomasyon",
    discount_type: "percentage",
    discount_value: 30,
    min_cart_amount: 0,
    usage_count: 128,
    is_active: true,
    badge_label: "DİNAMİK OTOMASYON",
    badge_color: "amber",
  },
]

const MultiProductAjaxSearch = ({
  onAdd,
  selectedProducts,
  onRemove,
  onUpdate,
}: {
  onAdd: (p: any) => void
  selectedProducts: any[]
  onRemove: (id: string) => void
  onUpdate?: (id: string, updates: any) => void
}) => {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setProducts([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await sdk.admin.product.list({ q: query, limit: 8 })
        setProducts(res.products || [])
      } catch {}
      setSearching(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          type="search"
          placeholder="Aramak ve listeye eklemek için ürün adı yazın..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] text-slate-800 focus:outline-none focus:border-[#1565c0]"
        />
        {searching && (
          <div className="absolute right-3 top-3 text-[11px] text-slate-400 font-semibold">
            Aranıyor...
          </div>
        )}

        {query.length > 0 && products.length === 0 && !searching && (
          <div className="absolute z-50 w-full mt-1 p-3 bg-white border border-slate-200 rounded-[8px] shadow-lg text-center text-[12.5px] text-slate-500">
            Ürün bulunamadı.
          </div>
        )}

        {products.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-[8px] shadow-xl max-h-64 overflow-y-auto">
            {products.map((p: any) => (
              <div
                key={p.id}
                onClick={() => {
                  if (!selectedProducts.find((sp) => sp.id === p.id)) {
                    onAdd({ id: p.id, title: p.title, thumbnail: p.thumbnail })
                  }
                  setQuery("")
                  setProducts([])
                }}
                className="p-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt=""
                      className="w-10 h-10 border border-slate-200 rounded-[6px] object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-[6px] bg-slate-100 border border-slate-200" />
                  )}
                  <span className="text-[13px] font-semibold text-slate-800">{p.title}</span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded-[6px] bg-[#eef4ff] text-[#1565c0] text-[12px] font-bold"
                >
                  + Seç &amp; Ekle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {selectedProducts.map((sp) => (
            <div
              key={sp.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-3 border border-slate-200 rounded-[8px] bg-[#f8fafc] gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {sp.thumbnail ? (
                  <img
                    src={sp.thumbnail}
                    alt=""
                    className="w-9 h-9 rounded-[6px] border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-[6px] bg-slate-200" />
                )}
                <span className="text-[13px] font-semibold text-slate-800 truncate">{sp.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {onUpdate && (
                  <>
                    <select
                      value={sp.type || "fixed"}
                      onChange={(e) => onUpdate(sp.id, { type: e.target.value })}
                      className="h-[34px] px-2.5 rounded-[6px] border border-slate-300 bg-white text-[12px] font-semibold text-slate-700"
                    >
                      <option value="percent">Yüzde (%)</option>
                      <option value="fixed">Sabit (TL)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Tutar"
                      value={sp.amount ?? "50"}
                      onChange={(e) => onUpdate(sp.id, { amount: e.target.value })}
                      title="İndirim Oranı/Tutarı"
                      className="w-20 h-[34px] px-2.5 rounded-[6px] border border-slate-300 bg-white text-[12.5px] font-bold text-emerald-700"
                    />
                    <input
                      type="datetime-local"
                      value={sp.end_date || ""}
                      onChange={(e) => onUpdate(sp.id, { end_date: e.target.value })}
                      title="Bitiş Tarihi"
                      className="h-[34px] px-2.5 rounded-[6px] border border-slate-300 bg-white text-[12px] text-slate-700"
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(sp.id)}
                  className="h-[34px] px-3 rounded-[6px] bg-rose-50 hover:bg-rose-100 text-rose-600 text-[12px] font-bold cursor-pointer"
                >
                  Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const RULE_TITLES: Record<CampaignRuleType, string> = {
  yuzde: "Sepete Özel İndirim (Trendyol Stili Fırsat Ürünleri)",
  hediye: "Kupon & Klasik İndirim Kurgusu",
  sepette: "Pazaryeri Usulü Otomatik Sepette İndirim",
  bogo: "X Al Y Öde (BOGO) Kurgusu",
  hediye_urun: "Hediye Ürünler Kurgusu",
  firsat: "Sepette Fırsat (Avantajlı Çapraz Satış Ürünleri)",
  otomasyon: "Dinamik İndirim Otomasyonu (2., 3., 4., 5. Ürüne Özel İndirim)",
}

const KampanyalarPage = () => {
  const [selectedRule, setSelectedRule] = useState<CampaignRuleType>("otomasyon")
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEFAULT_KURGULAR)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 1) Trendyol Stili Sepete Özel Fırsat Ürünleri (yuzde / urun_kupon)
  const [urunKuponForm, setUrunKuponForm] = useState({
    code: "FIRSAT10",
    type: "percent",
    amount: "10",
    end_date: "",
    selectedProducts: [] as any[],
    active: true,
  })

  // 2) Klasik Kupon & Yüzde İndirim (hediye)
  const [yuzdeForm, setYuzdeForm] = useState({
    title: "Yeni Sezon %15 Sepet İndirimi",
    code: "SEPETTE15",
    amount: "15",
    minCart: "1500",
    active: true,
    type: "percent",
    end_date: "",
  })
  const [existingYuzdePromos, setExistingYuzdePromos] = useState<any[]>([])

  // 3) Pazaryeri / Trendyol Usulü Sepette İndirim (sepette)
  const [sepetteForm, setSepetteForm] = useState({
    name: "Sepette %10 İndirim",
    type: "percent",
    amount: "10",
    category: "all",
    minCart: "1000",
    active: true,
  })

  // 4) X Al Y Öde - BOGO (bogo)
  const [bogoForm, setBogoForm] = useState({
    code: "3AL2ODE",
    buyQty: 3,
    getQty: 1,
    active: true,
  })

  // 5) Hediye Ürünler Kurgusu (hediye_urun)
  const [hediyeForm, setHediyeForm] = useState<{
    minPrice: string
    categoryIds: string[]
    selectedProducts: any[]
    active: boolean
  }>({
    minPrice: "1000",
    categoryIds: [],
    selectedProducts: [],
    active: true,
  })
  const [categories, setCategories] = useState<any[]>([])

  // 6) Sepette Fırsat / Çapraz Satış (firsat / cart_upsells)
  const [cartUpsells, setCartUpsells] = useState<any[]>([])

  // 7) Dinamik İndirim Otomasyonu: 1., 2., 3., 4., 5. Ürüne Özel Kademeli İndirim + Kargo + Winner Modu + Sayaç
  const [savingOtomasyon, setSavingOtomasyon] = useState(false)
  const [otomasyonSettings, setOtomasyonSettings] = useState({
    enabled: true,
    free_shipping_limit: 3000,
    winner_mode_percent: 30,
    tiers: [
      { index: 0, percent: 0 },
      { index: 1, percent: 10 },
      { index: 2, percent: 15 },
      { index: 3, percent: 20 },
      { index: 4, percent: 25 },
    ],
    timer_enabled: false,
    timer_minutes: 15,
    cooldown_hours: 24,
  })

  const notifySuccess = (msg: string) => {
    setStatusMessage(msg)
    toast.success(msg)
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (!tab) return
      if (tab === "urun_kupon" || tab === "yuzde") {
        setSelectedRule("yuzde")
      } else if (tab === "hediye") {
        setSelectedRule("hediye")
      } else if (tab === "sepette") {
        setSelectedRule("sepette")
      } else if (tab === "bogo") {
        setSelectedRule("bogo")
      } else if (tab === "hediye_urun") {
        setSelectedRule("hediye_urun")
      } else if (tab === "firsat" || tab === "cart_upsells") {
        setSelectedRule("firsat")
      } else if (tab === "otomasyon") {
        setSelectedRule("otomasyon")
      }
    }
    syncTabFromUrl()
    window.addEventListener("popstate", syncTabFromUrl)
    const timer = setInterval(syncTabFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      clearInterval(timer)
    }
  }, [])

  const fetchPromotions = async () => {
    try {
      const res = await sdk.admin.promotion.list({ limit: 100 })
      const standardPromos = (res.promotions || []).filter(
        (p: any) => p.type === "standard" && p.is_automatic === false
      )
      setExistingYuzdePromos(standardPromos)
    } catch {}
  }

  useEffect(() => {
    // Load store metadata (/admin/custom/store-meta) using relative URL so it works in production & local
    fetch("/admin/custom/store-meta", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.metadata?.cart_upsells && Array.isArray(data.metadata.cart_upsells)) {
          setCartUpsells(data.metadata.cart_upsells)
        }
        if (data?.metadata?.discount_automation_settings) {
          const incoming = data.metadata.discount_automation_settings
          setOtomasyonSettings((prev) => ({
            ...prev,
            ...incoming,
            tiers:
              Array.isArray(incoming.tiers) && incoming.tiers.length > 0
                ? incoming.tiers
                : prev.tiers,
          }))
        }
        if (data?.metadata?.hediye_urunler_settings) {
          setHediyeForm(data.metadata.hediye_urunler_settings)
        }
      })
      .catch(() => {})

    // Load active special-offer products (coupon_badge)
    sdk.admin.product
      .list({ limit: 100 })
      .then((res) => {
        const activeSpecial = (res.products || []).filter(
          (p: any) => p.metadata?.coupon_badge?.active
        )
        if (activeSpecial.length > 0) {
          setUrunKuponForm((prev) => ({
            ...prev,
            selectedProducts: activeSpecial.map((p: any) => ({
              id: p.id,
              title: p.title,
              thumbnail: p.thumbnail,
              type: p.metadata?.coupon_badge?.type || "fixed",
              amount: p.metadata?.coupon_badge?.amount || "50",
              end_date: p.metadata?.coupon_badge?.end_date || "",
            })),
          }))
        }
      })
      .catch(() => {})

    fetchPromotions()

    sdk.admin.productCategory
      .list({ limit: 100, fields: "id,name" })
      .then((res) => setCategories(res.product_categories || []))
      .catch(() => {})

    fetch("/admin/campaigns", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.campaigns) ? data.campaigns : []
        if (list.length > 0) {
          const mapped: CampaignItem[] = list.map((c: any) => ({
            id: c.id,
            title: c.title || c.name || "Kampanya",
            code: c.code || c.campaign_identifier || "KUPON",
            rule_type: (c.rule_type as CampaignRuleType) || "yuzde",
            discount_type: c.discount_type || "percentage",
            discount_value: Number(c.discount_value || 15),
            min_cart_amount: Number(c.min_cart_amount || 0),
            usage_count: Number(c.usage_count || 0),
            is_active: c.is_active !== false,
            badge_label: "AKTİF KURGU",
            badge_color: "blue",
          }))
          const existingCodes = new Set(DEFAULT_KURGULAR.map((d) => d.code))
          const extra = mapped.filter((m) => !existingCodes.has(m.code))
          if (extra.length > 0) {
            setCampaigns([...DEFAULT_KURGULAR, ...extra])
          }
        }
      })
      .catch(() => {})
  }, [])

  const selectRuleType = (rule: CampaignRuleType) => {
    setSelectedRule(rule)
    if (typeof window !== "undefined") {
      const nextUrl = `/app/kampanyalar?tab=${rule}`
      window.history.pushState({}, "", nextUrl)
      window.dispatchEvent(new PopStateEvent("popstate"))
    }
  }

  const handleTierChange = (index: number, value: string) => {
    const newTiers = [...otomasyonSettings.tiers]
    newTiers[index] = { ...newTiers[index], percent: Number(value) }
    setOtomasyonSettings({ ...otomasyonSettings, tiers: newTiers })
  }

  const handleAddTier = () => {
    const nextIdx = otomasyonSettings.tiers.length
    const lastPercent =
      nextIdx > 0 ? otomasyonSettings.tiers[nextIdx - 1].percent + 5 : 10
    setOtomasyonSettings({
      ...otomasyonSettings,
      tiers: [
        ...otomasyonSettings.tiers,
        { index: nextIdx, percent: Math.min(lastPercent, 90) },
      ],
    })
  }

  const handleRemoveTier = (idxToRemove: number) => {
    if (otomasyonSettings.tiers.length <= 1) return
    const filtered = otomasyonSettings.tiers
      .filter((_, idx) => idx !== idxToRemove)
      .map((t, idx) => ({ index: idx, percent: t.percent }))
    setOtomasyonSettings({ ...otomasyonSettings, tiers: filtered })
  }

  const handleSaveOtomasyon = async () => {
    setSavingOtomasyon(true)
    try {
      await sdk.client.fetch(`/admin/custom/store-meta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          discount_automation_settings: otomasyonSettings,
        },
      })
      notifySuccess("Dinamik İndirim Otomasyonu ve sıralı ürün kademeleri kaydedildi!")
    } catch (err) {
      toast.error("Otomasyon ayarları kaydedilirken bir hata oluştu.")
    } finally {
      setSavingOtomasyon(false)
    }
  }

  const handleSaveRule = async (rule: CampaignRuleType) => {
    if (rule === "otomasyon") {
      await handleSaveOtomasyon()
      return
    }
    setLoading(true)
    try {
      if (rule === "hediye_urun") {
        if (hediyeForm.selectedProducts.length === 0) {
          throw new Error("Lütfen en az 1 hediye ürün seçiniz.")
        }
        await sdk.client.fetch(`/admin/custom/store-meta`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: { hediye_urunler_settings: hediyeForm },
        })
        notifySuccess("Hediye Ürünler kurgusu başarıyla kaydedildi!")
        setLoading(false)
        return
      }

      if (rule === "yuzde") {
        if (urunKuponForm.selectedProducts.length === 0) {
          throw new Error("Lütfen sepete özel indirim için en az 1 ürün seçiniz.")
        }
        await Promise.all(
          urunKuponForm.selectedProducts.map(async (sp: any) => {
            const uniqueCode = `FIRSAT-${sp.id.slice(-6).toUpperCase()}`
            try {
              await sdk.admin.promotion.create({
                code: uniqueCode,
                type: "standard",
                is_automatic: true,
                application_method: {
                  type: (sp.type || "fixed") === "percent" ? "percentage" : "fixed",
                  target_type: "items",
                  allocation: "each",
                  value:
                    (sp.type || "fixed") === "percent"
                      ? Number(sp.amount || "50")
                      : Number(sp.amount || "50") * 100,
                  ...((sp.type || "fixed") !== "percent" ? { currency_code: "try" } : {}),
                  target_rules: [
                    {
                      attribute: "product_id",
                      operator: "in",
                      values: [sp.id],
                    },
                  ],
                },
              })
            } catch {}

            await sdk.admin.product.update(sp.id, {
              metadata: {
                coupon_badge: {
                  active: urunKuponForm.active,
                  code: uniqueCode,
                  type: sp.type || "fixed",
                  amount: sp.amount || "50",
                  end_date: sp.end_date || "",
                },
              },
            })
          })
        )
        notifySuccess("Trendyol Stili Sepete Özel Fırsat Ürünleri kaydedildi ve yayına alındı!")
        setLoading(false)
        return
      }

      if (rule === "firsat") {
        await sdk.client.fetch("/admin/custom/store-meta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: { cart_upsells: cartUpsells },
        })
        notifySuccess("Sepette Fırsat (Çapraz Satış) ürünleri başarıyla yayınlandı!")
        setLoading(false)
        return
      }

      if (rule === "hediye") {
        if (!yuzdeForm.code.trim()) {
          throw new Error("Kupon kodu zorunludur.")
        }
        try {
          const created = await sdk.admin.promotion.create({
            code: yuzdeForm.code.trim().toUpperCase(),
            type: "standard",
            is_automatic: false,
            status: yuzdeForm.active ? "active" : "draft",
            application_method: {
              type: yuzdeForm.type === "percent" ? "percentage" : "fixed",
              target_type: "order",
              value:
                yuzdeForm.type === "percent"
                  ? Number(yuzdeForm.amount || "10")
                  : Number(yuzdeForm.amount || "10") * 100,
              ...(yuzdeForm.type !== "percent" ? { currency_code: "try" } : {}),
            },
            rules: yuzdeForm.minCart
              ? [
                  {
                    attribute: "item_total",
                    operator: "gte",
                    values: [String(Number(yuzdeForm.minCart) * 100)],
                  },
                ]
              : undefined,
          })

          if (yuzdeForm.end_date && created.promotion?.id) {
            try {
              await sdk.client.fetch(`/admin/promotions/${created.promotion.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: { metadata: { end_date: yuzdeForm.end_date } },
              })
            } catch {}
          }
        } catch (promoErr: any) {
          if (!promoErr?.message?.includes("already exists")) {
            throw promoErr
          }
        }
        await fetchPromotions()
        notifySuccess("Klasik kupon başarıyla oluşturuldu ve aktif edildi!")
        setLoading(false)
        return
      }

      // sepette veya bogo
      await sdk.client.fetch("/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          type: "campaign_creation",
          campaign_type: rule === "bogo" ? "bogo" : "sepette",
          data: rule === "bogo" ? bogoForm : sepetteForm,
        },
      })
      notifySuccess("Kampanya kurgusu başarıyla kaydedildi ve mağazada aktif edildi!")
    } catch (e: any) {
      toast.error(e?.message || "Kampanya kaydedilirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExisting = async (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    try {
      await fetch(`/admin/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 pb-24">
      <Toaster />
      <div className="max-w-[1640px] w-full mx-auto px-5 py-6">
        {statusMessage && (
          <div className="mb-5 px-4 py-3 rounded-[8px] bg-[#e0f6e7] border border-[#0abb87]/30 text-[#08976d] text-[13px] font-bold flex items-center justify-between">
            <span>✓ {statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-[#08976d] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Promosyon & Kurgu Motoru Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Promosyon &amp; Kurgu Motoru
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    key: "yuzde" as CampaignRuleType,
                    icon: "🏷️",
                    title: "Sepete Özel İndirim",
                    subtitle: "Trendyol stili fırsat ürünleri",
                  },
                  {
                    key: "hediye" as CampaignRuleType,
                    icon: "🎟️",
                    title: "Kupon & Klasik İndirim",
                    subtitle: "Kupon kodu & hediye çeki",
                  },
                  {
                    key: "sepette" as CampaignRuleType,
                    icon: "🛒",
                    title: "Sepette İndirim",
                    subtitle: "Trendyol usulü otomatik sepet indirimi",
                  },
                  {
                    key: "bogo" as CampaignRuleType,
                    icon: "🎁",
                    title: "X Al Y Öde (BOGO)",
                    subtitle: "3 Al 2 Öde / 2. Ürüne %50",
                  },
                  {
                    key: "hediye_urun" as CampaignRuleType,
                    icon: "🎀",
                    title: "Hediye Ürünler",
                    subtitle: "Belirli alışverişe bedava ürün",
                  },
                  {
                    key: "firsat" as CampaignRuleType,
                    icon: "⚡",
                    title: "Sepette Fırsat",
                    subtitle: "Kasa önü çapraz satış ürünleri",
                  },
                ].map((item) => {
                  const isActive = selectedRule === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectRuleType(item.key)}
                      className={
                        isActive
                          ? "w-full text-left px-3.5 py-2.5 rounded-[8px] bg-[#eef4ff] border border-[#1565c0]/30 text-[#1565c0] font-bold text-[12.5px] flex items-center justify-between cursor-pointer"
                          : "w-full text-left px-3.5 py-2.5 rounded-[8px] hover:bg-slate-50 border border-transparent text-slate-700 font-semibold text-[12.5px] flex items-center justify-between cursor-pointer"
                      }
                    >
                      <div>
                        <div>
                          {item.icon} {item.title}
                        </div>
                        <div
                          className={
                            isActive
                              ? "text-[10.5px] font-normal text-slate-500 mt-0.5"
                              : "text-[10.5px] font-normal text-slate-400 mt-0.5"
                          }
                        >
                          {item.subtitle}
                        </div>
                      </div>
                      <span className={isActive ? "text-[11px]" : "text-[11px] text-slate-400"}>›</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Otomasyon &amp; Sıralı Sepet İndirimi
              </div>
              <button
                type="button"
                onClick={() => selectRuleType("otomasyon")}
                className={
                  selectedRule === "otomasyon"
                    ? "w-full text-left px-3.5 py-2.5 rounded-[8px] bg-[#eef4ff] border border-[#1565c0]/30 text-[#1565c0] font-bold text-[12.5px] flex items-center justify-between cursor-pointer"
                    : "w-full text-left px-3.5 py-2.5 rounded-[8px] hover:bg-slate-50 border border-transparent text-slate-700 font-semibold text-[12.5px] flex items-center justify-between cursor-pointer"
                }
              >
                <div>
                  <div>🤖 Dinamik İndirim Otomasyonu</div>
                  <div className="text-[10.5px] font-normal text-slate-500 mt-0.5">
                    2., 3., 4. ürüne özel sıralı indirim &amp; kargo
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">›</span>
              </button>
            </div>

            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-2xs">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("campaign-existing-list-card")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full py-2.5 px-4 rounded-[8px] bg-slate-900 hover:bg-slate-800 text-white text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📋</span>
                <span>Mevcut Kurgular ({campaigns.length})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Specialized Campaign Modules */}
          <div className="lg:col-span-9 space-y-6">
            {/* ==================================================================== */}
            {/* 1. DİNAMİK İNDİRİM OTOMASYONU (2., 3., 4., 5. ÜRÜNE ÖZEL İNDİRİM)   */}
            {/* ==================================================================== */}
            {selectedRule === "otomasyon" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      Dinamik İndirim Otomasyonu (Sıralı Ürün &amp; Kargo Kurgusu)
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Sepete eklenen 1., 2., 3., 4. ve 5. ürünlere özel kademeli indirim oranlarını, Winner modunu ve ücretsiz kargo alt limitini yönetin.
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                      ✓ Canlı Mağaza Entegreli
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveOtomasyon}
                      disabled={savingOtomasyon}
                      className="h-[38px] px-5 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[12.5px] font-bold cursor-pointer shadow-xs"
                    >
                      {savingOtomasyon ? "Kaydediliyor..." : "✓ Değişiklikleri Kaydet"}
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Sol Kolon: Otomasyon Durumu, Kargo Otomasyonu, Winner Modu, Sepet Sayacı */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Otomasyon Durumu & Kargo Otomasyonu */}
                    <div className="p-5 rounded-[10px] border border-slate-200 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] font-bold text-slate-800">Otomasyon Durumu</div>
                          <div className="text-[11.5px] text-slate-500">
                            Sıralı ürün indirim otomasyonunu aktif/pasif yapın.
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setOtomasyonSettings({
                              ...otomasyonSettings,
                              enabled: !otomasyonSettings.enabled,
                            })
                          }
                          className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                            otomasyonSettings.enabled
                              ? "bg-[#0abb87] justify-end"
                              : "bg-[#e2e5ec] justify-start"
                          }`}
                        >
                          <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-200" />

                      <div>
                        <div className="text-[13.5px] font-bold text-slate-800 mb-2">
                          Kargo Otomasyonu (Bedava Kargo Alt Limiti)
                        </div>
                        <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                          Bedava Kargo Alt Limiti (TL)
                        </label>
                        <input
                          type="number"
                          value={otomasyonSettings.free_shipping_limit}
                          onChange={(e) =>
                            setOtomasyonSettings({
                              ...otomasyonSettings,
                              free_shipping_limit: Number(e.target.value),
                            })
                          }
                          placeholder="Örn: 3000"
                          className="w-full h-[38px] px-3 rounded-[8px] border border-slate-300 text-[13px] font-bold text-slate-800 focus:outline-none focus:border-[#1565c0]"
                        />
                        <div className="text-[11px] text-slate-400 mt-1">
                          İndirimler sonrası sepet toplamı bu tutarı geçerse kargo otomatik sıfırlanır.
                        </div>
                      </div>
                    </div>

                    {/* Winner Modu (Sabit İndirim) */}
                    <div className="p-5 rounded-[10px] border border-slate-200 bg-[#f8fafc] space-y-3">
                      <div className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                        <span>🏆</span>
                        <span>Winner Modu (Sabit İndirim)</span>
                      </div>
                      <div className="text-[12px] text-slate-500 leading-relaxed">
                        Tabloda belirtilen kademeler bittikten sonra (örneğin{" "}
                        <strong>{otomasyonSettings.tiers.length + 1}. ürün ve sonrası</strong>)
                        uygulanacak sabit indirim oranıdır.
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          value={otomasyonSettings.winner_mode_percent}
                          onChange={(e) =>
                            setOtomasyonSettings({
                              ...otomasyonSettings,
                              winner_mode_percent: Number(e.target.value),
                            })
                          }
                          className="w-28 h-[38px] px-3 rounded-[8px] border border-slate-300 bg-white text-[14px] font-extrabold text-emerald-700 focus:outline-none focus:border-[#1565c0]"
                        />
                        <span className="text-[14px] font-bold text-slate-700">% İndirim</span>
                      </div>
                    </div>

                    {/* Sepet Sayacı (Aciliyet) */}
                    <div className="p-5 rounded-[10px] border border-slate-200 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] font-bold text-slate-800">
                            Sepet Sayacı (Aciliyet Kurgusu)
                          </div>
                          <div className="text-[11.5px] text-slate-500">
                            Kullanıcılara sepetteki indirimler için geri sayım süresi tanıyın.
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setOtomasyonSettings({
                              ...otomasyonSettings,
                              timer_enabled: !otomasyonSettings.timer_enabled,
                            })
                          }
                          className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                            otomasyonSettings.timer_enabled
                              ? "bg-[#0abb87] justify-end"
                              : "bg-[#e2e5ec] justify-start"
                          }`}
                        >
                          <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                        </div>
                      </div>

                      {otomasyonSettings.timer_enabled && (
                        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1">
                              İndirim Süresi (Dakika)
                            </label>
                            <input
                              type="number"
                              value={otomasyonSettings.timer_minutes || 15}
                              onChange={(e) =>
                                setOtomasyonSettings({
                                  ...otomasyonSettings,
                                  timer_minutes: Number(e.target.value),
                                })
                              }
                              className="w-full h-[36px] px-3 rounded-[6px] border border-slate-300 text-[13px] font-semibold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1">
                              Bekleme / Ceza Süresi (Saat)
                            </label>
                            <input
                              type="number"
                              value={otomasyonSettings.cooldown_hours || 24}
                              onChange={(e) =>
                                setOtomasyonSettings({
                                  ...otomasyonSettings,
                                  cooldown_hours: Number(e.target.value),
                                })
                              }
                              className="w-full h-[36px] px-3 rounded-[6px] border border-slate-300 text-[13px] font-semibold text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ Kolon: 1., 2., 3., 4., 5. Ürün İndirim Kademeleri Tablosu */}
                  <div className="lg:col-span-7">
                    <div className="rounded-[10px] border border-slate-200 bg-white overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[15px] font-extrabold text-slate-800">
                            İndirim Kademeleri (1., 2., 3., 4., 5. Ürün İndirimleri)
                          </div>
                          <div className="text-[12px] text-slate-500 mt-0.5">
                            Müşteri sepete ürün ekledikçe sırasıyla aşağıdaki indirim yüzdeleri otomatik uygulanır.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTier}
                          className="px-3 py-1.5 rounded-[6px] bg-[#eef4ff] hover:bg-blue-100 text-[#1565c0] text-[12px] font-bold cursor-pointer"
                        >
                          + Kademe Ekle
                        </button>
                      </div>

                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-[#f8fafc] border-b border-slate-200 text-[11.5px] font-bold uppercase text-slate-500">
                            <th className="py-3 px-4">Sıra (Index)</th>
                            <th className="py-3 px-4">Sepetteki Ürün Tanımı</th>
                            <th className="py-3 px-4">İndirim Oranı (%)</th>
                            <th className="py-3 px-4 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[13px]">
                          {otomasyonSettings.tiers.map((tier, index) => (
                            <tr key={index} className="hover:bg-slate-50/80">
                              <td className="py-3.5 px-4 font-bold text-slate-800">
                                {index + 1}. Sıra
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium">
                                Sepete {index + 1}. Eklenen Ürün
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2 w-36">
                                  <input
                                    type="number"
                                    value={tier.percent}
                                    onChange={(e) => handleTierChange(index, e.target.value)}
                                    className="w-24 h-[36px] px-3 rounded-[6px] border border-slate-300 text-[13.5px] font-extrabold text-emerald-700 focus:outline-none focus:border-[#1565c0]"
                                  />
                                  <span className="font-bold text-slate-700">%</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {otomasyonSettings.tiers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTier(index)}
                                    className="text-[12px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                                  >
                                    Kaldır
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="p-4 bg-[#f8fafc] border-t border-slate-200 text-center text-[12.5px] font-semibold text-slate-600 italic">
                        {otomasyonSettings.tiers.length + 1}. Sıra ve sonrası eklenen tüm ürünler için{" "}
                        <span className="text-[#1565c0] font-bold">
                          &ldquo;Winner Modu&rdquo; (%{otomasyonSettings.winner_mode_percent})
                        </span>{" "}
                        devreye girer.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* 2. SEPETE ÖZEL İNDİRİM (TRENDYOL STİLİ SEPETE ÖZEL FIRSAT ÜRÜNLERİ) */}
            {/* ==================================================================== */}
            {selectedRule === "yuzde" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      Trendyol Stili Sepete Özel Fırsat Ürünleri
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Sepet sayfasında müşterilere indirimli olarak önereceğiniz çapraz satış (cross-sell) fırsat ürünlerini belirleyin. Sepete Ekle butonuna basıldığında indirim otomatik uygulanır.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-600">Rozeti Göster &amp; Aktif Et</span>
                    <div
                      onClick={() =>
                        setUrunKuponForm((p) => ({ ...p, active: !p.active }))
                      }
                      className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                        urunKuponForm.active
                          ? "bg-[#0abb87] justify-end"
                          : "bg-[#e2e5ec] justify-start"
                      }`}
                    >
                      <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-700 mb-2">
                      Hedef Ürün Adını Arayın ve İndirim Tanımlayın <span className="text-rose-500">*</span>
                    </label>
                    <MultiProductAjaxSearch
                      selectedProducts={urunKuponForm.selectedProducts}
                      onAdd={(p) =>
                        setUrunKuponForm((prev) => ({
                          ...prev,
                          selectedProducts: [
                            ...prev.selectedProducts,
                            { ...p, type: "fixed", amount: "50", end_date: "" },
                          ],
                        }))
                      }
                      onRemove={(id) =>
                        setUrunKuponForm((prev) => ({
                          ...prev,
                          selectedProducts: prev.selectedProducts.filter((sp: any) => sp.id !== id),
                        }))
                      }
                      onUpdate={(id, updates) =>
                        setUrunKuponForm((prev) => ({
                          ...prev,
                          selectedProducts: prev.selectedProducts.map((sp: any) =>
                            sp.id === id ? { ...sp, ...updates } : sp
                          ),
                        }))
                      }
                    />
                    <div className="text-[11.5px] text-slate-400 mt-2">
                      Seçilen bu ürünler sepette fırsat kutusunda özel indirim tutarıyla önerilecektir.
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveRule("yuzde")}
                      disabled={loading}
                      className="h-[40px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                    >
                      {loading ? "Kaydediliyor..." : "✓ Sepete Özel Fırsat Olarak Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* 3. KUPON & KLASİK İNDİRİM KURGUSU                                    */}
            {/* ==================================================================== */}
            {selectedRule === "hediye" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      Kupon &amp; Klasik İndirim Kurgusu
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Müşterilerinizin sepette kullanabileceği kupon kodlu oran (%) veya sabit tutar (TL) indirimleri oluşturun.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-600">Kupon Aktif</span>
                    <div
                      onClick={() => setYuzdeForm((p) => ({ ...p, active: !p.active }))}
                      className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                        yuzdeForm.active
                          ? "bg-[#0abb87] justify-end"
                          : "bg-[#e2e5ec] justify-start"
                      }`}
                    >
                      <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Kupon Kodu <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Örn: YAZ20 veya VIP10"
                          value={yuzdeForm.code}
                          onChange={(e) => setYuzdeForm((p) => ({ ...p, code: e.target.value }))}
                          className="flex-1 h-[40px] px-3.5 rounded-[8px] border border-slate-300 font-mono text-[13px] font-bold text-[#1565c0] uppercase"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setYuzdeForm((p) => ({
                              ...p,
                              code: `BKM${Math.floor(100 + Math.random() * 900)}`,
                            }))
                          }
                          className="h-[40px] px-3.5 rounded-[8px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[12px] font-bold cursor-pointer"
                        >
                          🎲 Kod Üret
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        İndirim Oranı / Tutarı <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={yuzdeForm.type}
                          onChange={(e) => setYuzdeForm((p) => ({ ...p, type: e.target.value }))}
                          className="w-40 h-[40px] px-3 rounded-[8px] border border-slate-300 bg-white text-[13px] font-semibold text-slate-700"
                        >
                          <option value="percent">Yüzde (%)</option>
                          <option value="fixed">Sabit (TL)</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Örn: 20"
                          value={yuzdeForm.amount}
                          onChange={(e) => setYuzdeForm((p) => ({ ...p, amount: e.target.value }))}
                          className="flex-1 h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] font-bold text-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Minimum Sepet Tutarı (TL - Opsiyonel)
                      </label>
                      <input
                        type="number"
                        placeholder="Örn: 500"
                        value={yuzdeForm.minCart}
                        onChange={(e) => setYuzdeForm((p) => ({ ...p, minCart: e.target.value }))}
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Bitiş Tarihi (Sayaç İçin - Opsiyonel)
                      </label>
                      <input
                        type="datetime-local"
                        value={yuzdeForm.end_date}
                        onChange={(e) => setYuzdeForm((p) => ({ ...p, end_date: e.target.value }))}
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveRule("hediye")}
                      disabled={loading}
                      className="h-[40px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                    >
                      {loading ? "Kaydediliyor..." : "✓ Kupon Kurgusunu Kaydet & Başlat"}
                    </button>
                  </div>

                  {/* Aktif Klasik Kuponlar Listesi */}
                  <div className="pt-5 border-t border-slate-200">
                    <div className="text-[14px] font-extrabold text-slate-800 mb-3">
                      Aktif Klasik Kuponlar ({existingYuzdePromos.length})
                    </div>
                    {existingYuzdePromos.length === 0 ? (
                      <div className="p-6 border border-dashed border-slate-200 rounded-[8px] text-center text-[12.5px] text-slate-400">
                        Henüz tanımlı klasik kupon bulunmuyor.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {existingYuzdePromos.map((promo: any) => {
                          const isPercent = promo.application_method?.type === "percentage"
                          const amount = promo.application_method?.value
                          const minCartRule = promo.rules?.find(
                            (r: any) => r.attribute === "item_total"
                          )
                          const rawMinCart = minCartRule ? minCartRule.values?.[0] : null
                          const minCart =
                            rawMinCart !== null
                              ? typeof rawMinCart === "object"
                                ? rawMinCart.value || rawMinCart.id
                                : rawMinCart
                              : null
                          const displayAmount = isPercent
                            ? amount
                            : amount
                            ? amount / 100
                            : 0
                          const displayMinCart = minCart ? Number(minCart) / 100 : null

                          return (
                            <div
                              key={promo.id}
                              className="flex items-center justify-between px-5 py-3.5 border border-slate-200 rounded-[8px] bg-[#f8fafc] flex-wrap gap-4"
                            >
                              <div>
                                <div className="font-mono font-bold text-[14px] text-[#1565c0]">
                                  {promo.code}
                                </div>
                                {promo.metadata?.end_date && (
                                  <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                                    Bitiş:{" "}
                                    {new Date(promo.metadata.end_date).toLocaleDateString("tr-TR")}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-10">
                                <div className="text-center">
                                  <div className="text-[10px] font-bold uppercase text-slate-400">
                                    MİN. SEPET
                                  </div>
                                  <div className="text-[13px] font-bold text-slate-800">
                                    {displayMinCart ? `${displayMinCart} TL` : "-"}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] font-bold uppercase text-slate-400">
                                    İNDİRİM
                                  </div>
                                  <div className="text-[14px] font-extrabold text-emerald-700">
                                    {isPercent ? `%${displayAmount}` : `${displayAmount} TL`}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await sdk.admin.promotion.delete(promo.id)
                                      fetchPromotions()
                                      notifySuccess("Kupon başarıyla silindi.")
                                    } catch {
                                      toast.error("Kupon silinirken hata oluştu.")
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-[6px] bg-rose-50 hover:bg-rose-100 text-rose-600 text-[12px] font-bold cursor-pointer"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* 4. PAZARYERİ / TRENDYOL USULÜ SEPETTE İNDİRİM                        */}
            {/* ==================================================================== */}
            {selectedRule === "sepette" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      Pazaryeri Usulü &ldquo;Sepette İndirim&rdquo; (Trendyol Mantığı)
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Müşteri ürünü sepete attığı anda herhangi bir kupon koduna gerek duymaksızın otomatik yansıyan ciro artırıcı indirim kurgusudur.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-600">Otomatik Kural Aktif</span>
                    <div
                      onClick={() => setSepetteForm((p) => ({ ...p, active: !p.active }))}
                      className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                        sepetteForm.active
                          ? "bg-[#0abb87] justify-end"
                          : "bg-[#e2e5ec] justify-start"
                      }`}
                    >
                      <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Kampanya Etiketi (Vitrin Görünümü) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Sepette %10 İndirim"
                        value={sepetteForm.name}
                        onChange={(e) => setSepetteForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        İndirim Oranı / Tutarı <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={sepetteForm.type}
                          onChange={(e) => setSepetteForm((p) => ({ ...p, type: e.target.value }))}
                          className="w-40 h-[40px] px-3 rounded-[8px] border border-slate-300 bg-white text-[13px] font-semibold text-slate-700"
                        >
                          <option value="percent">Yüzde (%)</option>
                          <option value="fixed">Sabit (TL)</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Örn: 10"
                          value={sepetteForm.amount}
                          onChange={(e) => setSepetteForm((p) => ({ ...p, amount: e.target.value }))}
                          className="flex-1 h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] font-bold text-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Geçerli Kategoriler
                      </label>
                      <select
                        value={sepetteForm.category}
                        onChange={(e) => setSepetteForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full h-[40px] px-3 rounded-[8px] border border-slate-300 bg-white text-[13px] font-semibold text-slate-700"
                      >
                        <option value="all">Tüm Ürünlerde Geçerli</option>
                        <option value="specific">Sadece Seçili Kategorilerde</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Minimum Sepet Alt Limiti (TL - Opsiyonel)
                      </label>
                      <input
                        type="number"
                        placeholder="Örn: 1000"
                        value={sepetteForm.minCart}
                        onChange={(e) => setSepetteForm((p) => ({ ...p, minCart: e.target.value }))}
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveRule("sepette")}
                      disabled={loading}
                      className="h-[40px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                    >
                      {loading ? "Kaydediliyor..." : "✓ Pazaryeri Kampanyasını Başlat"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* 5. X AL Y ÖDE (BOGO) KURGUSU                                         */}
            {/* ==================================================================== */}
            {selectedRule === "bogo" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      X Al Y Öde (BOGO) Kurgusu
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Müşteri 3 ürün aldığında 2 ürün parası öder veya 2 alana 1 bedava gibi çoklu alım kurguları.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-600">Kurgu Aktif</span>
                    <div
                      onClick={() => setBogoForm((p) => ({ ...p, active: !p.active }))}
                      className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                        bogoForm.active
                          ? "bg-[#0abb87] justify-end"
                          : "bg-[#e2e5ec] justify-start"
                      }`}
                    >
                      <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Promosyon Adı / Kodu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: 3AL2ODE"
                        value={bogoForm.code}
                        onChange={(e) => setBogoForm((p) => ({ ...p, code: e.target.value }))}
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 font-mono text-[13px] font-bold text-[#1565c0]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Sepete Eklenmesi Gereken Adet
                      </label>
                      <input
                        type="number"
                        value={bogoForm.buyQty}
                        onChange={(e) =>
                          setBogoForm((p) => ({ ...p, buyQty: Number(e.target.value) }))
                        }
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Bedava Verilecek Ürün Adedi
                      </label>
                      <input
                        type="number"
                        value={bogoForm.getQty}
                        onChange={(e) =>
                          setBogoForm((p) => ({ ...p, getQty: Number(e.target.value) }))
                        }
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveRule("bogo")}
                      disabled={loading}
                      className="h-[40px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                    >
                      {loading ? "Kaydediliyor..." : "✓ BOGO Kurgusunu Kaydet & Başlat"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* 6. HEDİYE ÜRÜNLER KURGUSU                                            */}
            {/* ==================================================================== */}
            {selectedRule === "hediye_urun" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      Hediye Ürünler Kurgusu
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Belirlediğiniz tutarın (Örn: 1.000 TL) üzerindeki alışverişlerde müşteriye seçeceği bir hediye ürün verilir.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-600">Hemen Aktifleştir</span>
                    <div
                      onClick={() => setHediyeForm((p) => ({ ...p, active: !p.active }))}
                      className={`w-[48px] h-[25px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                        hediyeForm.active
                          ? "bg-[#0abb87] justify-end"
                          : "bg-[#e2e5ec] justify-start"
                      }`}
                    >
                      <div className="w-[19px] h-[19px] rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Minimum Ürün / Sepet Fiyatı (TL) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={hediyeForm.minPrice}
                        onChange={(e) => setHediyeForm((p) => ({ ...p, minPrice: e.target.value }))}
                        className="w-full h-[40px] px-3.5 rounded-[8px] border border-slate-300 text-[13px] font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                        Geçerli Kategoriler (Çoklu Seçim İçin CTRL Basılı Tutun)
                      </label>
                      <select
                        multiple
                        value={hediyeForm.categoryIds}
                        onChange={(e) => {
                          const opts = Array.from(e.target.selectedOptions, (o) => o.value)
                          setHediyeForm((p) => ({ ...p, categoryIds: opts }))
                        }}
                        className="w-full h-24 p-2 rounded-[8px] border border-slate-300 bg-white text-[12.5px] text-slate-700"
                      >
                        <option value="all">Tüm Kategoriler (Geçerli)</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                      Hediye Olarak Verilecek Ürünleri Seçin <span className="text-rose-500">*</span>
                    </label>
                    <MultiProductAjaxSearch
                      selectedProducts={hediyeForm.selectedProducts}
                      onAdd={(p) =>
                        setHediyeForm((prev) => ({
                          ...prev,
                          selectedProducts: [...prev.selectedProducts, p],
                        }))
                      }
                      onRemove={(id) =>
                        setHediyeForm((prev) => ({
                          ...prev,
                          selectedProducts: prev.selectedProducts.filter((sp) => sp.id !== id),
                        }))
                      }
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveRule("hediye_urun")}
                      disabled={loading}
                      className="h-[40px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                    >
                      {loading ? "Kaydediliyor..." : "✓ Hediye Ürün Kurgusunu Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* 7. SEPETTE FIRSAT ÜRÜNLERİ (AVANTAJLI ÇAPRAZ SATIŞ ÜRÜNLERİ)         */}
            {/* ==================================================================== */}
            {selectedRule === "firsat" && (
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[16px] font-extrabold text-slate-800">
                      Avantajlı Ürünler (Sepet İçi Çapraz Satış Carousel)
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Müşteri sepet sayfasına gittiğinde seçili ürünler sayfanın üstünde &ldquo;Avantajlı Ürün&rdquo; etiketiyle yan yana gösterilir.
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                      Sepette Önerilecek Ürünleri Arayın ve Ekleyin <span className="text-rose-500">*</span>
                    </label>
                    <MultiProductAjaxSearch
                      selectedProducts={cartUpsells}
                      onAdd={(p) => setCartUpsells((prev) => [...prev, p])}
                      onRemove={(id) =>
                        setCartUpsells((prev) => prev.filter((sp) => sp.id !== id))
                      }
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveRule("firsat")}
                      disabled={loading}
                      className="h-[40px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                    >
                      {loading ? "Kaydediliyor..." : "✓ Fırsat Ürünlerini Yayınla"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mevcut Kurgular & Aktif Kuponlar List Card */}
            <div
              id="campaign-existing-list-card"
              className="bg-white rounded-[10px] border border-slate-200 p-6 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[15px] font-extrabold text-slate-800">
                    Mevcut Kurgular &amp; Aktif Kampanya Özetleri
                  </div>
                  <div className="text-[12px] text-slate-500">
                    Mağazanızda şu an tanımlı olan kampanya kurguları ve kullanım istatistikleri.
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#eef4ff] text-[#1565c0] text-[11.5px] font-bold">
                  {campaigns.filter((c) => c.is_active).length} Aktif Kurgu
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((item) => {
                  const badgeStyle =
                    item.badge_color === "emerald"
                      ? "px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10.5px] font-bold"
                      : item.badge_color === "purple"
                      ? "px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10.5px] font-bold"
                      : item.badge_color === "amber"
                      ? "px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10.5px] font-bold"
                      : "px-2 py-0.5 rounded bg-blue-50 text-[#1565c0] text-[10.5px] font-bold"

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-[10px] p-4 hover:border-blue-300 transition-all bg-[#fcfdff]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={badgeStyle}>
                              {item.badge_label || "SEPETE ÖZEL İNDİRİM"}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                              {item.code}
                            </span>
                          </div>
                          <div className="text-[13.5px] font-bold text-slate-800 mt-2">
                            {item.title}
                          </div>
                          <div className="text-[11.5px] text-slate-500 mt-1">
                            Alt Limit:{" "}
                            {item.min_cart_amount > 0
                              ? `${item.min_cart_amount.toLocaleString("tr-TR")} TL`
                              : "Yok"}{" "}
                            • Kullanım: {item.usage_count || 0} Kez
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold">
                          {item.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Süresiz / Aktif</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              selectRuleType(item.rule_type)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="text-[11.5px] font-bold text-[#1565c0] hover:underline cursor-pointer"
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExisting(item.id)}
                            className="text-[11.5px] font-semibold text-rose-500 hover:underline cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.04)]">
        <div className="max-w-[1640px] mx-auto flex items-center justify-between">
          <div className="text-[12.5px] text-slate-500 font-medium">
            Aktif Kurgu Motoru:{" "}
            <strong className="text-slate-800">{RULE_TITLES[selectedRule]}</strong>
          </div>
          <button
            type="button"
            onClick={() => handleSaveRule(selectedRule)}
            disabled={loading || savingOtomasyon}
            className="h-[38px] px-6 rounded-[8px] bg-[#0abb87] hover:bg-[#09a375] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>✓</span>
            <span>{loading || savingOtomasyon ? "Kaydediliyor..." : "Kaydet ve Yayınla"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Kampanyalar",
  icon: SparklesSolid,
})

export default KampanyalarPage
