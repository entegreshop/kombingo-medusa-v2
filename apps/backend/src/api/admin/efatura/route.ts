import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import * as crypto from "crypto"

export interface EfaturaConfig {
  provider?: "trendyol_efaturam"
  environment: "stage" | "prod" | "production"
  active: boolean
  email: string
  password: string
  companyId: string
  supplierVkn: string
  supplierName?: string
  supplierTitle?: string
  supplierTaxOffice: string
  supplierAddress: string
  supplierCity: string
  supplierDistrict: string
  supplierEmail: string
  supplierPhone: string
  supplierMersis?: string
  supplierTicaretSicil?: string
  earchivePrefix: string
  einvoicePrefix: string
  defaultVatRate: number
  autoSend?: boolean
  autoIssueOnOrderPaid?: boolean
  sendEmailToCustomer?: boolean
  storeWebUrl: string
  updatedAt?: string
}

export interface EfaturaInvoiceItem {
  title: string
  sku: string
  quantity: number
  unitPrice: number // KDV dahil birim fiyat (TL)
  netUnitPrice: number // KDV hariç birim fiyat (TL)
  vatRate: number
  vatAmount: number // Toplam KDV (TL)
  totalAmount: number // KDV dahil toplam (TL)
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
  status: "RESMILESTI" | "TASLAK" | "IPTAL" | "HATA"
  source: "TRENDYOL_API" | "YEREL_UBL"
  environment: "stage" | "prod" | "production"
  issueDate: string
  buyerName: string
  buyerIdentifier: string // VKN (10) veya TCKN (11)
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

export interface TrendyolAuthSession {
  token: string
  userId: string
  companyId: string
  taxId: string
  corporateName: string
}

export interface TrendyolCreditInfo {
  remainingCredit: number
  totalCredit: number
  usedCredit: number
  packageName: string
  remainingCredits: number
  totalCredits: number
  usedCredits: number
  packageTitle: string
  expiresAt?: string
  raw?: any
}

const DATA_DIR = path.join(process.cwd(), "data")
const UPLOADS_DIR = path.join(process.cwd(), "uploads")
const CONFIG_FILES = [
  path.join(UPLOADS_DIR, "efatura-settings.json"),
  path.join(DATA_DIR, "efatura-config.json"),
  path.join(os.tmpdir(), "bkm-medusa-efatura-settings.json"),
]
const INVOICES_FILES = [
  path.join(UPLOADS_DIR, "efatura-invoices.json"),
  path.join(DATA_DIR, "efatura-invoices.json"),
  path.join(os.tmpdir(), "bkm-medusa-efatura-invoices.json"),
]

const DEFAULT_CONFIG: EfaturaConfig = {
  provider: "trendyol_efaturam",
  environment: "production",
  active: true,
  email: process.env.TRENDYOL_EFATURA_EMAIL || "hakkisahin9@gmail.com",
  password: process.env.TRENDYOL_EFATURA_PASSWORD || "",
  companyId: process.env.TRENDYOL_EFATURA_COMPANY_ID || "94727",
  supplierVkn: process.env.TRENDYOL_EFATURA_VKN || "7050600355",
  supplierName:
    process.env.TRENDYOL_EFATURA_TITLE ||
    "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ",
  supplierTitle:
    process.env.TRENDYOL_EFATURA_TITLE ||
    "ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SANAYİ TİCARET LİMİTED ŞİRKETİ",
  supplierTaxOffice:
    process.env.TRENDYOL_EFATURA_TAX_OFFICE || "Güngören Vergi Dairesi Müdürlüğü",
  supplierAddress:
    process.env.TRENDYOL_EFATURA_ADDRESS ||
    "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL",
  supplierCity: process.env.TRENDYOL_EFATURA_CITY || "İstanbul",
  supplierDistrict: process.env.TRENDYOL_EFATURA_DISTRICT || "Güngören",
  supplierEmail: process.env.TRENDYOL_EFATURA_SUPPLIER_EMAIL || "hakkisahin9@gmail.com",
  supplierPhone: process.env.TRENDYOL_EFATURA_SUPPLIER_PHONE || "0532 337 00 81",
  supplierMersis: "0705060035500001",
  supplierTicaretSicil: "",
  earchivePrefix: "BKM",
  einvoicePrefix: "EFT",
  defaultVatRate: 20,
  autoSend: false,
  autoIssueOnOrderPaid: false,
  sendEmailToCustomer: true,
  storeWebUrl: "https://kombingo.com",
}

export function readEfaturaConfig(): EfaturaConfig {
  let merged: EfaturaConfig = { ...DEFAULT_CONFIG }
  for (const filePath of [...CONFIG_FILES].reverse()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(raw)
        merged = {
          ...merged,
          ...parsed,
          password: parsed.password || merged.password || "",
          email: parsed.email || merged.email || DEFAULT_CONFIG.email,
          companyId: parsed.companyId || merged.companyId || DEFAULT_CONFIG.companyId,
        }
      }
    } catch {}
  }
  return merged
}

export function writeEfaturaConfig(partial: Partial<EfaturaConfig>): EfaturaConfig {
  const current = readEfaturaConfig()
  const next: EfaturaConfig = {
    ...current,
    ...partial,
    password:
      partial.password !== undefined && partial.password !== ""
        ? partial.password
        : current.password,
    supplierName: partial.supplierName || partial.supplierTitle || current.supplierName,
    supplierTitle: partial.supplierTitle || partial.supplierName || current.supplierTitle,
    updatedAt: new Date().toISOString(),
  }
  for (const filePath of CONFIG_FILES) {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, JSON.stringify(next, null, 2), "utf-8")
    } catch {}
  }
  return next
}

export function readEfaturaInvoices(): EfaturaInvoiceRecord[] {
  for (const filePath of INVOICES_FILES) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8")
        const list = JSON.parse(raw)
        if (Array.isArray(list) && list.length > 0) {
          return list
        }
      }
    } catch {}
  }
  return []
}

export function writeEfaturaInvoices(list: EfaturaInvoiceRecord[]): EfaturaInvoiceRecord[] {
  for (const filePath of INVOICES_FILES) {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8")
    } catch {}
  }
  return list
}

export function saveEfaturaInvoice(record: EfaturaInvoiceRecord): EfaturaInvoiceRecord[] {
  const list = readEfaturaInvoices()
  const idx = list.findIndex(
    (x) =>
      x.id === record.id ||
      x.uuid === record.uuid ||
      (x.orderId === record.orderId && x.status !== "IPTAL")
  )
  if (idx >= 0) {
    list[idx] = record
  } else {
    list.unshift(record)
  }
  return writeEfaturaInvoices(list)
}

function getGatewayBaseUrl(env: "stage" | "prod" | "production") {
  return env === "stage"
    ? "https://stage-apigateway.trendyolefaturam.com"
    : "https://apigateway.trendyolecozum.com"
}

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const clean = token.replace(/^Bearer\s+/i, "").trim()
    const parts = clean.split(".")
    if (parts.length < 2) return {}
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "="
    )
    const jsonStr = Buffer.from(padded, "base64").toString("utf-8")
    return JSON.parse(jsonStr)
  } catch {
    return {}
  }
}

async function signInTrendyolEfatura(config: EfaturaConfig): Promise<TrendyolAuthSession> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const res = await fetch(`${baseUrl}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: config.email.trim(),
      password: config.password,
    }),
  })

  const headerToken =
    res.headers.get("x-access-token") ||
    res.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""

  const bodyData = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errMsg =
      bodyData?.detail ||
      bodyData?.message ||
      bodyData?.error ||
      bodyData?.title ||
      `Kimlik doğrulama başarısız (HTTP ${res.status})`
    throw new Error(errMsg)
  }

  const token =
    headerToken ||
    bodyData?.accessToken ||
    bodyData?.token ||
    bodyData?.jwt ||
    bodyData?.data?.accessToken ||
    ""

  if (!token) {
    throw new Error("Trendyol E-Faturam token bilgisi alınamadı.")
  }

  const jwtClaims = decodeJwtPayload(token)
  const userObj = jwtClaims?.user || bodyData?.user || {}
  const companiesArr = Array.isArray(userObj?.companies)
    ? userObj.companies
    : Array.isArray(bodyData?.companies)
    ? bodyData.companies
    : []

  const matchedCompany =
    companiesArr.find(
      (c: any) =>
        String(c?.taxId || c?.vkn || "") === String(config.supplierVkn || "").trim()
    ) ||
    companiesArr[0] ||
    {}

  const userId = String(
    bodyData?.userId ||
      bodyData?.id ||
      userObj?.id ||
      jwtClaims?.userId ||
      jwtClaims?.sub ||
      ""
  )

  const companyId = String(
    config.companyId?.trim() ||
      bodyData?.companyId ||
      bodyData?.corporateId ||
      matchedCompany?.id ||
      matchedCompany?.companyId ||
      userObj?.companyId ||
      jwtClaims?.companyId ||
      ""
  )

  const taxId = String(
    matchedCompany?.taxId ||
      matchedCompany?.vkn ||
      bodyData?.taxId ||
      config.supplierVkn ||
      ""
  )

  const corporateName = String(
    matchedCompany?.name ||
      matchedCompany?.title ||
      bodyData?.companyName ||
      config.supplierTitle ||
      ""
  )

  return {
    token,
    userId,
    companyId,
    taxId,
    corporateName,
  }
}

async function fetchTrendyolCredits(
  config: EfaturaConfig,
  session: TrendyolAuthSession
): Promise<TrendyolCreditInfo | null> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const vknToQuery = (session.taxId || config.supplierVkn || "").trim()
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": session.token,
    Authorization: `Bearer ${session.token}`,
  }

  if (vknToQuery) {
    try {
      const res = await fetch(
        `${baseUrl}/api/Credit/balance/${encodeURIComponent(vknToQuery)}?applicationCode=E_TRANSFORMATION`,
        {
          method: "GET",
          headers,
        }
      )
      if (res.ok) {
        const data = await res.json()
        const remaining = Number(
          data?.totalRemainingCredit ??
            data?.remainingCredit ??
            data?.balance ??
            data?.credit ??
            0
        )
        const total = Number(
          data?.totalCredit ?? data?.packageCredit ?? data?.initialCredit ?? remaining
        )
        const used = Number(data?.totalUsedCredit ?? Math.max(0, total - remaining))
        const pkgName =
          data?.packageName || data?.status || "Trendyol E-Dönüşüm Kontör Paketi"
        return {
          remainingCredit: remaining,
          totalCredit: total || remaining,
          usedCredit: used,
          packageName: pkgName,
          remainingCredits: remaining,
          totalCredits: total || remaining,
          usedCredits: used,
          packageTitle: pkgName,
          expiresAt: data?.expiryDate || data?.endDate || undefined,
          raw: data,
        }
      }
    } catch (e) {
      console.warn("[efatura] Credit/balance fetch error:", e)
    }
  }

  if (session.companyId) {
    try {
      const subRes = await fetch(
        `${baseUrl}/api/invoice/corporates/subscription/active-Hierarchy`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ companyId: Number(session.companyId) || session.companyId }),
        }
      )
      if (subRes.ok) {
        const subData = await subRes.json()
        const remaining = Number(
          subData?.remainingCredit ??
            subData?.totalRemainingCredit ??
            subData?.creditBalance ??
            0
        )
        const total = Number(subData?.totalCredit ?? subData?.limit ?? remaining)
        const pkgName = subData?.packageName || "Aktif Kontör Paketi"
        const used = Math.max(0, total - remaining)
        return {
          remainingCredit: remaining,
          totalCredit: total,
          usedCredit: used,
          packageName: pkgName,
          remainingCredits: remaining,
          totalCredits: total,
          usedCredits: used,
          packageTitle: pkgName,
          raw: subData,
        }
      }
    } catch {}
  }

  return null
}

function mapRemoteTrendyolDocToRecord(
  doc: any,
  docType: "EARSIV" | "EFATURA",
  config: EfaturaConfig
): EfaturaInvoiceRecord {
  const fromKurus = (val: any) => {
    const num = Number(val)
    if (!Number.isFinite(num)) return 0
    return Number((num / 100).toFixed(2))
  }

  const uuid = String(
    doc.invoiceUuid || doc.uuid || doc.documentUuid || doc.ettn || doc.id || crypto.randomUUID()
  )
  const invoiceNumber = String(
    doc.invoiceId || doc.invoiceNumber || doc.documentNumber || doc.id || uuid.slice(0, 16)
  )

  const totalAmount =
    doc.payableAmount !== undefined
      ? fromKurus(doc.payableAmount)
      : doc.taxInclusiveAmount !== undefined
      ? fromKurus(doc.taxInclusiveAmount)
      : doc.price !== undefined
      ? fromKurus(doc.price)
      : Number(doc.totalAmount || 0)

  const vatAmount =
    doc.taxAmount !== undefined ? fromKurus(doc.taxAmount) : Number(doc.vatAmount || 0)

  const netAmount =
    doc.taxExcludedPrice !== undefined
      ? fromKurus(doc.taxExcludedPrice)
      : Math.max(0, Number((totalAmount - vatAmount).toFixed(2)))

  const discountAmount =
    doc.discountAmount !== undefined ? fromKurus(doc.discountAmount) : 0

  const vatRate =
    netAmount > 0 ? Math.round((vatAmount / netAmount) * 100) : config.defaultVatRate || 20

  const buyerName =
    [
      doc.receiverTitle,
      doc.recipientTitle,
      [doc.receiverName || doc.recipientName, doc.receiverSurname || doc.recipientSurname]
        .filter(Boolean)
        .join(" "),
    ]
      .map((s) => (s || "").trim())
      .find((s) => s.length > 0) || "Müşteri"

  const buyerIdentifier = String(
    doc.receiverTaxId || doc.recipientTaxId || doc.taxId || "11111111111"
  )

  const statusRaw = String(doc.status ?? "")
  const isCancelled =
    statusRaw === "305" ||
    statusRaw.toUpperCase().includes("CANCEL") ||
    Boolean(doc.isCancelled || doc.cancelled)
  const isError =
    statusRaw === "29" ||
    statusRaw === "105" ||
    statusRaw === "405" ||
    statusRaw.toUpperCase().includes("ERROR") ||
    statusRaw.toUpperCase().includes("FAIL")

  const issueDate =
    doc.issuedAt || doc.issueDate || doc.createdAt || doc.createDate || new Date().toISOString()

  return {
    id: `ty_${doc.id || uuid}`,
    uuid,
    invoiceNumber,
    orderId: String(doc.localReferenceId || doc.orderId || doc.id || uuid),
    orderDisplayId: String(doc.localReferenceId || doc.orderId || invoiceNumber.slice(-6)),
    documentType: docType,
    invoiceScenario:
      doc.scenario || (docType === "EFATURA" ? "TICARIFATURA" : "EARSIVFATURA"),
    invoiceType: doc.invoiceTypeCode === "IADE" ? "IADE" : "SATIS",
    status: isCancelled ? "IPTAL" : isError ? "HATA" : "RESMILESTI",
    source: "TRENDYOL_API",
    environment: config.environment,
    issueDate,
    buyerName,
    buyerIdentifier,
    buyerTaxOffice: String(doc.receiverTaxOffice || doc.taxOffice || ""),
    buyerAddress: String(doc.receiverAddress || doc.address || "Türkiye"),
    buyerCity: String(doc.receiverCity || doc.city || "İstanbul"),
    buyerDistrict: String(doc.receiverDistrict || doc.district || "Merkez"),
    buyerEmail: String(doc.receiverEmail || doc.email || ""),
    buyerPhone: String(doc.receiverPhone || doc.phone || ""),
    currencyCode: String(doc.currency || "TRY"),
    subtotalAmount: totalAmount,
    vatRate,
    vatAmount,
    discountAmount,
    totalAmount,
    paymentMethod: "Kredi Kartı / Online",
    carrierName: "Anlaşmalı Kargo",
    storeWebUrl: config.storeWebUrl || "https://kombingo.com",
    items: [
      {
        title: `Fatura Kalemi (${invoiceNumber})`,
        sku: invoiceNumber,
        quantity: 1,
        unitPrice: totalAmount,
        netUnitPrice: netAmount,
        vatRate,
        vatAmount,
        totalAmount,
      },
    ],
    createdAt: doc.createdAt || issueDate,
  }
}

async function fetchTrendyolIssuedInvoices(
  config: EfaturaConfig,
  session: TrendyolAuthSession
): Promise<EfaturaInvoiceRecord[]> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": session.token,
    Authorization: `Bearer ${session.token}`,
    "Accept-Language": "tr-TR",
  }

  const companyIdNum = Number(session.companyId || config.companyId) || undefined
  const results: EfaturaInvoiceRecord[] = []

  const searchPayload: Record<string, any> = {
    pagination: {
      page: 0,
      size: 100,
      sort: ["createdAt,desc"],
    },
  }
  if (companyIdNum) {
    searchPayload.companyId = companyIdNum
  }

  // 1. Search E-Archive Invoices (/api/invoice/documents/earchive/search)
  try {
    const eaRes = await fetch(`${baseUrl}/api/invoice/documents/earchive/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchPayload),
    })
    if (eaRes.ok) {
      const eaData = await eaRes.json()
      const list = Array.isArray(eaData)
        ? eaData
        : Array.isArray(eaData?.content)
        ? eaData.content
        : Array.isArray(eaData?.data)
        ? eaData.data
        : []
      for (const doc of list) {
        results.push(mapRemoteTrendyolDocToRecord(doc, "EARSIV", config))
      }
    }
  } catch (e) {
    console.warn("[efatura] earchive/search warning:", e)
  }

  // 2. Search Outgoing E-Invoices (/api/invoice/documents/outgoing-einvoice/search)
  try {
    const eiRes = await fetch(`${baseUrl}/api/invoice/documents/outgoing-einvoice/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(searchPayload),
    })
    if (eiRes.ok) {
      const eiData = await eiRes.json()
      const list = Array.isArray(eiData)
        ? eiData
        : Array.isArray(eiData?.content)
        ? eiData.content
        : Array.isArray(eiData?.data)
        ? eiData.data
        : []
      for (const doc of list) {
        results.push(mapRemoteTrendyolDocToRecord(doc, "EFATURA", config))
      }
    }
  } catch (e) {
    console.warn("[efatura] outgoing-einvoice/search warning:", e)
  }

  return results
}

async function checkTrendyolTaxpayer(
  config: EfaturaConfig,
  session: TrendyolAuthSession,
  taxId: string
): Promise<{ isEinvoiceMukellef: boolean; alias?: string; title?: string }> {
  const cleanTaxId = (taxId || "").replace(/[^0-9]/g, "")
  if (
    (cleanTaxId.length !== 10 && cleanTaxId.length !== 11) ||
    /^1+$/.test(cleanTaxId)
  ) {
    return { isEinvoiceMukellef: false }
  }

  const baseUrl = getGatewayBaseUrl(config.environment)
  try {
    const res = await fetch(
      `${baseUrl}/api/invoice/taxpayers/${encodeURIComponent(cleanTaxId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-access-token": session.token,
          Authorization: `Bearer ${session.token}`,
        },
      }
    )
    if (!res.ok) {
      return { isEinvoiceMukellef: false }
    }
    const list = await res.json().catch(() => [])
    if (!Array.isArray(list) || list.length === 0) {
      return { isEinvoiceMukellef: false }
    }
    const invoiceEntry =
      list.find((x: any) => x?.aliasType === "INVOICE" && x?.alias) ||
      list.find((x: any) => Boolean(x?.alias))
    if (invoiceEntry?.alias) {
      return {
        isEinvoiceMukellef: true,
        alias: String(invoiceEntry.alias),
        title: invoiceEntry.title ? String(invoiceEntry.title) : undefined,
      }
    }
  } catch (e) {
    console.warn("[efatura] taxpayer check warning:", e)
  }
  return { isEinvoiceMukellef: false }
}

async function resolveTrendyolPrefix(
  config: EfaturaConfig,
  session: TrendyolAuthSession,
  docType: "EARSIV" | "EFATURA"
): Promise<string | undefined> {
  const companyIdNum = Number(session.companyId || config.companyId)
  if (!companyIdNum) return undefined

  const baseUrl = getGatewayBaseUrl(config.environment)
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": session.token,
    Authorization: `Bearer ${session.token}`,
  }
  const trendyolDocType = docType === "EFATURA" ? "EINVOICE" : "EARCHIVE"
  const desiredPrefix = (
    docType === "EFATURA" ? config.einvoicePrefix : config.earchivePrefix
  )
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3)
    .padEnd(3, "A")

  try {
    const res = await fetch(`${baseUrl}/api/invoice/corporates/prefixes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ companyId: companyIdNum }),
    })
    if (res.ok) {
      const prefixes = await res.json().catch(() => [])
      if (Array.isArray(prefixes) && prefixes.length > 0) {
        const matchingDocType = prefixes.filter(
          (p: any) => p?.documentType === trendyolDocType && p?.prefix
        )
        const portalDefault = matchingDocType.find(
          (p: any) => p?.source === "PORTAL" && p?.isDefaultPrefix
        )
        const anyDefault = matchingDocType.find((p: any) => p?.isDefaultPrefix)
        const portalAny = matchingDocType.find((p: any) => p?.source === "PORTAL")
        const chosen = portalDefault || anyDefault || portalAny || matchingDocType[0]
        if (chosen?.prefix) {
          return String(chosen.prefix)
        }
      }
    }

    // Eğer şirketin bu belge türü için kayıtlı ön-eki yoksa otomatik tanımlamayı dene
    if (desiredPrefix && /^[A-Z0-9]{3}$/.test(desiredPrefix)) {
      const addRes = await fetch(`${baseUrl}/api/invoice/corporates/prefixes/add-prefix`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          companyId: companyIdNum,
          documentType: trendyolDocType,
          prefix: desiredPrefix,
          isDefaultPrefix: true,
        }),
      })
      if (addRes.ok) {
        return desiredPrefix
      }
    }
  } catch (e) {
    console.warn("[efatura] resolveTrendyolPrefix warning:", e)
  }

  return undefined
}

function sanitizePersonOrCompanyName(raw: string): string {
  const cleaned = (raw || "")
    .replace(/[^a-zA-Z0-9ığüşöçĞÜŞÖÇİ\s.,\-']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  const forbidden = [
    "nihai",
    "tüketici",
    "nihai tüketici",
    "nihaitüketici",
    "tuketici",
    "nihai tuketici",
  ]
  if (!cleaned || forbidden.includes(cleaned.toLocaleLowerCase("tr-TR"))) {
    return "Sayın Müşteri"
  }
  return cleaned
}

function parseRecipientNames(
  buyerName: string,
  taxId: string
): { name: string; surname?: string } {
  const cleanFull = sanitizePersonOrCompanyName(buyerName)
  const isTckn = taxId.length === 11

  if (!isTckn) {
    // 10 haneli VKN (Kurumsal): surname gönderilmez, name = ünvan
    return {
      name: cleanFull.length >= 2 ? cleanFull.slice(0, 127) : `${cleanFull} Ltd. Şti.`,
    }
  }

  // 11 haneli TCKN (Bireysel): hem name (min 2) hem surname (min 2) zorunlu
  const parts = cleanFull.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0]
    const rest = parts.slice(1).join(" ")
    return {
      name: first.length >= 2 ? first.slice(0, 127) : `${first} Bey`,
      surname: rest.length >= 2 ? rest.slice(0, 127) : "Müşteri",
    }
  }

  return {
    name: cleanFull.length >= 2 ? cleanFull.slice(0, 127) : "Sayın",
    surname: "Müşteri",
  }
}

async function createInvoiceOnTrendyol(
  record: EfaturaInvoiceRecord,
  config: EfaturaConfig,
  session: TrendyolAuthSession,
  targetAlias?: string,
  resolvedPrefix?: string
): Promise<{ uuid: string; invoiceNumber: string; rawResponse: any }> {
  const baseUrl = getGatewayBaseUrl(config.environment)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "tr-TR",
    "x-access-token": session.token,
    Authorization: `Bearer ${session.token}`,
  }

  const { name: recipientName, surname: recipientSurname } = parseRecipientNames(
    record.buyerName,
    record.buyerIdentifier
  )

  const cleanPhone = (record.buyerPhone || "").replace(/[^0-9]/g, "").slice(-10)
  const validPhone = cleanPhone.length >= 7 ? cleanPhone : undefined
  const rawEmail = (record.buyerEmail || "").trim().toLowerCase()
  const sellerEmails = [
    (config.email || "").trim().toLowerCase(),
    (config.supplierEmail || "").trim().toLowerCase(),
  ].filter(Boolean)
  // Trendyol E-Faturam Kuralı: Alıcı ve satıcı e-posta adresi aynı olamaz (receiver-and-sender-emails-are-same)
  const validEmail =
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(rawEmail) &&
    !sellerEmails.includes(rawEmail)
      ? rawEmail
      : undefined

  const cityClean = (record.buyerCity || "İstanbul").trim()
  const districtClean = (record.buyerDistrict || "Merkez").trim()
  const addressClean = (record.buyerAddress || "Merkez Mah.").trim().slice(0, 250)

  const issueDateObj = record.issueDate ? new Date(record.issueDate) : new Date()
  const issueIsoStr = issueDateObj.toISOString()
  const issueDateOnly = issueIsoStr.slice(0, 10) // YYYY-MM-DD (format: "date")

  const payMethodLower = (record.paymentMethod || "").toLocaleLowerCase("tr-TR")
  let paymentMeansEnum: "CREDIT_CARD" | "EFT" | "ON_DELIVERY" | "MEDIATOR" | "OTHER" = "CREDIT_CARD"
  let paymentTypeStr = "KREDIKARTI/BANKAKARTI"
  let paymentAgentStr = "IYZICO"
  if (payMethodLower.includes("havale") || payMethodLower.includes("eft")) {
    paymentMeansEnum = "EFT"
    paymentTypeStr = "EFT/HAVALE"
    paymentAgentStr = "BANKA"
  } else if (payMethodLower.includes("kapıda") || payMethodLower.includes("kapida")) {
    paymentMeansEnum = "ON_DELIVERY"
    paymentTypeStr = "KAPIDAODEME"
    paymentAgentStr = "KARGO"
  }

  // 1 Temmuz 2024 GİB / Trendyol E-Faturam kuralı: İnternet satış e-Arşiv faturalarında paymentInfo ve deliveryInfo zorunludur.
  // Taşıyıcı VKN (Mod-10 geçerli 10 haneli VKN): Yurtiçi Kargo (9860008925), Aras Kargo (0720039666), MNG (6080712084), PTT (7320068060)
  const carrierLower = (record.carrierName || "").toLocaleLowerCase("tr-TR")
  let carrierTaxId = "9860008925" // Yurtiçi Kargo Servisi A.Ş.
  let carrierOfficialName = record.carrierName || "Yurtiçi Kargo Servisi A.Ş."
  if (carrierLower.includes("aras")) {
    carrierTaxId = "0720039666"
    carrierOfficialName = "Aras Kargo Yurt İçi Yurt Dışı Taşımacılık A.Ş."
  } else if (carrierLower.includes("mng") || carrierLower.includes("dhl")) {
    carrierTaxId = "6080712084"
    carrierOfficialName = "MNG Kargo Yurtiçi ve Yurtdışı Taşımacılık A.Ş."
  } else if (carrierLower.includes("ptt")) {
    carrierTaxId = "7320068060"
    carrierOfficialName = "Posta ve Telgraf Teşkilatı A.Ş."
  }

  const purchaseUrlClean = (
    record.storeWebUrl ||
    config.storeWebUrl ||
    "https://kombingo.com"
  )
    .trim()
    .slice(0, 255)

  const notes = [
    `Sipariş No: #${record.orderDisplayId}`,
    `Ödeme Yöntemi: ${record.paymentMethod}`,
    `Mağaza: ${purchaseUrlClean}`,
  ]

  const errors: string[] = []

  // --- YÖNTEM 1: Resmi OpenAPI V1 (/api/invoice/documents/earchive & outgoing-einvoice) ---
  try {
    const toKurus = (tl: number) => Math.round((Number(tl) || 0) * 100)

    // Önce V1 calculate-invoice ile Trendyol'un kendi kuruş hesaplamasını almayı dene
    let v1InvoiceLines: any[] = []
    let v1TotalTaxAmountKurus = 0
    let v1TotalTaxableAmountKurus = 0
    let v1SubtotalKurus = 0
    let v1PayableKurus = 0
    let v1DiscountKurus = 0

    const calcV1Req = {
      invoiceLineCalculationRequest: record.items.map((item) => ({
        itemName:
          item.title && item.title.trim().length >= 2 ? item.title.trim() : "Oto Aksesuar Ürünü",
        quantity: item.quantity,
        kdvTaxRate: item.vatRate,
        unitPrice: Number(item.netUnitPrice.toFixed(4)),
        discount: 0,
        taxType: "KDV",
      })),
      invoiceTypeCode: "SATIS",
      scenario: record.invoiceScenario,
    }

    const calcV1Res = await fetch(`${baseUrl}/api/invoice/documents/calculate-invoice`, {
      method: "POST",
      headers,
      body: JSON.stringify(calcV1Req),
    })

    if (calcV1Res.ok) {
      const calcV1Data = await calcV1Res.json()
      if (Array.isArray(calcV1Data?.invoiceLines) && calcV1Data.invoiceLines.length > 0) {
        v1InvoiceLines = calcV1Data.invoiceLines.map((cl: any, idx: number) => {
          const origItem = record.items[idx] || record.items[0]
          const lineVatKurus = Math.round(Number(cl.kdvTaxAmount ?? cl.taxAmount ?? 0))
          const lineTaxableKurus = Math.round(
            Number(cl.kdvTaxableAmount ?? cl.taxableAmount ?? cl.rawPrice ?? 0)
          )
          const lineTotalKurus = Math.round(
            Number(cl.totalAmount ?? lineTaxableKurus + lineVatKurus)
          )
          const lineUnitKurus = Number(cl.unitPrice ?? toKurus(origItem.netUnitPrice))
          const lineVatRate = Number(cl.kdvTaxRate ?? origItem.vatRate ?? 20)

          return {
            unitCode: "C62",
            quantity: Number(cl.quantity ?? origItem.quantity ?? 1),
            itemName: cl.itemName || origItem.title || "Ürün",
            unitPriceAmount: lineUnitKurus,
            totalAmount: lineTotalKurus,
            taxableAmount: lineTaxableKurus,
            taxAmount: lineVatKurus,
            kdvTaxAmount: lineVatKurus,
            taxPercent: lineVatRate,
            taxName: "KDV",
            totalDiscountAmount: Math.round(Number(cl.discount ?? 0)),
            totalTax: {
              totalTaxAmount: lineVatKurus,
              subTotalTaxes: [
                {
                  taxAmount: lineVatKurus,
                  taxableAmount: lineTaxableKurus,
                  percent: lineVatRate,
                  taxType: "KDV",
                  name: "KDV",
                },
              ],
            },
          }
        })
        v1SubtotalKurus = Math.round(
          Number(calcV1Data.totalRawPrice ?? calcV1Data.totalTaxableAmount ?? 0)
        )
        v1TotalTaxableAmountKurus = Math.round(
          Number(calcV1Data.totalTaxableAmount ?? calcV1Data.totalRawPrice ?? 0)
        )
        v1TotalTaxAmountKurus = Math.round(Number(calcV1Data.totalTaxAmount ?? 0))
        v1PayableKurus = Math.round(
          Number(calcV1Data.payableAmount ?? calcV1Data.totalAmount ?? 0)
        )
        v1DiscountKurus = Math.round(Number(calcV1Data.totalDiscount ?? 0))
      }
    }

    // Eğer calculate-invoice yanıt vermediyse birebir tam kuruş toplamlarıyla oluştur
    if (v1InvoiceLines.length === 0) {
      v1InvoiceLines = record.items.map((item) => {
        const lineGrossKurus = toKurus(item.totalAmount)
        const lineNetKurus = Math.round(lineGrossKurus / (1 + item.vatRate / 100))
        const lineVatKurus = lineGrossKurus - lineNetKurus
        const unitNetKurus = Number((lineNetKurus / item.quantity).toFixed(2))

        v1SubtotalKurus += lineNetKurus
        v1TotalTaxableAmountKurus += lineNetKurus
        v1TotalTaxAmountKurus += lineVatKurus
        v1PayableKurus += lineGrossKurus

        return {
          unitCode: "C62",
          quantity: item.quantity,
          itemName:
            item.title && item.title.trim().length >= 2 ? item.title.trim() : "Oto Aksesuar Ürünü",
          unitPriceAmount: unitNetKurus,
          totalAmount: lineGrossKurus,
          taxableAmount: lineNetKurus,
          taxAmount: lineVatKurus,
          kdvTaxAmount: lineVatKurus,
          taxPercent: item.vatRate,
          taxName: "KDV",
          totalDiscountAmount: 0,
          totalTax: {
            totalTaxAmount: lineVatKurus,
            subTotalTaxes: [
              {
                taxAmount: lineVatKurus,
                taxableAmount: lineNetKurus,
                percent: item.vatRate,
                taxType: "KDV",
                name: "KDV",
              },
            ],
          },
        }
      })
    }

    const recipientInfoObj: Record<string, any> = {
      countryCode: "TR",
      city: cityClean.length >= 2 ? cityClean : "İstanbul",
      district: districtClean.length >= 1 ? districtClean : "Merkez",
      address: addressClean.length >= 2 ? addressClean : "Merkez Mah.",
      taxId: record.buyerIdentifier,
      name: recipientName,
      ...(recipientSurname ? { surname: recipientSurname } : {}),
      ...(validPhone ? { phone: validPhone } : {}),
      ...(validEmail ? { email: validEmail } : {}),
      ...(record.documentType === "EFATURA" || (record.buyerTaxOffice && record.buyerTaxOffice.length >= 2)
        ? { taxOffice: (record.buyerTaxOffice && record.buyerTaxOffice.length >= 2 ? record.buyerTaxOffice : "Merkez") }
        : {}),
    }

    const v1Payload: Record<string, any> = {
      userId: Number(session.userId) || undefined,
      companyId: Number(session.companyId || config.companyId) || undefined,
      autoInvoiceId: true,
      ...(record.documentType === "EFATURA" && targetAlias ? { targetAlias } : {}),
      source: "PORTAL",
      localReferenceId: String(record.orderDisplayId),
      ...(resolvedPrefix ? { prefix: resolvedPrefix } : {}),
      issuedAt: issueIsoStr,
      notes,
      recipientInfo: recipientInfoObj,
      invoiceInfo: {
        invoiceType: record.invoiceScenario,
        invoiceTypeCode: "SATIS",
      },
      invoiceLines: v1InvoiceLines,
      totalTax: {
        totalTaxAmount: v1TotalTaxAmountKurus,
        subTotalTaxes: [
          {
            taxableAmount: v1TotalTaxableAmountKurus,
            taxAmount: v1TotalTaxAmountKurus,
            percent: record.vatRate,
            taxType: "KDV",
            name: "KDV",
          },
        ],
      },
      invoiceTotal: {
        lineExtensionAmount: v1SubtotalKurus,
        taxExclusiveAmount: v1SubtotalKurus,
        taxInclusiveAmount: v1PayableKurus,
        allowanceTotalAmount: v1DiscountKurus,
        payableAmount: v1PayableKurus,
      },
      currencyInfo: {
        currency: "TRY",
        hasExchange: false,
        calculationRate: 0,
        sourceCurrency: "TRY",
        targetCurrency: "TRY",
      },
      orderInfo: {
        orderId: String(record.orderDisplayId),
        orderDate: issueDateOnly,
      },
      ...(record.documentType === "EARSIV"
        ? {
            paymentInfo: {
              purchaseUrl: purchaseUrlClean,
              paymentMeans: paymentMeansEnum,
              paymentType: paymentTypeStr,
              paymentAgentName: paymentAgentStr,
              paymentDate: issueIsoStr,
              instructionNote: `Sipariş #${record.orderDisplayId} İnternet Satışı`,
            },
            deliveryInfo: {
              carrierTaxId,
              carrierName: carrierOfficialName,
              sentAt: issueDateOnly,
            },
          }
        : {}),
    }

    const v1Endpoint =
      record.documentType === "EFATURA"
        ? `${baseUrl}/api/invoice/documents/outgoing-einvoice`
        : `${baseUrl}/api/invoice/documents/earchive`

    let v1Res = await fetch(v1Endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(v1Payload),
    })
    let v1Data = await v1Res.json().catch(() => null)

    // Eğer ön-ek (prefix) sistemde bulunamadı hatası dönerse prefix olmadan varsayılan seriyle tekrar dene
    if (!v1Res.ok && v1Payload.prefix) {
      const { prefix: _omitted, ...v1PayloadNoPrefix } = v1Payload
      v1Res = await fetch(v1Endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(v1PayloadNoPrefix),
      })
      v1Data = await v1Res.json().catch(() => null)
    }

    // Eğer e-Arşiv internet satış alanları olmadan düz e-Arşiv bekliyorsa fallback dene
    if (!v1Res.ok && v1Payload.paymentInfo) {
      const {
        prefix: _omittedPfx,
        paymentInfo: _omittedPay,
        deliveryInfo: _omittedDel,
        ...v1MinimalPayload
      } = v1Payload
      const retryRes = await fetch(v1Endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(v1MinimalPayload),
      })
      if (retryRes.ok) {
        v1Res = retryRes
        v1Data = await retryRes.json().catch(() => null)
      }
    }

    if (v1Res.ok) {
      const uuid =
        v1Data?.invoiceUuid ||
        v1Data?.uuid ||
        v1Data?.data?.invoiceUuid ||
        record.uuid
      const invoiceNumber =
        v1Data?.invoiceId ||
        v1Data?.invoiceNumber ||
        v1Data?.data?.invoiceId ||
        ""
      return { uuid, invoiceNumber, rawResponse: v1Data }
    } else {
      const errDetail =
        v1Data?.detail ||
        v1Data?.title ||
        v1Data?.message ||
        v1Data?.error ||
        JSON.stringify(v1Data) ||
        `HTTP ${v1Res.status}`
      errors.push(`V1 (${v1Res.status}): ${errDetail}`)
    }
  } catch (e: any) {
    errors.push(`V1 Exception: ${e?.message || String(e)}`)
  }

  // --- YÖNTEM 2: V2 Hesaplama (/api/calculation/invoice-calculation) + V2 Oluşturma ---
  try {
    const calcV2Req = {
      invoiceTypeCode: "SATIS",
      scenario: record.invoiceScenario,
      lines: record.items.map((item, idx) => ({
        itemId: String(idx),
        itemName:
          item.title && item.title.trim().length >= 2 ? item.title.trim() : "Oto Aksesuar Ürünü",
        quantity: item.quantity,
        totalLineAmount: Number(item.totalAmount.toFixed(2)),
        taxes: [
          {
            type: "KDV",
            rate: item.vatRate,
          },
        ],
      })),
    }

    const calcV2Res = await fetch(`${baseUrl}/api/calculation/invoice-calculation`, {
      method: "POST",
      headers,
      body: JSON.stringify(calcV2Req),
    })

    if (calcV2Res.ok) {
      const calcV2 = await calcV2Res.json()
      const v2Payload: Record<string, any> = {
        source: "PORTAL",
        localReferenceId: String(record.orderDisplayId),
        ...(resolvedPrefix ? { prefix: resolvedPrefix } : {}),
        notes,
        receiverInfo: {
          taxId: record.buyerIdentifier,
          name: recipientName,
          ...(recipientSurname ? { surname: recipientSurname } : {}),
          countryCode: "TR",
          city: cityClean.length >= 2 ? cityClean : "İstanbul",
          district: districtClean.length >= 1 ? districtClean : "Merkez",
          address: addressClean.length >= 2 ? addressClean : "Merkez Mah.",
          ...(record.documentType === "EFATURA"
            ? { taxOffice: record.buyerTaxOffice || "Merkez" }
            : {}),
          ...(validEmail ? { email: validEmail } : {}),
          ...(validPhone ? { phone: validPhone } : {}),
        },
        invoiceIdentification: {
          invoiceType: record.invoiceScenario,
          invoiceTypeCode: "SATIS",
          autoInvoiceId: true,
        },
        invoiceLines: (calcV2?.lines || []).map((line: any, idx: number) => {
          const origItem = record.items[idx] || record.items[0]
          return {
            itemName: line.itemName || origItem.title || "Ürün",
            unitCode: "C62",
            unitPriceAmount: line.unitPrice,
            quantity: line.quantity,
            subtotal: line.subtotal,
            totalAmount: line.totalAmount,
            totalDiscountAmount: line.discountAmount || 0,
            totalTax: {
              totalTaxAmount: line.totalTax,
              subTotalTaxes: (line.taxes || []).map((tx: any) => ({
                taxableAmount: tx.taxableBase,
                taxAmount: tx.amount,
                taxType: tx.type || "KDV",
                percent: tx.rate ?? origItem.vatRate,
              })),
            },
          }
        }),
        totalTax: {
          totalTaxAmount: calcV2?.totalTaxAmount ?? 0,
          subTotalTaxes: (calcV2?.taxGroups || []).map((tg: any) => ({
            taxableAmount: tg.taxableBase,
            taxAmount: tg.amount,
            taxType: tg.type || "KDV",
            percent: tg.rate ?? record.vatRate,
          })),
        },
        invoiceTotal: {
          totalRawPrice: calcV2?.totalRawPrice ?? 0,
          totalSubtotal: calcV2?.totalSubtotal ?? 0,
          totalAmount: calcV2?.totalAmount ?? 0,
          totalDiscountAmount: calcV2?.totalDiscount ?? 0,
          payableAmount: calcV2?.payableAmount ?? 0,
        },
        currencyInfo: {
          currency: "TRY",
          hasExchange: false,
          sourceCurrency: "TRY",
          targetCurrency: "TRY",
          calculationRate: 0,
        },
        orderInfo: {
          orderId: String(record.orderDisplayId),
          orderDate: issueDateOnly,
        },
        ...(record.documentType === "EARSIV"
          ? {
              paymentInfo: {
                purchaseUrl: purchaseUrlClean,
                paymentMeans: paymentMeansEnum,
                paymentType: paymentTypeStr,
                paymentAgentName: paymentAgentStr,
                paymentDate: issueDateOnly,
                instructionNote: `Sipariş #${record.orderDisplayId} İnternet Satışı`,
              },
              deliveryInfo: {
                carrierTaxId,
                carrierName: carrierOfficialName,
                sentAt: issueDateOnly,
              },
            }
          : {}),
        bankInfo: [],
        ...(record.documentType === "EFATURA" ? { targetAlias: targetAlias || "" } : {}),
      }

      const v2Endpoint =
        record.documentType === "EFATURA"
          ? `${baseUrl}/api/invoice/v2/documents/outgoing-einvoice`
          : `${baseUrl}/api/invoice/v2/documents/earchive`

      let v2Res = await fetch(v2Endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(v2Payload),
      })
      let v2Data = await v2Res.json().catch(() => null)

      if (!v2Res.ok && v2Payload.prefix) {
        const { prefix: _omitted, ...v2PayloadNoPrefix } = v2Payload
        v2Res = await fetch(v2Endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(v2PayloadNoPrefix),
        })
        v2Data = await v2Res.json().catch(() => null)
      }

      if (!v2Res.ok && v2Payload.paymentInfo) {
        const {
          prefix: _omittedPfx,
          paymentInfo: _omittedPay,
          deliveryInfo: _omittedDel,
          ...v2MinimalPayload
        } = v2Payload
        const retryRes = await fetch(v2Endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(v2MinimalPayload),
        })
        if (retryRes.ok) {
          v2Res = retryRes
          v2Data = await retryRes.json().catch(() => null)
        }
      }

      if (v2Res.ok) {
        const uuid =
          v2Data?.invoiceUuid ||
          v2Data?.uuid ||
          v2Data?.data?.invoiceUuid ||
          record.uuid
        const invoiceNumber =
          v2Data?.invoiceId ||
          v2Data?.invoiceNumber ||
          v2Data?.data?.invoiceId ||
          ""
        return { uuid, invoiceNumber, rawResponse: v2Data }
      } else {
        const errDetail =
          v2Data?.detail ||
          v2Data?.title ||
          v2Data?.message ||
          v2Data?.error ||
          JSON.stringify(v2Data) ||
          `HTTP ${v2Res.status}`
        errors.push(`V2 (${v2Res.status}): ${errDetail}`)
      }
    } else {
      const calcErr = await calcV2Res.text().catch(() => "")
      errors.push(`V2 Calc (${calcV2Res.status}): ${calcErr.slice(0, 200)}`)
    }
  } catch (e: any) {
    errors.push(`V2 Exception: ${e?.message || String(e)}`)
  }

  throw new Error(
    `Trendyol E-Faturam fatura oluşturmayı reddetti: ${errors.join(" | ")}`
  )
}

function generateSequentialInvoiceNumber(
  prefix: string,
  existingInvoices: EfaturaInvoiceRecord[]
): string {
  const cleanPrefix = (prefix || "BKM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3)
    .padEnd(3, "A")
  const year = new Date().getFullYear().toString()
  const prefixWithYear = `${cleanPrefix}${year}`

  let maxSeq = 0
  for (const inv of existingInvoices) {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefixWithYear)) {
      const seqPart = parseInt(inv.invoiceNumber.slice(prefixWithYear.length), 10)
      if (!isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart
      }
    }
  }

  const nextSeq = (maxSeq + 1).toString().padStart(9, "0")
  return `${prefixWithYear}${nextSeq}`
}

function mergeRemoteAndLocalInvoices(
  remoteList: EfaturaInvoiceRecord[],
  localList: EfaturaInvoiceRecord[],
  purgeFakeLocalWhenActive: boolean
): EfaturaInvoiceRecord[] {
  const filteredLocal = purgeFakeLocalWhenActive
    ? localList.filter((loc) => loc.source === "TRENDYOL_API")
    : localList

  if (purgeFakeLocalWhenActive && filteredLocal.length !== localList.length) {
    writeEfaturaInvoices(filteredLocal)
  }

  const byKey = new Map<string, EfaturaInvoiceRecord>()
  for (const loc of filteredLocal) {
    byKey.set(loc.uuid || loc.invoiceNumber, loc)
  }
  for (const rem of remoteList) {
    const existing =
      byKey.get(rem.uuid) ||
      Array.from(byKey.values()).find(
        (x) =>
          x.invoiceNumber === rem.invoiceNumber ||
          (rem.orderDisplayId && x.orderDisplayId === rem.orderDisplayId)
      )
    if (existing) {
      byKey.set(existing.uuid || existing.invoiceNumber, {
        ...existing,
        ...rem,
        orderId: existing.orderId || rem.orderId,
        orderDisplayId: existing.orderDisplayId || rem.orderDisplayId,
        items: existing.items?.length ? existing.items : rem.items,
      })
    } else {
      byKey.set(rem.uuid || rem.invoiceNumber, rem)
    }
  }
  const merged = Array.from(byKey.values()).sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  )
  writeEfaturaInvoices(merged)
  return merged
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  let config = readEfaturaConfig()
  let invoices = readEfaturaInvoices()
  let creditInfo: TrendyolCreditInfo | null = null
  let sessionInfo: Partial<TrendyolAuthSession> | null = null

  if (config.active && config.email && config.password) {
    try {
      const session = await signInTrendyolEfatura(config)
      sessionInfo = {
        userId: session.userId,
        companyId: session.companyId,
        taxId: session.taxId,
        corporateName: session.corporateName,
      }
      if (session.companyId && !config.companyId) {
        config = writeEfaturaConfig({ ...config, companyId: session.companyId })
      }
      const [credits, remoteInvoices] = await Promise.all([
        fetchTrendyolCredits(config, session),
        fetchTrendyolIssuedInvoices(config, session),
      ])
      creditInfo = credits
      invoices = mergeRemoteAndLocalInvoices(remoteInvoices, invoices, true)
    } catch (e: any) {
      console.warn("[efatura GET] Remote sync warning:", e?.message)
    }
  }

  res.json({ config, invoices, creditInfo, sessionInfo })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as any) || {}
    const action = body.action || "create"
    let config = readEfaturaConfig()

    // 1. Bağlantı Testi + Kontör & Fatura Senkronizasyonu
    if (action === "test" || action === "sync") {
      const testConfig: EfaturaConfig = {
        ...config,
        ...(body.config || {}),
      }
      if (!testConfig.email || !testConfig.password) {
        return res.status(400).json({
          success: false,
          error: "Trendyol E-Faturam e-posta (kullanıcı adı) ve şifre alanları zorunludur.",
        })
      }

      try {
        const session = await signInTrendyolEfatura(testConfig)
        if (session.companyId) {
          config = writeEfaturaConfig({ ...testConfig, companyId: session.companyId })
        } else {
          config = writeEfaturaConfig(testConfig)
        }

        const [creditInfo, remoteInvoices] = await Promise.all([
          fetchTrendyolCredits(config, session),
          fetchTrendyolIssuedInvoices(config, session),
        ])

        const localInvoices = readEfaturaInvoices()
        const mergedInvoices = mergeRemoteAndLocalInvoices(
          remoteInvoices,
          localInvoices,
          Boolean(config.active)
        )

        return res.json({
          success: true,
          message: `Trendyol E-Faturam (${
            config.environment === "stage" ? "Test Ortamı" : "Canlı Ortam"
          }) bağlantısı başarılı!`,
          gatewayUrl: getGatewayBaseUrl(config.environment),
          companyId: session.companyId || config.companyId || "-",
          userId: session.userId || "-",
          taxId: session.taxId || config.supplierVkn,
          creditInfo,
          invoices: mergedInvoices,
          config,
        })
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: err?.message || "Trendyol E-Faturam API bağlantısı kurulamadı.",
          gatewayUrl: getGatewayBaseUrl(testConfig.environment),
        })
      }
    }

    // 2. Resmi Trendyol E-Faturam PDF / HTML İndirme Linki
    if (action === "download") {
      const uuid = body.uuid || body.invoiceUuid
      const docType = body.documentType === "EFATURA" ? "EINVOICE" : "EARCHIVE"
      const ext = body.fileExtension || "pdf"
      if (!uuid || !config.email || !config.password) {
        return res.status(400).json({ error: "Fatura UUID veya API bilgileri eksik." })
      }
      const session = await signInTrendyolEfatura(config)
      const baseUrl = getGatewayBaseUrl(config.environment)
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": session.token,
        Authorization: `Bearer ${session.token}`,
      }
      for (const pathUrl of [
        "/api/invoice/documents/download/permanent-url",
        "/api/invoice/documents/download",
      ]) {
        const dlRes = await fetch(`${baseUrl}${pathUrl}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            documentType: docType,
            fileExtension: ext,
            documentUuid: uuid,
            invoiceUuid: uuid,
            companyId: Number(session.companyId || config.companyId) || undefined,
          }),
        })
        if (dlRes.ok) {
          const dlData = await dlRes.json().catch(() => null)
          const downloadUrl =
            typeof dlData === "string"
              ? dlData
              : dlData?.url || dlData?.downloadUrl || dlData?.data
          if (downloadUrl) {
            return res.json({ success: true, downloadUrl })
          }
        }
      }
      return res.status(404).json({ error: "Resmi indirme bağlantısı alınamadı." })
    }

    // 3. Fatura Durum Sorgulama (getEArchiveStatus / getOutgoingEInvoiceStatus)
    if (action === "status") {
      const uuid = body.uuid || body.invoiceUuid
      const docType = body.documentType === "EFATURA" ? "EFATURA" : "EARSIV"
      if (!uuid || !config.email || !config.password) {
        return res.status(400).json({ error: "Fatura UUID veya API bilgileri eksik." })
      }
      const session = await signInTrendyolEfatura(config)
      const baseUrl = getGatewayBaseUrl(config.environment)
      const statusEndpoint =
        docType === "EFATURA"
          ? `${baseUrl}/api/invoice/documents/outgoing-einvoice/status/${encodeURIComponent(uuid)}`
          : `${baseUrl}/api/invoice/documents/earchive/status/${encodeURIComponent(uuid)}`
      const stRes = await fetch(statusEndpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-access-token": session.token,
          Authorization: `Bearer ${session.token}`,
        },
      })
      const stData = await stRes.json().catch(() => null)
      if (!stRes.ok) {
        return res.status(stRes.status).json({
          success: false,
          error: stData?.detail || stData?.title || "Fatura durumu sorgulanamadı.",
        })
      }
      return res.json({ success: true, statusData: stData })
    }

    // 4. Fatura İptali (cancelEArchive: POST /api/invoice/documents/earchive/cancel)
    if (action === "cancel") {
      const invoiceId = body.invoice_id
      const orderId = body.order_id
      const invoices = readEfaturaInvoices()
      const target = invoices.find((x) => x.id === invoiceId || x.orderId === orderId)
      if (!target) {
        return res.status(404).json({ error: "İptal edilecek fatura kaydı bulunamadı." })
      }

      if (
        config.active &&
        config.email &&
        config.password &&
        target.source === "TRENDYOL_API" &&
        target.documentType === "EARSIV" &&
        target.uuid
      ) {
        try {
          const session = await signInTrendyolEfatura(config)
          const baseUrl = getGatewayBaseUrl(config.environment)
          await fetch(`${baseUrl}/api/invoice/documents/earchive/cancel`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "x-access-token": session.token,
              Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({
              invoiceUuid: target.uuid,
              companyId: Number(session.companyId || config.companyId) || undefined,
            }),
          })
        } catch (cancelErr) {
          console.warn("[efatura] Remote cancel warning:", cancelErr)
        }
      }

      target.status = "IPTAL"
      const updatedList = saveEfaturaInvoice(target)
      return res.json({ success: true, invoice: target, invoices: updatedList })
    }

    // 4. Sipariş(ler) İçin E-Fatura / E-Arşiv Kesme
    const rawIds: string[] = Array.isArray(body.order_ids)
      ? body.order_ids
      : body.order_id
      ? [body.order_id]
      : []

    if (rawIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Fatura kesilecek sipariş seçilmedi (order_id / order_ids gerekli)." })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    let pgConnection: any = null
    try {
      pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    } catch {}

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "created_at",
        "currency_code",
        "total",
        "item_subtotal",
        "shipping_total",
        "discount_total",
        "metadata",
        "items.*",
        "items.variant.*",
        "shipping_address.*",
        "billing_address.*",
        "customer.*",
        "shipping_methods.*",
      ],
      filters: { id: rawIds },
    })

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Sipariş bulunamadı." })
    }

    let authSession: TrendyolAuthSession | null = null
    if (config.active) {
      if (!config.email || !config.password) {
        return res.status(400).json({
          success: false,
          error:
            "Trendyol E-Faturam aktif ancak e-posta veya şifre ayarlanmamış. Lütfen E-Fatura ayarlarından giriş bilgilerinizi kaydedin.",
        })
      }
      try {
        authSession = await signInTrendyolEfatura(config)
        if (authSession.companyId && !config.companyId) {
          config = writeEfaturaConfig({ ...config, companyId: authSession.companyId })
        }
      } catch (e: any) {
        return res.status(400).json({
          success: false,
          error: `Trendyol E-Faturam girişi başarısız: ${
            e?.message || "Kimlik doğrulama hatası"
          }`,
        })
      }
    }

    const createdInvoices: EfaturaInvoiceRecord[] = []
    let existingInvoices = readEfaturaInvoices()

    // Aktif modda eski sahte YEREL_UBL kayıtlarını temizle
    if (config.active) {
      const onlyReal = existingInvoices.filter((inv) => inv.source === "TRENDYOL_API")
      if (onlyReal.length !== existingInvoices.length) {
        existingInvoices = writeEfaturaInvoices(onlyReal)
      }
    }

    for (const o of orders as any[]) {
      const existingForOrder = existingInvoices.find(
        (inv) =>
          inv.orderId === o.id &&
          inv.status !== "IPTAL" &&
          (!config.active || inv.source === "TRENDYOL_API")
      )
      if (existingForOrder && !body.force_recreate) {
        createdInvoices.push(existingForOrder)
        continue
      }

      const meta = o.metadata || {}
      const billing = meta.edited_billing
        ? { ...(o.billing_address || {}), ...meta.edited_billing }
        : o.billing_address || o.shipping_address || {}
      const shipping = meta.edited_shipping
        ? { ...(o.shipping_address || {}), ...meta.edited_shipping }
        : o.shipping_address || {}
      const customer = meta.edited_customer
        ? { ...(o.customer || {}), ...meta.edited_customer }
        : o.customer || {}

      const rawVkn = String(meta.vkn || meta.tax_no || billing.tax_no || "").replace(/[^0-9]/g, "")
      const rawTckn = String(meta.tckn || meta.tc_no || billing.tc_no || "").replace(
        /[^0-9]/g,
        ""
      )
      const isCorporate =
        meta.invoice_type === "Kurumsal" ||
        rawVkn.length === 10 ||
        Boolean(meta.company_name || billing.company)

      let buyerIdentifier = isCorporate
        ? rawVkn.length === 10
          ? rawVkn
          : rawTckn.length === 11
          ? rawTckn
          : "11111111111"
        : rawTckn.length === 11
        ? rawTckn
        : "11111111111"

      const fullPersonName =
        `${billing.first_name || shipping.first_name || customer.first_name || ""} ${
          billing.last_name || shipping.last_name || customer.last_name || ""
        }`.trim() || "Sayın Müşteri"

      let buyerName = isCorporate
        ? String(meta.company_name || billing.company || fullPersonName).trim()
        : fullPersonName

      const buyerTaxOffice = String(meta.tax_office || billing.tax_office || "").trim()

      // Trendyol mükellef sorgusu ile alıcının gerçek E-Fatura mükellefi olup olmadığını kontrol et
      let targetAlias: string | undefined = undefined
      let documentType: "EARSIV" | "EFATURA" = "EARSIV"

      if (authSession) {
        const taxpayerCheck = await checkTrendyolTaxpayer(
          config,
          authSession,
          buyerIdentifier
        )
        if (taxpayerCheck.isEinvoiceMukellef && taxpayerCheck.alias) {
          documentType = "EFATURA"
          targetAlias = taxpayerCheck.alias
          if (taxpayerCheck.title && isCorporate) {
            buyerName = taxpayerCheck.title
          }
        } else {
          // E-Fatura mükellefi değilse GİB kuralları gereği ZORUNLU olarak E-Arşiv kesilir
          documentType = "EARSIV"
          if (buyerIdentifier === "1111111111") {
            buyerIdentifier = "11111111111"
          }
        }
      } else {
        const requestedDocType = body.document_type as "EARSIV" | "EFATURA" | undefined
        documentType =
          requestedDocType || (isCorporate && buyerIdentifier.length === 10 ? "EFATURA" : "EARSIV")
      }

      const invoiceScenario: "EARSIVFATURA" | "TEMELFATURA" | "TICARIFATURA" =
        documentType === "EFATURA" ? "TICARIFATURA" : "EARSIVFATURA"

      const vatRate = Number(config.defaultVatRate) || 20
      const rawItems = Array.isArray(meta.edited_items) ? meta.edited_items : o.items || []

      const mappedItems: EfaturaInvoiceItem[] = rawItems.map((it: any) => {
        const qty = Number(it.quantity) || 1
        const rawUnitPrice = Number(it.unit_price) || 0
        const unitPriceTL = rawUnitPrice >= 100 ? rawUnitPrice / 100 : rawUnitPrice
        const grossTotalTL = Number((unitPriceTL * qty).toFixed(2))
        const netUnitPriceTL = Number((unitPriceTL / (1 + vatRate / 100)).toFixed(4))
        const netTotalTL = Number((grossTotalTL / (1 + vatRate / 100)).toFixed(2))
        const vatAmountTL = Number((grossTotalTL - netTotalTL).toFixed(2))

        return {
          title: it.title || "Tekstil / Giyim Ürünü",
          sku: it.variant?.sku || it.sku || "BKM-URUN",
          quantity: qty,
          unitPrice: unitPriceTL,
          netUnitPrice: netUnitPriceTL,
          vatRate,
          vatAmount: vatAmountTL,
          totalAmount: grossTotalTL,
        }
      })

      const rawOrderTotal = Number(meta.edited_total ?? o.total ?? 0)
      const itemsSumTL = Number(
        mappedItems.reduce((acc: number, x: EfaturaInvoiceItem) => acc + x.totalAmount, 0).toFixed(2)
      )
      const orderTotalTL =
        rawOrderTotal >= 100
          ? Number((rawOrderTotal / 100).toFixed(2))
          : rawOrderTotal > 0
          ? Number(rawOrderTotal.toFixed(2))
          : itemsSumTL

      // Eğer sipariş toplamı (ör. kargo/hizmet farkı nedeniyle) kalemler toplamından büyükse, farkı kalem olarak ekle
      if (orderTotalTL > itemsSumTL + 0.01) {
        const diffGrossTL = Number((orderTotalTL - itemsSumTL).toFixed(2))
        const diffNetTL = Number((diffGrossTL / (1 + vatRate / 100)).toFixed(2))
        const diffVatTL = Number((diffGrossTL - diffNetTL).toFixed(2))
        mappedItems.push({
          title: "Kargo ve Teslimat Hizmet Bedeli",
          sku: "BKM-KARGO",
          quantity: 1,
          unitPrice: diffGrossTL,
          netUnitPrice: Number((diffGrossTL / (1 + vatRate / 100)).toFixed(4)),
          vatRate,
          vatAmount: diffVatTL,
          totalAmount: diffGrossTL,
        })
      } else if (mappedItems.length === 0 && orderTotalTL > 0) {
        const netTL = Number((orderTotalTL / (1 + vatRate / 100)).toFixed(2))
        const vatTL = Number((orderTotalTL - netTL).toFixed(2))
        mappedItems.push({
          title: `Sipariş #${o.display_id || ""} Ürün Bedeli`.trim(),
          sku: "BKM-SIPARIS",
          quantity: 1,
          unitPrice: orderTotalTL,
          netUnitPrice: Number((orderTotalTL / (1 + vatRate / 100)).toFixed(4)),
          vatRate,
          vatAmount: vatTL,
          totalAmount: orderTotalTL,
        })
      }

      const finalTotalTL = Number(
        mappedItems.reduce((acc, x) => acc + x.totalAmount, 0).toFixed(2)
      )
      const finalNetTL = Number((finalTotalTL / (1 + vatRate / 100)).toFixed(2))
      const finalVatTL = Number((finalTotalTL - finalNetTL).toFixed(2))

      let payMethod = "Kredi Kartı (Online)"
      const metaOption = meta.payment_option
      if (metaOption === "cash_on_delivery") payMethod = "Kapıda Nakit Ödeme"
      else if (metaOption === "card_on_delivery") payMethod = "Kapıda Kredi Kartı ile Ödeme"
      else if (metaOption === "bank_transfer") payMethod = "Havale / EFT"
      else if (metaOption === "paytr") payMethod = "PayTR Online Kredi Kartı"

      const carrierName =
        meta.selected_carrier === "interline"
          ? "Interline Express Kargo"
          : meta.selected_carrier === "kargonova"
          ? "Nova Kargo"
          : o.shipping_methods?.[0]?.name || "Anlaşmalı Kargo"

      const prefix = documentType === "EFATURA" ? config.einvoicePrefix : config.earchivePrefix
      const fallbackInvoiceNumber = generateSequentialInvoiceNumber(prefix, existingInvoices)
      const uuid = crypto.randomUUID()

      const record: EfaturaInvoiceRecord = {
        id: `efat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        uuid,
        invoiceNumber: fallbackInvoiceNumber,
        orderId: o.id,
        orderDisplayId: String(o.display_id || o.id.slice(-8)),
        documentType,
        invoiceScenario,
        invoiceType: "SATIS",
        status: "RESMILESTI",
        source: config.active ? "TRENDYOL_API" : "YEREL_UBL",
        environment: config.environment,
        issueDate: new Date().toISOString(),
        buyerName,
        buyerIdentifier,
        buyerTaxOffice,
        buyerAddress:
          `${billing.address_1 || shipping.address_1 || ""} ${billing.address_2 || ""}`.trim() ||
          "Merkez Mah.",
        buyerCity:
          billing.province ||
          billing.city ||
          shipping.province ||
          shipping.city ||
          "İstanbul",
        buyerDistrict: billing.city || shipping.city || "Merkez",
        buyerEmail: o.email || customer.email || "",
        buyerPhone: billing.phone || shipping.phone || customer.phone || "",
        currencyCode: (o.currency_code || "TRY").toUpperCase(),
        subtotalAmount: finalTotalTL,
        vatRate,
        vatAmount: finalVatTL,
        discountAmount: 0,
        totalAmount: finalTotalTL,
        paymentMethod: payMethod,
        carrierName,
        storeWebUrl: config.storeWebUrl || "https://kombingo.com",
        items: mappedItems,
        createdAt: new Date().toISOString(),
      }

      if (config.active && authSession) {
        const resolvedPrefix = await resolveTrendyolPrefix(config, authSession, documentType)
        const createdRemote = await createInvoiceOnTrendyol(
          record,
          config,
          authSession,
          targetAlias,
          resolvedPrefix
        )

        record.source = "TRENDYOL_API"
        if (createdRemote.uuid) {
          record.uuid = createdRemote.uuid
        }
        if (createdRemote.invoiceNumber) {
          record.invoiceNumber = createdRemote.invoiceNumber
        }
        record.trendyolResponse = createdRemote.rawResponse

        // Eğer yanıt içinde invoiceNumber boş döndüyse (örn. V2 async oluşturma), Trendyol'dan güncel listeyi çekip eşleştir
        if (!createdRemote.invoiceNumber) {
          const remoteList = await fetchTrendyolIssuedInvoices(config, authSession)
          const matchedRemote =
            remoteList.find(
              (r) =>
                r.orderDisplayId === record.orderDisplayId ||
                (createdRemote.uuid && r.uuid === createdRemote.uuid)
            ) || remoteList[0]
          if (matchedRemote) {
            record.uuid = matchedRemote.uuid || record.uuid
            record.invoiceNumber = matchedRemote.invoiceNumber || record.invoiceNumber
          }
        }
      }

      existingInvoices = saveEfaturaInvoice(record)
      createdInvoices.push(record)

      const issueDateFormatted = new Date(record.issueDate).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      const updatedMetadata = {
        ...meta,
        invoice_series: record.invoiceNumber,
        invoice_date: issueDateFormatted,
        e_invoice_date: issueDateFormatted,
        efatura: {
          id: record.id,
          uuid: record.uuid,
          invoiceNumber: record.invoiceNumber,
          documentType: record.documentType,
          invoiceScenario: record.invoiceScenario,
          status: record.status,
          source: record.source,
          issueDate: record.issueDate,
          buyerName: record.buyerName,
          buyerIdentifier: record.buyerIdentifier,
          buyerTaxOffice: record.buyerTaxOffice,
          totalAmount: record.totalAmount,
          vatAmount: record.vatAmount,
        },
        integration_logs: [
          {
            id: `efat_log_${Date.now()}`,
            message: `Trendyol ${
              record.documentType === "EFATURA" ? "E-Fatura" : "E-Arşiv Fatura"
            } oluşturuldu: ${record.invoiceNumber} (ETTN: ${record.uuid.slice(0, 8)}...)`,
            date: issueDateFormatted,
            type: "invoice",
          },
          ...(Array.isArray(meta.integration_logs) ? meta.integration_logs : []),
        ],
      }

      if (pgConnection) {
        try {
          await pgConnection("order")
            .where("id", o.id)
            .update({
              metadata: JSON.stringify(updatedMetadata),
              updated_at: new Date(),
            })
        } catch (dbErr) {
          console.warn("[efatura] Order metadata update warning:", dbErr)
        }
      }
    }

    res.json({
      success: true,
      createdCount: createdInvoices.length,
      created: createdInvoices,
      invoices: existingInvoices,
      allInvoices: existingInvoices,
      config,
    })
  } catch (e: any) {
    console.error("[efatura POST] Error:", e)
    res.status(400).json({
      success: false,
      error: e?.message || "E-Fatura işlemi sırasında beklenmeyen bir hata oluştu.",
    })
  }
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as Partial<EfaturaConfig>) || {}
    const updated = writeEfaturaConfig(body)
    res.json({ success: true, config: updated })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Ayarlar kaydedilemedi." })
  }
}
