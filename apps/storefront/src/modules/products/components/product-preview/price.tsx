import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex items-baseline gap-1.5 flex-wrap justify-end">
      {price.price_type === "sale" && (
        <Text
          className="line-through text-zinc-400 text-xs"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx("text-zinc-500 font-semibold text-sm", {
          "text-red-600 font-extrabold": price.price_type === "sale",
          "text-zinc-800": price.price_type !== "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </div>
  )
}
