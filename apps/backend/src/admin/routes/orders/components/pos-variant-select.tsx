"use client";
import React from "react";
import { Heading } from "@medusajs/ui";
import { CartItem } from "./pos-modal";

interface PosVariantSelectProps {
  product: any;
  onClose: () => void;
  onSelectVariant: (item: CartItem) => void;
}

export const PosVariantSelect = ({ product, onClose, onSelectVariant }: PosVariantSelectProps) => {

  const handleSelect = (variant: any) => {
      // Create CartItem shape
      const cItem: CartItem = {
          id: Math.random().toString(), // UI list id
          variant_id: variant.id,
          product_id: product.id,
          title: product.title,
          variant_title: variant.title,
          sku: variant.sku || "KOD-YOK",
          thumbnail: product.thumbnail || "",
          price: variant.prices?.[0]?.amount !== undefined ? (variant.prices[0].amount / 100) : 1200,
          quantity: 1,
          stock: variant.inventory_quantity || 0,
          kdv: 10 // Mock KDV (Medusa tax oranını çekmek uzun olabilir, mockup'ta 10 diyoruz)
      };

      // Fiyat okuması mock (Admin sdk'da pricelar bazen doğrudan gelir, gelmiyorsa fallback)
      if (cItem.price === 0) cItem.price = 1200; // Mock fiyat görseldeki

      onSelectVariant(cItem);
  };

  return (
    <div className="fixed inset-0 z-[12000] flex flex-col items-center justify-center bg-ui-bg-base">
       
       {/* Kapatma Butonu */}
       <div className="absolute top-4 right-4 animate-in slide-in-from-top-4">
          <button 
             onClick={onClose} 
             className="w-10 h-10 flex items-center justify-center border border-ui-border-strong rounded hover:bg-ui-bg-subtle-hover font-bold"
          >
             &#x2715;
          </button>
       </div>

       <Heading level="h2" className="text-xl font-medium text-ui-fg-base mb-12 animate-in slide-in-from-bottom-2">
         {product.title}
       </Heading>

       <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
          <span className="text-sm font-medium text-ui-fg-subtle">Ürün Varyantları</span>
          
          <div className="flex flex-wrap gap-4 justify-center">
             {product.variants?.map((v: any) => (
                <button 
                   key={v.id}
                   onClick={() => handleSelect(v)}
                   className="bg-gray-200 hover:bg-gray-300 transition-colors w-24 h-24 rounded-lg flex flex-col items-center justify-center shadow-sm border border-transparent hover:border-gray-400"
                >
                   <span className="font-bold text-ui-fg-base text-lg mb-1">{v.title}</span>
                   <span className="text-xs text-ui-fg-base font-medium">
                      {v.prices?.[0]?.amount !== undefined ? (Number(v.prices[0].amount) / 100).toFixed(2) : "1200.00"} TL
                   </span>
                   <span className="text-[10px] text-ui-fg-subtle mt-0.5">{v.sku?.substring(0,10) || "KOD"}</span>
                   <span className="text-xs text-ui-fg-base mt-1">Stok: {v.inventory_quantity || 100}</span>
                </button>
             ))}
             {(!product.variants || product.variants.length === 0) && (
                <div className="text-ui-fg-muted text-sm">Bu ürüne ait varyant bulunamadı.</div>
             )}
          </div>
       </div>

    </div>
  );
};
