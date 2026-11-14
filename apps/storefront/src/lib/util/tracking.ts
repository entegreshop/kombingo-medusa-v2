import { sendMetaCAPIEvent } from "../../app/actions/capi"

export type TrackingEventData = {
  event_id?: string
  content_ids?: string[]
  content_name?: string
  content_category?: string
  value?: number
  currency?: string
  quantity?: number
  search_string?: string
}

declare global {
  interface Window {
    fbq: any;
    ttq: any;
    dataLayer: any[];
    gtag: any;
  }
}

/**
 * Dinamik olarak Meta, TikTok ve DataLayer izleyicilerine event atar.
 */
export const trackEvent = (
  eventCategory: "view_item" | "add_to_cart" | "begin_checkout" | "add_payment_info" | "purchase" | "search" | "view_category" | "view_cart",
  data: TrackingEventData
) => {
  // 1. DataLayer (GTM & GA4 uyumlu yapı)
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({ ecommerce: null }); // clears the previous ecommerce object
    
    let ecommercePayload: any = {
      currency: data.currency || "TRY",
      value: data.value || 0,
      items: (data.content_ids || []).map((id, index) => ({
        item_id: id,
        item_name: data.content_name || "",
        item_category: data.content_category || "",
        price: data.value || 0,
        quantity: data.quantity || 1
      }))
    };
    
    // Eğer bir arama sorgusu varsa parametreyi ekle
    if (eventCategory === "search" && data.search_string) {
      window.dataLayer.push({
        event: "search",
        search_term: data.search_string
      });
    } else {
      window.dataLayer.push({
        event: eventCategory,
        ecommerce: ecommercePayload
      });
    }
  }

  // 2. Meta Pixel (Facebook) Mapping
  if (typeof window !== "undefined" && window.fbq) {
    const metaPayload = {
      content_ids: data.content_ids,
      content_type: 'product',
      content_name: data.content_name,
      currency: data.currency || "TRY",
      value: data.value || 0,
    };
    
    let metaEventName = "";
    
    switch (eventCategory) {
      case "view_item":
        window.fbq("track", "ViewContent", metaPayload, { eventID: data.event_id });
        metaEventName = "ViewContent";
        break;
      case "add_to_cart":
        window.fbq("track", "AddToCart", metaPayload, { eventID: data.event_id });
        metaEventName = "AddToCart";
        break;
      case "begin_checkout":
        window.fbq("track", "InitiateCheckout", metaPayload, { eventID: data.event_id });
        metaEventName = "InitiateCheckout";
        break;
      case "add_payment_info":
        window.fbq("track", "AddPaymentInfo", metaPayload, { eventID: data.event_id });
        metaEventName = "AddPaymentInfo";
        break;
      case "purchase":
        // Client-side purchase (Optional if relying solely on CAPI, but helps double tracking with eventID)
        window.fbq("track", "Purchase", metaPayload, { eventID: data.event_id });
        metaEventName = "Purchase";
        break;
      case "search":
        window.fbq("track", "Search", { search_string: data.search_string }, { eventID: data.event_id });
        metaEventName = "Search";
        break;
      case "view_category":
        window.fbq("trackCustom", "ViewCategory", { content_category: data.content_category }, { eventID: data.event_id });
        metaEventName = "ViewCategory";
        break;
      case "view_cart":
        // ViewCart might be standard for some but custom works universally
        window.fbq("trackCustom", "ViewCart", metaPayload);
        metaEventName = "ViewCart"
        break;
    }

    // Call server action for CAPI
    if (metaEventName) {
      sendMetaCAPIEvent(metaEventName, {
        event_id: data.event_id || "",
        value: data.value,
        currency: data.currency,
        content_ids: data.content_ids,
        content_name: data.content_name
      }).catch(err => console.error("CAPI dispatch error", err))
    }
  }

  // 3. TikTok Pixel Mapping
  if (typeof window !== "undefined" && window.ttq) {
    const ttqPayload = {
      contents: (data.content_ids || []).map(id => ({
        content_id: id,
        content_name: data.content_name,
        content_type: 'product',
        quantity: data.quantity || 1,
        price: data.value || 0
      })),
      value: data.value || 0,
      currency: data.currency || "TRY"
    };

    switch (eventCategory) {
      case "view_item":
        window.ttq.track("ViewContent", ttqPayload, { event_id: data.event_id });
        break;
      case "add_to_cart":
        window.ttq.track("AddToCart", ttqPayload, { event_id: data.event_id });
        break;
      case "begin_checkout":
        window.ttq.track("InitiateCheckout", ttqPayload, { event_id: data.event_id });
        break;
      case "add_payment_info":
        window.ttq.track("AddPaymentInfo", ttqPayload, { event_id: data.event_id });
        break;
      case "purchase":
        window.ttq.track("CompletePayment", ttqPayload, { event_id: data.event_id });
        break;
      case "search":
        window.ttq.track("Search", { query: data.search_string });
        break;
      case "view_cart":
        // TTQ standard event for cart
        window.ttq.track("ViewCart", ttqPayload, { event_id: data.event_id });
        break;
      case "view_category":
        window.ttq.track("ViewContent", ttqPayload, { event_id: data.event_id }); // TikTok often groups category view under ViewContent
        break;
    }
  }
}

export const trackViewCart = (data: any) => trackEvent("view_cart", { value: data.total, currency: data.currency, content_ids: data.items?.map((i:any) => i.id) || [] });
export const trackInitiateCheckout = (data: any) => trackEvent("begin_checkout", { value: data.total, currency: data.currency });
export const trackAddPaymentInfo = (data: any) => trackEvent("add_payment_info", { value: data.total, currency: data.currency });
export const trackPurchase = (data: any) => trackEvent("purchase", { value: data.total, currency: data.currency });
export const trackViewContent = (data: any) => trackEvent("view_item", { value: data.price, currency: data.currency, content_name: data.title });
export const trackAddToCart = (data: any) => trackEvent("add_to_cart", { value: data.price, currency: data.currency, content_ids: [data.id] });
