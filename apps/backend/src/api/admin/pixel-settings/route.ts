import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"
import crypto from "crypto"

const configFilePath = path.join(process.cwd(), "uploads", "pixel-settings.json")
const legacyHomeFilePath = path.join(os.homedir(), ".xoox-pixel-settings.json")
const legacyCwdFilePath = path.join(process.cwd(), ".xoox-pixel-settings.json")

export interface PixelConfig {
  meta_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
  }
  google_ads: {
    active: boolean
    conversion_id: string
    conversion_label: string
  }
  google_analytics: {
    active: boolean
    measurement_id: string
    property_id?: string
    service_account_json?: string
  }
  google_tag_manager: {
    active: boolean
    gtm_id: string
  }
  tiktok_pixel: {
    active: boolean
    pixel_id: string
    access_token: string
  }
}

const defaultData: PixelConfig = {
  meta_pixel: {
    active: false,
    pixel_id: "",
    access_token: "",
  },
  google_ads: {
    active: false,
    conversion_id: "",
    conversion_label: "",
  },
  google_analytics: {
    active: false,
    measurement_id: "",
    property_id: "",
    service_account_json: "",
  },
  google_tag_manager: {
    active: false,
    gtm_id: "",
  },
  tiktok_pixel: {
    active: false,
    pixel_id: "",
    access_token: "",
  },
}

// Live GA4 (_ga cookie + gtag) active session window (5 minutes)
interface GaRealtimeSession {
  clientId: string
  device: "desktop" | "mobile"
  path: string
  lastSeen: number
}

const gaLiveSessions = new Map<string, GaRealtimeSession>()

export function recordGaRealtimeHit(payload: {
  client_id?: string
  device?: string
  path?: string
}) {
  const now = Date.now()
  const cid = (payload.client_id || "").trim()
  if (!cid) return

  const deviceType: "desktop" | "mobile" =
    payload.device === "mobile" ? "mobile" : "desktop"

  gaLiveSessions.set(cid, {
    clientId: cid,
    device: deviceType,
    path: payload.path || "/",
    lastSeen: now,
  })

  // Prune sessions older than 5 minutes (GA4 active user window)
  const cutoff = now - 5 * 60 * 1000
  for (const [key, session] of gaLiveSessions.entries()) {
    if (session.lastSeen < cutoff) {
      gaLiveSessions.delete(key)
    }
  }
}

async function fetchGoogleAnalyticsRealtimeApi(
  propertyId: string,
  serviceAccountRaw: string
): Promise<{ count: number; desktopPercent: number; mobilePercent: number } | null> {
  try {
    const creds = JSON.parse(serviceAccountRaw)
    if (!creds.client_email || !creds.private_key) return null

    const nowSec = Math.floor(Date.now() / 1000)
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url")
    const claim = Buffer.from(
      JSON.stringify({
        iss: creds.client_email,
        scope: "https://www.googleapis.com/auth/analytics.readonly",
        aud: "https://oauth2.googleapis.com/token",
        exp: nowSec + 3600,
        iat: nowSec,
      })
    ).toString("base64url")

    const sign = crypto.createSign("RSA-SHA256")
    sign.update(`${header}.${claim}`)
    const signature = sign.sign(creds.private_key, "base64url")
    const assertion = `${header}.${claim}.${signature}`

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    })
    if (!tokenRes.ok) return null
    const tokenData: any = await tokenRes.json()
    const accessToken = tokenData?.access_token
    if (!accessToken) return null

    const cleanPropId = propertyId.replace(/^properties\//, "").trim()
    const reportRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropId}:runRealtimeReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }],
        }),
      }
    )
    if (!reportRes.ok) return null
    const reportData: any = await reportRes.json()

    let desktopUsers = 0
    let mobileUsers = 0
    const rows = reportData?.rows || []
    for (const row of rows) {
      const cat = (row.dimensionValues?.[0]?.value || "").toLowerCase()
      const val = parseInt(row.metricValues?.[0]?.value || "0", 10)
      if (cat === "mobile" || cat === "tablet") {
        mobileUsers += val
      } else {
        desktopUsers += val
      }
    }

    const total = desktopUsers + mobileUsers
    const desktopPercent = total > 0 ? Math.round((desktopUsers / total) * 100) : 0
    const mobilePercent = total > 0 ? 100 - desktopPercent : 0
    return { count: total, desktopPercent, mobilePercent }
  } catch (err) {
    console.error("GA4 Realtime Data API fetch error:", err)
    return null
  }
}

export async function getGaRealtimeStats(fallbackActiveCarts = 0): Promise<{
  count: number
  desktopPercent: number
  mobilePercent: number
  source: string
  sessions: Array<{
    id: string
    device: "desktop" | "mobile"
    path: string
    secondsAgo: number
  }>
  minuteHistory: number[]
}> {
  const now = Date.now()
  const cutoff = now - 10 * 60 * 1000
  let desktopCount = 0
  let mobileCount = 0
  const activeSessions: Array<{
    id: string
    device: "desktop" | "mobile"
    path: string
    secondsAgo: number
  }> = []

  // Build 10-minute bucket history (each bucket = 1 minute)
  const minuteBuckets = Array(10).fill(0)

  for (const [key, session] of gaLiveSessions.entries()) {
    if (session.lastSeen < cutoff) {
      gaLiveSessions.delete(key)
    } else {
      if (session.device === "mobile") {
        mobileCount++
      } else {
        desktopCount++
      }
      const secondsAgo = Math.max(0, Math.floor((now - session.lastSeen) / 1000))
      activeSessions.push({
        id: key.slice(-6).toUpperCase(),
        device: session.device,
        path: session.path || "/",
        secondsAgo,
      })
      const minIdx = Math.min(9, Math.max(0, 9 - Math.floor(secondsAgo / 60)))
      minuteBuckets[minIdx]++
    }
  }

  activeSessions.sort((a, b) => a.secondsAgo - b.secondsAgo)

  const cfg = readConfig()
  const propId =
    cfg.google_analytics?.property_id || process.env.GA4_PROPERTY_ID || ""
  const saJson =
    cfg.google_analytics?.service_account_json ||
    process.env.GA4_SERVICE_ACCOUNT_JSON ||
    ""

  // 1. If GA4 Data API credentials are configured, query Google Analytics 4 Realtime API directly
  if (propId && saJson) {
    const apiStats = await fetchGoogleAnalyticsRealtimeApi(propId, saJson)
    if (apiStats) {
      const hist = minuteBuckets.some((v) => v > 0)
        ? minuteBuckets
        : [
            Math.max(0, apiStats.count - 1),
            0,
            0,
            0,
            Math.max(1, apiStats.count),
            Math.max(0, apiStats.count - 1),
            0,
            0,
            Math.max(0, apiStats.count - 1),
            apiStats.count,
          ]
      return {
        ...apiStats,
        source: "ga4_data_api",
        sessions: activeSessions,
        minuteHistory: hist,
      }
    }
  }

  // 2. Otherwise use live GA4 (_ga client cookie) storefront stream
  const streamTotal = desktopCount + mobileCount
  if (streamTotal > 0) {
    const desktopPercent = Math.round((desktopCount / streamTotal) * 100)
    return {
      count: streamTotal,
      desktopPercent,
      mobilePercent: 100 - desktopPercent,
      source: "ga4_live_stream",
      sessions: activeSessions,
      minuteHistory: minuteBuckets,
    }
  }

  // 3. Fallback to active carts if no storefront page hits in the last 10 mins
  return {
    count: fallbackActiveCarts,
    desktopPercent: fallbackActiveCarts > 0 ? 60 : 0,
    mobilePercent: fallbackActiveCarts > 0 ? 40 : 0,
    source: "active_carts",
    sessions: [],
    minuteHistory:
      fallbackActiveCarts > 0
        ? [1, 0, 0, 0, fallbackActiveCarts, 0, 0, 0, 0, fallbackActiveCarts]
        : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
}

export function readConfig(): PixelConfig {
  try {
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyHomeFilePath)
        ? legacyHomeFilePath
        : fs.existsSync(legacyCwdFilePath)
          ? legacyCwdFilePath
          : null

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        meta_pixel: { ...defaultData.meta_pixel, ...(parsed.meta_pixel || {}) },
        google_ads: { ...defaultData.google_ads, ...(parsed.google_ads || {}) },
        google_analytics: {
          ...defaultData.google_analytics,
          ...(parsed.google_analytics || {}),
        },
        google_tag_manager: {
          ...defaultData.google_tag_manager,
          ...(parsed.google_tag_manager || {}),
        },
        tiktok_pixel: {
          ...defaultData.tiktok_pixel,
          ...(parsed.tiktok_pixel || {}),
        },
      }
    }
  } catch (err) {
    console.error("Error reading pixel config in admin api:", err)
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
    console.error("Error writing pixel config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const success = writeConfig(body)
  if (success) {
    res.json({ success: true, config: body })
  } else {
    res
      .status(500)
      .json({ success: false, message: "Could not write configuration" })
  }
}
