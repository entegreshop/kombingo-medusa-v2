import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

const getDecimalDigits = (currency_code: string) => {
  const zeroDecimalCurrencies = ["jpy", "krw", "vnd", "clp", "lkr"]
  if (zeroDecimalCurrencies.includes(currency_code.toLowerCase())) {
    return 0
  }
  const threeDecimalCurrencies = ["bhd", "jod", "kwd", "omr", "tnd"]
  if (threeDecimalCurrencies.includes(currency_code.toLowerCase())) {
    return 3
  }
  return 2
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  const isTry = currency_code.toLowerCase() === "try"
  const activeLocale = isTry ? "tr-TR" : locale

  const decimals = getDecimalDigits(currency_code)
  const divisionFactor = Math.pow(10, decimals)
  const decimalAmount = amount / divisionFactor

  const defaultMinDigits = decimals
  const defaultMaxDigits = decimals

  return new Intl.NumberFormat(activeLocale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minimumFractionDigits ?? defaultMinDigits,
    maximumFractionDigits: maximumFractionDigits ?? defaultMaxDigits,
  }).format(decimalAmount)
}
