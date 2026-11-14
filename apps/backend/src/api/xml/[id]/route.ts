import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getXmlFeeds } from "../../admin/xml-export/route"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ error: "Feed ID is required" })
    }

    const feeds = getXmlFeeds()
    const feed = feeds.find(f => f.id === id)

    if (!feed) {
      return res.status(404).json({ error: "Feed not found" })
    }

    const query = req.scope.resolve("query")
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "thumbnail",
        "status",
        "categories.*",
        "images.*",
        "variants.*",
        "variants.prices.*"
      ],
      pagination: { skip: 0, take: 9999 } // Arbitrarily large number for full catalog
    })

    // Filter products based on config
    let filteredProducts = products

    if (feed.status === "Aktif Olanlar") {
      filteredProducts = filteredProducts.filter((p: any) => p.status === "published")
    }

    if (feed.hide_no_image) {
      filteredProducts = filteredProducts.filter((p: any) => p.thumbnail || (p.images && p.images.length > 0))
    }

    if (feed.categories && feed.categories.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => {
        if (!p.categories) return false
        return p.categories.some((cat: any) => feed.categories.includes(cat.id))
      })
    }
    const storefrontUrl = process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:8000"

    const getLocalMediaUrl = (url: string) => {
      if (!url) return ""
      if (url.includes("cdn.qukasoft.com") || url.includes("fametarz.com")) {
        const filename = url.split('/').pop()
        return `${storefrontUrl}/uploads/${filename}`
      }
      return url
    }

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`
    xml += `  <channel>\n`
    xml += `    <title>${feed.name}</title>\n`
    xml += `    <link>${storefrontUrl}</link>\n`
    xml += `    <description>${feed.name} Product Feed</description>\n`

    filteredProducts.forEach((product: any) => {
      const link = `${storefrontUrl}/tr/products/${product.handle}`
      let imageLink = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].url : "")
      imageLink = getLocalMediaUrl(imageLink)
      
      const desc = product.description ? product.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ""
      const title = product.title ? product.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ""

      // Find price (from first variant)
      let priceValue = 0
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0]
        if (variant.prices && variant.prices.length > 0) {
          const priceObj = variant.prices.find((p: any) => p.currency_code?.toUpperCase() === feed.currency.toUpperCase()) || variant.prices[0]
          priceValue = priceObj.amount
        }
      }

      // Apply profit margin if any
      if (feed.profit_margin && feed.profit_margin > 0) {
        priceValue = priceValue * (1 + feed.profit_margin / 100)
      }

      // For simplicity, we just use priceValue for both price and sale_price, or calculate fake sale price.
      // But we must output both tags.
      const priceString = `${priceValue.toFixed(2)} ${feed.currency.toUpperCase()}`
      const salePriceString = `${priceValue.toFixed(2)} ${feed.currency.toUpperCase()}`
      
      const itemId = product.id

      // Categories
      let catLabel = ""
      if (product.categories && product.categories.length > 0) {
         catLabel = product.categories[0].name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }

      const brand = feed.product_source || "XOOX"

      xml += `    <item>\n`
      xml += `      <g:id>${itemId}</g:id>\n`
      xml += `      <title>${title}</title>\n`
      xml += `      <g:title>${title}</g:title>\n`
      xml += `      <description>${desc}</description>\n`
      xml += `      <g:description>${desc}</g:description>\n`
      xml += `      <link>${link}</link>\n`
      xml += `      <g:link>${link}</g:link>\n`
      xml += `      <g:gtin></g:gtin>\n`
      xml += `      <g:mpn></g:mpn>\n`
      xml += `      <g:custom_label_0><![CDATA[${catLabel}]]></g:custom_label_0>\n`
      xml += `      <g:product_type><![CDATA[${catLabel}]]></g:product_type>\n`
      xml += `      <g:google_product_category/>\n`
      xml += `      <g:price>${priceString}</g:price>\n`
      xml += `      <price>${priceString}</price>\n`
      xml += `      <sale_price>${salePriceString}</sale_price>\n`
      xml += `      <g:sale_price>${salePriceString}</g:sale_price>\n`
      xml += `      <g:brand>${brand}</g:brand>\n`
      xml += `      <g:condition>new</g:condition>\n`
      xml += `      <availability>in_stock</availability>\n`
      xml += `      <g:availability>in_stock</g:availability>\n`
      xml += `      <g:image_link>${imageLink}</g:image_link>\n`

      if (product.images && product.images.length > 0) {
         product.images.forEach((img: any) => {
            const imgUrl = getLocalMediaUrl(img.url)
            xml += `      <g:additional_image_link>${imgUrl}</g:additional_image_link>\n`
            xml += `      <additional_image_link>${imgUrl}</additional_image_link>\n`
         })
      }

      xml += `      <g:shipping>\n`
      xml += `        <g:country>TR</g:country>\n`
      xml += `        <g:service>Standart</g:service>\n`
      xml += `        <g:price>0 TRY</g:price>\n`
      xml += `      </g:shipping>\n`
      xml += `    </item>\n`
    })

    xml += `  </channel>\n`
    xml += `</rss>`

    // Set correct content type
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)

  } catch (error) {
    console.error("Error generating XML feed:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
