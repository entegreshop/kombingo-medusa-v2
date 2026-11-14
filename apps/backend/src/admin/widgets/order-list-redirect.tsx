import { useState, useEffect, useMemo } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag, Adjustments, CheckCircle, XMark, Plus, Trash, ArrowPath, Pencil } from "@medusajs/icons"
import { PosModal } from "../routes/orders/components/pos-modal"
import { openGibInvoicePrintWindow } from "../routes/e-fatura/page"

// Custom inline SVG icons for print options and statuses
const EInvoiceIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h10M7 12h10M7 16h5" />
    <circle cx="17" cy="15" r="1.5" className="fill-zinc-500" />
  </svg>
)

const InvoiceIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const PackageIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const TruckIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2.5a.5.5 0 01-.5.5H11m-6 0a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2zM13 16h4.5a1.5 1.5 0 001.5-1.5V9.5L16.5 6H13m4 6.5h2" />
  </svg>
)

const BarcodeIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2M7 5h1M10 5h3M15 5h1M18 5h3M3 10h2M7 10h1M10 10h3M15 10h1M18 10h3M3 15h2M7 15h1M10 15h3M15 15h1M18 15h3M3 19h2M7 19h1M10 19h3M15 19h1M18 19h3" />
  </svg>
)

const PdfIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <text x="7" y="15" fill="currentColor" fontSize="6" fontFamily="Arial" fontWeight="bold" className="text-zinc-600">PDF</text>
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOutlineIcon = () => (
  <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const BarcodeSimpleIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2v16H3V4zm4 0h1v16H7V4zm3 0h2v16h-2V4zm4 0h1v16h-1V4zm3 0h4v16h-4V4z" />
  </svg>
)

const GiftIcon = () => (
  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const CizgiLogo = () => (
  <svg width="56" height="20" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="70" y="25" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" fill="#18181b" textAnchor="middle" letterSpacing="1">KOMBİNGO</text>
  </svg>
)

// Main structure interface
interface OrderItem {
  id: string
  title: string
  sku: string
  barcode: string
  size: string
  unit_price: number
  quantity: number
  vat_rate: number // percent, e.g. 10
  thumbnail: string
}

interface OrderLog {
  id: string
  message: string
  created_at: string
}

interface CustomOrder {
  id: string
  display_id: string
  platform: "WhatsApp" | "Kombingo"
  store: string
  order_tag: string
  discount_total?: any
  discounts?: any[]
  customer: {
    first_name: string
    last_name: string
    phone: string
    email: string
    ip: string
    member_no: string
    is_visitor: boolean
  }
  shipping_address: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string
    city: string // province
    district: string // ilce
    country_code: string
    country_name: string
    phone: string
  }
  billing_address: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string
    city: string
    district: string
    country_code: string
    country_name: string
    phone: string
    tax_no?: string
    tax_office?: string
    tc_no?: string
  }
  items: OrderItem[]
  subtotal: number // TL
  vat_total: number // TL
  total: number // TL
  payment_method: string // human readable e.g. "Kapıda Nakit Ödeme"
  payment_option: "paytr" | "bank_transfer" | "cash_on_delivery" | "card_on_delivery"
  status: "onay_bekleyen" | "hazirlanan" | "kargolanan" | "teslim_edilen" | "iade_edilen" | "iptal_edilen" | "odeme_hatasi" | "tum_siparisler"
  carrier_name: string // e.g. "KARGOİST", "INTERLINE KARGO"
  carrier_barcode?: string
  created_at: string // format DD.MM.YYYY HH:MM
  admin_notes?: string
  logs: OrderLog[]
  integration_logs: OrderLog[]
  invoice_series?: string
  invoice_date?: string
  e_invoice_date?: string
  metadata?: Record<string, any>
}

// ==========================================
// RİSKLİ MÜŞTERİ KONTROL FONKSİYONU
// ==========================================
const checkIsCustomerRisky = (phone?: string, email?: string, orderId?: string) => {
  if (!phone && !email) return false;
  
  // Clean phone number (remove spaces, +90, etc)
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : "";
  const cleanEmail = email ? email.toLowerCase().trim() : "";

  // Iterate over all orders directly from mappedRealOrders (assuming it's in scope, 
  // but wait, we need to pass currentOrders to it, or defined it inside the component)
  return false; // We will define the real logic inside the component
}
// ==========================================

const SiparisYonetimiPage = () => {
  const [isPosOpen, setIsPosOpen] = useState(false)
  
  // Success Modal State
  const [successModal, setSuccessModal] = useState<string | null>(null)
  const showSuccess = (message: string) => {
    setSuccessModal(message)
  }

  // Real orders list from API
  const [realOrders, setRealOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  // Selected Order for Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Bulk operation selections
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

  // Search & Filter Panel state
  const [showFilters, setShowFilters] = useState(false)
  const [quickSearch, setQuickSearch] = useState("")

  // Tab selections
  // tabs: "onay_bekleyen" | "hazirlanan" | "kargolanan" | "teslim_edilen" | "iade_edilen" | "iptal_edilen" | "tum_siparisler" | "odeme_hatasi"
  const [activeTab, setActiveTab] = useState<string>("tum_siparisler")
  const [lastSyncedSearch, setLastSyncedSearch] = useState<string>("")

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return
      const currentSearch = window.location.search
      setLastSyncedSearch((prev) => {
        if (prev === currentSearch) return prev
        const params = new URLSearchParams(currentSearch)
        const statusParam = params.get("status")
        const tabParam = params.get("tab")
        const actionParam = params.get("action")
        if (
          tabParam &&
          [
            "aktif-sepetler",
            "terk-edilmis-sepetler",
            "havale-bildirimleri",
            "siparis-etiketleri",
            "risk-kriterleri",
          ].includes(tabParam)
        ) {
          setActiveTab(tabParam)
        } else if (
          statusParam &&
          [
            "onay_bekleyen",
            "hazirlanan",
            "kargolanan",
            "teslim_edilen",
            "iade_edilen",
            "iptal_edilen",
            "tum_siparisler",
            "odeme_hatasi",
          ].includes(statusParam)
        ) {
          setActiveTab(statusParam)
        }
        if (actionParam === "pos") {
          setIsPosOpen(true)
        }
        return currentSearch
      })
    }
    syncFromUrl()
    window.addEventListener("popstate", syncFromUrl)
    const interval = setInterval(syncFromUrl, 300)
    return () => {
      window.removeEventListener("popstate", syncFromUrl)
      clearInterval(interval)
    }
  }, [])

  // Form Filter States
  const [filterStatus, setFilterStatus] = useState("Yeni Sipariş")
  const [filterPlatform, setFilterPlatform] = useState("")
  const [filterStore, setFilterStore] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [filterOrderNo, setFilterOrderNo] = useState("")
  const [filterOrderDateStart, setFilterOrderDateStart] = useState("")
  const [filterOrderDateEnd, setFilterOrderDateEnd] = useState("")
  const [filterInvoiceDateStart, setFilterInvoiceDateStart] = useState("")
  const [filterInvoiceDateEnd, setFilterInvoiceDateEnd] = useState("")
  const [filterEInvoiceDateStart, setFilterEInvoiceDateStart] = useState("")
  const [filterEInvoiceDateEnd, setFilterEInvoiceDateEnd] = useState("")
  const [filterTotalMin, setFilterTotalMin] = useState("")
  const [filterTotalMax, setFilterTotalMax] = useState("")
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("")
  const [filterCustomerFirstName, setFilterCustomerFirstName] = useState("")
  const [filterCustomerLastName, setFilterCustomerLastName] = useState("")
  const [filterPhone, setFilterPhone] = useState("")
  const [filterTaxNo, setFilterTaxNo] = useState("")
  const [filterTaxOffice, setFilterTaxOffice] = useState("")
  const [filterTcNo, setFilterTcNo] = useState("")
  const [filterMemberNo, setFilterMemberNo] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterProvince, setFilterProvince] = useState("")
  const [filterProductNo, setFilterProductNo] = useState("")
  const [filterProductBarcode, setFilterProductBarcode] = useState("")
  const [filterProductName, setFilterProductName] = useState("")
  const [filterProductTag, setFilterProductTag] = useState("")
  const [filterGiftCardCode, setFilterGiftCardCode] = useState("")
  const [filterPromo, setFilterPromo] = useState("")
  const [filterCarrier, setFilterCarrier] = useState("")
  const [filterAdvancedSearch, setFilterAdvancedSearch] = useState("")

  // Selected editable Manager Notes inside Modal
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotesText, setTempNotesText] = useState("")

  // Selected editable Fatura Seri inside Modal
  const [editingInvoiceSeries, setEditingInvoiceSeries] = useState(false)
  const [tempInvoiceSeriesText, setTempInvoiceSeriesText] = useState("")

  // Editable info blocks
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [tempCustomer, setTempCustomer] = useState({ first_name: "", last_name: "", email: "", phone: "" })
  const [editingShipping, setEditingShipping] = useState(false)
  const [tempShipping, setTempShipping] = useState({ first_name: "", last_name: "", address_1: "", district: "", city: "" })
  const [editingBilling, setEditingBilling] = useState(false)
  const [tempBilling, setTempBilling] = useState({ first_name: "", last_name: "", address_1: "", district: "", city: "", tc_no: "" })

  const [editingProducts, setEditingProducts] = useState(false)
  const [tempProducts, setTempProducts] = useState<{id: string, unit_price: number, quantity: number}[]>([])

  // Product Search Modal State
  const [showProductSearchModal, setShowProductSearchModal] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [productSearchResults, setProductSearchResults] = useState<any[]>([
    {
      id: "prod_dummy_1",
      title: "Pembe Alo Arabiyeli Taytlı Takım",
      thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
      variants: [
        { id: "var_1", title: "S", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_2", title: "M", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_3", title: "L", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_4", title: "XL", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
      ]
    },
    {
      id: "prod_dummy_2",
      title: "Kahve Alo Arabiyeli Taytlı Takım",
      thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
      variants: [
        { id: "var_5", title: "S", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_6", title: "M", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_7", title: "L", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        { id: "var_8", title: "XL", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
      ]
    }
  ])
  const [searchingProducts, setSearchingProducts] = useState(false)

  useEffect(() => {
    if (showProductSearchModal && productSearchQuery.trim()) {
      const delayFn = setTimeout(() => {
        handleSearchProducts()
      }, 400)
      return () => clearTimeout(delayFn)
    } else if (showProductSearchModal && !productSearchQuery.trim()) {
      // Revert to default when empty
      setProductSearchResults([
        {
          id: "prod_dummy_1",
          title: "Pembe Alo Arabiyeli Taytlı Takım",
          thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
          variants: [
            { id: "var_1", title: "S", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_2", title: "M", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_3", title: "L", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_4", title: "XL", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          ]
        },
        {
          id: "prod_dummy_2",
          title: "Kahve Alo Arabiyeli Taytlı Takım",
          thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
          variants: [
            { id: "var_5", title: "S", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_6", title: "M", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_7", title: "L", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
            { id: "var_8", title: "XL", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          ]
        }
      ])
    }
  }, [productSearchQuery, showProductSearchModal])

  // Action menu inside Modal
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isBulkActionMenuOpen, setIsBulkActionMenuOpen] = useState(false)

  // Status Change Modal State
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusModalTargetIds, setStatusModalTargetIds] = useState<string[]>([])
  const [newStatusValue, setNewStatusValue] = useState("yeni_siparis")
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  // Shipment Modal State
  const [showShipmentModal, setShowShipmentModal] = useState(false)
  const [shipmentModalTargetIds, setShipmentModalTargetIds] = useState<string[]>([])
  const [selectedCarrier, setSelectedCarrier] = useState("kargonova")

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printModalTargetIds, setPrintModalTargetIds] = useState<string[]>([])
  const [printTemplate, setPrintTemplate] = useState("E-Fatura")

  // Fetch real orders from Medusa V2 on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/admin/orders?limit=100&order=-created_at&fields=id,status,created_at,email,display_id,payment_status,fulfillment_status,total,currency_code,*customer,*sales_channel,*payment_collections,*items,*shipping_address,*billing_address,metadata")
        if (res.ok) {
          const data = await res.json()
          if (data && data.orders) {
            const parsedOrders = data.orders.map((o: any) => {
               if (o.metadata?.edited_customer) o.customer = { ...o.customer, ...o.metadata.edited_customer };
               if (o.metadata?.edited_shipping) o.shipping_address = { ...o.shipping_address, ...o.metadata.edited_shipping };
               if (o.metadata?.edited_billing) o.billing_address = { ...o.billing_address, ...o.metadata.edited_billing };
               if (o.metadata?.edited_items) o.items = o.metadata.edited_items;
               if (o.metadata?.edited_total != null && !isNaN(o.metadata?.edited_total)) o.total = o.metadata.edited_total;
               if (o.metadata?.edited_email) o.email = o.metadata.edited_email;
               return o;
            });
            setRealOrders(parsedOrders)
          }
        } else {
          console.error("Failed to load orders, status:", res.status)
        }
      } catch (err) {
        console.error("Failed to load orders from API:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Order Operations Data (Ödeme Hatası / PayTR, Aktif Sepetler, Terk Edilmiş Sepetler, Havale Bildirimleri, Sipariş Etiketleri, Risk Kriterleri)
  const [opsData, setOpsData] = useState<any>({
    missingOrders: [],
    activeCarts: {
      stats: { totalCarts: 0, totalProducts: 0, totalQuantity: 0, avgQuantity: 0, avgAmount: 0, totalAmount: 0 },
      items: [],
    },
    abandonedCarts: {
      stats: { abandonedCount: 0, abandonedItemsCount: 0, abandonedTotal: 0, recoveredCount: 0, recoveredTotal: 0 },
      automationActive: true,
      items: [],
    },
    eftNotifications: [],
    orderTags: [
      { id: "tag_6", no: 6, name: "Mağaza", active: true, created_at: "2025-12-30" },
      { id: "tag_5", no: 5, name: "Telefon", active: true, created_at: "2025-12-30" },
      { id: "tag_4", no: 4, name: "Twitter", active: true, created_at: "2025-12-30" },
      { id: "tag_3", no: 3, name: "WhatsApp", active: true, created_at: "2025-12-30" },
      { id: "tag_2", no: 2, name: "Facebook", active: true, created_at: "2025-12-30" },
      { id: "tag_1", no: 1, name: "Instagram", active: true, created_at: "2025-12-30" },
    ],
    riskCriteria: [],
    autoRiskConfig: {
      autoDisableCodOnReturn: true,
      minReturnCount: 1,
      actionType: "only_credit_card",
      blockedMethods: ["Kapıda Ödeme", "Havale / EFT"],
    },
  })
  const [opsLoading, setOpsLoading] = useState(false)
  const [selectedCartPreview, setSelectedCartPreview] = useState<any | null>(null)
  const [creatingFromMissingId, setCreatingFromMissingId] = useState<string | null>(null)
  const [eftPageSize, setEftPageSize] = useState<number>(15)
  const [tagPageSize, setTagPageSize] = useState<number>(15)
  const [riskPageSize, setRiskPageSize] = useState<number>(15)

  // Sipariş Etiketleri Modal State (Görsel 1 & 2)
  const [showOrderTagModal, setShowOrderTagModal] = useState(false)
  const [tagModalActionsOpen, setTagModalActionsOpen] = useState(false)
  const [editingOrderTag, setEditingOrderTag] = useState<{
    id?: string
    no?: number
    name: string
    active: boolean
  }>({ name: "", active: true })

  // Risk Kriterleri Modal State (Görsel 3, 4 & 5)
  const [showRiskCriterionModal, setShowRiskCriterionModal] = useState(false)
  const [showAutoRiskModal, setShowAutoRiskModal] = useState(false)
  const [riskMethodsDropdownOpen, setRiskMethodsDropdownOpen] = useState(false)
  const [riskMethodsSearch, setRiskMethodsSearch] = useState("")
  const [showRiskFilters, setShowRiskFilters] = useState(false)
  const [riskFilterName, setRiskFilterName] = useState("")
  const [riskFilterPhone, setRiskFilterPhone] = useState("")
  const [riskFilterEmail, setRiskFilterEmail] = useState("")
  const [editingRiskCriterion, setEditingRiskCriterion] = useState<{
    id?: string
    no?: number
    full_name: string
    email: string
    phone: string
    tc_no: string
    tax_no: string
    ip: string
    blocked_payment_methods: string[]
    is_completely_blocked: boolean
    only_credit_card: boolean
    admin_note: string
  }>({
    full_name: "",
    email: "",
    phone: "",
    tc_no: "",
    tax_no: "",
    ip: "",
    blocked_payment_methods: ["Kapıda Ödeme", "Havale / EFT"],
    is_completely_blocked: false,
    only_credit_card: true,
    admin_note: "",
  })

  const ALL_RISK_PAYMENT_METHODS = [
    "Kapıda Ödeme",
    "Havale / EFT",
    "Kredi Kartı",
    "PayTR (iFrame)",
    "İyzico (iFrame)",
    "Cüzdanla Ödeme",
    "Mağazada Ödeme",
    "Vallet (iFrame)",
    "PayOp",
    "Diğer",
  ]

  const fetchOrderOperations = async () => {
    setOpsLoading(true)
    try {
      const res = await fetch("/admin/order-operations")
      if (res.ok) {
        const data = await res.json()
        if (data && data.success) {
          setOpsData((prev: any) => ({ ...prev, ...data }))
        }
      }
    } catch (err) {
      console.error("Error loading order operations:", err)
    } finally {
      setOpsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderOperations()
  }, [])

  useEffect(() => {
    if (
      activeTab === "odeme_hatasi" ||
      activeTab === "aktif-sepetler" ||
      activeTab === "terk-edilmis-sepetler" ||
      activeTab === "havale-bildirimleri" ||
      activeTab === "siparis-etiketleri" ||
      activeTab === "risk-kriterleri"
    ) {
      fetchOrderOperations()
    }
  }, [activeTab])

  const handleSaveOrderTag = async () => {
    if (!editingOrderTag.name.trim()) {
      alert("Lütfen etiket adı giriniz.")
      return
    }
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_order_tag",
          tag: editingOrderTag,
        }),
      })
      const data = await res.json()
      if (data?.success) {
        setOpsData((prev: any) => ({ ...prev, orderTags: data.orderTags }))
        setShowOrderTagModal(false)
        setTagModalActionsOpen(false)
        showSuccess(data.message || "Sipariş etiketi kaydedildi.")
      }
    } catch (err) {
      alert("Etiket kaydedilirken hata oluştu.")
    }
  }

  const handleDeleteOrderTag = async (id: string) => {
    if (!confirm("Bu sipariş etiketini silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_order_tag", id }),
      })
      const data = await res.json()
      if (data?.success) {
        setOpsData((prev: any) => ({ ...prev, orderTags: data.orderTags }))
        setShowOrderTagModal(false)
        setTagModalActionsOpen(false)
        showSuccess("Sipariş etiketi silindi.")
      }
    } catch (err) {}
  }

  const handleNavigateOrderTagModal = (direction: "prev" | "next") => {
    const list = opsData.orderTags || []
    if (!editingOrderTag.id || list.length <= 1) return
    const currentIdx = list.findIndex((t: any) => t.id === editingOrderTag.id)
    if (currentIdx === -1) return
    const targetIdx =
      direction === "prev"
        ? (currentIdx - 1 + list.length) % list.length
        : (currentIdx + 1) % list.length
    const target = list[targetIdx]
    if (target) {
      setEditingOrderTag({
        id: target.id,
        no: target.no,
        name: target.name,
        active: target.active !== false,
      })
    }
  }

  const handleOpenNewRiskCriterion = (prefill?: Partial<typeof editingRiskCriterion>) => {
    setEditingRiskCriterion({
      id: prefill?.id,
      no: prefill?.no,
      full_name: prefill?.full_name || "",
      email: prefill?.email || "",
      phone: prefill?.phone || "",
      tc_no: prefill?.tc_no || "",
      tax_no: prefill?.tax_no || "",
      ip: prefill?.ip || "",
      blocked_payment_methods: prefill?.blocked_payment_methods || ["Kapıda Ödeme", "Havale / EFT"],
      is_completely_blocked: Boolean(prefill?.is_completely_blocked),
      only_credit_card: prefill?.only_credit_card !== undefined ? prefill.only_credit_card : true,
      admin_note: prefill?.admin_note || "",
    })
    setRiskMethodsDropdownOpen(false)
    setRiskMethodsSearch("")
    setShowRiskCriterionModal(true)
  }

  const handleSaveRiskCriterion = async () => {
    if (
      !editingRiskCriterion.full_name.trim() &&
      !editingRiskCriterion.phone.trim() &&
      !editingRiskCriterion.email.trim() &&
      !editingRiskCriterion.tc_no.trim() &&
      !editingRiskCriterion.tax_no.trim() &&
      !editingRiskCriterion.ip.trim()
    ) {
      alert("Lütfen en az bir müşteri kriteri (Ad Soyad, Telefon, E-Posta, TC Kimlik No veya IP) giriniz.")
      return
    }
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_risk_criterion",
          criterion: editingRiskCriterion,
        }),
      })
      const data = await res.json()
      if (data?.success) {
        await fetchOrderOperations()
        setShowRiskCriterionModal(false)
        showSuccess(data.message || "Risk kriteri başarıyla kaydedildi.")
      }
    } catch (err) {
      alert("Risk kriteri kaydedilirken hata oluştu.")
    }
  }

  const handleDeleteRiskCriterion = async (id: string) => {
    if (!confirm("Bu risk kriterini silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_risk_criterion", id }),
      })
      if (res.ok) {
        await fetchOrderOperations()
        showSuccess("Risk kriteri silindi.")
      }
    } catch (err) {}
  }

  const handleSaveAutoRiskConfig = async (newConfig: any) => {
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_auto_risk_config", config: newConfig }),
      })
      if (res.ok) {
        await fetchOrderOperations()
        setShowAutoRiskModal(false)
        showSuccess("Otomatik risk kriterleri ayarları güncellendi.")
      }
    } catch (err) {}
  }

  const handleCreateOrderFromMissing = async (item: any) => {
    setCreatingFromMissingId(item.id)
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order_from_missing",
          id: item.id,
          cart_id: item.cart_id,
          order_id: item.order_id,
        }),
      })
      const data = await res.json()
      if (data && data.success) {
        showSuccess(data.message || "Sipariş başarıyla oluşturuldu.")
        await fetchOrderOperations()
        const refreshRes = await fetch("/admin/orders?limit=100&order=-created_at&fields=id,status,created_at,email,display_id,payment_status,fulfillment_status,total,currency_code,*customer,*sales_channel,*payment_collections,*items,*shipping_address,*billing_address,metadata")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          if (refreshData?.orders) setRealOrders(refreshData.orders)
        }
      }
    } catch (err) {
      alert("Sipariş oluşturulurken bir hata oluştu.")
    } finally {
      setCreatingFromMissingId(null)
    }
  }

  const handleDeleteEftNotification = async (id: string) => {
    if (!confirm("Bu havale bildirimini silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_eft_notification", id }),
      })
      if (res.ok) {
        await fetchOrderOperations()
        showSuccess("Havale bildirimi silindi.")
      }
    } catch (err) {}
  }

  const handleToggleCartAutomation = async () => {
    try {
      const res = await fetch("/admin/order-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_automation" }),
      })
      if (res.ok) {
        const data = await res.json()
        setOpsData((prev: any) => ({
          ...prev,
          abandonedCarts: {
            ...prev.abandonedCarts,
            automationActive: data.automationActive,
          },
        }))
      }
    } catch (err) {}
  }

  // Map Medusa V2 Real orders to our CustomOrder structure
  const mappedRealOrders = useMemo(() => {
    return realOrders.map((o: any) => {
      const itemsMapped: OrderItem[] = (o.items || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        sku: item.variant?.sku || "",
        barcode: item.variant?.barcode || "",
        size: item.variant_title || item.variant?.title || "Standart",
        unit_price: (item.unit_price || 0) / 100,
        quantity: item.quantity || 1,
        vat_rate: 10, // Medusa standard default
        thumbnail: item.thumbnail || ""
      }))

      const subtotalVal = itemsMapped.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
      const totalVal = (o.total || 0) / 100

      // Try to determine payment method name
      let payMethod = "Kredi Kartı"
      const metaOption = o.metadata?.payment_option
      if (metaOption === "cash_on_delivery") payMethod = "Kapıda Nakit Ödeme"
      else if (metaOption === "card_on_delivery") payMethod = "Kapıda Kredi Kartı ile Ödeme"
      else if (metaOption === "bank_transfer") payMethod = "Havale / EFT"
      else if (metaOption === "paytr") payMethod = "PayTR"

      // Map shipping option/carrier
      const carrierName = o.shipping_methods?.[0]?.name || "Diğer Kargo"

      // Logs
      const logsMapped: OrderLog[] = []
      if (o.metadata?.logs) {
        logsMapped.push(...o.metadata.logs)
      } else {
        logsMapped.push({ id: "real_l1", message: "Sipariş oluşturuldu", created_at: new Date(o.created_at).toLocaleString('tr-TR') })
        if (o.fulfillment_status === "fulfilled" || o.fulfillment_status === "shipped") {
          logsMapped.push({ id: "real_l2", message: "Sipariş paketlendi ve kargolandı", created_at: new Date(o.updated_at).toLocaleString('tr-TR') })
        }
      }

      // Order status mapping
      let orderStatus: CustomOrder["status"] = "tum_siparisler" as any
      if (o.metadata?.delivery_status) {
        orderStatus = o.metadata.delivery_status as CustomOrder["status"]
      } else if (o.status === "canceled") orderStatus = "iptal_edilen"
      else if (o.fulfillment_status === "shipped") orderStatus = "kargolanan"
      else if (o.status === "completed") orderStatus = "teslim_edilen"
      else if (o.fulfillment_status === "fulfilled") orderStatus = "hazirlanan"
      else orderStatus = "onay_bekleyen"

      return {
        id: o.id,
        display_id: o.display_id?.toString() || o.id.slice(-8),
        platform: o.metadata?.platform || "Kombingo",
        store: "Kombingo",
        order_tag: o.metadata?.order_tag || "Seçilmedi",
        customer: {
          first_name: o.customer?.first_name || o.shipping_address?.first_name || "Müşteri",
          last_name: o.customer?.last_name || o.shipping_address?.last_name || "",
          phone: o.customer?.phone || o.shipping_address?.phone || "",
          email: o.customer?.email || o.email || "",
          ip: o.metadata?.ip_address || "127.0.0.1",
          member_no: o.customer?.id ? `U-${o.customer.id.slice(-4).toUpperCase()}` : "Misafir",
          is_visitor: !o.customer?.id
        },
        shipping_address: {
          first_name: o.shipping_address?.first_name || "",
          last_name: o.shipping_address?.last_name || "",
          address_1: o.shipping_address?.address_1 || "",
          address_2: o.shipping_address?.address_2 || "",
          city: o.shipping_address?.province || o.shipping_address?.city || "",
          district: o.shipping_address?.city || "",
          country_code: o.shipping_address?.country_code || "tr",
          country_name: "Türkiye",
          phone: o.shipping_address?.phone || ""
        },
        billing_address: {
          first_name: o.billing_address?.first_name || o.shipping_address?.first_name || "",
          last_name: o.billing_address?.last_name || o.shipping_address?.last_name || "",
          address_1: o.billing_address?.address_1 || o.shipping_address?.address_1 || "",
          address_2: o.billing_address?.address_2 || o.shipping_address?.address_2 || "",
          city: o.billing_address?.province || o.billing_address?.city || "",
          district: o.billing_address?.city || "",
          country_code: o.billing_address?.country_code || "tr",
          country_name: "Türkiye",
          phone: o.billing_address?.phone || "",
          tc_no: o.metadata?.tc_no || o.metadata?.tckn || "",
          tax_no: o.metadata?.tax_no || o.metadata?.vkn || "",
          tax_office: o.metadata?.tax_office || ""
        },
        items: itemsMapped,
        subtotal: subtotalVal,
        vat_total: totalVal - subtotalVal > 0 ? totalVal - subtotalVal : totalVal * 0.1,
        total: totalVal,
        payment_method: payMethod,
        payment_option: metaOption || "cash_on_delivery",
        status: orderStatus,
        carrier_name: carrierName,
        carrier_barcode: o.metadata?.carrier_barcode || "",
        created_at: new Date(o.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        admin_notes: o.metadata?.admin_notes || "",
        logs: logsMapped,
        integration_logs: o.metadata?.integration_logs || [],
        invoice_series: o.metadata?.invoice_series || "-",
        invoice_date: o.metadata?.invoice_date || "",
        e_invoice_date: o.metadata?.e_invoice_date || "",
        metadata: o.metadata || {}
      } as CustomOrder
    })
  }, [realOrders])

  // Current orders list is now always real orders
  const currentOrders = mappedRealOrders

  // Tab Filtering logic
  const tabFilteredOrders = useMemo(() => {
    if (activeTab === "tum_siparisler") return currentOrders

    return currentOrders.filter(o => {
      if (activeTab === "onay_bekleyen") return o.status === "onay_bekleyen"
      if (activeTab === "hazirlanan") return o.status === "hazirlanan"
      if (activeTab === "kargolanan") return o.status === "kargolanan"
      if (activeTab === "teslim_edilen") return o.status === "teslim_edilen"
      if (activeTab === "iade_edilen") return o.status === "iade_edilen"
      if (activeTab === "iptal_edilen") return o.status === "iptal_edilen"
      if (activeTab === "odeme_hatasi") return o.status === "odeme_hatasi"
      return true
    })
  }, [currentOrders, activeTab])

  // Count of "Hazırlananlar" for the emerald tab badge
  const preparingCount = useMemo(() => {
    return currentOrders.filter(o => o.status === "hazirlanan").length
  }, [currentOrders])

  // Full Filters & Quick Search application
  const filteredOrdersList = useMemo(() => {
    return tabFilteredOrders.filter(o => {
      // 1. Quick search
      if (quickSearch) {
        const query = quickSearch.toLowerCase()
        const matchNo = o.display_id.toLowerCase().includes(query)
        const matchCust = `${o.customer.first_name} ${o.customer.last_name}`.toLowerCase().includes(query)
        const matchPhone = o.customer.phone.toLowerCase().includes(query)
        if (!matchNo && !matchCust && !matchPhone) return false
      }

      // 2. Platform & Sipariş Etiketi filter
      if (filterPlatform && o.platform.toLowerCase() !== filterPlatform.toLowerCase()) return false
      if (filterTag && o.order_tag.toLowerCase() !== filterTag.toLowerCase() && o.platform.toLowerCase() !== filterTag.toLowerCase()) return false

      // 3. Sipariş No filter
      if (filterOrderNo && !o.display_id.includes(filterOrderNo)) return false

      // 4. Müşteri Adı
      if (filterCustomerFirstName && !o.customer.first_name.toLowerCase().includes(filterCustomerFirstName.toLowerCase())) return false

      // 5. Müşteri Soyadı
      if (filterCustomerLastName && !o.customer.last_name.toLowerCase().includes(filterCustomerLastName.toLowerCase())) return false

      // 6. Telefon
      if (filterPhone && !o.customer.phone.replace(/\D/g, "").includes(filterPhone.replace(/\D/g, ""))) return false

      // 7. TC No
      if (filterTcNo && o.billing_address.tc_no !== filterTcNo) return false

      // 8. Kargo Firması
      if (filterCarrier && o.carrier_name.toLowerCase() !== filterCarrier.toLowerCase()) return false

      // 9. Ödeme Yöntemi
      if (filterPaymentMethod && o.payment_method.toLowerCase() !== filterPaymentMethod.toLowerCase()) return false

      // 10. Tutar Aralığı
      if (filterTotalMin && o.total < parseFloat(filterTotalMin)) return false
      if (filterTotalMax && o.total > parseFloat(filterTotalMax)) return false

      // 11. İl
      if (filterProvince && !o.shipping_address.city.toLowerCase().includes(filterProvince.toLowerCase())) return false

      // 12. Ürün Adı
      if (filterProductName) {
        const hasProduct = o.items.some(item => item.title.toLowerCase().includes(filterProductName.toLowerCase()))
        if (!hasProduct) return false
      }

      return true
    })
  }, [tabFilteredOrders, quickSearch, filterPlatform, filterTag, filterOrderNo, filterCustomerFirstName, filterCustomerLastName, filterPhone, filterTcNo, filterCarrier, filterPaymentMethod, filterTotalMin, filterTotalMax, filterProvince, filterProductName])

  // Select all handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrdersList.map(o => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  // Row selection handler
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds([...selectedOrderIds, id])
    } else {
      setSelectedOrderIds(selectedOrderIds.filter(x => x !== id))
    }
  }

  // Active Selected Order details object
  const activeOrderDetails = useMemo(() => {
    return currentOrders.find(o => o.id === selectedOrderId) || null
  }, [currentOrders, selectedOrderId])

  // Clear filters
  const handleClearFilters = () => {
    setFilterStatus("Yeni Sipariş, Hazırlanan Sipariş, Kargolanan Sipariş, Teslim Edilen Sipariş")
    setFilterPlatform("")
    setFilterStore("")
    setFilterTag("")
    setFilterOrderNo("")
    setFilterOrderDateStart("")
    setFilterOrderDateEnd("")
    setFilterInvoiceDateStart("")
    setFilterInvoiceDateEnd("")
    setFilterEInvoiceDateStart("")
    setFilterEInvoiceDateEnd("")
    setFilterTotalMin("")
    setFilterTotalMax("")
    setFilterPaymentMethod("")
    setFilterCustomerFirstName("")
    setFilterCustomerLastName("")
    setFilterPhone("")
    setFilterTaxNo("")
    setFilterTaxOffice("")
    setFilterTcNo("")
    setFilterMemberNo("")
    setFilterCountry("")
    setFilterProvince("")
    setFilterProductNo("")
    setFilterProductBarcode("")
    setFilterProductName("")
    setFilterProductTag("")
    setFilterGiftCardCode("")
    setFilterPromo("")
    setFilterCarrier("")
    setFilterAdvancedSearch("")
  }

  // Quick Action: Teslim Et (Mark Delivered)
  const handleMarkDelivered = async (orderId: string) => {
    const timeStr = new Date().toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    
    // Real API status update via Medusa Order metadata update
      try {
        const target = currentOrders.find(x => x.id === orderId)
        if (!target) return
        
        const updatedLogs = [
          { id: `dl_${Date.now()}`, message: "admin teslim edildi olarak işaretledi", created_at: timeStr },
          ...target.logs
        ]

        const res = await fetch(`/admin/orders/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            metadata: {
              ...target.billing_address, // keep old metadata
              delivery_status: "delivered",
              logs: updatedLogs
            }
          })
        })
        if (res.ok) {
          const data = await res.json()
          // Re-fetch orders list
          const refreshRes = await fetch("/admin/orders?limit=100")
          const refreshData = await refreshRes.json()
          if (refreshData && refreshData.orders) {
            setRealOrders(refreshData.orders)
            showSuccess("Sipariş başarıyla teslim edildi olarak işaretlendi.")
          }
        } else {
          alert("Sipariş güncellenirken hata oluştu.")
        }
      } catch (err) {
        console.error("Error updating order:", err)
        alert("Bağlantı hatası.")
      }
  }
  // Generic Status Change
  const handleStatusChange = async (orderId: string, newStatus: string, skipRefresh: boolean = false) => {
    try {
      const res = await fetch(`/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { delivery_status: newStatus }
        })
      })
      if (res.ok && !skipRefresh) {
        const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
        const refreshData = await refreshRes.json()
        if (refreshData && refreshData.orders) setRealOrders(refreshData.orders)
      }
    } catch(err) {
      console.error(err)
    }
  }

  // Quick Action: İptal Et (Cancel Order)
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) return
    const timeStr = new Date().toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    try {
        const res = await fetch(`/admin/orders/${orderId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        if (res.ok) {
          showSuccess("Sipariş başarıyla güncellendi.")
          const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
          const refreshData = await refreshRes.json()
          if (refreshData && refreshData.orders) {
            setRealOrders(refreshData.orders)
          }
        } else {
          alert("Sipariş iptal edilirken hata oluştu.")
        }
      } catch (err) {
        console.error(err)
      }
  }

  // Save Manager Notes inside Modal
  const handleSaveNotes = () => {
    // In real mode, would send metadata update to backend
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          metadata: { ...o.metadata, admin_notes: tempNotesText }
        }
      }
      return o
    }))
    setEditingNotes(false)
  }
  const handleSaveInvoiceSeries = () => {
    // In real mode, would send metadata update to backend
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          metadata: { ...o.metadata, invoice_series: tempInvoiceSeriesText }
        }
      }
      return o
    }))
    setEditingInvoiceSeries(false)
  }

  const handleSaveCustomer = async () => {
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          customer: { ...o.customer, ...tempCustomer },
          email: tempCustomer.email
        }
      }
      return o
    }))
    setEditingCustomer(false)
    const order = realOrders.find(o => o.id === selectedOrderId)
    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: tempCustomer.email,
          metadata: { ...order?.metadata, edited_customer: tempCustomer, edited_email: tempCustomer.email }
        })
      })
    } catch (err) {}
  }

  const handleSaveShipping = async () => {
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          shipping_address: { ...o.shipping_address, ...tempShipping }
        }
      }
      return o
    }))
    setEditingShipping(false)
    const order = realOrders.find(o => o.id === selectedOrderId)
    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order?.metadata, edited_shipping: tempShipping }
        })
      })
    } catch (err) {}
  }

  const handleSaveBilling = async () => {
    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          billing_address: { ...o.billing_address, ...tempBilling }
        }
      }
      return o
    }))
    setEditingBilling(false)
    const order = realOrders.find(o => o.id === selectedOrderId)
    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order?.metadata, edited_billing: tempBilling }
        })
      })
    } catch (err) {}
  }

  const handleSaveProducts = async () => {
    const order = realOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const newItems = order.items
      .filter((i: any) => tempProducts.some(t => t.id === i.id))
      .map((i: any) => {
        const tp = tempProducts.find(t => t.id === i.id)
        if (tp) {
          return { ...i, unit_price: tp.unit_price * 100, quantity: tp.quantity }
        }
        return i
      });
    
    const oldItemsSum = order.items.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newItemsSum = newItems.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newTotal = order.total - oldItemsSum + newItemsSum;

    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return { ...o, total: newTotal, items: newItems }
      }
      return o
    }))
    setEditingProducts(false)

    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order.metadata, edited_items: newItems, edited_total: newTotal }
        })
      })
    } catch (err) {}
  }

  const handleSearchProducts = async () => {
    if (!productSearchQuery.trim()) return;
    setSearchingProducts(true);
    
    // Dummy products fallback
    const dummyProducts = [
      {
        id: "prod_dummy_1",
        title: "Pembe Alo Arabiyeli Taytlı Takım",
        thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
        variants: [
          { id: "var_1", title: "S", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_2", title: "M", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_3", title: "L", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_4", title: "XL", sku: "LXS5SU5V0G", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        ]
      },
      {
        id: "prod_dummy_2",
        title: "Kahve Alo Arabiyeli Taytlı Takım",
        thumbnail: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
        variants: [
          { id: "var_5", title: "S", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_6", title: "M", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_7", title: "L", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
          { id: "var_8", title: "XL", sku: "Y0O8X6OVU8", inventory_quantity: 100, prices: [{ currency_code: "try", amount: 120000 }] },
        ]
      }
    ];

    try {
      const res = await fetch(`/admin/products?q=${encodeURIComponent(productSearchQuery)}&fields=id,title,thumbnail,description,status,created_at,updated_at,*variants,*variants.options,*options,*variants.prices`);
      const data = await res.json();
      if (data && data.products && data.products.length > 0) {
        setProductSearchResults(data.products);
      } else {
        setProductSearchResults(dummyProducts);
      }
    } catch (err) {
      console.error(err);
      setProductSearchResults(dummyProducts);
    } finally {
      setSearchingProducts(false);
    }
  }

  const handleAddProductToOrder = async (product: any, variant: any) => {
    const order = realOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const newItem = {
      id: `item_${Math.random().toString(36).substr(2, 9)}`,
      title: product.title,
      variant: variant,
      variant_title: variant.title,
      unit_price: variant.prices?.find((p: any) => p.currency_code?.toLowerCase() === "try")?.amount ?? variant.calculated_price?.calculated_amount ?? variant.prices?.[0]?.amount ?? 0,
      quantity: 1,
      thumbnail: product.thumbnail || "",
      vat_rate: 10,
      sku: variant.sku || "",
      barcode: variant.barcode || ""
    };
    
    const newItems = [...order.items, newItem];
    const oldItemsSum = order.items.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newItemsSum = newItems.reduce((acc: number, i: any) => acc + (i.unit_price * i.quantity), 0);
    const newTotal = order.total - oldItemsSum + newItemsSum;

    setRealOrders(prev => prev.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          total: newTotal,
          items: newItems
        }
      }
      return o
    }))
    setShowProductSearchModal(false)
    showSuccess("Ürün siparişe eklendi.")

    try {
      await fetch(`/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metadata: { ...order.metadata, edited_items: newItems, edited_total: newTotal }
        })
      })
    } catch (err) {}
  }

  // Trigger Print popup & Trendyol E-Faturam integration
  const triggerPrintSimulation = async (type: string, orderIdOrIds: string | string[]) => {
    const ids = Array.isArray(orderIdOrIds) ? orderIdOrIds : [orderIdOrIds]
    const ordersToPrint = currentOrders.filter(o => ids.includes(o.id))
    if (ordersToPrint.length === 0) return

    const normalizedType = type.toLowerCase()
    if (
      normalizedType === "e-fatura" ||
      normalizedType === "fatura" ||
      normalizedType === "pdf"
    ) {
      try {
        const res = await fetch("/admin/efatura", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            order_ids: ids,
          }),
        })
        const data = await res.json().catch(() => ({}))
        const createdList = data?.created || data?.invoices || []
        if (res.ok && createdList.length > 0) {
          const createdMap = new Map(createdList.map((inv: any) => [inv.orderId, inv]))
          setRealOrders(prev =>
            prev.map(o => {
              const inv: any = createdMap.get(o.id)
              if (!inv) return o
              const formattedDate = new Date(inv.issueDate).toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              return {
                ...o,
                invoice_series: inv.invoiceNumber,
                metadata: {
                  ...(o.metadata || {}),
                  invoice_series: inv.invoiceNumber,
                  invoice_date: formattedDate,
                  e_invoice_date: formattedDate,
                  efatura: inv,
                },
              }
            })
          )
          showSuccess(`Trendyol E-Fatura oluşturuldu: ${createdList[0].invoiceNumber}`)
          openGibInvoicePrintWindow(createdList, data.config || {})
          return
        } else {
          alert(data?.error || "Trendyol E-Faturam üzerinde fatura oluşturulamadı.")
          return
        }
      } catch (err: any) {
        console.error("E-Fatura oluşturulurken hata:", err)
        alert(err?.message || "Trendyol E-Fatura bağlantı hatası.")
        return
      }
    }

    const width = 800
    const height = 600
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2
    const printWindow = window.open("", "_blank", `width=${width},height=${height},top=${top},left=${left}`)
    
    if (printWindow) {
      if (type === "Kargo Fişi") {
        printWindow.document.write(`
          <html>
            <head>
              <title>${type} - Toplu Yazdırma</title>
              <style>
                body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #000; box-sizing: border-box; }
                .page-break-container { page-break-after: always; padding: 10px; }
                .page-break-container:last-child { page-break-after: auto; }
                .top-bar { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 10px; font-family: Arial, sans-serif; }
                .logo-container { text-align: center; margin-bottom: 10px; }
                .logo-main { font-size: 36px; font-family: 'Arial Black', sans-serif; font-weight: 900; letter-spacing: 6px; margin: 0; line-height: 1; }
                .logo-sub { font-size: 10px; font-family: 'Arial', sans-serif; font-weight: bold; letter-spacing: 12px; margin-top: -12px; position: relative; z-index: 10; background: white; display: inline-block; padding: 0 5px; }
                .info-box { border: 2px solid #000; border-bottom: none; }
                .info-row { text-align: center; padding: 8px; border-bottom: 2px solid #000; font-size: 16px; font-weight: bold; }
                .info-row.address { font-size: 13px; padding: 12px 8px; }
                .products-box { border: 2px solid #000; padding: 10px; min-height: 150px; }
                .product-item { display: flex; align-items: center; margin-bottom: 10px; font-family: 'Times New Roman', serif; }
                .product-img { width: 45px; height: 60px; background: #eee; margin-right: 15px; overflow: hidden; }
                .product-img img { width: 100%; height: 100%; object-fit: cover; }
                .product-details { flex: 1; display: flex; align-items: center; font-size: 12px; font-weight: bold; }
                .product-sku { width: 90px; }
                .product-name { flex: 1; }
                .product-qty { width: 30px; text-align: right; }
                .bottom-info { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 10px; padding: 0 5px; }
                .total-box { border: 2px solid #000; display: flex; justify-content: space-between; padding: 5px 10px; font-size: 20px; font-weight: bold; margin-top: 5px; }
                .barcode-box { text-align: center; margin-top: 10px; }
                .barcode-text { font-size: 12px; font-weight: bold; font-family: Arial, sans-serif; }
                .barcode-img { height: 50px; width: 100%; max-width: 250px; margin: 5px auto 0; background: repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 5px, #000 5px, #000 8px, transparent 8px, transparent 11px, #000 11px, #000 16px, transparent 16px, transparent 18px); }
                .footer { display: flex; justify-content: space-between; font-size: 10px; margin-top: 20px; font-family: Arial, sans-serif; }
                @media print { 
                  @page { size: A5 portrait; margin: 5mm; }
                  .no-print { display: none; } 
                }
              </style>
            </head>
            <body>
              ${ordersToPrint.map((orderObj, idx) => `
              <div class="page-break-container">
                <div class="top-bar">
                  <div>${new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  <div class="no-print" style="cursor:pointer; text-decoration:underline;" onclick="window.print()">Yazdır</div>
                </div>
                
                <div class="logo-container">
                  <div style="position: relative; display: inline-block;">
                    <div class="logo-main">Ç İ Z G İ</div>
                    <div style="position: absolute; top: 15px; left: 0; width: 100%; display: flex; justify-content: space-around; font-family: Arial; font-size: 10px; font-weight: bold;">
                      <span>B</span><span>U</span><span>T</span><span>İ</span><span>K</span>
                    </div>
                  </div>
                </div>

                <div class="info-box">
                  <div class="info-row" style="text-transform: uppercase;">${orderObj.customer.first_name} ${orderObj.customer.last_name}</div>
                  <div class="info-row">${orderObj.customer.phone}</div>
                  <div class="info-row address">${orderObj.shipping_address.address_1} ${orderObj.shipping_address.district} ${orderObj.shipping_address.city}</div>
                </div>

                <div class="products-box">
                  ${orderObj.items.map((item: any) => `
                    <div class="product-item">
                      <div class="product-img">
                        ${item.thumbnail ? `<img src="${item.thumbnail}" />` : ''}
                      </div>
                      <div class="product-details">
                        <div class="product-sku">${item.sku || '-'}</div>
                        <div class="product-name">${item.title} (${item.size || '-'})</div>
                        <div class="product-qty">${item.quantity}</div>
                      </div>
                    </div>
                  `).join('')}

                  <div class="product-item">
                    <div class="product-img" style="display:flex; align-items:center; justify-content:center; background:none;">
                      <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                      </svg>
                    </div>
                    <div class="product-details">
                      <div class="product-sku">HZMBdl</div>
                      <div class="product-name">Kargo ve Hizmet Bedeli</div>
                      <div class="product-qty">1</div>
                    </div>
                  </div>
                </div>

                <div class="bottom-info">
                  <div>${orderObj.payment_method}</div>
                  <div>${orderObj.carrier_name || 'KARGOİST'}</div>
                </div>

                <div class="total-box">
                  <div>Genel Toplam:</div>
                  <div>${orderObj.total.toFixed(2)}</div>
                </div>

                <div class="barcode-box">
                  <div class="barcode-text">Kargo Kodu: ${orderObj.carrier_barcode || orderObj.display_id}</div>
                  <div class="barcode-img"></div>
                </div>

                <div class="footer">
                  <div>https://www.kombingo.com/admin/orders/refund</div>
                  <div>${idx + 1}/${ordersToPrint.length}</div>
                </div>
              </div>
              `).join('')}
            </body>
          </html>
        `)
      } else {
        printWindow.document.write(`
        <html>
          <head>
            <title>${type} - Toplu Yazdırma</title>
            <style>
              body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 0; margin: 0; color: #18181b; line-height: 1.5; }
              .page-break-container { page-break-after: always; padding: 40px; }
              .page-break-container:last-child { page-break-after: auto; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
              .meta-box { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fafafa; border: 1px solid #f4f4f5; padding: 20px; border-radius: 8px; }
              .meta-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #71717a; }
              .meta-val { font-size: 14px; font-weight: bold; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              th { background: #f4f4f5; text-transform: uppercase; font-size: 10px; font-weight: 800; padding: 12px; border-bottom: 2px solid #e4e4e7; text-align: left; }
              td { padding: 12px; border-bottom: 1px solid #f4f4f5; font-size: 13px; font-weight: 600; }
              .total-box { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font-size: 14px; font-weight: bold; margin-top: 20px; }
              .grand-total { font-size: 18px; font-weight: 900; color: #7c3aed; }
              .btn-print { margin-top: 40px; padding: 10px 20px; background: #18181b; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
              @media print { .btn-print { display: none; } }
            </style>
          </head>
          <body>
            ${ordersToPrint.map((orderObj) => `
            <div class="page-break-container">
              <div class="header">
                <div>
                  <div class="title">${type}</div>
                  <div style="font-size: 12px; font-weight: bold; color: #a1a1aa; margin-top: 4px;">Sipariş Numarası: ${orderObj.display_id}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: 950; letter-spacing: -1px;">CIZGIBUTIK</div>
                  <div style="font-size: 11px; font-weight: bold; color: #71717a;">${orderObj.created_at}</div>
                </div>
              </div>
              
              <div class="meta-box">
                <div>
                  <div class="meta-label">Müşteri ve Teslimat Bilgileri</div>
                  <div class="meta-val">${orderObj.customer.first_name} ${orderObj.customer.last_name}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">${orderObj.shipping_address.address_1} ${orderObj.shipping_address.district} / ${orderObj.shipping_address.city}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">Tel: ${orderObj.customer.phone}</div>
                </div>
                <div>
                  <div class="meta-label">Ödeme & Kargo Detayları</div>
                  <div class="meta-val">${orderObj.payment_method}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">Taşıyıcı Firma: ${orderObj.carrier_name}</div>
                  <div style="font-size: 12px; color: #52525b; margin-top: 4px;">Barkod No: ${orderObj.carrier_barcode || "-"}</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>SKU</th>
                    <th>Beden</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderObj.items.map((item: any) => `
                    <tr>
                      <td>${item.title}</td>
                      <td>${item.sku}</td>
                      <td>${item.size}</td>
                      <td>${item.quantity} Adet</td>
                      <td>₺ ${item.unit_price.toFixed(2)}</td>
                      <td>₺ ${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <div class="total-box">
                <div>Ara Toplam: ₺ ${orderObj.subtotal.toFixed(2)}</div>
                <div>KDV: ₺ ${orderObj.vat_total.toFixed(2)}</div>
                <div class="grand-total">Genel Toplam: ₺ ${orderObj.total.toFixed(2)}</div>
              </div>

              <button class="btn-print no-print" onclick="window.print()">Yazdır</button>
            </div>
            `).join('')}
          </body>
        </html>
      `)
      }
      printWindow.document.close()
    }
  }

  useEffect(() => {
    const hideDefaultUi = () => {
       const widgetEl = document.getElementById('xoox-custom-orders-widget');
       if (widgetEl && widgetEl.parentElement) {
          const siblings = Array.from(widgetEl.parentElement.children);
          siblings.forEach(sibling => {
             if (sibling !== widgetEl) {
                (sibling as HTMLElement).style.display = 'none';
             }
          });
       }
    };
    hideDefaultUi();
    const interval = setInterval(hideDefaultUi, 100);
    return () => clearInterval(interval);
  }, [])

  return (
    <div id="xoox-custom-orders-widget" className="bg-zinc-50 min-h-screen text-ui-fg-base antialiased custom-admin-wrapper font-sans">
      {successModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h3 className="font-bold text-lg text-zinc-900 mb-2">Başarılı</h3>
            <p className="text-sm text-zinc-500 mb-6">{successModal}</p>
            <button onClick={() => setSuccessModal(null)} className="w-full bg-zinc-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors">Tamam</button>
          </div>
        </div>
      )}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* TOP HEADER REMOVED */}

      <div className="p-6 md:p-8 max-w-[1640px] mx-auto flex flex-col gap-y-5">
        {activeTab === "odeme_hatasi" ? (
          /* GÖRSEL 2: ÖDEME HATASI ALINANLAR (PAYTR / KREDİ KARTI 3D YARIDA KALAN SİPARİŞLER) */
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-zinc-200 rounded-lg px-5 py-3.5 text-[12px] font-semibold text-zinc-800 shadow-sm">
              Ödeme/Kart 3D şifre girme adımlarında yarıda kalan veya sorun oluşan siparişler listelenmektedir. Bu siparişleri banka ekranınızdan kontrol edip oluşturabilirsiniz. Bu sayfada son 30 günün kayıtları tutulmaktadır.
            </div>

            <div className="relative w-full max-w-[330px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Hızlı ara.."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-sm"
              />
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white text-[12px]">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                      <th className="py-3.5 px-4 w-[15%]">Sipariş No</th>
                      <th className="py-3.5 px-4 w-[24%]">Müşteri Bilgileri</th>
                      <th className="py-3.5 px-4 w-[16%]">Tutar</th>
                      <th className="py-3.5 px-4 w-[19%]">Ödeme Kodu</th>
                      <th className="py-3.5 px-4 w-[14%]">Tarih</th>
                      <th className="py-3.5 px-4 w-[12%]">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {(() => {
                      const list = (opsData.missingOrders || []).filter((item: any) => {
                        if (!quickSearch.trim()) return true
                        const q = quickSearch.toLowerCase()
                        return (
                          String(item.order_no || "").toLowerCase().includes(q) ||
                          String(item.customer_name || "").toLowerCase().includes(q) ||
                          String(item.customer_phone || "").toLowerCase().includes(q) ||
                          String(item.payment_code || "").toLowerCase().includes(q)
                        )
                      })
                      if (opsLoading) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-zinc-400 font-semibold">
                              Yükleniyor...
                            </td>
                          </tr>
                        )
                      }
                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-zinc-400 font-semibold">
                              Son 30 günde ödeme adımında yarıda kalan sipariş kaydı bulunmamaktadır.
                            </td>
                          </tr>
                        )
                      }
                      return list.map((item: any, idx: number) => (
                        <tr
                          key={item.id || idx}
                          className={`divide-x divide-zinc-200 transition-colors ${idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"} hover:bg-blue-50/30`}
                        >
                          <td className="py-3 px-4">
                            <span
                              onClick={() => setSelectedCartPreview(item)}
                              className="font-semibold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              {item.order_no}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-800">{item.customer_name}</span>
                              <span className="text-[11px] text-zinc-500 mt-0.5">{item.customer_phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-800">
                                {Number(item.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                              </span>
                              <span className="text-[11px] text-zinc-500 mt-0.5">{item.payment_method || "PayTR"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-600">
                            {item.payment_code}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700">
                            {item.created_at}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              disabled={creatingFromMissingId === item.id}
                              onClick={() => handleCreateOrderFromMissing(item)}
                              className="bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-[11.5px] px-3.5 py-1.5 rounded shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {creatingFromMissingId === item.id ? "Oluşturuluyor..." : "Siparişi Oluştur"}
                            </button>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "aktif-sepetler" ? (
          /* GÖRSEL 3: AKTİF SEPETLER */
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-zinc-200 rounded-lg px-5 py-3.5 text-[12px] font-semibold text-zinc-800 shadow-sm">
              Üyelik hesabı olan veya hesabı bulunmayan müşterilerin son 30 gün içerisinde oluşturduğu siparişi tamamlanmayan aktif sepetler listelenmektedir.
            </div>

            {/* 6 Sütunlu Aktif Sepet Özeti Kartı */}
            <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm relative">
              <div className="grid grid-cols-2 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                <div className="px-4 py-1 flex flex-col gap-1.5 first:pl-0">
                  <span className="text-[11.5px] font-medium text-zinc-500">Toplam Sepet Sayısı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.activeCarts?.stats?.totalCarts ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Toplam Ürün Sayısı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.activeCarts?.stats?.totalProducts ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Toplam Ürün Adeti</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.activeCarts?.stats?.totalQuantity ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Adet Ortalaması</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.activeCarts?.stats?.avgQuantity ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Tutar Ortalaması</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {Number(opsData.activeCarts?.stats?.avgAmount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Sepet Tutarı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {Number(opsData.activeCarts?.stats?.totalAmount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>
              </div>
              <div className="absolute bottom-2.5 right-4 flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                <svg className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                <span>Son 30 gün</span>
              </div>
            </div>

            {/* Aktif Sepetler Tablosu */}
            <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white text-[12px]">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                      <th className="py-3.5 px-4 w-[14%]">Sepet No</th>
                      <th className="py-3.5 px-4 w-[28%]">Müşteri Bilgileri</th>
                      <th className="py-3.5 px-4 w-[16%]">Tutar</th>
                      <th className="py-3.5 px-4 w-[12%]">Ürün Adeti</th>
                      <th className="py-3.5 px-4 w-[16%]">Tarih</th>
                      <th className="py-3.5 px-4 w-[14%]">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {(opsData.activeCarts?.items || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400 font-semibold">
                          {opsLoading ? "Yükleniyor..." : "Aktif sepet kaydı bulunmamaktadır."}
                        </td>
                      </tr>
                    ) : (
                      (opsData.activeCarts?.items || []).map((cart: any, idx: number) => (
                        <tr
                          key={cart.id || idx}
                          className={`divide-x divide-zinc-200 transition-colors ${idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"} hover:bg-zinc-50`}
                        >
                          <td className="py-3 px-4">
                            <span
                              onClick={() => setSelectedCartPreview(cart)}
                              className="font-semibold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              {cart.cart_no}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-800">
                            {cart.customer_name}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-800">
                            {Number(cart.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-800">
                            {cart.quantity}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700">
                            {cart.created_at}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => setSelectedCartPreview(cart)}
                              className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                              title="Sepet Detayı"
                            >
                              <EyeIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "terk-edilmis-sepetler" ? (
          /* GÖRSEL 4: TERK EDİLMİŞ SEPETLER */
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-zinc-200 rounded-lg px-5 py-3.5 text-[12px] font-medium text-zinc-800 leading-relaxed shadow-sm">
              Kullanıcı hesabıyla giriş yapan müşterilerin veya ödeme sayfasında iletişim bilgilerini giren müşterilerin oluşturduğu sepetler listelenmektedir. Ödeme tamamlanmadan terkedilen sepetler, müşteriniz siteden ayrıldıktan 1 saat sonra görüntülenmektedir. Müşterilere belirli sürelerde otomatik e-posta, SMS, WhatsApp mesajı ve mobil uygulama bildirimi göndererek sepetleri hatırlatabilir ve terk edilmiş sepetler için özel hediye çekleri sunabilirsiniz.
            </div>

            {/* 5 Sütunlu Terk Edilmiş Sepet Özeti Kartı */}
            <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm relative">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                <div className="px-4 py-1 flex flex-col gap-1.5 first:pl-0">
                  <span className="text-[11.5px] font-medium text-zinc-500">Terk Edilmiş Sepet Sayısı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.abandonedCarts?.stats?.abandonedCount ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Terk Edilmiş Ürün Sayısı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.abandonedCarts?.stats?.abandonedItemsCount ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Terk Edilmiş Sepet Tutarı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {Number(opsData.abandonedCarts?.stats?.abandonedTotal || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Kurtarılan Sepet Sayısı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {opsData.abandonedCarts?.stats?.recoveredCount ?? 0}
                  </span>
                </div>
                <div className="px-5 py-1 flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-medium text-zinc-500">Kurtarılan Sipariş Tutarı</span>
                  <span className="text-[17px] font-bold text-zinc-900">
                    {Number(opsData.abandonedCarts?.stats?.recoveredTotal || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>
              </div>
              <div className="absolute bottom-2.5 right-4 flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                <svg className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                <span>Son 30 gün</span>
              </div>
            </div>

            {/* Filtreler, Arama ve Sepet Otomasyonu / Kurtarılan Siparişler Butonları */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white border border-zinc-200 px-4 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 shadow-sm"
                >
                  <Adjustments className="w-4 h-4 text-zinc-500" />
                  <span>Filtreler</span>
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="relative flex-1 max-w-[260px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Hızlı ara.."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleCartAutomation}
                  className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>⚙️</span>
                  <span>
                    Sepet Otomasyonu ({opsData.abandonedCarts?.automationActive !== false ? "Aktif" : "Pasif"})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tum_siparisler")}
                  className="bg-[#0284c7] hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>📋</span>
                  <span>Kurtarılan Siparişler</span>
                </button>
              </div>
            </div>

            {/* Terk Edilmiş Sepetler Tablosu */}
            <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white text-[12px]">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                      <th className="py-3.5 px-4">Sepet No</th>
                      <th className="py-3.5 px-4">Müşteri Bilgileri</th>
                      <th className="py-3.5 px-4">E-Posta</th>
                      <th className="py-3.5 px-4">SMS</th>
                      <th className="py-3.5 px-4">WhatsApp</th>
                      <th className="py-3.5 px-4">Mobil Uygulama</th>
                      <th className="py-3.5 px-4">Tutar</th>
                      <th className="py-3.5 px-4">Ürün Sayısı</th>
                      <th className="py-3.5 px-4">Sepet Tarihi</th>
                      <th className="py-3.5 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {(() => {
                      const list = (opsData.abandonedCarts?.items || []).filter((item: any) => {
                        if (!quickSearch.trim()) return true
                        const q = quickSearch.toLowerCase()
                        return (
                          String(item.cart_no || "").toLowerCase().includes(q) ||
                          String(item.customer_name || "").toLowerCase().includes(q) ||
                          String(item.email || "").toLowerCase().includes(q) ||
                          String(item.phone || "").toLowerCase().includes(q)
                        )
                      })
                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={10} className="py-12 text-center text-zinc-400 font-semibold">
                              {opsLoading ? "Yükleniyor..." : "Terk edilmiş sepet kaydı bulunmamaktadır."}
                            </td>
                          </tr>
                        )
                      }
                      return list.map((cart: any, idx: number) => (
                        <tr
                          key={cart.id || idx}
                          className={`divide-x divide-zinc-200 transition-colors ${idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"} hover:bg-zinc-50`}
                        >
                          <td className="py-3.5 px-4">
                            <span
                              onClick={() => setSelectedCartPreview(cart)}
                              className="font-semibold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              {cart.cart_no}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-800">{cart.customer_name}</span>
                              <span className="text-[11px] text-zinc-600">{cart.email}</span>
                              <span className="text-[11px] text-zinc-500">{cart.phone}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {cart.email_status === "Bekliyor" ? (
                              <span className="inline-block border border-blue-500 text-blue-600 px-3 py-0.5 rounded text-[11px] font-semibold">
                                Bekliyor
                              </span>
                            ) : (
                              <div className="flex flex-col items-start gap-1">
                                <span className="inline-block border border-emerald-500 text-emerald-600 px-3 py-0.5 rounded text-[11px] font-semibold">
                                  Gönderildi
                                </span>
                                <span className="text-[10px] text-zinc-500">{cart.email_date}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {cart.sms_status === "Bekliyor" ? (
                              <span className="inline-block border border-blue-500 text-blue-600 px-3 py-0.5 rounded text-[11px] font-semibold">
                                Bekliyor
                              </span>
                            ) : (
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="inline-block border border-red-400 text-red-500 px-3 py-0.5 rounded text-[11px] font-semibold">
                                  Gönderilmedi
                                </span>
                                <span className="text-[10px] text-zinc-600 mt-0.5">{cart.sms_reason}</span>
                                <span className="text-[10px] text-zinc-400">{cart.sms_date}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {cart.whatsapp_status === "Bekliyor" ? (
                              <span className="inline-block border border-blue-500 text-blue-600 px-3 py-0.5 rounded text-[11px] font-semibold">
                                Bekliyor
                              </span>
                            ) : (
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="inline-block border border-red-400 text-red-500 px-3 py-0.5 rounded text-[11px] font-semibold">
                                  Gönderilmedi
                                </span>
                                <span className="text-[10px] text-zinc-600 mt-0.5">{cart.whatsapp_reason}</span>
                                <span className="text-[10px] text-zinc-400">{cart.whatsapp_date}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {cart.mobile_status === "Bekliyor" ? (
                              <span className="inline-block border border-blue-500 text-blue-600 px-3 py-0.5 rounded text-[11px] font-semibold">
                                Bekliyor
                              </span>
                            ) : (
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="inline-block border border-red-400 text-red-500 px-3 py-0.5 rounded text-[11px] font-semibold">
                                  Gönderilmedi
                                </span>
                                <span className="text-[10px] text-zinc-600 mt-0.5">{cart.mobile_reason}</span>
                                <span className="text-[10px] text-zinc-400">{cart.mobile_date}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-zinc-800 whitespace-nowrap">
                            {Number(cart.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </td>
                          <td className="py-3.5 px-4 font-medium text-zinc-800">
                            {cart.quantity}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-zinc-700 whitespace-nowrap">
                            {cart.created_at}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => setSelectedCartPreview(cart)}
                              className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                              title="Sepet Detayı"
                            >
                              <EyeIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "havale-bildirimleri" ? (
          /* GÖRSEL 5: HAVALE BİLDİRİMLERİ */
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <div className="relative w-full max-w-[280px]">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Hızlı ara.."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800"
              />
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white text-[12px]">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                      <th className="py-3.5 px-4">Sipariş No</th>
                      <th className="py-3.5 px-4">Ad Soyad</th>
                      <th className="py-3.5 px-4">Telefon</th>
                      <th className="py-3.5 px-4">Tutar</th>
                      <th className="py-3.5 px-4">Banka</th>
                      <th className="py-3.5 px-4">Banka Hesabı</th>
                      <th className="py-3.5 px-4">Durum</th>
                      <th className="py-3.5 px-4">Tarih</th>
                      <th className="py-3.5 px-4 w-24">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {(() => {
                      const list = (opsData.eftNotifications || []).filter((item: any) => {
                        if (!quickSearch.trim()) return true
                        const q = quickSearch.toLowerCase()
                        return (
                          String(item.order_no || "").toLowerCase().includes(q) ||
                          String(item.customer_name || "").toLowerCase().includes(q) ||
                          String(item.phone || "").toLowerCase().includes(q) ||
                          String(item.bank_name || "").toLowerCase().includes(q)
                        )
                      })
                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-zinc-400 font-semibold">
                              {opsLoading ? "Yükleniyor..." : "Havale / EFT bildirimi bulunmamaktadır."}
                            </td>
                          </tr>
                        )
                      }
                      return list.slice(0, eftPageSize).map((item: any, idx: number) => (
                        <tr
                          key={item.id || idx}
                          className={`divide-x divide-zinc-200 transition-colors ${idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"} hover:bg-zinc-50`}
                        >
                          <td className="py-3 px-4">
                            <span
                              onClick={() => {
                                if (item.order_id) {
                                  setSelectedOrderId(item.order_id)
                                }
                              }}
                              className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              {item.order_no}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.customer_name}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.phone}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">
                            {Number(item.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.bank_name}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.bank_account}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-600">{item.created_at}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.order_id) {
                                    setSelectedOrderId(item.order_id)
                                  }
                                }}
                                className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Siparişi Görüntüle"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEftNotification(item.id)}
                                className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Sil"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <select
                value={eftPageSize}
                onChange={(e) => setEftPageSize(Number(e.target.value))}
                className="border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs font-medium text-zinc-600">
                {(opsData.eftNotifications || []).length} kayıttan {(opsData.eftNotifications || []).length > 0 ? 1 : 0} ile {Math.min(eftPageSize, (opsData.eftNotifications || []).length)} arası gösteriliyor
              </span>
            </div>
          </div>
        ) : activeTab === "siparis-etiketleri" ? (
          /* GÖRSEL 1: SİPARİŞ ETİKETLERİ (HIZLI SATIŞ / INSTAGRAM DM / WHATSAPP MANUEL SİPARİŞ ETİKETLERİ) */
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative w-full max-w-[300px]">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Hızlı ara.."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingOrderTag({ name: "", active: true })
                  setTagModalActionsOpen(false)
                  setShowOrderTagModal(true)
                }}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span className="text-sm leading-none font-black">+</span>
                <span>Yeni Sipariş Etiketi</span>
              </button>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white text-[12px]">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                      <th className="py-3.5 px-4 w-[14%]">No</th>
                      <th className="py-3.5 px-4 w-[40%]">Etiket Adı</th>
                      <th className="py-3.5 px-4 w-[14%]">Durum</th>
                      <th className="py-3.5 px-4 w-[18%]">Tarih</th>
                      <th className="py-3.5 px-4 w-[14%]">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {(() => {
                      const tagsList = (opsData.orderTags || []).filter((item: any) => {
                        if (!quickSearch.trim()) return true
                        const q = quickSearch.toLowerCase()
                        return (
                          String(item.name || "").toLowerCase().includes(q) ||
                          String(item.no || "").toLowerCase().includes(q)
                        )
                      })
                      if (tagsList.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-zinc-400 font-semibold">
                              Sipariş etiketi bulunamadı.
                            </td>
                          </tr>
                        )
                      }
                      return tagsList.slice(0, tagPageSize).map((item: any, idx: number) => (
                        <tr
                          key={item.id || idx}
                          className={`divide-x divide-zinc-200 transition-colors ${idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"} hover:bg-zinc-50`}
                        >
                          <td className="py-3 px-4">
                            <span
                              onClick={() => {
                                setEditingOrderTag({
                                  id: item.id,
                                  no: item.no,
                                  name: item.name,
                                  active: item.active !== false,
                                })
                                setTagModalActionsOpen(false)
                                setShowOrderTagModal(true)
                              }}
                              className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              {item.no}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.name}</td>
                          <td className="py-3 px-4">
                            {item.active !== false ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-zinc-300 text-zinc-400">
                                ✕
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-600">{item.created_at || "2025-12-30"}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOrderTag({
                                    id: item.id,
                                    no: item.no,
                                    name: item.name,
                                    active: item.active !== false,
                                  })
                                  setTagModalActionsOpen(false)
                                  setShowOrderTagModal(true)
                                }}
                                className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Etiketi Düzenle"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrderTag(item.id)}
                                className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Sil"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <select
                value={tagPageSize}
                onChange={(e) => setTagPageSize(Number(e.target.value))}
                className="border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs font-medium text-zinc-600">
                {(opsData.orderTags || []).length} kayıttan {(opsData.orderTags || []).length > 0 ? 1 : 0} ile {Math.min(tagPageSize, (opsData.orderTags || []).length)} arası gösteriliyor
              </span>
            </div>
          </div>
        ) : activeTab === "risk-kriterleri" ? (
          /* GÖRSEL 3 & 4: RİSK KRİTERLERİ (KAPIDA ÖDEME İADE DÖNEN MÜŞTERİLERİ SADECE KREDİ KARTINA ZORLAMA VEYA BLOKLAMA) */
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  type="button"
                  onClick={() => setShowRiskFilters(!showRiskFilters)}
                  className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Filtreler</span>
                  <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showRiskFilters ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="relative w-full max-w-[290px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Hızlı ara.."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-zinc-300 text-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenNewRiskCriterion()}
                  className="bg-[#2ebd85] hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span className="text-sm leading-none font-black">+</span>
                  <span>Yeni Risk Kriteri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAutoRiskModal(true)}
                  className="bg-[#f59e0b] hover:bg-amber-600 text-white px-4 py-2 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span className="text-xs leading-none">✳</span>
                  <span>Otomatik Risk Kriterleri</span>
                </button>
              </div>
            </div>

            {showRiskFilters && (
              <div className="bg-zinc-50/70 border border-zinc-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-600">Ad Soyad</label>
                  <input
                    type="text"
                    placeholder="Müşteri adı..."
                    value={riskFilterName}
                    onChange={(e) => setRiskFilterName(e.target.value)}
                    className="bg-white border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-600">Telefon</label>
                  <input
                    type="text"
                    placeholder="Telefon numarası..."
                    value={riskFilterPhone}
                    onChange={(e) => setRiskFilterPhone(e.target.value)}
                    className="bg-white border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-600">E-posta</label>
                  <input
                    type="text"
                    placeholder="E-posta adresi..."
                    value={riskFilterEmail}
                    onChange={(e) => setRiskFilterEmail(e.target.value)}
                    className="bg-white border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white text-[12px]">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11.5px] font-bold text-zinc-800 divide-x divide-zinc-200">
                      <th className="py-3.5 px-4">No</th>
                      <th className="py-3.5 px-4">Ad Soyad</th>
                      <th className="py-3.5 px-4">E-posta</th>
                      <th className="py-3.5 px-4">Telefon</th>
                      <th className="py-3.5 px-4">TC Kimlik No</th>
                      <th className="py-3.5 px-4">Vergi Numarası</th>
                      <th className="py-3.5 px-4">IP</th>
                      <th className="py-3.5 px-4 w-36">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {(() => {
                      const list = (opsData.riskCriteria || []).filter((item: any) => {
                        if (quickSearch.trim()) {
                          const q = quickSearch.toLowerCase()
                          const matchQ =
                            String(item.full_name || "").toLowerCase().includes(q) ||
                            String(item.email || "").toLowerCase().includes(q) ||
                            String(item.phone || "").toLowerCase().includes(q) ||
                            String(item.tc_no || "").toLowerCase().includes(q) ||
                            String(item.tax_no || "").toLowerCase().includes(q) ||
                            String(item.ip || "").toLowerCase().includes(q)
                          if (!matchQ) return false
                        }
                        if (riskFilterName && !String(item.full_name || "").toLowerCase().includes(riskFilterName.toLowerCase())) return false
                        if (riskFilterPhone && !String(item.phone || "").toLowerCase().includes(riskFilterPhone.toLowerCase())) return false
                        if (riskFilterEmail && !String(item.email || "").toLowerCase().includes(riskFilterEmail.toLowerCase())) return false
                        return true
                      })

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                              Aramaya uygun kayıt bulunamadı.
                            </td>
                          </tr>
                        )
                      }

                      return list.slice(0, riskPageSize).map((item: any, idx: number) => (
                        <tr
                          key={item.id || idx}
                          className={`divide-x divide-zinc-200 transition-colors ${idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"} hover:bg-zinc-50`}
                        >
                          <td className="py-3 px-4">
                            <span
                              onClick={() => handleOpenNewRiskCriterion(item)}
                              className="font-bold text-[#1976d2] hover:underline cursor-pointer"
                            >
                              {item.no || idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-zinc-800">{item.full_name || "-"}</span>
                              <div className="flex flex-wrap items-center gap-1">
                                {item.is_completely_blocked ? (
                                  <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold">
                                    Müşteri Tamamen Bloklu
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                    Sadece Kredi Kartı ({(item.blocked_payment_methods || ["Kapıda Ödeme", "Havale / EFT"]).join(", ")} Pasif)
                                  </span>
                                )}
                                {item.source === "auto_return" && (
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9.5px] font-semibold">
                                    Otomatik (İade Kargo)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.email || "-"}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.phone || "-"}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.tc_no || "-"}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.tax_no || "-"}</td>
                          <td className="py-3 px-4 font-medium text-zinc-700">{item.ip || "-"}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenNewRiskCriterion(item)}
                                className="w-7 h-7 rounded bg-[#9b66c4] hover:bg-purple-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Düzenle"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRiskCriterion(item.id)}
                                className="w-7 h-7 rounded bg-[#ef4444] hover:bg-red-600 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                                title="Sil"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <select
                value={riskPageSize}
                onChange={(e) => setRiskPageSize(Number(e.target.value))}
                className="border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              {(opsData.riskCriteria || []).length > 0 && (
                <span className="text-xs font-medium text-zinc-600">
                  {(opsData.riskCriteria || []).length} kayıttan 1 ile {Math.min(riskPageSize, (opsData.riskCriteria || []).length)} arası gösteriliyor
                </span>
              )}
            </div>
          </div>
        ) : (
          <>


        {/* SEARCH, FILTERS BUTTON & BULK OPERATIONS ROW (Görsel 4 & Preview Birebir) */}
        <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 px-4 bg-white ${
                showFilters
                  ? "border-t border-l border-r border-[#3b82f6] rounded-t-md relative z-10 -mb-px"
                  : "border border-slate-300 rounded-md shadow-2xs mb-1"
              } flex items-center gap-3 text-[12.5px] font-bold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer`}
            >
              <svg className="w-[17px] h-[17px] text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="8" cy="6" r="2" fill="white" />
                <circle cx="16" cy="12" r="2" fill="white" />
                <circle cx="10" cy="18" r="2" fill="white" />
              </svg>
              <span>Filtreler</span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div className="relative w-64 sm:w-80 mb-1">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Hızlı ara.."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full h-9 bg-white border border-slate-300 rounded-md pl-9 pr-3 text-[12.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1565c0] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mb-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBulkActionMenuOpen(!isBulkActionMenuOpen)}
                className="h-9 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-md flex items-center gap-2.5 text-[12.5px] font-bold text-slate-800 shadow-2xs transition cursor-pointer"
              >
                <svg className="w-[17px] h-[17px] text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <circle cx="8" cy="6" r="2" fill="white" />
                  <circle cx="16" cy="12" r="2" fill="white" />
                  <circle cx="10" cy="18" r="2" fill="white" />
                </svg>
                <span>Toplu İşlemler</span>
              </button>

              {isBulkActionMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-visible py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{selectedOrderIds.length} Sipariş Seçili</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedOrderIds.length === 0) {
                        alert("Lütfen sipariş seçin.")
                        return
                      }
                      setStatusModalTargetIds(selectedOrderIds)
                      setNewStatusValue("onay_bekleyen")
                      setShowStatusModal(true)
                      setIsBulkActionMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Durumu Değiştir
                  </button>

                  <button type="button" className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">
                    Toplu Fatura Yazdır
                  </button>
                  <button type="button" className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">
                    Toplu Kargo Fişi Yazdır
                  </button>
                  <button type="button" className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                    Seçilenleri Sil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EXPANDABLE FILTER GRID (Görsel 4 Birebir Tasarım) */}
        {showFilters && (
          <div className="bg-white border border-[#3b82f6] rounded-b-md rounded-tr-md p-5 shadow-2xs flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3.5">
              {/* Row 1 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Sipariş Durumu</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="Yeni Sipariş">Yeni Sipariş</option>
                  <option value="Onay Bekleyenler">Onay Bekleyenler</option>
                  <option value="Hazırlananlar">Hazırlananlar</option>
                  <option value="Kargolananlar">Kargolananlar</option>
                  <option value="Teslim Edilenler">Teslim Edilenler</option>
                  <option value="İade Edilenler">İade Edilenler</option>
                  <option value="İptal Edilenler">İptal Edilenler</option>
                  <option value="">Tümü</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Platform</label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="Kombingo">Web Sitesi</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Trendyol">Trendyol</option>
                  <option value="Hepsiburada">Hepsiburada</option>
                  <option value="N11">N11</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Mağaza</label>
                <select
                  value={filterStore}
                  onChange={(e) => setFilterStore(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="kombingo">Kombingo</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Sipariş Etiketi</label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Seçilmedi</option>
                  {(opsData.orderTags || []).map((t: any) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Sipariş No</label>
                <input
                  type="text"
                  value={filterOrderNo}
                  onChange={(e) => setFilterOrderNo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Sipariş Tarihi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterOrderDateStart}
                    onChange={(e) => setFilterOrderDateStart(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                  />
                  <span className="text-[11.5px] text-zinc-600 shrink-0">ile</span>
                  <input
                    type="date"
                    value={filterOrderDateEnd}
                    onChange={(e) => setFilterOrderDateEnd(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Fatura Tarihi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterInvoiceDateStart}
                    onChange={(e) => setFilterInvoiceDateStart(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                  />
                  <span className="text-[11.5px] text-zinc-600 shrink-0">ile</span>
                  <input
                    type="date"
                    value={filterInvoiceDateEnd}
                    onChange={(e) => setFilterInvoiceDateEnd(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">E-Fatura Tarihi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterEInvoiceDateStart}
                    onChange={(e) => setFilterEInvoiceDateStart(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                  />
                  <span className="text-[11.5px] text-zinc-600 shrink-0">ile</span>
                  <input
                    type="date"
                    value={filterEInvoiceDateEnd}
                    onChange={(e) => setFilterEInvoiceDateEnd(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Sipariş Tutarı</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={filterTotalMin}
                    onChange={(e) => setFilterTotalMin(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                  />
                  <span className="text-[11.5px] text-zinc-600 shrink-0">ile</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={filterTotalMax}
                    onChange={(e) => setFilterTotalMax(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Ödeme Yöntemi</label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Seçilmedi</option>
                  <option value="Kredi Kartı">Kredi Kartı</option>
                  <option value="PayTR">PayTR</option>
                  <option value="Havale / EFT">Havale / EFT</option>
                  <option value="Kapıda Nakit Ödeme">Kapıda Nakit Ödeme</option>
                  <option value="Kapıda Kredi Kartı ile Ödeme">Kapıda Kredi Kartı ile Ödeme</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Müşteri Adı</label>
                <input
                  type="text"
                  value={filterCustomerFirstName}
                  onChange={(e) => setFilterCustomerFirstName(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Müşteri Soyadı</label>
                <input
                  type="text"
                  value={filterCustomerLastName}
                  onChange={(e) => setFilterCustomerLastName(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Telefon</label>
                <input
                  type="text"
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Vergi Numarası</label>
                <input
                  type="text"
                  value={filterTaxNo}
                  onChange={(e) => setFilterTaxNo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Vergi Dairesi</label>
                <input
                  type="text"
                  value={filterTaxOffice}
                  onChange={(e) => setFilterTaxOffice(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">TC Kimlik No</label>
                <input
                  type="text"
                  value={filterTcNo}
                  onChange={(e) => setFilterTcNo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              {/* Row 5 (Col 4 split into Ürün No & Ürün Barkodu matching Görsel 4) */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Üye No</label>
                <input
                  type="text"
                  value={filterMemberNo}
                  onChange={(e) => setFilterMemberNo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Ülke</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="tr">Türkiye</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">İl</label>
                <input
                  type="text"
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] text-zinc-700">Ürün No</label>
                  <input
                    type="text"
                    value={filterProductNo}
                    onChange={(e) => setFilterProductNo(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] text-zinc-700">Ürün Barkodu</label>
                  <input
                    type="text"
                    value={filterProductBarcode}
                    onChange={(e) => setFilterProductBarcode(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                  />
                </div>
              </div>

              {/* Row 6 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Ürün Adı</label>
                <input
                  type="text"
                  value={filterProductName}
                  onChange={(e) => setFilterProductName(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Ürün Etiketleri</label>
                <select
                  value={filterProductTag}
                  onChange={(e) => setFilterProductTag(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Etiket Seçilmedi</option>
                  <option value="Yeni Ürün">Yeni Ürün</option>
                  <option value="İndirimli Ürün">İndirimli Ürün</option>
                  <option value="Çok Satan">Çok Satan</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Hediye Çeki Kodu</label>
                <input
                  type="text"
                  value={filterGiftCardCode}
                  onChange={(e) => setFilterGiftCardCode(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Promosyon</label>
                <select
                  value={filterPromo}
                  onChange={(e) => setFilterPromo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Seçilmedi</option>
                  <option value="Sepette İndirim">Sepette İndirim</option>
                  <option value="Ücretsiz Kargo">Ücretsiz Kargo</option>
                </select>
              </div>

              {/* Row 7 */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Kargo Firması</label>
                <select
                  value={filterCarrier}
                  onChange={(e) => setFilterCarrier(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Seçilmedi</option>
                  <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                  <option value="Aras Kargo">Aras Kargo</option>
                  <option value="MNG Kargo">MNG Kargo</option>
                  <option value="Sürat Kargo">Sürat Kargo</option>
                  <option value="PTT Kargo">PTT Kargo</option>
                  <option value="KARGOİST">Kargoist</option>
                  <option value="INTERLINE KARGO">Interline Kargo</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-zinc-700">Gelişmiş Arama</label>
                <select
                  value={filterAdvancedSearch}
                  onChange={(e) => setFilterAdvancedSearch(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-zinc-200 focus:outline-none focus:border-[#3b82f6] text-[12px] text-zinc-700 bg-white"
                >
                  <option value="">Hiçbiri seçilmedi</option>
                  <option value="invoiced">Faturalandırılmış</option>
                  <option value="not_invoiced">Faturalandırılmamış</option>
                  <option value="has_barcode">Kargo Barkodu Oluşturulmuş</option>
                  <option value="has_note">Notu Olan Siparişler</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="bg-[#1a73e8] hover:bg-[#155fc0] text-white font-medium text-[12px] px-4 py-2 rounded shadow-2xs transition-colors cursor-pointer"
              >
                Filtrele
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-transparent text-zinc-700 hover:text-zinc-900 font-medium text-[12px] px-2 py-2 rounded cursor-pointer"
              >
                Temizle
              </button>
            </div>
          </div>
        )}
        </div>

        {/* ORDER LIST TABLE (Görsel 1 & Preview Birebir) */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-md p-16 flex flex-col items-center justify-center gap-3 shadow-2xs">
            <div className="w-10 h-10 border-4 border-[#1565c0] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500">Sipariş verileri yükleniyor...</span>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left bg-white text-[12.5px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-[12.5px] font-bold text-slate-800 divide-x divide-slate-200/70">
                    <th className="py-3.5 px-3 w-11 text-center">
                      <input 
                        type="checkbox"
                        checked={filteredOrdersList.length > 0 && selectedOrderIds.length === filteredOrdersList.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1565c0] focus:ring-[#1565c0] cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Sipariş Bilgileri</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Müşteri Bilgileri</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Tutar</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Durum</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Kargo</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Tarih</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800">Yazdır</th>
                    <th className="py-3.5 px-4 font-bold text-slate-800 w-44">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredOrdersList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400 font-bold">Aramaya uygun sipariş kaydı bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    filteredOrdersList.map((order, index) => {
                      const isSelected = selectedOrderIds.includes(order.id)
                      const altRow = index % 2 === 1
                      return (
                        <tr 
                          key={order.id} 
                          className={`transition-colors border-b border-slate-200 divide-x divide-slate-200/70 ${
                            isSelected
                              ? "bg-[#e8f0fe]"
                              : altRow
                                ? "bg-[#e8f0fe]/65 hover:bg-[#e8f0fe]"
                                : "bg-white hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-3.5 px-3 text-center w-11">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(order.id, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-[#1565c0] focus:ring-[#1565c0] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 w-56">
                            <div className="flex flex-col leading-snug">
                              <span 
                                onClick={() => {
                                  setSelectedOrderId(order.id)
                                  setTempNotesText(order.admin_notes || "")
                                  setTempInvoiceSeriesText(order.invoice_series || "-")
                                }}
                                className="font-bold text-[#1565c0] hover:underline text-[13px] cursor-pointer flex items-center gap-1.5"
                              >
                                {order.display_id}
                              </span>
                              <span className="text-[12px] font-medium text-slate-700 mt-0.5">{order.platform || "WhatsApp"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 w-64">
                            <div className="flex flex-col leading-snug">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 text-[12.5px]">{order.customer.first_name} {order.customer.last_name}</span>
                                {(() => {
                                  // RISK KONTROLU
                                  const phone = order.customer?.phone || "";
                                  const email = order.customer?.email || "";
                                  const ip = order.customer?.ip || "";
                                  const fullName = `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.toLowerCase().replace(/\s+/g, '');
                                  
                                  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : "";
                                  const cleanEmail = email ? email.toLowerCase().trim() : "";
                                  const cleanIp = ip ? ip.trim() : "";
                                  
                                  let isRisky = false;
                                  const tcNo = (order.billing_address?.tc_no || "").trim();
                                  const taxNo = (order.billing_address?.tax_no || "").trim();
                                  for (const rc of (opsData.riskCriteria || [])) {
                                    const rcPhone = rc.phone ? rc.phone.replace(/[^0-9]/g, '').slice(-10) : "";
                                    const rcEmail = rc.email ? rc.email.toLowerCase().trim() : "";
                                    const rcIp = rc.ip ? rc.ip.trim() : "";
                                    const rcTc = rc.tc_no ? rc.tc_no.trim() : "";
                                    const rcTax = rc.tax_no ? rc.tax_no.trim() : "";
                                    const rcName = rc.full_name ? rc.full_name.toLowerCase().replace(/\s+/g, '') : "";
                                    if (
                                      (cleanPhone && rcPhone && cleanPhone === rcPhone) ||
                                      (cleanEmail && rcEmail && cleanEmail === rcEmail) ||
                                      (cleanIp && rcIp && cleanIp === rcIp && cleanIp !== "127.0.0.1") ||
                                      (tcNo && rcTc && tcNo === rcTc) ||
                                      (taxNo && rcTax && taxNo === rcTax) ||
                                      (fullName && rcName && fullName === rcName)
                                    ) {
                                      isRisky = true;
                                      break;
                                    }
                                  }
                                  
                                  if (!isRisky && (cleanPhone || cleanEmail || cleanIp || fullName)) {
                                    for (const o of currentOrders) {
                                      if (o.id === order.id) continue;
                                      
                                      // Gecmis siparis kapida odeme mi?
                                      const isKapidaOdeme = o.payment_option === "cash_on_delivery" || o.payment_option === "card_on_delivery";
                                      if (!isKapidaOdeme) continue;
                                      
                                      // Gecmis siparis iptal/iade edilmis mi?
                                      const isCanceledOrReturned = o.status === "iptal_edilen" || o.status === "iade_edilen" || o.status === "odeme_hatasi";
                                      if (!isCanceledOrReturned) continue;
                                      
                                      const oPhone = o.customer?.phone ? o.customer.phone.replace(/[^0-9]/g, '').slice(-10) : "";
                                      const oEmail = o.customer?.email ? o.customer.email.toLowerCase().trim() : "";
                                      const oIp = o.customer?.ip ? o.customer.ip.trim() : "";
                                      const oFullName = `${o.customer?.first_name || ""} ${o.customer?.last_name || ""}`.toLowerCase().replace(/\s+/g, '');
                                      
                                      const phoneMatch = cleanPhone && oPhone && cleanPhone === oPhone;
                                      const emailMatch = cleanEmail && oEmail && cleanEmail === oEmail;
                                      const ipMatch = cleanIp && oIp && cleanIp === oIp && cleanIp !== "127.0.0.1";
                                      const nameMatch = fullName && oFullName && fullName === oFullName;
                                      
                                      if (phoneMatch || emailMatch || ipMatch || nameMatch) {
                                        isRisky = true;
                                        break;
                                      }
                                    }
                                  }

                                  return isRisky ? (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 shadow-sm whitespace-nowrap animate-pulse">
                                      RİSKLİ SİPARİŞ
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[12px] font-medium text-slate-600 mt-0.5">{order.customer.phone}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 w-56">
                            <div className="flex flex-col leading-snug">
                              <span className="font-semibold text-slate-900 text-[12.5px]">{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                              <span className="text-[12px] font-medium text-slate-600 mt-0.5">{order.payment_method}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 w-40">
                            {order.status === "teslim_edilen" && (
                              <span className="inline-flex items-center justify-center h-[31px] px-3.5 rounded-[5px] border border-[#10b981] bg-white text-[#059669] text-[12.5px] font-semibold leading-none whitespace-nowrap">
                                Teslim Edildi
                              </span>
                            )}
                            {order.status === "kargolanan" && (
                              <span className="inline-flex items-center justify-center h-[31px] px-3.5 rounded-[5px] border border-[#f59e0b] bg-white text-[#d97706] text-[12.5px] font-semibold leading-none whitespace-nowrap">
                                Kargolandı
                              </span>
                            )}
                            {order.status === "hazirlanan" && (
                              <span className="inline-flex items-center justify-center h-[31px] px-3.5 rounded-[5px] border border-[#9333ea] bg-white text-[#9333ea] text-[12.5px] font-semibold leading-none whitespace-nowrap">
                                Hazırlanıyor
                              </span>
                            )}
                            {order.status === "onay_bekleyen" && (
                              <span className="inline-flex items-center justify-center h-[31px] px-3.5 rounded-[5px] border border-slate-400 bg-white text-slate-600 text-[12.5px] font-semibold leading-none whitespace-nowrap">
                                Onay Bekliyor
                              </span>
                            )}
                            {order.status === "iptal_edilen" && (
                              <span className="inline-flex items-center justify-center h-[31px] px-3.5 rounded-[5px] border border-rose-500 bg-white text-rose-600 text-[12.5px] font-semibold leading-none whitespace-nowrap">
                                İptal Edildi
                              </span>
                            )}
                            {order.status === "odeme_hatasi" && (
                              <span className="inline-flex items-center justify-center h-[31px] px-3.5 rounded-[5px] border border-red-600 bg-white text-red-600 text-[12.5px] font-semibold leading-none whitespace-nowrap">
                                Ödeme Hatası
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800 text-[12.5px] w-48">
                            {order.carrier_name || "Yurtiçi Kargo"}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700 text-[12.5px] w-40">
                            {order.created_at}
                          </td>
                          <td className="py-3.5 px-4 w-48">
                            <div className="flex items-center gap-3.5 text-[#475569]">
                              {/* 1. e-Fatura (e) */}
                              <button 
                                type="button"
                                title="e-Fatura Yazdır" 
                                onClick={() => triggerPrintSimulation("e-Fatura", order.id)}
                                className="hover:text-slate-950 font-black text-[19px] leading-none cursor-pointer relative"
                              >
                                e
                                {order.metadata?.efatura?.source === "TRENDYOL_API" && (
                                  <svg className="w-[13px] h-[13px] text-[#10b981] absolute -top-2 -right-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                              {/* 2. Fatura (Kıvrık Köşeli Çizgili Belge) */}
                              <button 
                                type="button"
                                title="Fatura Yazdır" 
                                onClick={() => triggerPrintSimulation("Fatura", order.id)}
                                className="hover:text-slate-950 cursor-pointer relative"
                              >
                                <svg className="w-[19px] h-[19px]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 14H8v-2h5v2zm3-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                </svg>
                              </button>
                              {/* 3. Kargo Fişi (Üstünde Belirgin Yeşil ✓ Olan Kamyon İkonu) */}
                              <button 
                                type="button"
                                title="Kargo Fişi Yazdır" 
                                onClick={() => triggerPrintSimulation("Kargo Fişi", order.id)}
                                className="relative hover:text-slate-950 cursor-pointer"
                              >
                                <svg className="w-[13px] h-[13px] text-[#10b981] absolute -top-2.5 -right-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <svg className="w-[22px] h-[19px]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                </svg>
                              </button>
                              {/* 4. Fiş (Kare Liste/Fiş İkonu) */}
                              <button 
                                type="button"
                                title="Sipariş Fişi Yazdır" 
                                onClick={() => triggerPrintSimulation("Paket Fişi", order.id)}
                                className="hover:text-slate-950 cursor-pointer"
                              >
                                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                </svg>
                              </button>
                              {/* 5. PDF (Dolu Sayfa İkonu) */}
                              <button 
                                type="button"
                                title="PDF İndir" 
                                onClick={() => triggerPrintSimulation("PDF", order.id)}
                                className="hover:text-slate-950 cursor-pointer"
                              >
                                <svg className="w-[19px] h-[19px]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 w-44">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Sipariş Detayını Görüntüle"
                                onClick={() => {
                                  setSelectedOrderId(order.id)
                                  setTempNotesText(order.admin_notes || "")
                                  setTempInvoiceSeriesText(order.invoice_series || "-")
                                }}
                                className="w-[34px] h-[31px] rounded-[5px] bg-[#9c51b6] hover:bg-[#863da0] text-white flex items-center justify-center shadow-2xs transition cursor-pointer shrink-0"
                              >
                                <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              {order.status === "kargolanan" && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkDelivered(order.id)}
                                  className="h-[31px] px-3.5 rounded-[5px] bg-[#10b981] hover:bg-[#059669] text-white text-[12.5px] font-bold shadow-2xs transition cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
                                >
                                  Teslim Et
                                </button>
                              )}
                              {order.status === "hazirlanan" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrderId(order.id)
                                    setTempNotesText(order.admin_notes || "")
                                    setTempInvoiceSeriesText(order.invoice_series || "-")
                                  }}
                                  className="h-[31px] px-3.5 rounded-[5px] bg-[#10b981] hover:bg-[#059669] text-white text-[12.5px] font-bold shadow-2xs transition cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
                                >
                                  Kargola
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* CART PREVIEW MODAL (Aktif Sepetler / Terk Edilmiş Sepetler / Ödeme Hatası Detayı) */}
      {selectedCartPreview && (
        <div
          style={{ zIndex: 100005 }}
          className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="absolute inset-0" onClick={() => setSelectedCartPreview(null)} />
          <div className="bg-white rounded-xl border border-zinc-200 shadow-2xl w-full max-w-[680px] overflow-hidden relative z-10 flex flex-col max-h-[85vh]">
            <div
              style={{
                backgroundColor: "#e9ecf1",
                backgroundImage:
                  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 14px, transparent 14px, transparent 28px)",
                borderBottom: "1px solid #cfd6e0",
              }}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Sepet / Sipariş İçeriği
                </div>
                <div className="text-[16px] font-black text-slate-900 mt-0.5">
                  #{selectedCartPreview.cart_no || selectedCartPreview.order_no} — {selectedCartPreview.customer_name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCartPreview(null)}
                className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Müşteri</span>
                  <span className="font-bold text-slate-800">{selectedCartPreview.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Telefon / E-Posta</span>
                  <span className="font-bold text-slate-800">
                    {selectedCartPreview.phone || selectedCartPreview.customer_phone || selectedCartPreview.email || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tarih</span>
                  <span className="font-bold text-slate-800">{selectedCartPreview.created_at}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 divide-x divide-slate-200">
                      <th className="py-2.5 px-3">Ürün</th>
                      <th className="py-2.5 px-3">Varyant / SKU</th>
                      <th className="py-2.5 px-3 text-center">Adet</th>
                      <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                      <th className="py-2.5 px-3 text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(selectedCartPreview.items || []).map((it: any, i: number) => (
                      <tr key={i} className="divide-x divide-slate-200">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{it.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{it.variant_title || "-"} {it.sku ? `(${it.sku})` : ""}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right">
                          {Number(it.unit_price || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {Number((it.unit_price || 0) * (it.quantity || 1)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-500">Genel Toplam</span>
                <span className="text-base font-black text-slate-900">
                  {Number(selectedCartPreview.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              {selectedCartPreview.cart_id && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedCartPreview
                    setSelectedCartPreview(null)
                    handleCreateOrderFromMissing(target)
                  }}
                  className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded shadow-sm cursor-pointer"
                >
                  Siparişi Oluştur
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCartPreview(null)}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL DIALOG (http://localhost:3095/ Birebir Tasarım) */}
      {selectedOrderId && activeOrderDetails && (
        <div
          id="order-detail-modal"
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-5 animate-fade-in"
        >
          <div
            className="absolute inset-0"
            onClick={() => setSelectedOrderId(null)}
          />
          <div className="bg-[#f8fafc] rounded-lg border border-[#cfd6e0] shadow-2xl w-full max-w-[1340px] h-[93vh] flex flex-col overflow-hidden relative z-10">
            
            {/* ÜST BLOK: GÜMÜŞ-GRİ ÇİZGİLİ DESEN VE RENK (http://localhost:3095/) */}
            <div
              style={{
                backgroundColor: "#e9ecf1",
                backgroundImage:
                  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 14px, transparent 14px, transparent 28px)",
              }}
              className="px-6 py-3.5 border-b border-[#cfd6e0] flex items-center justify-between shrink-0 select-none"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-slate-600 tracking-tight">
                  Sipariş Yönetimi
                </span>
                <span className="text-[17px] font-extrabold text-slate-900 tracking-tight">
                  {activeOrderDetails.display_id} Nolu Sipariş
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-bold flex items-center justify-center shadow-2xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* ANA İÇERİK (SOL: ÜRÜNLER + YÖNETİCİ NOTU + MÜŞTERİ/TESLİMAT/FATURA | SAĞ: BİRLEŞİK ÖZET/ÖDEME/KARGO + DÖNÜŞÜM + DİĞER) */}
            <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1fr_325px] gap-4 items-start">
              
              {/* SOL KOLON */}
              <div className="flex flex-col gap-4">
                
                {/* 1. Hazırlanan Ürünler */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
                  <div className="px-4 py-3 border-b border-slate-200 bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#9333ea] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
                      </svg>
                      <h3 className="text-[13.5px] font-bold text-slate-800 tracking-tight">
                        Hazırlanan Ürünler{" "}
                        <span className="font-normal text-slate-500">
                          ({activeOrderDetails.items.length})
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {!editingProducts ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProducts(true)
                            setTempProducts(
                              activeOrderDetails.items.map((i) => ({
                                id: i.id,
                                unit_price: i.unit_price,
                                quantity: i.quantity,
                              }))
                            )
                          }}
                          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-[12px] rounded transition cursor-pointer"
                        >
                          Düzenle
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveProducts}
                            className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold text-[12px] rounded transition cursor-pointer"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProducts(false)}
                            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-[12px] rounded transition cursor-pointer"
                          >
                            İptal
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowProductSearchModal(true)}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-[12px] rounded transition cursor-pointer"
                      >
                        Ürün Ekle
                      </button>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-[12px] rounded transition cursor-pointer"
                      >
                        İade Oluştur
                      </button>
                    </div>
                  </div>

                  <table className="w-full border-collapse text-left text-[12.5px] text-slate-700">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-200 text-[12px] font-semibold text-slate-700 divide-x divide-slate-200/70">
                        <th className="py-2.5 px-4 font-semibold">Ürün</th>
                        <th className="py-2.5 px-4 text-right font-semibold w-28">Fiyat</th>
                        <th className="py-2.5 px-3 text-center font-semibold w-20">KDV</th>
                        <th className="py-2.5 px-3 text-center font-semibold w-20">Miktar</th>
                        <th className="py-2.5 px-4 text-right font-semibold w-32">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeOrderDetails.items.map((item) => (
                        <tr key={item.id} className="divide-x divide-slate-100 hover:bg-slate-50/40">
                          <td className="py-3.5 px-4">
                            <div className="flex gap-3.5 items-start">
                              <div className="w-14 h-16 rounded border border-slate-200 overflow-hidden shrink-0 p-0.5 bg-slate-50 flex items-center justify-center">
                                {item.thumbnail ? (
                                  <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded-xs"
                                  />
                                ) : (
                                  <span>📦</span>
                                )}
                              </div>
                              <div className="flex flex-col leading-snug">
                                <span className="font-bold text-slate-800 text-[12.5px]">
                                  {item.title}
                                </span>
                                <span className="text-[11.5px] text-slate-500 mt-1">
                                  #{item.sku || item.id.slice(-4)}
                                </span>
                                {item.barcode && (
                                  <span className="text-[11.5px] text-slate-800 font-medium mt-0.5">
                                    {item.sku} - {item.barcode}
                                  </span>
                                )}
                                <span className="text-[11.5px] text-slate-700 mt-0.5">
                                  BEDEN: {item.size}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-800 font-medium align-middle">
                            {editingProducts ? (
                              <input
                                type="number"
                                className="w-20 border border-slate-300 rounded px-1.5 py-1 text-right text-[12px]"
                                value={tempProducts.find((t) => t.id === item.id)?.unit_price || 0}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  setTempProducts((prev) =>
                                    prev.map((t) => (t.id === item.id ? { ...t, unit_price: val } : t))
                                  )
                                }}
                              />
                            ) : (
                              <>{item.unit_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700 align-middle">
                            %{item.vat_rate}
                          </td>
                          <td className="py-3.5 px-3 text-center align-middle">
                            {editingProducts ? (
                              <input
                                type="number"
                                className="w-14 border border-slate-300 rounded px-1.5 py-1 text-center text-[12px] mx-auto block"
                                value={tempProducts.find((t) => t.id === item.id)?.quantity || 1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1
                                  setTempProducts((prev) =>
                                    prev.map((t) => (t.id === item.id ? { ...t, quantity: val } : t))
                                  )
                                }}
                              />
                            ) : (
                              <div className="flex flex-col leading-tight items-center justify-center">
                                <span className="text-slate-800 font-semibold text-[12.5px]">
                                  {item.quantity}
                                </span>
                                <span className="text-[10.5px] text-slate-500">Adet</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-800 font-medium align-middle">
                            {editingProducts ? (
                              <div className="flex items-center justify-end gap-2">
                                <span>
                                  {(
                                    (tempProducts.find((t) => t.id === item.id)?.unit_price || 0) *
                                    (tempProducts.find((t) => t.id === item.id)?.quantity || 0)
                                  ).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}{" "}
                                  TL
                                </span>
                                <button
                                  type="button"
                                  title="Ürünü Sil"
                                  onClick={() =>
                                    setTempProducts((prev) => prev.filter((t) => t.id !== item.id))
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors shrink-0"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                {(item.unit_price * item.quantity).toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                TL
                              </>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Alt Toplam Satırı */}
                      <tr className="bg-white border-t border-slate-200 text-[12px] divide-x divide-slate-100">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5 text-slate-600 text-[11.5px]">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600" />
                              <span>Stok miktarını göster</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600" />
                              <span>Desiyi göster</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600" />
                              <span>Özel kodları göster</span>
                            </label>
                          </div>
                        </td>
                        <td colSpan={4} className="py-3.5 px-4 align-middle">
                          <div className="flex flex-col gap-2 max-w-[260px] ml-auto">
                            <div className="flex items-center justify-between text-slate-600">
                              <span>Ara Toplam</span>
                              <span className="font-semibold text-slate-800">
                                {activeOrderDetails.subtotal.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                TL
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span>Genel Toplam</span>
                              <span className="font-bold text-slate-900">
                                {activeOrderDetails.total.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                TL
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Yönetici Notu */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
                  <div className="px-4 py-3 bg-[#f8fafc] flex justify-between items-center border-b border-slate-100">
                    <h3 className="text-[13px] font-medium text-slate-700 tracking-tight">
                      Yönetici Notu
                    </h3>
                    {!editingNotes ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotes(true)
                          setTempNotesText(activeOrderDetails.admin_notes || "")
                        }}
                        className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-200/60 transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded cursor-pointer"
                        >
                          Kaydet
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNotes(false)}
                          className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer"
                        >
                          Vazgeç
                        </button>
                      </div>
                    )}
                  </div>
                  {(editingNotes || activeOrderDetails.admin_notes) && (
                    <div className="p-4">
                      {editingNotes ? (
                        <textarea
                          rows={2}
                          value={tempNotesText}
                          onChange={(e) => setTempNotesText(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded text-xs font-medium text-slate-800"
                        />
                      ) : (
                        <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded border border-slate-200">
                          {activeOrderDetails.admin_notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Müşteri | Teslimat Bilgileri | Fatura Bilgileri (3 Sütunlu Kart) */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 shadow-2xs">
                  {/* Müşteri */}
                  <div className="flex flex-col">
                    <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between min-h-[44px]">
                      <h4 className="text-[13px] font-bold text-slate-800">Müşteri</h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-white border border-slate-300 px-2.5 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {activeOrderDetails.customer.is_visitor ? "Ziyaretçi" : "Üye"}
                        </span>
                        {!editingCustomer ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomer(true)
                              setTempCustomer({
                                first_name: activeOrderDetails.customer.first_name,
                                last_name: activeOrderDetails.customer.last_name,
                                email: activeOrderDetails.customer.email,
                                phone: activeOrderDetails.customer.phone,
                              })
                            }}
                            className="text-slate-500 hover:text-slate-800 p-1 rounded cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={handleSaveCustomer}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                            >
                              Kaydet
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCustomer(false)}
                              className="text-[10px] font-medium text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              İptal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 text-[12px] space-y-2.5 text-slate-700">
                      {!editingCustomer ? (
                        <>
                          <div className="font-bold text-slate-900 text-[12.5px]">
                            {activeOrderDetails.customer.first_name}{" "}
                            {activeOrderDetails.customer.last_name}
                          </div>
                          <div className="flex items-center gap-2 text-slate-800 font-medium">
                            <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{activeOrderDetails.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <svg className="w-4 h-4 text-slate-700 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                            </svg>
                            <span>{activeOrderDetails.customer.phone}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempCustomer.first_name} onChange={(e) => setTempCustomer({ ...tempCustomer, first_name: e.target.value })} placeholder="Ad" />
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempCustomer.last_name} onChange={(e) => setTempCustomer({ ...tempCustomer, last_name: e.target.value })} placeholder="Soyad" />
                          <input type="email" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempCustomer.email} onChange={(e) => setTempCustomer({ ...tempCustomer, email: e.target.value })} placeholder="E-posta" />
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempCustomer.phone} onChange={(e) => setTempCustomer({ ...tempCustomer, phone: e.target.value })} placeholder="Telefon" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600 pt-0.5">
                        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <span>{activeOrderDetails.customer.ip}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teslimat Bilgileri */}
                  <div className="flex flex-col">
                    <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between min-h-[44px]">
                      <h4 className="text-[13px] font-bold text-slate-800">Teslimat Bilgileri</h4>
                      {!editingShipping ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingShipping(true)
                            setTempShipping({
                              first_name: activeOrderDetails.shipping_address.first_name,
                              last_name: activeOrderDetails.shipping_address.last_name,
                              address_1: activeOrderDetails.shipping_address.address_1,
                              district: activeOrderDetails.shipping_address.district,
                              city: activeOrderDetails.shipping_address.city,
                            })
                          }}
                          className="text-slate-500 hover:text-slate-800 p-1 rounded cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleSaveShipping}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingShipping(false)}
                            className="text-[10px] font-medium text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            İptal
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-[12px] space-y-2 text-slate-600">
                      {!editingShipping ? (
                        <>
                          <div className="font-bold text-slate-900 text-[12.5px]">
                            {activeOrderDetails.shipping_address.first_name}{" "}
                            {activeOrderDetails.shipping_address.last_name}
                          </div>
                          <p className="leading-relaxed uppercase">
                            {activeOrderDetails.shipping_address.address_1}
                          </p>
                          <div>
                            {activeOrderDetails.shipping_address.district} /{" "}
                            {activeOrderDetails.shipping_address.city} /{" "}
                            {activeOrderDetails.shipping_address.country_name}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempShipping.first_name} onChange={(e) => setTempShipping({ ...tempShipping, first_name: e.target.value })} placeholder="Ad" />
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempShipping.last_name} onChange={(e) => setTempShipping({ ...tempShipping, last_name: e.target.value })} placeholder="Soyad" />
                          <textarea rows={2} className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempShipping.address_1} onChange={(e) => setTempShipping({ ...tempShipping, address_1: e.target.value })} placeholder="Açık Adres" />
                          <div className="flex gap-2">
                            <input type="text" className="w-1/2 border border-slate-300 rounded p-1.5 text-[12px]" value={tempShipping.district} onChange={(e) => setTempShipping({ ...tempShipping, district: e.target.value })} placeholder="İlçe" />
                            <input type="text" className="w-1/2 border border-slate-300 rounded p-1.5 text-[12px]" value={tempShipping.city} onChange={(e) => setTempShipping({ ...tempShipping, city: e.target.value })} placeholder="İl" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fatura Bilgileri */}
                  <div className="flex flex-col">
                    <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between min-h-[44px]">
                      <h4 className="text-[13px] font-bold text-slate-800">Fatura Bilgileri</h4>
                      {!editingBilling ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBilling(true)
                            setTempBilling({
                              first_name: activeOrderDetails.billing_address.first_name,
                              last_name: activeOrderDetails.billing_address.last_name,
                              address_1: activeOrderDetails.billing_address.address_1,
                              district: activeOrderDetails.billing_address.district,
                              city: activeOrderDetails.billing_address.city,
                              tc_no: activeOrderDetails.billing_address.tc_no || "",
                            })
                          }}
                          className="text-slate-500 hover:text-slate-800 p-1 rounded cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleSaveBilling}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBilling(false)}
                            className="text-[10px] font-medium text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            İptal
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-[12px] space-y-2 text-slate-600">
                      {!editingBilling ? (
                        <>
                          <div className="font-bold text-slate-900 text-[12.5px]">
                            {activeOrderDetails.billing_address.first_name}{" "}
                            {activeOrderDetails.billing_address.last_name}
                          </div>
                          <p className="leading-relaxed uppercase">
                            {activeOrderDetails.billing_address.address_1}
                          </p>
                          <div>
                            {activeOrderDetails.billing_address.district} /{" "}
                            {activeOrderDetails.billing_address.city} /{" "}
                            {activeOrderDetails.billing_address.country_name}
                          </div>
                          {activeOrderDetails.metadata?.company_name && (
                            <div className="font-semibold text-slate-800">
                              Firma: {activeOrderDetails.metadata.company_name}
                            </div>
                          )}
                          {activeOrderDetails.billing_address.tax_no && (
                            <div className="mt-0.5 font-medium text-slate-800">
                              VKN: {activeOrderDetails.billing_address.tax_no}
                              {activeOrderDetails.billing_address.tax_office
                                ? ` / VD: ${activeOrderDetails.billing_address.tax_office}`
                                : ""}
                            </div>
                          )}
                          {activeOrderDetails.billing_address.tc_no && (
                            <div className="mt-0.5">
                              TCKN: {activeOrderDetails.billing_address.tc_no}
                            </div>
                          )}
                          {activeOrderDetails.metadata?.efatura?.source === "TRENDYOL_API" && (
                            <div className="mt-2 p-2 rounded bg-orange-50 border border-orange-200 text-[11px] text-orange-800 flex items-center justify-between">
                              <div>
                                <span className="font-bold">
                                  {activeOrderDetails.metadata.efatura.documentType === "EFATURA"
                                    ? "e-Fatura"
                                    : "e-Arşiv"}
                                  :
                                </span>{" "}
                                <span className="font-mono font-bold">
                                  {activeOrderDetails.metadata.efatura.invoiceNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  triggerPrintSimulation("e-Fatura", activeOrderDetails.id)
                                }
                                className="text-orange-700 font-bold underline cursor-pointer"
                              >
                                Görüntüle
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempBilling.first_name} onChange={(e) => setTempBilling({ ...tempBilling, first_name: e.target.value })} placeholder="Ad" />
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempBilling.last_name} onChange={(e) => setTempBilling({ ...tempBilling, last_name: e.target.value })} placeholder="Soyad" />
                          <textarea rows={2} className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempBilling.address_1} onChange={(e) => setTempBilling({ ...tempBilling, address_1: e.target.value })} placeholder="Açık Adres" />
                          <div className="flex gap-2">
                            <input type="text" className="w-1/2 border border-slate-300 rounded p-1.5 text-[12px]" value={tempBilling.district} onChange={(e) => setTempBilling({ ...tempBilling, district: e.target.value })} placeholder="İlçe" />
                            <input type="text" className="w-1/2 border border-slate-300 rounded p-1.5 text-[12px]" value={tempBilling.city} onChange={(e) => setTempBilling({ ...tempBilling, city: e.target.value })} placeholder="İl" />
                          </div>
                          <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-[12px]" value={tempBilling.tc_no} onChange={(e) => setTempBilling({ ...tempBilling, tc_no: e.target.value })} placeholder="TC Kimlik No (Opsiyonel)" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* SAĞ KOLON (http://localhost:3095/ Birebir Tasarım) */}
              <div className="flex flex-col gap-4">
                
                {/* 1. Birleşik Sipariş Özeti + Ödeme + Kargo Bilgileri */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden divide-y divide-slate-200 shadow-2xs">
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[14.5px] font-semibold text-[#1565c0]">
                        {activeOrderDetails.display_id}
                      </span>
                      <span className="text-[12px] font-medium text-slate-800">
                        EntegreShop
                      </span>
                      <span className="text-[12px] font-bold text-slate-900">
                        {activeOrderDetails.created_at}
                      </span>
                      <div className="mt-1.5">
                        {activeOrderDetails.status === "teslim_edilen" && (
                          <span className="inline-block px-3 py-1 rounded border border-emerald-500 text-[12px] font-medium text-emerald-600 bg-white">
                            Teslim Edildi
                          </span>
                        )}
                        {activeOrderDetails.status === "kargolanan" && (
                          <span className="inline-block px-3 py-1 rounded border border-amber-500 text-[12px] font-medium text-amber-600 bg-white">
                            Kargolandı
                          </span>
                        )}
                        {activeOrderDetails.status === "hazirlanan" && (
                          <span className="inline-block px-3 py-1 rounded border border-[#9333ea] text-[12px] font-medium text-[#9333ea] bg-white">
                            Hazırlanıyor
                          </span>
                        )}
                        {activeOrderDetails.status === "iptal_edilen" && (
                          <span className="inline-block px-3 py-1 rounded border border-rose-500 text-[12px] font-medium text-rose-600 bg-white">
                            İptal Edildi
                          </span>
                        )}
                        {(activeOrderDetails.status === "onay_bekleyen" ||
                          activeOrderDetails.status === "tum_siparisler" ||
                          activeOrderDetails.status === "odeme_hatasi" ||
                          activeOrderDetails.status === "iade_edilen") && (
                          <span className="inline-block px-3 py-1 rounded border border-[#9333ea] text-[12px] font-medium text-[#9333ea] bg-white">
                            {activeOrderDetails.status === "onay_bekleyen"
                              ? "Hazırlanıyor"
                              : activeOrderDetails.status === "iade_edilen"
                              ? "İade Edildi"
                              : "Yeni Sipariş"}
                          </span>
                        )}
                      </div>
                    </div>
                    <img
                      src={ENTEGRESHOP_LOGO_BLACK}
                      alt="EntegreShop"
                      className="h-12 w-auto object-contain shrink-0"
                    />
                  </div>

                  <div className="p-4 text-[12px] space-y-2.5 text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Ödeme</span>
                      <span className="text-slate-900 font-semibold">
                        {activeOrderDetails.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sipariş Tutarı</span>
                      <span className="text-slate-900 font-bold text-[14px]">
                        {activeOrderDetails.total.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        TL
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>KDV</span>
                      <span className="text-slate-900 font-semibold">
                        {activeOrderDetails.vat_total.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        TL
                      </span>
                    </div>
                  </div>

                  {(() => {
                    let dCarrierName = activeOrderDetails.carrier_name || "Yurtiçi Kargo"
                    let dBarcode = activeOrderDetails.carrier_barcode || activeOrderDetails.display_id
                    if (
                      activeOrderDetails.metadata?.interline_barcode ||
                      activeOrderDetails.metadata?.selected_carrier === "interline"
                    ) {
                      dCarrierName = "Interline Express Kargo"
                      dBarcode =
                        activeOrderDetails.metadata?.interline_barcode ||
                        activeOrderDetails.display_id
                    } else if (
                      activeOrderDetails.metadata?.nova_barcode ||
                      activeOrderDetails.metadata?.selected_carrier === "kargonova"
                    ) {
                      dCarrierName = "Nova Kargo"
                      dBarcode =
                        activeOrderDetails.metadata?.nova_barcode ||
                        activeOrderDetails.display_id
                    }

                    return (
                      <div className="p-4 text-[12px] space-y-2 text-slate-600">
                        <div className="font-bold text-slate-800 text-[12.5px] mb-1">
                          Kargo Bilgileri
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Firma</span>
                          <span className="text-slate-900 font-semibold">
                            {dCarrierName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Barkod</span>
                          <span className="text-slate-900 font-semibold">
                            {dBarcode}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* 2. Dönüşüm Bilgileri */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-slate-200">
                    <h4 className="text-[13px] font-bold text-slate-800">
                      Dönüşüm Bilgileri
                    </h4>
                  </div>
                  <div className="p-4 flex flex-col divide-y divide-slate-200 text-[12px] text-slate-600">
                    <div className="pb-3 space-y-1.5">
                      <div>
                        <span>Trafik Kaynağı: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.traffic_source as string) ||
                            "Sosyal Ağ"}
                        </span>
                      </div>
                      <div>
                        <span>Yönlendiren: </span>
                        <span className="text-[#1565c0] font-medium">
                          {(activeOrderDetails.metadata?.referrer as string) ||
                            "instagram.com"}
                        </span>
                      </div>
                    </div>
                    <div className="py-3 space-y-1.5">
                      <div>
                        <span>Cihaz: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.device_type as string) ||
                            "Akıllı Telefon - iOS - Safari"}
                        </span>
                      </div>
                      <div>
                        <span>Oturum Süresi: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.session_duration as string) ||
                            "04:18 dk"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 space-y-1.5">
                      <div className="text-slate-500 font-medium mb-1">
                        UTM Bilgileri
                      </div>
                      <div>
                        <span>utm_source: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.utm_source as string) || "meta"}
                        </span>
                      </div>
                      <div>
                        <span>utm_medium: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.utm_medium as string) ||
                            "paid-social"}
                        </span>
                      </div>
                      <div>
                        <span>utm_campaign: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.utm_campaign as string) ||
                            "CBO|SALES|R-TARGET"}
                        </span>
                      </div>
                      <div>
                        <span>utm_term: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.utm_term as string) || "-"}
                        </span>
                      </div>
                      <div>
                        <span>utm_content: </span>
                        <span className="text-slate-900 font-semibold">
                          {(activeOrderDetails.metadata?.utm_content as string) || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Diğer */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-[13px] font-bold text-slate-800">Diğer</h4>
                    {!editingInvoiceSeries ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInvoiceSeries(true)
                          setTempInvoiceSeriesText(
                            activeOrderDetails.invoice_series || "-"
                          )
                        }}
                        className="text-slate-500 hover:text-slate-800 p-1 rounded cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveInvoiceSeries}
                          className="text-[11px] font-bold text-emerald-600 hover:underline"
                        >
                          Kaydet
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingInvoiceSeries(false)}
                          className="text-[11px] font-semibold text-slate-500 hover:underline"
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-[12px] space-y-2 text-slate-600">
                    {editingInvoiceSeries ? (
                      <input
                        type="text"
                        value={tempInvoiceSeriesText}
                        onChange={(e) => setTempInvoiceSeriesText(e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                      />
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Fatura Seri</span>
                          <span className="text-slate-900 font-semibold">
                            {activeOrderDetails.invoice_series || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fatura Ek Kodlar</span>
                          <span className="text-slate-900 font-semibold">-</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ALT AKSİYON ÇUBUĞU (FOOTER - http://localhost:3095/ Birebir Tasarım) */}
            <div className="bg-[#f8fafc] border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 relative">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[12px] h-9 px-3.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>İşlemler</span>
                    <span className="text-[10px]">▲</span>
                  </button>

                  {isActionMenuOpen && (
                    <div className="absolute bottom-full mb-1 left-0 w-48 bg-white border border-slate-200 rounded shadow-lg overflow-hidden py-1 z-20 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionMenuOpen(false)
                          const fullName = `${activeOrderDetails.customer.first_name || ""} ${activeOrderDetails.customer.last_name || ""}`.trim()
                          handleOpenNewRiskCriterion({
                            full_name: fullName,
                            email: activeOrderDetails.customer.email || "",
                            phone: activeOrderDetails.customer.phone || "",
                            tc_no: activeOrderDetails.billing_address?.tc_no || "",
                            tax_no: activeOrderDetails.billing_address?.tax_no || "",
                            ip: activeOrderDetails.customer.ip && activeOrderDetails.customer.ip !== "127.0.0.1" ? activeOrderDetails.customer.ip : "",
                            blocked_payment_methods: ["Kapıda Ödeme", "Havale / EFT"],
                            is_completely_blocked: false,
                            only_credit_card: true,
                            admin_note: `#${activeOrderDetails.display_id} nolu sipariş üzerinden risk kriterlerine eklendi (Kapıda Ödeme & Havale Pasif / Sadece Kredi Kartı).`,
                          })
                        }}
                        className="w-full text-left px-4 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Risk Kriterlerine Ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusModalTargetIds([activeOrderDetails.id])
                          setNewStatusValue(activeOrderDetails.status)
                          setShowStatusModal(true)
                          setIsActionMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Durumu Değiştir
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        SMS & E-Posta Gönder
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Sözleşmeler
                      </button>
                    </div>
                  )}
                </div>

                {activeOrderDetails.status !== "kargolanan" &&
                  activeOrderDetails.status !== "teslim_edilen" &&
                  activeOrderDetails.status !== "iptal_edilen" && (
                    <button
                      type="button"
                      onClick={() => {
                        setShipmentModalTargetIds([activeOrderDetails.id])
                        setShowShipmentModal(true)
                        setIsActionMenuOpen(false)
                      }}
                      className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-[12px] h-9 px-4 rounded shadow-2xs transition cursor-pointer"
                    >
                      Siparişi Kargola
                    </button>
                  )}

                {activeOrderDetails.status !== "iptal_edilen" && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(activeOrderDetails.id)}
                    className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-[12px] h-9 px-4 rounded shadow-2xs transition cursor-pointer"
                  >
                    Siparişi İptal Et
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerPrintSimulation("e-Fatura", activeOrderDetails.id)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[12px] h-9 px-3.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  {activeOrderDetails.metadata?.efatura?.source === "TRENDYOL_API" ? (
                    <span className="text-emerald-600 font-extrabold text-[11px]">✓</span>
                  ) : (
                    <span className="text-red-500 font-extrabold text-[11px]">✕</span>
                  )}
                  <span>E-Fatura</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerPrintSimulation("Fatura", activeOrderDetails.id)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[12px] h-9 px-3.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="text-red-500 font-extrabold text-[11px]">✕</span>
                  <span>Fatura</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerPrintSimulation("Kargo Fişi", activeOrderDetails.id)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[12px] h-9 px-3.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="text-red-500 font-extrabold text-[11px]">✕</span>
                  <span>Kargo Fişi</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerPrintSimulation("Paket Fişi", activeOrderDetails.id)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[12px] h-9 px-3.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="text-red-500 font-extrabold text-[11px]">✕</span>
                  <span>Fiş</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerPrintSimulation("PDF", activeOrderDetails.id)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[12px] h-9 px-3.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="text-red-500 font-extrabold text-[11px]">✕</span>
                  <span>PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Inner Modal for Status Change */}
      {showStatusModal && (
        <div style={{ zIndex: 100010 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0d6efd] text-white px-5 py-4 flex flex-col relative">
              <span className="text-[12px] font-semibold text-blue-100 mb-0.5">Sipariş İşlemleri</span>
              <span className="text-[16px] font-bold tracking-tight">Sipariş Durumunu Değiştir</span>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-zinc-200 opacity-90 transition-opacity"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-zinc-500">Sipariş Durumu</label>
                <select 
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  className="w-full border border-zinc-300 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="onay_bekleyen">Yeni Sipariş</option>
                  <option value="hazirlanan">Hazırlanan Sipariş</option>
                  <option value="kargolanan">Kargolanan Sipariş</option>
                  <option value="teslim_edilen">Teslim Edilen Sipariş</option>
                  <option value="iptal_edilen">İptal Edilen Sipariş</option>
                </select>
              </div>

              {newStatusValue === "kargolanan" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-zinc-500">Kargo Firması</label>
                  <select 
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full border border-zinc-300 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    <option value="kargonova">Nova Kargo</option>
                    <option value="interline">Interline Kargo</option>
                    <option value="ptt">PTT Kargo</option>
                    <option value="aras">Aras Kargo</option>
                    <option value="yurtici">Yurtiçi Kargo</option>
                    <option value="mng">MNG Kargo</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input 
                  type="checkbox" 
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[12px] font-semibold text-zinc-600 leading-snug">
                  Müşteriye mobil uygulama bildirimleri
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[12px] h-9 px-5 rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  for (const id of statusModalTargetIds) {
                    if (newStatusValue === "kargolanan") {
                      const orderToUpdate = realOrders.find(o => o.id === id);
                      const oldMetadata = orderToUpdate?.metadata || {};
                      await fetch(`/admin/orders/${id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          metadata: {
                            ...oldMetadata,
                            selected_carrier: selectedCarrier
                          }
                        })
                      });
                    }
                    await handleStatusChange(id, newStatusValue, true);
                  }
                  setShowStatusModal(false);
                  
                  const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
                  const refreshData = await refreshRes.json()
                  if (refreshData && refreshData.orders) setRealOrders(refreshData.orders)

                  if (statusModalTargetIds.length > 1) {
                    showSuccess(`Tamamlanan sipariş sayısı: ${statusModalTargetIds.length}`);
                  } else {
                    showSuccess("Sipariş başarıyla güncellendi.");
                  }
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[12px] h-9 px-6 rounded transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="text-sm">✔</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inner Modal for Shipment (Siparişi Kargola) */}
      {showShipmentModal && (
        <div style={{ zIndex: 100010 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowShipmentModal(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0d6efd] text-white px-5 py-4 flex flex-col relative">
              <span className="text-[12px] font-semibold text-blue-100 mb-0.5">Sipariş İşlemleri</span>
              <span className="text-[16px] font-bold tracking-tight">Siparişleri Kargola</span>
              <button 
                onClick={() => setShowShipmentModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-zinc-200 opacity-90 transition-opacity"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex border-b border-zinc-200">
                <button className="flex-1 py-2 text-[13px] font-bold text-blue-600 border-b-2 border-blue-600">API ile Kargola</button>
                <button className="flex-1 py-2 text-[13px] font-bold text-zinc-400 hover:text-zinc-600" onClick={() => alert("Manuel kargolama modülü hazırlanıyor.")}>Manuel Kargola</button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-zinc-500">Kargo Firması</label>
                <select 
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="w-full border border-zinc-300 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="kargonova">Nova Kargo</option>
                  <option value="interline">Interline Kargo</option>
                  <option value="ptt">PTT Kargo</option>
                  <option value="aras">Aras Kargo</option>
                  <option value="yurtici">Yurtiçi Kargo</option>
                  <option value="mng">MNG Kargo</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setShowShipmentModal(false)}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[12px] h-9 px-5 rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  for (const id of shipmentModalTargetIds) {
                    const orderToUpdate = realOrders.find(o => o.id === id);
                    const oldMetadata = orderToUpdate?.metadata || {};
                    // Update order metadata with selected carrier
                    await fetch(`/admin/orders/${id}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        metadata: {
                          ...oldMetadata,
                          selected_carrier: selectedCarrier
                        }
                      })
                    });
                    // Change status to kargolanan which triggers the subscriber
                    await handleStatusChange(id, "kargolanan", true);
                  }
                  setShowShipmentModal(false);
                  
                  const refreshRes = await fetch("/admin/orders?limit=100&fields=*customer,*shipping_address,*billing_address,*items")
                  const refreshData = await refreshRes.json()
                  if (refreshData && refreshData.orders) setRealOrders(refreshData.orders)

                  showSuccess("Siparişler başarıyla kargolandı.");
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[12px] h-9 px-6 rounded transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="text-sm">✔</span>
                <span>Kargola</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inner Modal for Print Actions */}
      {showPrintModal && (
        <div style={{ zIndex: 100010 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowPrintModal(false)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 px-5 py-4 flex items-center justify-between">
              <span className="text-[15px] font-bold text-zinc-800">Yazdır</span>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-zinc-500">Yazdırma Şablonu</label>
                <select 
                  value={printTemplate}
                  onChange={(e) => setPrintTemplate(e.target.value)}
                  className="w-full border border-blue-500 ring-2 ring-blue-50 rounded px-3 py-2.5 text-[13px] font-bold text-zinc-800 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="E-Fatura">E-Fatura</option>
                  <option value="Fatura">Fatura</option>
                  <option value="Kargo Fişi">Kargo Fişi</option>
                  <option value="Fiş">Fiş</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-zinc-50 flex justify-end gap-2 border-t border-zinc-100">
              <button
                onClick={() => setShowPrintModal(false)}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[12px] h-9 px-5 rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  // Simulate bulk print
                  triggerPrintSimulation(printTemplate, printModalTargetIds);
                  alert(`${printModalTargetIds.length} adet sipariş için ${printTemplate} yazdırma işlemi başlatıldı.`);
                  setShowPrintModal(false);
                }}
                className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[12px] h-9 px-6 rounded transition-colors shadow-sm"
              >
                Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && !selectedOrderId && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2c303f] rounded-xl shadow-2xl flex items-center overflow-hidden z-[99999]"
          style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.1)' }}
        >
          <button 
            onClick={() => {
              setStatusModalTargetIds(selectedOrderIds);
              setNewStatusValue("onay_bekleyen");
              setShowStatusModal(true);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-[#7e22ce] hover:bg-purple-600 text-white font-bold text-xs transition-colors border-r border-zinc-700/50"
          >
            <span className="text-[14px]">☰</span>
            Durum ({selectedOrderIds.length})
          </button>
          
          <button 
            onClick={() => {
              setPrintModalTargetIds(selectedOrderIds);
              setPrintTemplate("E-Fatura");
              setShowPrintModal(true);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-[#b45309] hover:bg-amber-600 text-white font-bold text-xs transition-colors border-r border-zinc-700/50"
          >
            <span className="text-[14px]">🖨️</span>
            Yazdır ({selectedOrderIds.length})
          </button>

          <button 
            onClick={() => {
              triggerPrintSimulation("E-Fatura", selectedOrderIds);
              showSuccess(`${selectedOrderIds.length} sipariş için toplu E-Fatura kesme işlemi başlatıldı.`);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-[#1e40af] hover:bg-blue-700 text-white font-bold text-xs transition-colors"
          >
            <span className="text-[14px]">e</span>
            E-Fatura ({selectedOrderIds.length})
          </button>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setSuccessModal(null)} />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[380px] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-center">
            <div className="p-8 flex flex-col items-center gap-5">
              <div className="w-[72px] h-[72px] bg-[#10B981] rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[20px] font-bold text-zinc-800 tracking-tight">İşlem Tamamlandı!</h3>
                <p className="text-[14px] font-medium text-zinc-500 mt-1">{successModal}</p>
              </div>
            </div>
            <div className="p-5 bg-zinc-50 border-t border-zinc-100 flex justify-center">
              <button
                onClick={() => setSuccessModal(null)}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-[14px] w-full max-w-[140px] h-10 rounded transition-colors shadow-sm"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showProductSearchModal && (
        <div style={{ zIndex: 100005 }} className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProductSearchModal(false)} />
          <div className="bg-zinc-100 rounded-lg border border-zinc-200 shadow-2xl w-full max-w-[900px] h-[80vh] flex flex-col overflow-hidden relative z-10 animate-scale-up">
            
            <div className="bg-[#0d6efd] text-white px-5 py-3 flex items-center justify-between select-none shrink-0">
              <h2 className="text-sm font-bold tracking-tight">Ürünler</h2>
              <button 
                onClick={() => setShowProductSearchModal(false)} 
                className="text-white hover:opacity-85 p-1 rounded-lg transition-colors"
              >
                <XMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white border-b border-zinc-200 flex flex-col gap-3 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-[#0d6efd] focus:ring-1 focus:ring-[#0d6efd] outline-none transition-shadow text-sm"
                  placeholder="Ürün Ara..."
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchProducts()}
                />
              </div>
              <div className="flex gap-2">
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Tüm Kategoriler</option></select>
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Tüm Markalar</option></select>
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Tüm Filtreler</option></select>
                <select className="border border-zinc-300 rounded px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 flex-1"><option>Yeniden Eskiye</option></select>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {searchingProducts ? (
                <div className="flex justify-center py-10"><span className="text-zinc-500 font-medium text-sm">Aranıyor...</span></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {productSearchResults.map(product => (
                    (product.variants || []).map((variant: any) => (
                      <div key={variant.id} className="bg-white border border-zinc-200 rounded p-3 flex flex-col items-center gap-2 group relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full aspect-[3/4] bg-zinc-100 rounded overflow-hidden relative">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">👖</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button 
                              onClick={() => handleAddProductToOrder(product, variant)}
                              className="w-12 h-12 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all shadow-lg"
                              title="Siparişe Ekle"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-center w-full">
                          <h4 className="text-[11px] font-bold text-zinc-800 line-clamp-1">{product.title}</h4>
                          <div className="text-[10px] font-semibold text-zinc-500 mt-0.5">{variant.title}</div>
                          <div className="text-xs font-bold text-zinc-900 mt-1">
                            {((variant.prices?.find((p: any) => p.currency_code === "try")?.amount || 0) / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-1 uppercase">{variant.sku || "-"}</div>
                          <div className="text-[9px] text-zinc-400 mt-0.5">Stok: {variant.inventory_quantity || 0}</div>
                        </div>
                      </div>
                    ))
                  ))}
                  {productSearchResults.length === 0 && !searchingProducts && productSearchQuery && (
                    <div className="col-span-full text-center py-10 text-zinc-500 font-medium text-sm">Sonuç bulunamadı.</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SİPARİŞ ETİKETLERİ DÜZENLE / YENİ EKLE MODALI (GÖRSEL 2 BİREBİR TASARIM) */}
      {showOrderTagModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
            onClick={() => {
              setShowOrderTagModal(false)
              setTagModalActionsOpen(false)
            }}
          />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[900px] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Blue Header */}
            <div className="bg-[#1e88e5] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-blue-100 leading-tight">
                  Sipariş Etiketleri
                </span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  {editingOrderTag.no ? `${editingOrderTag.no} Nolu Etiket` : "Yeni Sipariş Etiketi"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {editingOrderTag.id && (
                  <div className="flex items-center gap-2 mr-1">
                    <button
                      type="button"
                      onClick={() => handleNavigateOrderTagModal("prev")}
                      className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                      title="Önceki Etiket"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigateOrderTagModal("next")}
                      className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                      title="Sonraki Etiket"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderTagModal(false)
                    setTagModalActionsOpen(false)
                  }}
                  className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-lg font-bold leading-none">✕</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 bg-[#f8fafc]">
              <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5 shadow-2xs">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-zinc-700">
                    Etiket Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingOrderTag.name}
                    onChange={(e) => setEditingOrderTag({ ...editingOrderTag, name: e.target.value })}
                    placeholder="Örn: Instagram, WhatsApp, Telefon, Mağaza..."
                    className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-[13px] font-medium text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-zinc-700">Durum</label>
                  <button
                    type="button"
                    onClick={() => setEditingOrderTag({ ...editingOrderTag, active: !editingOrderTag.active })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      editingOrderTag.active ? "bg-[#2ebd85]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        editingOrderTag.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-zinc-200 px-6 py-3.5 flex items-center justify-between">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTagModalActionsOpen(!tagModalActionsOpen)}
                  className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-[12px] h-9 px-4 rounded-md inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>İşlemler</span>
                  <span className="text-[10px]">▲</span>
                </button>
                {tagModalActionsOpen && (
                  <div className="absolute bottom-full mb-1.5 left-0 w-52 bg-white border border-zinc-200 rounded-md shadow-lg py-1 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setTagModalActionsOpen(false)
                        setShowOrderTagModal(false)
                        setIsPosOpen(true)
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                    >
                      Bu Etiketle Hızlı Satış (POS) Aç
                    </button>
                    {editingOrderTag.id && (
                      <button
                        type="button"
                        onClick={() => editingOrderTag.id && handleDeleteOrderTag(editingOrderTag.id)}
                        className="w-full text-left px-4 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        Etiketi Sil
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveOrderTag}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ RİSK KRİTERİ / DÜZENLE MODALI (GÖRSEL 4 & GÖRSEL 5 BİREBİR TASARIM) */}
      {showRiskCriterionModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
            onClick={() => {
              setShowRiskCriterionModal(false)
              setRiskMethodsDropdownOpen(false)
            }}
          />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[920px] max-h-[92vh] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Blue Header */}
            <div className="bg-[#1e88e5] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-blue-100 leading-tight">
                  Risk Kriterleri
                </span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  {editingRiskCriterion.no
                    ? `${editingRiskCriterion.no} Nolu Risk Kriteri`
                    : "Yeni Risk Kriteri"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRiskCriterionModal(false)
                  setRiskMethodsDropdownOpen(false)
                }}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-lg font-bold leading-none">✕</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-[#f8fafc] overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Info Banner (Görsel 4) */}
              <div className="bg-white border border-zinc-200 rounded-lg px-4 py-3 text-[12px] font-bold text-zinc-700 shadow-2xs">
                Bu kriterlere uyan bir müşteriden yeni sipariş geldiğinde &quot;Riskli Sipariş&quot; olarak işaretlenir ve aşağıda seçtiğiniz ödeme yöntemlerini kullanamaz.
              </div>

              <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5 shadow-2xs">
                {/* Hızlı Kısıtlama Modu Seçimi (Kapıda Ödeme İade -> Sadece Kredi Kartı veya Tam Bloklama) */}
                <div className="flex flex-col gap-2 pb-4 border-b border-zinc-100">
                  <label className="text-[12px] font-bold text-zinc-700">
                    Kısıtlama / Yaptırım Türü (Hızlı Seçim)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingRiskCriterion({
                          ...editingRiskCriterion,
                          is_completely_blocked: false,
                          only_credit_card: true,
                          blocked_payment_methods: ["Kapıda Ödeme", "Havale / EFT"],
                        })
                      }
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        !editingRiskCriterion.is_completely_blocked &&
                        editingRiskCriterion.blocked_payment_methods.includes("Kapıda Ödeme") &&
                        editingRiskCriterion.blocked_payment_methods.includes("Havale / EFT") &&
                        !editingRiskCriterion.blocked_payment_methods.includes("Kredi Kartı")
                          ? "border-[#1e88e5] bg-blue-50/50 ring-1 ring-[#1e88e5]"
                          : "border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="radio"
                        readOnly
                        checked={
                          !editingRiskCriterion.is_completely_blocked &&
                          editingRiskCriterion.blocked_payment_methods.includes("Kapıda Ödeme") &&
                          !editingRiskCriterion.blocked_payment_methods.includes("Kredi Kartı")
                        }
                        className="mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-zinc-800">
                          Sadece Kredi Kartı İle Satın Alabilsin (Kapıda Ödeme & Havale Pasif)
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">
                          Kapıda ödemeli kargosunu teslim almayan müşteriler için Kapıda Ödeme ve Havale/EFT yöntemlerini kapatır.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingRiskCriterion({
                          ...editingRiskCriterion,
                          is_completely_blocked: true,
                          only_credit_card: false,
                          blocked_payment_methods: [...ALL_RISK_PAYMENT_METHODS],
                        })
                      }
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        editingRiskCriterion.is_completely_blocked
                          ? "border-red-500 bg-red-50/50 ring-1 ring-red-500"
                          : "border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="radio"
                        readOnly
                        checked={editingRiskCriterion.is_completely_blocked}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-red-700">
                          Müşteriyi Tamamen Blokla (Sipariş Veremesin)
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">
                          Müşterinin tüm ödeme yöntemlerini kapatır ve yeni sipariş oluşturmasını tamamen engeller.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2-Column Customer Criteria Grid (Görsel 4) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">Ad Soyad</label>
                    <input
                      type="text"
                      value={editingRiskCriterion.full_name}
                      onChange={(e) =>
                        setEditingRiskCriterion({ ...editingRiskCriterion, full_name: e.target.value })
                      }
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">IP Adresi</label>
                    <input
                      type="text"
                      value={editingRiskCriterion.ip}
                      onChange={(e) =>
                        setEditingRiskCriterion({ ...editingRiskCriterion, ip: e.target.value })
                      }
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">E-Posta Adresi</label>
                    <input
                      type="email"
                      value={editingRiskCriterion.email}
                      onChange={(e) =>
                        setEditingRiskCriterion({ ...editingRiskCriterion, email: e.target.value })
                      }
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">Telefon Numarası</label>
                    <input
                      type="text"
                      value={editingRiskCriterion.phone}
                      onChange={(e) =>
                        setEditingRiskCriterion({ ...editingRiskCriterion, phone: e.target.value })
                      }
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">TC Kimlik Numarası</label>
                    <input
                      type="text"
                      value={editingRiskCriterion.tc_no}
                      onChange={(e) =>
                        setEditingRiskCriterion({ ...editingRiskCriterion, tc_no: e.target.value })
                      }
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-zinc-700">Vergi Numarası</label>
                    <input
                      type="text"
                      value={editingRiskCriterion.tax_no}
                      onChange={(e) =>
                        setEditingRiskCriterion({ ...editingRiskCriterion, tax_no: e.target.value })
                      }
                      className="w-full border border-zinc-200 rounded-md px-3.5 py-2 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                    />
                  </div>
                </div>

                {/* Multi-select Dropdown for Blocked Payment Methods (Görsel 4 Birebir) */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[12px] font-semibold text-zinc-700">
                    Müşterinin kullanmasını istemediğiniz ödeme yöntemlerini seçiniz.
                  </label>
                  <button
                    type="button"
                    onClick={() => setRiskMethodsDropdownOpen(!riskMethodsDropdownOpen)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3.5 py-2.5 text-[12.5px] text-zinc-700 flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#1e88e5]"
                  >
                    <span className="truncate font-medium">
                      {editingRiskCriterion.is_completely_blocked
                        ? "Müşteri Tamamen Bloklu (Tüm Ödeme Yöntemleri Kapalı)"
                        : editingRiskCriterion.blocked_payment_methods.length === 0
                        ? "Hiçbiri seçilmedi"
                        : editingRiskCriterion.blocked_payment_methods.join(", ")}
                    </span>
                    <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {riskMethodsDropdownOpen && (
                    <div className="border border-zinc-200 rounded-md bg-white shadow-lg p-3 flex flex-col gap-2.5 z-30">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 text-xs">🔍</span>
                        <input
                          type="text"
                          value={riskMethodsSearch}
                          onChange={(e) => setRiskMethodsSearch(e.target.value)}
                          placeholder="Ödeme yöntemi ara..."
                          className="w-full border border-zinc-200 rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingRiskCriterion({
                              ...editingRiskCriterion,
                              blocked_payment_methods: [...ALL_RISK_PAYMENT_METHODS],
                              is_completely_blocked: true,
                              only_credit_card: false,
                            })
                          }
                          className="border border-zinc-200 hover:bg-zinc-50 rounded py-1.5 text-xs font-semibold text-zinc-700 cursor-pointer"
                        >
                          Tümünü Seç
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingRiskCriterion({
                              ...editingRiskCriterion,
                              blocked_payment_methods: [],
                              is_completely_blocked: false,
                              only_credit_card: false,
                            })
                          }
                          className="border border-zinc-200 hover:bg-zinc-50 rounded py-1.5 text-xs font-semibold text-zinc-700 cursor-pointer"
                        >
                          Seçimi Kaldır
                        </button>
                      </div>

                      <div className="max-h-52 overflow-y-auto flex flex-col gap-1.5 pt-1">
                        {ALL_RISK_PAYMENT_METHODS.filter((m) =>
                          m.toLowerCase().includes(riskMethodsSearch.toLowerCase())
                        ).map((methodName) => {
                          const checked = editingRiskCriterion.blocked_payment_methods.includes(methodName)
                          return (
                            <label
                              key={methodName}
                              className="flex items-center gap-2.5 px-2 py-1 rounded hover:bg-zinc-50 cursor-pointer text-[12.5px] text-zinc-700"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...editingRiskCriterion.blocked_payment_methods, methodName]
                                    : editingRiskCriterion.blocked_payment_methods.filter((x) => x !== methodName)
                                  setEditingRiskCriterion({
                                    ...editingRiskCriterion,
                                    blocked_payment_methods: next,
                                    is_completely_blocked: next.length === ALL_RISK_PAYMENT_METHODS.length,
                                    only_credit_card:
                                      next.includes("Kapıda Ödeme") && !next.includes("Kredi Kartı"),
                                  })
                                }}
                                className="w-4 h-4 rounded border-zinc-300 text-[#1e88e5]"
                              />
                              <span>{methodName}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Yönetici Notu (Görsel 4) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-zinc-700">Yönetici Notu</label>
                  <textarea
                    rows={3}
                    value={editingRiskCriterion.admin_note}
                    onChange={(e) =>
                      setEditingRiskCriterion({ ...editingRiskCriterion, admin_note: e.target.value })
                    }
                    className="w-full border border-zinc-200 rounded-md p-3 text-[12.5px] text-zinc-800 focus:outline-none focus:border-[#1e88e5]"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-zinc-200 px-6 py-3.5 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={handleSaveRiskCriterion}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTOMATİK RİSK KRİTERLERİ MODALI */}
      {showAutoRiskModal && (
        <div style={{ zIndex: 100020 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
            onClick={() => setShowAutoRiskModal(false)}
          />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[680px] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1e88e5] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-blue-100 leading-tight">
                  Risk Kriterleri
                </span>
                <span className="text-[16px] font-bold tracking-tight mt-0.5">
                  Otomatik Risk Kriterleri (Kapıda Ödeme İade Koruması)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoRiskModal(false)}
                className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-lg font-bold leading-none">✕</span>
              </button>
            </div>

            <div className="p-6 bg-[#f8fafc] flex flex-col gap-4">
              <div className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-zinc-800">
                      Kapıda Ödemeli Kargosunu Teslim Almayan (İade Dönen) Müşterileri Otomatik Kısıtla
                    </span>
                    <span className="text-[11.5px] text-zinc-500 mt-0.5">
                      Sipariş durumu &quot;İade Edildi&quot; olan kapıda ödemeli müşterilerin bir sonraki alışverişinde Kapıda Ödeme ve Havale yöntemlerini otomatik kapatır.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpsData((prev: any) => ({
                        ...prev,
                        autoRiskConfig: {
                          ...prev.autoRiskConfig,
                          autoDisableCodOnReturn: !prev.autoRiskConfig?.autoDisableCodOnReturn,
                        },
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                      opsData.autoRiskConfig?.autoDisableCodOnReturn ? "bg-[#2ebd85]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        opsData.autoRiskConfig?.autoDisableCodOnReturn ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100">
                  <label className="text-[12px] font-semibold text-zinc-700">
                    İade Dönen Müşteriye Uygulanacak Otomatik İşlem
                  </label>
                  <select
                    value={opsData.autoRiskConfig?.actionType || "only_credit_card"}
                    onChange={(e) =>
                      setOpsData((prev: any) => ({
                        ...prev,
                        autoRiskConfig: {
                          ...prev.autoRiskConfig,
                          actionType: e.target.value,
                          blockedMethods:
                            e.target.value === "block_customer"
                              ? [...ALL_RISK_PAYMENT_METHODS]
                              : ["Kapıda Ödeme", "Havale / EFT"],
                        },
                      }))
                    }
                    className="w-full border border-zinc-200 rounded-md px-3.5 py-2.5 text-[12.5px] font-semibold text-zinc-800 bg-white focus:outline-none"
                  >
                    <option value="only_credit_card">
                      Kapıda Ödeme ve Havale Yöntemlerini Pasif Yap (Sadece Kredi Kartı İle Alabilsin)
                    </option>
                    <option value="block_customer">
                      Müşteriyi Tamamen Blokla (Hiçbir Ödeme Yöntemiyle Sipariş Veremesin)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-zinc-200 px-6 py-3.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSaveAutoRiskConfig(opsData.autoRiskConfig)}
                className="bg-[#2ebd85] hover:bg-emerald-600 text-white font-bold text-[12.5px] h-9 px-5 rounded-md inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>✓</span>
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <PosModal isOpen={isPosOpen} onOpenChange={setIsPosOpen} onOrderCreated={() => window.location.reload()} />
    </div>
  )
}

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ENTEGRESHOP_LOGO_BLACK } from "../routes/dashboard/page"
export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default SiparisYonetimiPage
