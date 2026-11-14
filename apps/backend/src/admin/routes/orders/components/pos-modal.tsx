"use client";
import React, { useState } from "react";
import { Heading, Button, Input } from "@medusajs/ui";
import { Trash } from "@medusajs/icons";
import { PosProductSearch } from "./pos-product-search";
import turkeyCities from "./turkey-cities.json";
interface PosModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

const EditablePrice = ({ price, onChange }: { price: number, onChange: (val: number) => void }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempPrice, setTempPrice] = React.useState(price.toString());

  if (isEditing) {
      return (
          <input 
             type="number" 
             autoFocus
             value={tempPrice}
             onChange={e => setTempPrice(e.target.value)}
             onBlur={() => { setIsEditing(false); onChange(parseFloat(tempPrice) || 0); }}
             onKeyDown={e => { if (e.key === 'Enter') { setIsEditing(false); onChange(parseFloat(tempPrice) || 0); } }}
             className="w-20 border border-ui-border-strong rounded text-right px-1 py-1 outline-none focus:border-indigo-500"
          />
      )
  }
  return <div onClick={() => { setIsEditing(true); setTempPrice(price.toString()); }} className="cursor-pointer hover:text-indigo-600 transition-colors" title="Fiyatı değiştirmek için tıklayın">{price.toFixed(2)}</div>
}

export interface CartItem {
  id: string; // pseudo id
  variant_id: string;
  product_id: string;
  title: string;
  variant_title: string;
  sku: string;
  thumbnail: string;
  price: number;
  quantity: number;
  stock: number;
  kdv: number;
}

export const PosModal = ({ isOpen, onOpenChange, onOrderCreated }: PosModalProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
      "Instagram",
      "WhatsApp",
      "Facebook",
      "Twitter",
      "Telefon",
      "Mağaza",
  ]);
  
  // Müşteri Formu State
  const [customerForm, setCustomerForm] = useState({
      orderLabel: "Instagram",
      customerType: "Ziyaretçi",
      fullName: "",
      tcNo: "",
      phone: "",
      email: "",
      country: "Türkiye",
      city: "",
      district: "",
      address: "",
      taxNo: "",
      taxOffice: "",
      shippingPrice: 0,
      discount: 0,
      // Yeni Eklenen Sipariş Bilgileri
      paymentMethod: "Kapıda Nakit Ödeme",
      orderStatus: "Hazırlanan Sipariş",
      shippingCompany: "ARAS KARGO",
      trackingNumber: "",
      customerNote: "",
      adminNote: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
      if (!isOpen) return;
      fetch("/admin/order-operations")
          .then((r) => r.json())
          .then((data) => {
              if (data?.success && Array.isArray(data.orderTags)) {
                  const activeNames = data.orderTags
                      .filter((t: any) => t.active !== false && t.name)
                      .map((t: any) => String(t.name));
                  if (activeNames.length > 0) {
                      setAvailableTags(activeNames);
                      setCustomerForm((prev) => ({
                          ...prev,
                          orderLabel: activeNames.includes(prev.orderLabel) ? prev.orderLabel : activeNames[0],
                      }));
                  }
              }
          })
          .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToCart = (item: CartItem) => {
      setCartItems(prev => {
          const existing = prev.find(p => p.variant_id === item.variant_id);
          if (existing) {
             return prev.map(p => p.variant_id === item.variant_id ? { ...p, quantity: p.quantity + item.quantity } : p);
          }
          return [...prev, item];
      });
  };

  const handleRemove = (variant_id: string) => {
      setCartItems(prev => prev.filter(p => p.variant_id !== variant_id));
  };

  const updateQuantity = (variant_id: string, newQ: number) => {
      if (newQ < 1) return;
      setCartItems(prev => prev.map(p => p.variant_id === variant_id ? { ...p, quantity: newQ } : p));
  };

  const updatePrice = (variant_id: string, newPrice: number) => {
      if (newPrice < 0) return;
      setCartItems(prev => prev.map(p => p.variant_id === variant_id ? { ...p, price: newPrice } : p));
  };

  // Hesaplamalar
  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subTotal + customerForm.shippingPrice - customerForm.discount;

  const handleSubmit = async () => {
      if (cartItems.length === 0) {
          alert("Lütfen önce ürün ekleyin!");
          return;
      }
      setIsSubmitting(true);
      try {
         setIsSubmitting(true);

         // 1. Önce lokal state'e kaydet ki api çökse bile listede görünsün
         const newPosOrder = {
            id: "local_" + Date.now(),
            display_id: Math.floor(Math.random() * 90000) + 10000 + "",
            platform: "Hızlı Satış (POS)",
            store: "Kombingo",
            order_tag: customerForm.orderLabel || "Hızlı Satış",
            customer: {
              first_name: customerForm.fullName || "Ziyaretçi",
              last_name: "",
              phone: customerForm.phone || "",
              email: customerForm.email || "",
              is_visitor: customerForm.customerType === "Ziyaretçi",
              ip: "127.0.0.1",
              member_no: "POS"
            },
            shipping_address: {
              first_name: customerForm.fullName || "Ziyaretçi",
              last_name: "",
              address_1: customerForm.address || "",
              address_2: "",
              city: customerForm.city || "",
              district: customerForm.district || "",
              country_code: "tr",
              country_name: "Türkiye",
              phone: customerForm.phone || ""
            },
            billing_address: {
              first_name: customerForm.fullName || "Ziyaretçi",
              last_name: "",
              address_1: customerForm.address || "",
              address_2: "",
              city: customerForm.city || "",
              district: customerForm.district || "",
              country_code: "tr",
              country_name: "Türkiye",
              phone: customerForm.phone || "",
              tc_no: customerForm.tcNo || "",
              tax_no: "",
              tax_office: ""
            },
            items: cartItems.map(item => ({
              id: item.variant_id,
              title: item.title,
              sku: item.sku || "",
              barcode: "",
              size: item.variant_title || "Standart",
              unit_price: item.price,
              quantity: item.quantity,
              vat_rate: item.kdv || 10,
              thumbnail: item.thumbnail || ""
            })),
            subtotal: subTotal,
            vat_total: subTotal * 0.1,
            total: grandTotal,
            payment_method: customerForm.paymentMethod === "Kapıda Nakit Ödeme" ? "Kapıda Nakit Ödeme" :
                            customerForm.paymentMethod === "Kapıda Kredi Kartı ile Ödeme" ? "Kapıda Kredi Kartı ile Ödeme" :
                            customerForm.paymentMethod === "Havale" ? "Havale / EFT" : "Kredi Kartı",
            payment_option: customerForm.paymentMethod,
            status: customerForm.orderStatus === "Yeni Sipariş" ? "onay_bekleyen" : 
                    customerForm.orderStatus === "Hazırlanan Sipariş" ? "hazirlanan" : 
                    customerForm.orderStatus === "Kargolanan Sipariş" ? "kargolanan" : "teslim_edilen",
            carrier_name: customerForm.shippingCompany || "Aras Kargo",
            created_at: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
         };

         try {
             let existingOrders;
             try {
                 existingOrders = JSON.parse(localStorage.getItem("pos_orders") || "[]");
             } catch(parseErr) {
                 existingOrders = [];
                 localStorage.removeItem("pos_orders");
             }
             if (!Array.isArray(existingOrders)) {
                 existingOrders = [];
             }
             localStorage.setItem("pos_orders", JSON.stringify([newPosOrder, ...existingOrders]));
         } catch(e) {
             console.error("Local storage save error", e);
         }


         // Try to save to backend too
         try {
             const regionsReq = await fetch('/admin/regions');
             const regionsRes = await regionsReq.json();
             const region = regionsRes.regions?.[0];

             if (region) {
                 const soReq = await fetch(`/admin/shipping-options?region_id=${region.id}`);
                 const soRes = await soReq.json();
                 const shippingOption = soRes.shipping_options?.[0];

                 const draftOrderPayload = {
                     email: customerForm.email || "ziyaretci@hizlisatis.com",
                     region_id: region.id,
                     shipping_address: {
                         first_name: customerForm.fullName || "Ziyaretçi",
                         last_name: ".",
                         phone: customerForm.phone || "-",
                         address_1: customerForm.address || "Belirtilmemiş",
                         city: customerForm.city || "Belirtilmemiş",
                         province: customerForm.district || "Belirtilmemiş",
                         country_code: "tr"
                     },
                     billing_address: {
                         first_name: customerForm.fullName || "Ziyaretçi",
                         last_name: ".",
                         phone: customerForm.phone || "-",
                         address_1: customerForm.address || "Belirtilmemiş",
                         city: customerForm.city || "Belirtilmemiş",
                         province: customerForm.district || "Belirtilmemiş",
                         country_code: "tr"
                     },
                     metadata: {
                         platform: customerForm.orderLabel || "Instagram",
                         order_tag: customerForm.orderLabel || "Instagram",
                         payment_option:
                             customerForm.paymentMethod === "Kapıda Nakit Ödeme"
                                 ? "cash_on_delivery"
                                 : customerForm.paymentMethod === "Kapıda Kredi Kartı ile Ödeme"
                                 ? "card_on_delivery"
                                 : customerForm.paymentMethod === "Havale"
                                 ? "bank_transfer"
                                 : "paytr",
                         delivery_status:
                             customerForm.orderStatus === "Yeni Sipariş"
                                 ? "onay_bekleyen"
                                 : customerForm.orderStatus === "Hazırlanan Sipariş"
                                 ? "hazirlanan"
                                 : customerForm.orderStatus === "Kargolanan Sipariş"
                                 ? "kargolanan"
                                 : "teslim_edilen",
                         tc_no: customerForm.tcNo || "",
                         tax_no: customerForm.taxNo || "",
                         tax_office: customerForm.taxOffice || "",
                         admin_notes: customerForm.adminNote || customerForm.customerNote || "",
                     },
                     items: cartItems.map(item => ({
                         variant_id: item.variant_id,
                         quantity: item.quantity,
                         unit_price: Math.round(item.price * 100)
                     })),
                     shipping_methods: shippingOption ? [
                         {
                             shipping_option_id: shippingOption.id,
                             price: Math.round(customerForm.shippingPrice * 100)
                         }
                     ] : []
                 };

                 const createReq = await fetch('/admin/draft-orders', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(draftOrderPayload)
                 });

                 if (createReq.ok) {
                     const createdDraft = await createReq.json();
                     const draftOrderId = createdDraft.draft_order.id;
                     
                     await fetch(`/admin/draft-orders/${draftOrderId}/pay`, { 
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' }
                     });
                 }
             }
         } catch(e) {
             console.log("Draft order api hatası (Offline/Mock mod devam ediyor):", e);
         }
         
         setCartItems([]);
         onOrderCreated(); // Sayfayı yenile
         onOpenChange(false);
      } catch (e: any) {
         console.error("Sipariş oluşturma hatası", e);
         alert("Sipariş oluşturulamadı: " + e.message);
      } finally {
         setIsSubmitting(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex bg-[#f5f5f5]">
      
      {/* Üst Bar (Header) */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#1f2937] text-white flex items-center justify-between px-4 z-10">
         <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-wider">HIZLI SATIŞ</span>
         </div>
         <div className="flex items-center gap-4">
            <button className="hover:text-gray-300 transition-colors" onClick={() => onOpenChange(false)}>
               &#x2715; Kapat
            </button>
         </div>
      </div>

      {/* İçerik */}
      <div className="flex flex-1 mt-14 overflow-hidden w-full">
         
         {/* SOL TARAF - SEPET VE ARAMA */}
         <div className="flex flex-col flex-1 bg-ui-bg-base border-r border-ui-border-base overflow-hidden relative">
            
            {/* Arama Alanı (Tıklayınca Modalı Açacak) */}
            <div className="p-4 border-b border-ui-border-base">
               <div 
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full bg-ui-bg-subtle border border-ui-border-strong rounded-md px-4 py-3 text-ui-fg-muted cursor-text flex items-center hover:bg-ui-bg-subtle-hover transition-colors"
               >
                  <span className="text-xl mr-2">&#128269;</span>
                  <span>Ürün adı, Kodu veya Barkod ile ara</span>
               </div>
            </div>

            {/* Sepet Tablosu */}
            <div className="flex-1 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-ui-bg-subtle border-b border-ui-border-base text-ui-fg-base sticky top-0">
                     <tr>
                        <th className="w-12 text-center py-2 px-2">Sil</th>
                        <th className="w-16 py-2">Ürün</th>
                        <th className="py-2">Adı</th>
                        <th className="w-16 text-center py-2">KDV</th>
                        <th className="w-24 text-center py-2">Mik.</th>
                        <th className="w-24 text-right py-2">Fiyat</th>
                        <th className="w-24 text-right py-2 pr-4">Tutar</th>
                     </tr>
                  </thead>
                  <tbody>
                     {cartItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-ui-border-base align-middle hover:bg-ui-bg-subtle">
                           <td className="text-center">
                              <button onClick={() => handleRemove(item.variant_id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md">
                                 <Trash />
                              </button>
                           </td>
                           <td className="py-2">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt="" className="w-10 h-10 object-cover rounded border border-ui-border-base" />
                              ) : (
                                <div className="w-10 h-10 bg-ui-bg-subtle-hover rounded border border-ui-border-base flex items-center justify-center text-[8px] text-ui-fg-muted">GÖRSEL</div>
                              )}
                           </td>
                           <td className="py-2">
                              <div className="font-medium text-ui-fg-base">{item.title}</div>
                              <div className="text-xs text-ui-fg-subtle">Ürün Kodu: {item.sku}</div>
                              <div className="text-xs text-ui-fg-interactive mt-0.5">Varyant: {item.variant_title}</div>
                           </td>
                           <td className="text-center">%{item.kdv}</td>
                           <td className="text-center">
                              <input 
                                 type="number" 
                                 min="1"
                                 max={item.stock}
                                 value={item.quantity} 
                                 onChange={(e) => updateQuantity(item.variant_id, parseInt(e.target.value) || 1)}
                                 className="w-16 border border-ui-border-strong rounded text-center py-1 outline-none focus:border-indigo-500"
                              />
                              <div className="text-[10px] text-ui-fg-muted mt-1">Stok: {item.stock}</div>
                           </td>
                           <td className="text-right font-medium">
                              <EditablePrice price={item.price} onChange={(val) => updatePrice(item.variant_id, val)} />
                           </td>
                           <td className="text-right font-bold pr-4">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                     ))}
                     {cartItems.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-20 text-ui-fg-muted">Sepetiniz boş. Ürün aramak için tıklayın.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Fiyat Özeti Altta */}
            <div className="p-4 bg-ui-bg-subtle border-t border-ui-border-base flex text-sm">
               
               {/* Sol Taraf İndirim / Kargo Girişi */}
               <div className="w-1/2 flex gap-4 pr-8">
                  <div className="flex-1 flex flex-col gap-1">
                     <label className="text-xs font-semibold text-ui-fg-base">İndirim Tutarı</label>
                     <input 
                        type="number" 
                        value={customerForm.discount || ""} 
                        onChange={(e) => setCustomerForm(p => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
                        className="border border-ui-border-strong rounded p-1.5 outline-none" 
                     />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                     <label className="text-xs font-semibold text-ui-fg-base">Kargo Ücreti ({customerForm.shippingPrice} TL)</label>
                     <input 
                        type="number" 
                        value={customerForm.shippingPrice || ""} 
                        onChange={(e) => setCustomerForm(p => ({ ...p, shippingPrice: parseFloat(e.target.value) || 0 }))}
                        className="border border-ui-border-strong rounded p-1.5 outline-none" 
                     />
                  </div>
               </div>

               {/* Sağ Taraf Toplamlar */}
               <div className="w-1/2 flex flex-col gap-2 font-medium">
                  <div className="flex justify-between">
                     <span>Ara Toplam</span>
                     <span>{subTotal.toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between">
                     <span>İndirim</span>
                     <span className="text-red-500">- {customerForm.discount.toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Kargo Ücreti</span>
                     <span>{customerForm.shippingPrice.toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-ui-fg-base pt-2 border-t border-ui-border-base">
                     <span>Genel Toplam</span>
                     <span className="text-ui-fg-interactive">{grandTotal.toFixed(2)} TL</span>
                  </div>
               </div>
            </div>

         </div>

         {/* SAĞ TARAF - MÜŞTERİ BİLGİLERİ */}
         <div className="w-[450px] bg-ui-bg-base flex flex-col h-full border-l border-ui-border-base shadow-xl z-20">
            <div className="p-4 border-b border-ui-border-base bg-ui-bg-subtle text-ui-fg-interactive font-semibold flex items-center">
               Müşteri Bilgileri
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Sipariş Etiketi</label>
                     <select 
                        value={customerForm.orderLabel} onChange={e => setCustomerForm(p => ({ ...p, orderLabel: e.target.value }))}
                        className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none"
                     >
                        {availableTags.map((tagName) => (
                           <option key={tagName} value={tagName}>{tagName}</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Müşteri Tipi</label>
                     <select 
                        value={customerForm.customerType} onChange={e => setCustomerForm(p => ({ ...p, customerType: e.target.value }))}
                        className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none"
                     >
                        <option value="Ziyaretçi">Ziyaretçi</option>
                        <option value="Kayıtlı Müşteri">Kayıtlı Müşteri</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Ad Soyad / Unvan <span className="text-red-500">*</span></label>
                     <input 
                        type="text" value={customerForm.fullName} onChange={e => setCustomerForm(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="Müşteri Adı Soyadı" 
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">TC Kimlik No</label>
                     <input 
                        type="text" value={customerForm.tcNo} onChange={e => setCustomerForm(p => ({ ...p, tcNo: e.target.value }))}
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Telefon <span className="text-red-500">*</span></label>
                     <input 
                        type="text" value={customerForm.phone} onChange={e => setCustomerForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+90 5XX XXX XX XX" 
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">E-Mail</label>
                     <input 
                        type="email" value={customerForm.email} onChange={e => setCustomerForm(p => ({ ...p, email: e.target.value }))}
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-xs text-ui-fg-base font-medium">Ülke</label>
                  <select 
                     value={customerForm.country} onChange={e => setCustomerForm(p => ({ ...p, country: e.target.value }))}
                     className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none"
                  >
                     <option value="Türkiye">Türkiye</option>
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">İl</label>
                     <select 
                        value={customerForm.city} 
                        onChange={e => {
                            setCustomerForm(p => ({ ...p, city: e.target.value, district: "" }));
                        }}
                        className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     >
                        <option value="">Seçiniz</option>
                        {turkeyCities.map((c: any) => (
                            <option key={c.name} value={c.name.toUpperCase()}>{c.name.toUpperCase()}</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">İlçe</label>
                     <select 
                        value={customerForm.district} 
                        onChange={e => setCustomerForm(p => ({ ...p, district: e.target.value }))}
                        className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                        disabled={!customerForm.city}
                     >
                        <option value="">Seçiniz</option>
                        {customerForm.city && turkeyCities.find((c: any) => c.name.toUpperCase() === customerForm.city)?.counties.map((d: string) => (
                            <option key={d} value={d.toUpperCase()}>{d.toUpperCase()}</option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-xs text-ui-fg-base font-medium">Adres <span className="text-red-500">*</span></label>
                  <textarea 
                     rows={3} 
                     value={customerForm.address} onChange={e => setCustomerForm(p => ({ ...p, address: e.target.value }))}
                     className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full resize-none"
                  ></textarea>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Vergi Numarası</label>
                     <input 
                        type="text" value={customerForm.taxNo} onChange={e => setCustomerForm(p => ({ ...p, taxNo: e.target.value }))}
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Vergi Dairesi</label>
                     <input 
                        type="text" value={customerForm.taxOffice} onChange={e => setCustomerForm(p => ({ ...p, taxOffice: e.target.value }))}
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
               </div>

               {/* YENİ BÖLÜM: SİPARİŞ BİLGİLERİ */}
               <div className="mt-4 pt-4 border-t border-ui-border-base">
                  <h3 className="text-ui-fg-interactive text-sm font-semibold mb-4">Sipariş Bilgileri</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs text-ui-fg-base font-medium">Ödeme Yöntemi</label>
                        <select 
                           value={customerForm.paymentMethod} onChange={e => setCustomerForm(p => ({ ...p, paymentMethod: e.target.value }))}
                           className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none"
                        >
                           <option value="Kapıda Nakit Ödeme">Kapıda Nakit Ödeme</option>
                           <option value="Kapıda Kredi Kartı ile Ödeme">Kapıda Kredi Kartı ile Ödeme</option>
                           <option value="Havale">Havale</option>
                           <option value="Bayi Hesabından">Bayi Hesabından</option>
                           <option value="Mağazada Ödeme">Mağazada Ödeme</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs text-ui-fg-base font-medium">Sipariş Durumu</label>
                        <select 
                           value={customerForm.orderStatus} onChange={e => setCustomerForm(p => ({ ...p, orderStatus: e.target.value }))}
                           className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none"
                        >
                           <option value="Yeni Sipariş">Yeni Sipariş</option>
                           <option value="Hazırlanan Sipariş">Hazırlanan Sipariş</option>
                           <option value="Kargolanan Sipariş">Kargolanan Sipariş</option>
                           <option value="Teslim Edilen Sipariş">Teslim Edilen Sipariş</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs text-ui-fg-base font-medium">Kargo Firması</label>
                        <select 
                           value={customerForm.shippingCompany} onChange={e => setCustomerForm(p => ({ ...p, shippingCompany: e.target.value }))}
                           className="bg-ui-bg-base border border-ui-border-strong rounded-md p-1.5 text-sm outline-none"
                        >
                           <option value="ARAS KARGO">ARAS KARGO</option>
                           <option value="KARGOİST">KARGOİST</option>
                           <option value="PTT Kargo">PTT Kargo</option>
                           <option value="MNG Kargo">MNG Kargo</option>
                           <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs text-ui-fg-base font-medium">Kargo Takip Numarası</label>
                        <input 
                           type="text" value={customerForm.trackingNumber} onChange={e => setCustomerForm(p => ({ ...p, trackingNumber: e.target.value }))}
                           className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                        />
                     </div>
                  </div>

                  <div className="flex flex-col gap-1 mb-4">
                     <label className="text-xs text-ui-fg-base font-medium">Müşteri Notu</label>
                     <input 
                        type="text" value={customerForm.customerNote} onChange={e => setCustomerForm(p => ({ ...p, customerNote: e.target.value }))}
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-ui-fg-base font-medium">Yönetici Notu</label>
                     <input 
                        type="text" value={customerForm.adminNote} onChange={e => setCustomerForm(p => ({ ...p, adminNote: e.target.value }))}
                        className="border border-ui-border-strong rounded-md p-1.5 text-sm outline-none w-full"
                     />
                  </div>
               </div>

            </div>

            <div className="p-4 border-t border-ui-border-base">
               <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
               >
                  {isSubmitting ? "Oluşturuluyor..." : <>&#10003; SİPARİŞİ OLUŞTUR</>}
               </button>
            </div>
         </div>

      </div>

      {/* Arama Modalı İç İçe */}
      {isSearchOpen && (
         <PosProductSearch 
             onClose={() => setIsSearchOpen(false)}
             onSelectProduct={(item) => {
                 handleAddToCart(item);
             }}
         />
      )}

    </div>
  );
};
