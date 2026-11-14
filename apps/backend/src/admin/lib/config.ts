import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: typeof window !== "undefined" ? window.location.origin : (process.env.VITE_MEDUSA_BACKEND_URL || "https://kombingo-backend-production.up.railway.app"),
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
})
