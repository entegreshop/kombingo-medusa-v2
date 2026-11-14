"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { updateCart, setShippingMethod, initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { sdk } from "@lib/config"
import X from "@modules/common/icons/x"
import Trash from "@modules/common/icons/trash"
import CartTotals from "@modules/common/components/cart-totals"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import { trackInitiateCheckout, trackAddPaymentInfo } from "@lib/util/tracking"

interface Installment {
  taksit: string
  oran: number
  active: boolean
}

interface PaymentConfig {
  free_shipping_threshold: number
  paytr: {
    active: boolean
    min_total: number
    max_total: number
    merchant_id?: string
    merchant_key?: string
    merchant_salt?: string
    test_mode?: string
    disable_3d_secure_intl?: boolean
    installments: Installment[]
  }
  bank_transfer: {
    active: boolean
    name: string
    adjustment_type: string
    adjustment_value: number
    instructions: string
    min_total: number
    max_total: number
  }
  cash_on_delivery: {
    active: boolean
    name: string
    adjustment_type: string
    adjustment_value: number
    instructions: string
    min_total: number
    max_total: number
  }
  card_on_delivery: {
    active: boolean
    name: string
    adjustment_type: string
    adjustment_value: number
    instructions: string
    min_total: number
    max_total: number
  }
}

interface ShippingConfig {
  systemType: string
  standardShippingEnabled: boolean
  standardShippingFee: number
  standardShippingCurrency: string
  standardShippingCartType: string
  freeShippingEnabled: boolean
  freeShippingThreshold: number
  freeShippingCurrency: string
  carriers?: Array<{
    id: string
    general: {
      name: string
      active: boolean
    }
  }>
}

type SinglePageCheckoutProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  shippingMethods: HttpTypes.StoreCartShippingOption[] | null
  paymentMethods: any[] | null
}

const CITIES_LIST = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", 
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", 
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", 
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", 
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", 
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", 
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", 
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort((a, b) => a.localeCompare(b, 'tr'))

const TURKEY_DISTRICTS: Record<string, string[]> = {
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Fatih", "Üsküdar", "Ataşehir", "Ümraniye", "Beylikdüzü", "Esenyurt", "Sarıyer", "Pendik", "Kartal", "Maltepe", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Eyüpsultan", "Gaziosmanpaşa", "Güngören", "Sancaktepe", "Silivri", "Sultanbeyli", "Sultangazi", "Tuzla", "Ümraniye", "Zeytinburnu"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Gölbaşı", "Pursaklar", "Akyurt", "Elmadağ", "Kahramankazan", "Polatlı", "Beypazarı"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Gaziemir", "Balçova", "Narlıdere", "Urla", "Çeşme", "Karabağlar", "Bayraklı", "Aliağa", "Bergama", "Dikili", "Foça", "Menderes", "Menemen", "Seferihisar", "Torbalı"],
  "Bursa": ["Osmangazi", "Nilüfer", "Yıldırım", "Mudanya", "Gemlik", "İnegöl", "Mustafakemalpaşa", "Karacabey", "Orhangazi", "Kestel", "Gürsu"],
  "Antalya": ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Kemer", "Serik", "Aksu", "Döşemealtı", "Finike", "Kumluca", "Kaş", "Gazipaşa"],
  "Adana": ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Ceyhan", "Kozan", "Karaisalı", "Pozantı"],
  "Konya": ["Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir", "Beyşehir"],
  "Gaziantep": ["Şahinbey", "Şehitkamil", "Nizip", "Oğuzeli", "İslahiye"],
  "Kayseri": ["Melikgazi", "Kocasinan", "Talas", "Develi", "Yahyalı"],
  "Mersin": ["Yenişehir", "Mezitli", "Toroslar", "Tarsus", "Akdeniz", "Silifke", "Erdemli", "Anamur"]
}

export default function SinglePageCheckout({
  cart,
  customer,
  shippingMethods,
  paymentMethods,
}: SinglePageCheckoutProps) {
  const router = useRouter()

  // --- Form States ---
  const [email, setEmail] = useState(cart?.email || "")
  const [firstName, setFirstName] = useState(cart?.shipping_address?.first_name || "")
  const [lastName, setLastName] = useState(cart?.shipping_address?.last_name || "")
  const [address1, setAddress1] = useState(cart?.shipping_address?.address_1 || "")
  const [address2, setAddress2] = useState(cart?.shipping_address?.address_2 || "")
  const [city, setCity] = useState(cart?.shipping_address?.province || "") // İl
  const [district, setDistrict] = useState(cart?.shipping_address?.city || "") // İlçe
  const [phone, setPhone] = useState(cart?.shipping_address?.phone || "")

  const [sameAsBilling, setSameAsBilling] = useState(true)

  // Billing address states
  const [billingType, setBillingType] = useState<"individual" | "corporate">("individual")
  const [tcNo, setTcNo] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [taxOffice, setTaxOffice] = useState("")
  const [taxNo, setTaxNo] = useState("")

  const [billingFirstName, setBillingFirstName] = useState("")
  const [billingLastName, setBillingLastName] = useState("")
  const [billingAddress1, setBillingAddress1] = useState("")
  const [billingAddress2, setBillingAddress2] = useState("")
  const [billingCity, setBillingCity] = useState("")
  const [billingDistrict, setBillingDistrict] = useState("")
  const [billingPhone, setBillingPhone] = useState("")

  // Shipping Method
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"paytr" | "cash_on_delivery" | "card_on_delivery" | "bank_transfer">("paytr")

  const handlePaymentMethodSelect = (
    method: "paytr" | "cash_on_delivery" | "card_on_delivery" | "bank_transfer",
    optionName: string
  ) => {
    setPaymentMethod(method)
    if (cart) {
      trackAddPaymentInfo({
        cart: {
          id: cart.id,
          total: (cart.total ?? 0) / 100,
          currency: (cart.currency_code || "TRY").toUpperCase(),
          items: cart.items || []
        },
        paymentOption: optionName
      })
    }
  }

  const [paymentSettings, setPaymentSettings] = useState<PaymentConfig | null>(null)
  const [shippingSettings, setShippingSettings] = useState<ShippingConfig | null>(null)

  // Fetch payment settings from backend
  useEffect(() => {
    const ts = new Date().getTime()
    sdk.client.fetch<{ config: PaymentConfig }>(`/store/payment-settings?t=${ts}`)
      .then((res) => {
        if (res && res.config) {
          console.log("Loaded payment settings:", res.config)
          setPaymentSettings(res.config)
        }
      })
      .catch((err) => {
        console.error("Error loading payment settings:", err)
      })
  }, [])

  const lastTrackedCartIdRef = useRef<string>("")

  // Track InitiateCheckout on mount
  useEffect(() => {
    if (cart && lastTrackedCartIdRef.current !== cart.id) {
      lastTrackedCartIdRef.current = cart.id
      trackInitiateCheckout({
        id: cart.id,
        total: (cart.total ?? 0) / 100, // convert from cents
        currency: (cart.currency_code || "TRY").toUpperCase(),
        items: cart.items || []
      })
    }
  }, [cart?.id])

  // Fetch shipping settings from backend
  useEffect(() => {
    const ts = new Date().getTime()
    sdk.client.fetch<{ config: ShippingConfig }>(`/store/shipping-settings?t=${ts}`)
      .then((res) => {
        if (res && res.config) {
          setShippingSettings(res.config)
        }
      })
      .catch((err) => {
        console.error("Error loading shipping settings:", err)
      })
  }, [])

  // Set default payment method based on availability
  useEffect(() => {
    if (!paymentSettings) return

    const subtotalVal = (cart.subtotal ?? 0) / 100
    const availableMethods: Array<"paytr" | "cash_on_delivery" | "card_on_delivery" | "bank_transfer"> = []

    const parseMin = (val: any) => val ? Number(val) : 0
    const parseMax = (val: any) => val ? Number(val) : 1000000
    const isActive = (val: any) => val === true || String(val) === "true"

    const paytr = paymentSettings.paytr
    if (isActive(paytr?.active) && subtotalVal >= parseMin(paytr?.min_total) && subtotalVal <= parseMax(paytr?.max_total)) {
      availableMethods.push("paytr")
    }

    const bt = paymentSettings.bank_transfer
    if (isActive(bt?.active) && subtotalVal >= parseMin(bt?.min_total) && subtotalVal <= parseMax(bt?.max_total)) {
      availableMethods.push("bank_transfer")
    }

    const cc = paymentSettings.card_on_delivery
    if (isActive(cc?.active) && subtotalVal >= parseMin(cc?.min_total) && subtotalVal <= parseMax(cc?.max_total)) {
      availableMethods.push("card_on_delivery")
    }

    const cod = paymentSettings.cash_on_delivery
    if (isActive(cod?.active) && subtotalVal >= parseMin(cod?.min_total) && subtotalVal <= parseMax(cod?.max_total)) {
      availableMethods.push("cash_on_delivery")
    }

    if (availableMethods.length > 0 && !availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0])
    }
  }, [paymentSettings, cart.subtotal, paymentMethod])

  // Card details mock
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardMonth, setCardMonth] = useState("Ay")
  const [cardYear, setCardYear] = useState("Yıl")
  const [cardCvv, setCardCvv] = useState("")

  const [agreeTerms, setAgreeTerms] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mobile Accordion state
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  // Districts for selected city
  const districts = useMemo(() => {
    if (!city) return []
    const list = TURKEY_DISTRICTS[city] || ["Merkez", "Diğer"]
    return Array.from(new Set(list))
  }, [city])

  // Reset district if it is not in the new city's districts list
  useEffect(() => {
    if (city && district && districts.length > 0 && !districts.includes(district)) {
      setDistrict("")
    }
  }, [city, districts])

  // Select default shipping option on mount if not set
  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !shippingMethodId) {
      const defaultOption = shippingMethods[0].id
      handleSetShippingMethod(defaultOption)
    }
  }, [shippingMethods, shippingMethodId])

  // --- Background updates ---
  const saveAddressBackground = async () => {
    if (!email || !firstName || !lastName || !address1 || !city || !district || !phone) {
      return
    }

    try {
      await updateCart({
        email,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2 || "",
          city: district,
          province: city,
          postal_code: "34000",
          country_code: "tr",
          phone: phone,
        },
        billing_address: sameAsBilling ? {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2 || "",
          city: district,
          province: city,
          postal_code: "34000",
          country_code: "tr",
          phone: phone,
        } : {
          first_name: billingFirstName || firstName,
          last_name: billingLastName || lastName,
          address_1: billingAddress1 || address1,
          address_2: billingAddress2 || "",
          city: billingDistrict || district,
          province: billingCity || city,
          postal_code: "34000",
          country_code: "tr",
          phone: billingPhone || phone,
        }
      })
    } catch (e) {
      console.error("Background address save failed:", e)
    }
  }

  const handleSetShippingMethod = async (id: string) => {
    setShippingMethodId(id)
    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
    } catch (e) {
      console.error("Failed to set shipping method:", e)
    }
  }

  // --- Card Number Format ---
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    const formatted = value.match(/.{1,4}/g)?.join(" ") || ""
    if (formatted.length <= 19) {
      setCardNumber(formatted)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 4) {
      setCardCvv(value)
    }
  }

  // --- Calculations for Free Shipping, Adjustments and Totals ---
  const subtotalAmount = (cart.subtotal ?? 0) / 100

  // Kargo ayarlarından gelen veya ödeme ayarlarından fallback olan ücretsiz kargo limiti
  const freeShippingThreshold = useMemo(() => {
    if (shippingSettings) {
      return shippingSettings.freeShippingEnabled ? shippingSettings.freeShippingThreshold : 1000000
    }
    if (paymentSettings) {
      return paymentSettings.free_shipping_threshold
    }
    return 500 // fallback default
  }, [shippingSettings, paymentSettings])

  const neededForFreeShipping = freeShippingThreshold - subtotalAmount

  const isFreeShipping = useMemo(() => {
    return subtotalAmount >= freeShippingThreshold
  }, [subtotalAmount, freeShippingThreshold])

  // Kargo seçeneğinin güncellenmiş ücreti (cents bazında)
  const shippingSubtotalCents = useMemo(() => {
    if (isFreeShipping) return 0
    
    const selectedMethod = cart.shipping_methods?.at(-1)
    const original = cart.shipping_subtotal ?? 0
    
    if (shippingSettings?.standardShippingEnabled && selectedMethod) {
      const name = selectedMethod.name || ""
      if (name.toLowerCase().includes("standard") || name.toLowerCase().includes("standart")) {
        return shippingSettings.standardShippingFee * 100
      }
    }
    return original
  }, [isFreeShipping, cart.shipping_methods, cart.shipping_subtotal, shippingSettings])

  // Check availability of payment methods based on settings and cart subtotal
  const {
    isPaytrAvailable,
    isBankTransferAvailable,
    isCashOnDeliveryAvailable,
    isCardOnDeliveryAvailable
  } = useMemo(() => {
    if (!paymentSettings) {
      return {
        isPaytrAvailable: true,
        isBankTransferAvailable: true,
        isCashOnDeliveryAvailable: true,
        isCardOnDeliveryAvailable: true
      }
    }

    const paytr = paymentSettings.paytr
    const bt = paymentSettings.bank_transfer
    const cod = paymentSettings.cash_on_delivery
    const cc = paymentSettings.card_on_delivery

    const parseMin = (val: any) => val ? Number(val) : 0
    const parseMax = (val: any) => val ? Number(val) : 1000000
    const isActive = (val: any) => val === true || String(val) === "true"

    return {
      isPaytrAvailable: isActive(paytr?.active) && subtotalAmount >= parseMin(paytr?.min_total) && subtotalAmount <= parseMax(paytr?.max_total),
      isBankTransferAvailable: isActive(bt?.active) && subtotalAmount >= parseMin(bt?.min_total) && subtotalAmount <= parseMax(bt?.max_total),
      isCashOnDeliveryAvailable: isActive(cod?.active) && subtotalAmount >= parseMin(cod?.min_total) && subtotalAmount <= parseMax(cod?.max_total),
      isCardOnDeliveryAvailable: isActive(cc?.active) && subtotalAmount >= parseMin(cc?.min_total) && subtotalAmount <= parseMax(cc?.max_total)
    }
  }, [paymentSettings, subtotalAmount])

  // Custom adjustments for surcharges or discounts
  const customAdjustments = useMemo(() => {
    const list: Array<{ label: string; amount: number; isDiscount: boolean }> = []
    if (!paymentSettings) return list

    if (paymentMethod === "bank_transfer" && paymentSettings.bank_transfer) {
      const bt = paymentSettings.bank_transfer
      if (bt.adjustment_type === "discount_percentage" && bt.adjustment_value > 0) {
        const val = Math.round((cart.subtotal ?? 0) * (bt.adjustment_value / 100))
        list.push({
          label: `${bt.name} İndirimi (%${bt.adjustment_value})`,
          amount: val,
          isDiscount: true
        })
      } else if (bt.adjustment_type === "surcharge_amount" && bt.adjustment_value > 0) {
        list.push({
          label: `${bt.name} Hizmet Bedeli`,
          amount: bt.adjustment_value * 100,
          isDiscount: false
        })
      }
    } else if (paymentMethod === "cash_on_delivery" && paymentSettings.cash_on_delivery) {
      const cod = paymentSettings.cash_on_delivery
      if (cod.adjustment_type === "surcharge_amount" && cod.adjustment_value > 0) {
        list.push({
          label: `${cod.name} Hizmet Bedeli`,
          amount: cod.adjustment_value * 100,
          isDiscount: false
        })
      }
    } else if (paymentMethod === "card_on_delivery" && paymentSettings.card_on_delivery) {
      const cc = paymentSettings.card_on_delivery
      if (cc.adjustment_type === "surcharge_amount" && cc.adjustment_value > 0) {
        list.push({
          label: `${cc.name} Hizmet Bedeli`,
          amount: cc.adjustment_value * 100,
          isDiscount: false
        })
      }
    }
    return list
  }, [paymentMethod, paymentSettings, cart.subtotal])

  // Adjusted totals with free shipping (BEFORE custom adjustments)
  const adjustedTotals = useMemo(() => {
    const originalShipping = cart.shipping_subtotal ?? 0
    let total = (cart.total ?? 0)
    
    // Original shipping bedelini çıkar, hesaplanmış yeni shipping bedelini ekle
    total = total - originalShipping + shippingSubtotalCents

    return {
      ...cart,
      shipping_subtotal: shippingSubtotalCents,
      total
    }
  }, [cart, shippingSubtotalCents])

  // Final adjusted total including custom adjustments (surcharge or discount)
  const finalAdjustedTotal = useMemo(() => {
    let total = adjustedTotals.total
    customAdjustments.forEach((adj) => {
      if (adj.isDiscount) {
        total -= adj.amount
      } else {
        total += adj.amount
      }
    })
    return total
  }, [adjustedTotals.total, customAdjustments])

  // --- Checkout Submit ---
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    if (!agreeTerms) {
      setErrorMessage("Lütfen kullanım koşullarını, mesafeli satış sözleşmesini ve iade politikasını kabul ediniz.")
      return
    }

    if (!email || !firstName || !lastName || !address1 || !city || !district || !phone) {
      setErrorMessage("Lütfen tüm zorunlu adres alanlarını doldurunuz.")
      return
    }

    if (paymentMethod === "paytr") {
      if (!cardName || !cardNumber || cardMonth === "Ay" || cardYear === "Yıl" || !cardCvv) {
        setErrorMessage("Lütfen kredi kartı bilgilerinizi eksiksiz doldurunuz.")
        return
      }
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // 1. Submit final addresses and metadata
      const updatedCart = await updateCart({
        email,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2 || "",
          city: district,
          province: city,
          postal_code: "34000",
          country_code: "tr",
          phone: phone,
        },
        billing_address: sameAsBilling ? {
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2 || "",
          city: district,
          province: city,
          postal_code: "34000",
          country_code: "tr",
          phone: phone,
        } : {
          first_name: billingFirstName || firstName,
          last_name: billingLastName || lastName,
          address_1: billingAddress1 || address1,
          address_2: billingAddress2 || "",
          city: billingDistrict || district,
          province: billingCity || city,
          postal_code: "34000",
          country_code: "tr",
          phone: billingPhone || phone,
        },
        metadata: {
          payment_option: paymentMethod,
          tc_no: sameAsBilling ? "" : (billingType === "individual" ? tcNo : ""),
          company_name: sameAsBilling ? "" : (billingType === "corporate" ? companyName : ""),
          tax_office: sameAsBilling ? "" : (billingType === "corporate" ? taxOffice : ""),
          tax_no: sameAsBilling ? "" : (billingType === "corporate" ? taxNo : ""),
          free_shipping_applied: isFreeShipping,
          original_shipping_subtotal: shippingSubtotalCents,
          custom_adjustments: customAdjustments,
          adjusted_total: finalAdjustedTotal
        }
      })

      // 2. Select shipping method
      const selectedOptionId = shippingMethodId || (shippingMethods && shippingMethods[0]?.id)
      if (selectedOptionId) {
        await setShippingMethod({ cartId: cart.id, shippingMethodId: selectedOptionId })
      }

      // 3. Initiate payment session
      let providerIdsToTry: string[] = []
      if (paymentMethod === "paytr") providerIdsToTry = ["pp_PAYTR_PAYTR", "pp_custom-payment_paytr", "pp_custom-payment_PAYTR", "pp_PAYTR", "PAYTR", "pp_paytr", "paytr"]
      else if (paymentMethod === "bank_transfer") providerIdsToTry = ["pp_BANK-TRANSFER_BANK-TRANSFER", "pp_custom-payment_bank-transfer", "pp_custom-payment_BANK-TRANSFER", "pp_BANK-TRANSFER", "BANK-TRANSFER", "pp_bank_transfer", "bank_transfer"]
      else if (paymentMethod === "cash_on_delivery") providerIdsToTry = ["pp_CASH-ON-DELIVERY_CASH-ON-DELIVERY", "pp_custom-payment_cash-on-delivery", "pp_custom-payment_CASH-ON-DELIVERY", "pp_CASH-ON-DELIVERY", "CASH-ON-DELIVERY", "pp_cod_cash", "cod_cash"]
      else if (paymentMethod === "card_on_delivery") providerIdsToTry = ["pp_CARD-ON-DELIVERY_CARD-ON-DELIVERY", "pp_custom-payment_card-on-delivery", "pp_custom-payment_CARD-ON-DELIVERY", "pp_CARD-ON-DELIVERY", "CARD-ON-DELIVERY", "pp_CASH-ON-DELIVERY_CASH-ON-DELIVERY", "pp_custom-payment_cash-on-delivery", "pp_custom-payment_CASH-ON-DELIVERY", "pp_CASH-ON-DELIVERY", "CASH-ON-DELIVERY", "pp_cod_cash", "cod_cash"]
      else providerIdsToTry = ["pp_system_default"]

      for (const pId of providerIdsToTry) {
        try {
          await initiatePaymentSession(updatedCart || cart, {
            provider_id: pId
          })
          break
        } catch (e: any) {
          console.warn("initiatePaymentSession fallback notice:", pId, e?.message)
        }
      }

      // 4. If PayTR is selected, invoke PayTR Direct API and redirect via client POST to 3D Secure
      if (paymentMethod === "paytr") {
        let clientIpv4 = ""
        try {
          const ipRes = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2500) })
          const ipData = await ipRes.json()
          if (ipData?.ip) clientIpv4 = ipData.ip
        } catch {}

        const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com"
        const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        const directRes = await fetch(`${MEDUSA_URL}/store/custom/paytr/direct`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_KEY
          },
          body: JSON.stringify({
            cart_id: cart.id,
            cc_owner: cardName,
            cc_number: cardNumber.replace(/\s/g, ""),
            cc_month: cardMonth,
            cc_year: cardYear.slice(-2),
            cc_cvv: cardCvv,
            client_ip: clientIpv4 || undefined
          })
        })
        const directData = await directRes.json()
        if (directData?.success && directData.requiresClientPost && directData.formParams && directData.postUrl) {
          const form = document.createElement("form")
          form.method = "POST"
          form.action = directData.postUrl
          form.style.display = "none"
          Object.entries(directData.formParams).forEach(([key, value]) => {
            const input = document.createElement("input")
            input.type = "hidden"
            input.name = key
            input.value = String(value)
            form.appendChild(input)
          })
          document.body.appendChild(form)
          form.submit()
          return
        } else {
          throw new Error(directData?.error || "Banka ile iletişim kurulamadı. Lütfen kart bilgilerinizi kontrol edin.")
        }
      }

      // 5. Place order for non-PayTR methods
      await placeOrder(cart.id)

    } catch (err: any) {
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setErrorMessage(err.message || "Siparişi tamamlanırken bir hata oluştu.")
      setIsSubmitting(false)
    }
  }



  return (
    <div className="w-full min-h-screen bg-[#fafafa] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          {/* LEFT COLUMN: Single Page Form */}
          <div className="flex flex-col gap-y-8 bg-white p-6 md:p-8 border border-gray-200">
            
            {/* 1. Teslimat Adresi / İletişim Bilgileri */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-6 pb-2 border-b border-gray-100">Teslimat Adresi</h2>
              
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">İletişim Bilgileri</label>
                <input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={saveAddressBackground}
                  required
                  className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Teslimat Adresi</label>
                <div className="grid grid-cols-1 gap-4">
                  <select
                    value="tr"
                    disabled
                    className="w-full h-11 px-4 border border-gray-200 focus:outline-none text-sm bg-gray-50 text-gray-500 appearance-none cursor-not-allowed"
                  >
                    <option value="tr">Türkiye</option>
                  </select>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Ad"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={saveAddressBackground}
                      required
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Soyad"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={saveAddressBackground}
                      required
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Adres"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    onBlur={saveAddressBackground}
                    required
                    className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                  />

                  <input
                    type="text"
                    placeholder="Apartman, daire, vb. (İsteğe Bağlı)"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    onBlur={saveAddressBackground}
                    className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value)
                        // Trigger background save on state change
                        setTimeout(saveAddressBackground, 50)
                      }}
                      required
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    >
                      <option value="">İl seçiniz</option>
                      {CITIES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value)
                        setTimeout(saveAddressBackground, 50)
                      }}
                      required
                      disabled={!city}
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white disabled:bg-zinc-50 disabled:text-zinc-400"
                    >
                      <option value="">İlçe seçiniz</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={saveAddressBackground}
                    required
                    className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                  />
                </div>
              </div>

              {/* Fatura Adresi checkbox */}
              <div className="mt-6">
                <label className="flex items-center gap-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => {
                      setSameAsBilling(e.target.checked)
                      setTimeout(saveAddressBackground, 50)
                    }}
                    className="w-5 h-5 rounded-none border-gray-300 text-black focus:ring-black accent-black"
                  />
                  <span className="text-sm text-zinc-900 font-medium select-none">
                    Fatura adresi teslimat adresi ile aynı
                  </span>
                </label>
              </div>
            </div>

            {/* Fatura Bilgileri (visible if billing address is NOT same as shipping) */}
            {!sameAsBilling && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Fatura Bilgileri</h3>
                
                <div className="flex gap-x-6 mb-4">
                  <label className="flex items-center gap-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingType"
                      checked={billingType === "individual"}
                      onChange={() => setBillingType("individual")}
                      className="w-4 h-4 text-black focus:ring-black accent-black"
                    />
                    <span className="text-sm font-medium text-zinc-900 select-none">Bireysel</span>
                  </label>
                  <label className="flex items-center gap-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingType"
                      checked={billingType === "corporate"}
                      onChange={() => setBillingType("corporate")}
                      className="w-4 h-4 text-black focus:ring-black accent-black"
                    />
                    <span className="text-sm font-medium text-zinc-900 select-none">Kurumsal</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {billingType === "individual" ? (
                    <div>
                      <input
                        type="text"
                        placeholder="T.C. Kimlik Numarası (İsteğe Bağlı)"
                        value={tcNo}
                        onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ""))}
                        maxLength={11}
                        className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                      />
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        E-Arşiv faturanızın sorunsuz kesilebilmesi için girebilirsiniz.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Firma Adı"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Vergi Dairesi"
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Vergi Numarası"
                        value={taxNo}
                        onChange={(e) => setTaxNo(e.target.value.replace(/\D/g, ""))}
                        maxLength={10}
                        className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                      />
                    </div>
                  )}

                  {/* Detailed Billing Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Fatura Adı"
                      value={billingFirstName}
                      onChange={(e) => setBillingFirstName(e.target.value)}
                      onBlur={saveAddressBackground}
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Fatura Soyadı"
                      value={billingLastName}
                      onChange={(e) => setBillingLastName(e.target.value)}
                      onBlur={saveAddressBackground}
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Fatura Adresi"
                    value={billingAddress1}
                    onChange={(e) => setBillingAddress1(e.target.value)}
                    onBlur={saveAddressBackground}
                    className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={billingCity}
                      onChange={(e) => {
                        setBillingCity(e.target.value)
                        setTimeout(saveAddressBackground, 50)
                      }}
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    >
                      <option value="">Fatura İli</option>
                      {CITIES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Fatura İlçesi"
                      value={billingDistrict}
                      onChange={(e) => setBillingDistrict(e.target.value)}
                      onBlur={saveAddressBackground}
                      className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                    />
                  </div>

                  <input
                    type="tel"
                    placeholder="Fatura Telefonu"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    onBlur={saveAddressBackground}
                    className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                  />
                </div>
              </div>
            )}

            {/* 2. Kargo Yöntemi */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Kargo Yöntemi</h2>
              
              <div className="grid grid-cols-1 gap-2">
                {shippingSettings?.carriers?.filter(c => c.general?.active).length ? (
                  shippingSettings.carriers.filter(c => c.general?.active).map((carrier) => {
                    const sm = shippingMethods?.[0]
                    const isSelected = shippingMethodId === carrier.id
                    
                    const basePrice = sm?.amount ? (sm.amount / 100) : 0
                    const optionPrice = shippingSettings?.standardShippingEnabled 
                      ? shippingSettings.standardShippingFee
                      : basePrice
                      
                    const displayPrice = isFreeShipping ? 0 : optionPrice
                    
                    return (
                      <div
                        key={carrier.id}
                        onClick={() => {
                          if (sm) {
                            handleSetShippingMethod(sm.id)
                          }
                          setShippingMethodId(carrier.id)
                        }}
                        className={`flex flex-col p-4 border cursor-pointer select-none transition-colors ${
                          isSelected ? "border-black bg-zinc-50" : "border-gray-200 bg-white hover:border-black"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-x-3">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-black focus:ring-black accent-black"
                            />
                            <span className="text-sm font-semibold text-zinc-900">
                              {carrier.general.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-zinc-900">
                            {displayPrice === 0 ? "Ücretsiz" : `₺${displayPrice.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : shippingMethods && shippingMethods.length > 0 ? shippingMethods.map((sm) => {
                  const isSelected = shippingMethodId === sm.id
                  
                  // Calculate dynamic option price
                  const basePrice = sm.amount ? (sm.amount / 100) : 0
                  const optionPrice = (shippingSettings?.standardShippingEnabled && (sm.name.toLowerCase().includes("standard") || sm.name.toLowerCase().includes("standart")))
                    ? shippingSettings.standardShippingFee
                    : basePrice
                    
                  const displayPrice = isFreeShipping ? 0 : optionPrice
                  
                  return (
                    <div
                      key={sm.id}
                      onClick={() => handleSetShippingMethod(sm.id)}
                      className={`flex flex-col p-4 border cursor-pointer select-none transition-colors ${
                        isSelected ? "border-black bg-zinc-50" : "border-gray-200 bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-x-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-black focus:ring-black accent-black"
                          />
                          <span className="text-sm font-semibold text-zinc-900">
                            {sm.name === "Standard Delivery" ? "Standart Kargo" : sm.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900">
                          {displayPrice === 0 ? "Ücretsiz" : `₺${displayPrice.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-sm text-zinc-500">Kargo seçeneği bulunamadı.</div>
                )}
              </div>

              {/* Free shipping banner */}
              {neededForFreeShipping > 0 && (
                <div className="mt-3 bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-700 font-medium text-center">
                  ₺{neededForFreeShipping.toFixed(2)} daha alışveriş yapın, kargonuz ücretsiz olsun!
                </div>
              )}
            </div>

            {/* 3. Ödeme */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Ödeme</h2>
              
              <div className="flex flex-col gap-3">
                {/* 3.1 Kredi / Banka Kartı (PayTR) */}
                {isPaytrAvailable && (
                  <div
                    className={`border transition-colors ${
                      paymentMethod === "paytr" ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <label
                      onClick={() => handlePaymentMethodSelect("paytr", "Kredi / Banka Kartı (PayTR)")}
                      className="flex items-center justify-between p-4 cursor-pointer select-none w-full"
                    >
                      <div className="flex items-center gap-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "paytr"}
                          onChange={() => {}}
                          className="w-4 h-4 text-black focus:ring-black accent-black"
                        />
                        <span className="text-sm font-semibold text-zinc-900">Kredi / Banka Kartı (PayTR)</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">PAYTR</span>
                    </label>

                    {paymentMethod === "paytr" && (
                      <div className="p-4 bg-zinc-50 border-t border-gray-100 flex flex-col gap-4">
                        <input
                          type="text"
                          placeholder="Kart Üzerindeki İsim"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Kart Numarası"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <select
                            value={cardMonth}
                            onChange={(e) => setCardMonth(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                          >
                            <option value="Ay">Ay</option>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={cardYear}
                            onChange={(e) => setCardYear(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                          >
                            <option value="Yıl">Yıl</option>
                            {Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() + i)).map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="CVV"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            className="w-full h-11 px-4 border border-gray-200 focus:outline-none focus:border-black text-sm bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-x-2 text-[11px] text-zinc-400 font-medium">
                          <svg className="w-16 h-5" viewBox="0 0 100 30" fill="currentColor">
                            <rect width="100" height="30" rx="3" fill="#005b9f"/>
                            <text x="50" y="20" fontSize="12" fill="white" fontWeight="bold" textAnchor="middle">PayTR</text>
                          </svg>
                          <span>GÜVENLİ ALTYAPI</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3.2 Havale / EFT */}
                {isBankTransferAvailable && (
                  <div
                    className={`border transition-colors ${
                      paymentMethod === "bank_transfer" ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <label
                      onClick={() => handlePaymentMethodSelect("bank_transfer", paymentSettings?.bank_transfer?.name || "Havale / EFT")}
                      className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${
                        paymentMethod === "bank_transfer" ? "bg-zinc-50" : "bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center gap-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={() => {}}
                          className="w-4 h-4 text-black focus:ring-black accent-black"
                        />
                        <span className="text-sm font-semibold text-zinc-900">
                          {paymentSettings?.bank_transfer?.name || "Havale / EFT"}
                        </span>
                      </div>
                      {paymentSettings?.bank_transfer?.adjustment_type === "discount_percentage" && paymentSettings.bank_transfer.adjustment_value > 0 && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          -%{paymentSettings.bank_transfer.adjustment_value} İndirim
                        </span>
                      )}
                    </label>

                    {paymentMethod === "bank_transfer" && paymentSettings?.bank_transfer?.instructions && (
                      <div className="p-4 bg-zinc-50 border-t border-gray-100 text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-semibold">
                        {paymentSettings.bank_transfer.instructions}
                      </div>
                    )}
                  </div>
                )}

                {/* 3.3 Kapıda Kredi Kartı ile Ödeme */}
                {isCardOnDeliveryAvailable && (
                  <div
                    className={`border transition-colors ${
                      paymentMethod === "card_on_delivery" ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <label
                      onClick={() => handlePaymentMethodSelect("card_on_delivery", paymentSettings?.card_on_delivery?.name || "Kapıda Kredi Kartı ile Ödeme")}
                      className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${
                        paymentMethod === "card_on_delivery" ? "bg-zinc-50" : "bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center gap-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "card_on_delivery"}
                          onChange={() => {}}
                          className="w-4 h-4 text-black focus:ring-black accent-black"
                        />
                        <span className="text-sm font-semibold text-zinc-900">
                          {paymentSettings?.card_on_delivery?.name || "Kapıda Kredi Kartı ile Ödeme"}
                        </span>
                      </div>
                      {paymentSettings?.card_on_delivery?.adjustment_type === "surcharge_amount" && paymentSettings.card_on_delivery.adjustment_value > 0 && (
                        <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                          +₺{paymentSettings.card_on_delivery.adjustment_value}
                        </span>
                      )}
                    </label>

                    {paymentMethod === "card_on_delivery" && paymentSettings?.card_on_delivery?.instructions && (
                      <div className="p-4 bg-zinc-50 border-t border-gray-100 text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-semibold">
                        {paymentSettings.card_on_delivery.instructions}
                      </div>
                    )}
                  </div>
                )}

                {/* 3.4 Kapıda Nakit Ödeme */}
                {isCashOnDeliveryAvailable && (
                  <div
                    className={`border transition-colors ${
                      paymentMethod === "cash_on_delivery" ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <label
                      onClick={() => handlePaymentMethodSelect("cash_on_delivery", paymentSettings?.cash_on_delivery?.name || "Kapıda Nakit Ödeme")}
                      className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${
                        paymentMethod === "cash_on_delivery" ? "bg-zinc-50" : "bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center gap-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "cash_on_delivery"}
                          onChange={() => {}}
                          className="w-4 h-4 text-black focus:ring-black accent-black"
                        />
                        <span className="text-sm font-semibold text-zinc-900">
                          {paymentSettings?.cash_on_delivery?.name || "Kapıda Nakit Ödeme"}
                        </span>
                      </div>
                      {paymentSettings?.cash_on_delivery?.adjustment_type === "surcharge_amount" && paymentSettings.cash_on_delivery.adjustment_value > 0 && (
                        <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                          +₺{paymentSettings.cash_on_delivery.adjustment_value}
                        </span>
                      )}
                    </label>

                    {paymentMethod === "cash_on_delivery" && paymentSettings?.cash_on_delivery?.instructions && (
                      <div className="p-4 bg-zinc-50 border-t border-gray-100 text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-semibold">
                        {paymentSettings.cash_on_delivery.instructions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile-only Accordion summary before terms */}
            <div className="lg:hidden border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="flex items-center justify-between w-full py-3 bg-zinc-50 border border-zinc-200 px-4 text-zinc-800 font-bold text-sm uppercase"
              >
                <span>SİPARİŞ ÖZETİ ({cart.items?.length || 0} adet)</span>
                <span className="flex items-center gap-x-2">
                  <span>
                    {convertToLocale({
                      amount: finalAdjustedTotal,
                      currency_code: cart.currency_code,
                    })}
                  </span>
                  <span>{summaryExpanded ? "▲" : "▼"}</span>
                </span>
              </button>

              {summaryExpanded && (
                <div className="p-4 border-x border-b border-zinc-200 bg-white flex flex-col gap-4">
                  <ItemsPreviewTemplate cart={cart} />
                  <div className="h-px bg-zinc-200 my-2" />
                  <CartTotals totals={adjustedTotals} customAdjustments={customAdjustments} />
                  <DiscountCode cart={cart} />
                </div>
              )}
            </div>

            {/* 4. Terms and Complete Button */}
            <div className="border-t border-gray-100 pt-6">
              <label className="flex items-start gap-x-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="w-5 h-5 mt-0.5 rounded-none border-gray-300 text-black focus:ring-black accent-black"
                />
                <span className="text-xs text-zinc-600 leading-normal select-none">
                  <a href="/legal/terms" className="underline hover:text-black">Kullanım Koşulları</a>,{" "}
                  <a href="/legal/distance-sales" className="underline hover:text-black">Mesafeli Satış Sözleşmesi</a> ve{" "}
                  <a href="/legal/return-policy" className="underline hover:text-black">İade Politikası</a>'nı okudum, anladım ve kabul ediyorum.
                </span>
              </label>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !agreeTerms}
                className={`w-full py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  isSubmitting || !agreeTerms
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                {isSubmitting ? "SİPARİŞİNİZ ALINIYOR..." : "Siparişi Tamamla"}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Desktop Sidebar Summary */}
          <div className="hidden lg:block sticky top-6">
            <div className="bg-white p-6 border border-gray-200 flex flex-col gap-y-6">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-gray-100 pb-3">Sipariş Özeti</h2>
              
              <ItemsPreviewTemplate cart={cart} />
              
              <div className="h-px bg-gray-100" />
              
              <CartTotals totals={adjustedTotals} customAdjustments={customAdjustments} />
              
              <div className="h-px bg-gray-100" />
              
              <DiscountCode cart={cart} />
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
