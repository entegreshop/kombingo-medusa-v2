import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
  product?: HttpTypes.StoreProduct
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

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  product,
}) => {
  const filteredOptions = Array.from(
    new Set((option.values ?? []).map((v) => v.value))
  ).filter(Boolean)

  const isColorOption = title.toLowerCase() === "renk" || title.toLowerCase() === "color" || title.toLowerCase() === "colour"

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium uppercase tracking-wider text-black">
        {title.toLowerCase() === "size" || title.toLowerCase() === "beden"
          ? "BEDEN"
          : title.toLowerCase() === "color" || title.toLowerCase() === "colour" || title.toLowerCase() === "renk"
          ? `RENK: ${current || ""}`
          : title.toUpperCase()}
      </span>
      <div
        className="flex flex-wrap items-center gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current

          if (isColorOption && product) {
            const matchingImage = product.images?.find((img) => {
              return img.url && matchImageToColor(img.url, v)
            })

            if (matchingImage?.url) {
              return (
                <button
                  onClick={() => updateOption(option.id, v)}
                  key={v}
                  className={clx(
                    "flex flex-col items-center gap-y-2 p-1.5 border transition-all duration-200 hover:border-black rounded-none bg-white",
                    {
                      "border-black ring-1 ring-black": isSelected,
                      "border-gray-200": !isSelected,
                      "opacity-50 cursor-not-allowed": disabled,
                    }
                  )}
                  disabled={disabled}
                  data-testid="option-button"
                >
                  <div className="relative w-16 h-20 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={matchingImage.url}
                      alt={v}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#666]">
                    {v}
                  </span>
                </button>
              )
            }
          }

          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "min-w-[3rem] h-12 rounded-full px-4 border text-sm transition-all duration-200 flex items-center justify-center font-medium",
                {
                  "border-black bg-black text-white": isSelected,
                  "bg-white border-gray-300 text-black hover:border-black": !isSelected && !disabled,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
