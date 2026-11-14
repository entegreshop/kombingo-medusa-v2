import { notFound } from "next/navigation"

async function getPagesData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/pages`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    
    if (!res.ok) {
      throw new Error("Failed to fetch pages data")
    }
    
    const data = await res.json()
    return data.pages || {}
  } catch (error) {
    console.error("Error fetching pages:", error)
    return {}
  }
}

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  
  const pagesContent = await getPagesData()
  const pageData = pagesContent[slug]
  
  if (!pageData) {
    notFound()
  }

  return (
    <div className="content-container py-12 flex flex-col gap-8 min-h-[50vh]">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">{pageData.title}</h1>
      <div className="prose prose-zinc max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
        {pageData.content}
      </div>
    </div>
  )
}
