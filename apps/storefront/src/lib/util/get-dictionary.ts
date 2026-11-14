import "server-only"

const dictionaries: Record<string, () => Promise<any>> = {
  en: () => import("../../dictionaries/en.json").then((module) => module.default),
  tr: () => import("../../dictionaries/tr.json").then((module) => module.default),
  de: () => import("../../dictionaries/de.json").then((module) => module.default),
  fr: () => import("../../dictionaries/fr.json").then((module) => module.default),
  bg: () => import("../../dictionaries/bg.json").then((module) => module.default),
  ro: () => import("../../dictionaries/ro.json").then((module) => module.default),
  el: () => import("../../dictionaries/el.json").then((module) => module.default),
  sr: () => import("../../dictionaries/sr.json").then((module) => module.default),
}

export const countryToLanguageMap: Record<string, string> = {
  tr: "tr",
  gb: "en",
  us: "en",
  de: "de",
  fr: "fr",
  es: "en",
  it: "en",
  bg: "bg",
  ro: "ro",
  gr: "el",
  rs: "sr",
  hr: "sr",
  ba: "sr",
  me: "sr",
  al: "en",
  mk: "en",
  si: "en",
}

export const getDictionary = async (countryCode: string) => {
  const lang = countryToLanguageMap[countryCode.toLowerCase()] || "en"
  return dictionaries[lang] ? dictionaries[lang]() : dictionaries["en"]()
}
