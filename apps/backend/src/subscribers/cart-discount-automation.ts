import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { KombingoDiscountService } from "../services/discount"

export default async function cartDiscountAutomationSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log(`[CartDiscountAutomationSubscriber] TETİKLENDİ! Cart ID: ${data.id}`);
  try {
    const discountService = new KombingoDiscountService(container);
    
    // Uygulama: "cart.updated" eventi, indirimleri ekleme/silme işlemleri sonrası da tetiklenir.
    // KombingoDiscountService içindeki "idempotency (sonsuz döngü koruması)" sayesinde, 
    // eğer sepetin indirim tutarları değişmemişse işlem iptal edilir ve veritabanı kilitlenmeleri önlenir.
    await discountService.applyChronologicalDiscounts(data.id);

    
  } catch (err) {
    console.error("[CartDiscountAutomationSubscriber] İndirim Otomasyonu Hatası:", err);
  }
}

export const config: SubscriberConfig = {
  event: ["cart.updated", "cart.created"],
}
