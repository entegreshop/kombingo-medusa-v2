import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getLogoConfig } from "@lib/data/logo-config"

const NEXT_PUBLIC_MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.kombingo.com"
const NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function getHeroConfig() {
  try {
    const headers: Record<string, string> = {}
    if (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }
    const res = await fetch(`${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/hero-config`, {
      next: { revalidate: 30 },
      headers,
    })
    const data = await res.json()
    return data?.config || null
  } catch {
    return null
  }
}

export default async function Footer() {
  const [productCategories, logoConfig, heroConfig] = await Promise.all([
    listCategories().catch(() => []),
    getLogoConfig().catch(() => null),
    getHeroConfig(),
  ])

  const footerSettings = heroConfig?.footer_settings || {}
  const footerLogo = logoConfig?.footerLogo || logoConfig?.headerLogo || "/logo.png"

  return (
    <footer className="border-t border-gray-200 w-full bg-white mt-16">
      <div className="content-container flex flex-col w-full">
        {/* Social Media Row */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 border-b border-gray-100 gap-y-4">
          <div>
            {footerLogo ? (
              <LocalizedClientLink href="/">
                <img src={footerLogo} alt="Kombingo" className="h-9 w-auto object-contain" />
              </LocalizedClientLink>
            ) : (
              <LocalizedClientLink
                href="/"
                className="txt-compact-xlarge-plus text-zinc-950 hover:text-violet-600 font-bold uppercase tracking-widest flex items-center gap-1.5"
              >
                <span>KOMBİNGO</span>
              </LocalizedClientLink>
            )}
          </div>
          {footerSettings.show_social !== false && (
            <div className="flex items-center">
              <span className="text-[13px] font-bold tracking-wide mr-4 text-black">Bizi Takip Edin</span>
              <div className="flex items-center gap-x-4">
                {footerSettings.facebook_url && (
                  <a
                    href={footerSettings.facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:opacity-70 transition-opacity"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                    </svg>
                  </a>
                )}
                {footerSettings.instagram_url !== "" && (
                  <a
                    href={footerSettings.instagram_url || "https://instagram.com/kombingo"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:opacity-70 transition-opacity"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-100">
          {/* Kurumsal */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Kurumsal</span>
            <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
              <li>
                <LocalizedClientLink href="/pages/hakkimizda" className="hover:text-black hover:underline">
                  Hakkımızda
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/mesafeli-satis" className="hover:text-black hover:underline">
                  Mesafeli Satış Sözleşmesi
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/iade-ve-degisim" className="hover:text-black hover:underline">
                  İptal, İade ve Değişim Koşulları
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/kvkk" className="hover:text-black hover:underline">
                  KVKK
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/teslimat-kargo" className="hover:text-black hover:underline">
                  Teslimat ve Kargo Şartları
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/kullanici-sozlesmesi" className="hover:text-black hover:underline">
                  Kullanıcı Sözleşmesi
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/iletisim" className="hover:text-black hover:underline">
                  İletişim
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Müşteri Hizmetleri</span>
            <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
              <li>
                <LocalizedClientLink href="/pages/siparis-takip" className="hover:text-black hover:underline">
                  Sipariş Takip
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/pages/havale-bildirimleri" className="hover:text-black hover:underline">
                  Havale Bildirimleri
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Kategoriler</span>
            {productCategories && productCategories.length > 0 && (
              <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
                {productCategories.slice(0, 6).map((c) => {
                  if (c.parent_category) return null
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-black hover:underline uppercase"
                        href={`/categories/${c.handle}`}
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Bize Ulaşın */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Bize Ulaşın</span>
            <div className="flex flex-col gap-y-3 text-gray-500 text-[13px] leading-relaxed">
              <p className="font-semibold text-gray-800">
                {logoConfig?.contactCompany || "KOMBİNGO MODA & TEKSTİL"}
              </p>
              <p>{logoConfig?.contactAddress || "Adres: Merkez Mah. Moda Cad. No:12 İstanbul / Türkiye"}</p>
              <p>{logoConfig?.contactPhone || "Tel: 0532 337 00 81"}</p>
              <p>{logoConfig?.contactEmail || "E-posta: info@kombingo.com"}</p>
              <p>
                {logoConfig?.contactHours ||
                  "Hafta içi 09.00 - 19.00, Cumartesi 10.00 - 18.00 saatleri arasında ulaşabilirsiniz."}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-y-4">
          <div className="flex flex-col text-[11px] text-gray-500 text-center md:text-left gap-y-1">
            <span>{footerSettings.ssl_badge_text || "Tüm bilgileriniz 256 bit SSL Sertifikası ile korunmaktadır."}</span>
            <span>
              {logoConfig?.footerCopyrightText || `© ${new Date().getFullYear()} Kombingo Tüm Hakları Saklıdır`}
            </span>
          </div>

          <div className="flex items-center gap-x-2">
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <span className="text-[10px] font-bold text-blue-800">VISA</span>
            </div>
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <span className="text-[9px] font-bold text-blue-500 leading-none text-center">
                AMERICAN
                <br />
                EXPRESS
              </span>
            </div>
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <div className="flex relative">
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full mix-blend-multiply opacity-90 absolute -left-2"></div>
                <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full mix-blend-multiply opacity-90"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
