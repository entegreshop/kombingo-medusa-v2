import React, { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import ExcelIoTab from "./components/excel-io-tab"
import XmlExportTab from "./components/xml-export-tab"
import XmlImportTab from "./components/xml-import-tab"

const XmlOperationsPage = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const t = params.get("tab")
      if (t === "export" || t === "import" || t === "excel") return t
    }
    return "excel"
  })
  const [lastSyncedSearch, setLastSyncedSearch] = useState<string>("")

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return
      const currentSearch = window.location.search
      setLastSyncedSearch((prev) => {
        if (prev === currentSearch) return prev
        const params = new URLSearchParams(currentSearch)
        const tabParam = params.get("tab")
        if (tabParam === "export") {
          setActiveTab("export")
        } else if (tabParam === "import") {
          setActiveTab("import")
        } else if (tabParam === "excel") {
          setActiveTab("excel")
        } else {
          setActiveTab("excel")
        }
        return currentSearch
      })
    }
    syncFromUrl()
    window.addEventListener("popstate", syncFromUrl)
    const interval = setInterval(syncFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncFromUrl)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="w-full pb-12">
      {activeTab === "excel" && <ExcelIoTab />}
      {activeTab === "import" && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <XmlImportTab />
        </div>
      )}
      {activeTab === "export" && <XmlExportTab />}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "İçeri / Dışarı Aktar",
  icon: DocumentText,
})

export default XmlOperationsPage
