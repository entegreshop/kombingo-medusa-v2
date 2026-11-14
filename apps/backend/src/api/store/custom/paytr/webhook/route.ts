import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { readConfig as readPaymentConfig } from "../../../../admin/payment-settings/route"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any
    const { merchant_oid, status, total_amount, hash, failed_reason_code, failed_reason_msg } = body

    if (!merchant_oid || !status || !hash) {
      return res.status(400).send("OK")
    }

    // 1. Get PayTR Config (with fallback defaults)
    const paymentConfig = readPaymentConfig()
    const paytrConfig: any = paymentConfig.paytr || {}

    const merchant_key = String(paytrConfig.merchant_key || "").trim()
    const merchant_salt = String(paytrConfig.merchant_salt || "").trim()

    if (!merchant_key || !merchant_salt) {
      console.error("PayTR Webhook: Missing API keys in config.")
      return res.status(500).send("OK")
    }

    // 2. Verify Hash
    const hashStr = merchant_oid + merchant_salt + status + total_amount
    const calculatedHash = crypto.createHmac("sha256", merchant_key).update(hashStr).digest("base64")

    if (calculatedHash !== hash) {
      console.error("PayTR Webhook: Hash mismatch!", { received: hash, calculated: calculatedHash })
      return res.status(400).send("OK")
    }

    // 3. Process Payment based on status
    if (status === "success") {
      console.log(`PayTR Webhook: Payment SUCCESS for cart/order: ${merchant_oid}`)

      try {
        const cleanOid = String(merchant_oid).replace(/^cart_?/, "")
        const original_id = cleanOid.substring(0, 26)
        const cart_id = "cart_" + original_id

        const query = req.scope.resolve("query")
        const { data: carts } = await query.graph({
          entity: "cart",
          fields: ["id", "total", "completed_at"],
          filters: { id: cart_id }
        })
        const cart = carts[0]

        if (!cart) {
          console.error(`PayTR Webhook: Cart ${cart_id} not found.`)
          return res.status(200).send("OK")
        }

        if (cart.completed_at) {
          console.log(`PayTR Webhook: Cart ${cart_id} already completed (Idempotent).`)
          return res.status(200).send("OK")
        }

        const expectedTotal = Number(cart.total)
        const receivedTotal = Number(total_amount)
        if (expectedTotal !== receivedTotal) {
          console.warn(`PayTR Webhook: Note - Cart raw total (${expectedTotal}) differs from PayTR total_amount (${receivedTotal}), proceeding as HMAC is verified.`)
        }

        // Complete the cart using Medusa's completeCartWorkflow
        const { completeCartWorkflow } = await import("@medusajs/core-flows")

        await completeCartWorkflow(req.scope).run({
          input: { id: cart_id }
        })

        console.log(`PayTR Webhook: Order placed successfully for ${merchant_oid}`)
      } catch (err: any) {
        console.error("PayTR Webhook: Error completing cart/order:", err)

        try {
          const LOGS_FILE_PATH = path.join(process.cwd(), "uploads", "paytr-error.log")
          const dir = path.dirname(LOGS_FILE_PATH)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          const errorMsg = `[${new Date().toISOString()}] Error for cart ${merchant_oid}: ${err.message}\nStack: ${err.stack}\n\n`
          fs.appendFileSync(LOGS_FILE_PATH, errorMsg)
        } catch (fileErr) {
          console.error("Could not write to error log file", fileErr)
        }
      }
    } else {
      console.error(`PayTR Webhook: Payment FAILED for ${merchant_oid}. Reason: ${failed_reason_msg} (${failed_reason_code})`)
    }

    return res.status(200).send("OK")
  } catch (error: any) {
    console.error("PayTR Webhook Error:", error)
    return res.status(200).send("OK")
  }
}
