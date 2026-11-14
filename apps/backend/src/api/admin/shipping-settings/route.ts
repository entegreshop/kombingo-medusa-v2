import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "shipping-settings.json")

const defaultData = {
  systemType: "advanced", // "advanced" | "simple"
  standardShippingEnabled: true,
  standardShippingFee: 100,
  standardShippingCurrency: "TL",
  standardShippingCartType: "Tüm sepetlere ekle",
  freeShippingEnabled: true,
  freeShippingThreshold: 500,
  freeShippingCurrency: "TL",
  regions: [
    {
      id: "reg_tr",
      countryCode: "tr",
      countryName: "Türkiye",
      name: "Asya 1",
      cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"]
    }
  ],
  carriers: [
    {
      id: "carrier_aras",
      key: "aras",
      general: {
        name: "ARAS KARGO",
        active: true,
        description: "Aras kargo ile hızlı teslimat.",
        sortOrder: 4,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: true,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: true,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "PA4RQ2XMfG1DgwLrYO8pW3zs9tZ7yjvhINJd6FSk",
        apiFrom: "info@giyimbox.com",
        branchName: "MNG"
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_interline",
      key: "interline",
      general: {
        name: "INTERLINE KARGO",
        active: true,
        description: "",
        sortOrder: 0,
        taxNumber: "11111111111",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: true,
        autoGenerateBarcode: true,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "gvC8kSXzRBHMaW1Ucnls53N6KAZ0TFb7YGphm4QE",
        apiFrom: "modoskop@interlinekargo.com",
        branchName: "582"
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_kargoist",
      key: "kargoist",
      general: {
        name: "KARGOİST",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_ptt",
      key: "ptt",
      general: {
        name: "PTT Kargo",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_nova",
      key: "kargonova",
      general: {
        name: "KargoNOVA",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    }
  ],
  generalShippingFees: [],
  productSpecificFees: []
}

export function readConfig() {
  try {
    const legacyCwd = path.join(process.cwd(), ".xoox-shipping-settings.json")
    const legacyHome = path.join(os.homedir(), ".xoox-shipping-settings.json")
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyCwd)
        ? legacyCwd
        : fs.existsSync(legacyHome)
          ? legacyHome
          : null

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        regions: parsed.regions || defaultData.regions,
        carriers: parsed.carriers || defaultData.carriers,
        generalShippingFees: parsed.generalShippingFees || defaultData.generalShippingFees,
        productSpecificFees: parsed.productSpecificFees || defaultData.productSpecificFees
      }
    }
  } catch (err) {
    console.error("Error reading shipping config in admin api:", err)
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
    console.error("Error writing shipping config in admin api:", err)
    return false
  }
}

export function calculateEffectiveShippingKurus(itemsNetKurus: number, shippingConfig?: any): number {
  const cfg = shippingConfig || readConfig()
  if (!cfg || cfg.standardShippingEnabled === false) {
    return 0
  }
  const itemsNetTl = itemsNetKurus / 100
  if (cfg.freeShippingEnabled && itemsNetTl >= Number(cfg.freeShippingThreshold || 0)) {
    return 0
  }
  return Math.max(0, Math.round(Number(cfg.standardShippingFee ?? 0) * 100))
}

export async function syncMedusaShippingOptionPrices(scope: any, shippingConfig?: any): Promise<void> {
  try {
    const cfg = shippingConfig || readConfig()
    const fee = Number(cfg.standardShippingFee ?? 0)
    const medusaAmount = cfg.standardShippingEnabled === false ? 0 : Math.max(0, Math.round(fee * 100))

    const { ContainerRegistrationKeys, Modules } = await import("@medusajs/framework/utils")
    const { updateShippingOptionsWorkflow } = await import("@medusajs/core-flows")
    const query = scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: shippingOptions } = await query.graph({
      entity: "shipping_option",
      fields: [
        "id",
        "name",
        "price_type",
        "provider_id",
        "prices.*",
        "prices.price_rules.*",
        "service_zone.geo_zones.*",
        "shipping_profile.*"
      ],
      filters: {
        price_type: "flat"
      }
    })

    if (shippingOptions && shippingOptions.length > 0) {
      for (const option of (shippingOptions as any[])) {
        const tryPrices = (option.prices || []).filter(
          (p: any) => !p.currency_code || p.currency_code?.toLowerCase() === "try"
        )

        if (tryPrices.length > 0) {
          // 1. Update directly via Pricing Module if price_set_id is present
          try {
            const pricingModule = scope.resolve(Modules.PRICING)
            const priceSetIds = Array.from(
              new Set(tryPrices.map((p: any) => p.price_set_id).filter(Boolean))
            ) as string[]
            for (const psId of priceSetIds) {
              await pricingModule.updatePriceSets(psId, {
                prices: [{ amount: medusaAmount, currency_code: "try" }]
              })
            }
          } catch (pmErr) {
            console.warn(`Note: direct pricingModule update for shipping option ${option.id}:`, pmErr)
          }

          // 2. Also run updateShippingOptionsWorkflow for completeness
          const fallbackPrices = option.prices.map((p: any) => {
            const isTry = !p.currency_code || p.currency_code?.toLowerCase() === "try"
            const payload: any = {
              id: p.id,
              amount: isTry ? medusaAmount : p.amount,
              currency_code: p.currency_code || "try"
            }
            if (p.region_id) payload.region_id = p.region_id
            if (p.price_rules && p.price_rules.length > 0) {
              payload.rules = p.price_rules.map((pr: any) => ({
                attribute: pr.attribute,
                operator: pr.operator,
                value: pr.value
              }))
            }
            return payload
          })

          try {
            await updateShippingOptionsWorkflow(scope).run({
              input: [
                {
                  id: option.id,
                  prices: fallbackPrices
                }
              ]
            })
          } catch (wfErr) {
            console.warn(`Warning updating shipping option ${option.id} via workflow:`, wfErr)
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Warning syncing Medusa shipping option prices:", err)
  }
}

export async function syncCartShippingMethods(scope: any, cartId: string): Promise<number> {
  const shippingConfig = readConfig()
  try {
    const { Modules } = await import("@medusajs/framework/utils")
    const cartModule = scope.resolve(Modules.CART)
    const cart = await cartModule.retrieveCart(cartId, {
      relations: ["items", "shipping_methods"]
    })

    const subtotalKurus = (cart.items || [])
      .filter((i: any) => !i.title?.includes("Kapıda") && !i.metadata?.is_cod_fee)
      .reduce((acc: number, item: any) => acc + (Number(item.unit_price || 0) * Number(item.quantity || 1)), 0)

    const effectiveShippingKurus = calculateEffectiveShippingKurus(subtotalKurus, shippingConfig)

    if (cart.shipping_methods && cart.shipping_methods.length > 0) {
      const updates = cart.shipping_methods
        .filter((sm: any) => Number(sm.amount) !== effectiveShippingKurus)
        .map((sm: any) => ({
          id: sm.id,
          amount: effectiveShippingKurus
        }))

      if (updates.length > 0) {
        await cartModule.updateShippingMethods(updates)
      }
    }

    return effectiveShippingKurus
  } catch (err) {
    console.warn("syncCartShippingMethods warning:", err)
    return calculateEffectiveShippingKurus(0, shippingConfig)
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const fee = Number(body.standardShippingFee ?? 0)
  const currency = body.standardShippingCurrency || "TL"

  if (typeof fee !== "number" || !isFinite(fee) || fee < 0) {
    return res.status(400).json({ success: false, message: "Geçersiz kargo ücreti" })
  }
  if (currency !== "TL") {
    return res.status(400).json({ success: false, message: "Sadece TL desteklenmektedir" })
  }

  // 1. Always persist JSON config first so settings are never lost
  const savedToDisk = writeConfig(body)
  if (!savedToDisk) {
    return res.status(500).json({ success: false, message: "Ayar dosyaya kaydedilemedi." })
  }

  // 2. Sync canonical Medusa shipping options (both base TRY price and regional Turkey price)
  await syncMedusaShippingOptionPrices(req.scope, body)

  return res.json({ success: true, config: body })
}
