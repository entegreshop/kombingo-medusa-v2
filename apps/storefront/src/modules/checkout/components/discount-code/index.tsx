"use client"

import { getGlobalCoupons } from "../../../../app/actions/coupons";
import { Badge, Heading, Input, Label, Text, Button } from "@medusajs/ui"
import React, { useState } from "react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  React.useEffect(() => {
    const end = new Date(targetDate).getTime();
    if (isNaN(end)) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Süresi Doldu");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const timeStr = [];
      if (days > 0) timeStr.push(`${days}g`);
      timeStr.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      setTimeLeft(timeStr.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-x-1.5 mt-2 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md w-fit shadow-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <span className="text-[11px] font-extrabold whitespace-nowrap tracking-wide">{timeLeft}</span>
    </div>
  );
};

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCouponsList = ({ cart, promotions, isLoading, setIsLoading, setErrorMessage, setCode }: any) => {
  const [availableCoupons, setAvailableCoupons] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchCoupons() {
      const combinedCoupons: any[] = [];
      
      // 1. Fetch Global Coupons
      try {
        const globalCoupons = await getGlobalCoupons();
        if (globalCoupons && globalCoupons.length > 0) {
          combinedCoupons.push(...globalCoupons);
        }
      } catch (e) {
        console.error("Failed to fetch global coupons", e);
      }

      // 2. Fetch Product-Specific Coupons
      if (cart?.items?.length) {
        const productIds = cart.items.map((i: any) => i.product_id).filter(Boolean);
        if (productIds.length > 0) {
          try {
            const uniqueIds = Array.from(new Set(productIds));
            const query = uniqueIds.map(id => `id[]=${id}`).join('&');
            const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/products?${query}`, {
              headers: {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
              }
            });
            const data = await res.json();
            if (data.products) {
              data.products.forEach((p: any) => {
                const badge = p.metadata?.coupon_badge;
                if (badge && badge.active && badge.code) {
                  if (!combinedCoupons.some((c: any) => c.code === badge.code)) {
                    combinedCoupons.push({
                      ...badge,
                      isGlobal: false
                    });
                  }
                }
              });
            }
          } catch (e) {
            console.error("Failed to fetch product coupons", e);
          }
        }
      }
      
      setAvailableCoupons(combinedCoupons);
    }
    fetchCoupons();
  }, [cart?.items]);

  if (availableCoupons.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-y-2 mb-4 mt-2">
      <Text className="txt-medium font-semibold text-ui-fg-base mb-1">
        İndirim Kuponlarım
      </Text>
      {availableCoupons.map((coupon: any, idx: number) => {
        const isApplied = promotions.some((p: any) => p.code === coupon.code);
        return (
          <div key={idx} className="flex items-center justify-between p-3 border border-[#f5dcd2] rounded-md bg-[#fdf5f2]">
            <div className="flex flex-col">
              <span className="text-[#f27a1a] font-bold text-sm">
                {coupon.type === "percent" ? `%${coupon.amount} İndirim` : `${coupon.amount} TL İndirim`}
              </span>
              <span className="text-xs text-ui-fg-subtle">{coupon.isGlobal ? "Mağaza Kampanyası" : "Ürüne Özel Kupon"}</span>
              {coupon.metadata?.end_date && <CountdownTimer targetDate={coupon.metadata.end_date} />}
            </div>
            {!isApplied ? (
              <Button 
                size="small" 
                className="bg-[#f27a1a] text-white hover:bg-[#d96a12] border-none"
                isLoading={isLoading}
                onClick={async () => {
                  setErrorMessage("");
                  setIsLoading(true);
                  const codes = promotions
                    .filter((p: any) => p.code !== undefined)
                    .map((p: any) => p.code!);
                  codes.push(coupon.code);
                  try {
                    await applyPromotions(codes);
                    setCode("");
                  } catch (e: any) {
                    setErrorMessage(e.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Uygula
              </Button>
            ) : (
              <span className="text-[#25D366] text-sm font-bold flex items-center gap-x-1 border border-[#25D366] px-2 py-1 rounded bg-white">
                Uygulandı ✔
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { promotions = [] } = cart
  const removePromotionCode = async (codeToRemove: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== codeToRemove
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async () => {
    setErrorMessage("")

    if (!code) {
      return
    }

    setIsLoading(true)

    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.trim())

    try {
      await applyPromotions(codes)
      setCode("")
    } catch (e: any) {
      setErrorMessage(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="txt-medium">
        <div className="w-full mb-5">
          <Label className="flex gap-x-1 my-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-blue-600 hover:text-blue-700 font-medium"
              data-testid="add-discount-button"
            >
              İndirim Kodu Ekle
            </button>
          </Label>

          <DiscountCouponsList 
            cart={cart}
            promotions={promotions}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setErrorMessage={setErrorMessage}
            setCode={setCode}
          />

          {isOpen && (
            <div className="flex w-full gap-x-2">
              <Input
                className="size-full"
                id="promotion-input"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addPromotionCode()
                  }
                }}
                autoFocus={false}
                data-testid="discount-input"
              />
              <Button
                variant="secondary"
                data-testid="discount-apply-button"
                isLoading={isLoading}
                onClick={addPromotionCode}
              >
                Uygula
              </Button>
            </div>
          )}
          <ErrorMessage
            error={errorMessage}
            data-testid="discount-error-message"
          />
        </div>

        {promotions.length > 0 && (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2">
                Uygulanan indirimler:
              </Heading>

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : "grey"}
                          size="small"
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: +promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                        {/* {promotion.is_automatic && (
                          <Tooltip content="This promotion is automatically applied">
                            <InformationCircleSolid className="inline text-zinc-400" />
                          </Tooltip>
                        )} */}
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <button
                        className="flex items-center"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
