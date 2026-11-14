import { readConfig } from "../api/admin/shipping-settings/route"
const BASE_URL = "https://webpostman.interlineexpress.com/restapi/client"

export interface InterlineConsignmentData {
  customer: string
  province_name: string
  county_name: string
  district?: string
  address: string
  telephone?: string
  branch_code?: string
  quantity: number
  consignment_type_id: number // 1: Koli, 2: Paket, 3: Dosya
  amount_type_id: number // 2: Alıcı Ödemeli, 3: Peşin Ödeme
  amount?: string // Tutar (Kuruş değeri "#.00" olarak gönderilmelidir.)
  distribution_type_id: number // 1: Ertesi Gün Teslimat, 2: Aynı Gün
  order_number: string
  weight?: number
  barcode?: string
}

export async function createInterlineConsignment(data: InterlineConsignmentData) {
  const allSettings = await readConfig()
  const carrier = allSettings.carriers.find(c => c.key === "interline")
  const config = carrier?.api || {}
  const general = carrier?.general || {}

  if (!general.active || !config.apiActive) {
    return { success: false, error: "İnterline Kargo entegrasyonu aktif değil." }
  }

  if (!config.apiAuthorization || !config.apiFrom) {
    return { success: false, error: "İnterline API ayarları eksik (Authorization veya From)." }
  }

  const formData = new URLSearchParams()
  formData.append("customer", data.customer)
  formData.append("province_name", data.province_name)
  formData.append("county_name", data.county_name)
  formData.append("address", data.address)
  
  if (data.district) formData.append("district", data.district)
  if (data.telephone) formData.append("telephone", data.telephone)
  
  // Use config branch code if not provided
  const branchCode = data.branch_code || config.branchName
  if (branchCode) {
    formData.append("branch_code", branchCode)
  }

  formData.append("quantity", data.quantity.toString())
  formData.append("consignment_type_id", data.consignment_type_id.toString())
  formData.append("amount_type_id", data.amount_type_id.toString())
  if (data.amount) {
    formData.append("amount", data.amount)
  }
  formData.append("distribution_type_id", data.distribution_type_id.toString())
  formData.append("order_number", data.order_number)
  
  if (data.weight) formData.append("weight", data.weight.toString())
  if (data.barcode) formData.append("barcode", data.barcode)

  try {
    const response = await fetch(`${BASE_URL}/consignment/add`, {
      method: "POST",
      headers: {
        "Authorization": config.apiAuthorization,
        "From": config.apiFrom,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    })

    const result = await response.json()
    if (result.error === false || result.error === "false") {
      return { success: true, barcode: result.barcode, record_id: result.record_id }
    } else {
      let errorMessage = result.message || "Bilinmeyen API Hatası";
      if (result.result && Array.isArray(result.result)) {
        errorMessage = result.result.join(" | ");
      } else if (result.result && typeof result.result === "string" && result.error !== "false") {
        errorMessage = result.result;
      }
      return { success: false, error: errorMessage }
    }
  } catch (error: any) {
    console.error("[Interline Cargo] API Error:", error)
    return { success: false, error: error.message }
  }
}

export async function getInterlineBarcode(barcode: string) {
  try {
    const allSettings = await readConfig()
    const carrier = allSettings.carriers.find(c => c.key === "interline")
    const config = carrier?.api || {}
    const general = carrier?.general || {}

    if (!general.active || !config.apiActive) return null

    const url = new URL(`${BASE_URL}/consignment/get_barcode`)
    url.searchParams.append("barcode", barcode)
    url.searchParams.append("ext", "pdf")
    url.searchParams.append("code", "base64encode")

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": config.apiAuthorization,
        "From": config.apiFrom
      }
    })

    const result = await response.json()
    if (result.error === false && result.return && result.return.length > 0) {
      return result.return[0].barcode // Base64 string of PDF
    }
    return null
  } catch (error) {
    console.error("[Interline Cargo] Get Barcode Error:", error)
    return null
  }
}
