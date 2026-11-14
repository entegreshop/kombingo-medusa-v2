import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getInterlineBarcode, createInterlineConsignment, InterlineConsignmentData } from "../../../utils/interline-cargo"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const barcode = req.query.barcode as string
  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" })
  }

  const base64Pdf = await getInterlineBarcode(barcode)
  if (base64Pdf) {
    res.json({ success: true, base64: base64Pdf })
  } else {
    res.status(404).json({ success: false, error: "Barkod bulunamadı veya API hatası" })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { order_id } = req.body as any
  if (!order_id) return res.status(400).json({ error: "order_id required" })

  const query = req.scope.resolve("query")
  const orderModuleService = req.scope.resolve(Modules.ORDER)

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "total",
        "metadata",
        "shipping_address.*",
        "customer.*"
      ],
      filters: { id: order_id },
    })

    const order = orders[0]
    if (!order) return res.status(404).json({ error: "Order not found" })

    const metadata = order.metadata || {}
    if (metadata.interline_barcode) {
      return res.status(400).json({ error: "Bu sipariş zaten İnterline kargoya gönderilmiş." })
    }

    const firstName = order.shipping_address?.first_name || order.customer?.first_name || "Müşteri"
    const lastName = order.shipping_address?.last_name || order.customer?.last_name || ""
    const fullName = `${firstName} ${lastName}`.trim()
    const toTurkishUpper = (str: string) => str.toLocaleUpperCase("tr-TR").trim()
    
    // In Medusa (Turkey), `city` is typically used for the Province (İl) 
    // and `province` is used for the District/County (İlçe).
    // Let's extract them correctly.
    let rawCityAsProvince = order.shipping_address?.city || "İstanbul"
    let rawProvinceAsCounty = order.shipping_address?.province || "Merkez"
    
    // Convert to uppercase just in case Interline's legacy system is picky.
    const provinceName = toTurkishUpper(rawCityAsProvince)
    const countyName = toTurkishUpper(rawProvinceAsCounty)

    const address = order.shipping_address?.address_1 || "Adres belirtilmemiş"
    const phone = order.shipping_address?.phone || order.customer?.phone || "05555555555"
    const weight = metadata.weight ? parseInt(metadata.weight as string) : 1

    const isCodCash = metadata.payment_option === "cash_on_delivery"
    const isCodCard = metadata.payment_option === "card_on_delivery"

    const consignmentData: InterlineConsignmentData = {
      customer: fullName,
      province_name: provinceName,
      county_name: countyName,
      address: address,
      telephone: phone,
      quantity: 1,
      consignment_type_id: 2, 
      amount_type_id: isCodCard ? 6 : 3, 
      distribution_type_id: 1,
      order_number: order.display_id ? order.display_id.toString() : order.id,
      weight: weight
    }

    if (isCodCash || isCodCard) {
      const totalCents = order.total || 0
      consignmentData.amount = (totalCents / 100).toFixed(2)
    }

    const result = await createInterlineConsignment(consignmentData)
    if (result.success && result.barcode) {
      await orderModuleService.updateOrders(order_id, {
        metadata: {
          ...metadata,
          interline_barcode: result.barcode,
          interline_record_id: result.record_id,
          carrier_barcode: result.barcode
        }
      })
      return res.json({ success: true, barcode: result.barcode })
    } else {
      return res.status(400).json({ success: false, error: result.error })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message })
  }
}
