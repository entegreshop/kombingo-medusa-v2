import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Text, Button, Input, Textarea, usePrompt } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { sdk } from "../../lib/config"

export const config = defineRouteConfig({
  label: "Kurumsal Sayfalar",
  icon: DocumentText,
})

export default function SayfalarPage() {
  const [pages, setPages] = useState<Record<string, { title: string, content: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("hakkimizda")
  const prompt = usePrompt()

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setIsLoading(true)
      const response: any = await sdk.client.fetch(`/admin/pages`)
      setPages(response.pages || {})
    } catch (e) {
      console.error("Failed to fetch pages", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await sdk.client.fetch(`/admin/pages`, {
        method: "POST",
        body: { pages }
      })
      
      const confirm = await prompt({
        title: "Başarılı",
        description: "Kurumsal sayfalar başarıyla güncellendi.",
        confirmText: "Tamam"
      })
    } catch (e) {
      console.error("Failed to save pages", e)
      const confirm = await prompt({
        title: "Hata",
        description: "Sayfalar güncellenirken bir hata oluştu.",
        confirmText: "Tamam"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPages(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        title: e.target.value
      }
    }))
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPages(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        content: e.target.value
      }
    }))
  }

  const pageKeys = Object.keys(pages)

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center p-8">
        <Text>Yükleniyor...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading className="mb-2">Kurumsal Sayfa Yönetimi</Heading>
          <Text className="text-ui-fg-subtle">
            Müşterilerinizin göreceği "Hakkımızda", "Mesafeli Satış Sözleşmesi", "KVKK" vb. kurumsal sözleşme ve bilgi sayfalarını buradan düzenleyebilirsiniz.
          </Text>
        </div>
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2 border-r border-ui-border-base pr-4">
          {pageKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === key
                  ? "bg-ui-bg-base-hover font-medium text-ui-fg-base shadow-sm"
                  : "text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base"
              }`}
            >
              {pages[key]?.title || key}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col gap-6">
          {activeTab && pages[activeTab] ? (
            <>
              <div className="flex flex-col gap-2">
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  Sayfa Başlığı
                </Text>
                <Input
                  value={pages[activeTab].title}
                  onChange={handleTitleChange}
                  placeholder="Sayfa başlığını girin..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  Sayfa İçeriği
                </Text>
                <Textarea
                  value={pages[activeTab].content}
                  onChange={handleContentChange}
                  placeholder="Sayfa içeriğini buraya yazın..."
                  className="min-h-[400px] resize-y"
                />
              </div>
            </>
          ) : (
            <Text className="text-ui-fg-subtle">Düzenlemek için sol menüden bir sayfa seçin.</Text>
          )}
        </div>
      </div>
    </Container>
  )
}
