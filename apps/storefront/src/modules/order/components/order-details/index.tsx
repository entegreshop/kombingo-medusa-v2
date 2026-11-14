import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    if (!str) return ""
    const statusMap: Record<string, string> = {
      not_fulfilled: "Hazırlanıyor",
      fulfilled: "Hazırlandı",
      partially_fulfilled: "Kısmen Hazırlandı",
      shipped: "Kargolandı",
      returned: "İade Edildi",
      canceled: "İptal Edildi",
      awaiting: "Bekliyor",
      captured: "Ödendi",
      refunded: "İade Edildi",
      requires_action: "İşlem Gerekiyor",
      not_paid: "Ödenmedi",
      partially_refunded: "Kısmen İade Edildi"
    }
    return statusMap[str.toLowerCase()] || str.split("_").join(" ")
  }

  return (
    <div>
      <Text>
        Sipariş onay detayları{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>{" "}
        adresine gönderilmiştir.
      </Text>
      <Text className="mt-2">
        Sipariş tarihi:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Sipariş numarası: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Sipariş durumu:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Ödeme durumu:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
