import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig as readPaymentConfig } from "../../../admin/payment-settings/route"
import { readOpsState } from "../../../admin/order-operations/route"

function evaluateCustomerRisk(query: Record<string, any>) {
  const opsState = readOpsState()
  const criteria = opsState.riskCriteria || []
  const rawPhone = String(query.phone || "").replace(/[^0-9]/g, "").slice(-10)
  const rawEmail = String(query.email || "").toLowerCase().trim()
  const rawTc = String(query.tc_no || "").trim()
  const rawTax = String(query.tax_no || "").trim()
  const rawIp = String(query.ip || "").trim()
  const rawName = String(query.name || "").toLowerCase().replace(/\s+/g, "")

  for (const rc of criteria) {
    const rcPhone = rc.phone ? rc.phone.replace(/[^0-9]/g, "").slice(-10) : ""
    const rcEmail = rc.email ? rc.email.toLowerCase().trim() : ""
    const rcTc = rc.tc_no ? rc.tc_no.trim() : ""
    const rcTax = rc.tax_no ? rc.tax_no.trim() : ""
    const rcIp = rc.ip ? rc.ip.trim() : ""
    const rcName = rc.full_name ? rc.full_name.toLowerCase().replace(/\s+/g, "") : ""

    const matchPhone = Boolean(rawPhone && rcPhone && rawPhone === rcPhone)
    const matchEmail = Boolean(rawEmail && rcEmail && rawEmail === rcEmail)
    const matchTc = Boolean(rawTc && rcTc && rawTc === rcTc)
    const matchTax = Boolean(rawTax && rcTax && rawTax === rcTax)
    const matchIp = Boolean(rawIp && rcIp && rawIp === rcIp && rawIp !== "127.0.0.1")
    const matchName = Boolean(rawName && rcName && rawName === rcName)

    if (matchPhone || matchEmail || matchTc || matchTax || matchIp || matchName) {
      const blocked = Array.isArray(rc.blocked_payment_methods) ? rc.blocked_payment_methods : []
      const codDisabled =
        rc.is_completely_blocked ||
        rc.only_credit_card ||
        blocked.includes("Kapıda Ödeme")
      const bankTransferDisabled =
        rc.is_completely_blocked ||
        rc.only_credit_card ||
        blocked.includes("Havale / EFT")
      return {
        is_risky: true,
        is_completely_blocked: Boolean(rc.is_completely_blocked),
        only_credit_card: Boolean(rc.only_credit_card),
        cod_disabled: codDisabled,
        bank_transfer_disabled: bankTransferDisabled,
        blocked_payment_methods: blocked,
        matched_criterion_id: rc.id,
        message: rc.is_completely_blocked
          ? "Hesabınız güvenlik / risk kriterleri nedeniyle sipariş oluşturmaya kapatılmıştır."
          : "Önceki teslim alınmayan / iade dönen siparişleriniz nedeniyle Kapıda Ödeme ve Havale/EFT kapalıdır. Sadece Kredi Kartı ile sipariş verebilirsiniz.",
      }
    }
  }

  return {
    is_risky: false,
    is_completely_blocked: false,
    only_credit_card: false,
    cod_disabled: false,
    bank_transfer_disabled: false,
    blocked_payment_methods: [],
    matched_criterion_id: null,
    message: null,
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const parsed = readPaymentConfig()
    const riskCheck = evaluateCustomerRisk((req.query || {}) as Record<string, any>)
    const codSettings = {
      is_active: Boolean(parsed.cash_on_delivery?.active) && !riskCheck.cod_disabled,
      additional_fee: (parsed.cash_on_delivery?.adjustment_value ?? 0).toString(),
      min_amount: (parsed.cash_on_delivery?.max_total ?? 10000).toString(),
      bank_transfer_active: Boolean(parsed.bank_transfer?.active ?? true) && !riskCheck.bank_transfer_disabled,
      risk: riskCheck,
    }

    res.json({ success: true, settings: codSettings, risk: riskCheck })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const riskCheck = evaluateCustomerRisk((req.body || {}) as Record<string, any>)
    res.json({ success: true, risk: riskCheck })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
