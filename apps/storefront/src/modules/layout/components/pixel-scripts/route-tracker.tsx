"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

let globalLastTrackedUrl = ""

function getOrCreateGaClientId(): string {
  try {
    // 1. Read official Google Analytics _ga cookie if present (e.g. GA1.1.123456789.1700000000)
    const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
    // 2. Fallback to persistent session storage ID
    let cid = localStorage.getItem("_bkm_ga_cid")
    if (!cid) {
      cid = "GA4." + Math.random().toString(36).substring(2, 11) + "." + Date.now()
      localStorage.setItem("_bkm_ga_cid", cid)
    }
    return cid
  } catch {
    return "GA4.anon"
  }
}

function detectDeviceCategory(): "mobile" | "desktop" {
  try {
    const ua = navigator.userAgent || ""
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 768) {
      return "mobile"
    }
  } catch {
    // ignore
  }
  return "desktop"
}

function sendGaRealtimeHeartbeat(urlPath: string) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com"
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    fetch(`${backendUrl}/store/pixel-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
      body: JSON.stringify({
        client_id: getOrCreateGaClientId(),
        device: detectDeviceCategory(),
        path: urlPath,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}

export default function PixelRouteTracker({ config }: { config: any }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    // Always send real-time GA4 visitor heartbeat for live dashboard radar
    sendGaRealtimeHeartbeat(url)
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendGaRealtimeHeartbeat(url)
      }
    }, 20000)

    if (!config) {
      return () => clearInterval(intervalId)
    }

    const { meta_pixel, google_analytics, tiktok_pixel } = config

    if (globalLastTrackedUrl === url) {
      return () => clearInterval(intervalId)
    }
    globalLastTrackedUrl = url

    // 1. Meta Pixel PageView
    if (meta_pixel?.active && meta_pixel?.pixel_id && (window as any).fbq) {
      ;(window as any).fbq("track", "PageView")
    }

    // 2. TikTok Pixel page view
    if (tiktok_pixel?.active && tiktok_pixel?.pixel_id && (window as any).ttq) {
      ;(window as any).ttq.page()
    }

    // 3. Google Analytics (GA4) page view
    if (
      google_analytics?.active &&
      google_analytics?.measurement_id &&
      (window as any).gtag
    ) {
      ;(window as any).gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      })
    }

    // 4. ViewCategory Event
    const categoryQuery = searchParams?.get("category")
    const isCategoryPath = pathname.includes("/categories/")

    if (categoryQuery || isCategoryPath) {
      const categoryName =
        categoryQuery || pathname.split("/").pop() || "Category"

      if (meta_pixel?.active && (window as any).fbq) {
        ;(window as any).fbq("trackCustom", "ViewCategory", {
          content_category: categoryName,
        })
      }

      if (tiktok_pixel?.active && (window as any).ttq) {
        ;(window as any).ttq.track("ViewContent", {
          content_category: categoryName,
        })
      }
    }

    return () => clearInterval(intervalId)
  }, [pathname, searchParams, config])

  return null
}
