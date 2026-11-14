"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import QuickCheckoutModal from "@modules/checkout/components/quick-checkout-modal"
import { useState } from "react"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Sipariş Özeti
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      
      <Button 
         className="w-full h-12 bg-[#25D366] text-white hover:bg-[#128C7E] hover:text-white uppercase tracking-widest text-[15px] transition-colors font-bold rounded-none"
         onClick={() => setIsModalOpen(true)}
      >
         Güvenli Ödemeye Geç
      </Button>

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
