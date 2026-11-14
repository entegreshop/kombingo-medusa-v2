import { defineRouteConfig } from "@medusajs/admin-sdk"
import React, { useEffect, useState } from "react"

type StoreTabId =
  | "store"
  | "rules"
  | "marketing"
  | "prints"
  | "currencies"
  | "taxes"
  | "locations"
  | "api"
  | "staff"
  | "licence"

type StoreMenuItemId =
  | "store_general"
  | "store_logo"
  | "store_contact"
  | "store_orders"
  | "store_returns"
  | "store_products"
  | "store_customers"
  | "store_affiliate"
  | "store_quicksale"
  | "store_dealer"
  | "store_dealer_xml"
  | "store_dealer_api"
  | "store_security"
  | "store_maintenance"

interface StoreConfigState {
  storeTitle: string
  logoUrl: string
  faviconUrl: string
  footerDescription: string
  copyrightText: string
  phone: string
  whatsapp: string
  email: string
  address: string
  workingHours: string
  socialLinks: {
    instagram: string
    facebook: string
    youtube: string
    tiktok: string
  }
}

const DEFAULT_CONFIG: StoreConfigState = {
  storeTitle: "Kombingo | Kadın Giyim, Elbise, Takım ve Yeni Sezon Kombinler",
  logoUrl: "/images/logo-main.png",
  faviconUrl: "/favicon.ico",
  footerDescription: "Yeni sezon kadın giyim, elbise, ikili takım, dış giyim ve kombin modellerini en uygun fiyatlarla keşfedin.",
  copyrightText: "© 2026 Kombingo. Tüm hakları saklıdır.",
  phone: "0532 337 00 81",
  whatsapp: "905323370081",
  email: "hakkisahin9@gmail.com",
  address: "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL",
  workingHours: "Pzt - Cmt: 09:00 - 19:00",
  socialLinks: {
    instagram: "https://instagram.com/kombingo",
    facebook: "https://facebook.com/kombingo",
    youtube: "https://youtube.com/@kombingo",
    tiktok: "https://tiktok.com/@kombingo",
  },
}

const STORE_SIDEBAR_ITEMS: Array<{ id: StoreMenuItemId; label: string }> = [
  { id: "store_general", label: "Genel Bilgiler" },
  { id: "store_logo", label: "Logo ve İkonlar" },
  { id: "store_contact", label: "İletişim & Sosyal Medya" },
  { id: "store_orders", label: "Sipariş Ayarları" },
  { id: "store_returns", label: "İptal ve İade Ayarları" },
  { id: "store_products", label: "Ürün & Katalog Ayarları" },
  { id: "store_customers", label: "Üye ve Müşteri Ayarları" },
  { id: "store_affiliate", label: "Satış Ortaklığı (Affiliate)" },
  { id: "store_quicksale", label: "Hızlı Satış (POS)" },
  { id: "store_dealer", label: "Bayilik (B2B) Ayarları" },
  { id: "store_dealer_xml", label: "Bayi XML Çıktısı" },
  { id: "store_dealer_api", label: "Bayi API" },
  { id: "store_security", label: "Güvenlik" },
  { id: "store_maintenance", label: "Bakım Modu" },
]

const RULES_TABS = [
  "Üyelik Sözleşmesi",
  "Mesafeli Satış Sözleşmesi",
  "Ön Bilgilendirme Formu",
  "İptal ve İade Koşulları",
  "Gizlilik ve Güvenlik Politikası",
  "KVKK Aydınlatma Metni",
  "Çerez (Cookie) Politikası",
]

const CURRENCY_ROWS = [
  { id: 1, name: "Türk Lirası", code: "TL", symbol: "₺", rate: "1.0000", updatedAt: "Varsayılan Para Birimi", isDefault: true, active: true },
  { id: 2, name: "Amerikan Doları", code: "USD", symbol: "$", rate: "34.2540", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: true },
  { id: 3, name: "Euro", code: "EUR", symbol: "€", rate: "37.1890", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: true },
  { id: 4, name: "İngiliz Sterlini", code: "GBP", symbol: "£", rate: "44.6200", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: true },
  { id: 5, name: "İsviçre Frangı", code: "CHF", symbol: "CHF", rate: "39.4100", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
  { id: 6, name: "Suudi Arabistan Riyali", code: "SAR", symbol: "﷼", rate: "9.1300", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
  { id: 7, name: "BAE Dirhemi", code: "AED", symbol: "د.إ", rate: "9.3260", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
  { id: 8, name: "Rus Rublesi", code: "RUB", symbol: "₽", rate: "0.3580", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
]

const StoreSettingsPage = () => {
  const getInitialTab = (): StoreTabId => {
    if (typeof window === "undefined") return "store"
    const params = new URLSearchParams(window.location.search)
    const t = params.get("tab") as StoreTabId | null
    if (
      t &&
      [
        "store",
        "rules",
        "marketing",
        "prints",
        "currencies",
        "taxes",
        "locations",
        "api",
        "staff",
        "licence",
      ].includes(t)
    ) {
      return t
    }
    return "store"
  }

  const [activeTab, setActiveTab] = useState<StoreTabId>(getInitialTab)
  const [activeStoreMenu, setActiveStoreMenu] = useState<StoreMenuItemId>("store_general")
  const [activeRuleIndex, setActiveRuleIndex] = useState<number>(1)
  const [config, setConfig] = useState<StoreConfigState>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3200)
  }

  useEffect(() => {
    const syncTabFromUrl = () => {
      const next = getInitialTab()
      setActiveTab((prev) => (prev !== next ? next : prev))
    }
    window.addEventListener("popstate", syncTabFromUrl)
    const interval = setInterval(syncTabFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    fetch("/admin/logo-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data.config,
            socialLinks: {
              ...DEFAULT_CONFIG.socialLinks,
              ...(data.config.socialLinks || {}),
            },
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/admin/logo-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      })
      if (res.ok) {
        showToast("Ayarlar başarıyla kaydedildi!")
      } else {
        showToast("Kaydedilirken bir hata oluştu.")
      }
    } catch {
      showToast("Bağlantı hatası oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (field: "logoUrl" | "faviconUrl", file: File) => {
    setUploadingField(field)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ""))
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })
      const res = await fetch("/admin/logo-config/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
          base64,
        }),
      })
      const data = await res.json()
      if (data?.url) {
        setConfig((prev) => ({ ...prev, [field]: data.url }))
        showToast("Görsel başarıyla yüklendi.")
      } else {
        showToast("Görsel yüklenemedi.")
      }
    } catch {
      showToast("Görsel yükleme sırasında hata oluştu.")
    } finally {
      setUploadingField(null)
    }
  }

  const scrollToStoreSection = (id: StoreMenuItemId) => {
    setActiveStoreMenu(id)
    const el = document.getElementById(`preview-card-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const footerLabelMap: Record<StoreTabId, string> = {
    store: "Mağaza Ayarları",
    rules: "Sözleşmeler ve Metinler",
    marketing: "Pazarlama ve Doğrulama",
    prints: "Yazdırma Etiketleri",
    currencies: "Para Birimleri",
    taxes: "Vergiler",
    locations: "Diller & Lokalizasyon",
    api: "Web Servis (API)",
    staff: "Personeller",
    licence: "Lisans Yönetimi",
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "24px 32px 100px 32px",
        color: "#0f172a",
      }}
    >
      <style>{`
        .quka-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 22px 24px;
          margin-bottom: 18px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }
        .quka-card h5 {
          margin: 0 0 16px 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        .quka-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .quka-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .quka-input, .quka-select, .quka-textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          color: #0f172a;
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }
        .quka-input:focus, .quka-select:focus, .quka-textarea:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.12);
        }
        .quka-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .quka-table th {
          text-align: left;
          padding: 11px 14px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .quka-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }
        .quka-badge-success {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #dcfce7;
          color: #15803d;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .quka-badge-muted {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .quka-btn-primary {
          background: #2196f3;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .quka-btn-outline {
          background: #ffffff;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* 1. MAĞAZA AYARLARI */}
        {activeTab === "store" && (
          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 22, alignItems: "start" }}>
            <div
              className="quka-card"
              style={{
                padding: "10px",
                position: "sticky",
                top: 20,
                marginBottom: 0,
              }}
            >
              {STORE_SIDEBAR_ITEMS.map((item) => {
                const isActive = activeStoreMenu === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToStoreSection(item.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 12px",
                      border: "none",
                      borderRadius: 6,
                      background: isActive ? "#eff6ff" : "transparent",
                      color: isActive ? "#2196f3" : "#334155",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: 11, opacity: isActive ? 1 : 0.4 }}>›</span>
                  </button>
                )
              })}
            </div>

            <div>
              {/* Genel Bilgiler */}
              <div id="preview-card-store_general" className="quka-card">
                <h5>Genel Bilgiler</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Mağaza Adı / Site Başlığı</label>
                    <input
                      className="quka-input"
                      value={config.storeTitle}
                      onChange={(e) => setConfig({ ...config, storeTitle: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Alan Adı (Domain)</label>
                    <input className="quka-input" defaultValue="https://www.kombingo.com" />
                  </div>
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Footer Açıklama Metni</label>
                    <textarea
                      className="quka-textarea"
                      rows={2}
                      value={config.footerDescription}
                      onChange={(e) => setConfig({ ...config, footerDescription: e.target.value })}
                    />
                  </div>
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Telif Hakkı (Copyright) Metni</label>
                    <input
                      className="quka-input"
                      value={config.copyrightText}
                      onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Logo ve İkonlar */}
              <div id="preview-card-store_logo" className="quka-card">
                <h5>Logo ve İkonlar</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Site Üst Logo (Header Logo)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="quka-input"
                        value={config.logoUrl}
                        onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                      />
                      <label className="quka-btn-outline" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                        {uploadingField === "logoUrl" ? "Yükleniyor..." : "Yükle"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload("logoUrl", f)
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="quka-field">
                    <label>Tarayıcı İkonu (Favicon)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="quka-input"
                        value={config.faviconUrl}
                        onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                      />
                      <label className="quka-btn-outline" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                        {uploadingField === "faviconUrl" ? "Yükleniyor..." : "Yükle"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload("faviconUrl", f)
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* İletişim & Sosyal Medya */}
              <div id="preview-card-store_contact" className="quka-card">
                <h5>İletişim & Sosyal Medya</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Müşteri Hizmetleri Telefon</label>
                    <input
                      className="quka-input"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>WhatsApp Sipariş & Destek Hattı</label>
                    <input
                      className="quka-input"
                      value={config.whatsapp}
                      onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Kurumsal E-Posta</label>
                    <input
                      className="quka-input"
                      value={config.email}
                      onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Çalışma Saatleri</label>
                    <input
                      className="quka-input"
                      value={config.workingHours}
                      onChange={(e) => setConfig({ ...config, workingHours: e.target.value })}
                    />
                  </div>
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Merkez / Mağaza Açık Adresi</label>
                    <input
                      className="quka-input"
                      value={config.address}
                      onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Instagram Adresi</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.instagram}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, instagram: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="quka-field">
                    <label>Facebook Adresi</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.facebook}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, facebook: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="quka-field">
                    <label>YouTube Kanalı</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.youtube}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, youtube: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="quka-field">
                    <label>TikTok Hesabı</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.tiktok}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, tiktok: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sipariş Ayarları */}
              <div id="preview-card-store_orders" className="quka-card">
                <h5>Sipariş Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Minimum Sepet Tutarı (TL)</label>
                    <input className="quka-input" defaultValue="0.00" />
                  </div>
                  <div className="quka-field">
                    <label>Üyeliksiz Alışveriş</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Misafir Alışverişine İzin Ver)</option>
                      <option value="passive">Pasif (Zorunlu Üyelik)</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Sipariş Numarası Ön Eki (Prefix)</label>
                    <input className="quka-input" defaultValue="BKM-" />
                  </div>
                  <div className="quka-field">
                    <label>WhatsApp ile Sipariş Butonu</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Ürün Detayında Göster)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* İptal ve İade Ayarları */}
              <div id="preview-card-store_returns" className="quka-card">
                <h5>İptal ve İade Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Müşteri Panelinden İade Talebi Süresi (Gün)</label>
                    <input className="quka-input" type="number" defaultValue={14} />
                  </div>
                  <div className="quka-field">
                    <label>Kargoya Verilmeden Sipariş İptali</label>
                    <select className="quka-select" defaultValue="auto">
                      <option value="auto">Müşteri Otomatik İptal Edebilir</option>
                      <option value="approval">Yönetici Onayı İle İptal Edilir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ürün & Katalog Ayarları */}
              <div id="preview-card-store_products" className="quka-card">
                <h5>Ürün & Katalog Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Stokta Olmayan Ürünler</label>
                    <select className="quka-select" defaultValue="show_bottom">
                      <option value="show_bottom">Listelerin En Altında Göster ("Tükendi" Etiketiyle)</option>
                      <option value="hide">Sitede Gizle</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Sayfa Başına Ürün Gösterim Sayısı</label>
                    <select className="quka-select" defaultValue="24">
                      <option value="12">12 Ürün</option>
                      <option value="24">24 Ürün</option>
                      <option value="36">36 Ürün</option>
                      <option value="48">48 Ürün</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Üye ve Müşteri Ayarları */}
              <div id="preview-card-store_customers" className="quka-card">
                <h5>Üye ve Müşteri Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Yeni Üyelikte SMS Doğrulama (OTP)</label>
                    <select className="quka-select" defaultValue="passive">
                      <option value="passive">Pasif</option>
                      <option value="active">Aktif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>TC Kimlik Numarası Zorunluluğu</label>
                    <select className="quka-select" defaultValue="checkout">
                      <option value="checkout">Ödeme Adımında Zorunlu</option>
                      <option value="optional">İsteğe Bağlı</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Satış Ortaklığı (Affiliate) */}
              <div id="preview-card-store_affiliate" className="quka-card">
                <h5>Satış Ortaklığı (Affiliate)</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Affiliate Sistemi Durumu</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Varsayılan Komisyon Oranı (%)</label>
                    <input className="quka-input" type="number" defaultValue={5} />
                  </div>
                </div>
              </div>

              {/* Hızlı Satış (POS) */}
              <div id="preview-card-store_quicksale" className="quka-card">
                <h5>Hızlı Satış (POS)</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Mağaza İçi Barkodlu Hızlı Satış Ekranı</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Varsayılan POS Kasa</label>
                    <input className="quka-input" defaultValue="Merkez Mağaza Kasa #1" />
                  </div>
                </div>
              </div>

              {/* Bayilik (B2B) Ayarları */}
              <div id="preview-card-store_dealer" className="quka-card">
                <h5>Bayilik (B2B) Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>B2B Bayi Girişi ve Başvurusu</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Yönetici Onaylı)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Bayi Özel İskonto Grubu</label>
                    <input className="quka-input" defaultValue="Toptan / Oto Aksesuar Bayi (%20 İskonto)" />
                  </div>
                </div>
              </div>

              {/* Bayi XML Çıktısı */}
              <div id="preview-card-store_dealer_xml" className="quka-card">
                <h5>Bayi XML Çıktısı</h5>
                <div className="quka-form-grid">
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Standart Ürün & Stok XML Paylaşım Bağlantısı</label>
                    <input
                      className="quka-input"
                      readOnly
                      defaultValue="https://api.kombingo.com/feeds/b2b-products.xml"
                    />
                  </div>
                </div>
              </div>

              {/* Bayi API */}
              <div id="preview-card-store_dealer_api" className="quka-card">
                <h5>Bayi API</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>B2B REST API Erişimi</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Rate Limit (Dakika Başına İstek)</label>
                    <input className="quka-input" type="number" defaultValue={120} />
                  </div>
                </div>
              </div>

              {/* Güvenlik */}
              <div id="preview-card-store_security" className="quka-card">
                <h5>Güvenlik</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>SSL (HTTPS) Zorunlu Yönlendirme</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (256-Bit SSL Zorunlu)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Google reCAPTCHA v3 Koruması</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Form ve Giriş Koruması)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bakım Modu */}
              <div id="preview-card-store_maintenance" className="quka-card">
                <h5>Bakım Modu</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Site Yayın Durumu</label>
                    <select className="quka-select" defaultValue="live">
                      <option value="live">Yayında (Tüm Ziyaretçilere Açık)</option>
                      <option value="maintenance">Bakım Modunda (Sadece Yöneticiler Görebilir)</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Bakım Modu Başlığı</label>
                    <input className="quka-input" defaultValue="Sitemiz güncelleniyor, çok yakında tekrar yayındayız." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SÖZLEŞMELER VE METİNLER */}
        {activeTab === "rules" && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 22, alignItems: "start" }}>
            <div className="quka-card" style={{ padding: 10, marginBottom: 0 }}>
              {RULES_TABS.map((title, idx) => {
                const isActive = activeRuleIndex === idx
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setActiveRuleIndex(idx)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: 6,
                      background: isActive ? "#eff6ff" : "transparent",
                      color: isActive ? "#2196f3" : "#334155",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>{title}</span>
                    <span style={{ fontSize: 11, opacity: isActive ? 1 : 0.4 }}>›</span>
                  </button>
                )
              })}
            </div>

            <div className="quka-card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h5 style={{ margin: 0 }}>{RULES_TABS[activeRuleIndex]}</h5>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Dinamik etiketler: <code>{"{ALICI_AD_SOYAD}"}</code>, <code>{"{SIPARIS_NO}"}</code>, <code>{"{SIPARIS_TUTARI}"}</code>
                </span>
              </div>
              <textarea
                className="quka-textarea"
                rows={16}
                defaultValue={`MADDE 1 - TARAFLAR\n\n1.1. SATICI BİLGİLERİ:\nUnvanı: Kombingo Tekstil ve E-Ticaret\nAdres: ${config.address}\nTelefon: ${config.phone}\nE-Posta: ${config.email}\n\n1.2. ALICI BİLGİLERİ:\nAdı Soyadı / Unvanı: {ALICI_AD_SOYAD}\nTeslimat Adresi: {TESLIMAT_ADRESI}\nTelefon: {ALICI_TELEFON}\nE-Posta: {ALICI_EPOSTA}\n\nMADDE 2 - SÖZLEŞMENİN KONUSU\nİşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.kombingo.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.`}
              />
            </div>
          </div>
        )}

        {/* 3. PAZARLAMA VE DOĞRULAMA */}
        {activeTab === "marketing" && (
          <div>
            <div className="quka-card">
              <h5>Google Servisleri & Doğrulama Kodları</h5>
              <div className="quka-form-grid">
                <div className="quka-field">
                  <label>Google Analytics 4 (GA4) Ölçüm Kimliği</label>
                  <input className="quka-input" defaultValue="G-BKM9284710" placeholder="G-XXXXXXXXXX" />
                </div>
                <div className="quka-field">
                  <label>Google Tag Manager (GTM) Konteyner Kimliği</label>
                  <input className="quka-input" defaultValue="GTM-K82PL9M" placeholder="GTM-XXXXXXX" />
                </div>
                <div className="quka-field">
                  <label>Google Search Console HTML Meta Doğrulama Kodu</label>
                  <input className="quka-input" defaultValue="google-site-verification=bkm_verified_token_2026" />
                </div>
                <div className="quka-field">
                  <label>Google Ads Dönüşüm Kimliği (AW-ID)</label>
                  <input className="quka-input" defaultValue="AW-849201948" />
                </div>
              </div>
            </div>

            <div className="quka-card">
              <h5>Meta (Facebook & Instagram), TikTok ve Yandex Piksel</h5>
              <div className="quka-form-grid">
                <div className="quka-field">
                  <label>Meta (Facebook) Pixel ID</label>
                  <input className="quka-input" defaultValue="109284756192038" />
                </div>
                <div className="quka-field">
                  <label>Meta Conversions API (CAPI) Erişim Anahtarı</label>
                  <input className="quka-input" defaultValue="EAAGm0PX4ZCpsBA..." />
                </div>
                <div className="quka-field">
                  <label>TikTok Pixel ID</label>
                  <input className="quka-input" defaultValue="C8H2N9PL019283" />
                </div>
                <div className="quka-field">
                  <label>Yandex Metrica Sayaç Numarası</label>
                  <input className="quka-input" defaultValue="94827165" />
                </div>
              </div>
            </div>

            <div className="quka-card">
              <h5>Özel Script & Canlı Destek Kodları</h5>
              <div className="quka-form-grid">
                <div className="quka-field">
                  <label>{"<head> ... </head>"} Arasına Eklenecek Özel Kodlar</label>
                  <textarea
                    className="quka-textarea"
                    rows={5}
                    defaultValue={`<!-- Özel Doğrulama ve Izleme Scriptleri -->`}
                  />
                </div>
                <div className="quka-field">
                  <label>{"</body>"} Öncesine Eklenecek Özel Kodlar (Canlı Destek vb.)</label>
                  <textarea
                    className="quka-textarea"
                    rows={5}
                    defaultValue={`<!-- WhatsApp & Canlı Destek Widget -->`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. YAZDIRMA ETİKETLERİ */}
        {activeTab === "prints" && (
          <div>
            <div
              className="quka-card"
              style={{
                background: "#eff6ff",
                borderColor: "#bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a8a", marginBottom: 4 }}>
                  Kargo Barkod, Sipariş Fişi ve Fatura Yazdırma Şablonları
                </div>
                <div style={{ fontSize: 12.5, color: "#1e40af" }}>
                  Termal barkod yazıcı (100x100mm) veya standart A4 / A5 lazer yazıcılar için çıktı şablonlarını özelleştirebilirsiniz.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Test şablonu yazdırma penceresi hazırlandı.")}
              >
                🖨️ Test Çıktısı Al
              </button>
            </div>

            <div className="quka-form-grid">
              {[
                {
                  title: "Kargo Barkod Etiketi (100x100mm Termal)",
                  desc: "Yurtiçi, Aras, MNG, Sürat ve HepsiJet barkodlu termal kargo etiketi.",
                  size: "100mm x 100mm (Zebra / Argox Uyumlu)",
                },
                {
                  title: "Sipariş Hazırlama / Toplama Fişi (A4)",
                  desc: "Depo personeli için ürün raf kodu, fotoğraf, varyant ve adet listesi.",
                  size: "A4 Dikey (210mm x 297mm)",
                },
                {
                  title: "Kutu İçi Sevk ve İade Bilgi Fişi (A5)",
                  desc: "Müşteri paketinin içine konulan sipariş özeti ve kolay iade kodu fişi.",
                  size: "A5 Yatay (148mm x 210mm)",
                },
                {
                  title: "Raf & Ürün Barkod Etiketi (60x40mm)",
                  desc: "Depo rafları ve ürün paketleri için EAN-13 / Code-128 barkod etiketi.",
                  size: "60mm x 40mm Termal",
                },
              ].map((tpl) => (
                <div key={tpl.title} className="quka-card" style={{ marginBottom: 0 }}>
                  <h5>{tpl.title}</h5>
                  <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 12px 0" }}>{tpl.desc}</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <span className="quka-badge-muted">{tpl.size}</span>
                    <button
                      type="button"
                      className="quka-btn-outline"
                      onClick={() => showToast(`${tpl.title} düzenleme ekranı açıldı.`)}
                    >
                      Şablonu Düzenle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PARA BİRİMLERİ */}
        {activeTab === "currencies" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Para Birimleri ve Döviz Kurları</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  TCMB (Türkiye Cumhuriyet Merkez Bankası) üzerinden günlük otomatik kur güncellemesi aktiftir.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Döviz kurları TCMB üzerinden güncellendi!")}
              >
                ↻ TCMB Kurlarını Şimdi Güncelle
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Para Birimi</th>
                  <th>Kodu</th>
                  <th>Sembol</th>
                  <th>Kur Değeri (TL)</th>
                  <th>Son Güncelleme</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {CURRENCY_ROWS.map((c) => (
                  <tr key={c.code}>
                    <td style={{ fontWeight: 600 }}>
                      {c.name}{" "}
                      {c.isDefault && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10.5,
                            background: "#eff6ff",
                            color: "#2196f3",
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          Varsayılan
                        </span>
                      )}
                    </td>
                    <td>{c.code}</td>
                    <td style={{ fontWeight: 700 }}>{c.symbol}</td>
                    <td>
                      <input
                        className="quka-input"
                        style={{ width: 120 }}
                        defaultValue={c.rate}
                        disabled={c.isDefault}
                      />
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{c.updatedAt}</td>
                    <td>
                      {c.active ? (
                        <span className="quka-badge-success">✓ Aktif</span>
                      ) : (
                        <span className="quka-badge-muted">Pasif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. VERGİLER */}
        {activeTab === "taxes" && (
          <div>
            <div className="quka-card">
              <h5>Vergi (KDV) Ayarları</h5>
              <div className="quka-form-grid">
                <div className="quka-field">
                  <label>Ürün Fiyatlarına KDV Dahil mi?</label>
                  <select className="quka-select" defaultValue="included">
                    <option value="included">Evet, Ürün Fiyatları KDV Dahildir</option>
                    <option value="excluded">Hayır, KDV Sepette Artı Olarak Eklenir</option>
                  </select>
                </div>
                <div className="quka-field">
                  <label>Kargo Ücretleri KDV Oranı</label>
                  <select className="quka-select" defaultValue="20">
                    <option value="20">%20 KDV (Standart)</option>
                    <option value="10">%10 KDV</option>
                    <option value="0">%0 KDV</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="quka-card">
              <h5>Tanımlı Vergi Oranları</h5>
              <table className="quka-table">
                <thead>
                  <tr>
                    <th>Vergi Adı</th>
                    <th>Oran (%)</th>
                    <th>Uygulama Alanı</th>
                    <th>Varsayılan</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Genel KDV (%20)</td>
                    <td>%20</td>
                    <td>Oto Aksesuar, Body Kit, Elektronik, Kargo</td>
                    <td><span className="quka-badge-success">Varsayılan</span></td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>İndirimli KDV (%10)</td>
                    <td>%10</td>
                    <td>Tekstil, Çanta ve Seçili Aksesuarlar</td>
                    <td>-</td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Temel Gıda / Özel KDV (%1)</td>
                    <td>%1</td>
                    <td>Özel Muafiyetli Ürün Grupları</td>
                    <td>-</td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>KDV Muaf / İhracat (%0)</td>
                    <td>%0</td>
                    <td>Mikro İhracat (ETGB) ve Yurt Dışı Satışlar</td>
                    <td>-</td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. DİLLER & LOKALİZASYON */}
        {activeTab === "locations" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Mağaza Dilleri & Çoklu Dil (Lokalizasyon)</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  E-İhracat ve çok dilli vitrin için aktif dilleri ve çeviri oranlarını yönetebilirsiniz.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Yapay zeka hızlı çeviri kuyruğu başlatıldı.")}
              >
                ✨ Yapay Zeka Hızlı Çeviri
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Dil</th>
                  <th>ISO Kodu</th>
                  <th>Yön</th>
                  <th>Çeviri Tamamlanma</th>
                  <th>Varsayılan</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇹🇷 Türkçe</td>
                  <td>tr-TR</td>
                  <td>LTR</td>
                  <td>%100</td>
                  <td><span className="quka-badge-success">Ana Dil</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇬🇧 İngilizce (English)</td>
                  <td>en-US</td>
                  <td>LTR</td>
                  <td>%96</td>
                  <td>-</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇩🇪 Almanca (Deutsch)</td>
                  <td>de-DE</td>
                  <td>LTR</td>
                  <td>%88</td>
                  <td>-</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇸🇦 Arapça (العربية)</td>
                  <td>ar-SA</td>
                  <td>RTL</td>
                  <td>%75</td>
                  <td>-</td>
                  <td><span className="quka-badge-muted">Pasif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇷🇺 Rusça (Русский)</td>
                  <td>ru-RU</td>
                  <td>LTR</td>
                  <td>%70</td>
                  <td>-</td>
                  <td><span className="quka-badge-muted">Pasif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 8. WEB SERVİS (API) */}
        {activeTab === "api" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Web Servis (REST & SOAP API Hesapları)</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  ERP, Muhasebe, Pazaryeri ve Mobil Uygulama entegrasyonları için API erişim anahtarları.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Yeni API kullanıcısı oluşturma penceresi açıldı.")}
              >
                + Yeni API Hesabı Ekle
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Uygulama / Entegrasyon Adı</th>
                  <th>API Kullanıcı Kodu</th>
                  <th>Yetki Kapsamı</th>
                  <th>IP Kısıtlaması</th>
                  <th>Son Erişim</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>EntegreShop ERP & E-Fatura Köprüsü</td>
                  <td><code>api_erp_prod_01</code></td>
                  <td>Ürün, Sipariş, Stok, Cari (Tam Yetki)</td>
                  <td>Tüm IP'ler</td>
                  <td>2 dakika önce</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Pazaryeri Senkronizasyon Servisi</td>
                  <td><code>api_mp_sync_02</code></td>
                  <td>Ürün, Fiyat, Stok, Sipariş</td>
                  <td>Tüm IP'ler</td>
                  <td>5 dakika önce</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Mobil Uygulama (iOS & Android)</td>
                  <td><code>api_mobile_storefront</code></td>
                  <td>Katalog, Sepet, Müşteri</td>
                  <td>Tüm IP'ler</td>
                  <td>12 dakika önce</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 9. PERSONELLER */}
        {activeTab === "staff" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Yönetici Kullanıcılar & Personel Yetkileri</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  Yönetim paneline erişebilen personelleri ve departman bazlı yetki gruplarını yönetin.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Yeni personel ekleme formu açıldı.")}
              >
                + Yeni Personel Ekle
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>E-Posta Adresi</th>
                  <th>Telefon</th>
                  <th>Yetki Grubu</th>
                  <th>2FA Güvenlik</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Kombingo Admin</td>
                  <td>info@kombingo.com</td>
                  <td>0552 001 99 66</td>
                  <td>Süper Yönetici (Tam Yetki)</td>
                  <td><span className="quka-badge-success">SMS + E-Posta</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Depo & Kargo Operasyon</td>
                  <td>depo@kombingo.com</td>
                  <td>0552 001 99 67</td>
                  <td>Sipariş ve Kargo Sorumlusu</td>
                  <td><span className="quka-badge-muted">Standart</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Katalog & Pazaryeri Uzmanı</td>
                  <td>katalog@kombingo.com</td>
                  <td>0552 001 99 68</td>
                  <td>Ürün, Kategori ve Pazaryeri</td>
                  <td><span className="quka-badge-muted">Standart</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 10. LİSANS */}
        {activeTab === "licence" && (
          <div>
            <div
              className="quka-card"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                color: "#ffffff",
                border: "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#93c5fd", fontWeight: 700 }}>
                    AKTİF E-TİCARET & PAZARYERİ LİSANSI
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                    EntegreShop Enterprise Плюс (Tam Paket)
                  </div>
                  <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
                    Lisans Anahtarı: <code>ENT-BKM-2026-PRO-99482</code> • Alan Adı: <strong>kombingo.com</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8" }}>227 Gün Kaldı</div>
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>Yenileme Tarihi: 01.07.2027</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "rgba(255,255,255,0.12)",
                  height: 8,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "65%", height: "100%", background: "#38bdf8" }} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                {[
                  { label: "Ürün Limiti", val: "Sınırsız" },
                  { label: "Trafik / Bant Genişliği", val: "Sınırsız CDN" },
                  { label: "Çift Yönlü Pazaryeri", val: "10 Pazaryeri Aktif" },
                  { label: "E-Fatura & ERP", val: "Aktif (Sınırsız)" },
                  { label: "Yönetici / Personel", val: "10 Kullanıcı" },
                ].map((box) => (
                  <div
                    key={box.label}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: "#cbd5e1" }}>{box.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{box.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 }}>
              {[
                {
                  name: "Başlangıç (Starter)",
                  price: "14.900 TL / Yıl",
                  features: ["5.000 Ürün Limiti", "Standart E-Ticaret Vitrini", "Sanal POS & Kargo Entegrasyonu", "E-Posta ve SMS Bildirimleri"],
                  current: false,
                },
                {
                  name: "Profesyonel (Pazaryeri)",
                  price: "24.900 TL / Yıl",
                  features: ["25.000 Ürün Limiti", "Trendyol, Hepsiburada, N11 Entegrasyonu", "E-Fatura & Muhasebe Entegrasyonu", "Gelişmiş Kampanya Kurguları"],
                  current: false,
                },
                {
                  name: "Enterprise (Tam Paket)",
                  price: "39.900 TL / Yıl",
                  features: ["Sınırsız Ürün & Varyant", "Tüm Pazaryerleri + B2B Bayilik", "Rocket Önbellek + Çoklu Dil (E-İhracat)", "7/24 Öncelikli VIP Destek"],
                  current: true,
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  className="quka-card"
                  style={{
                    borderColor: pkg.current ? "#2196f3" : "#e2e8f0",
                    borderWidth: pkg.current ? 2 : 1,
                    marginBottom: 0,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h5 style={{ margin: 0 }}>{pkg.name}</h5>
                    {pkg.current && <span className="quka-badge-success">Mevcut Paketiniz</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "12px 0" }}>
                    {pkg.price}
                  </div>
                  <ul style={{ paddingLeft: 18, margin: "0 0 16px 0", fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
                    {pkg.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={pkg.current ? "quka-btn-primary" : "quka-btn-outline"}
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => showToast(`${pkg.name} lisans detayları görüntülendi.`)}
                  >
                    {pkg.current ? "✓ Aktif Lisansınız" : "Paketi İncele"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM SAVE BAR */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 90,
          boxShadow: "0 -4px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
          Ayarlar › <span style={{ color: "#0f172a", fontWeight: 700 }}>{footerLabelMap[activeTab]}</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "#2ecc71",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            padding: "9px 24px",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: saving ? "wait" : "pointer",
            boxShadow: "0 2px 6px rgba(46, 204, 113, 0.28)",
          }}
        >
          {saving ? "Kaydediliyor..." : "✓ Kaydet"}
        </button>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Mağaza Ayarları",
})

export default StoreSettingsPage
