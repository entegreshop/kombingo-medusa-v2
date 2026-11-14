import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles, CheckCircle } from "@medusajs/icons"

interface PixelConfig {
  meta_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
    test_event_code?: string
  }
  google_ads: {
    active: boolean
    conversion_id: string
    conversion_label: string
  }
  google_analytics: {
    active: boolean
    measurement_id: string
  }
  google_tag_manager: {
    active: boolean
    gtm_id: string
  }
  tiktok_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
  }
}

const initialConfig: PixelConfig = {
  meta_pixel: { active: false, pixel_id: "", access_token: "", test_event_code: "" },
  google_ads: { active: false, conversion_id: "", conversion_label: "" },
  google_analytics: { active: false, measurement_id: "" },
  google_tag_manager: { active: false, gtm_id: "" },
  tiktok_pixel: { active: false, pixel_id: "", access_token: "" }
}

type ViewType = "list" | "meta_pixel" | "google_ads" | "google_analytics" | "google_tag_manager" | "tiktok_pixel"

const PixelSettingsPage = () => {
  const [config, setConfig] = useState<PixelConfig>(initialConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [currentView, setCurrentView] = useState<ViewType>("list")



  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/pixel-settings")
        const data = await res.json()
        if (data && data.config) {
          setConfig(data.config)
        }
      } catch (err) {
        console.error("Failed to load pixel configuration:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async (updatedConfig = config) => {
    setSaving(true)
    setToastMessage("")
    try {
      const res = await fetch("/admin/pixel-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      })
      const data = await res.json()
      if (data && data.success) {
        setToastMessage("Piksel ayarları başarıyla kaydedildi! ✔")
        setConfig(data.config)
        setTimeout(() => setToastMessage(""), 4000)
        setCurrentView("list")
      } else {
        alert("Ayarlar kaydedilirken hata oluştu.")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      alert("Bağlantı hatası oluştu.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-500">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* DETAIL VIEW: LIGHT NAVIGATION BAR */}
      {currentView !== "list" && (
        <div className="bg-white border-b border-zinc-200 text-zinc-900 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-x-2">
            <button 
              onClick={() => setCurrentView("list")}
              className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-semibold"
            >
              ← Piksel Ayarları
            </button>
            <span className="text-zinc-300">/</span>
            <span className="text-sm font-bold text-zinc-800">
              {currentView === "meta_pixel" && "Meta Pixel & API"}
              {currentView === "google_ads" && "Google Ads Conversion"}
              {currentView === "google_analytics" && "Google Analytics (GA4)"}
              {currentView === "google_tag_manager" && "Google Tag Manager"}
              {currentView === "tiktok_pixel" && "TikTok Pixel"}
            </span>
          </div>
          <div className="flex items-center gap-x-3">
            <button 
              onClick={() => setCurrentView("list")}
              className="px-4 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition-colors"
            >
              Vazgeç
            </button>
            <button 
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-sm transition-all"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-8">
        
        {/* VIEW 1: MAIN LIST VIEW */}
        {currentView === "list" && (
          <div className="flex flex-col gap-y-8">
            
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-zinc-600" />
                  Piksel Ayarları
                </h1>
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                  Meta, Google ve TikTok piksel / analiz entegrasyon ayarlarınızı buradan yapılandırabilirsiniz.
                </p>
              </div>
            </div>

            {/* Tracking Providers Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_120px] bg-zinc-50 text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider py-3.5 px-6 border-b border-zinc-200">
                <span>Entegrasyon</span>
                <span>Durum</span>
              </div>
              
              <div className="divide-y divide-zinc-200">
                {/* 1. Meta Pixel */}
                <div 
                  onClick={() => setCurrentView("meta_pixel")}
                  className="grid grid-cols-[1fr_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-2.5">
                      <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#0064E0" fillRule="evenodd" d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a55 55 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714m1.516 2.224q-.378-.615-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87zM4.846 4.756c.725.1 1.385.634 2.34 2.001A212 212 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264q.137 0 .27.018" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Meta Pixel & Conversions API</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Facebook/Instagram reklam dönüşüm takibi ve API olayları</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.meta_pixel.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.meta_pixel.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 2. Google Ads */}
                <div 
                  onClick={() => setCurrentView("google_ads")}
                  className="grid grid-cols-[1fr_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-2.5">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#F9AB00" d="M15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644z"/>
                        <circle fill="#1A73E8" cx="3.9998" cy="18.9293" r="3.9998"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Google Ads Conversion Pixel</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Google Ads reklam kampanyası dönüşüm etiketleri</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.google_ads.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.google_ads.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 3. Google Analytics */}
                <div 
                  onClick={() => setCurrentView("google_analytics")}
                  className="grid grid-cols-[1fr_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-2.5">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="16" width="4" height="8" rx="2" fill="#F9AB00" />
                        <rect x="10" y="9" width="4" height="15" rx="2" fill="#E37400" />
                        <rect x="17" y="2" width="4" height="22" rx="2" fill="#F15A24" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Google Analytics (GA4)</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Web sitesi ziyaretçi trafiği analiz ölçüm kimliği</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.google_analytics.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.google_analytics.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 4. Google Tag Manager */}
                <div 
                  onClick={() => setCurrentView("google_tag_manager")}
                  className="grid grid-cols-[1fr_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-2.5">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#246FDB" d="M19.345 9.034V24h-3.834V13.823l-7.098 7.099-2.71-2.711 9.808-9.808-3.834-3.834h11.488V9.034zm-7.668 1.834L7.843 7.034l3.834-3.834-3.834-3.2H0V11.52l3.834 3.834 7.843-7.834v3.348z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Google Tag Manager</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Etiket, piksel ve tetikleyici yönetimi kapsayıcısı</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.google_tag_manager.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.google_tag_manager.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                {/* 5. TikTok Pixel */}
                <div 
                  onClick={() => setCurrentView("tiktok_pixel")}
                  className="grid grid-cols-[1fr_120px] items-center py-5 px-6 hover:bg-zinc-50/75 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 bg-black flex items-center justify-center shadow-sm overflow-hidden p-2.5">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.42-.04 2.23-.01 4.47-.02 6.7 0 1.78-.32 3.59-1.28 5.08-1.07 1.71-2.91 2.87-4.88 3.2-2.11.37-4.39-.07-6.07-1.42-1.74-1.39-2.73-3.6-2.67-5.83.05-2.28 1.05-4.49 2.88-5.85C7.9 9.38 9.94 8.91 11.9 9.24v4.13c-1.2-.36-2.54-.12-3.53.6-.88.66-1.38 1.76-1.39 2.86-.01 1.07.45 2.12 1.25 2.81.93.84 2.22 1.13 3.42.75 1.09-.34 1.94-1.28 2.21-2.4.15-.62.11-1.27.12-1.91V.02z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">TikTok Pixel</h4>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">TikTok reklam kampanyası dönüşüm ve olay takibi</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.tiktok_pixel.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                      ● {config.tiktok_pixel.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* DETAIL VIEW: META PIXEL */}
        {currentView === "meta_pixel" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <div className="flex flex-col gap-y-6">
              
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Meta Pixel Bilgileri</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Pixel ID</label>
                  <input 
                    type="text"
                    placeholder="örn. 123456789012345"
                    value={config.meta_pixel.pixel_id}
                    onChange={(e) => setConfig({ ...config, meta_pixel: { ...config.meta_pixel, pixel_id: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Conversions API Access Token</label>
                  <textarea 
                    rows={4}
                    placeholder="EAAB..."
                    value={config.meta_pixel.access_token}
                    onChange={(e) => setConfig({ ...config, meta_pixel: { ...config.meta_pixel, access_token: e.target.value } })}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 resize-none focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Conversions API (CAPI) olaylarını sunucu tarafında tetiklemek için gereken erişim jetonu.</p>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Test Kodu (Test Event Code) - İsteğe Bağlı</label>
                  <input 
                    type="text"
                    placeholder="örn. TEST12345"
                    value={config.meta_pixel.test_event_code || ""}
                    onChange={(e) => setConfig({ ...config, meta_pixel: { ...config.meta_pixel, test_event_code: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Test olaylarınızı Meta Olay Yöneticisi'nde anlık görmek için Olayları Test Edin sekmesindeki TEST kodunu buraya girin.</p>
                </div>
              </div>

            </div>

            <div className="flex flex-col gap-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.meta_pixel.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, meta_pixel: { ...config.meta_pixel, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW: GOOGLE ADS */}
        {currentView === "google_ads" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <div className="flex flex-col gap-y-6">
              
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Google Ads Bilgileri</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Conversion ID (Dönüşüm Kimliği)</label>
                  <input 
                    type="text"
                    placeholder="örn. AW-123456789"
                    value={config.google_ads.conversion_id}
                    onChange={(e) => setConfig({ ...config, google_ads: { ...config.google_ads, conversion_id: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Conversion Label (Dönüşüm Etiketi)</label>
                  <input 
                    type="text"
                    placeholder="örn. abcdEFGH-1234_56"
                    value={config.google_ads.conversion_label}
                    onChange={(e) => setConfig({ ...config, google_ads: { ...config.google_ads, conversion_label: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex flex-col gap-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.google_ads.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, google_ads: { ...config.google_ads, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW: GOOGLE ANALYTICS */}
        {currentView === "google_analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <div className="flex flex-col gap-y-6">
              
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Google Analytics GA4 Bilgileri</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Measurement ID (Ölçüm Kimliği)</label>
                  <input 
                    type="text"
                    placeholder="örn. G-XXXXXXXXXX"
                    value={config.google_analytics.measurement_id}
                    onChange={(e) => setConfig({ ...config, google_analytics: { ...config.google_analytics, measurement_id: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex flex-col gap-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.google_analytics.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, google_analytics: { ...config.google_analytics, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW: GOOGLE TAG MANAGER */}
        {currentView === "google_tag_manager" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <div className="flex flex-col gap-y-6">
              
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Google Tag Manager Bilgileri</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">GTM Container ID (Kapsayıcı Kimliği)</label>
                  <input 
                    type="text"
                    placeholder="örn. GTM-XXXXXXX"
                    value={config.google_tag_manager.gtm_id}
                    onChange={(e) => setConfig({ ...config, google_tag_manager: { ...config.google_tag_manager, gtm_id: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex flex-col gap-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.google_tag_manager.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, google_tag_manager: { ...config.google_tag_manager, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW: TIKTOK PIXEL */}
        {currentView === "tiktok_pixel" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <div className="flex flex-col gap-y-6">
              
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">TikTok Pixel Bilgileri</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Pixel ID</label>
                  <input 
                    type="text"
                    placeholder="örn. C12345678901"
                    value={config.tiktok_pixel.pixel_id}
                    onChange={(e) => setConfig({ ...config, tiktok_pixel: { ...config.tiktok_pixel, pixel_id: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Access Token (TikTok Events API)</label>
                  <textarea 
                    rows={4}
                    placeholder="tt_..."
                    value={config.tiktok_pixel.access_token}
                    onChange={(e) => setConfig({ ...config, tiktok_pixel: { ...config.tiktok_pixel, access_token: e.target.value } })}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 resize-none focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex flex-col gap-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900">Durum</h3>
                <select 
                  value={config.tiktok_pixel.active ? "active" : "inactive"}
                  onChange={(e) => setConfig({ ...config, tiktok_pixel: { ...config.tiktok_pixel, active: e.target.value === "active" } })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-800"
                >
                  <option value="active">✓ Aktif</option>
                  <option value="inactive">✕ Pasif</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Piksel Ayarları",
  icon: Sparkles,
})

export default PixelSettingsPage
