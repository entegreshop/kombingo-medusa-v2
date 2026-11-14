import { listCategories } from "@lib/data/categories"
import { Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-gray-200 w-full bg-white mt-16">
      <div className="content-container flex flex-col w-full">
        {/* Social Media Row */}
        <div className="flex justify-center items-center py-8 border-b border-gray-100">
          <span className="text-[13px] font-bold tracking-wide mr-4 text-black">Bizi Takip Edin</span>
          <div className="flex items-center gap-x-4">
            <a href="#" className="text-black hover:opacity-70 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
            </a>
            <a href="#" className="text-black hover:opacity-70 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
            </a>
            <a href="#" className="text-black hover:opacity-70 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="text-black hover:opacity-70 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.686 2.686 0 0 0-1.884-1.895C17.973 3.824 12 3.824 12 3.824s-5.973 0-7.698.467a2.686 2.686 0 0 0-1.884 1.895C1.95 7.915 1.95 12 1.95 12s0 4.085.468 5.814a2.686 2.686 0 0 0 1.884 1.895c1.725.467 7.698.467 7.698.467s5.973 0 7.698-.467a2.686 2.686 0 0 0 1.884-1.895c.468-1.729.468-5.814.468-5.814s0-4.085-.468-5.814zM9.95 15.196V8.804l6.216 3.196-6.216 3.196z"/></svg>
            </a>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-100">
          
          {/* Kurumsal */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Kurumsal</span>
            <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
              <li><LocalizedClientLink href="/pages/hakkimizda" className="hover:text-black hover:underline">Hakkımızda</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/mesafeli-satis" className="hover:text-black hover:underline">Mesafeli Satış Sözleşmesi</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/iade-ve-degisim" className="hover:text-black hover:underline">İptal, İade ve Değişim Koşulları</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/kvkk" className="hover:text-black hover:underline">KVKK</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/teslimat-kargo" className="hover:text-black hover:underline">Teslimat ve Kargo Şartları</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/kullanici-sozlesmesi" className="hover:text-black hover:underline">Kullanıcı Sözleşmesi</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/iletisim" className="hover:text-black hover:underline">İletişim</LocalizedClientLink></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Müşteri Hizmetleri</span>
            <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
              <li><LocalizedClientLink href="/pages/siparis-takip" className="hover:text-black hover:underline">Sipariş Takip</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/pages/havale-bildirimleri" className="hover:text-black hover:underline">Havale Bildirimleri</LocalizedClientLink></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="flex flex-col gap-y-4">
            <span className="font-bold text-[15px] text-black">Kategoriler</span>
            {productCategories && productCategories.length > 0 && (
              <ul className="flex flex-col gap-y-3 text-gray-500 text-[13px]">
                {productCategories.slice(0, 6).map((c) => {
                  if (c.parent_category) return null;
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
              <p className="font-semibold text-gray-800">ÖZSE MODA TEKSTİL LTD. ŞTİ.</p>
              <p>Adres: Merkez Mahallesi Merter Sokak NO 44 Güngören / İstanbul</p>
              <p>Tel: +90 530 456 43 77</p>
              <p>E-posta: info@kombingo.com</p>
              <p>Hafta içi 09.00 - 19.00, Cumartesi 10.00 - 17.00 saatleri arasında ulaşabilirsiniz.</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-y-4">
          <div className="flex flex-col text-[11px] text-gray-500 text-center md:text-left gap-y-1">
            <span>Tüm bilgileriniz 256 bit SSL Sertifikası ile korunmaktadır.</span>
            <span>© {new Date().getFullYear()} Kombingo.com Tüm Hakları Saklıdır</span>
          </div>
          
          <div className="flex items-center gap-x-2">
            {/* Payment Logos */}
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <span className="text-[10px] font-bold text-blue-800">VISA</span>
            </div>
            <div className="h-6 w-10 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
               <span className="text-[9px] font-bold text-blue-500 leading-none text-center">AMERICAN<br/>EXPRESS</span>
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
