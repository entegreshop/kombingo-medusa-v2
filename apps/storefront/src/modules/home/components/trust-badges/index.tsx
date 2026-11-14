import { Heading } from "@medusajs/ui"

export default function TrustBadges() {
  return (
    <div className="w-full bg-white py-16 border-b border-zinc-200">
      <div className="content-container">
        {/* Three column responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Fast Shipping */}
          <div className="p-6 rounded-2xl border border-zinc-150 bg-zinc-50/50 flex items-start gap-4 hover:border-zinc-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300">
            {/* Shipping Icon */}
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 4.643 4.5h9.714m-12 14.25V4.5m12 14.25v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125V3.375A1.125 1.125 0 0 1 9.75 2.25h3.375c.966 0 1.75.784 1.75 1.75V20.25M9 2.25h1.5M9 5.25h1.5M9 8.25h1.5" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <Heading level="h3" className="text-sm font-bold text-zinc-950 tracking-wide uppercase">
                Aynı Gün Kargo
              </Heading>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Saat 16:00'ya kadar siparişinizi tamamlayın, paketiniz aynı gün kargoya teslim edilsin.
              </p>
            </div>
          </div>
          
          {/* Card 2: Secure Payment */}
          <div className="p-6 rounded-2xl border border-zinc-150 bg-zinc-50/50 flex items-start gap-4 hover:border-zinc-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300">
            {/* Lock/SSL Icon */}
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <Heading level="h3" className="text-sm font-bold text-zinc-950 tracking-wide uppercase">
                Güvenli Alışveriş
              </Heading>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                256-Bit SSL güvenlik altyapımız ile tüm işlemleriniz tamamen şifreli ve güvence altındadır.
              </p>
            </div>
          </div>
          
          {/* Card 3: Easy Returns */}
          <div className="p-6 rounded-2xl border border-zinc-150 bg-zinc-50/50 flex items-start gap-4 hover:border-zinc-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300">
            {/* Return Arrow Icon */}
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <Heading level="h3" className="text-sm font-bold text-zinc-950 tracking-wide uppercase">
                14 Gün Kolay İade
              </Heading>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Kutusu bozulmamış ve etiketleri sökülmemiş tüm ürünlerde 14 gün sorgusuz değişim veya iade imkanı.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
