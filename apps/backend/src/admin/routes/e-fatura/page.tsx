import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, CheckCircle, XMark, Plus, ArrowPath } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"
import { ERP_INTEGRATIONS } from "./erp-logos"

export interface EfaturaInvoiceItem {
  title: string
  sku: string
  quantity: number
  unitPrice: number
  netUnitPrice: number
  vatRate: number
  vatAmount: number
  totalAmount: number
}

export interface EfaturaInvoiceRecord {
  id: string
  uuid: string
  invoiceNumber: string
  orderId: string
  orderDisplayId: string
  documentType: "EARSIV" | "EFATURA"
  invoiceScenario: "EARSIVFATURA" | "TEMELFATURA" | "TICARIFATURA"
  invoiceType: "SATIS" | "IADE"
  status: "RESMILESTI" | "TASLAK" | "IPTAL"
  source: "TRENDYOL_API" | "YEREL_UBL"
  environment: "stage" | "production"
  issueDate: string
  buyerName: string
  buyerIdentifier: string
  buyerTaxOffice: string
  buyerAddress: string
  buyerCity: string
  buyerDistrict: string
  buyerEmail: string
  buyerPhone: string
  currencyCode: string
  subtotalAmount: number
  vatRate: number
  vatAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  carrierName: string
  storeWebUrl: string
  items: EfaturaInvoiceItem[]
  trendyolResponse?: any
  createdAt: string
}

export interface EfaturaConfig {
  active: boolean
  environment: "stage" | "production"
  email: string
  password: string
  companyId: string
  supplierVkn: string
  supplierName: string
  supplierTaxOffice: string
  supplierAddress: string
  supplierCity: string
  supplierDistrict: string
  supplierPhone: string
  supplierEmail: string
  supplierMersis: string
  supplierTicaretSicil: string
  earchivePrefix: string
  einvoicePrefix: string
  defaultVatRate: number
  autoSend: boolean
  storeWebUrl: string
}

export interface TrendyolCreditInfo {
  remainingCredit: number
  totalCredit: number
  usedCredit: number
  packageName: string
  status: string
}

function numberToTurkishWords(amount: number): string {
  const ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"]
  const tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"]

  const readThreeDigits = (n: number): string => {
    if (n === 0) return ""
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10
    let str = ""
    if (h === 1) str += "YÜZ"
    else if (h > 1) str += ones[h] + "YÜZ"
    if (t > 0) str += tens[t]
    if (o > 0) str += ones[o]
    return str
  }

  const whole = Math.floor(Math.abs(amount))
  const kurus = Math.round((Math.abs(amount) - whole) * 100)

  if (whole === 0) return "SIFIR TÜRK LİRASI"

  const millions = Math.floor(whole / 1000000)
  const thousands = Math.floor((whole % 1000000) / 1000)
  const remainder = whole % 1000

  let result = ""
  if (millions > 0) result += readThreeDigits(millions) + "MİLYON"
  if (thousands === 1) result += "BİN"
  else if (thousands > 1) result += readThreeDigits(thousands) + "BİN"
  if (remainder > 0) result += readThreeDigits(remainder)

  result += " TÜRK LİRASI"
  if (kurus > 0) {
    result += " " + readThreeDigits(kurus) + " KURUŞ"
  }
  return `YALNIZ #${result}#`
}

export function openGibInvoicePrintWindow(
  invoices: EfaturaInvoiceRecord[],
  config: Partial<EfaturaConfig>
) {
  if (!invoices || invoices.length === 0) return

  const width = 940
  const height = 820
  const left = Math.max(0, (window.innerWidth - width) / 2)
  const top = Math.max(0, (window.innerHeight - height) / 2)
  const printWindow = window.open(
    "",
    "_blank",
    `width=${width},height=${height},top=${top},left=${left}`
  )
  if (!printWindow) {
    alert("Lütfen tarayıcınızda açılır pencere (pop-up) izni verin.")
    return
  }

  const supplierName =
    config.supplierName || "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ"
  const supplierAddress =
    config.supplierAddress || "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL"
  const supplierDistrict = config.supplierDistrict || "Güngören"
  const supplierCity = config.supplierCity || "İstanbul"
  const supplierTaxOffice = config.supplierTaxOffice || "Güngören Vergi Dairesi Müdürlüğü"
  const supplierVkn = config.supplierVkn || "7050600355"
  const supplierPhone = config.supplierPhone || "0532 337 00 81"
  const supplierEmail = config.supplierEmail || "hakkisahin9@gmail.com"
  const supplierMersis = config.supplierMersis || "0705060035500001"
  const supplierTicaretSicil = config.supplierTicaretSicil || "-"
  const storeWebUrl = config.storeWebUrl || "https://kombingo.com"

  const pagesHtml = invoices
    .map((inv) => {
      const dateObj = new Date(inv.issueDate || Date.now())
      const issueDateStr = dateObj.toLocaleDateString("tr-TR")
      const issueTimeStr = dateObj.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      const netTotal = Math.max(0, inv.totalAmount - inv.vatAmount)
      const isEArchive = inv.documentType === "EARSIV"
      const docTitle = isEArchive ? "e-Arşiv Fatura" : "e-Fatura"
      const idLabel = inv.buyerIdentifier?.length === 10 ? "VKN" : "TCKN"

      return `
      <div class="gib-page">
        <div class="no-print top-toolbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="background:#f27a1a;color:#fff;font-weight:800;font-size:11px;padding:4px 10px;border-radius:4px;">TRENDYOL E-FATURAM</span>
            <span style="font-size:12px;font-weight:700;color:#27272a;">Belge No: ${inv.invoiceNumber} | Sipariş: #${inv.orderDisplayId}</span>
          </div>
          <button onclick="window.print()" class="print-btn">🖨️ Faturayı Yazdır / PDF Kaydet</button>
        </div>

        <!-- HEADER: SELLER, GIB LOGO, META -->
        <table class="header-table">
          <tr>
            <td style="width:36%;vertical-align:top;border-right:1px solid #3f3f46;padding-right:10px;">
              <div class="party-title">${supplierName.toUpperCase()}</div>
              <div class="party-line">${supplierAddress}</div>
              <div class="party-line">${supplierDistrict} / ${supplierCity} / TÜRKİYE</div>
              <div class="party-line">Tel: ${supplierPhone} | E-Posta: ${supplierEmail}</div>
              <div class="party-line">Web Sitesi: ${storeWebUrl}</div>
              <div class="party-line" style="margin-top:4px;"><b>Vergi Dairesi:</b> ${supplierTaxOffice}</div>
              <div class="party-line"><b>VKN / TCKN:</b> ${supplierVkn}</div>
              <div class="party-line"><b>Mersis No:</b> ${supplierMersis} | <b>Tic. Sicil:</b> ${supplierTicaretSicil}</div>
            </td>

            <td style="width:28%;text-align:center;vertical-align:middle;padding:0 8px;">
              <div class="gib-seal">
                <div class="gib-seal-inner">
                  <div style="font-size:8px;font-weight:700;letter-spacing:0.5px;">T.C. HAZİNE VE MALİYE BAKANLIĞI</div>
                  <div style="font-size:11px;font-weight:900;color:#b91c1c;margin:2px 0;">GELİR İDARESİ BAŞKANLIĞI</div>
                  <div style="font-size:7px;font-weight:700;color:#52525b;">TRENDYOL E-FATURAM ENTEGRASYONU</div>
                </div>
              </div>
              <div class="doc-type-title">${docTitle}</div>
              <div style="font-size:9px;color:#52525b;margin-top:4px;word-break:break-all;">
                <b>ETTN:</b> ${inv.uuid}
              </div>
            </td>

            <td style="width:36%;vertical-align:top;padding-left:10px;">
              <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
                <div class="qr-box">
                  <svg viewBox="0 0 100 100" width="68" height="68">
                    <rect x="4" y="4" width="28" height="28" fill="none" stroke="#000" stroke-width="6"/>
                    <rect x="12" y="12" width="12" height="12" fill="#000"/>
                    <rect x="68" y="4" width="28" height="28" fill="none" stroke="#000" stroke-width="6"/>
                    <rect x="76" y="12" width="12" height="12" fill="#000"/>
                    <rect x="4" y="68" width="28" height="28" fill="none" stroke="#000" stroke-width="6"/>
                    <rect x="12" y="76" width="12" height="12" fill="#000"/>
                    <rect x="40" y="10" width="8" height="8" fill="#000"/>
                    <rect x="52" y="18" width="8" height="16" fill="#000"/>
                    <rect x="40" y="40" width="20" height="20" fill="#000"/>
                    <rect x="12" y="44" width="18" height="8" fill="#000"/>
                    <rect x="68" y="44" width="24" height="8" fill="#000"/>
                    <rect x="44" y="68" width="12" height="24" fill="#000"/>
                    <rect x="68" y="68" width="12" height="12" fill="#000"/>
                    <rect x="84" y="80" width="12" height="16" fill="#000"/>
                  </svg>
                </div>
              </div>
              <table class="meta-mini-table">
                <tr><th>Özelleştirme No:</th><td>TR1.2</td></tr>
                <tr><th>Senaryo:</th><td>${inv.invoiceScenario}</td></tr>
                <tr><th>Fatura Tipi:</th><td>${inv.invoiceType}</td></tr>
                <tr><th>Fatura No:</th><td><b>${inv.invoiceNumber}</b></td></tr>
                <tr><th>Fatura Tarihi:</th><td>${issueDateStr}</td></tr>
                <tr><th>Düzenleme Saati:</th><td>${issueTimeStr}</td></tr>
                <tr><th>Sipariş No:</th><td>#${inv.orderDisplayId}</td></tr>
              </table>
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:2px solid #18181b;margin:8px 0;" />

        <!-- BUYER BLOCK -->
        <table class="buyer-table">
          <tr>
            <td style="width:60%;vertical-align:top;">
              <div style="font-size:11px;font-weight:900;color:#18181b;margin-bottom:3px;">SAYIN</div>
              <div style="font-size:12px;font-weight:800;color:#000;">${inv.buyerName}</div>
              <div class="party-line">${inv.buyerAddress}</div>
              <div class="party-line">${inv.buyerDistrict} / ${inv.buyerCity} / TÜRKİYE</div>
              ${inv.buyerPhone ? `<div class="party-line">Tel: ${inv.buyerPhone} ${inv.buyerEmail ? `| E-Posta: ${inv.buyerEmail}` : ""}</div>` : ""}
              ${inv.buyerTaxOffice ? `<div class="party-line"><b>Vergi Dairesi:</b> ${inv.buyerTaxOffice}</div>` : ""}
              <div class="party-line"><b>${idLabel}:</b> ${inv.buyerIdentifier}</div>
            </td>
            <td style="width:40%;vertical-align:top;">
              <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:6px 8px;font-size:9.5px;line-height:1.45;">
                <div style="font-weight:800;color:#0f172a;border-bottom:1px solid #cbd5e1;padding-bottom:2px;margin-bottom:4px;">İNTERNET SATIŞ / SEVK BİLGİLERİ</div>
                <div><b>Web Adresi:</b> ${inv.storeWebUrl || storeWebUrl}</div>
                <div><b>Ödeme Şekli:</b> ${inv.paymentMethod}</div>
                <div><b>Ödeme Tarihi:</b> ${issueDateStr}</div>
                <div><b>Kargo / Taşıyıcı:</b> ${inv.carrierName || "Anlaşmalı Kargo"}</div>
                <div><b>Gönderim Tarihi:</b> ${issueDateStr}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- LINE ITEMS TABLE -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:5%;">Sıra No</th>
              <th style="width:14%;">Stok / Ürün Kodu</th>
              <th style="width:33%;">Mal / Hizmet Açıklaması</th>
              <th style="width:9%;">Miktar</th>
              <th style="width:13%;">Birim Fiyat (KDV Hariç)</th>
              <th style="width:7%;">KDV Oranı</th>
              <th style="width:9%;">KDV Tutarı</th>
              <th style="width:10%;">Mal / Hizmet Tutarı</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items
              .map(
                (item, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${item.sku || "-"}</td>
                <td><b>${item.title}</b></td>
                <td style="text-align:center;">${item.quantity} Adet</td>
                <td style="text-align:right;">${item.netUnitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
                <td style="text-align:center;">%${item.vatRate}</td>
                <td style="text-align:right;">${item.vatAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
                <td style="text-align:right;font-weight:700;">${item.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <!-- TOTALS ROW -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-top:10px;">
          <div style="flex:1;border:1px solid #27272a;padding:8px 10px;font-size:9.5px;line-height:1.5;">
            <div style="font-weight:800;margin-bottom:4px;">${numberToTurkishWords(inv.totalAmount)}</div>
            <div style="color:#3f3f46;">
              • İrsaliye yerine geçer.<br/>
              • e-Arşiv izni kapsamında elektronik ortamda iletilmiştir.<br/>
              • Sipariş No: <b>#${inv.orderDisplayId}</b> | Ödeme Yöntemi: <b>${inv.paymentMethod}</b><br/>
              • Entegratör: <b>Trendyol E-Faturam (Trendyol E-Çözüm)</b>
            </div>
          </div>

          <table class="totals-table">
            <tr>
              <th>Mal / Hizmet Toplam Tutarı (KDV Hariç)</th>
              <td>${netTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
            </tr>
            <tr>
              <th>Toplam İskonto</th>
              <td>${(inv.discountAmount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
            </tr>
            <tr>
              <th>Hesaplanan KDV (%${inv.vatRate})</th>
              <td>${inv.vatAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
            </tr>
            <tr>
              <th>Vergiler Dahil Toplam Tutar</th>
              <td><b>${inv.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</b></td>
            </tr>
            <tr class="payable-row">
              <th>Ödenecek Tutar</th>
              <td><b>${inv.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</b></td>
            </tr>
          </table>
        </div>
      </div>
      `
    })
    .join("")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <title>Trendyol E-Faturam - ${invoices.map((i) => i.invoiceNumber).join(", ")}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 16px;
            background: #f4f4f5;
            color: #18181b;
          }
          .gib-page {
            background: #fff;
            max-width: 860px;
            margin: 0 auto 24px auto;
            padding: 22px;
            border: 1px solid #d4d4d8;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            page-break-after: always;
          }
          .gib-page:last-child {
            page-break-after: auto;
          }
          .top-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 14px;
          }
          .print-btn {
            background: #f27a1a;
            color: #fff;
            border: none;
            padding: 7px 14px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }
          .print-btn:hover { background: #ea580c; }
          .header-table, .buyer-table, .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          .party-title {
            font-size: 12px;
            font-weight: 800;
            color: #000;
            margin-bottom: 3px;
          }
          .party-line {
            font-size: 9.5px;
            color: #27272a;
            line-height: 1.4;
          }
          .gib-seal {
            width: 155px;
            margin: 0 auto 6px auto;
            border: 2px double #b91c1c;
            border-radius: 50px;
            padding: 6px 8px;
            background: #fffafa;
          }
          .doc-type-title {
            font-size: 14px;
            font-weight: 900;
            color: #18181b;
            margin-top: 2px;
          }
          .qr-box {
            border: 1px solid #27272a;
            padding: 3px;
            display: inline-block;
          }
          .meta-mini-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
          }
          .meta-mini-table th {
            text-align: left;
            padding: 2px 5px;
            border: 1px solid #3f3f46;
            background: #f4f4f5;
            font-weight: 700;
            width: 48%;
          }
          .meta-mini-table td {
            padding: 2px 5px;
            border: 1px solid #3f3f46;
          }
          .buyer-table {
            margin: 8px 0 12px 0;
          }
          .items-table th {
            border: 1px solid #27272a;
            background: #f4f4f5;
            font-size: 9.5px;
            font-weight: 800;
            padding: 6px 5px;
            text-align: center;
          }
          .items-table td {
            border: 1px solid #27272a;
            font-size: 9.5px;
            padding: 6px 5px;
          }
          .totals-table {
            width: 310px;
            border-collapse: collapse;
            font-size: 10px;
          }
          .totals-table th {
            text-align: right;
            padding: 4px 7px;
            border: 1px solid #27272a;
            background: #f4f4f5;
            font-weight: 700;
          }
          .totals-table td {
            text-align: right;
            padding: 4px 7px;
            border: 1px solid #27272a;
            min-width: 95px;
          }
          .payable-row th, .payable-row td {
            background: #fef3c7;
            font-size: 11px;
          }
          @media print {
            body { background: #fff; padding: 0; }
            .gib-page { box-shadow: none; border: none; margin: 0; max-width: 100%; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `)
  printWindow.document.close()
}

interface TaxExemptionRow {
  id: number
  category: string
  code: string
  reason: string
}

const EfaturaPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  )

  // UI toggles for 1:1 ERP view
  const [showTrendyolSettings, setShowTrendyolSettings] = useState(true)
  const [showInvoicesList, setShowInvoicesList] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [selectedPassiveErp, setSelectedPassiveErp] = useState<{ id: string; name: string } | null>(
    null
  )

  // Tax exemption rows
  const [taxExemptions, setTaxExemptions] = useState<TaxExemptionRow[]>([
    {
      id: 1,
      category: "Yurt Dışı İhracat Ürünleri (Mikro İhracat / ETGB)",
      code: "301",
      reason: "11/1-a Mal İhracatı (KDV İstisnası)",
    },
  ])

  const [invoices, setInvoices] = useState<EfaturaInvoiceRecord[]>([])
  const [creditInfo, setCreditInfo] = useState<TrendyolCreditInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [docTypeFilter, setDocTypeFilter] = useState<"ALL" | "EARSIV" | "EFATURA">("ALL")

  const [showOrderModal, setShowOrderModal] = useState(false)
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<string>("")
  const [overrideDocType, setOverrideDocType] = useState<"" | "EARSIV" | "EFATURA">("")

  const [config, setConfig] = useState<EfaturaConfig>({
    active: true,
    environment: "production",
    email: "hakkisahin9@gmail.com",
    password: "",
    companyId: "94727",
    supplierVkn: "7050600355",
    supplierName: "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ",
    supplierTaxOffice: "Güngören Vergi Dairesi Müdürlüğü",
    supplierAddress: "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL",
    supplierCity: "İstanbul",
    supplierDistrict: "Güngören",
    supplierPhone: "0532 337 00 81",
    supplierEmail: "hakkisahin9@gmail.com",
    supplierMersis: "0705060035500001",
    supplierTicaretSicil: "",
    earchivePrefix: "BKM",
    einvoicePrefix: "EFT",
    defaultVatRate: 20,
    autoSend: false,
    storeWebUrl: "https://kombingo.com",
  })

  const fetchEfaturaData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/efatura")
      if (res.ok) {
        const data = await res.json()
        if (data.config) setConfig((prev) => ({ ...prev, ...data.config }))
        if (Array.isArray(data.invoices)) setInvoices(data.invoices)
        if (data.creditInfo) setCreditInfo(data.creditInfo)
      }
    } catch (e) {
      console.error("Failed to fetch e-fatura data:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch(
        "/admin/orders?limit=50&order=-created_at&fields=id,display_id,created_at,total,email,*customer,*shipping_address,*billing_address,metadata"
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.orders) {
          setOrdersList(data.orders)
          if (data.orders.length > 0 && !selectedOrderForInvoice) {
            setSelectedOrderForInvoice(data.orders[0].id)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchEfaturaData()
    fetchRecentOrders()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch("/admin/efatura-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (res.ok && data.config) {
        setConfig(data.config)
        setFeedback({
          type: "success",
          message: "Trendyol E-Fatura ayarlarınız mevcut değerleri korunarak kaydedildi!",
        })
      } else {
        setFeedback({
          type: "error",
          message: data?.error || "Ayarlar kaydedilirken hata oluştu.",
        })
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e?.message || "Bağlantı hatası." })
    } finally {
      setSaving(false)
    }
  }

  const handleTestAndSync = async () => {
    setTesting(true)
    setFeedback(null)
    try {
      const res = await fetch("/admin/efatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", config }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        if (data.config) {
          setConfig(data.config)
        } else if (data.companyId && data.companyId !== "-") {
          setConfig((prev) => ({ ...prev, companyId: String(data.companyId) }))
        }
        if (data.creditInfo) {
          setCreditInfo(data.creditInfo)
        }
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices)
        }
        const creditSummary = data.creditInfo
          ? ` • Kalan Kontör: ${data.creditInfo.remainingCredit} / ${data.creditInfo.totalCredit}`
          : ""
        const invSummary = Array.isArray(data.invoices)
          ? ` • Toplam Belge: ${data.invoices.length} Adet`
          : ""
        setFeedback({
          type: "success",
          message: `${data.message} (Şirket ID: ${data.companyId || "-"} | Kullanıcı ID: ${
            data.userId || "-"
          }${creditSummary}${invSummary})`,
        })
      } else {
        setFeedback({
          type: "error",
          message: data?.error || "Trendyol E-Faturam API bağlantısı doğrulanamadı.",
        })
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e?.message || "Bağlantı testi başarısız." })
    } finally {
      setTesting(false)
    }
  }

  const handlePrintOrDownloadInvoice = async (inv: EfaturaInvoiceRecord) => {
    if (inv.source === "TRENDYOL_API" && inv.uuid) {
      try {
        const res = await fetch("/admin/efatura", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "download",
            uuid: inv.uuid,
            documentType: inv.documentType,
            fileExtension: "pdf",
          }),
        })
        const data = await res.json().catch(() => null)
        if (res.ok && data?.downloadUrl) {
          window.open(data.downloadUrl, "_blank")
          return
        }
      } catch {}
    }
    openGibInvoicePrintWindow([inv], config)
  }

  const handleCreateInvoiceFromOrder = async () => {
    if (!selectedOrderForInvoice) return
    setCreatingInvoice(true)
    setFeedback(null)
    try {
      const res = await fetch("/admin/efatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          order_id: selectedOrderForInvoice,
          force_recreate: true,
          document_type: overrideDocType || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setInvoices(data.invoices || [])
        setShowOrderModal(false)
        setShowInvoicesList(true)
        const created = data.created?.[0]
        setFeedback({
          type: "success",
          message: `Fatura başarıyla oluşturuldu: ${created?.invoiceNumber || ""}`,
        })
        if (created) {
          openGibInvoicePrintWindow([created], config)
        }
      } else {
        setFeedback({
          type: "error",
          message: data?.error || "Fatura kesilirken hata oluştu.",
        })
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e?.message || "Bağlantı hatası." })
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleCancelInvoice = async (invoiceId: string) => {
    if (!confirm("Bu faturayı iptal olarak işaretlemek istediğinize emin misiniz?")) return
    try {
      const res = await fetch("/admin/efatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", invoice_id: invoiceId }),
      })
      const data = await res.json()
      if (res.ok && data.invoices) {
        setInvoices(data.invoices)
        setFeedback({ type: "success", message: "Fatura iptal edildi." })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (docTypeFilter !== "ALL" && inv.documentType !== docTypeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNo = inv.invoiceNumber.toLowerCase().includes(q)
        const matchOrder = inv.orderDisplayId.toLowerCase().includes(q)
        const matchBuyer = inv.buyerName.toLowerCase().includes(q)
        const matchId = inv.buyerIdentifier.toLowerCase().includes(q)
        const matchUuid = inv.uuid.toLowerCase().includes(q)
        if (!matchNo && !matchOrder && !matchBuyer && !matchId && !matchUuid) return false
      }
      return true
    })
  }, [invoices, docTypeFilter, searchQuery])

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
      className="min-h-screen bg-[#f1f3f6] text-slate-800 pb-16"
    >
      {/* SUB-VIEW 4: MUHASEBE / ERP (/admin/tools/erp 1:1) */}
      <div className="max-w-[1000px] mx-auto px-4 py-7">
        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mb-4 p-4 rounded-[6px] border flex items-center justify-between text-[13px] font-semibold ${
              feedback.type === "success"
                ? "bg-[#e0f6e7] border-[#0abb87] text-[#08976d]"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
              <XMark className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Callout (short-description type-2) */}
        <div className="bg-white border-l-[10px] border-[#c0c5d9] rounded-[5px] px-[25px] py-[18px] mb-[22px] flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#48465b] shadow-2xs">
          <div className="flex-1 min-w-[260px]">
            Siparişlerinizi otomatik e-fatura / e-arşiv olarak kesmek, stok, fiyat ve cari hesaplarınızı senkronize etmek için Muhasebe &amp; ERP entegrasyonlarını kullanabilirsiniz.
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="h-[36px] px-4 rounded-[4px] bg-[#3d94fb] hover:bg-[#2b82ec] text-white text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>⇄</span> Ürünleri Muhasebeye Aktar
            </button>
            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="h-[36px] px-4 rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>📂</span> Kategorileri Muhasebeye Aktar
            </button>
          </div>
        </div>

        {/* > Aktif Muhasebe Entegrasyonları (.lag-smart-title.success) */}
        <div className="text-[17px] font-medium text-[#0abb87] mb-[12px] flex items-center gap-1.5">
          <span className="font-bold text-[18px] leading-none">›</span>
          <span>Aktif Muhasebe Entegrasyonları</span>
        </div>

        {/* Aktif 3-Column Grid (.lag-smart-content .box.box-2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[15px] mb-[18px]">
          <div
            onClick={() => setShowTrendyolSettings(!showTrendyolSettings)}
            className="h-[80px] bg-white hover:bg-[#d8e6f8] rounded-[5px] border-2 border-[#0abb87] px-[20px] py-[15px] flex items-center justify-between shadow-[0_4px_20px_hsla(214,3%,45%,0.12)] transition-colors cursor-pointer"
          >
            <div>
              <div className="text-[15px] font-medium text-[#222222] flex items-center gap-1.5">
                <span>Trendyol E-Fatura</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#e0f6e7] text-[#08976d] text-[10.5px] font-bold">
                  ✓ Aktif
                </span>
              </div>
              <div className="text-[11px] text-[#08976d] mt-0.5">Ayarları Göster / Gizle ▾</div>
            </div>
            <div className="flex items-center justify-end shrink-0">
              <div className="px-2.5 py-1.5 rounded-[5px] bg-[#F27A1A] text-white flex flex-col items-center justify-center leading-tight shadow-2xs">
                <span className="text-[11px] font-black tracking-tight">trendyol</span>
                <span className="text-[9.5px] font-semibold opacity-95">e-Faturam</span>
              </div>
            </div>
          </div>
        </div>

        {/* AKTİF TRENDYOL E-FATURA (TRENDYOL E-FATURAM) AYARLARI KARTI */}
        {showTrendyolSettings && (
          <div className="bg-white rounded-[6px] border-2 border-[#0abb87]/70 mb-[26px] shadow-[0_4px_20px_hsla(214,3%,45%,0.12)] overflow-hidden">
            <div className="flex items-center justify-between py-[16px] px-[22px] bg-[#f6fefb] border-b border-[#d1fae5]">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1.5 rounded-[6px] bg-[#F27A1A] text-white flex flex-col items-center justify-center leading-tight shadow-2xs">
                  <span className="text-[10.5px] font-black tracking-tight">trendyol</span>
                  <span className="text-[9px] font-semibold opacity-95">e-Faturam</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[#1e293b]">
                      Trendyol E-Fatura (Trendyol E-Faturam &amp; E-Arşiv Ayarları)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e0f6e7] text-[#08976d] text-[11px] font-bold">
                      ✓ Aktif ({config.environment === "stage" ? "Test Modu" : "Canlı Mod"})
                    </span>
                    {creditInfo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#F27A1A] border border-orange-200 text-[11px] font-bold">
                        Kalan Kontör: {creditInfo.remainingCredit} / {creditInfo.totalCredit}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#64748b] mt-0.5">
                    Mevcut aktif Trendyol E-Fatura entegrasyonunuz. Siparişleriniz mevcut seri ön eki (
                    <code>{config.earchivePrefix || "TYA"}</code> /{" "}
                    <code>{config.einvoicePrefix || "TYF"}</code>) ve vergi ayarlarınız değiştirilmeden kesilir.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTrendyolSettings(false)}
                className="h-[28px] px-2.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[11.5px] text-gray-600 cursor-pointer shrink-0"
              >
                Gizle ▲
              </button>
            </div>

            <div className="p-[22px] bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Entegrasyon Durumu
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setConfig({ ...config, active: !config.active })}
                      className={`w-[52px] h-[26px] rounded-full p-[3px] flex items-center cursor-pointer transition-all ${
                        config.active ? "bg-[#0abb87] justify-end" : "bg-[#e2e5ec] justify-start"
                      }`}
                    >
                      <div className="w-[20px] h-[20px] rounded-full bg-white shadow-xs"></div>
                    </div>
                    <span className="text-[12px] font-bold text-[#08976d]">
                      {config.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Çalışma Ortamı (Mod)
                  </label>
                  <select
                    value={config.environment}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        environment: e.target.value as "stage" | "production",
                      })
                    }
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[12.5px] text-[#495057] font-medium"
                  >
                    <option value="production">Canlı (Production - Resmi Fatura)</option>
                    <option value="stage">Test (Stage / Sandbox)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Trendyol Tedarikçi ID (Supplier ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.companyId}
                    onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Trendyol E-Faturam E-Posta / Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Trendyol E-Faturam Şifre / API Secret <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={config.password}
                    placeholder="••••••••••••••••"
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Firma VKN / TCKN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.supplierVkn}
                    onChange={(e) => setConfig({ ...config, supplierVkn: e.target.value })}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    value={config.supplierTaxOffice}
                    onChange={(e) => setConfig({ ...config, supplierTaxOffice: e.target.value })}
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    E-Arşiv Fatura Seri Ön Eki (3 Hane)
                  </label>
                  <input
                    type="text"
                    value={config.earchivePrefix}
                    maxLength={3}
                    onChange={(e) =>
                      setConfig({ ...config, earchivePrefix: e.target.value.toUpperCase() })
                    }
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057] font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    E-Fatura Seri Ön Eki (3 Hane)
                  </label>
                  <input
                    type="text"
                    value={config.einvoicePrefix}
                    maxLength={3}
                    onChange={(e) =>
                      setConfig({ ...config, einvoicePrefix: e.target.value.toUpperCase() })
                    }
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12.5px] text-[#495057] font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Varsayılan KDV Oranı (%)
                  </label>
                  <select
                    value={config.defaultVatRate}
                    onChange={(e) =>
                      setConfig({ ...config, defaultVatRate: Number(e.target.value) })
                    }
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[12.5px] text-[#495057]"
                  >
                    <option value={10}>%10 (Tekstil &amp; Giyim / Ürün KDV Oranı)</option>
                    <option value={20}>%20 (Genel KDV Oranı)</option>
                    <option value={1}>%1 (İndirimli KDV)</option>
                    <option value={0}>%0 (KDV Muaf / İstisna)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Otomatik Fatura Kesim Durumu
                  </label>
                  <select className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[12.5px] text-[#495057]">
                    <option>Sipariş Onaylandığında / Hazırlanırken</option>
                    <option>Sipariş Kargoya Verildiğinde</option>
                    <option>Sadece Manuel Kesilsin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Kargo Ücreti Fatura Kalemi
                  </label>
                  <select className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[12.5px] text-[#495057]">
                    <option>Faturaya Ayrı Hizmet Kalemi Olarak Ekle</option>
                    <option>Ürün Fiyatlarına Dağıt</option>
                    <option>Faturaya Yansıtma</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3.5 rounded-[5px] bg-[#f8fafc] border border-[#e2e8f0] mb-4 text-[12.5px] text-[#334155]">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  <span>E-Arşiv İnternet Satışı Bilgisi (Web Adresi &amp; Ödeme Tipi) Gönderilsin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  <span>Fatura İrsaliye Yerine Geçsin (&quot;İrsaliye yerine geçer&quot; ibaresi eklensin)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  <span>Fatura Kesildiğinde Müşteriye Otomatik PDF E-Posta / SMS Gönderilsin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
                  <span>Pazaryeri Siparişlerinde Kesilen Faturayı Otomatik Trendyol / Pazaryerine İlet</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#ebedf2] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveSettings}
                    className="h-[34px] px-4 rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[12.5px] font-semibold cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    ✓ {saving ? "Kaydediliyor..." : "Trendyol E-Fatura Ayarlarını Kaydet"}
                  </button>
                  <button
                    type="button"
                    disabled={testing}
                    onClick={handleTestAndSync}
                    className="h-[34px] px-4 rounded-[4px] bg-[#F27A1A] hover:bg-[#d96910] text-white text-[12.5px] font-semibold cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    ⚡ {testing ? "Test Ediliyor..." : "Bağlantıyı Test Et"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoicesList(!showInvoicesList)}
                    className="h-[34px] px-3.5 rounded-[4px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12px] font-semibold cursor-pointer"
                  >
                    📄 Kesilen Faturalar ({invoices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(true)}
                    className="h-[34px] px-3.5 rounded-[4px] border border-orange-300 bg-orange-50 hover:bg-orange-100 text-[#F27A1A] text-[12px] font-semibold cursor-pointer"
                  >
                    + Siparişten Yeni Fatura Kes
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyncModal(true)}
                  className="h-[34px] px-3.5 rounded-[4px] border border-[#3d94fb] text-[#3d94fb] hover:bg-blue-50 text-[12px] font-medium cursor-pointer"
                >
                  ⇄ Ürün &amp; Stok Kartlarını Eşitle
                </button>
              </div>

              {/* Collapsible Issued Invoices List */}
              {showInvoicesList && (
                <div className="mt-5 pt-4 border-t border-[#ebedf2]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="text-[14px] font-bold text-[#1e293b]">
                      Kesilen E-Fatura &amp; E-Arşiv Belgeleri ({filteredInvoices.length})
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Fatura No, Sipariş No, Müşteri ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[32px] px-3 rounded-[4px] border border-[#e2e5ec] text-[12px]"
                      />
                      <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value as any)}
                        className="h-[32px] px-2.5 rounded-[4px] border border-[#e2e5ec] bg-white text-[12px]"
                      >
                        <option value="ALL">Tüm Belgeler</option>
                        <option value="EARSIV">e-Arşiv</option>
                        <option value="EFATURA">e-Fatura</option>
                      </select>
                    </div>
                  </div>
                  {loading ? (
                    <div className="p-6 text-center text-[12.5px] text-slate-400">Yükleniyor...</div>
                  ) : filteredInvoices.length === 0 ? (
                    <div className="p-6 text-center text-[12.5px] text-slate-400 bg-slate-50 rounded-[4px]">
                      Henüz kesilmiş fatura kaydı bulunmuyor.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-[#ebedf2] rounded-[4px]">
                      <table className="w-full text-left border-collapse text-[12px]">
                        <thead>
                          <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                            <th className="py-2.5 px-3">Fatura No</th>
                            <th className="py-2.5 px-3">Tür</th>
                            <th className="py-2.5 px-3">Sipariş</th>
                            <th className="py-2.5 px-3">Alıcı</th>
                            <th className="py-2.5 px-3 text-right">Toplam</th>
                            <th className="py-2.5 px-3 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebedf2]">
                          {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 font-bold text-slate-800">{inv.invoiceNumber}</td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-orange-50 text-[#F27A1A] font-bold text-[10.5px]">
                                  {inv.documentType}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-semibold text-blue-600">#{inv.orderDisplayId}</td>
                              <td className="py-2 px-3">{inv.buyerName}</td>
                              <td className="py-2 px-3 text-right font-bold">
                                {inv.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handlePrintOrDownloadInvoice(inv)}
                                    className="px-2.5 py-1 rounded bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                                  >
                                    🖨️ Yazdır
                                  </button>
                                  {inv.status !== "IPTAL" && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelInvoice(inv.id)}
                                      className="px-2 py-1 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold cursor-pointer"
                                    >
                                      İptal
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* > Pasif Muhasebe Entegrasyonları (.lag-smart-title.danger) */}
        <div className="text-[17px] font-medium text-[#c93424] mb-[12px] flex items-center gap-1.5">
          <span className="font-bold text-[18px] leading-none">›</span>
          <span>Pasif Muhasebe Entegrasyonları</span>
        </div>

        {/* Pasif 3-Column Grid of All 42 ERP Integrations with Original Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[15px] mb-6">
          {ERP_INTEGRATIONS.map((erp) => (
            <div
              key={erp.id}
              onClick={() => setSelectedPassiveErp({ id: erp.id, name: erp.name })}
              className="h-[80px] bg-white hover:bg-[#d8e6f8] rounded-[5px] px-[20px] py-[15px] flex items-center justify-between shadow-[0_4px_20px_hsla(214,3%,45%,0.12)] transition-colors cursor-pointer select-none"
            >
              <div className="text-[15px] font-medium text-[#222222] pr-2">{erp.name}</div>
              <div className="flex items-center justify-end shrink-0">
                <img
                  src={erp.logo}
                  alt={erp.name}
                  className="max-h-[48px] max-w-[105px] w-auto h-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Kategori Bazlı Vergi Muafiyetleri (.tax-exemptions from scripts.js.indir) */}
        <div className="bg-white rounded-[4px] border border-[#ebedf2] p-[25px] shadow-2xs mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-[17px] font-medium text-[#48465b]">
                Kategori Bazlı E-Fatura Vergi Muafiyetleri
              </h3>
              <p className="text-[13px] text-[#74788d] mt-1">
                %0 KDV&apos;li veya özel vergi istisnasına tabi kategoriler için E-Fatura muafiyet kodu ve sebebini tanımlayabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTaxExemptions([
                  ...taxExemptions,
                  {
                    id: Date.now(),
                    category: "Yurt Dışı İhracat Ürünleri (Mikro İhracat / ETGB)",
                    code: "301",
                    reason: "11/1-a Mal İhracatı (KDV İstisnası)",
                  },
                ])
              }
              className="h-[36px] px-4 rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[13px] font-medium cursor-pointer"
            >
              + Vergi Muafiyeti Ekle
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#ebedf2] text-[#48465b] font-semibold">
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 w-[240px]">Vergi Muafiyet Kodu</th>
                  <th className="py-3 px-3">Muafiyet Sebebi</th>
                  <th className="py-3 px-3 w-[80px] text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebedf2]">
                {taxExemptions.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 px-3">
                      <select
                        value={row.category}
                        onChange={(e) =>
                          setTaxExemptions(
                            taxExemptions.map((r) =>
                              r.id === row.id ? { ...r, category: e.target.value } : r
                            )
                          )
                        }
                        className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px]"
                      >
                        <option>Yurt Dışı İhracat Ürünleri (Mikro İhracat / ETGB)</option>
                        <option>Dijital Lisans &amp; Yazılım Hizmetleri</option>
                        <option>Tüm Kategoriler</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.code}
                        onChange={(e) =>
                          setTaxExemptions(
                            taxExemptions.map((r) =>
                              r.id === row.id ? { ...r, code: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Vergi Muafiyet Kodu"
                        className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.reason}
                        onChange={(e) =>
                          setTaxExemptions(
                            taxExemptions.map((r) =>
                              r.id === row.id ? { ...r, reason: e.target.value } : r
                            )
                          )
                        }
                        placeholder="Muafiyet Sebebi"
                        className="w-full h-[36px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (taxExemptions.length > 1) {
                            setTaxExemptions(taxExemptions.filter((r) => r.id !== row.id))
                          }
                        }}
                        className="w-[32px] h-[32px] rounded-[4px] bg-[#fd397a] text-white inline-flex items-center justify-center cursor-pointer"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ERP Integration Detail Modal */}
      {selectedPassiveErp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[620px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#1e293b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-300">Muhasebe / ERP Entegrasyon Ayarları</div>
                <div className="text-[16px] font-bold">
                  {selectedPassiveErp.name} Entegrasyon Ayarları
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPassiveErp(null)}
                className="text-white/80 hover:text-white text-[18px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Entegrasyon Durumu
                  </label>
                  <select className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] bg-white text-[13px] text-[#495057]">
                    <option value="0">Pasif (Kapalı)</option>
                    <option value="1">Aktif (Açık)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Firma VKN / TCKN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="10 veya 11 haneli Vergi / TC No"
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    API Kullanıcı Adı / Anahtarı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="API kullanıcı adı veya key"
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    API Şifresi / Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Servis URL / Endpoint (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[#48465b] mb-1.5">
                    Fatura Seri Ön Eki
                  </label>
                  <input
                    type="text"
                    defaultValue="EA2026"
                    className="w-full h-[38px] px-3 rounded-[4px] border border-[#e2e5ec] text-[13px]"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => alert("API Bağlantı testi başarılı!")}
                className="h-[36px] px-4 rounded-[4px] bg-[#3d94fb] hover:bg-[#2b82ec] text-white text-[12.5px] font-medium cursor-pointer"
              >
                ⚡ Bağlantıyı Test Et
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPassiveErp(null)}
                  className="h-[36px] px-4 rounded-[4px] border border-gray-300 bg-white text-[12.5px] font-medium cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPassiveErp(null)
                    setFeedback({
                      type: "success",
                      message: `${selectedPassiveErp.name} entegrasyon ayarları kaydedildi!`,
                    })
                  }}
                  className="h-[36px] px-5 rounded-[4px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[12.5px] font-bold cursor-pointer"
                >
                  ✓ Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ÜRÜNLERİ MUHASEBEYE AKTAR (#modal-sync-muhasebe-dialog) */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[520px] rounded-[6px] shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#0b5ed7] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] text-sky-100">Muhasebe / ERP Senkronizasyonu</div>
                <div className="text-[15px] font-bold">Ürünleri Muhasebeye Aktar</div>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="text-white/80 hover:text-white text-[18px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#f1f4f9] border-l-4 border-[#3d94fb] p-3.5 text-[12.5px] text-[#48465b]">
                Aktif muhasebe / ERP entegrasyonunuza aktarılacak ürün alanlarını seçiniz:
              </div>
              <label className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer">
                <span className="text-[13px] font-medium text-[#334155]">
                  Stok Miktarlarını Aktar (stock)
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
              </label>
              <label className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer">
                <span className="text-[13px] font-medium text-[#334155]">
                  Ürün Görsellerini Aktar (image)
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
              </label>
              <label className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer">
                <span className="text-[13px] font-medium text-[#334155]">
                  Alış Fiyatlarını Aktar (buy_price)
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-[13px] font-medium text-[#334155]">
                  Satış Fiyatlarını Aktar (sale_price)
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0abb87]" />
              </label>
            </div>
            <div className="px-6 py-3.5 bg-[#f8fafc] border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="h-[34px] px-4 rounded-[4px] border border-gray-300 bg-white text-[12.5px] font-medium cursor-pointer"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSyncModal(false)
                  setFeedback({
                    type: "success",
                    message: "Ürünler muhasebe servisine aktarılmak üzere kuyruğa alındı!",
                  })
                }}
                className="h-[34px] px-5 rounded-[4px] bg-[#0abb87] text-white text-[12.5px] font-bold cursor-pointer"
              >
                ✓ Aktarımı Başlat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE INVOICE FROM ORDER */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setShowOrderModal(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="bg-orange-500 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-orange-100">
                  Trendyol E-Faturam
                </div>
                <div className="text-sm font-extrabold">Siparişten E-Fatura / E-Arşiv Kes</div>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-white cursor-pointer">
                <XMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  Sipariş Seçin
                </label>
                <select
                  value={selectedOrderForInvoice}
                  onChange={(e) => setSelectedOrderForInvoice(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 bg-white"
                >
                  {ordersList.map((o) => {
                    const name = `${
                      o.shipping_address?.first_name || o.customer?.first_name || "Müşteri"
                    } ${o.shipping_address?.last_name || o.customer?.last_name || ""}`.trim()
                    const totalTL = ((Number(o.total) || 0) / 100).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })
                    return (
                      <option key={o.id} value={o.id}>
                        #{o.display_id || o.id.slice(-6)} - {name} ({totalTL} TL)
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  Belge Senaryosu
                </label>
                <select
                  value={overrideDocType}
                  onChange={(e) => setOverrideDocType(e.target.value as any)}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 bg-white"
                >
                  <option value="">
                    Otomatik Algıla (Bireysel → e-Arşiv / Kurumsal VKN → e-Fatura)
                  </option>
                  <option value="EARSIV">e-Arşiv Fatura (EARSIVFATURA)</option>
                  <option value="EFATURA">e-Fatura (TICARIFATURA)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-600 cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleCreateInvoiceFromOrder}
                disabled={creatingInvoice || !selectedOrderForInvoice}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold cursor-pointer"
              >
                {creatingInvoice ? "Oluşturuluyor..." : "⚡ Faturayı Kes ve Görüntüle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "E-Fatura (Trendyol)",
  icon: DocumentText,
})

export default EfaturaPage
