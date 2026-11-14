import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles, CheckCircle } from "@medusajs/icons"

interface ButtonConfig {
  buy_now_enabled: boolean
  buy_now_bg: string
  buy_now_text_color: string
  add_to_cart_enabled: boolean
  add_to_cart_bg: string
  add_to_cart_text_color: string
  whatsapp_enabled: boolean
  whatsapp_number: string
  whatsapp_bg: string
  whatsapp_text_color: string
}

const initialConfig: ButtonConfig = {
  buy_now_enabled: true,
  buy_now_bg: "#E50000",
  buy_now_text_color: "#ffffff",
  add_to_cart_enabled: true,
  add_to_cart_bg: "#000000",
  add_to_cart_text_color: "#ffffff",
  whatsapp_enabled: true,
  whatsapp_number: "905323370081",
  whatsapp_bg: "#ffffff",
  whatsapp_text_color: "#25D366",
}

const ButtonSettingsPage = () => {
  const [config, setConfig] = useState<ButtonConfig>(initialConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/hero-config")
        const data = await res.json()
        if (data && data.config) {
          setConfig((prev) => ({ ...prev, ...data.config }))
        }
      } catch (err) {
        console.error("Failed to load button configuration:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setToastMessage("")
    try {
      const res = await fetch("/admin/hero-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data && data.success) {
        setToastMessage("Buton ayarları başarıyla kaydedildi! ✔")
        setTimeout(() => setToastMessage(""), 4000)
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

      <div className="max-w-4xl mx-auto p-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-8">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-zinc-600" />
              Buton Ayarları
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              Ürün detay sayfasındaki satın alma ve WhatsApp butonlarını buradan yönetebilirsiniz.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-bold text-white shadow-sm transition-all whitespace-nowrap"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>

        <div className="flex flex-col gap-y-6">

          {/* HEMEN AL BUTTON */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                Hemen Al Butonu
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-zinc-500">Görünürlük</span>
                <input 
                  type="checkbox"
                  checked={config.buy_now_enabled}
                  onChange={(e) => setConfig({ ...config, buy_now_enabled: e.target.checked })}
                  className="w-4 h-4 accent-violet-600"
                />
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Arkaplan Rengi (HEX)</label>
                <input 
                  type="text"
                  placeholder="#E50000"
                  value={config.buy_now_bg}
                  onChange={(e) => setConfig({ ...config, buy_now_bg: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Yazı Rengi (HEX)</label>
                <input 
                  type="text"
                  placeholder="#ffffff"
                  value={config.buy_now_text_color}
                  onChange={(e) => setConfig({ ...config, buy_now_text_color: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
              <button 
                disabled
                className="w-full max-w-sm h-12 flex items-center justify-center uppercase tracking-widest text-[14px] font-bold border-none rounded-none"
                style={{ backgroundColor: config.buy_now_bg, color: config.buy_now_text_color }}
              >
                HEMEN AL
              </button>
            </div>
          </div>

          {/* SEPETE EKLE BUTTON */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                Sepete Ekle Butonu
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-zinc-500">Görünürlük</span>
                <input 
                  type="checkbox"
                  checked={config.add_to_cart_enabled}
                  onChange={(e) => setConfig({ ...config, add_to_cart_enabled: e.target.checked })}
                  className="w-4 h-4 accent-violet-600"
                />
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Arkaplan Rengi (HEX)</label>
                <input 
                  type="text"
                  placeholder="#000000"
                  value={config.add_to_cart_bg}
                  onChange={(e) => setConfig({ ...config, add_to_cart_bg: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Yazı Rengi (HEX)</label>
                <input 
                  type="text"
                  placeholder="#ffffff"
                  value={config.add_to_cart_text_color}
                  onChange={(e) => setConfig({ ...config, add_to_cart_text_color: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
              <button 
                disabled
                className="w-full max-w-sm h-12 flex items-center justify-center uppercase tracking-widest text-[14px] font-bold border-none rounded-none"
                style={{ backgroundColor: config.add_to_cart_bg, color: config.add_to_cart_text_color }}
              >
                SEPETE EKLE
              </button>
            </div>
          </div>

          {/* WHATSAPP BUTTON */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                WhatsApp İle Sipariş Butonu
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-zinc-500">Görünürlük</span>
                <input 
                  type="checkbox"
                  checked={config.whatsapp_enabled}
                  onChange={(e) => setConfig({ ...config, whatsapp_enabled: e.target.checked })}
                  className="w-4 h-4 accent-violet-600"
                />
              </label>
            </div>
            
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase">WhatsApp Telefon Numarası</label>
              <input 
                type="text"
                placeholder="örn. 905323370081"
                value={config.whatsapp_number}
                onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
              />
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Ülke kodu ile birlikte boşluk bırakmadan girin (örn. 905...)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Arkaplan Rengi (HEX)</label>
                <input 
                  type="text"
                  placeholder="#ffffff"
                  value={config.whatsapp_bg}
                  onChange={(e) => setConfig({ ...config, whatsapp_bg: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase">Yazı ve Çerçeve Rengi (HEX)</label>
                <input 
                  type="text"
                  placeholder="#25D366"
                  value={config.whatsapp_text_color}
                  onChange={(e) => setConfig({ ...config, whatsapp_text_color: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
              <button 
                disabled
                className="w-full max-w-sm h-12 flex items-center justify-center gap-2 uppercase tracking-widest text-[14px] font-bold border rounded-none"
                style={{ 
                  backgroundColor: config.whatsapp_bg, 
                  color: config.whatsapp_text_color,
                  borderColor: config.whatsapp_text_color
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WHATSAPP İLE SİPARİŞ
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Buton Ayarları",
  icon: Sparkles,
})

export default ButtonSettingsPage
