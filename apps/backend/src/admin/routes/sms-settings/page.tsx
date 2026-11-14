import { useState, useEffect } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CheckCircle } from "@medusajs/icons"

interface SMSConfig {
  active: boolean
  usercode: string
  password: string
  msgheader: string
  admin_phone: string
  sms_service: string
}

const initialConfig: SMSConfig = {
  active: false,
  usercode: "",
  password: "",
  msgheader: "",
  admin_phone: "+90 501 947 37 66",
  sms_service: "Verimor",
}

interface NotificationTemplateRow {
  no: number
  channel: string
  title: string
  subtitle: string
  status: boolean
  customer: boolean
  admin: boolean
}

const INITIAL_TEMPLATES: NotificationTemplateRow[] = [
  { no: 70, channel: "E-Posta", title: "Bayilik Başvurunuz Reddedildi", subtitle: "Bayilik başvuru reddedildi", status: true, customer: true, admin: false },
  { no: 69, channel: "E-Posta", title: "Bayilik Başvurunuz Onaylandı", subtitle: "Bayilik başvuru onayı", status: true, customer: true, admin: false },
  { no: 68, channel: "E-Posta", title: "Dijital Ürünleriniz Kullanıma Hazır", subtitle: "Dijital ürün bilgilendirme", status: true, customer: true, admin: false },
  { no: 67, channel: "E-Posta", title: "Affiliate Ödemeniz Tamamlandı", subtitle: "Affiliate ödemesi yapıldı", status: true, customer: true, admin: false },
  { no: 66, channel: "E-Posta", title: "Affiliate Kazançlarınız Hakkında", subtitle: "Affiliate ödemesi oluşturuldu", status: true, customer: true, admin: false },
  { no: 65, channel: "E-Posta", title: "Influencer Başvurunuz Reddedildi", subtitle: "Influencer başvuru reddedildi", status: true, customer: true, admin: false },
  { no: 64, channel: "E-Posta", title: "Influencer Başvurunuz Onaylandı", subtitle: "Influencer başvuru onayı", status: true, customer: true, admin: false },
  { no: 63, channel: "E-Posta", title: "Influencer Başvurunuz Bize Ulaştı", subtitle: "Yeni influencer kaydı", status: true, customer: true, admin: false },
  { no: 62, channel: "WhatsApp", title: "Telefon Numaranı Doğrula", subtitle: "Doğrulama kodu", status: true, customer: true, admin: false },
  { no: 61, channel: "SMS", title: "Telefon Numaranı Doğrula", subtitle: "Doğrulama kodu", status: true, customer: true, admin: false },
]

const SmsSettingsPage = () => {
  const [config, setConfig] = useState<SMSConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  // Accordion open states
  const [openMail, setOpenMail] = useState(false)
  const [openSms, setOpenSms] = useState(false)
  const [openWa, setOpenWa] = useState(false)
  const [openMob, setOpenMob] = useState(false)

  // E-Posta state
  const [mailActive, setMailActive] = useState(true)
  const [mailAdmin, setMailAdmin] = useState("info@kombingo.com")
  const [mailStoreName, setMailStoreName] = useState("KOMBİNGO")
  const [mailReplyTo, setMailReplyTo] = useState("info@kombingo.com")
  const [mailService, setMailService] = useState("Varsayılan")

  // WhatsApp state
  const [waActive, setWaActive] = useState(false)
  const [waAdminPhone, setWaAdminPhone] = useState("+90 501 947 37 66")
  const [waService, setWaService] = useState("Ultramsg")

  // Templates & search
  const [templates, setTemplates] = useState<NotificationTemplateRow[]>(INITIAL_TEMPLATES)
  const [searchQuery, setSearchQuery] = useState("")

  // Test SMS modal
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Netgsm SMS entegrasyonu başarıyla test edildi!")
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/admin/sms-settings")
        const data = await res.json()
        if (data && data.config) {
          setConfig({
            ...initialConfig,
            ...data.config,
            admin_phone: data.config.admin_phone || "+90 501 947 37 66",
            sms_service: data.config.sms_service || "Verimor",
          })
        }
      } catch (err) {
        console.error("Failed to load SMS configuration:", err)
      }
    }
    fetchConfig()
  }, [])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(""), 4000)
  }

  const handleSave = async (updatedConfig = config) => {
    setSaving(true)
    try {
      const res = await fetch("/admin/sms-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      })
      const data = await res.json()
      if (data && data.success) {
        showToast("SMS Ayarları başarıyla kaydedildi! ✔", "success")
        setConfig(data.config)
      } else {
        showToast("Ayarlar kaydedilirken hata oluştu.", "error")
      }
    } catch (err) {
      console.error("Error saving config:", err)
      showToast("Bağlantı hatası oluştu.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleTestSms = async () => {
    const targetPhone = testPhone || config.admin_phone
    if (!targetPhone) {
      showToast("Lütfen test için geçerli bir telefon numarası girin.", "error")
      return
    }
    setTesting(true)
    try {
      const res = await fetch("/admin/sms-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          test_phone: targetPhone,
          test_message: testMessage,
          usercode: config.usercode,
          password: config.password,
          msgheader: config.msgheader,
        }),
      })
      const data = await res.json()
      if (data && data.success) {
        showToast("Test SMS'i başarıyla gönderildi!", "success")
        setTestModalOpen(false)
      } else {
        showToast(`Test SMS'i gönderilemedi: ${data?.error || "Hata"}`, "error")
      }
    } catch (err) {
      console.error("Error during test SMS send:", err)
      showToast("Bağlantı hatası oluştu.", "error")
    } finally {
      setTesting(false)
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.channel.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
      className="min-h-screen bg-[#f1f3f6] text-slate-800 pb-16"
    >
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all ${
            toastType === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* SUB-VIEW 3: E-POSTA, SMS VE WHATSAPP (/admin/tools/notifications 1:1) */}
      <div className="max-w-[1140px] mx-auto px-4 py-7">
        {/* Top Callout (short-description type-2) */}
        <div className="bg-white border-l-[10px] border-[#c0c5d9] rounded-[5px] px-[25px] py-[20px] mb-[15px] text-[14px] text-[#48465b] shadow-2xs">
          Müşterilerinize üyelik, sipariş ve ödeme aşamalarıyla ilgili otomatik bildirimler gönderebilirsiniz.
        </div>

        {/* 1. E-Posta Accordion Box */}
        <div className="bg-white rounded-[4px] border border-[#ebedf2] mb-[20px] shadow-2xs overflow-hidden">
          <div
            onClick={() => setOpenMail(!openMail)}
            className="flex items-center cursor-pointer py-[35px] px-[20px]"
          >
            <div className="w-[80px] flex items-center justify-center shrink-0 text-[#48465b]">
              <svg
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div className="flex-1 pr-4">
              <div className="text-[16px] font-medium text-[#48465b]">E-Posta</div>
              <div className="text-[13px] text-[#74788d] mt-[3px]">
                E-Postalar sistem tarafından otomatik gönderilmektedir. Kendi servisleriniz mevcutsa SMTP veya Mailjet kullanabilirsiniz.
              </div>
            </div>
            <div className="flex items-center gap-5 pr-3">
              {mailActive ? (
                <span className="inline-flex items-center gap-1.5 px-[10px] py-[5px] rounded-[4px] bg-[#e0f6e7] text-[#08976d] text-[13px] font-normal">
                  <span className="font-bold">✓</span> Aktif
                </span>
              ) : (
                <span className="inline-flex items-center px-[10px] py-[5px] rounded-[4px] bg-[#ffd4d0] text-[#c93424] text-[13px] font-normal">
                  Kapalı
                </span>
              )}
              <span className="text-[#74788d] text-[16px]">⌄</span>
            </div>
          </div>
          {openMail && (
            <div className="border-t border-[#ebedf2] p-[25px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">E-Posta Gönderimi</label>
                  <div
                    onClick={() => setMailActive(!mailActive)}
                    className={`w-[54px] h-[28px] rounded-full p-[3px] flex items-center cursor-pointer transition-colors ${
                      mailActive ? "bg-[#0abb87] justify-end" : "bg-[#e2e5ec] justify-start"
                    }`}
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-white shadow-xs"></div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    Yönetici E-Posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mailAdmin}
                    onChange={(e) => setMailAdmin(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    Mağaza Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mailStoreName}
                    onChange={(e) => setMailStoreName(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">Cevap Veren E-Posta Adresi</label>
                  <input
                    type="text"
                    value={mailReplyTo}
                    onChange={(e) => setMailReplyTo(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">E-Posta Servisi</label>
                  <select
                    value={mailService}
                    onChange={(e) => setMailService(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px] text-[#495057]"
                  >
                    <option value="Varsayılan">Varsayılan</option>
                    <option value="SMTP">SMTP</option>
                    <option value="Mailjet">Mailjet</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-[#ebedf2] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast("E-Posta ayarları kaydedildi! ✔", "success")}
                  className="h-[36px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
                >
                  ✓ Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Test e-postası (${mailAdmin}) adresine gönderildi!`, "success")}
                  className="h-[36px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer"
                >
                  ✈ Test Et
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                  className="h-[36px] px-4 rounded-[4px] bg-[#ffb822] text-[#212529] text-[13px] font-medium cursor-pointer"
                >
                  🎨 Şablonlar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. SMS Accordion Box */}
        <div className="bg-white rounded-[4px] border border-[#ebedf2] mb-[20px] shadow-2xs overflow-hidden">
          <div
            onClick={() => setOpenSms(!openSms)}
            className="flex items-center cursor-pointer py-[35px] px-[20px]"
          >
            <div className="w-[80px] flex items-center justify-center shrink-0 text-[#48465b]">
              <svg
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h.01" />
                <path d="M12 10h.01" />
                <path d="M16 10h.01" />
              </svg>
            </div>
            <div className="flex-1 pr-4">
              <div className="text-[16px] font-medium text-[#48465b]">SMS</div>
              <div className="text-[13px] text-[#74788d] mt-[3px]">
                Verimor, Mobildev, Sanal Santral veya Netgsm servislerini kullanabilirsiniz.
              </div>
            </div>
            <div className="flex items-center gap-5 pr-3">
              {config.active ? (
                <span className="inline-flex items-center gap-1.5 px-[10px] py-[5px] rounded-[4px] bg-[#e0f6e7] text-[#08976d] text-[13px] font-normal">
                  <span className="font-bold">✓</span> Aktif
                </span>
              ) : (
                <span className="inline-flex items-center px-[10px] py-[5px] rounded-[4px] bg-[#ffd4d0] text-[#c93424] text-[13px] font-normal">
                  Kapalı
                </span>
              )}
              <span className="text-[#74788d] text-[16px]">⌄</span>
            </div>
          </div>
          {openSms && (
            <div className="border-t border-[#ebedf2] p-[25px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">SMS Gönderimi</label>
                  <div
                    onClick={() => setConfig({ ...config, active: !config.active })}
                    className={`w-[54px] h-[28px] rounded-full p-[3px] flex items-center cursor-pointer transition-colors ${
                      config.active ? "bg-[#0abb87] justify-end" : "bg-[#e2e5ec] justify-start"
                    }`}
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-white shadow-xs"></div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    Yönetici Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.admin_phone}
                    onChange={(e) => setConfig({ ...config, admin_phone: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    SMS Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: SILABUTIK"
                    value={config.msgheader}
                    onChange={(e) => setConfig({ ...config, msgheader: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    SMS Servisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={config.sms_service}
                    onChange={(e) => setConfig({ ...config, sms_service: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px] text-[#495057]"
                  >
                    <option value="Verimor">Verimor</option>
                    <option value="Mobildev">Mobildev</option>
                    <option value="Sanal Santral">Sanal Santral</option>
                    <option value="Netgsm">Netgsm</option>
                    <option value="Self SMS">Self SMS</option>
                  </select>
                </div>
              </div>
              <div className="border border-[#ebedf2] rounded-[4px] p-[25px] mb-5">
                <div className="text-[14px] font-bold text-[#3d94fb] pb-2 mb-5 border-b border-[#ebedf2]">
                  {config.sms_service || "Verimor"} Ayarları
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] text-[#48465b] mb-2">
                      Kullanıcı Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.usercode}
                      onChange={(e) => setConfig({ ...config, usercode: e.target.value })}
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#48465b] mb-2">
                      Şifre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={config.password}
                      onChange={(e) => setConfig({ ...config, password: e.target.value })}
                      className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#ebedf2] flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave()}
                  className="h-[36px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer disabled:opacity-50"
                >
                  ✓ {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => setTestModalOpen(true)}
                  className="h-[36px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer"
                >
                  ✈ Test Et
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. WhatsApp Mesajları Accordion Box */}
        <div className="bg-white rounded-[4px] border border-[#ebedf2] mb-[20px] shadow-2xs overflow-hidden">
          <div
            onClick={() => setOpenWa(!openWa)}
            className="flex items-center cursor-pointer py-[35px] px-[20px]"
          >
            <div className="w-[80px] flex items-center justify-center shrink-0 text-[#48465b]">
              <svg
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
              </svg>
            </div>
            <div className="flex-1 pr-4">
              <div className="text-[16px] font-medium text-[#48465b]">WhatsApp Mesajları</div>
              <div className="text-[13px] text-[#74788d] mt-[3px]">
                Whatsapp mesajları için Ultramsg, Qpien veya Connexease kullanabilirsiniz.
              </div>
            </div>
            <div className="flex items-center gap-5 pr-3">
              {waActive ? (
                <span className="inline-flex items-center gap-1.5 px-[10px] py-[5px] rounded-[4px] bg-[#e0f6e7] text-[#08976d] text-[13px] font-normal">
                  <span className="font-bold">✓</span> Aktif
                </span>
              ) : (
                <span className="inline-flex items-center px-[10px] py-[5px] rounded-[4px] bg-[#ffd4d0] text-[#c93424] text-[13px] font-normal">
                  Kapalı
                </span>
              )}
              <span className="text-[#74788d] text-[16px]">⌄</span>
            </div>
          </div>
          {openWa && (
            <div className="border-t border-[#ebedf2] p-[25px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">WhatsApp Mesaj Gönderimi</label>
                  <div
                    onClick={() => setWaActive(!waActive)}
                    className={`w-[54px] h-[28px] rounded-full p-[3px] flex items-center cursor-pointer transition-colors ${
                      waActive ? "bg-[#0abb87] justify-end" : "bg-[#e2e5ec] justify-start"
                    }`}
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-white shadow-xs"></div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    Yönetici WhatsApp Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={waAdminPhone}
                    onChange={(e) => setWaAdminPhone(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#48465b] mb-2">
                    WhatsApp Servisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={waService}
                    onChange={(e) => setWaService(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px] text-[#495057]"
                  >
                    <option value="Ultramsg">Ultramsg</option>
                    <option value="Qpien">Qpien</option>
                    <option value="Connexease">Connexease</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-[#ebedf2] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast("WhatsApp ayarları kaydedildi! ✔", "success")}
                  className="h-[36px] px-4 rounded-[4px] bg-[#0abb87] text-white text-[13px] font-medium cursor-pointer"
                >
                  ✓ Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Test WhatsApp mesajı (${waAdminPhone}) numarasına gönderildi!`, "success")}
                  className="h-[36px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer"
                >
                  ✈ Test Et
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Mobil Uygulama Bildirimleri Accordion Box */}
        <div className="bg-white rounded-[4px] border border-[#ebedf2] mb-[25px] shadow-2xs overflow-hidden">
          <div
            onClick={() => setOpenMob(!openMob)}
            className="flex items-center cursor-pointer py-[35px] px-[20px]"
          >
            <div className="w-[80px] flex items-center justify-center shrink-0 text-[#48465b]">
              <svg
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <div className="flex-1 pr-4">
              <div className="text-[16px] font-medium text-[#48465b]">Mobil Uygulama Bildirimleri</div>
              <div className="text-[13px] text-[#74788d] mt-[3px]">
                Mobil uygulamanızı yükleyen müşterilere bildirim gönderebilirsiniz.
              </div>
            </div>
            <div className="flex items-center gap-5 pr-3">
              <span className="inline-flex items-center px-[10px] py-[5px] rounded-[4px] bg-[#ffd4d0] text-[#c93424] text-[13px] font-normal">
                Kapalı
              </span>
              <span className="text-[#74788d] text-[16px]">⌄</span>
            </div>
          </div>
          {openMob && (
            <div className="border-t border-[#ebedf2] p-[35px] text-center">
              <div className="w-[70px] h-[70px] rounded-full bg-[#e6eaf0] text-[#555555] flex items-center justify-center mx-auto mb-3 text-[26px]">
                🔒
              </div>
              <div className="text-[18px] font-semibold text-[#555555]">Paketinizde Bulunmamaktadır!</div>
              <div className="text-[14px] text-[#74788d] mt-1">
                Bu özellik paketinizde bulunmamaktadır. Lütfen sistem yöneticinizle iletişime geçin.
              </div>
            </div>
          )}
        </div>

        {/* Bildirimler Card (notifications-template-list) */}
        <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs">
          <div className="mb-5">
            <h3 className="text-[18px] font-medium text-[#48465b]">Bildirimler</h3>
            <p className="text-[13px] text-[#74788d] mt-1">
              E-posta, SMS, WhatsApp ve mobil uygulama bildirimlerindeki içerikleri düzenleyebilir ve yeni bildirimler ekleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="h-[38px] px-4 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px] text-[#48465b] font-medium flex items-center gap-2 cursor-pointer"
              >
                <span>⚙ Filtreler</span>
                <span className="text-[11px] text-[#74788d]">⌄</span>
              </button>
              <div className="relative w-[240px]">
                <span className="absolute left-3 top-2.5 text-[#74788d] text-[13px]">🔍</span>
                <input
                  type="text"
                  placeholder="Hızlı ara.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[38px] pl-9 pr-3 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#495057]"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const title = window.prompt("Yeni bildirim başlığı:")
                if (title && title.trim()) {
                  const nextNo = templates.length > 0 ? Math.max(...templates.map((t) => t.no)) + 1 : 71
                  setTemplates([
                    {
                      no: nextNo,
                      channel: "E-Posta",
                      title: title.trim(),
                      subtitle: "Özel bildirim şablonu",
                      status: true,
                      customer: true,
                      admin: false,
                    },
                    ...templates,
                  ])
                }
              }}
              className="h-[38px] px-4 rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Yeni Bildirim
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3 w-[40px] text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="py-3 px-3 w-[70px]">No</th>
                  <th className="py-3 px-3 w-[130px]">Bildirim</th>
                  <th className="py-3 px-3">Başlık</th>
                  <th className="py-3 px-3 w-[85px] text-center">Durum</th>
                  <th className="py-3 px-3 w-[85px] text-center">Müşteri</th>
                  <th className="py-3 px-3 w-[85px] text-center">Yönetici</th>
                  <th className="py-3 px-3 w-[110px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2] text-[#48465b]">
                {filteredTemplates.map((row) => (
                  <tr key={row.no} className="hover:bg-[#f8f9fb]/60">
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="py-3 px-3">{row.no}</td>
                    <td className="py-3 px-3">{row.channel}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#48465b]">{row.title}</div>
                      <div className="text-[12px] text-[#74788d]">{row.subtitle}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                        ✓
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#0abb87] text-[#0abb87] items-center justify-center text-[11px] font-bold">
                        ✓
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full border-2 border-[#282a3c] text-[#282a3c] items-center justify-center text-[11px] font-bold">
                        ✕
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => showToast(`#${row.no} - ${row.title} şablonu görüntülendi.`, "success")}
                          className="w-[30px] h-[30px] rounded-[4px] bg-[#9b59b6] text-white inline-flex items-center justify-center text-[12px] cursor-pointer"
                          title="Görüntüle"
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplates(templates.filter((t) => t.no !== row.no))}
                          className="w-[30px] h-[30px] rounded-[4px] bg-[#e74c3c] text-white inline-flex items-center justify-center text-[12px] cursor-pointer"
                          title="Sil"
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

          <div className="pt-4 mt-2 border-t border-[#ebedf2] flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-[#74788d]">
            <div className="flex items-center gap-1">
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#f0f3ff] text-[#93a2dd] font-bold">
                «
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#f0f3ff] text-[#93a2dd] font-bold">
                ‹
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#3d94fb] text-white font-bold">
                1
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] hover:bg-[#f0f3ff] text-[#74788d] font-semibold">
                2
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] hover:bg-[#f0f3ff] text-[#74788d] font-semibold">
                3
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] hover:bg-[#f0f3ff] text-[#74788d] font-semibold">
                4
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] hover:bg-[#f0f3ff] text-[#74788d] font-semibold">
                5
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] hover:bg-[#f0f3ff] text-[#74788d] font-semibold">
                6
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] hover:bg-[#f0f3ff] text-[#74788d] font-semibold">
                7
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#f0f3ff] text-[#5d78ff] font-bold">
                ›
              </button>
              <button type="button" className="w-[30px] h-[30px] rounded-[4px] bg-[#f0f3ff] text-[#5d78ff] font-bold">
                »
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select className="h-[30px] px-2 rounded-[4px] border border-[#e2e5ec] bg-white text-[12px]">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span>66 kayıttan 1 ile 10 arası gösteriliyor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test SMS Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[8px] border border-[#ebedf2] shadow-2xl w-full max-w-[460px] p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebedf2]">
              <h3 className="text-[16px] font-bold text-[#48465b]">SMS Test Gönderimi</h3>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] text-[#48465b] mb-1.5">Test Telefon Numarası</label>
                <input
                  type="text"
                  placeholder="Örn: 5323370081"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#48465b] mb-1.5">Test Mesajı</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="h-[36px] px-4 rounded-[4px] border border-[#e2e5ec] text-[13px] text-[#48465b] cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestSms}
                  className="h-[36px] px-4 rounded-[4px] bg-[#3d94fb] text-white text-[13px] font-medium cursor-pointer disabled:opacity-50"
                >
                  {testing ? "Gönderiliyor..." : "✈ Gönder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "SMS Ayarları",
})

export default SmsSettingsPage
