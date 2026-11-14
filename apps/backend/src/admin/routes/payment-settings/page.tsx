import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { POS_LOGO_SVGS } from "./pos-cargo-logos"

// ─── Types matching /admin/payment-settings/route.ts ──────────────────────────

interface Installment {
  taksit: string
  oran: number
  active: boolean
}

interface PosProviderSetting {
  key: string
  name: string
  active: boolean
  merchant_id: string
  merchant_key: string
  merchant_salt: string
  test_mode: string
  max_installment: number
}

interface MethodRuleConfig {
  active: boolean
  name: string
  list_name?: string
  sort_order?: number
  adjustment_type: string
  adjustment_value: number
  instructions: string
  min_total: number
  max_total: number
}

interface PaymentConfig {
  free_shipping_threshold: number
  paytr: {
    active: boolean
    list_name?: string
    sort_order?: number
    min_total: number
    max_total: number
    merchant_id: string
    merchant_key: string
    merchant_salt: string
    test_mode: string
    disable_3d_secure_intl: boolean
    installments: Installment[]
    pos_providers?: Record<string, PosProviderSetting>
  }
  bank_transfer: MethodRuleConfig
  cash_on_delivery: MethodRuleConfig
  card_on_delivery: MethodRuleConfig
}

const DEFAULT_INSTALLMENTS: Installment[] = [
  { taksit: "Tek Çekim", oran: 0, active: true },
  { taksit: "2 Taksit", oran: 7.31, active: true },
  { taksit: "3 Taksit", oran: 9.35, active: true },
  { taksit: "4 Taksit", oran: 11.38, active: true },
  { taksit: "5 Taksit", oran: 13.43, active: true },
  { taksit: "6 Taksit", oran: 15.46, active: true },
  { taksit: "7 Taksit", oran: 17.49, active: true },
  { taksit: "8 Taksit", oran: 18.53, active: true },
  { taksit: "9 Taksit", oran: 21.58, active: true },
  { taksit: "10 Taksit", oran: 23.8, active: true },
  { taksit: "11 Taksit", oran: 25.84, active: true },
  { taksit: "12 Taksit", oran: 27.68, active: true },
]

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  free_shipping_threshold: 3000,
  paytr: {
    active: true,
    list_name: "Kredi Kartı",
    sort_order: 1,
    min_total: 0,
    max_total: 100000,
    merchant_id: "",
    merchant_key: "",
    merchant_salt: "",
    test_mode: "Kapalı",
    disable_3d_secure_intl: false,
    installments: DEFAULT_INSTALLMENTS,
  },
  bank_transfer: {
    active: true,
    name: "Havale / EFT",
    list_name: "Havale / EFT",
    sort_order: 2,
    adjustment_type: "discount_percentage",
    adjustment_value: 5,
    instructions: "",
    min_total: 0,
    max_total: 100000,
  },
  cash_on_delivery: {
    active: true,
    name: "Kapıda Nakit Ödeme",
    list_name: "Kapıda Ödeme",
    sort_order: 3,
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions: "Kapıda nakit ödeme ile teslimat sırasında ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000,
  },
  card_on_delivery: {
    active: true,
    name: "Kapıda Kredi Kartı İle Ödeme",
    list_name: "Kapıda Ödeme",
    sort_order: 3,
    adjustment_type: "surcharge_amount",
    adjustment_value: 40,
    instructions:
      "Kapıda kredi kartı ödemesi ile teslimat sırasında kartınızla ödemenizi yapabilirsiniz.",
    min_total: 0,
    max_total: 10000,
  },
}

const POS_PROVIDER_LIST: Array<{ key: string; name: string; defaultActive?: boolean }> = [
  { key: "paytr", name: "PayTR", defaultActive: true },
  { key: "moka", name: "Moka" },
  { key: "param", name: "Param" },
  { key: "sipay", name: "SiPay" },
  { key: "garanti", name: "Garanti Bankası Sanal Pos" },
  { key: "akbank", name: "Akbank Sanal Pos" },
  { key: "isbank", name: "Türkiye İş Bankası Sanal Pos" },
  { key: "yapikredi", name: "Yapı Kredi Sanal Pos" },
  { key: "ziraat", name: "Ziraat Bankası Sanal Pos" },
  { key: "qnb", name: "QNB Finansbank Sanal Pos" },
  { key: "halkbank", name: "Halkbank Sanal Pos" },
  { key: "vakifbank", name: "VakıfBank Sanal Pos" },
  { key: "iyzico", name: "iyzico Sanal Pos" },
]

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentSettingsPage = () => {
  const location = useLocation()

  const [config, setConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Active sub-tab in top bar ("odeme" | "eklentiler")
  const searchParams = new URLSearchParams(location.search)
  const initialTab = searchParams.get("tab") === "eklentiler" ? "eklentiler" : "odeme"
  const [activeSubTab, setActiveSubTab] = useState<"odeme" | "eklentiler">(initialTab)

  useEffect(() => {
    const syncTab = () => {
      const sp = new URLSearchParams(window.location.search)
      setActiveSubTab(sp.get("tab") === "eklentiler" ? "eklentiler" : "odeme")
    }
    syncTab()
    window.addEventListener("popstate", syncTab)
    const timer = setInterval(syncTab, 300)
    return () => {
      window.removeEventListener("popstate", syncTab)
      clearInterval(timer)
    }
  }, [location.search])

  // Virtual POS active map & modal state
  const [posProviders, setPosProviders] = useState<Record<string, PosProviderSetting>>(() => {
    const initial: Record<string, PosProviderSetting> = {}
    for (const p of POS_PROVIDER_LIST) {
      initial[p.key] = {
        key: p.key,
        name: p.name,
        active: Boolean(p.defaultActive),
        merchant_id: "",
        merchant_key: "",
        merchant_salt: "",
        test_mode: "Kapalı",
        max_installment: 12,
      }
    }
    return initial
  })

  const [posModalKey, setPosModalKey] = useState<string | null>(null)
  const [posModalForm, setPosModalForm] = useState<PosProviderSetting | null>(null)

  // Extra modals for Taksitler, Kredi Kartı Ayarları, Havale/EFT, Kapıda Ödeme
  const [installmentsModalOpen, setInstallmentsModalOpen] = useState(false)
  const [creditCardSettingsModalOpen, setCreditCardSettingsModalOpen] = useState(false)
  const [ruleModalTarget, setRuleModalTarget] = useState<
    "bank_transfer" | "cash_on_delivery" | "card_on_delivery" | null
  >(null)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/payment-settings", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const raw = data?.config || {}

      const merged: PaymentConfig = {
        ...DEFAULT_PAYMENT_CONFIG,
        ...raw,
        paytr: {
          ...DEFAULT_PAYMENT_CONFIG.paytr,
          ...(raw.paytr || {}),
          installments:
            Array.isArray(raw.paytr?.installments) && raw.paytr.installments.length > 0
              ? raw.paytr.installments
              : DEFAULT_INSTALLMENTS,
        },
        bank_transfer: {
          ...DEFAULT_PAYMENT_CONFIG.bank_transfer,
          ...(raw.bank_transfer || {}),
        },
        cash_on_delivery: {
          ...DEFAULT_PAYMENT_CONFIG.cash_on_delivery,
          ...(raw.cash_on_delivery || {}),
        },
        card_on_delivery: {
          ...DEFAULT_PAYMENT_CONFIG.card_on_delivery,
          ...(raw.card_on_delivery || {}),
        },
      }

      setConfig(merged)

      setPosProviders((prev) => {
        const next = { ...prev }
        if (merged.paytr?.pos_providers) {
          for (const [k, v] of Object.entries(merged.paytr.pos_providers)) {
            if (next[k]) next[k] = { ...next[k], ...v }
          }
        }
        next.paytr = {
          ...next.paytr,
          active: merged.paytr.active ?? true,
          merchant_id: merged.paytr.merchant_id || "",
          merchant_key: merged.paytr.merchant_key || "",
          merchant_salt: merged.paytr.merchant_salt || "",
          test_mode: merged.paytr.test_mode || "Kapalı",
          max_installment: next.paytr.max_installment || 12,
        }
        return next
      })
    } catch (err: any) {
      toast.error("Ödeme ayarları yüklenemedi: " + (err?.message || "Bilinmeyen hata"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const saveConfigToServer = async (
    nextConfig: PaymentConfig,
    nextProviders?: Record<string, PosProviderSetting>,
    successMsg = "Ödeme ayarları kaydedildi"
  ) => {
    const providersToSave = nextProviders || posProviders
    const payloadToSave: PaymentConfig = {
      ...nextConfig,
      paytr: {
        ...nextConfig.paytr,
        active: providersToSave.paytr?.active ?? nextConfig.paytr.active,
        merchant_id: providersToSave.paytr?.merchant_id ?? nextConfig.paytr.merchant_id,
        merchant_key: providersToSave.paytr?.merchant_key ?? nextConfig.paytr.merchant_key,
        merchant_salt: providersToSave.paytr?.merchant_salt ?? nextConfig.paytr.merchant_salt,
        test_mode: providersToSave.paytr?.test_mode ?? nextConfig.paytr.test_mode,
        pos_providers: providersToSave,
      },
    }

    setSaving(true)
    try {
      const res = await fetch("/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadToSave),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `HTTP ${res.status}`)
      }
      if (data.config) {
        setConfig((prev) => ({
          ...prev,
          ...data.config,
          paytr: { ...prev.paytr, ...(data.config.paytr || {}) },
          bank_transfer: { ...prev.bank_transfer, ...(data.config.bank_transfer || {}) },
          cash_on_delivery: {
            ...prev.cash_on_delivery,
            ...(data.config.cash_on_delivery || {}),
          },
          card_on_delivery: {
            ...prev.card_on_delivery,
            ...(data.config.card_on_delivery || {}),
          },
        }))
      }
      toast.success(successMsg)
    } catch (err: any) {
      toast.error("Kaydetme hatası: " + (err?.message || "Bilinmeyen hata"))
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePosProvider = async (posKey: string) => {
    const current = posProviders[posKey]
    if (!current) return
    const updatedProvider = { ...current, active: !current.active }
    const nextProviders = { ...posProviders, [posKey]: updatedProvider }
    setPosProviders(nextProviders)

    const nextConfig =
      posKey === "paytr"
        ? { ...config, paytr: { ...config.paytr, active: updatedProvider.active } }
        : config
    setConfig(nextConfig)
    await saveConfigToServer(
      nextConfig,
      nextProviders,
      `${updatedProvider.name} durumu ${updatedProvider.active ? "Aktif" : "Pasif"} olarak güncellendi`
    )
  }

  const openPaymentPosModal = (posKey: string, posName: string) => {
    const existing = posProviders[posKey] || {
      key: posKey,
      name: posName,
      active: false,
      merchant_id: "",
      merchant_key: "",
      merchant_salt: "",
      test_mode: "Kapalı",
      max_installment: 12,
    }
    setPosModalKey(posKey)
    setPosModalForm({ ...existing })
  }

  const handleSavePosModal = async () => {
    if (!posModalKey || !posModalForm) return
    const nextProviders = {
      ...posProviders,
      [posModalKey]: { ...posModalForm },
    }
    setPosProviders(nextProviders)
    setPosModalKey(null)

    const nextConfig =
      posModalKey === "paytr"
        ? {
            ...config,
            paytr: {
              ...config.paytr,
              active: posModalForm.active,
              merchant_id: posModalForm.merchant_id,
              merchant_key: posModalForm.merchant_key,
              merchant_salt: posModalForm.merchant_salt,
              test_mode: posModalForm.test_mode,
            },
          }
        : config
    setConfig(nextConfig)
    await saveConfigToServer(
      nextConfig,
      nextProviders,
      `${posModalForm.name} ayarları kaydedildi`
    )
  }

  const handleToggleRuleActive = async (key: "cash_on_delivery" | "card_on_delivery") => {
    const nextRule = {
      ...config[key],
      active: !config[key].active,
    }
    const nextConfig = {
      ...config,
      [key]: nextRule,
    }
    setConfig(nextConfig)
    await saveConfigToServer(
      nextConfig,
      posProviders,
      `${nextRule.name} durumu ${nextRule.active ? "Aktif" : "Pasif"} olarak güncellendi`
    )
  }

  const updateInstallmentRate = (idx: number, newRate: number) => {
    setConfig({
      ...config,
      paytr: {
        ...config.paytr,
        installments: config.paytr.installments.map((item, i) =>
          i === idx ? { ...item, oran: newRate } : item
        ),
      },
    })
  }

  const toggleInstallmentActive = (idx: number) => {
    setConfig({
      ...config,
      paytr: {
        ...config.paytr,
        installments: config.paytr.installments.map((item, i) =>
          i === idx ? { ...item, active: !item.active } : item
        ),
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-12 text-[13px] text-[#64748b]">
        Ödeme yöntemleri yükleniyor...
      </div>
    )
  }

  const activeRuleForModal = ruleModalTarget ? config[ruleModalTarget] : null

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#1e293b] pb-16">
      {/* Sub-view 1: Ödeme Yöntemleri */}
      {activeSubTab === "odeme" && (
        <div className="max-w-[920px] mx-auto px-4 py-7">
          {/* Aktif Ödeme Yöntemleri Title */}
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#0f766e] mb-3.5">
            <span className="text-[14px] leading-none font-black">&gt;</span>
            <span>Aktif Ödeme Yöntemleri</span>
          </div>

          <div className="space-y-4">
            {/* 1. Kredi Kartı Card */}
            <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Credit Card Illustration */}
                  <div className="w-14 h-11 flex items-center justify-center shrink-0">
                    <svg width="54" height="42" viewBox="0 0 54 42" fill="none">
                      <rect
                        x="3"
                        y="11"
                        width="34"
                        height="22"
                        rx="3"
                        transform="rotate(-10 3 11)"
                        fill="#0f766e"
                      />
                      <rect
                        x="5"
                        y="16"
                        width="34"
                        height="4"
                        transform="rotate(-10 5 16)"
                        fill="#115e59"
                      />
                      <rect
                        x="14"
                        y="13"
                        width="35"
                        height="23"
                        rx="3"
                        fill="#64748b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <rect x="14" y="18" width="35" height="4.5" fill="#334155" />
                      <rect
                        x="18"
                        y="26"
                        width="7"
                        height="5"
                        rx="1"
                        fill="#fbbf24"
                      />
                      <circle cx="41" cy="29" r="3" fill="#ef4444" />
                      <circle
                        cx="44"
                        cy="29"
                        r="3"
                        fill="#f59e0b"
                        fillOpacity="0.85"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#1e293b]">
                      Kredi Kartı
                    </div>
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      Liste Adı:{" "}
                      <span className="text-[#334155]">
                        {config.paytr.list_name || "Kredi Kartı"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748b]">
                      Sıra: {config.paytr.sort_order ?? 1}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInstallmentsModalOpen(true)}
                    className="h-[28px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[11.5px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <span className="font-bold text-[#475569]">%</span> Taksitler
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditCardSettingsModalOpen(true)}
                    className="h-[28px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[11.5px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-[#475569]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Ayarlar
                  </button>
                </div>
              </div>

              {/* Scrollable Virtual POS & Bank List */}
              <div className="max-h-[310px] overflow-y-auto divide-y divide-gray-100">
                {POS_PROVIDER_LIST.map((item) => {
                  const providerState = posProviders[item.key]
                  const isActive = Boolean(providerState?.active)
                  const logoHtml = POS_LOGO_SVGS[item.key] || ""

                  return (
                    <div
                      key={item.key}
                      className="px-6 py-2.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePosProvider(item.key)}
                          title="Durumu Değiştir (Aktif / Pasif)"
                          className={`w-4 h-4 flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                            isActive
                              ? "text-[#10b981] font-black text-[14px]"
                              : "rounded-full bg-[#475569] text-white text-[11px] font-black leading-none"
                          }`}
                        >
                          {isActive ? "✓" : "−"}
                        </button>
                        <div
                          className="shrink-0"
                          dangerouslySetInnerHTML={{ __html: logoHtml }}
                        />
                        <span className="text-[12px] text-[#334155] font-medium">
                          {item.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPaymentPosModal(item.key, item.name)}
                        className="h-[25px] px-2.5 rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <span className="text-[11px]">✎</span> Bilgiler
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. Havale / EFT Card */}
            <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-11 flex items-center justify-center shrink-0">
                  <svg width="50" height="42" viewBox="0 0 50 42" fill="none">
                    <rect
                      x="8"
                      y="6"
                      width="34"
                      height="30"
                      rx="3"
                      fill="#f1f5f9"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M14 14h22M14 20h14M14 26h18"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="35" cy="26" r="6" fill="#0ea5e9" />
                    <path
                      d="M33 26h4m-2-2v4"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#1e293b]">
                    Havale / EFT
                  </div>
                  <div className="text-[11px] text-[#64748b] mt-0.5">
                    Liste Adı:{" "}
                    <span className="text-[#334155]">
                      {config.bank_transfer.list_name ||
                        config.bank_transfer.name ||
                        "Havale / EFT"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Sıra: {config.bank_transfer.sort_order ?? 2}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRuleModalTarget("bank_transfer")}
                  className="h-[28px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[11.5px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#334155] text-white text-[9px] font-bold flex items-center justify-center">
                    i
                  </span>
                  Banka Hesapları
                </button>
                <button
                  type="button"
                  onClick={() => setRuleModalTarget("bank_transfer")}
                  className="h-[28px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[11.5px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#475569]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Ayarlar
                </button>
              </div>
            </div>

            {/* 3. Kapıda Ödeme Card */}
            <div className="bg-white rounded-[6px] border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-11 flex items-center justify-center shrink-0">
                    <svg width="50" height="42" viewBox="0 0 50 42" fill="none">
                      <rect
                        x="6"
                        y="12"
                        width="28"
                        height="18"
                        rx="2"
                        fill="#10b981"
                      />
                      <circle cx="20" cy="21" r="4" fill="#d1fae5" />
                      <rect
                        x="22"
                        y="8"
                        width="22"
                        height="22"
                        rx="3"
                        fill="#f59e0b"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M28 19h10M33 14v10"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#1e293b]">
                      Kapıda Ödeme
                    </div>
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      Liste Adı:{" "}
                      <span className="text-[#334155]">
                        {config.cash_on_delivery.list_name || "Kapıda Ödeme"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748b]">
                      Sıra: {config.cash_on_delivery.sort_order ?? 3}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRuleModalTarget("cash_on_delivery")}
                  className="h-[28px] px-3 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#334155] text-[11.5px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#475569]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Ayarlar
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-2.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive("cash_on_delivery")}
                      title="Durumu Değiştir (Aktif / Pasif)"
                      className={`w-4 h-4 flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                        config.cash_on_delivery.active
                          ? "text-[#10b981] font-black text-[14px]"
                          : "rounded-full bg-[#475569] text-white text-[11px] font-black leading-none"
                      }`}
                    >
                      {config.cash_on_delivery.active ? "✓" : "−"}
                    </button>
                    <span className="text-[12px] text-[#334155] font-medium">
                      Kapıda Nakit Ödeme
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRuleModalTarget("cash_on_delivery")}
                    className="h-[25px] px-2.5 rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <span className="text-[11px]">✎</span> Bilgiler
                  </button>
                </div>
                <div className="px-6 py-2.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive("card_on_delivery")}
                      title="Durumu Değiştir (Aktif / Pasif)"
                      className={`w-4 h-4 flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                        config.card_on_delivery.active
                          ? "text-[#10b981] font-black text-[14px]"
                          : "rounded-full bg-[#475569] text-white text-[11px] font-black leading-none"
                      }`}
                    >
                      {config.card_on_delivery.active ? "✓" : "−"}
                    </button>
                    <span className="text-[12px] text-[#334155] font-medium">
                      Kapıda Kredi Kartı İle Ödeme
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRuleModalTarget("card_on_delivery")}
                    className="h-[25px] px-2.5 rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-[#475569] text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <span className="text-[11px]">✎</span> Bilgiler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view 2: Eklentiler (/admin/tools/apps 1:1) */}
      {activeSubTab === "eklentiler" && (
        <div className="max-w-[1220px] mx-auto px-4 py-7">
          {/* Top Callout */}
          <div className="bg-white border-l-[10px] border-[#c0c5d9] rounded-[5px] px-[25px] py-[20px] mb-[22px] text-[14px] text-[#48465b] shadow-2xs">
            Mağazanızın hızını, dönüşüm oranlarını ve kurumsal iletişimini güçlendiren resmi EntegreShop uygulama ve eklentilerini buradan yönetebilirsiniz.
          </div>

          {/* .apps 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px] mb-8">
            {[
              {
                icon: "🚀",
                bg: "#e0f6e7",
                title: "Rocket (Gelişmiş Önbellek / Cache)",
                desc: "Sayfa açılış hızlarını maksimuma çıkaran tam sayfa ve sorgu önbellekleme teknolojisi.",
                badge: "Aktif",
              },
              {
                icon: "✉️",
                bg: "#e0edff",
                title: "Kurumsal Webmail Yönetimi",
                desc: "Alan adınıza özel kurumsal e-posta hesapları oluşturun ve webmail üzerinden yönetin.",
                badge: "4 Hesap",
              },
              {
                icon: "📋",
                bg: "#fef3c7",
                title: "Toplu Teklif & İhale Modülü",
                desc: "Müşterilerinizin ve bayilerinizin sepetteki ürünler için toplu fiyat teklifi istemesini sağlayın.",
                badge: "Aktif",
              },
              {
                icon: "✨",
                bg: "#f3e8ff",
                title: "Yapay Zeka (Text AI & Image Studio)",
                desc: "Ürün açıklaması, SEO meta üretimi, yorum analizi ve yapay zeka ürün görseli iyileştirme.",
                badge: "18.741 Kontör",
              },
              {
                icon: "💬",
                bg: "#dcfce7",
                title: "WhatsApp & Canlı Destek Balonu",
                desc: "Site sağ alt köşesinde departman bazlı hızlı WhatsApp sipariş ve müşteri destek butonu.",
                badge: "Aktif",
              },
              {
                icon: "📸",
                bg: "#fce7f3",
                title: "Instagram & Reels Mağaza Vitrin",
                desc: "Instagram gönderilerinizi ve Reels videolarınızı ürün etiketleriyle ana sayfada sergileyin.",
                badge: "Aktif",
              },
              {
                icon: "⭐",
                bg: "#fef9c3",
                title: "Google Müşteri Yorumları & Rich Snippets",
                desc: "Google arama sonuçlarında yıldızlı ürün puanları ve doğrulanmış mağaza rozeti gösterimi.",
                badge: "Aktif",
              },
              {
                icon: "🛍️",
                bg: "#e0f2fe",
                title: "Ürün Kombin & Birlikte Al (Bundle)",
                desc: "Ürün detay sayfasında tamamlayıcı ürünleri kombin olarak indirimli satarak sepeti büyütün.",
                badge: "Aktif",
              },
              {
                icon: "📏",
                bg: "#f1f5f9",
                title: "Akıllı Beden & Araç Uyumluluk Sihirbazı",
                desc: "Müşterinin boy/kilo veya araç marka/model/yıl seçimine göre %100 uyumlu ürünü önerir.",
                badge: "Aktif",
              },
            ].map((app) => (
              <div
                key={app.title}
                className="bg-white rounded-[8px] border border-[#ebedf2] p-[20px] shadow-2xs hover:shadow-md transition flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-[18px]">
                  <div
                    className="w-[70px] h-[70px] rounded-[6px] border border-[#ebedf2] shadow-xs flex items-center justify-center text-[30px] shrink-0"
                    style={{ background: app.bg }}
                  >
                    {app.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[15px] font-semibold text-[#232323] leading-snug">
                        {app.title}
                      </div>
                    </div>
                    <div className="text-[13px] text-[#74788d] leading-relaxed">{app.desc}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#f1f3f6] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#e0f6e7] text-[#08976d] text-[12px] font-semibold">
                    <span>✓</span> {app.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("apps-detail-panel")
                      if (el) el.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="h-[32px] px-3.5 rounded-[4px] border border-[#cbd5e1] hover:border-[#3d94fb] hover:text-[#3d94fb] bg-white text-[#48465b] text-[12px] font-semibold cursor-pointer transition"
                  >
                    ⚙ Ayarlar &amp; Yönet
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Eklenti Detay & Yönetim Panelleri (Rocket Cache + Webmail Hesapları) */}
          <div id="apps-detail-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rocket Cache Card */}
            <div className="lg:col-span-5 bg-white rounded-[6px] border border-[#ebedf2] p-[24px] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[16px] font-bold text-[#48465b] flex items-center gap-2">
                    🚀 Rocket Önbellek (Cache) Sistemi
                  </h3>
                  <span className="px-2.5 py-1 rounded bg-[#e0f6e7] text-[#08976d] text-[11.5px] font-bold">
                    Aktif
                  </span>
                </div>
                <p className="text-[12.5px] text-[#74788d] leading-relaxed mb-4">
                  Tasarım, kategori veya blok ayarlarında yaptığınız değişikliklerin sitede anında görünmesi için Rocket önbelleğini temizleyebilirsiniz.
                </p>
                <div className="space-y-2.5 mb-5 text-[13px]">
                  <label className="flex items-center justify-between py-2 border-b border-slate-100 cursor-pointer">
                    <span className="text-[#48465b]">HTML Sayfa Önbellekleme (Full Page Cache)</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  </label>
                  <label className="flex items-center justify-between py-2 border-b border-slate-100 cursor-pointer">
                    <span className="text-[#48465b]">CSS / JS Otomatik Küçültme (Minify)</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  </label>
                  <label className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-[#48465b]">Stok Güncellemesinde Otomatik Önbellek Yenile</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success("Rocket önbelleği (Cache) başarıyla temizlendi!")}
                className="w-full h-[38px] rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[13px] font-bold cursor-pointer shadow-xs"
              >
                🚀 Tüm Önbelleği Şimdi Temizle
              </button>
            </div>

            {/* Kurumsal Webmail Hesapları Table */}
            <div className="lg:col-span-7 bg-white rounded-[6px] border border-[#ebedf2] p-[24px] shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[#48465b]">
                    ✉️ Kurumsal Webmail Hesapları
                  </h3>
                  <p className="text-[12.5px] text-[#74788d] mt-0.5">
                    Mağaza alan adınıza tanımlı kurumsal e-posta adresleri
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Yeni Kurumsal E-Posta Hesabı oluşturma penceresi açıldı.")}
                  className="h-[34px] px-3.5 rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[12.5px] font-semibold cursor-pointer"
                >
                  + Yeni E-Posta Hesabı
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                      <th className="py-2.5 px-3">E-Posta Adresi</th>
                      <th className="py-2.5 px-3">Kullanım / Kota</th>
                      <th className="py-2.5 px-3 text-center">Durum</th>
                      <th className="py-2.5 px-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                    {[
                      { email: "info@kombingo.com", quota: "420 MB / 5 GB" },
                      { email: "siparis@kombingo.com", quota: "1.1 GB / 5 GB" },
                      { email: "destek@kombingo.com", quota: "280 MB / 5 GB" },
                      { email: "muhasebe@kombingo.com", quota: "640 MB / 5 GB" },
                    ].map((acct) => (
                      <tr key={acct.email}>
                        <td className="py-2.5 px-3 font-semibold">{acct.email}</td>
                        <td className="py-2.5 px-3 text-[#74788d]">{acct.quota}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex w-[20px] h-[20px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toast.success(`${acct.email} Webmail oturumu açılıyor...`)}
                              className="h-[26px] px-2.5 rounded-[4px] bg-[#3d94fb] text-white text-[11.5px] font-medium cursor-pointer"
                            >
                              Webmail
                            </button>
                            <button
                              type="button"
                              className="w-[26px] h-[26px] rounded-[4px] bg-[#9b59b6] text-white text-[11px] cursor-pointer"
                            >
                              👁
                            </button>
                            <button
                              type="button"
                              className="w-[26px] h-[26px] rounded-[4px] bg-[#e74c3c] text-white text-[11px] cursor-pointer"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sanal POS Ayarları Modal (payment-pos-modal) ───────────────────────── */}
      {posModalKey && posModalForm && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setPosModalKey(null)}
        >
          <div
            className="bg-white w-full max-w-[540px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Sanal POS Ayarları
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  {posModalForm.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPosModalKey(null)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between bg-[#f8fafc] border border-gray-200 rounded-[4px] p-3">
                <div
                  className="shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: POS_LOGO_SVGS[posModalKey] || "",
                  }}
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[12px] font-bold text-[#334155]">
                    Durum (Aktif)
                  </span>
                  <input
                    type="checkbox"
                    checked={posModalForm.active}
                    onChange={(e) =>
                      setPosModalForm({
                        ...posModalForm,
                        active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-[#10b981] accent-[#10b981] cursor-pointer"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Mağaza No (Merchant ID)
                  </label>
                  <input
                    type="text"
                    value={posModalForm.merchant_id}
                    onChange={(e) =>
                      setPosModalForm({
                        ...posModalForm,
                        merchant_id: e.target.value,
                      })
                    }
                    placeholder="Örn: 109283"
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Maksimum Taksit Sayısı
                  </label>
                  <select
                    value={posModalForm.max_installment}
                    onChange={(e) =>
                      setPosModalForm({
                        ...posModalForm,
                        max_installment: Number(e.target.value),
                      })
                    }
                    className="w-full h-[32px] px-2.5 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] bg-white focus:outline-none focus:border-[#0b5ed7]"
                  >
                    <option value={12}>12 Taksit</option>
                    <option value={9}>9 Taksit</option>
                    <option value={6}>6 Taksit</option>
                    <option value={3}>3 Taksit</option>
                    <option value={1}>Tek Çekim</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    API Anahtarı (Merchant Key)
                  </label>
                  <input
                    type="password"
                    value={posModalForm.merchant_key}
                    onChange={(e) =>
                      setPosModalForm({
                        ...posModalForm,
                        merchant_key: e.target.value,
                      })
                    }
                    placeholder="••••••••••••••••"
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Gizli Anahtar (Merchant Salt / Secret)
                  </label>
                  <input
                    type="password"
                    value={posModalForm.merchant_salt}
                    onChange={(e) =>
                      setPosModalForm({
                        ...posModalForm,
                        merchant_salt: e.target.value,
                      })
                    }
                    placeholder="••••••••••••••••"
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px] text-[#1e293b] focus:outline-none focus:border-[#0b5ed7]"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPosModalKey(null)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSavePosModal}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>✓</span> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── % Taksitler Modal ─────────────────────────────────────────────────── */}
      {installmentsModalOpen && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setInstallmentsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[720px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Kredi Kartı Taksit Oranları
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Taksit Komisyon Matrisi
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstallmentsModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="border border-gray-200 rounded-[4px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-gray-200 text-[11px] font-bold text-[#475569]">
                      <th className="py-2.5 px-4">Durum</th>
                      <th className="py-2.5 px-4">Taksit Seçeneği</th>
                      <th className="py-2.5 px-4">Komisyon Oranı (%)</th>
                      <th className="py-2.5 px-4">Örnek 1.000 TL Sepet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[12px]">
                    {(config.paytr.installments || DEFAULT_INSTALLMENTS).map(
                      (r, idx) => {
                        const totalFor1000 = 1000 * (1 + Number(r.oran || 0) / 100)
                        return (
                          <tr key={r.taksit} className="hover:bg-gray-50/70">
                            <td className="py-2 px-4">
                              <input
                                type="checkbox"
                                checked={r.active}
                                onChange={() => toggleInstallmentActive(idx)}
                                className="w-4 h-4 rounded border-gray-300 text-[#10b981] accent-[#10b981] cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-4 font-semibold text-[#1e293b]">
                              {r.taksit}
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={r.oran}
                                onChange={(e) =>
                                  updateInstallmentRate(
                                    idx,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-28 h-[28px] px-2.5 rounded-[4px] border border-gray-300 text-[12px]"
                              />
                            </td>
                            <td className="py-2 px-4 text-[#475569]">
                              {totalFor1000.toFixed(2)} TL
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setInstallmentsModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                Kapat
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await saveConfigToServer(
                    config,
                    posProviders,
                    "Taksit oranları kaydedildi"
                  )
                  setInstallmentsModalOpen(false)
                }}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Kredi Kartı Genel Ayarlar Modal ────────────────────────────────────── */}
      {creditCardSettingsModalOpen && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setCreditCardSettingsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[520px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Ödeme Yöntemleri
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  Kredi Kartı Ayarları
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreditCardSettingsModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Liste Adı
                  </label>
                  <input
                    type="text"
                    value={config.paytr.list_name || "Kredi Kartı"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        paytr: { ...config.paytr, list_name: e.target.value },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Sıra
                  </label>
                  <input
                    type="number"
                    value={config.paytr.sort_order ?? 1}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        paytr: {
                          ...config.paytr,
                          sort_order: Number(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Min. Sipariş Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={config.paytr.min_total}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        paytr: {
                          ...config.paytr,
                          min_total: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Maks. Sipariş Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={config.paytr.max_total}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        paytr: {
                          ...config.paytr,
                          max_total: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.paytr.disable_3d_secure_intl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      paytr: {
                        ...config.paytr,
                        disable_3d_secure_intl: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#0284c7] accent-[#0284c7]"
                />
                <span className="text-[12px] text-[#334155]">
                  Yurtdışı kartlarda 3D Secure zorunluluğunu kaldır
                </span>
              </label>
            </div>
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreditCardSettingsModalOpen(false)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await saveConfigToServer(
                    config,
                    posProviders,
                    "Kredi kartı ayarları kaydedildi"
                  )
                  setCreditCardSettingsModalOpen(false)
                }}
                className="h-[32px] px-4 rounded-[4px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>✓</span> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Havale / EFT ve Kapıda Ödeme Modal ─────────────────────────────────── */}
      {ruleModalTarget && activeRuleForModal && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setRuleModalTarget(null)}
        >
          <div
            className="bg-white w-full max-w-[540px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/80 font-medium">
                  Ödeme Yöntemi Ayarları
                </div>
                <div className="text-[17px] font-bold tracking-tight">
                  {activeRuleForModal.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRuleModalTarget(null)}
                className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-[18px] font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between bg-[#f8fafc] border border-gray-200 rounded-[4px] p-3">
                <span className="text-[12.5px] font-bold text-[#1e293b]">
                  {activeRuleForModal.name} Durumu
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[12px] font-semibold text-[#334155]">
                    Aktif
                  </span>
                  <input
                    type="checkbox"
                    checked={activeRuleForModal.active}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [ruleModalTarget]: {
                          ...activeRuleForModal,
                          active: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-[#10b981] accent-[#10b981]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Liste Adı
                  </label>
                  <input
                    type="text"
                    value={activeRuleForModal.name}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [ruleModalTarget]: {
                          ...activeRuleForModal,
                          name: e.target.value,
                          list_name: e.target.value,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Ek Hizmet Bedeli / İndirim Değeri
                  </label>
                  <input
                    type="number"
                    value={activeRuleForModal.adjustment_value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [ruleModalTarget]: {
                          ...activeRuleForModal,
                          adjustment_value: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Min. Sipariş Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={activeRuleForModal.min_total}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [ruleModalTarget]: {
                          ...activeRuleForModal,
                          min_total: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Maks. Sipariş Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={activeRuleForModal.max_total}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [ruleModalTarget]: {
                          ...activeRuleForModal,
                          max_total: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full h-[32px] px-3 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    Banka Hesap Bilgileri / Açıklama Metni
                  </label>
                  <textarea
                    rows={4}
                    value={activeRuleForModal.instructions || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [ruleModalTarget]: {
                          ...activeRuleForModal,
                          instructions: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-[4px] border border-gray-300 text-[12px]"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRuleModalTarget(null)}
                className="h-[32px] px-4 rounded-[4px] border border-gray-300 bg-white hover:bg-gray-50 text-[#475569] text-[12px] font-semibold"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await saveConfigToServer(
                    config,
                    posProviders,
                    `${activeRuleForModal.name} ayarları kaydedildi`
                  )
                  setRuleModalTarget(null)
                }}
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
  label: "Ödeme Yöntemleri",
  icon: CreditCard,
})

export default PaymentSettingsPage
