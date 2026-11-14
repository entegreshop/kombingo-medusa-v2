import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Heading, Text, Button, toast } from "@medusajs/ui"
import { useState } from "react"

const InterlineOrderWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [loading, setLoading] = useState(false)
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  
  const metadata = data.metadata || {}
  const barcode = metadata.interline_barcode as string | undefined
  const recordId = metadata.interline_record_id as string | undefined

  const handleSendToCargo = async () => {
    if (!confirm("Bu siparişi İnterline Kargo'ya göndermek istediğinize emin misiniz?")) return
    
    setLoading(true)
    try {
      const response = await fetch("/admin/interline-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: data.id })
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Başarılı", {
          description: "Sipariş İnterline Kargo'ya iletildi. Barkod: " + result.barcode,
        })
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error("Hata", {
          description: result.error || "Kargoya iletilirken bir hata oluştu.",
        })
      }
    } catch (err: any) {
      toast.error("Hata", { description: err.message })
    }
    setLoading(false)
  }

  const handlePrintBarcode = async () => {
    if (!barcode) return
    setBarcodeLoading(true)
    try {
      const response = await fetch(`/admin/interline-action?barcode=${barcode}`)
      const result = await response.json()
      if (result.success && result.base64) {
        // Create a download link for the base64 pdf
        const linkSource = `data:application/pdf;base64,${result.base64}`
        const downloadLink = document.createElement("a")
        downloadLink.href = linkSource
        downloadLink.download = `interline_barkod_${barcode}.pdf`
        downloadLink.click()
        toast.success("İndiriliyor", { description: "Barkod PDF olarak indirildi." })
      } else {
        toast.error("Bulunamadı", { description: "Barkod çıktısı alınamadı." })
      }
    } catch (err: any) {
      toast.error("Hata", { description: err.message })
    }
    setBarcodeLoading(false)
  }

  return (
    <Container className="p-6 mb-4 flex flex-col gap-4 shadow-sm border border-ui-border-base rounded-xl">
      <div className="flex items-center gap-2">
        <Heading level="h2" className="text-xl font-semibold">İnterline Kargo Durumu</Heading>
      </div>

      {!barcode ? (
        <div className="flex flex-col gap-4 mt-2">
          <Text className="text-ui-fg-subtle">
            Bu sipariş henüz İnterline Kargo'ya iletilmedi. Gönderim emri vermek için "Kargolandı" durumuna getirebilir veya aşağıdaki butonu kullanabilirsiniz.
          </Text>
          <div>
            <Button variant="secondary" onClick={handleSendToCargo} isLoading={loading}>
              Manuel Kargo Gönderimi Yap
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          <div className="bg-ui-bg-subtle p-4 rounded-lg border border-ui-border-base flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Text className="text-xs text-ui-fg-muted font-medium mb-1">BARKOD / TAKİP NO</Text>
              <Text className="font-mono text-lg font-bold text-ui-fg-base">{barcode}</Text>
            </div>
            {recordId && (
              <div>
                <Text className="text-xs text-ui-fg-muted font-medium mb-1">KAYIT ID</Text>
                <Text className="font-mono text-sm text-ui-fg-base">{recordId}</Text>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button 
                variant="primary" 
                onClick={handlePrintBarcode} 
                isLoading={barcodeLoading}
              >
                Barkod Yazdır (PDF)
              </Button>
              <a 
                href={`https://webpostman.interlineexpress.com/tracking?har_kod=${barcode}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary">
                  Kargo Takip
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default InterlineOrderWidget
