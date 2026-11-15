"use client"

import { Button, Heading } from "@medusajs/ui"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import { HttpTypes } from "@medusajs/types"
import QuickCheckoutModal from "@modules/checkout/components/quick-checkout-modal"
import { useState, useEffect } from "react"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cartSettings, setCartSettings] = useState({
    show_free_shipping_bar: true,
    free_shipping_threshold: 3000,
    free_shipping_bar_color: "#10B981",
    show_coupon_box: true,
    checkout_btn_text: "Güvenli Ödemeye Geç",
    checkout_btn_bg: "#25D366",
    checkout_btn_text_color: "#ffffff",
    trust_note_text: "256-Bit SSL Güvencesiyle Hızlı & Güvenli Alışveriş",
  })

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.kombingo.com"
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (publishableKey) headers["x-publishable-api-key"] = publishableKey
    fetch(`${backendUrl}/store/hero-config`, { headers })
      .then((r) => r.json())
      .then((d) => {
        if (d?.config?.cart_settings) {
          setCartSettings((prev) => ({
            ...prev,
            ...d.config.cart_settings,
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Calculate subtotal in TRY for free shipping progress bar
  const rawTotal = Number(cart?.item_subtotal ?? cart?.total ?? 0)
  // Medusa v2 stores amounts either in major or minor units depending on setup; normalize if > 100000
  const cartAmountTry = rawTotal > 50000 ? rawTotal / 100 : rawTotal
  const threshold = Number(cartSettings.free_shipping_threshold) || 3000
  const progressPct = Math.min(100, Math.round((cartAmountTry / threshold) * 100))
  const remainingTry = Math.max(0, threshold - cartAmountTry)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Sipariş Özeti
      </Heading>

      {cartSettings.show_free_shipping_bar !== false && threshold > 0 && (
        <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="text-xs font-semibold text-zinc-800">
            {remainingTry <= 0 ? (
              <span className="text-emerald-700 font-bold">🎉 Tebrikler! Siparişinizde Kargo Ücretsiz!</span>
            ) : (
              <span>
                Ücretsiz kargo için sepetinize{" "}
                <strong className="font-bold text-black">
                  {remainingTry.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
                </strong>{" "}
                daha ürün ekleyin!
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progressPct}%`,
                backgroundColor: cartSettings.free_shipping_bar_color || "#10B981",
              }}
            />
          </div>
        </div>
      )}

      {cartSettings.show_coupon_box !== false && <DiscountCode cart={cart} />}
      <Divider />
      <CartTotals totals={cart} />

      <Button
        className="w-full h-12 uppercase tracking-widest text-[15px] transition-opacity hover:opacity-90 font-bold rounded-none border-none"
        style={{
          backgroundColor: cartSettings.checkout_btn_bg || "#25D366",
          color: cartSettings.checkout_btn_text_color || "#ffffff",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        {cartSettings.checkout_btn_text || "Güvenli Ödemeye Geç"}
      </Button>

      {cartSettings.trust_note_text && (
        <p className="text-[11.5px] text-zinc-500 text-center font-medium pt-1">
          🔒 {cartSettings.trust_note_text}
        </p>
      )}

      {/* Cart Mode için Modal Çağrılır */}
      <QuickCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="cart"
        cart={cart}
        region={cart.region as any}
      />
    </div>
  )
}

export default Summary
