import { ICartModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export class KombingoDiscountService {
  constructor(private readonly container: any) {}

  /**
   * Sıralı İndirim ve Shift Logic Hesaplaması
   * Her bir adet (quantity) bağımsız bir sıra olarak değerlendirilir.
   */
  async applyChronologicalDiscounts(cartId: string) {
    console.log(`[KombingoDiscountService] applyChronologicalDiscounts BAŞLADI: ${cartId}`);
    const cartModuleService: ICartModuleService = this.container.resolve(Modules.CART);
    const storeModule = this.container.resolve(Modules.STORE);

    // Ayarları veritabanından çek (UI modülünden gelenler)
    const stores = await storeModule.listStores({}, { select: ["metadata"] });
    const storeMetadata = stores[0]?.metadata || {};
    const settings = storeMetadata.discount_automation_settings || {
      enabled: true,
      free_shipping_limit: 3000,
      winner_mode_percent: 30,
      tiers: [
        { index: 0, percent: 0 },
        { index: 1, percent: 10 },
        { index: 2, percent: 15 },
        { index: 3, percent: 20 },
        { index: 4, percent: 25 },
      ],
      timer_enabled: false,
      timer_minutes: 15,
      cooldown_hours: 24,
    };

    // Sepeti ve içindeki ürünleri çek
    const cart = await cartModuleService.retrieveCart(cartId, {
      relations: ["items", "items.adjustments"],
    });

    if (!cart || !cart.items || cart.items.length === 0) return;

    // --- Zamanlayıcı ve Ceza Mantığı ---
    let isDiscountAllowed = true;

    if (settings.timer_enabled) {
      const cycleStart = cart.metadata?.discount_cycle_start 
        ? new Date(cart.metadata.discount_cycle_start as string).getTime() 
        : new Date(cart.created_at || 0).getTime();
      
      const elapsedMinutes = (Date.now() - cycleStart) / 60000;
      const cooldownMinutes = (settings.cooldown_hours || 24) * 60;
      const totalCycleMinutes = (settings.timer_minutes || 15) + cooldownMinutes;

      if (elapsedMinutes > (settings.timer_minutes || 15)) {
        if (elapsedMinutes <= totalCycleMinutes) {
          // Süre dolmuş ve ceza süresi bitmemiş
          isDiscountAllowed = false;
        } else {
          // Ceza süresi bitmiş, yeni döngü başlat
          await cartModuleService.updateCarts(cartId, {
            metadata: {
              ...(cart.metadata || {}),
              discount_cycle_start: new Date().toISOString()
            }
          });
          // Cart metadata güncellendiğinde 'cart.updated' tekrar tetiklenecek
          // Döngüye girmemek için burada işlemi kesiyoruz
          return;
        }
      }
    }
    // -----------------------------------

    if (!cart || !cart.items || cart.items.length === 0) return;

    // Ürünleri eklendiği zamana (created_at) göre sırala
    const sortedItems = cart.items.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateA - dateB;
    });

    let currentItemIndex = 0;
    const adjustmentsToAdd: any[] = [];
    const adjustmentIdsToDelete: string[] = [];

    // İndirim oranları (Dinamik Ayarlara Göre)
    const getDiscountPercentage = (index: number) => {
      const tier = settings.tiers.find((t: any) => t.index === index);
      if (tier) {
        return tier.percent / 100;
      }
      return settings.winner_mode_percent / 100;
    };

    let totalDiscountedCartValue = 0;

    for (const item of sortedItems) {
      // Eski Kombingo indirimlerini al
      const existingAdjustments = item.adjustments?.filter(
        (adj: any) => adj.code === "KOMBİNGO_DYNAMIC" || adj.code === "SPECIAL_OFFER"
      );

      const unitPrice = Number(item.unit_price);
      let totalDiscountAmountForItem = 0;

      const isSpecialOffer = item.metadata?.is_special_offer === true;

      // Her bir adet (quantity) için ayrı ayrı sırayı ilerlet ve hesapla
      const quantity = Number(item.quantity);

      if (isSpecialOffer) {
        const type = item.metadata?.special_offer_type;
        const amount = Number(item.metadata?.special_offer_amount || 0);
        
        for (let q = 0; q < quantity; q++) {
          let discountAmount = 0;
          if (type === "percent") {
            discountAmount = Math.round(unitPrice * (amount / 100)); // Round to avoid infinite loops with decimals
          } else {
            // "amount" is in TL (e.g. 50), but unitPrice and discountAmount are in kuruş (cents).
            // So we must multiply the fixed amount by 100.
            discountAmount = Math.round(amount * 100);
          }
          // prevent negative prices
          discountAmount = Math.min(discountAmount, unitPrice);
          totalDiscountAmountForItem += discountAmount;
          totalDiscountedCartValue += (unitPrice - discountAmount);
        }
      } else {
        for (let q = 0; q < quantity; q++) {
          const discountPercent = getDiscountPercentage(currentItemIndex);
          const discountAmount = Math.round(unitPrice * discountPercent); // Round to avoid infinite loops with decimals
          totalDiscountAmountForItem += discountAmount;
          
          // Bu birimin indirimli fiyatını genel sepete ekle (Kargo limiti kontrolü için)
          totalDiscountedCartValue += (unitPrice - discountAmount);
          
          currentItemIndex++; // Sıradaki birime geç
        }
      }

      const existingAmount = existingAdjustments && existingAdjustments.length > 0 
        ? existingAdjustments.reduce((sum: number, adj: any) => sum + Number(adj.amount), 0)
        : 0;

      // Eğer mevcut indirim ile hesaplanan indirim tamamen aynıysa dokunma (Sonsuz döngüyü engelle)
      if (Math.abs(existingAmount - totalDiscountAmountForItem) < 0.01) {
        // İndirim aynı, sadece kargo tutarına eklemiştik zaten, değişiklik yapmaya gerek yok
        continue;
      }

      // Değişiklik varsa eski indirimleri silinecekler listesine ekle
      if (existingAdjustments && existingAdjustments.length > 0) {
        adjustmentIdsToDelete.push(...existingAdjustments.map((a: any) => a.id));
      }

      // Eğer bu kalem (line item) için yeni bir indirim varsa eklenecekler listesine ekle
      if (totalDiscountAmountForItem > 0) {
        adjustmentsToAdd.push({
          item_id: item.id,
          code: isSpecialOffer ? "SPECIAL_OFFER" : "KOMBİNGO_DYNAMIC",
          amount: totalDiscountAmountForItem,
          description: isSpecialOffer ? "Sepetine Özel İndirim" : "Kombingo Sıralı İndirim Otomasyonu",
        });
      } else {
        // İndirim yoksa bile kargo hesaplaması için ham fiyatı ekle
        totalDiscountedCartValue += (unitPrice * Number(item.quantity));
      }
    }

    console.log(`[KombingoDiscountService] Settings: enabled=${settings.enabled}, isDiscountAllowed=${isDiscountAllowed}`);
    console.log(`[KombingoDiscountService] adjustmentsToAdd length: ${adjustmentsToAdd.length}`);

    // Eğer otomasyon kapalıysa veya süre dolmuşsa, sadece Kombingo dinamik indirimlerini kaldır
    if (!settings.enabled || !isDiscountAllowed) {
      console.log("[KombingoDiscountService] Otomasyon kapalı veya süre doldu. Sadece Kombingo Dinamik indirimleri eklenmeyecek.");
      // SPECIAL_OFFER indirimlerini koru, sadece KOMBİNGO_DYNAMIC olanları listeden çıkar
      for (let i = adjustmentsToAdd.length - 1; i >= 0; i--) {
        if (adjustmentsToAdd[i].code === "KOMBİNGO_DYNAMIC") {
          adjustmentsToAdd.splice(i, 1);
        }
      }
    }

    // 1. Eski indirimleri sil
    if (adjustmentIdsToDelete.length > 0) {
      console.log(`[KombingoDiscountService] Siliniyor: ${adjustmentIdsToDelete.length} indirim`);
      await cartModuleService.softDeleteLineItemAdjustments(adjustmentIdsToDelete);
    }

    // 2. Yeni indirimleri ekle (Shift Logic uygulanmış olarak)
    if (adjustmentsToAdd.length > 0) {
      console.log(`[KombingoDiscountService] Ekleniyor: ${adjustmentsToAdd.length} indirim`);
      // @ts-ignore - setLineItemAdjustments in some v2 versions or addLineItemAdjustments
      await cartModuleService.addLineItemAdjustments(adjustmentsToAdd);
      console.log(`[KombingoDiscountService] Eklendi.`);
    }

    // 3. Kargo Limit Otomasyonu (Ayarlardaki limite göre kargo bedava)
    if (settings.enabled) {
      await this.checkFreeShipping(cartId, totalDiscountedCartValue, settings.free_shipping_limit);
    } else {
      // Otomasyon kapalıysa, daha önceden atanmış kargo indirimlerini geri almak için limiti devasa yap
      await this.checkFreeShipping(cartId, totalDiscountedCartValue, 999999999);
    }
  }

  /**
   * Kargo Otomasyonu: 3000 TL üzeri kargo bedava
   */
  async checkFreeShipping(cartId: string, netTotal: number, limit: number = 3000) {
    const cartModuleService: ICartModuleService = this.container.resolve(Modules.CART);
    
    // Kargo metodlarını çek
    // Medusa V2'de kargo metotları genellikle fulfillment servisi veya cart'ın içindeki shipping_methods ile yönetilir
    const cart = await cartModuleService.retrieveCart(cartId, {
      relations: ["shipping_methods", "shipping_methods.adjustments"],
    });

    if (!cart || !cart.shipping_methods || cart.shipping_methods.length === 0) return;

    const shippingMethod = cart.shipping_methods[0]; // İlk kargo yöntemini alıyoruz
    const shippingMethodId = shippingMethod.id;
    const shippingPrice = Number(shippingMethod.amount);

    const adjustmentIdsToDelete: string[] = [];
    const existingAdjustments = shippingMethod.adjustments?.filter(
      (adj: any) => adj.code === "KOMBİNGO_FREE_SHIPPING"
    );

    if (existingAdjustments && existingAdjustments.length > 0) {
      adjustmentIdsToDelete.push(...existingAdjustments.map((a: any) => a.id));
    }

    if (netTotal > limit && shippingPrice > 0) {
      // Limit üzeri ve kargo hala ücretli görünüyorsa sıfırla
      if (adjustmentIdsToDelete.length > 0) {
         // Zaten bedava yapılmış, bir şey yapma
         return;
      }

      // @ts-ignore
      await cartModuleService.addShippingMethodAdjustments({
        shipping_method_id: shippingMethodId,
        code: "KOMBİNGO_FREE_SHIPPING",
        amount: shippingPrice, // Kargo ücretinin tamamını düş
        description: `${limit} TL Üzeri Bedava Kargo`,
      });
    } else {
      // Limit altındaysa veya eşitse ve önceden kargo bedava yapılmışsa o indirimi sil (Kargo ücreti geri gelsin)
      if (adjustmentIdsToDelete.length > 0) {
        // @ts-ignore
        await cartModuleService.softDeleteShippingMethodAdjustments(adjustmentIdsToDelete);
      }
    }
  }
}
