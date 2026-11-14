import React, { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"

interface ConnectedMarketplaceAccount {
  id: string
  storeName: string
  sellerId: string
  apiKey: string
  apiSecret: string
  productCount: number
}

interface MarketplaceDefinition {
  key: string
  title: string
  hasApplyButton?: boolean
  logo: React.ReactNode
}

const MARKETPLACE_DEFINITIONS: MarketplaceDefinition[] = [
  {
    key: "n11",
    title: "N11 Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="25" r="19" fill="#5B2D90" />
        <path d="M18 8.5C15.5 6 12 5.5 10 7" stroke="#5B2D90" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M30 8.5C32.5 6 36 5.5 38 7" stroke="#5B2D90" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="15" cy="15" r="2.6" fill="#F59E0B" />
        <circle cx="23" cy="12.5" r="2" fill="#EF4444" />
        <circle cx="32" cy="15" r="2.8" fill="#F59E0B" />
        <circle cx="36.5" cy="23" r="2.2" fill="#10B981" />
        <circle cx="11.5" cy="23" r="2.2" fill="#EC4899" />
        <circle cx="15" cy="34" r="2.5" fill="#F59E0B" />
        <circle cx="33" cy="34" r="2.5" fill="#F59E0B" />
        <text
          x="24"
          y="29.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="14.5"
          letterSpacing="-0.5"
        >
          n11
        </text>
      </svg>
    ),
  },
  {
    key: "hepsiburada",
    title: "Hepsiburada Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="44" height="40" rx="8" fill="#FFF7ED" stroke="#FFEDD5" />
        <text
          x="24"
          y="19"
          textAnchor="middle"
          fill="#FF6000"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="10.5"
          letterSpacing="-0.3"
        >
          hepsi
        </text>
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="#FF6000"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="10.5"
          letterSpacing="-0.3"
        >
          burada
        </text>
        <rect x="7" y="34.5" width="9" height="3.5" rx="1.5" fill="#FF6000" />
        <rect x="17.5" y="34.5" width="7" height="3.5" rx="1.5" fill="#00B4D8" />
        <rect x="26" y="34.5" width="7" height="3.5" rx="1.5" fill="#7209B7" />
        <rect x="34.5" y="34.5" width="6.5" height="3.5" rx="1.5" fill="#2EC4B6" />
      </svg>
    ),
  },
  {
    key: "pttavm",
    title: "PttAVM Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="42" height="38" rx="8" fill="#1E40AF" />
        <path d="M12 5H36L33 9.5H15L12 5Z" fill="#FACC15" />
        <text
          x="24"
          y="22.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="13.5"
          letterSpacing="-0.3"
        >
          ptt
        </text>
        <text
          x="24"
          y="35.5"
          textAnchor="middle"
          fill="#93C5FD"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="12.5"
          letterSpacing="-0.3"
        >
          avm
        </text>
      </svg>
    ),
  },
  {
    key: "amazon",
    title: "Amazon Türkiye Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="44" height="40" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
        <path
          d="M29.5 23.5V18.5C29.5 14.5 26.8 12 22.2 12C18.2 12 15.6 14 15.2 17L19.2 17.6C19.5 16 20.6 15.1 22.2 15.1C24.1 15.1 25.2 16.1 25.2 17.8V18.6L20.5 19.2C16.4 19.7 14.2 21.6 14.2 24.8C14.2 28.1 16.7 30.2 20 30.2C22.6 30.2 24.5 29.1 25.6 27.4C25.8 28.4 26.2 29.2 27 29.9L30.4 27.8C29.7 26.9 29.5 25.6 29.5 23.5ZM25.2 22.8C25.2 25.1 23.6 26.8 21.2 26.8C19.5 26.8 18.5 25.9 18.5 24.5C18.5 22.9 19.8 22 22.2 21.7L25.2 21.3V22.8Z"
          fill="#0F172A"
        />
        <path d="M10.5 33.2C16.2 37.6 25.8 38.4 34.8 33.6" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M32.2 31.2L36.2 33.1L34.2 37"
          stroke="#FF9900"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "trendyol",
    title: "Trendyol Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="44" height="40" rx="8" fill="#F27A1A" />
        <rect x="5.5" y="16" width="37" height="16" rx="2.5" fill="#111827" />
        <text
          x="24"
          y="26.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="8.2"
          letterSpacing="0.2"
        >
          trendyol
        </text>
      </svg>
    ),
  },
  {
    key: "ciceksepeti",
    title: "ÇiçekSepeti Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 22C22 14 14 9 9 13C5 17 12 22 22 22Z" fill="#84CC16" />
        <path d="M26 22C26 14 34 9 39 13C43 17 36 22 26 22Z" fill="#F97316" />
        <path d="M22 26C22 34 14 39 9 35C5 31 12 26 22 26Z" fill="#EF4444" />
        <path d="M26 26C26 34 34 39 39 35C43 31 36 26 26 26Z" fill="#0EA5E9" />
        <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    key: "modanisa",
    title: "Modanisa Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="#F26522">
          <ellipse cx="24" cy="12" rx="4" ry="8" />
          <ellipse cx="24" cy="36" rx="4" ry="8" />
          <ellipse cx="12" cy="24" rx="8" ry="4" />
          <ellipse cx="36" cy="24" rx="8" ry="4" />
          <ellipse cx="15.5" cy="15.5" rx="4" ry="8" transform="rotate(-45 15.5 15.5)" />
          <ellipse cx="32.5" cy="32.5" rx="4" ry="8" transform="rotate(-45 32.5 32.5)" />
          <ellipse cx="32.5" cy="15.5" rx="4" ry="8" transform="rotate(45 32.5 15.5)" />
          <ellipse cx="15.5" cy="32.5" rx="4" ry="8" transform="rotate(45 15.5 32.5)" />
        </g>
        <circle cx="24" cy="24" r="4.5" fill="#F26522" />
      </svg>
    ),
  },
  {
    key: "pazarama",
    title: "Pazarama Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 40V18C12 11.5 17.2 7 24.5 7C31.5 7 36.5 11.5 36.5 18C36.5 24.5 31.5 29 24.5 29H18.5V40H12Z"
          fill="#1D4ED8"
        />
        <path
          d="M24.5 7C31.5 7 36.5 11.5 36.5 18C36.5 24.5 31.5 29 24.5 29H19.5V22.5H24.5C27.5 22.5 29.8 20.6 29.8 18C29.8 15.4 27.5 13.5 24.5 13.5H18.5V7H24.5Z"
          fill="#EC4899"
        />
        <circle cx="24.2" cy="18" r="5" fill="#FFFFFF" />
        <path d="M12 27.5L18.5 23V40H12V27.5Z" fill="#06B6D4" />
      </svg>
    ),
  },
  {
    key: "farmazon",
    title: "Farmazon Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="44" height="40" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
        <text
          x="24"
          y="33"
          textAnchor="middle"
          fill="#0F172A"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="27"
          letterSpacing="-1.5"
        >
          fa
        </text>
      </svg>
    ),
  },
  {
    key: "idefix",
    title: "İdefix Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="6" width="8" height="8" rx="1.5" fill="#E11D48" />
        <path d="M20 18L28 15V34L20 41V18Z" fill="#0284C7" />
        <path d="M20 18L28 23V30L20 25V18Z" fill="#E11D48" />
      </svg>
    ),
  },
  {
    key: "lcwaikiki",
    title: "LC Waikiki Mağazalarım",
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="42" height="38" rx="8" fill="#003876" />
        <text
          x="24"
          y="24"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="13.5"
          letterSpacing="0.4"
        >
          LCW
        </text>
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fill="#93C5FD"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="6.8"
          letterSpacing="0.6"
        >
          LCW.COM
        </text>
      </svg>
    ),
  },
  {
    key: "temu",
    title: "Temu Mağazalarım",
    hasApplyButton: true,
    logo: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="42" height="38" rx="8" fill="#FB7701" />
        <circle cx="14" cy="15.5" r="2.2" fill="#FFFFFF" />
        <rect x="20.5" y="13.2" width="4.5" height="4.5" rx="1" fill="#FFFFFF" />
        <path d="M29.5 17.8L32 13.2L34.5 17.8H29.5Z" fill="#FFFFFF" />
        <text
          x="24"
          y="33.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="900"
          fontSize="11.5"
          letterSpacing="0.6"
        >
          TEMU
        </text>
      </svg>
    ),
  },
]

const PazaryeriPage = () => {
  const [activeTab, setActiveTab] = useState<string>("magazalar")
  const [lastSyncedSearch, setLastSyncedSearch] = useState<string>("")

  // Connected marketplace stores state (Trendyol comes pre-populated with "GİYİM / 14 Ürün" exactly as on localhost:3095)
  const [connectedByMp, setConnectedByMp] = useState<Record<string, ConnectedMarketplaceAccount[]>>({
    trendyol: [
      {
        id: "ty_giyim",
        storeName: "GİYİM",
        sellerId: "104829",
        apiKey: "••••••••••••••••",
        apiSecret: "••••••••••••••••",
        productCount: 14,
      },
    ],
  })

  // Modal state matching #marketplace-add-modal from localhost:3095
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("Yeni Mağaza Ekle")
  const [modalMpKey, setModalMpKey] = useState<string>("trendyol")
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [formStoreName, setFormStoreName] = useState("")
  const [formSellerId, setFormSellerId] = useState("")
  const [formApiKey, setFormApiKey] = useState("")
  const [formApiSecret, setFormApiSecret] = useState("")

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return
      const currentSearch = window.location.search
      setLastSyncedSearch((prev) => {
        if (prev === currentSearch) return prev
        const params = new URLSearchParams(currentSearch)
        const tabParam = params.get("tab")
        if (
          tabParam &&
          [
            "magazalar",
            "fiyat-rekabeti",
            "icerik-eslestirmeleri",
            "urun-gonderimleri",
            "urun-eslestirmeleri",
          ].includes(tabParam)
        ) {
          setActiveTab(tabParam)
        } else if (!tabParam) {
          setActiveTab("magazalar")
        }
        return currentSearch
      })
    }
    syncFromUrl()
    window.addEventListener("popstate", syncFromUrl)
    const interval = setInterval(syncFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncFromUrl)
      clearInterval(interval)
    }
  }, [])

  const openMarketplaceModal = (
    mpKey: string,
    title: string,
    existingAccount?: ConnectedMarketplaceAccount
  ) => {
    setModalMpKey(mpKey)
    setModalTitle(title)
    if (existingAccount) {
      setEditingAccountId(existingAccount.id)
      setFormStoreName(existingAccount.storeName)
      setFormSellerId(existingAccount.sellerId)
      setFormApiKey(existingAccount.apiKey)
      setFormApiSecret(existingAccount.apiSecret)
    } else {
      setEditingAccountId(null)
      setFormStoreName("")
      setFormSellerId("")
      setFormApiKey("")
      setFormApiSecret("")
    }
    setModalOpen(true)
  }

  const closeMarketplaceModal = () => {
    setModalOpen(false)
  }

  const handleSaveMarketplaceStore = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStoreName.trim() || !formSellerId.trim()) return

    setConnectedByMp((prev) => {
      const currentList = prev[modalMpKey] || []
      if (editingAccountId) {
        return {
          ...prev,
          [modalMpKey]: currentList.map((acc) =>
            acc.id === editingAccountId
              ? {
                  ...acc,
                  storeName: formStoreName.trim().toUpperCase(),
                  sellerId: formSellerId.trim(),
                  apiKey: formApiKey,
                  apiSecret: formApiSecret,
                }
              : acc
          ),
        }
      } else {
        return {
          ...prev,
          [modalMpKey]: [
            ...currentList,
            {
              id: `${modalMpKey}_${Date.now()}`,
              storeName: formStoreName.trim().toUpperCase(),
              sellerId: formSellerId.trim(),
              apiKey: formApiKey,
              apiSecret: formApiSecret,
              productCount: 14,
            },
          ],
        }
      }
    })
    setModalOpen(false)
  }

  return (
    <div className="bg-[#f1f3f6] min-h-screen text-slate-800">
      <style>{`
        .header-silver-pattern {
          background-color: #e9ecf1;
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.38) 0px,
            rgba(255, 255, 255, 0.38) 14px,
            transparent 14px,
            transparent 28px
          );
        }
      `}</style>

      {/* 1. MAĞAZALAR (BİREBİR http://localhost:3095/ TASARIMI — 12 PAZARYERİ KART GRİDİ) */}
      {activeTab === "magazalar" && (
        <div className="max-w-[1260px] w-full mx-auto px-5 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MARKETPLACE_DEFINITIONS.map((mp) => {
              const accounts = connectedByMp[mp.key] || []
              return (
                <div
                  key={mp.key}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between min-h-[168px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[42px] h-[42px] shrink-0 flex items-center justify-center">
                        {mp.logo}
                      </div>
                      <h3 className="text-[13.5px] font-bold text-slate-800 truncate">
                        {mp.title}
                      </h3>
                    </div>

                    {mp.hasApplyButton ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openMarketplaceModal(mp.key, `${mp.title} Başvuru`)}
                          className="h-8 px-3.5 rounded-md bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          Başvuru Yap
                        </button>
                        <button
                          type="button"
                          onClick={() => openMarketplaceModal(mp.key, mp.title)}
                          className="h-8 px-3.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Ekle
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openMarketplaceModal(mp.key, mp.title)}
                        className="h-8 px-3.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer shrink-0"
                      >
                        Ekle
                      </button>
                    )}
                  </div>

                  {accounts.length > 0 ? (
                    <div className="mt-5 flex flex-col gap-2">
                      {accounts.map((acc) => (
                        <div
                          key={acc.id}
                          className="bg-[#c6f6d5]/85 border border-[#86efac] rounded-lg px-4 py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-emerald-700 font-black text-base leading-none">
                              ✓
                            </span>
                            <div className="h-7 w-px bg-emerald-400/70" />
                            <div>
                              <div className="text-xs font-extrabold text-slate-800 tracking-wide">
                                {acc.storeName}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                                {acc.productCount} Ürün
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              openMarketplaceModal(
                                mp.key,
                                `${mp.title} (${acc.storeName})`,
                                acc
                              )
                            }
                            title="Mağaza Detaylarını Görüntüle"
                            className="text-slate-700 hover:text-slate-950 p-1.5 rounded-lg hover:bg-emerald-200/60 transition cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 mb-2 flex flex-col items-center justify-center text-center">
                      <p className="text-xs font-medium text-slate-600">
                        Tanımlı mağaza bulunmamaktadır.
                      </p>
                      <button
                        type="button"
                        onClick={() => openMarketplaceModal(mp.key, mp.title)}
                        className="mt-1 text-xs font-bold text-[#1565c0] hover:underline cursor-pointer"
                      >
                        Yeni Mağaza Ekle
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* OTHER PAZARYERİ SUB-TABS */}
      {activeTab !== "magazalar" && (
        <div className="max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-6">
          {/* 2. FİYAT REKABETİ ANALİZİ */}
          {activeTab === "fiyat-rekabeti" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Fiyat Rekabeti Analizi (Buybox Takibi)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pazaryerlerindeki ürünlerinizin rakip fiyatlarını ve Buybox durumunu anlık takip edin.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Buybox Fiyatlarını Şimdi Tara
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="py-3 px-4">Ürün Adı</th>
                      <th className="py-3 px-4">Pazaryeri</th>
                      <th className="py-3 px-4">Sizin Fiyatınız</th>
                      <th className="py-3 px-4">En Düşük Rakip</th>
                      <th className="py-3 px-4">Buybox Durumu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Peugeot 301 Makyajsız Body Kit Uyumlu Seti Plastik
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-orange-600">
                        Trendyol
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₺7.750,00
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        ₺7.890,00
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          Buybox Sizde
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Fiat Linea Makyajsız Body Kit Seti Plastik
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-orange-600">
                        Hepsiburada
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₺6.999,00
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-rose-600">
                        ₺6.850,00
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px]">
                          Rakip Önde (-₺149)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Volkswagen Golf 6 Uyumlu Body Kit Seti Plastik
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-purple-700">
                        N11
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₺6.999,00
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        ₺7.150,00
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          Buybox Sizde
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. İÇERİK EŞLEŞTİRMELERİ */}
          {activeTab === "icerik-eslestirmeleri" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    İçerik Eşleştirmeleri (Kategori & Nitelik Eşleştirme)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mağaza kategorilerinizi ve ürün niteliklerinizi pazaryeri kategori ağacıyla eşleştirin.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    localCat: "Body Kit Setleri",
                    tyCat: "Otomotiv > Oto Dış Aksesuar > Body Kit",
                    hbCat: "Oto Aksesuar > Tuning > Body Kit",
                    status: "Eşleşti",
                  },
                  {
                    localCat: "Ön Tampon Ekleri (Lip)",
                    tyCat: "Otomotiv > Oto Dış Aksesuar > Tampon & Ekleri",
                    hbCat: "Oto Aksesuar > Tuning > Ön Tampon Lip",
                    status: "Eşleşti",
                  },
                  {
                    localCat: "Spoiler & Kanat",
                    tyCat: "Otomotiv > Oto Dış Aksesuar > Spoiler",
                    hbCat: "Oto Aksesuar > Tuning > Spoiler",
                    status: "Eşleşti",
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        {row.localCat}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        {row.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Trendyol:</strong> {row.tyCat}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Hepsiburada:</strong> {row.hbCat}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ÜRÜN GÖNDERİMLERİ */}
          {activeTab === "urun-gonderimleri" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pazaryeri Ürün Gönderimleri
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pazaryerlerine toplu ürün, fiyat ve stok aktarım kuyruğunu yönetin.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Tüm Pazaryerlerine Stok & Fiyat Gönder
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="py-3 px-4">Gönderim No</th>
                      <th className="py-3 px-4">Hedef Mağaza</th>
                      <th className="py-3 px-4">İşlem Tipi</th>
                      <th className="py-3 px-4">Ürün Sayısı</th>
                      <th className="py-3 px-4">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #BATCH-9482
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        Trendyol
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        Stok ve Fiyat Güncelleme
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        124 Ürün
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          Tamamlandı
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #BATCH-9481
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        Hepsiburada
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        Yeni Ürün Aktarımı
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        98 Ürün
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          Tamamlandı
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ÜRÜN EŞLEŞTİRMELERİ */}
          {activeTab === "urun-eslestirmeleri" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pazaryeri Ürün Eşleştirmeleri
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sitenizdeki ürünler ile pazaryerlerindeki barkod ve stok kodlarının (SKU) eşleşme durumu.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="py-3 px-4">Ürün Adı</th>
                      <th className="py-3 px-4">Stok Kodu (SKU)</th>
                      <th className="py-3 px-4">Trendyol</th>
                      <th className="py-3 px-4">Hepsiburada</th>
                      <th className="py-3 px-4">N11</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Peugeot 301 Makyajsız Body Kit Uyumlu Seti Plastik
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        BKM-P301-SET
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Fiat Linea Makyajsız Body Kit Seti Plastik
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        BKM-LINEA-SET
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Volkswagen Golf 6 Uyumlu Body Kit Seti Plastik
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        BKM-GOLF6-SET
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ✓ Eşleşti
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAZARYERİ MAĞAZA EKLEME / AYAR MODALI (GÜMÜŞ-GRİ DESENLİ ÜST BLOK — http://localhost:3095/) */}
      {modalOpen && (
        <div
          style={{ zIndex: 100025 }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-[#cfd6e0] shadow-2xl w-full max-w-[480px] overflow-hidden">
            <div className="header-silver-pattern px-6 py-3.5 border-b border-[#cfd6e0] flex items-center justify-between">
              <div>
                <div className="text-[11.5px] font-semibold text-slate-600">
                  Pazaryeri Entegrasyonu
                </div>
                <div className="text-[15.5px] font-extrabold text-slate-900">
                  {modalTitle}
                </div>
              </div>
              <button
                type="button"
                onClick={closeMarketplaceModal}
                className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMarketplaceStore} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mağaza Adı
                </label>
                <input
                  type="text"
                  value={formStoreName}
                  onChange={(e) => setFormStoreName(e.target.value)}
                  placeholder="Örn: GİYİM / ANA MAĞAZA"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1565c0]"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Satıcı ID (Supplier / Seller ID)
                </label>
                <input
                  type="text"
                  value={formSellerId}
                  onChange={(e) => setFormSellerId(e.target.value)}
                  placeholder="Pazaryeri Satıcı Numaranız"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1565c0]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="API Anahtarı"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1565c0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formApiSecret}
                    onChange={(e) => setFormApiSecret(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1565c0]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeMarketplaceModal}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-[#1565c0] hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Mağazayı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Pazaryeri",
  icon: BuildingStorefront,
})

export default PazaryeriPage
