"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheTag, removeCartId } from "./cookies"
import { getRegion } from "./regions"
import { revalidateTag } from "next/cache"
import { HttpTypes } from "@medusajs/types"
import fs from "fs"

function logToFile(msg: string) {
  try {
    const logPath = require('path').join(process.cwd(), 'checkout-debug.log');
    fs.appendFileSync(logPath, new Date().toISOString() + ': ' + msg + '\n');
  } catch (e) {}
}

const fetchWithTimeout = async (url: string, options: any, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal as any });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

export type QuickCheckoutFormData = {
  first_name: string
  last_name: string
  phone: string
  email: string
  address: string
  city: string
  province: string
  variant_id?: string
  quantity?: number
  order_note?: string
  payment_method: string
  cart_id?: string
  country_code: string
  coupon?: string
  // E-Fatura Alanları
  invoice_type?: string
  tckn?: string
  vkn?: string
  tax_office?: string
  company_name?: string
  // CC Fields for Direct API
  cc_owner?: string
  cc_number?: string
  cc_month?: string
  cc_year?: string
  cc_cvv?: string
  client_ip?: string
}

export async function processQuickCheckout(data: QuickCheckoutFormData) {
  logToFile("--- QUICK CHECKOUT STARTED ---");
  logToFile("Data: " + JSON.stringify({ ...data, cc_number: data.cc_number ? "****" : undefined, cc_cvv: "***" }));
  try {
    logToFile("Getting auth headers...");
    const headers = { ...(await getAuthHeaders()) }
    let targetCartId = data.cart_id
    logToFile("targetCartId: " + targetCartId);

    // 1. Eger "Urun Sayfasi"ndan (Hizli Satin Al) gelmisse, yepyeni bir sepet olustur ve urunu ekle
    if (!targetCartId && data.variant_id && data.quantity) {
      logToFile("1. Yeni Sepet Olusturuluyor...");
      const region = await getRegion(data.country_code)
      if (!region) throw new Error("Bolge bulunamadi")

      // Bos sepet
      const cartParams: any = { region_id: region.id }
      const finalEmail = data.email && data.email.trim() !== "" ? data.email : "misafir@bellbutik.com"
      cartParams.email = finalEmail

      const cartResp = await sdk.store.cart.create(cartParams, {}, headers)
      targetCartId = cartResp.cart.id
      console.log("[QuickCheckout] 1. Sepet Olusturuldu ID:", targetCartId)

      // Urunu sepete ekle
      await sdk.store.cart.createLineItem(
        targetCartId,
        { variant_id: data.variant_id, quantity: data.quantity },
        {},
        headers
      )
      console.log("[QuickCheckout] 1. Urun Sepete Eklendi")
    }

    if (!targetCartId) {
      logToFile("ERROR: Siparis icin aktif bir sepet bulunamadi");
      throw new Error("Siparis icin aktif bir sepet bulunamadi.")
    }

    // 2. Adresleri Guncelle
    logToFile("2. Adres Guncelleniyor...");
    const addressData = {
      first_name: data.first_name,
      last_name: data.last_name,
      address_1: data.address,
      city: data.city,
      country_code: data.country_code,
      province: data.province,
      phone: data.phone,
      // Add company details to billing address if corporate
      company: data.invoice_type === 'kurumsal' ? data.company_name : undefined
    }

    const finalEmailForUpdate = data.email && data.email.trim() !== "" ? data.email : "misafir@bellbutik.com"

    try {
      await sdk.store.cart.update(
        targetCartId,
        {
          email: finalEmailForUpdate,
          shipping_address: addressData,
          billing_address: addressData,
        },
        {},
        headers
      )
    } catch (e: any) {
      logToFile("ERROR Adres guncellenemedi: " + e.message);
      throw new Error(`1. Adres guncellenemedi: ${e.message || JSON.stringify(e)}`)
    }
    logToFile("2. Adresler Guncellendi");

    // Eger Siparis Notu var ise ve Odeme Yontemini bildirmek icin metadata asilansin
    const metadataUpdate: any = {}
    if (data.order_note) metadataUpdate.order_note = data.order_note
    metadataUpdate.secilen_odeme_yontemi = data.payment_method === 'havale' ? 'Havale / EFT' : 
                                           data.payment_method === 'cash_on_delivery' ? 'Kapıda Nakit Ödeme' : 
                                           data.payment_method === 'cod_cc' ? 'Kapıda Kredi Kartı ile Ödeme' : 
                                           'Kredi Kartı';
    
    // Set payment_option for backend admin UI recognition
    if (data.payment_method === 'cash_on_delivery') metadataUpdate.payment_option = "cash_on_delivery";
    else if (data.payment_method === 'cod_cc') metadataUpdate.payment_option = "card_on_delivery";
    else if (data.payment_method === 'havale') metadataUpdate.payment_option = "bank_transfer";
    else if (data.payment_method === 'credit_card') metadataUpdate.payment_option = "paytr";

    // E-Fatura detaylarını meta'ya işle
    if (data.invoice_type) {
        metadataUpdate.invoice_type = data.invoice_type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'
        if (data.tckn) metadataUpdate.tckn = data.tckn
        if (data.vkn) metadataUpdate.vkn = data.vkn
        if (data.tax_office) metadataUpdate.tax_office = data.tax_office
        if (data.company_name) metadataUpdate.company_name = data.company_name
    }

    await sdk.store.cart.update(
        targetCartId,
        { metadata: metadataUpdate },
        {},
        headers
    )
    logToFile("Metadata guncellendi");

    // 3. Kargo Yontemi Secimi
    logToFile("3. Kargo secenekleri aliniyor...");
    const shippingOptsParams = { cart_id: targetCartId }
    const { shipping_options } = await sdk.client.fetch<{ shipping_options: HttpTypes.StoreCartShippingOption[] }>(
        "/store/shipping-options",
        { query: shippingOptsParams, headers, cache: "no-store" }
    )

    if (shipping_options && shipping_options.length > 0) {
        const methodToUse = shipping_options.find(so => so.price_type === 'calculated') || shipping_options[shipping_options.length - 1]
        console.log("[QuickCheckout] 3. Kargo secildi:", methodToUse.id)
        
        if (methodToUse.price_type === 'calculated') {
             await sdk.client.fetch(
                `/store/shipping-options/${methodToUse.id}/calculate`,
                { method: "POST", body: { cart_id: targetCartId }, headers }
            ).catch(e => console.error("Kargo hesaplama uyarisi:", e.message))
        }

        try {
            await sdk.store.cart.addShippingMethod(
                targetCartId,
                { option_id: methodToUse.id },
                {},
                headers
            )
        } catch(e: any) {
            throw new Error(`2. Kargo secenekleri ayarlanamadi: ${e.message || JSON.stringify(e)}`)
        }
    }

    // 4. Odeme Yontemi Secimi
    logToFile("4. Odeme seansi baslatiliyor...");
    
    // Kapıda ödeme bedelini sepete işle (Eğer COD seçilmişse ve limiti geçmiyorsa)
    try {
        logToFile("Fetching payment-cod/apply...");
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        await fetchWithTimeout(`${backendUrl}/store/custom/payment-cod/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": publishableKey
            },
            body: JSON.stringify({ cart_id: targetCartId, method_id: data.payment_method })
        }, 10000)
        logToFile("payment-cod/apply success");
    } catch(e: any) {
        logToFile("COD Uygulama Hatası: " + e.message);
        console.error("COD Uygulama Hatası:", e)
    }

    // 3.5. APPLY COUPON IF PROVIDED
    if (data.coupon && data.coupon.trim() !== "") {
        console.log("[QuickCheckout] 3.5. Kupon uygulanıyor:", data.coupon)
        try {
            await sdk.store.cart.update(
                targetCartId,
                { promotional_codes: [data.coupon] },
                {},
                headers
            )
            console.log("[QuickCheckout] Kupon basariyla uygulandi")
        } catch(err: any) {
             console.error("[QuickCheckout] Kupon uygulama hatasi:", err.message)
        }
    }

    try {
        logToFile("Retrieving cart...");
        const { cart } = await sdk.store.cart.retrieve(targetCartId);
        
        let providerIdsToTry: string[] = [];
        if (data.payment_method === "credit_card") {
            providerIdsToTry = ["pp_PAYTR_PAYTR", "pp_custom-payment_paytr", "pp_custom-payment_PAYTR", "pp_PAYTR", "PAYTR", "pp_paytr", "paytr"];
        } else if (data.payment_method === "havale") {
            providerIdsToTry = ["pp_BANK-TRANSFER_BANK-TRANSFER", "pp_custom-payment_bank-transfer", "pp_custom-payment_BANK-TRANSFER", "pp_BANK-TRANSFER", "BANK-TRANSFER", "pp_bank_transfer", "bank_transfer"];
        } else if (data.payment_method === "cash_on_delivery" || data.payment_method === "cod_cc") {
            // Eger cod_cc secildiyse, oncelikli olarak card-on-delivery'yi dene.
            if (data.payment_method === "cod_cc") {
               providerIdsToTry = ["pp_CARD-ON-DELIVERY_CARD-ON-DELIVERY", "pp_custom-payment_card-on-delivery", "pp_custom-payment_CARD-ON-DELIVERY", "pp_CARD-ON-DELIVERY", "CARD-ON-DELIVERY", "pp_CASH-ON-DELIVERY_CASH-ON-DELIVERY", "pp_custom-payment_cash-on-delivery", "pp_custom-payment_CASH-ON-DELIVERY", "pp_CASH-ON-DELIVERY", "CASH-ON-DELIVERY", "pp_cod_cash", "cod_cash"];
            } else {
               providerIdsToTry = ["pp_CASH-ON-DELIVERY_CASH-ON-DELIVERY", "pp_custom-payment_cash-on-delivery", "pp_custom-payment_CASH-ON-DELIVERY", "pp_CASH-ON-DELIVERY", "CASH-ON-DELIVERY", "pp_cod_cash", "cod_cash"];
            }
        } else {
            providerIdsToTry = ["pp_system_default"];
        }

        let sessionInitiated = false;
        let lastError = null;

        for (const pId of providerIdsToTry) {
            try {
                logToFile("Trying providerId: " + pId);
                await sdk.store.payment.initiatePaymentSession(cart as any, { provider_id: pId }, {}, headers);
                logToFile("Success with providerId: " + pId);
                sessionInitiated = true;
                break;
            } catch (e: any) {
                logToFile("Failed providerId: " + pId + " - " + e.message);
                lastError = e;
            }
        }

        if (!sessionInitiated) {
            throw new Error(`Kabul edilen ödeme altyapısı bulunamadı. Lütfen mağaza yöneticisiyle iletişime geçin. (Hata: ${lastError?.message || "Bilinmiyor"})`);
        }
    } catch(e: any) {
        logToFile("Payment session genel hatasi: " + e.message);
        throw new Error(`Ödeme başlatılamadı: ${e.message}`);
    }

    // 5. Siparisi Tamamla
    logToFile("5. Siparis isleniyor, payment method: " + data.payment_method);
    
    if (data.payment_method === "credit_card") {
        logToFile("Kredi Kartı (PayTR) seçildi, Direct API çağrısı yapılıyor...");
        
        try {
            const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com";
            const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
            let clientIp = data.client_ip || "1.1.1.1";
            if (!data.client_ip || data.client_ip === "1.1.1.1") {
                try {
                    const { headers: nextHeaders } = await import("next/headers");
                    const reqHeaders = await nextHeaders();
                    clientIp =
                        reqHeaders.get("cf-connecting-ip") ||
                        reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                        reqHeaders.get("x-real-ip") ||
                        "1.1.1.1";
                } catch {}
            }

            logToFile(`Fetching ${backendUrl}/store/custom/paytr/direct...`);
            const directApiRes = await fetchWithTimeout(`${backendUrl}/store/custom/paytr/direct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': publishableKey
                },
                body: JSON.stringify({ 
                    cart_id: targetCartId,
                    cc_owner: data.cc_owner,
                    cc_number: data.cc_number?.replace(/\s/g, ''),
                    cc_month: data.cc_month,
                    cc_year: data.cc_year,
                    cc_cvv: data.cc_cvv,
                    client_ip: clientIp
                })
            }, 20000);
            logToFile(`directApiRes status: ${directApiRes.status}`);
            
            const directApiData = await directApiRes.json();
            logToFile("directApiData: " + JSON.stringify({ ...directApiData, html: directApiData.html ? "HTML_PRESENT" : undefined }));
            
            if (directApiData.success) {
                if (directApiData.requiresClientPost && directApiData.formParams) {
                    logToFile("Returning requiresClientPost");
                    return { 
                        success: true, 
                        cartId: targetCartId, 
                        requiresClientPost: true, 
                        postUrl: directApiData.postUrl, 
                        formParams: directApiData.formParams 
                    };
                } else if (directApiData.html) {
                    logToFile("Returning requiresDirectHtml");
                    return { success: true, cartId: targetCartId, requiresDirectHtml: true, html: directApiData.html };
                } else {
                    throw new Error("PayTR'dan beklenen HTML veya yönlendirme parametreleri alınamadı.");
                }
            } else {
                throw new Error(directApiData.error || "Banka ile iletişim kurulamadı. Lütfen bilgilerinizi kontrol edin.");
            }
        } catch(e: any) {
            logToFile("Kredi kartı işlemi başlatılamadı: " + e.message);
            throw new Error(`Kredi kartı işlemi başlatılamadı: ${e.message}`);
        }
    }

    let cartRes;
    try {
        cartRes = await sdk.store.cart.complete(targetCartId, {}, headers)
    } catch(e: any) {
        throw new Error(`5. Siparis tamamlanamadi: ${e.message || JSON.stringify(e)}`)
    }
    console.log("[QuickCheckout] 5. Siparisi Tamamlama Sonucu:", cartRes?.type)

    if (cartRes?.type === "order") {
       // revalidateTag(await getCacheTag("orders")) // Yorum satırına alındı: Client side unmount'u engellemek için
       // Sipariş başarıyla bittiği anda kullanıcının cihazından aktif sepet çerezini silmeliyiz! (Zaten completed oldu)
       // await removeCartId() // Yorum satırına alındı: Sepet sayfası aniden yenilenip modalı kapatmasın diye
       return { success: true, orderId: cartRes.order.id }
    } else {
       throw new Error("Siparis sirasinda bir eksiklik olustu.")
    }

  } catch (error: any) {
    console.error("Hizli Siparis Yakalanan Hata:", error)
    
    // Geçmişte kalmış veya bir şekilde tamamlanmış sepetin çerezini zorla sil (kırmızı hataya düşmesin)
    let errMsg = "Bilinmeyen bir hata olustu."
    if (typeof error?.message === "string") {
        errMsg = error.message
    } else if (typeof error === "string") {
        errMsg = error
    } else if (error && typeof error === "object") {
        try { errMsg = JSON.stringify(error.response || error) } catch(e) {}
    }

    if (errMsg.includes("already completed") || errMsg.includes("Could not delete all payment sessions")) {
        try { await removeCartId() } catch (e) {}
        return { success: false, error: "Sepetinizde bir oturum çakışması algılandı ve sepetiniz sıfırlandı. Lütfen sayfayı yenileyip işleminizi güvenle tekrar deneyin." }
    }

    return { success: false, error: errMsg }
  }
}
