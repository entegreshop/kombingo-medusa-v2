import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductsWorkflow } from "@medusajs/core-flows"
import { XMLParser } from "fast-xml-parser"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { url, tag_mappings, category_mappings } = req.body as { 
      url: string, 
      tag_mappings: Record<string, string>,
      category_mappings?: { src: string, dst: string, marginAmt: string, marginPct: string, active: boolean }[]
    }
    
    if (!url || !tag_mappings) {
      return res.status(400).json({ message: "URL ve eşleştirmeler gerekli." })
    }

    const response = await fetch(url)
    const xmlData = await response.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    })
    const jsonObj = parser.parse(xmlData)

    const findFirstArray = (obj: any): any[] | null => {
      for (const key in obj) {
        if (Array.isArray(obj[key])) return obj[key];
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const res = findFirstArray(obj[key]);
          if (res) return res;
        }
      }
      return null;
    }

    let items = findFirstArray(jsonObj);
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "XML içerisinde ürün bulunamadı." })
    }

    // Filter items based on category mappings (skip inactive categories)
    if (category_mappings && category_mappings.length > 0) {
      items = items.filter(item => {
        let itemCat = item.category_path
        if (!itemCat) {
          const cats: string[] = []
          if (item.cat1name) cats.push(item.cat1name)
          if (item.cat2name) cats.push(item.cat2name)
          if (item.cat3name) cats.push(item.cat3name)
          if (cats.length > 0) itemCat = cats.join(" > ")
          else if (item.category) itemCat = String(item.category)
        }

        if (itemCat) {
          const mapped = category_mappings.find(m => m.src === itemCat)
          if (mapped && mapped.active === false) {
            return false // skip product
          }
        }
        return true
      })
    }

    // Process a maximum of 5 products for safety during testing to avoid freezing the system
    const productsToProcess = items.slice(0, 5);
    const createdProductsCount = productsToProcess.length;

    // Resolve Sales Channel
    const salesChannelService = req.scope.resolve("sales_channel")
    const channels = await salesChannelService.listSalesChannels()
    const channelId = channels[0]?.id

    // Resolve Product Categories
    const productModuleService = req.scope.resolve("product")
    const existingCategories = await productModuleService.listProductCategories({}, { take: 1000 })

    // Helper to resolve nested object path (e.g., "subproducts > subproduct > price_list")
    const resolvePath = (obj: any, path: string) => {
      if (!path) return undefined;
      const parts = path.split(" > ")
      let current = obj
      for (const part of parts) {
        if (current === undefined || current === null) return undefined
        if (Array.isArray(current)) {
           current = current[0]
        }
        current = current[part]
      }
      return current
    }

    const productsInput = productsToProcess.map(item => {
      // Get basic mapped values
      const name = resolvePath(item, tag_mappings["Ürün Adı"] || "name") || item.name || "İsimsiz Ürün"
      const handle = String(resolvePath(item, tag_mappings["Ürün Kodu"] || "code") || item.code || Math.random().toString(36).substring(7)).toLowerCase().replace(/[^a-z0-9]/g, '-')
      const description = resolvePath(item, tag_mappings["İçerik"] || "description") || item.detail || ""
      
      // Determine Category
      let productCategories: { id: string }[] = [];
      if (category_mappings && category_mappings.length > 0) {
        let itemCat = item.category_path
        if (!itemCat) {
          const cats: string[] = []
          if (item.cat1name) cats.push(item.cat1name)
          if (item.cat2name) cats.push(item.cat2name)
          if (item.cat3name) cats.push(item.cat3name)
          if (cats.length > 0) itemCat = cats.join(" > ")
          else if (item.category) itemCat = String(item.category)
        }
        if (itemCat) {
          const mapped = category_mappings.find(m => m.src === itemCat)
          if (mapped && mapped.active && mapped.dst) {
             const matchedCat = existingCategories.find(c => c.name === mapped.dst)
             if (matchedCat) {
               productCategories = [{ id: matchedCat.id }]
             }
          }
        }
      }

      // Try to get images
      let images: { url: string }[] = []
      
      const image1Key = tag_mappings["Ana Resim"] || "image1";
      const resolvedImg = resolvePath(item, image1Key);
      
      if (resolvedImg) {
         if (Array.isArray(resolvedImg)) {
            images = resolvedImg.map((url: string) => ({ url }))
         } else if (typeof resolvedImg === "string") {
            images.push({ url: resolvedImg })
         }
      } else if (item.images && item.images.img_item) {
         if (Array.isArray(item.images.img_item)) {
            images = item.images.img_item.map((url: string) => ({ url }))
         } else if (typeof item.images.img_item === "string") {
            images.push({ url: item.images.img_item })
         }
      }
      
      // Also check multiple image tags if Ana Resim was not an array
      if (images.length <= 1) {
         for (let i = 2; i <= 16; i++) {
            const imgKey = tag_mappings[`Resim ${i}`] || `image${i}`;
            const imgUrl = resolvePath(item, imgKey);
            if (imgUrl && typeof imgUrl === "string" && imgUrl.startsWith("http")) {
               images.push({ url: imgUrl });
            }
         }
      }

      // Handle Variants (subproducts)
      let xmlVariants: any[] = [];
      if (item.subproducts && item.subproducts.subproduct) {
         if (Array.isArray(item.subproducts.subproduct)) {
            xmlVariants = item.subproducts.subproduct;
         } else {
            xmlVariants = [item.subproducts.subproduct];
         }
      } else {
         xmlVariants = [item];
      }

      // Extract unique Options from Variants
      const optionNames = new Set<string>();
      if (xmlVariants[0]?.type1) optionNames.add("Renk");
      if (xmlVariants[0]?.type2) optionNames.add("Beden");
      if (optionNames.size === 0) optionNames.add("Standart");

      const optionsInput = Array.from(optionNames).map(opt => ({
         title: opt,
         values: Array.from(new Set(xmlVariants.map(v => {
            if (opt === "Renk") return String(v.type1 || "Standart");
            if (opt === "Beden") return String(v.type2 || "Standart");
            return "Standart";
         })))
      }));

      const variantsInput = xmlVariants.map((v, idx) => {
         // Resolve variant specific fields using mappings
         // We fallback to main product if not found in variant
         
         const skuRaw = resolvePath(v, tag_mappings["Ürün Kodu"] || "code") || resolvePath(item, tag_mappings["Ürün Kodu"] || "code") || item.ws_code || item.code || Math.random().toString();
         const sku = String(skuRaw) + (idx > 0 ? `-${idx}` : "");
         
         const priceRaw = resolvePath(v, tag_mappings["Satış Fiyatı"] || "price") || resolvePath(item, tag_mappings["Satış Fiyatı"] || "price") || v.price_list || item.price_list || 0;
         const price = parseFloat(String(priceRaw)) || 0;
         
         const costPriceRaw = resolvePath(v, tag_mappings["Alış Fiyatı"] || "price") || resolvePath(item, tag_mappings["Alış Fiyatı"] || "price") || v.price_list || item.price_list || 0;
         const costPrice = parseFloat(String(costPriceRaw)) || 0;

         const barcodeRaw = resolvePath(v, tag_mappings["Barkod"] || "barcode") || resolvePath(item, tag_mappings["Barkod"] || "barcode") || v.barcode || "";
         const barcode = String(barcodeRaw);
         
         const stockRaw = resolvePath(v, tag_mappings["Stok"] || "stockAmount") || resolvePath(item, tag_mappings["Stok"] || "stockAmount") || v.stock || item.stock || "0";
         const stock = parseInt(String(stockRaw), 10);

         const variantOptions: Record<string, string> = {};
         if (optionNames.has("Renk")) variantOptions["Renk"] = String(v.type1 || "Standart");
         if (optionNames.has("Beden")) variantOptions["Beden"] = String(v.type2 || "Standart");
         if (optionNames.has("Standart")) variantOptions["Standart"] = "Standart";

         return {
            title: sku,
            sku: sku,
            barcode: barcode,
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: stock,
            prices: [
               {
                  amount: price,
                  currency_code: "try"
               }
            ],
            options: variantOptions,
            metadata: { stock, cost_price: costPrice }
         }
      });

      return {
        title: String(name),
        handle: handle,
        description: String(description),
        status: "published" as any,
        images: images,
        categories: productCategories,
        metadata: {
           seo_title: item.seo_title || "",
           seo_description: item.seo_description || ""
        },
        options: optionsInput,
        variants: variantsInput,
        sales_channels: channelId ? [{ id: channelId }] : []
      }
    })

    await createProductsWorkflow(req.scope).run({
      input: {
        products: productsInput
      }
    })

    res.json({ success: true, importedCount: createdProductsCount })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
