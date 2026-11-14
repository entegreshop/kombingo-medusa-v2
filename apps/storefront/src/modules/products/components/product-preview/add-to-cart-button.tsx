"use client"

import React, { useState, useMemo, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useParams } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import X from "@modules/common/icons/x"
import { isEqual } from "lodash"
import { trackAddToCart } from "@lib/util/tracking"

type AddToCartButtonProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

function safeNormalize(str: string) {
  return str
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/\u0307/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
}

function matchImageToColor(url: string, color: string) {
  const filename = url.split('/').pop()?.toLowerCase() || '';
  const normFilename = safeNormalize(filename);
  const normColor = safeNormalize(color);

  if (normFilename.includes(normColor)) {
    return true;
  }

  if (normColor === 'krem' && (normFilename.includes('bej') || normFilename.includes('cream') || normFilename.includes('krem'))) {
    return true;
  }
  if (normColor === 'bej' && (normFilename.includes('krem') || normFilename.includes('beige') || normFilename.includes('bej'))) {
    return true;
  }

  const parts = filename.split('-');
  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    const code = lastPart.split('.')[0];
    
    if (normColor === 'kahve' && code.startsWith('k') && !code.startsWith('kr')) {
      return true;
    }
    if (normColor === 'siyah' && (code.startsWith('s') || code.startsWith('l'))) {
      return true;
    }
    if (normColor === 'krem' && (code.startsWith('kr') || code.startsWith('bej') || code.startsWith('b'))) {
      return true;
    }
    if (normColor === 'lacivert' && code.startsWith('l')) {
      return true;
    }
    if (normColor === 'antrasit' && code.startsWith('a')) {
      return true;
    }
    if (normColor === 'mavi' && code.startsWith('m')) {
      return true;
    }
  }

  return false;
}

export default function AddToCartButton({ product, region }: AddToCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "tr"

  // Find first in-stock variant for initialization
  const getInitialOptions = () => {
    let matchedVariant = product.variants?.find((v) => {
      const inStock = !v.manage_inventory || v.allow_backorder || (v.inventory_quantity || 0) > 0
      return inStock
    })
    if (!matchedVariant && product.variants) {
      matchedVariant = product.variants[0]
    }
    return matchedVariant ? optionsAsKeymap(matchedVariant.options) : {}
  }

  const [options, setOptions] = useState<Record<string, string | undefined>>(() => getInitialOptions())

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const inStock = useMemo(() => {
    // In Medusa V2, inventory_quantity on storefront might not always reflect properly
    // depending on sales channel stock location links.
    // Rely on the backend API to reject if genuinely out of stock.
    return true
  }, [selectedVariant])

  const activeImage = useMemo(() => {
    const renkOption = product.options?.find((o) => {
      const t = (o.title || "").toLowerCase()
      return t === "renk" || t === "color" || t === "colour"
    })
    
    const selectedColor = renkOption ? options[renkOption.id] : undefined
    
    if (selectedColor && product.images) {
      const matched = product.images.find((img) => img.url && matchImageToColor(img.url, selectedColor))
      if (matched) return matched.url
    }
    
    return product.thumbnail || ""
  }, [product.images, product.thumbnail, options, product.options])

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })

  const displayPrice = selectedVariant ? variantPrice : cheapestPrice

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading || !selectedVariant?.id) return

    setLoading(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
      
      if (displayPrice) {
        trackAddToCart({
          id: product.id,
          title: product.title || "",
          price: displayPrice.calculated_price_number || 0,
          currency: (region?.currency_code || "TRY").toUpperCase(),
          quantity: 1
        })
      }
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
      }, 1000)
    } catch (err) {
      console.error("Cart addition failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const hasVariants = product.variants && product.variants.length > 1

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className="w-full py-3 mt-3 rounded-none font-bold text-xs uppercase tracking-widest bg-black text-white hover:bg-zinc-800 shadow-sm active:scale-[0.98] transition-all duration-300"
      >
        SEPETE EKLE
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden bg-white p-6 md:p-8 text-left align-middle shadow-2xl transition-all rounded-none relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
                  >
                    <X size={24} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Product Image */}
                    <div className="relative w-full aspect-[3/4] bg-zinc-50 overflow-hidden flex items-center justify-center border border-zinc-100">
                      {activeImage ? (
                        <img
                          src={activeImage}
                          alt={product.title || ""}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                          Görsel Yok
                        </div>
                      )}
                    </div>

                    {/* Product Details & Selection */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="pr-8">
                          <Dialog.Title as="h3" className="text-xl font-semibold text-zinc-950 leading-tight">
                            {product.title}
                          </Dialog.Title>
                        </div>

                        {/* Price */}
                        <div className="mt-4">
                          {displayPrice ? (
                            displayPrice.price_type === "sale" ? (
                              <div className="flex items-center gap-x-2">
                                <div className="bg-[#15803d] text-white font-bold text-[13px] px-2 py-0.5 rounded-sm">
                                  %{displayPrice.percentage_diff}
                                </div>
                                <div className="flex flex-col items-start leading-none justify-center">
                                  <span className="line-through text-[#15803d] text-[13px] font-medium">
                                    {displayPrice.original_price}
                                  </span>
                                  <span className="text-[#15803d] font-bold text-[18px] mt-0.5">
                                    {displayPrice.calculated_price}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-zinc-950 font-bold text-[18px]">
                                  {displayPrice.calculated_price}
                                </span>
                              </div>
                            )
                          ) : null}
                        </div>

                        <div className="h-px bg-zinc-200 my-6" />

                        {/* Options List */}
                        <div className="flex flex-col gap-y-6">
                          {(product.options || []).map((option) => {
                            return (
                              <OptionSelect
                                key={option.id}
                                option={option}
                                current={options[option.id]}
                                updateOption={setOptionValue}
                                title={option.title || ""}
                                disabled={loading}
                                product={product}
                              />
                            )
                          })}
                        </div>
                      </div>

                      {/* Add to Cart Action */}
                      <div className="mt-8">
                        {selectedVariant ? (
                          <button
                            onClick={handleAddToCart}
                            disabled={loading || !inStock}
                            className={`w-full py-4 rounded-none font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                              success
                                ? "bg-emerald-600 text-white"
                                : !inStock
                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                : "bg-black text-white hover:bg-zinc-800 shadow-sm active:scale-[0.98]"
                            }`}
                          >
                            {loading ? "EKLENİYOR..." : success ? "EKLENDİ ✔" : !inStock ? "TÜKENDİ" : "SEPETE EKLE"}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-4 rounded-none font-bold text-sm uppercase tracking-widest bg-zinc-200 text-zinc-400 cursor-not-allowed"
                          >
                            Varyant Seçiniz
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
