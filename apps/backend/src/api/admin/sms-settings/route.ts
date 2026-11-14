import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "sms-settings.json")

interface SMSConfig {
  active: boolean
  usercode: string
  password: string
  msgheader: string
  admin_phone: string
  sms_service: string
}

const defaultData: SMSConfig = {
  active: false,
  usercode: process.env.NETGSM_USERCODE || "",
  password: process.env.NETGSM_PASSWORD || "",
  msgheader: process.env.NETGSM_HEADER || "",
  admin_phone: process.env.NETGSM_ADMIN_PHONE || "",
  sms_service: "netgsm"
}

export function readConfig(): SMSConfig {
  try {
    const legacyHome = path.join(os.homedir(), ".xoox-sms-settings.json")
    const legacyCwd = path.join(process.cwd(), ".xoox-sms-settings.json")
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyHome)
        ? legacyHome
        : fs.existsSync(legacyCwd)
          ? legacyCwd
          : null

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        active: typeof parsed.active === "boolean" ? parsed.active : defaultData.active,
        usercode: parsed.usercode !== undefined ? parsed.usercode : defaultData.usercode,
        password: parsed.password !== undefined ? parsed.password : defaultData.password,
        msgheader: parsed.msgheader !== undefined ? parsed.msgheader : defaultData.msgheader,
        admin_phone: parsed.admin_phone !== undefined ? parsed.admin_phone : defaultData.admin_phone,
        sms_service: parsed.sms_service !== undefined ? parsed.sms_service : defaultData.sms_service,
      }
    }
  } catch (err) {
    console.error("Error reading SMS config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing SMS config in admin api:", err)
    return false
  }
}

// Helper to send SMS via Netgsm
async function sendNetgsmSms(usercode: string, password: string, header: string, phone: string, message: string) {
  if (!usercode || !password || !header) {
    return { success: false, error: "Netgsm credentials missing" }
  }

  let cleanPhone = phone.replace(/\D/g, "")
  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.substring(1)
  }
  if (cleanPhone.startsWith("90") && cleanPhone.length > 10) {
    cleanPhone = cleanPhone.substring(2)
  }

  if (cleanPhone.length !== 10) {
    return { success: false, error: "Telefon numarası 10 haneli olmalıdır (örn. 5xxxxxxxxx)" }
  }

  try {
    const params = new URLSearchParams()
    params.append("usercode", usercode)
    params.append("password", password)
    params.append("gsmno", cleanPhone)
    params.append("message", message)
    params.append("msgheader", header)

    const response = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params.toString()}`, {
      method: "GET",
      headers: {
        "Accept": "text/html"
      }
    })

    const body = await response.text()
    if (body.startsWith("00")) {
      return { success: true, code: body }
    } else {
      return { success: false, error: body }
    }
  } catch (err: any) {
    console.error("[Netgsm SMS] Test send failed:", err)
    return { success: false, error: err.message }
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any

  // If this is a test request
  if (body.test === true) {
    const testPhone = body.test_phone
    const testMsg = body.test_message || "Netgsm entegrasyonu test mesajıdır."
    
    // We can use either the values passed in the test call or the saved ones
    const usercode = body.usercode || defaultData.usercode
    const password = body.password || defaultData.password
    const msgheader = body.msgheader || defaultData.msgheader

    const result = await sendNetgsmSms(usercode, password, msgheader, testPhone, testMsg)
    return res.json({ success: result.success, error: result.error, code: (result as any).code })
  }

  const success = writeConfig({
    active: body.active,
    usercode: body.usercode,
    password: body.password,
    msgheader: body.msgheader,
    admin_phone: body.admin_phone,
    sms_service: body.sms_service || "netgsm"
  })

  if (success) {
    res.json({ success: true, config: readConfig() })
  } else {
    res.status(500).json({ success: false, message: "Could not write configuration" })
  }
}
