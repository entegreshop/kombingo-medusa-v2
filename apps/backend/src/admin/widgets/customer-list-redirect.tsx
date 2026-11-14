import { useState, useEffect } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

interface CustomerRow {
  id: string
  no: number
  first_name: string
  last_name: string
  email: string
  phone: string
  balance: number
  group_name: string
  status: "Aktif" | "Pasif"
  is_dealer: boolean
  dealer_code: string
  tc_or_tax: string
  ip_address: string
  last_login_date: string
  last_login_time: string
  created_date: string
  created_time: string
  has_orders?: boolean
  sms_opt_in?: boolean
  email_opt_in?: boolean
}

const INITIAL_DEMO_CUSTOMERS: CustomerRow[] = [
  {
    id: "cust_11",
    no: 11,
    first_name: "Bünyamin",
    last_name: "Bıyık",
    email: "bunyaminbyk@gmail.com",
    phone: "05424234389",
    balance: 0,
    group_name: "Genel Müşteri",
    status: "Aktif",
    is_dealer: false,
    dealer_code: "",
    tc_or_tax: "",
    ip_address: "176.88.42.11",
    last_login_date: "08.04.2026",
    last_login_time: "00:35",
    created_date: "08.04.2026",
    created_time: "00:35",
    has_orders: true,
    sms_opt_in: true,
    email_opt_in: true,
  },
  {
    id: "cust_10",
    no: 10,
    first_name: "Metin",
    last_name: "AKKUŞ",
    email: "metinakkus83@hotmail.com",
    phone: "05448303018",
    balance: 0,
    group_name: "Genel Müşteri",
    status: "Aktif",
    is_dealer: false,
    dealer_code: "",
    tc_or_tax: "",
    ip_address: "88.230.14.92",
    last_login_date: "04.04.2026",
    last_login_time: "14:43",
    created_date: "04.04.2026",
    created_time: "14:43",
    has_orders: true,
    sms_opt_in: true,
    email_opt_in: true,
  },
  {
    id: "cust_9",
    no: 9,
    first_name: "Ferdi",
    last_name: "İkiz",
    email: "ferdiikiz809@gmail.com",
    phone: "05427245292",
    balance: 0,
    group_name: "Genel Müşteri",
    status: "Aktif",
    is_dealer: false,
    dealer_code: "",
    tc_or_tax: "",
    ip_address: "95.70.128.40",
    last_login_date: "01.04.2026",
    last_login_time: "12:24",
    created_date: "01.04.2026",
    created_time: "12:24",
    has_orders: false,
    sms_opt_in: true,
    email_opt_in: false,
  },
  {
    id: "cust_8",
    no: 8,
    first_name: "Enes",
    last_name: "Duman",
    email: "ed260153@gmail.com",
    phone: "05435461467",
    balance: 0,
    group_name: "Genel Müşteri",
    status: "Aktif",
    is_dealer: false,
    dealer_code: "",
    tc_or_tax: "",
    ip_address: "176.240.19.83",
    last_login_date: "31.03.2026",
    last_login_time: "22:36",
    created_date: "31.03.2026",
    created_time: "22:36",
    has_orders: true,
    sms_opt_in: true,
    email_opt_in: true,
  },
  {
    id: "cust_7",
    no: 7,
    first_name: "Süleyman Sırrı",
    last_name: "Uzun",
    email: "suleymansirriuzun@gmail.com",
    phone: "05302313999",
    balance: 0,
    group_name: "Genel Müşteri",
    status: "Aktif",
    is_dealer: false,
    dealer_code: "",
    tc_or_tax: "",
    ip_address: "78.171.65.102",
    last_login_date: "27.03.2026",
    last_login_time: "21:40",
    created_date: "27.03.2026",
    created_time: "21:40",
    has_orders: false,
    sms_opt_in: false,
    email_opt_in: true,
  },
]

const DEFAULT_FILTER = {
  group: "Seçilmedi",
  fullName: "",
  email: "",
  phone: "",
  tcOrTax: "",
  dealerCode: "",
  balanceMin: "0.00",
  balanceMax: "0.00",
  createdStart: "",
  createdEnd: "",
  lastLoginStart: "",
  lastLoginEnd: "",
  ipAddress: "",
  status: "Seçilmedi",
  dealerStatus: "Seçilmedi",
  advanced: "Seçilmedi",
}

const CustomerListWidget = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>(INITIAL_DEMO_CUSTOMERS)
  const [quickSearch, setQuickSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState({ ...DEFAULT_FILTER })
  const [appliedFilter, setAppliedFilter] = useState({ ...DEFAULT_FILTER })
  const [pageSize, setPageSize] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<{
    id?: string
    first_name: string
    last_name: string
    email: string
    phone: string
    group_name: string
    balance: string
    status: "Aktif" | "Pasif"
    tc_or_tax: string
    dealer_code: string
  }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    group_name: "Genel Müşteri",
    balance: "0.00",
    status: "Aktif",
    tc_or_tax: "",
    dealer_code: "",
  })

  useEffect(() => {
    const hideDefaultUi = () => {
      const widgetEl = document.getElementById("xoox-custom-customers-widget")
      if (widgetEl && widgetEl.parentElement) {
        const siblings = Array.from(widgetEl.parentElement.children)
        siblings.forEach((sibling) => {
          if (sibling !== widgetEl) {
            ;(sibling as HTMLElement).style.display = "none"
          }
        })
      }
    }
    hideDefaultUi()
    const interval = setInterval(hideDefaultUi, 120)
    return () => clearInterval(interval)
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/admin/customers?limit=200")
      if (!res.ok) return
      const data = await res.json()
      const apiList = data.customers || []
      if (apiList.length > 0) {
        const mapped: CustomerRow[] = apiList.map((c: any, idx: number) => {
          const dt = c.created_at ? new Date(c.created_at) : new Date()
          const dStr = dt.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
          const tStr = dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
          return {
            id: c.id,
            no: apiList.length + INITIAL_DEMO_CUSTOMERS.length - idx,
            first_name: c.first_name || (c.email ? c.email.split("@")[0] : "Müşteri"),
            last_name: c.last_name || "",
            email: c.email || "",
            phone: c.phone || c.metadata?.phone || "",
            balance: Number(c.metadata?.balance || 0),
            group_name: c.groups?.[0]?.name || c.metadata?.group_name || "Genel Müşteri",
            status: c.metadata?.status === "Pasif" ? "Pasif" : "Aktif",
            is_dealer: Boolean(c.metadata?.is_dealer),
            dealer_code: String(c.metadata?.dealer_code || ""),
            tc_or_tax: String(c.metadata?.tc_or_tax || ""),
            ip_address: String(c.metadata?.ip_address || ""),
            last_login_date: dStr,
            last_login_time: tStr,
            created_date: dStr,
            created_time: tStr,
            has_orders: true,
            sms_opt_in: true,
            email_opt_in: true,
          }
        })
        const existingEmails = new Set(mapped.map((m) => m.email.toLowerCase()))
        const combined = [
          ...mapped,
          ...INITIAL_DEMO_CUSTOMERS.filter((d) => !existingEmails.has(d.email.toLowerCase())),
        ]
        setCustomers(combined)
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSaveCustomer = async () => {
    if (!editingCustomer.first_name.trim() || !editingCustomer.email.trim()) {
      alert("Lütfen Ad ve E-Posta alanlarını doldurun.")
      return
    }

    const now = new Date()
    const dStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
    const tStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })

    if (editingCustomer.id) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                first_name: editingCustomer.first_name,
                last_name: editingCustomer.last_name,
                email: editingCustomer.email,
                phone: editingCustomer.phone,
                group_name: editingCustomer.group_name,
                balance: parseFloat(editingCustomer.balance) || 0,
                status: editingCustomer.status,
                tc_or_tax: editingCustomer.tc_or_tax,
                dealer_code: editingCustomer.dealer_code,
              }
            : c
        )
      )
      if (!editingCustomer.id.startsWith("cust_")) {
        await fetch(`/admin/customers/${editingCustomer.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: editingCustomer.first_name,
            last_name: editingCustomer.last_name,
            email: editingCustomer.email,
            phone: editingCustomer.phone,
            metadata: {
              group_name: editingCustomer.group_name,
              balance: parseFloat(editingCustomer.balance) || 0,
              status: editingCustomer.status,
              tc_or_tax: editingCustomer.tc_or_tax,
              dealer_code: editingCustomer.dealer_code,
            },
          }),
        }).catch(() => {})
      }
    } else {
      const maxNo = customers.reduce((m, c) => Math.max(m, c.no), 0)
      const newRow: CustomerRow = {
        id: `cust_${Date.now()}`,
        no: maxNo + 1,
        first_name: editingCustomer.first_name,
        last_name: editingCustomer.last_name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        balance: parseFloat(editingCustomer.balance) || 0,
        group_name: editingCustomer.group_name,
        status: editingCustomer.status,
        is_dealer: Boolean(editingCustomer.dealer_code),
        dealer_code: editingCustomer.dealer_code,
        tc_or_tax: editingCustomer.tc_or_tax,
        ip_address: "127.0.0.1",
        last_login_date: dStr,
        last_login_time: tStr,
        created_date: dStr,
        created_time: tStr,
      }
      setCustomers((prev) => [newRow, ...prev])
      await fetch("/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editingCustomer.first_name,
          last_name: editingCustomer.last_name,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          metadata: {
            group_name: editingCustomer.group_name,
            balance: parseFloat(editingCustomer.balance) || 0,
            status: editingCustomer.status,
            tc_or_tax: editingCustomer.tc_or_tax,
            dealer_code: editingCustomer.dealer_code,
          },
        }),
      }).catch(() => {})
    }
    setShowCustomerModal(false)
  }

  const handleDeleteCustomer = async (cust: CustomerRow) => {
    if (!confirm(`"${cust.first_name} ${cust.last_name}" adlı üyeyi silmek istediğinize emin misiniz?`)) return
    setCustomers((prev) => prev.filter((c) => c.id !== cust.id))
    if (!cust.id.startsWith("cust_")) {
      await fetch(`/admin/customers/${cust.id}`, { method: "DELETE" }).catch(() => {})
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.trim()
    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase().trim()
      const match =
        fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        String(c.no).includes(q)
      if (!match) return false
    }

    if (appliedFilter.group !== "Seçilmedi" && c.group_name !== appliedFilter.group) return false
    if (appliedFilter.fullName.trim() && !fullName.toLowerCase().includes(appliedFilter.fullName.toLowerCase().trim()))
      return false
    if (appliedFilter.email.trim() && !c.email.toLowerCase().includes(appliedFilter.email.toLowerCase().trim()))
      return false
    if (appliedFilter.phone.trim() && !c.phone.toLowerCase().includes(appliedFilter.phone.toLowerCase().trim()))
      return false
    if (appliedFilter.tcOrTax.trim() && !c.tc_or_tax.toLowerCase().includes(appliedFilter.tcOrTax.toLowerCase().trim()))
      return false
    if (
      appliedFilter.dealerCode.trim() &&
      !c.dealer_code.toLowerCase().includes(appliedFilter.dealerCode.toLowerCase().trim())
    )
      return false
    if (appliedFilter.ipAddress.trim() && !c.ip_address.includes(appliedFilter.ipAddress.trim())) return false
    if (appliedFilter.status !== "Seçilmedi" && c.status !== appliedFilter.status) return false
    if (appliedFilter.dealerStatus === "Bayi" && !c.is_dealer) return false
    if (appliedFilter.dealerStatus === "Standart Müşteri" && c.is_dealer) return false

    const bMin = parseFloat(appliedFilter.balanceMin) || 0
    const bMax = parseFloat(appliedFilter.balanceMax) || 0
    if (bMin > 0 || bMax > 0) {
      if (bMin > 0 && c.balance < bMin) return false
      if (bMax > 0 && c.balance > bMax) return false
    }

    if (appliedFilter.advanced === "Siparişi Olanlar" && !c.has_orders) return false
    if (appliedFilter.advanced === "Siparişi Olmayanlar" && c.has_orders) return false
    if (appliedFilter.advanced === "SMS İzinli Olanlar" && !c.sms_opt_in) return false
    if (appliedFilter.advanced === "E-Posta İzinli Olanlar" && !c.email_opt_in) return false
    if (appliedFilter.advanced === "Bakiyesi Olanlar" && c.balance <= 0) return false

    return true
  })

  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div id="xoox-custom-customers-widget" className="bg-[#f8fafc] min-h-screen p-6 md:p-8 text-zinc-800">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
        {/* Top Action Bar (Image 5) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-[440px]">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`bg-white border ${
                showFilters ? "border-[#3b82f6] text-zinc-900" : "border-zinc-300 text-zinc-700"
              } hover:bg-zinc-50 px-3.5 py-2 rounded-md text-xs font-semibold inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer shrink-0`}
            >
              <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Filtreler</span>
              <span className="text-[10px] text-zinc-500">⌄</span>
            </button>

            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Hızlı ara.."
                value={quickSearch}
                onChange={(e) => {
                  setQuickSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:border-[#3b82f6] shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingCustomer({
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  group_name: "Genel Müşteri",
                  balance: "0.00",
                  status: "Aktif",
                  tc_or_tax: "",
                  dealer_code: "",
                })
                setShowCustomerModal(true)
              }}
              style={{ backgroundColor: "#00b259", color: "#ffffff" }}
              className="hover:opacity-95 text-white px-3.5 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-opacity cursor-pointer"
            >
              <span className="text-sm leading-none font-black">+</span>
              <span>Yeni Müşteri</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const csvRows = [
                  ["No", "Ad Soyad", "E-Posta", "Telefon", "Bakiye", "Müşteri Grubu", "Durum", "Son Giriş", "Kayıt"].join(";"),
                  ...filteredCustomers.map((c) =>
                    [
                      c.no,
                      `${c.first_name} ${c.last_name}`.trim(),
                      c.email,
                      c.phone,
                      `${c.balance.toFixed(2)} TL`,
                      c.group_name,
                      c.status,
                      `${c.last_login_date} ${c.last_login_time}`,
                      `${c.created_date} ${c.created_time}`,
                    ].join(";")
                  ),
                ].join("\n")
                const blob = new Blob(["\uFEFF" + csvRows], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "uyeler.csv"
                a.click()
              }}
              style={{ backgroundColor: "#1a73e8", color: "#ffffff" }}
              className="hover:opacity-95 text-white px-3.5 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-opacity cursor-pointer"
            >
              <span>📊</span>
              <span>Excel İşlemleri</span>
            </button>
          </div>
        </div>

        {/* Collapsible Blue-Bordered Filter Panel (Image 5) */}
        {showFilters && (
          <div className="bg-white border border-[#3b82f6] rounded-md p-5 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
              {/* Row 1 */}
              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Müşteri Grubu</label>
                <select
                  value={filter.group}
                  onChange={(e) => setFilter({ ...filter, group: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="Seçilmedi">Seçilmedi</option>
                  <option value="Genel Müşteri">Genel Müşteri</option>
                  <option value="VIP Müşteriler">VIP Müşteriler</option>
                  <option value="Bayi Grubu">Bayi Grubu</option>
                  <option value="Kurumsal Müşteriler">Kurumsal Müşteriler</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Ad Soyad / Ünvan</label>
                <input
                  type="text"
                  value={filter.fullName}
                  onChange={(e) => setFilter({ ...filter, fullName: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">E-Posta Adresi</label>
                <input
                  type="text"
                  value={filter.email}
                  onChange={(e) => setFilter({ ...filter, email: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Telefon Numarası</label>
                <input
                  type="text"
                  value={filter.phone}
                  onChange={(e) => setFilter({ ...filter, phone: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">TC No / Vergi Bilgileri</label>
                <input
                  type="text"
                  value={filter.tcOrTax}
                  onChange={(e) => setFilter({ ...filter, tcOrTax: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Bayi Kodu</label>
                <input
                  type="text"
                  value={filter.dealerCode}
                  onChange={(e) => setFilter({ ...filter, dealerCode: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Bakiye</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={filter.balanceMin}
                    onChange={(e) => setFilter({ ...filter, balanceMin: e.target.value })}
                    className="w-full border border-zinc-200 rounded-l-md px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:border-[#3b82f6]"
                  />
                  <span className="bg-zinc-100 border-y border-zinc-200 px-2.5 py-2 text-xs text-zinc-600 font-medium shrink-0">
                    ile
                  </span>
                  <input
                    type="text"
                    value={filter.balanceMax}
                    onChange={(e) => setFilter({ ...filter, balanceMax: e.target.value })}
                    className="w-full border border-zinc-200 rounded-r-md px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Kayıt Tarihi</label>
                <div className="flex items-center">
                  <input
                    type="date"
                    value={filter.createdStart}
                    onChange={(e) => setFilter({ ...filter, createdStart: e.target.value })}
                    className="w-full border border-zinc-200 rounded-l-md px-2 py-2 text-xs text-zinc-700 focus:outline-none focus:border-[#3b82f6]"
                  />
                  <span className="bg-zinc-100 border-y border-zinc-200 px-2 py-2 text-xs text-zinc-600 font-medium shrink-0">
                    ile
                  </span>
                  <input
                    type="date"
                    value={filter.createdEnd}
                    onChange={(e) => setFilter({ ...filter, createdEnd: e.target.value })}
                    className="w-full border border-zinc-200 rounded-r-md px-2 py-2 text-xs text-zinc-700 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Son Giriş Tarihi</label>
                <div className="flex items-center">
                  <input
                    type="date"
                    value={filter.lastLoginStart}
                    onChange={(e) => setFilter({ ...filter, lastLoginStart: e.target.value })}
                    className="w-full border border-zinc-200 rounded-l-md px-2 py-2 text-xs text-zinc-700 focus:outline-none focus:border-[#3b82f6]"
                  />
                  <span className="bg-zinc-100 border-y border-zinc-200 px-2 py-2 text-xs text-zinc-600 font-medium shrink-0">
                    ile
                  </span>
                  <input
                    type="date"
                    value={filter.lastLoginEnd}
                    onChange={(e) => setFilter({ ...filter, lastLoginEnd: e.target.value })}
                    className="w-full border border-zinc-200 rounded-r-md px-2 py-2 text-xs text-zinc-700 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">IP Adresi</label>
                <input
                  type="text"
                  value={filter.ipAddress}
                  onChange={(e) => setFilter({ ...filter, ipAddress: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Üyelik Durumu</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="Seçilmedi">Seçilmedi</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Bayilik Durumu</label>
                <select
                  value={filter.dealerStatus}
                  onChange={(e) => setFilter({ ...filter, dealerStatus: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="Seçilmedi">Seçilmedi</option>
                  <option value="Bayi">Bayi</option>
                  <option value="Standart Müşteri">Standart Müşteri</option>
                </select>
              </div>

              {/* Row 4 */}
              <div>
                <label className="block text-[11.5px] font-bold text-zinc-800 mb-1.5">Gelişmiş Filtreleme</label>
                <select
                  value={filter.advanced}
                  onChange={(e) => setFilter({ ...filter, advanced: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-700 bg-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="Seçilmedi">Seçilmedi</option>
                  <option value="Siparişi Olanlar">Siparişi Olanlar</option>
                  <option value="Siparişi Olmayanlar">Siparişi Olmayanlar</option>
                  <option value="SMS İzinli Olanlar">SMS İzinli Olanlar</option>
                  <option value="E-Posta İzinli Olanlar">E-Posta İzinli Olanlar</option>
                  <option value="Bakiyesi Olanlar">Bakiyesi Olanlar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setAppliedFilter({ ...filter })
                  setCurrentPage(1)
                }}
                style={{ backgroundColor: "#1a73e8", color: "#ffffff" }}
                className="hover:opacity-95 text-white px-4 py-1.5 rounded text-xs font-bold shadow-2xs transition-opacity cursor-pointer"
              >
                Filtrele
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilter({ ...DEFAULT_FILTER })
                  setAppliedFilter({ ...DEFAULT_FILTER })
                  setQuickSearch("")
                  setCurrentPage(1)
                }}
                className="bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                Temizle
              </button>
            </div>
          </div>
        )}

        {/* Customers Table Card (Image 5) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-2xs flex flex-col gap-4">
          <div className="border border-zinc-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left bg-white text-[12px]">
                <thead>
                  <tr className="bg-white border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                    <th className="py-3.5 px-4 w-[6%]">No</th>
                    <th className="py-3.5 px-4 w-[18%]">Ad Soyad</th>
                    <th className="py-3.5 px-4 w-[22%]">İletişim Bilgileri</th>
                    <th className="py-3.5 px-4 w-[10%]">Bakiye</th>
                    <th className="py-3.5 px-4 w-[13%]">Müşteri Grubu</th>
                    <th className="py-3.5 px-4 w-[9%]">Durum</th>
                    <th className="py-3.5 px-4 w-[9%]">Son Giriş</th>
                    <th className="py-3.5 px-4 w-[9%]">Kayıt</th>
                    <th className="py-3.5 px-4 w-[10%]">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-700">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400 font-semibold">
                        Üye bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`divide-x divide-zinc-200 transition-colors ${
                          idx % 2 === 0 ? "bg-zinc-50/50" : "bg-white"
                        } hover:bg-blue-50/20`}
                      >
                        <td className="py-3.5 px-4 align-middle">
                          <span
                            onClick={() => {
                              setEditingCustomer({
                                id: c.id,
                                first_name: c.first_name,
                                last_name: c.last_name,
                                email: c.email,
                                phone: c.phone,
                                group_name: c.group_name,
                                balance: c.balance.toFixed(2),
                                status: c.status,
                                tc_or_tax: c.tc_or_tax,
                                dealer_code: c.dealer_code,
                              })
                              setShowCustomerModal(true)
                            }}
                            className="font-bold text-[#1a73e8] hover:underline cursor-pointer"
                          >
                            {c.no}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-middle font-bold text-zinc-800">
                          {c.first_name} {c.last_name}
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex flex-col gap-0.5 text-[11.5px]">
                            <span className="text-zinc-700">{c.email}</span>
                            <span className="text-zinc-600">{c.phone}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-zinc-700 font-medium">
                          {c.balance.toFixed(2)} TL
                        </td>

                        <td className="py-3.5 px-4 align-middle text-zinc-700 font-medium">{c.group_name}</td>

                        <td className="py-3.5 px-4 align-middle">
                          {c.status === "Aktif" ? (
                            <span className="inline-block px-3 py-1 rounded border border-[#00b259] text-[#00b259] bg-white text-[11px] font-semibold">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded border border-rose-400 text-rose-500 bg-white text-[11px] font-semibold">
                              Pasif
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-middle text-[11.5px] text-zinc-700 leading-tight">
                          <div>{c.last_login_date}</div>
                          <div className="text-zinc-500">{c.last_login_time}</div>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-[11.5px] text-zinc-700 leading-tight">
                          <div>{c.created_date}</div>
                          <div className="text-zinc-500">{c.created_time}</div>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCustomer({
                                  id: c.id,
                                  first_name: c.first_name,
                                  last_name: c.last_name,
                                  email: c.email,
                                  phone: c.phone,
                                  group_name: c.group_name,
                                  balance: c.balance.toFixed(2),
                                  status: c.status,
                                  tc_or_tax: c.tc_or_tax,
                                  dealer_code: c.dealer_code,
                                })
                                setShowCustomerModal(true)
                              }}
                              style={{ backgroundColor: "#9353d3", color: "#ffffff" }}
                              className="w-7 h-7 rounded hover:opacity-90 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-opacity"
                              title="Üye Detaylarını Düzenle"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => alert(`${c.email} adresine şifre sıfırlama bağlantısı gönderildi.`)}
                              className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                              title="Şifre Sıfırlama Gönder"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(c)}
                              style={{ backgroundColor: "#f31260", color: "#ffffff" }}
                              className="w-7 h-7 rounded hover:opacity-90 text-white flex items-center justify-center shadow-2xs cursor-pointer transition-opacity"
                              title="Üyeyi Sil"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-zinc-200 rounded px-2.5 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-zinc-600">
                {filteredCustomers.length} kayıttan {filteredCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} ile{" "}
                {Math.min(currentPage * pageSize, filteredCustomers.length)} arası gösteriliyor
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* YENİ MÜŞTERİ / DÜZENLE MODALI */}
      {showCustomerModal && (
        <div style={{ zIndex: 100025 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]" onClick={() => setShowCustomerModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] flex flex-col relative z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-800">
                {editingCustomer.id ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri Ekle"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Ad *</label>
                <input
                  type="text"
                  value={editingCustomer.first_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, first_name: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Soyad</label>
                <input
                  type="text"
                  value={editingCustomer.last_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, last_name: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">E-Posta Adresi *</label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Telefon Numarası</label>
                <input
                  type="text"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Müşteri Grubu</label>
                <select
                  value={editingCustomer.group_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, group_name: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 bg-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="Genel Müşteri">Genel Müşteri</option>
                  <option value="VIP Müşteriler">VIP Müşteriler</option>
                  <option value="Bayi Grubu">Bayi Grubu</option>
                  <option value="Kurumsal Müşteriler">Kurumsal Müşteriler</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Bakiye (TL)</label>
                <input
                  type="text"
                  value={editingCustomer.balance}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, balance: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">TC No / Vergi No</label>
                <input
                  type="text"
                  value={editingCustomer.tc_or_tax}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, tc_or_tax: e.target.value })}
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1.5">Üyelik Durumu</label>
                <select
                  value={editingCustomer.status}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, status: e.target.value as "Aktif" | "Pasif" })
                  }
                  className="w-full border border-zinc-200 rounded-md px-3 py-2 text-zinc-800 bg-white focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-zinc-50 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 rounded border border-zinc-300 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCustomer}
                style={{ backgroundColor: "#00b259", color: "#ffffff" }}
                className="px-5 py-2 rounded text-white text-xs font-bold hover:opacity-95 cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomerListWidget
