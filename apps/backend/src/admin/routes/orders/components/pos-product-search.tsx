"use client";
import React, { useState, useEffect } from "react";
import { PosVariantSelect } from "./pos-variant-select";
import { CartItem } from "./pos-modal";

interface PosProductSearchProps {
  onClose: () => void;
  onSelectProduct: (item: CartItem) => void;
}

export const PosProductSearch = ({ onClose, onSelectProduct }: PosProductSearchProps) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedForVariant, setSelectedForVariant] = useState<any | null>(null);

  useEffect(() => {
     let isMounted = true;
     const search = async () => {
         setLoading(true);
         try {
             // 'q' parametresi bazen tam metin arama modüllerinde sorun çıkarabiliyor.
             // Bu yüzden alternatif olarak tüm ürünleri çekip frontend'de filtreleme veya title ilike kullanabiliriz.
             // Veya Medusa v2'de title için doğrudan query yapabiliriz.
             const apiParams: any = { 
                 limit: 50,
                 fields: "*variants,*variants.prices,*options" 
             };
             let qString = "";
             if (query.length > 2) {
                 qString = `&q=${encodeURIComponent(query)}`;
             }

             const res = await fetch(`/admin/products?limit=50&fields=*variants,*variants.prices,*options${qString}`);
             const data = await res.json();
             const pList = data.products || [];
             
             let filtered = pList;
             
             // Eğer API 'q' parametresini desteklemiyorsa veya sonuç dönmüyorsa 
             // ve query varsa manuel filtreleme yapalım (Fallback)
             if (query.length > 2 && filtered.length === 0) {
                 const resAll = await fetch(`/admin/products?limit=100&fields=*variants,*variants.prices,*options`);
                 const dataAll = await resAll.json();
                 const allProducts = dataAll.products || [];
                 filtered = allProducts.filter((p: any) => 
                     p.title?.toLowerCase().includes(query.toLowerCase()) || 
                     p.handle?.toLowerCase().includes(query.toLowerCase()) ||
                     p.variants?.some((v: any) => v.title?.toLowerCase().includes(query.toLowerCase()) || v.sku?.toLowerCase().includes(query.toLowerCase()))
                 );
             }

             if (isMounted) setProducts(filtered);
         } catch(e) {
             console.error("Ürün arama hatası", e);
         } finally {
             if (isMounted) setLoading(false);
         }
     };

     const debounce = setTimeout(search, 300);
     return () => { isMounted = false; clearTimeout(debounce); };
  }, [query]);

  const handleProductClick = (product: any) => {
      setSelectedForVariant(product);
  };

  const handleVariantSelected = (item: CartItem) => {
      onSelectProduct(item);
      setSelectedForVariant(null);
      onClose(); // İsteğe bağlı: Ürün eklenince aramayı kapat (veya açık bırak)
  };

  return (
    <div className="fixed inset-0 z-[11000] bg-ui-bg-subtle flex flex-col">
       
       {/* Arama Başlığı */}
       <div className="flex bg-[#374151] p-2 gap-2 h-14">
          <div className="flex-1 relative bg-ui-bg-base flex items-center rounded-sm overflow-hidden border-2 border-transparent focus-within:border-indigo-400">
             <span className="text-xl ml-3 text-ui-fg-muted">&#128269;</span>
             <input 
                type="text" 
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ürün adı, Kodu veya Barkod ile ara..."
                className="w-full text-lg p-2 outline-none"
             />
          </div>
          <button 
             onClick={onClose}
             className="bg-red-600 hover:bg-red-700 text-white w-14 flex items-center justify-center text-xl rounded-sm transition-colors"
          >
             &#x2715;
          </button>
       </div>

       {/* Kategori MOCK Alanı (Görseldeki gibi yer tutucu) */}
       <div className="bg-ui-bg-base p-2 border-b border-ui-border-base flex gap-4 text-sm px-4">
          <select className="border border-ui-border-strong rounded p-1 outline-none text-ui-fg-base bg-ui-bg-subtle w-48">
             <option>Tüm Kategoriler</option>
          </select>
          <select className="border border-ui-border-strong rounded p-1 outline-none text-ui-fg-base bg-ui-bg-subtle w-48">
             <option>Tüm Markalar</option>
          </select>
       </div>

       {/* Kılavuz ve Grid Alanı */}
       <div className="flex-1 overflow-auto p-4 flex flex-wrap content-start gap-4 justify-center">
          
          {loading && <div className="text-ui-fg-muted mt-10">Ürünler Aranıyor...</div>}
          
          {!loading && products.length === 0 && (
             <div className="text-ui-fg-muted mt-10 text-lg">Hiç ürün bulunamadı. Lütfen kelime girin.</div>
          )}

          {!loading && products.map(product => {
             // Calculate display price
             let displayPrice = 1200; // default mock
             let stock = 0;
             let sku = "";
             if (product.variants?.length > 0) {
                 // Fiyat Medusa'da kuruş olarak (örn 149900) veya tam sayı (1499) olarak tutuluyor olabilir.
                 // Görseldeki hataya göre tam sayı tutuluyor, bu yüzden / 100'ü kaldırıyoruz. Sadece kuruş var ise virgülden sonra gösteririz.
                 const rawAmount = product.variants[0].prices?.[0]?.amount;
                 displayPrice = rawAmount !== undefined ? rawAmount : 1200;
                 stock = product.variants.reduce((acc: number, v: any) => acc + (v.inventory_quantity || 0), 0);
                 sku = product.variants[0].sku || "KOD-YOK";
             }

             return (
              <div 
                 key={product.id} 
                 onClick={() => handleProductClick(product)}
                 className="w-[220px] bg-ui-bg-base border border-ui-border-base hover:border-indigo-400 transition-colors shadow-sm cursor-pointer p-4 flex flex-col items-center text-center gap-2"
              >
                 {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.title} className="w-full h-40 object-cover object-top mb-2 rounded" />
                 ) : (
                    <div className="w-full h-40 bg-ui-bg-subtle-hover mb-2 flex items-center justify-center text-gray-300">Görselsiz</div>
                 )}
                 <div className="font-semibold text-ui-fg-base text-sm leading-tight h-10 overflow-hidden" title={product.title}>
                    {product.title}
                 </div>
                 <div className="font-bold text-lg text-ui-fg-interactive mt-1 bg-ui-bg-interactive-subtle px-3 rounded-full">
                    {displayPrice.toFixed(2)} TL
                 </div>
                 <div className="text-[10px] uppercase text-ui-fg-subtle font-mono tracking-wider mt-1">{sku}</div>
                 <div className="text-xs text-ui-fg-base font-medium">Stok: {stock > 0 ? stock : 100}</div>
              </div>
             );
          })}

       </div>

       {/* İç Varyant Modalı */}
       {selectedForVariant && (
          <PosVariantSelect 
              product={selectedForVariant}
              onClose={() => setSelectedForVariant(null)}
              onSelectVariant={handleVariantSelected}
          />
       )}

    </div>
  );
};
