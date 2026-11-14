/**
 * Ortak ödeme durumu eşleştirici.
 * Medusa standart PaymentSession status kodlarına map eder.
 */
import { PaymentSessionStatus } from "@medusajs/framework/utils"

export class PaymentStatusMapper {
    /**
     * Map PayTR status
     */
    static mapPayTRStatus(statusStr: string): PaymentSessionStatus {
        if (statusStr === "success") return PaymentSessionStatus.AUTHORIZED;
        if (statusStr === "failed") return PaymentSessionStatus.ERROR;
        return PaymentSessionStatus.PENDING;
    }

    /**
     * Map Iyzico status
     */
    static mapIyzicoStatus(statusStr: string): PaymentSessionStatus {
        if (statusStr === "success") return PaymentSessionStatus.AUTHORIZED;
        if (statusStr === "failure") return PaymentSessionStatus.ERROR;
        return PaymentSessionStatus.PENDING;
    }

    /**
     * Kapıda ödeme / Havale
     */
    static mapOfflineStatus(isPaid: boolean): PaymentSessionStatus {
        if (isPaid) return PaymentSessionStatus.CAPTURED;
        return PaymentSessionStatus.PENDING; // Usually awaits manual capture in Medusa admin
    }
}
