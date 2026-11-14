"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { HttpTypes } from "@medusajs/types"
import { TURKEY_PROVINCES, TURKEY_DATA } from "@lib/data/iller"
import { processQuickCheckout } from "@lib/data/quick-checkout"
import { trackEvent } from "@lib/util/tracking"

// Types need to be defined safely for our actions
// import { processQuickCheckout } from "@lib/data/quick-checkout"

type QuickCheckoutModalProps = {
  isOpen: boolean
  onClose: () => void
  mode: "product" | "cart"
  product?: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  preselectedVariantId?: string
  cart?: any
}

export default function QuickCheckoutModal({
  isOpen,
  onClose,
  mode,
  product,
  region,
  preselectedVariantId,
  cart,
}: QuickCheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Data States
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    city: "",
    order_note: "",
    coupon: "",
    payment_method: "credit_card",
    invoice_type: "bireysel", // bireysel, kurumsal
    tckn: "",
    vkn: "",
    tax_office: "",
    company_name: "",
    // CC Fields
    cc_owner: "",
    cc_number: "",
    cc_month: "",
    cc_year: "",
    cc_cvv: "",
  })
  
  const [successData, setSuccessData] = useState<{orderId: string} | null>(null)
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [directPaytrHtml, setDirectPaytrHtml] = useState<string | null>(null)

  // Variant & Quantity
  const [quantity, setQuantity] = useState(1)
  const [variantId, setVariantId] = useState(preselectedVariantId || (product?.variants?.[0]?.id || ""))
  const [isMounted, setIsMounted] = useState(false)
  
   // Custom Dynamic Aras Logo
  const ARAS_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZmlsbD0iIzEzMkI1QiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCI+QVJBUzwvdGV4dD48L3N2Zz4=";
  const [arasLogoUrl, setArasLogoUrl] = useState(ARAS_BASE64);
  const [storeLogoUrl, setStoreLogoUrl] = useState("/logo.png");

  // Popup açma fonksiyonu
  const openPopup = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.open(url, "Sozlesme", "width=800,height=700,left=200,top=100,scrollbars=yes,resizable=yes");
  };

  // COD Settings
  const [codSettings, setCodSettings] = useState({ is_active: true, additional_fee: 70, min_amount: 3000 });
  const [codCcSettings, setCodCcSettings] = useState({ is_active: false, additional_fee: 70, min_amount: 3000 });
  const [paymentSettings, setPaymentSettings] = useState({
     bank_active: true,
     paytr_active: true,
  });
  const hasTrackedPaymentRef = useRef(false);

  // Shipping Settings
  const [shippingSettings, setShippingSettings] = useState({
     standard_rate: 60,
     free_shipping_limit: 3000,
     free_shipping_enabled: true
  });

  // --- PRICE PRE-CALCULATION FOR META EVENTS ---
  let priceStr = "Hesaplanıyor..."
  let numericalPrice = 0;
  let cartSubtotal = 0;
  let cartDiscount = 0;
  
  if (mode === "product" && product) {
     const v = product.variants?.find((vx: any) => vx.id === variantId) || product.variants?.[0] as any
     numericalPrice = ((v?.calculated_price?.calculated_amount || 0) / 100) * quantity;
     priceStr = v?.calculated_price?.calculated_amount ? `${(numericalPrice).toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL` : "Detaylı Ücret Seçilmedi"
  } else if (mode === "cart" && cart) {
     numericalPrice = (cart.total || 0) / 100;
     cartSubtotal = ((cart.item_subtotal || 0) + (cart.tax_total || 0)) / 100; // Ara toplam ve vergi (indirimsiz tutarı görebilmek için)
     cartDiscount = (cart.discount_total || cart.discount_subtotal || 0) / 100;
     // Eğer indirim varsa Sepet fiyatı kısmında asıl fiyatı gösterelim, aşağıda indirimi düşeriz.
     priceStr = `${(cartDiscount > 0 ? (numericalPrice + cartDiscount) : numericalPrice).toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL`
  }

  let kargoFiyati = shippingSettings.standard_rate;
  if (shippingSettings.free_shipping_enabled && numericalPrice >= shippingSettings.free_shipping_limit) {
      kargoFiyati = 0;
  }
  
  const isCodActive = formData.payment_method === "cash_on_delivery";
  const isCodCcActive = formData.payment_method === "cod_cc";
  const finalValue = numericalPrice > 0 ? numericalPrice + kargoFiyati + (isCodActive ? codSettings.additional_fee : (isCodCcActive ? codCcSettings.additional_fee : 0)) : 0;
  const totalWithShippingStr = numericalPrice > 0 ? `${finalValue.toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL` : priceStr;

  useEffect(() => {
    setIsMounted(true)
    
    // Dynamic Shipping & COD Fetch
    if (isOpen) {
       const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com";
       const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
       
       const fetchOptions = {
          headers: { "x-publishable-api-key": PUBLISHABLE_KEY }
       };

       fetch(`${MEDUSA_URL}/store/custom/payment-cod`, fetchOptions)
          .then(res => res.json())
          .then(data => {
             if (data?.settings) {
                setCodSettings({
                   is_active: data.settings.is_active,
                   additional_fee: parseFloat(data.settings.additional_fee) || 0,
                   min_amount: parseFloat(data.settings.min_amount) || Infinity
                })
             }
          }).catch(err => console.error("COD bilgieri çekilemedi", err))

       fetch(`${MEDUSA_URL}/store/custom/settings`, fetchOptions)
          .then(res => res.json())
          .then(data => {
              if (data?.settings) {
                  if (data.settings.admin_logos?.main) {
                      let mainLogo = data.settings.admin_logos.main;
                      if (mainLogo.includes("localhost:9000")) {
                          mainLogo = mainLogo.replace(/http:\/\/localhost:9000/g, MEDUSA_URL);
                      }
                      setStoreLogoUrl(mainLogo);
                  }
                  
                  setPaymentSettings({
                     bank_active: data.settings.payment_bank?.active !== false, // default true if undefined
                     paytr_active: data.settings.payment_paytr?.active !== false,
                  });
                  if (data.settings.payment_cod_cc) {
                     setCodCcSettings({
                        is_active: data.settings.payment_cod_cc.is_active ?? false,
                        additional_fee: parseFloat(data.settings.payment_cod_cc.additional_fee) || 0,
                        min_amount: parseFloat(data.settings.payment_cod_cc.min_amount) || Infinity
                     });
                  }
                  
                  if (data.settings.shipping_settings) {
                     setShippingSettings({
                        standard_rate: parseFloat(data.settings.shipping_settings.standard_rate) || 60,
                        free_shipping_limit: parseFloat(data.settings.shipping_settings.free_shipping_limit) || 3000,
                        free_shipping_enabled: data.settings.shipping_settings.free_shipping_enabled !== false
                     });
                  }
              }
          }).catch(err => console.error("Ayarlar çekilemedi", err))

       fetch(`${MEDUSA_URL}/store/custom/shipping-carriers`, fetchOptions)
          .then(res => res.json())
          .then(data => {
              if (data?.shipping_carriers) {
                 const aras = data.shipping_carriers.find((c: any) => c.name === "Aras Kargo");
                 if (aras && aras.logo_url && aras.logo_url !== "aras") {
                    let finalUrl = aras.logo_url;
                    if (!finalUrl.startsWith("http")) {
                        finalUrl = finalUrl.startsWith("/") ? `${MEDUSA_URL}${finalUrl}` : `${MEDUSA_URL}/${finalUrl}`;
                    }
                    setArasLogoUrl(finalUrl);
                 }
              }
          })
          .catch(err => console.error("Kargo bilgileri çekilemedi", err))
    }
  }, [isOpen])

  // META CONVERSION: InitiateCheckout (Sepet veya Direk Ödeme Başlangıcı)
  useEffect(() => {
     if (isOpen && isMounted) {
        // Modal açıldığında, ürün sayfasından seçilen bedeni doğrudan formata kopyala
        if (preselectedVariantId) {
           setVariantId(preselectedVariantId)
        }

        if (finalValue > 0) {
           trackEvent("begin_checkout", {
              content_ids: mode === "product" && product ? [product.id] : cart?.items?.map((i:any) => i.variant_id) || [],
              content_name: mode === "product" ? product?.title : "Sepet Çoklu Siparişi",
              value: finalValue,
              currency: "TRY"
           })
        }
     }
  }, [isOpen, isMounted, preselectedVariantId]) // preselectedVariantId eklendi

  // Effect to automatically fallback from COD to Havale if limit exceeded
  useEffect(() => {
     if (numericalPrice > codSettings.min_amount && formData.payment_method === 'cash_on_delivery') {
        setFormData(prev => ({ ...prev, payment_method: 'credit_card' }))
     }
  }, [numericalPrice, codSettings.min_amount, formData.payment_method])

  if (!isOpen || !isMounted) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    
    // META CONVERSION: AddPaymentInfo (Ödeme Bilgisi Seçildiğinde)
    if (e.target.name === "payment_method" && !hasTrackedPaymentRef.current) {
        trackEvent("add_payment_info", {
           content_ids: mode === "product" && product ? [product.id] : cart?.items?.map((i:any) => i.variant_id) || [],
           content_name: e.target.value, // Seçilen ödeme türünü ilet
           value: finalValue,
           currency: "TRY"
        })
        hasTrackedPaymentRef.current = true;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
        let clientIpv4 = ""
        if (formData.payment_method === "credit_card") {
            try {
                const ipRes = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2500) })
                const ipData = await ipRes.json()
                if (ipData?.ip) clientIpv4 = ipData.ip
            } catch {}
        }

        // Doğrudan Server Action çağrılır
        const result = await processQuickCheckout({
            ...formData,
            country_code: region.countries?.[0]?.iso_2 || "tr",
            cart_id: cart?.id,
            variant_id: variantId,
            quantity: quantity,
            client_ip: clientIpv4 || undefined
        })

        if (result.success) {
           if (result.requiresClientPost && result.formParams && result.postUrl) {
               // Render loading state while submitting
               setDirectPaytrHtml('<div style="display:flex;align-items:center;justify-center:center;height:100%;">Bankaya yönlendiriliyorsunuz...</div>');
               
               // Create dynamic form and submit to PayTR
               const form = document.createElement("form");
               form.method = "POST";
               form.action = result.postUrl;
               form.style.display = "none";
               
               Object.entries(result.formParams).forEach(([key, value]) => {
                   const input = document.createElement("input");
                   input.type = "hidden";
                   input.name = key;
                   input.value = String(value);
                   form.appendChild(input);
               });
               
               document.body.appendChild(form);
               form.submit();
           } else if (result.requiresDirectHtml && result.html) {
               // Render the 3D secure HTML form
               setDirectPaytrHtml(result.html);
               
               // The HTML usually contains an auto-submitting form or javascript
               setTimeout(() => {
                  const container = document.getElementById("paytr-direct-container");
                  if (container) {
                     const forms = container.getElementsByTagName("form");
                     if (forms.length > 0) {
                        forms[0].submit();
                     } else {
                        // try to execute any scripts inside the html
                        const scripts = container.getElementsByTagName("script");
                        for (let i = 0; i < scripts.length; i++) {
                            window.eval(scripts[i].innerHTML);
                        }
                     }
                  }
               }, 100);

           } else {
               // META CONVERSION: Purchase (Sipariş Başarılı)
               trackEvent("purchase", {
                  content_ids: mode === "product" && product ? [product.id] : cart?.items?.map((i:any) => i.variant_id) || [],
                  content_name: mode === "product" ? product?.title : "Sepet Çoklu Siparişi",
                  value: finalValue,
                  currency: "TRY"
               })

               // Başarılı sipariş sonrası hemen yeni "Thank You" sayfasına yönlendir
               window.location.href = `/${region.countries?.[0]?.iso_2 || "tr"}/order/${result.orderId}/confirmed`
           }
        } else {
           setError(result.error || "Sipariş tamamlanırken hata oluştu.")
        }
    } catch (err: any) {
        console.error("Client Error:", err)
        setError(err.message || "İşlem sırasında bir hata oluştu.")
    } finally {
        setLoading(false)
    }
  }

  const handleViewOrder = () => {
      onClose()
      if (successData?.orderId) {
          window.location.href = `/${region.countries?.[0]?.iso_2 || "tr"}/order/${successData.orderId}/confirmed`
      } else {
          window.location.reload()
      }
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-gray-50 flex flex-col w-full h-full overflow-y-auto">
      <div className="w-full max-w-[800px] mx-auto bg-white min-h-full flex flex-col shadow-sm relative">
        {/* Success Screen */}
        {successData ? (
           <div className="flex flex-col items-center justify-center p-12 text-center bg-white h-auto animate-in fade-in zoom-in duration-300">
               <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
               </div>
               <h2 className="text-[28px] font-extrabold text-gray-900 mb-2 tracking-tight">Siparişiniz Alındı!</h2>
               <p className="text-[15px] leading-relaxed text-gray-500 mb-8 max-w-md">Bizi tercih ettiğiniz için teşekkür ederiz. Siparişiniz başarıyla alındı ve en kısa sürede kargoya verilecektir.</p>
               
               <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-5 w-full max-w-[340px] mx-auto mb-10 shadow-sm text-center">
                  <p className="text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Sipariş Numaranız</p>
                  <p className="text-[22px] font-mono font-bold text-black tracking-widest">
                     {(successData.orderId.split('_')[1] || successData.orderId).substring(0, 10).toUpperCase()}
                  </p>
               </div>

               <button onClick={handleViewOrder} className="w-full max-w-[340px] bg-[#25D366] text-white px-8 py-3.5 rounded-lg font-bold tracking-wide hover:bg-[#128C7E] transition-colors shadow-md">
                  SİPARİŞ DETAYINI GÖR
               </button>
           </div>
        ) : directPaytrHtml ? (
           <div className="flex flex-col flex-1 h-full bg-white relative">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-bold">Güvenli Ödeme (3D Secure)</h2>
                  <button onClick={() => setDirectPaytrHtml(null)} className="text-sm font-semibold underline text-gray-600 hover:text-black">İptal ve Geri Dön</button>
               </div>
               <div className="flex-1 w-full h-full min-h-[600px] relative bg-white flex items-center justify-center">
                  <div className="text-center p-8">
                     <span className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin inline-block mb-4"></span>
                     <p className="font-semibold">Bankanızın güvenli 3D doğrulama sayfasına yönlendiriliyorsunuz, lütfen bekleyin...</p>
                  </div>
                  <div id="paytr-direct-container" dangerouslySetInnerHTML={{ __html: directPaytrHtml }} className="hidden" />
               </div>
           </div>
        ) : (
          <>
            {/* ====== HEADER & ACCORDION ====== */}
            <div className="w-full flex flex-col shadow-sm">
               {/* Header */}
               <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm">
                  <div className="flex-1 flex items-center">
                    <img src={storeLogoUrl} alt="Logo" className="h-[22px] md:h-[26px] object-contain w-auto" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }} />
                  </div>
                  <button type="button" onClick={onClose} className="p-2" aria-label="Close Checkout">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
             </div>

        {/* Content Form Data */}
        <div className="p-4 sm:p-6">
          <form id="quick-checkout" onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto w-full">
            
            {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-[13px] font-semibold">{error}</div>}

            {/* Teslimat Adresi (Heading block) */}
            <div className="pt-0">
               <h2 className="text-2xl font-bold mb-6">Teslimat Adresi</h2>
               
               {/* Iletisim Bilgileri */}
               <h3 className="text-base font-bold mb-3">İletişim Bilgileri</h3>
               <div className="mb-6">
                 <input type="email" name="email" required placeholder="E-posta" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none" value={formData.email} onChange={handleInputChange} />
               </div>

               {/* Teslimat Adresi Form */}
               <h3 className="text-base font-bold mb-3">Teslimat Adresi</h3>
               <div className="space-y-3.5 mb-6">
                  <div className="relative">
                     <select disabled className="w-full border border-gray-300 rounded-md p-3.5 text-sm bg-white text-gray-700 appearance-none">
                        <option>Türkiye</option>
                     </select>
                     <svg className="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                     <input required type="text" name="first_name" placeholder="Ad" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none" value={formData.first_name} onChange={handleInputChange} />
                     <input required type="text" name="last_name" placeholder="Soyad" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none" value={formData.last_name} onChange={handleInputChange} />
                  </div>
                  
                  <input required type="text" name="address" placeholder="Adres" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none" value={formData.address} onChange={handleInputChange} />
                  <input type="text" name="order_note" placeholder="Apartman, daire, vb. (İsteğe Bağlı)" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none" value={formData.order_note} onChange={handleInputChange} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                     <div className="relative">
                        <select required name="province" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white appearance-none" value={formData.province} onChange={(e) => {
                           // Reset district when province changes
                           setFormData({ ...formData, province: e.target.value, city: "" });
                        }}>
                           <option value="">İl seçiniz</option>
                           {TURKEY_PROVINCES.map(il => <option key={il} value={il}>{il}</option>)}
                        </select>
                        <svg className="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                     </div>
                     <div className="relative">
                        <select required name="city" disabled={!formData.province} className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white appearance-none disabled:opacity-50 disabled:bg-gray-50" value={formData.city} onChange={handleInputChange}>
                           <option value="">İlçe seçiniz</option>
                           {formData.province && TURKEY_DATA[formData.province as keyof typeof TURKEY_DATA]?.map((ilce: string) => (
                              <option key={ilce} value={ilce}>{ilce}</option>
                           ))}
                        </select>
                        <svg className="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                     </div>
                  </div>
                  
                  <input required type="tel" name="phone" placeholder="Telefon" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none" value={formData.phone} onChange={handleInputChange} />
                  
                  <div className="pt-4 pb-8 border-b border-gray-200">
                     <label className="flex items-center gap-x-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-black bg-black rounded shadow-sm cursor-pointer" />
                        <span className="text-sm font-semibold text-gray-900 mt-0.5">Fatura adresi teslimat adresi ile aynı</span>
                     </label>
                  </div>
               </div>
            </div>

            {/* Fatura Bilgileri (E-Fatura Entegrasyonu) */}
            <div className="pt-2">
               <h2 className="text-2xl font-bold mb-6">Fatura Bilgileri</h2>
               
               <div className="flex gap-x-4 mb-4">
                  <label className="flex items-center gap-x-2 cursor-pointer">
                     <input type="radio" name="invoice_type" value="bireysel" checked={formData.invoice_type === "bireysel"} onChange={handleInputChange} className="w-5 h-5 accent-black cursor-pointer" />
                     <span className="text-sm font-medium text-black">Bireysel</span>
                  </label>
                  <label className="flex items-center gap-x-2 cursor-pointer">
                     <input type="radio" name="invoice_type" value="kurumsal" checked={formData.invoice_type === "kurumsal"} onChange={handleInputChange} className="w-5 h-5 accent-black cursor-pointer" />
                     <span className="text-sm font-medium text-black">Kurumsal</span>
                  </label>
               </div>

               <div className="space-y-3.5 mb-6 bg-gray-50 p-4 border border-gray-200 rounded-md">
                   {formData.invoice_type === "bireysel" && (
                       <div>
                          <input type="text" name="tckn" maxLength={11} placeholder="T.C. Kimlik Numarası (İsteğe Bağlı)" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white" value={formData.tckn} onChange={handleInputChange} />
                          <p className="text-[11px] text-gray-500 mt-1">E-Arşiv faturanızın sorunsuz kesilebilmesi için girebilirsiniz.</p>
                       </div>
                   )}

                   {formData.invoice_type === "kurumsal" && (
                       <div className="space-y-3.5 animate-in fade-in slide-in-from-top-2">
                           <input type="text" name="company_name" required placeholder="Firma Ünvanı" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white" value={formData.company_name} onChange={handleInputChange} />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                               <input type="text" name="tax_office" required placeholder="Vergi Dairesi" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white" value={formData.tax_office} onChange={handleInputChange} />
                               <input type="text" name="vkn" required maxLength={10} placeholder="Vergi No (VKN)" className="w-full border border-gray-300 rounded-md p-3.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white" value={formData.vkn} onChange={handleInputChange} />
                           </div>
                       </div>
                   )}
               </div>
            </div>

            {/* Kargo Yöntemi */}
            <div className="pt-2">
               <h2 className="text-2xl font-bold mb-6">Kargo Yöntemi</h2>
               <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
                 <div className="p-4 flex flex-row items-center justify-between">
                   <label className="flex items-center gap-x-4 cursor-pointer w-full">
                     <input type="radio" checked readOnly className="w-5 h-5 accent-black cursor-pointer" />
                     <span className="text-[15px] font-medium text-black">Standart Kargo</span>
                   </label>
                   <span className="text-[15px] font-bold text-gray-900">
                     {kargoFiyati === 0 ? "Ücretsiz" : `₺${kargoFiyati.toLocaleString("tr-TR", {minimumFractionDigits: 2})}`}
                   </span>
                 </div>
                 {shippingSettings.free_shipping_enabled && kargoFiyati > 0 && numericalPrice > 0 && (
                    <div className="bg-gray-50 p-3 border-t border-gray-200 text-sm text-gray-600 font-medium text-center">
                       {`₺${(shippingSettings.free_shipping_limit - numericalPrice).toLocaleString("tr-TR", {minimumFractionDigits: 2})} daha alışveriş yapın, kargonuz ücretsiz olsun!`}
                    </div>
                 )}
               </div>
            </div>

            <hr className="border-gray-200" />

            {/* Odeme Yontemi */}
            <div className="pt-2">
              <h2 className="text-2xl font-bold mb-6">Ödeme</h2>
              <div className="space-y-4">
                 {["cash_on_delivery:Kapıda Nakit Ödeme", "cod_cc:Kapıda Kredi Kartı ile Ödeme", "havale:Havale / EFT", "credit_card:Kredi / Banka Kartı (PayTR)"].map(m => {
                    const [val, label] = m.split(":")
                    if (val === 'cash_on_delivery' && (!codSettings.is_active || numericalPrice > codSettings.min_amount)) {
                        return null;
                    }
                    if (val === 'cod_cc' && (!codCcSettings.is_active || numericalPrice > codCcSettings.min_amount)) {
                        return null;
                    }
                    if (val === 'havale' && !paymentSettings.bank_active) {
                        return null;
                    }
                    if (val === 'credit_card' && !paymentSettings.paytr_active) {
                        return null;
                    }

                    const isSelected = formData.payment_method === val
                    return (
                      <div key={val} className={`border rounded-md overflow-hidden ${isSelected ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'}`}>
                          <label className="flex items-center gap-x-4 cursor-pointer p-4">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-black' : 'border-gray-400'}`}>
                               {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                            </div>
                            <input type="radio" name="payment_method" value={val} checked={isSelected} onChange={handleInputChange} className="hidden" />
                            <span className="text-[15px] text-black tracking-wide">{label}</span>
                          </label>
                          
                          {isSelected && val === "credit_card" && (
                              <div className="p-4 pt-0 space-y-3.5 bg-gray-50">
                                 <input type="text" name="cc_owner" required placeholder="Kart Üzerindeki İsim" className="w-full border border-gray-300 p-3.5 text-sm rounded-md bg-white outline-none focus:border-black" value={formData.cc_owner} onChange={handleInputChange} />
                                 <input type="text" name="cc_number" required maxLength={19} placeholder="Kart Numarası" className="w-full border border-gray-300 p-3.5 text-sm rounded-md bg-white outline-none focus:border-black" value={formData.cc_number} onChange={(e) => {
                                     // Basic formatting for card number
                                     let val = e.target.value.replace(/\D/g, '');
                                     if (val.length > 0) {
                                         val = val.match(/.{1,4}/g)?.join(' ') || val;
                                     }
                                     setFormData({...formData, cc_number: val});
                                 }} />
                                 <div className="grid grid-cols-2 gap-3.5">
                                    <select name="cc_month" required className="w-full border border-gray-300 p-3.5 text-sm rounded-md bg-white outline-none focus:border-black" value={formData.cc_month} onChange={handleInputChange}>
                                       <option value="">Ay</option>
                                       {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select name="cc_year" required className="w-full border border-gray-300 p-3.5 text-sm rounded-md bg-white outline-none focus:border-black" value={formData.cc_year} onChange={handleInputChange}>
                                       <option value="">Yıl</option>
                                       {Array.from({length: 15}, (_, i) => (new Date().getFullYear() + i).toString().slice(-2)).map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <input type="text" name="cc_cvv" required maxLength={4} placeholder="CVV" className="w-full border border-gray-300 p-3.5 text-sm rounded-md bg-white outline-none focus:border-black col-span-2" value={formData.cc_cvv} onChange={handleInputChange} />
                                 </div>
                                 <div className="flex items-center gap-x-2 mt-2">
                                     <img src="https://www.paytr.com/img/general/PayTR-Odeme-Kurulusu.svg" alt="PayTR" className="h-5 mix-blend-multiply opacity-80" />
                                     <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Güvenli Altyapı</span>
                                 </div>
                              </div>
                          )}
                      </div>
                    )
                 })}
              </div>
            </div>

            {/* SİPARİŞ ÖZETİ ACCORDION (ALTA TAŞINDI) */}
            <div className="bg-white border-t border-gray-200 pt-2 pb-2 mt-4">
               <button type="button" onClick={() => setIsSummaryOpen(!isSummaryOpen)} className="w-full py-4 flex items-center justify-between text-left px-2">
                  <span className="flex items-center gap-x-2 text-[14px] font-bold tracking-wider text-black">
                     SİPARİŞ ÖZETİ 
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${isSummaryOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
                  </span>
                  <span className="text-[17px] font-bold text-black">{totalWithShippingStr}</span>
               </button>

               {/* ACCORDION CONTENT */}
               <div className={`overflow-hidden transition-all duration-300 ${isSummaryOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 space-y-4 px-2">
                     {/* Product or Cart Details - CAROUSEL */}
                     <div className="flex flex-col gap-y-3 pb-4 border-b border-gray-200">
                        <div className="text-[13px] font-semibold text-gray-700">Sepetteki Ürünleriniz ({mode === "cart" && cart ? cart.items?.length || 0 : 1} adet)</div>
                        
                        <div className="w-full overflow-x-auto custom-scrollbar pb-3 pt-3 px-1 -mx-1">
                           <div className="flex items-start gap-x-4 w-max pr-3">
                              {mode === "product" && product && (
                                 <div className="flex flex-col flex-shrink-0 w-[80px]">
                                    <div className="relative mb-2">
                                       <div className="w-[80px] h-[100px] bg-gray-50 flex items-center justify-center overflow-hidden rounded-md border border-gray-200">
                                          <img src={product.thumbnail || ""} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
                                       </div>
                                       <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#8c8c8c] text-white text-[11px] font-bold flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">{quantity}</span>
                                    </div>
                                    <div className="space-y-0.5 text-center px-0.5">
                                       <p className="text-[12px] text-[#6b7280] truncate font-medium">{priceStr}</p>
                                       <p className="text-[11px] text-[#8c8c8c]">Variant: {product.variants?.find((v:any) => v.id === preselectedVariantId)?.title?.split(" ")?.[0] || "Standart"}</p>
                                    </div>
                                 </div>
                              )}
                              
                              {mode === "cart" && cart && cart.items?.map((item: any) => (
                                 <div key={item.id} className="flex flex-col flex-shrink-0 w-[80px]">
                                    <div className="relative mb-2">
                                       <div className="w-[80px] h-[100px] bg-gray-50 flex items-center justify-center overflow-hidden rounded-md border border-gray-200">
                                          <img src={item.thumbnail || ""} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                                       </div>
                                       <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#8c8c8c] text-white text-[11px] font-bold flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">{item.quantity}</span>
                                    </div>
                                    <div className="space-y-0.5 text-center px-0.5">
                                       <p className="text-[12px] text-[#6b7280] truncate font-medium">{((item.unit_price || 0) / 100).toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL</p>
                                       <p className="text-[11px] text-[#8c8c8c]">Variant: {item.variant?.title?.split(" ")?.[0] || "Std"}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Totals inside Accordion */}
                     <div className="space-y-3.5 text-[13.5px] px-1">
                        <div className="flex justify-between text-[#6b7280]">
                          <span>Ara Toplam</span>
                          <span>{priceStr}</span>
                        </div>
                        {mode === "cart" && cartDiscount > 0 && (
                           <div className="flex justify-between text-red-600 font-bold">
                             <span>İndirim</span>
                             <span>- {cartDiscount.toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL</span>
                           </div>
                        )}
                        <div className="flex justify-between text-[#6b7280]">
                           <span>Kargo</span>
                           <span>60,00 TL</span>
                        </div>
                        {isCodActive && codSettings.additional_fee > 0 && (
                           <div className="flex justify-between text-[#6b7280]">
                              <span>Kapıda Ödeme</span>
                              <span>+ {codSettings.additional_fee.toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL</span>
                           </div>
                        )}
                        {isCodCcActive && codCcSettings.additional_fee > 0 && (
                           <div className="flex justify-between text-[#6b7280]">
                              <span>Kapıda Kredi Kartı Ödemesi</span>
                              <span>+ {codCcSettings.additional_fee.toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL</span>
                           </div>
                        )}
                     </div>

                     <div className="pt-4 pb-2 border-t border-gray-200 flex justify-between text-[16px] font-bold text-black px-1 mt-2">
                        <span>Toplam</span>
                        <div className="text-right flex flex-col justify-end">
                           <span className="text-[18px]">{totalWithShippingStr}</span>
                           <span className="text-[11px] text-[#6b7280] font-normal mt-1">
                               {mode === "product" ? `Vergi ${(numericalPrice * 0.20).toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL` :
                                (mode === "cart" && cart?.tax_total) ? `Vergi ${(cart.tax_total / 100).toLocaleString("tr-TR", {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL` : ""}
                           </span>
                        </div>
                     </div>

                     {/* KUPON ALANI */}
                     <div className="pt-2 px-1">
                        <div className="flex flex-col gap-y-2">
                           {formData.coupon ? (
                               <div className="text-sm font-semibold text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                  Kupon sisteme alındı: {formData.coupon}
                               </div>
                           ) : (
                               <div className="flex gap-x-2">
                                  <input type="text" name="coupon" placeholder="Kupon Kodu Ekle" className="flex-1 border border-gray-300 rounded p-2.5 text-[13px] focus:border-black outline-none bg-white placeholder-gray-400" value={formData.coupon} onChange={handleInputChange} />
                                  <button type="button" onClick={() => alert("Kuponunuz sisteme eklendi. Uygunluğu sipariş özetinize otomatik yansıtılacaktır.")} className="bg-gray-200 hover:bg-gray-300 px-5 rounded font-bold text-[13px] text-gray-700 transition-colors">Uygula</button>
                               </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Sözleşmeler Toggable Text */}
            <div className="pt-6 border-t border-gray-200 mt-8 mb-6">
               <label className="flex items-start gap-x-3 cursor-pointer group">
                 <div className="flex items-center justify-center w-5 h-5 mt-0.5 rounded shadow-sm bg-black border border-black flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <span className="text-[13px] text-gray-700 leading-relaxed font-medium">
                   <a href="/pages/kvkk" onClick={(e) => openPopup(e, "/pages/kvkk")} className="underline hover:text-black">Kullanım Koşulları</a>, <a href="/pages/mesafeli-satis" onClick={(e) => openPopup(e, "/pages/mesafeli-satis")} className="underline hover:text-black">Mesafeli Satış Sözleşmesi</a> ve <a href="/pages/iade-ve-degisim" onClick={(e) => openPopup(e, "/pages/iade-ve-degisim")} className="underline hover:text-black">İade Politikası</a>'nı okudum, anladım ve kabul ediyorum.
                 </span>
               </label>
            </div>

            {/* Siparis Tamamla Butonu */}
            <button form="quick-checkout" type="submit" disabled={loading} className="w-full bg-[#1A1A1A] hover:bg-black text-white py-4 rounded-md font-bold text-base flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               ) : (
                  "Siparişi Tamamla"
               )}
            </button>
            
            {/* Footer Area */}
            <div className="pt-10 pb-8 flex flex-col items-center justify-center space-y-4">
               <div className="text-center space-y-1">
                  <p className="text-[12.5px] text-[#8c8c8c] font-medium tracking-wide">Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.</p>
                  <p className="text-[12.5px] text-[#8c8c8c] font-medium tracking-wide">© {new Date().getFullYear()} Kombingo.com Tüm Hakları Saklıdır</p>
               </div>
               <div className="flex items-center gap-x-3 mt-4 w-full justify-center">
                  <div className="w-[50px] h-[32px] border border-gray-200 rounded flex items-center justify-center bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-1.5">
                     <svg viewBox="0 0 38 12" xmlns="http://www.w3.org/2000/svg" className="h-[11px]"><path fill="#1A1F71" fillRule="evenodd" clipRule="evenodd" d="M14.28 0l-2.22 11.23h3.58L17.86 0h-3.58zm19.34 3.09c-.58-.27-1.48-.52-2.61-.52-2.85 0-4.86 1.45-4.87 3.53-.02 1.54 1.45 2.39 2.56 2.91 1.13.53 1.51.87 1.51 1.34 0 .72-.92 1.05-1.78 1.05-1.18 0-1.81-.17-2.77-.58l-.39-.18-.4 2.38c.68.3 1.94.57 3.26.58 3.03 0 5.01-1.43 5.03-3.64.02-1.22-.72-2.16-2.47-2.96-1.01-.5-1.63-.84-1.63-1.35 0-.47.54-.95 1.7-.95 1 0 1.74.2 2.39.46l.28.13.41-2.26zm-13.62 8.14h3.31l3.15-11.23h-3.17c-.52 0-.91.15-1.14.7l-4.5 10.53h3.45l.69-1.91h4.21l.4 1.91zm.55-4.47l1.09-2.91c-.01 0 .22-.6.35-1.04l.18.891s.52 2.5 1.25 3.06h-2.87zM8.38 0L6 .11.21 11.23h3.69L4.62 9h4.54l.43 2.23h3.41L8.38 0zm-3.3 6.64l1.49-3.951L7.54 6.64H5.08z"/></svg>
                  </div>
                  <div className="w-[50px] h-[32px] border border-gray-200 rounded flex items-center justify-center bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-1.5">
                     <svg viewBox="0 0 32 10" xmlns="http://www.w3.org/2000/svg" className="h-[9px]"><path fill="#00AEEF" d="M31.28 0h-29L0 4.67l2.25 4.96h29l.75-4.96L31.28 0zM12.98 7.9L11.53 4l-1.39 3.9H5.5L7.26 1.7h4.86l2.92 6.2H12.98zM24 7.9h-4V1.7h3.76v1.44h-2.18v1.12h1.94v1.36h-1.94v.85H24V7.9zm6.35 0h-3.13l-.53-1l-.54 1h-1.6l1.24-2.18-1.2-2.16h1.56l.54 1.04.53-1.04h1.55l-1.18 2.16 1.26 2.18zM9.54 6.3l-.33-.94-.38 1h.71zM18.83 5h2v2.9h1.5V1.7h-3.48l-1.29 4.36L16.29 1.7h-1.74v6.2h1.5V5h2V5zM17.57 5H15V3.46h2.57V5z "/></svg>
                  </div>
                  <div className="w-[50px] h-[32px] border border-gray-200 rounded flex items-center justify-center bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-1">
                     <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" className="h-[13px]"><circle fill="#EA001B" cx="12" cy="10" r="9.5"/><circle fill="#F7A000" cx="20" cy="10" r="9.5"/><path fill="#FF5F00" d="M16 17.5a9.462 9.462 0 000-15 9.462 9.462 0 000 15z"/></svg>
                  </div>
               </div>
            </div>
          </form>
        </div>
        </>
      )}

      </div>
    </div>,
    document.body
  )
}
