import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { useEffect, useState } from "react"

type ReportsSubTab = "satis" | "urun" | "musteri" | "pazaryeri" | "trafik"

const DATE_RANGES = [
  "Bugün",
  "Dün",
  "Bu Hafta",
  "Geçen Hafta",
  "Bu Ay",
  "Geçen Ay",
  "Son 30 Gün",
  "Bu Yıl",
  "Tüm Zamanlar",
]

const PRODUCT_IMG_1 =
  "data:image/jpeg;base64,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"

const PRODUCT_IMG_2 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQUFBAYFBQUHBgYHCQ8KCQgICRMNDgsPFhMXFxYTFRUYGyMeGBohGhUVHikfISQlJygnGB0rLismLiMmJyb/2wBDAQYHBwkICRIKChImGRUZJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJib/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDR0SFdUvHS3NuBZRLI8cnCqoxwcevrWzqWiyNqYjsGAgmTLMwHyZ6ge3esf4XWht9f8Ru9wz3P2ZFYCPJUA8YB4NdtosdxE8hvJjO8lwzITjKocYX8KjqUebs40uB5boltsjDIQcADvXCa98TSQYtFtVfsJ50wo9wvU/jXd6rHqd5p+vPeW4jjguZRA/Hzrg8YHpgc98188jPljHpVqKIuS6rqOoarcm61K5e4lxgFsAKPQAcCobXieMjs4/lTGBxUtqpEq8cb/wClN7AdfGUECKsI3FR878kfSqzBzIAzDg46VYhU/uwzdgOnSiAJJOQV6BmPPpWBR9E6DZra+IdelAA823UNliozn17Vu2rR+fGiMrFANwU5xmsPVNTm0y5u5ItImu5JdpklSQYCnAxg+5qDwNMjyX86KyiebzCj5+RuQVHtx+pqr3ZVtDU8VWEaaRfrGoAeORzgdyhr5GjEVrAJ5YllAAGx84JP0r7N16NZLNo3lihEsTR75nCIpZcDcT0GSK8M8d/BvUJdN0uLwfNBe+REUvZpZSpnmzyy9QFHQD88mr5ktyVFvY8mfyZkWaOAQh1+4D0OffpTIlAkGOz/ANK+lPEnwy0G3+Es9sukwHxDpOmCdtQhUq8sijc4J/iBwwwfavnGyge4cqhAJc4P4UuZNNg00zdhYeYvYDrmo4h5TszEDKkD5vWmC3kt3IuE2jsWIGT+NU7i58i2MmNxA6ZrID6lUyfZpYpW3zPIkm3Yy88dj0HFQae/2fUro3EsUe5lChm2jHtmtmZ7eXAKGX5QPlQ+g71mf2YkbSPCZQGfeEkk3H3A9B9aNjTc0vFItr3Sr1GEdxEsDsRnIyqkj9cVk/Am5guPh3byyIsGy5mVVHC/e3ZHt8xGPateVYb1TC1/BaNKCrQXkW1XBGMBgcHP1qE+Ho/D/hx106zisjauZhFbOxQjIJ6k8EZ4ok1a44326HJfHrSVOnTaqPNYXFmY9u84SSNtynGccqW/KvnzS2WIvK33VLHP4V9X+N9HTxHop0pdSt7KT/Wo91JgFHR0OPUjdjHFeBQfCrxrGkscukblDZLR3KEOP9k55ogrJ+Y6rvy26HJ3Mty7BfMDKcjG/FZ0itdxm1jxvPqfSus13wtqVowF/YXFmVOQbi3YLn/eHFcrBper296HWaKWHJ2kMOB2qkjFn1vPcOJtgUHCj5mbgcCqMl5dBiFOfZQKfP5kjBtjA7V+6OvAqIROXJMbAEYwBVWQ7kdzeyKAkxVw4+aNlGDXReGDFN4ZeFECK3mbV5IB5457cdKw/sTtyYSoPUkHJrU0S4j0nSbq3khkuHDmSFQCN2ccZ7cjNRJIqLINYWDWvB89zcxRyzxQi7RkXABRg5256DK4qzDpem3ckknh3WGhfP8Aq0kxj2K//WrE8OTXdrp99pmr2vn2szSvbtACGRZM7oyD25/XoKhNnDPBaRy25Se1gji+0QgxyOVXG8kdCfyqUU3dHQ3A8RWQKzwQX8OOSAY2P5cfpXM6lpnhPU3H9qaKtpIzYZ3gxg/78eD+dbNnqPiSxCi2mTU4Bx5V2NsgHs46/jir0PiDR7udIdZ0240yZiBumjJQ89nFMk//2Q=="

const ReportsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<ReportsSubTab>("satis")
  const [selectedRange, setSelectedRange] = useState<string>("Bu Ay")

  useEffect(() => {
    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab") as ReportsSubTab | null
      if (tab && ["satis", "urun", "musteri", "pazaryeri", "trafik"].includes(tab)) {
        setActiveSubTab(tab)
      } else {
        setActiveSubTab("satis")
      }
    }
    syncTabFromUrl()
    window.addEventListener("popstate", syncTabFromUrl)
    const interval = setInterval(syncTabFromUrl, 300)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
      className="min-h-screen bg-[#f1f3f6] text-slate-800 pb-16"
    >
      <div className="max-w-[1440px] w-full mx-auto px-5 py-7 space-y-6">
        {/* Quka .qs-portlet Top Filter & Date Range Bar (1:1 from style.min.css .qs-portlet-bar & .quka-date-picker-btn) */}
        <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 bg-[#f3f3f3] p-1.5 rounded-[5px]">
            {DATE_RANGES.map((range) => {
              const isSelected = selectedRange === range
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={
                    isSelected
                      ? "px-3 py-1.5 rounded-[5px] text-[12px] font-bold bg-white text-[#1565c0] shadow-2xs cursor-pointer"
                      : "px-3 py-1.5 rounded-[5px] text-[12px] font-medium text-[#555555] hover:bg-white cursor-pointer"
                  }
                >
                  {range}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-[#f3f3f3] text-[12px] font-semibold text-[#334155]">
              <span>📅 01.11.2026 - 13.11.2026</span>
            </div>
            <button
              type="button"
              onClick={() => alert("Rapor verileri Excel (.xlsx) olarak indiriliyor...")}
              className="h-[34px] px-4 rounded-[5px] bg-[#0abb87] hover:bg-[#099f73] text-white text-[12.5px] font-bold cursor-pointer"
            >
              📊 Excel İndir
            </button>
          </div>
        </div>

        {/* SUB-VIEW 1: GENEL SATIŞ & CİRO RAPORLARI */}
        {activeSubTab === "satis" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] font-semibold text-[#64748b]">Toplam Brüt Satış Cirosu</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e0f6e7] text-[#08976d]">+%36,8</span>
                </div>
                <div className="text-[22px] font-extrabold text-[#0f172a]">337,336.34 TL</div>
                <div className="text-[11.5px] text-[#64748b] mt-1">119 Onaylı Sipariş</div>
              </div>

              <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] font-semibold text-[#64748b]">Net Tahsilat (İptal/İade Hariç)</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e0f6e7] text-[#08976d]">+%29,4</span>
                </div>
                <div className="text-[22px] font-extrabold text-[#0f172a]">318,940.00 TL</div>
                <div className="text-[11.5px] text-[#64748b] mt-1">112 Tamamlanan Sipariş</div>
              </div>

              <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] font-semibold text-[#64748b]">Ortalama Sepet Tutarı</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e0f6e7] text-[#08976d]">+%11,2</span>
                </div>
                <div className="text-[22px] font-extrabold text-[#0f172a]">2,834.76 TL</div>
                <div className="text-[11.5px] text-[#64748b] mt-1">Sipariş Başına 1,3 Ürün</div>
              </div>

              <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] font-semibold text-[#64748b]">İade &amp; İptal Tutarı</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700">-%2,1</span>
                </div>
                <div className="text-[22px] font-extrabold text-[#0f172a]">18,396.34 TL</div>
                <div className="text-[11.5px] text-[#64748b] mt-1">7 İptal / İade Sipariş (%5,4)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Ödeme Yöntemine Göre Satış Dağılımı */}
              <div className="lg:col-span-6 bg-white rounded-[10px] border border-[#e2e8f0] p-6 shadow-2xs">
                <h3 className="text-[15.5px] font-bold text-[#1e293b] mb-4">Ödeme Yöntemlerine Göre Ciro Dağılımı</h3>
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#f7f7f7] text-[#333] font-semibold">
                      <th className="py-2.5 px-3 rounded-l-[5px]">Ödeme Yöntemi</th>
                      <th className="py-2.5 px-3 text-center">Sipariş</th>
                      <th className="py-2.5 px-3 text-right">Pay (%)</th>
                      <th className="py-2.5 px-3 text-right rounded-r-[5px]">Toplam Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3 font-semibold">Kredi Kartı (PayTR Sanal POS)</td>
                      <td className="py-3 px-3 text-center font-bold">78</td>
                      <td className="py-3 px-3 text-right text-[#0abb87] font-bold">%65,5</td>
                      <td className="py-3 px-3 text-right font-bold">221,120.00 TL</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Kapıda Kredi Kartı / Nakit Ödeme</td>
                      <td className="py-3 px-3 text-center font-bold">29</td>
                      <td className="py-3 px-3 text-right text-[#1565c0] font-bold">%24,4</td>
                      <td className="py-3 px-3 text-right font-bold">82,316.34 TL</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Havale / EFT (Banka Transferi)</td>
                      <td className="py-3 px-3 text-center font-bold">12</td>
                      <td className="py-3 px-3 text-right text-amber-600 font-bold">%10,1</td>
                      <td className="py-3 px-3 text-right font-bold">33,900.00 TL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kargo Firmalarına Göre Teslimat Performansı */}
              <div className="lg:col-span-6 bg-white rounded-[10px] border border-[#e2e8f0] p-6 shadow-2xs">
                <h3 className="text-[15.5px] font-bold text-[#1e293b] mb-4">Kargo Firmalarına Göre Gönderim Raporu</h3>
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#f7f7f7] text-[#333] font-semibold">
                      <th className="py-2.5 px-3 rounded-l-[5px]">Kargo Firması</th>
                      <th className="py-2.5 px-3 text-center">Gönderi Adedi</th>
                      <th className="py-2.5 px-3 text-center">Ort. Teslim Süresi</th>
                      <th className="py-2.5 px-3 text-right rounded-r-[5px]">Teslim Oranı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3 font-semibold">Yurtiçi Kargo</td>
                      <td className="py-3 px-3 text-center font-bold">94</td>
                      <td className="py-3 px-3 text-center">1,4 Gün</td>
                      <td className="py-3 px-3 text-right text-[#0abb87] font-bold">%96,8</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Aras Kargo</td>
                      <td className="py-3 px-3 text-center font-bold">18</td>
                      <td className="py-3 px-3 text-center">1,6 Gün</td>
                      <td className="py-3 px-3 text-right text-[#0abb87] font-bold">%94,4</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Kargoist / PTT Kargo</td>
                      <td className="py-3 px-3 text-center font-bold">7</td>
                      <td className="py-3 px-3 text-center">1,8 Gün</td>
                      <td className="py-3 px-3 text-right text-[#0abb87] font-bold">%92,0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: ÜRÜN, KATEGORİ & STOK RAPORLARI */}
        {activeSubTab === "urun" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-6 shadow-2xs">
              <h3 className="text-[16px] font-bold text-[#1e293b] mb-4">
                En Çok Satan Ürünler &amp; Karlılık Analizi (.qs-data-table)
              </h3>
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#f7f7f7] text-[#333] font-semibold">
                    <th className="py-3 px-3">Ürün</th>
                    <th className="py-3 px-3 text-center">Satış Adedi</th>
                    <th className="py-3 px-3 text-center">Kalan Stok</th>
                    <th className="py-3 px-3 text-right">Birim Fiyat</th>
                    <th className="py-3 px-3 text-right">Toplam Ciro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={PRODUCT_IMG_1} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
                        <div>
                          <div className="font-semibold text-[#1e293b]">
                            Amg Gt 4 Kapı Dönüşüm Bodykit Seti / Boyasız Pp Plastik
                          </div>
                          <div className="text-[11.5px] text-slate-400">BKM-AMG-01</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1565c0]">24 Adet</td>
                    <td className="py-3 px-3 text-center font-semibold">12</td>
                    <td className="py-3 px-3 text-right">2,850.00 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#0abb87]">68,400.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={PRODUCT_IMG_2} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
                        <div>
                          <div className="font-semibold text-[#1e293b]">
                            Bmw F30 M Performance Ön Lip &amp; Difüzör Seti Piano Black
                          </div>
                          <div className="text-[11.5px] text-slate-400">BKM-F30-02</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1565c0]">19 Adet</td>
                    <td className="py-3 px-3 text-center font-semibold">34</td>
                    <td className="py-3 px-3 text-right">2,400.00 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#0abb87]">45,600.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={PRODUCT_IMG_1} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
                        <div>
                          <div className="font-semibold text-[#1e293b]">
                            Mercedes W205 C63 Görünüm Arka Difüzör + Egzoz Ucu
                          </div>
                          <div className="text-[11.5px] text-slate-400">BKM-W205-03</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1565c0]">15 Adet</td>
                    <td className="py-3 px-3 text-center font-semibold">8</td>
                    <td className="py-3 px-3 text-right">3,100.00 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#0abb87]">46,500.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={PRODUCT_IMG_1} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
                        <div>
                          <div className="font-semibold text-[#1e293b]">
                            Audi A4 B9 RS4 Stil Bal Peteği Ön Panjur Piano Black
                          </div>
                          <div className="text-[11.5px] text-slate-400">BKM-A4-04</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1565c0]">11 Adet</td>
                    <td className="py-3 px-3 text-center font-semibold">19</td>
                    <td className="py-3 px-3 text-right">2,650.00 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#0abb87]">29,150.00 TL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: MÜŞTERİ, ÜYE & ŞEHİR RAPORLARI */}
        {activeSubTab === "musteri" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-6 shadow-2xs">
              <h3 className="text-[16px] font-bold text-[#1e293b] mb-4">
                En Çok Sipariş Veren İller &amp; Müşteri Segmentasyonu
              </h3>
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#f7f7f7] text-[#333] font-semibold">
                    <th className="py-3 px-3">Şehir / Bölge</th>
                    <th className="py-3 px-3 text-center">Sipariş Sayısı</th>
                    <th className="py-3 px-3 text-center">Müşteri Sayısı</th>
                    <th className="py-3 px-3 text-right">Ciro Payı</th>
                    <th className="py-3 px-3 text-right">Toplam Satış Tutarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-semibold">İstanbul</td>
                    <td className="py-3 px-3 text-center font-bold">46</td>
                    <td className="py-3 px-3 text-center">41</td>
                    <td className="py-3 px-3 text-right text-[#0abb87] font-bold">%38,6</td>
                    <td className="py-3 px-3 text-right font-bold">130,210.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Ankara</td>
                    <td className="py-3 px-3 text-center font-bold">22</td>
                    <td className="py-3 px-3 text-center">19</td>
                    <td className="py-3 px-3 text-right text-[#1565c0] font-bold">%18,5</td>
                    <td className="py-3 px-3 text-right font-bold">62,400.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">İzmir</td>
                    <td className="py-3 px-3 text-center font-bold">16</td>
                    <td className="py-3 px-3 text-center">15</td>
                    <td className="py-3 px-3 text-right text-[#1565c0] font-bold">%13,4</td>
                    <td className="py-3 px-3 text-right font-bold">45,200.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Bursa &amp; Kocaeli</td>
                    <td className="py-3 px-3 text-center font-bold">14</td>
                    <td className="py-3 px-3 text-center">13</td>
                    <td className="py-3 px-3 text-right text-[#1565c0] font-bold">%11,8</td>
                    <td className="py-3 px-3 text-right font-bold">39,810.00 TL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: PAZARYERİ & KUPON RAPORLARI */}
        {activeSubTab === "pazaryeri" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-6 shadow-2xs">
              <h3 className="text-[16px] font-bold text-[#1e293b] mb-4">
                Satış Kanalları, Pazaryeri &amp; Kampanya Kupon Performansı
              </h3>
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#f7f7f7] text-[#333] font-semibold">
                    <th className="py-3 px-3">Satış Kanalı / Pazaryeri</th>
                    <th className="py-3 px-3 text-center">Sipariş Adedi</th>
                    <th className="py-3 px-3 text-right">Ortalama Sepet</th>
                    <th className="py-3 px-3 text-right">Toplam Ciro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-semibold">Web Mağaza (kombingo.com)</td>
                    <td className="py-3 px-3 text-center font-bold">88</td>
                    <td className="py-3 px-3 text-right">2,890.00 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#0abb87]">254,320.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Trendyol Mağaza Entegrasyonu</td>
                    <td className="py-3 px-3 text-center font-bold">24</td>
                    <td className="py-3 px-3 text-right">2,680.00 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#1565c0]">64,320.00 TL</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Hepsiburada &amp; N11 Mağazaları</td>
                    <td className="py-3 px-3 text-center font-bold">7</td>
                    <td className="py-3 px-3 text-right">2,670.90 TL</td>
                    <td className="py-3 px-3 text-right font-bold text-[#1565c0]">18,696.34 TL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 5: ZİYARETÇİ, TRAFİK & DÖNÜŞÜM HUNİSİ */}
        {activeSubTab === "trafik" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-6 shadow-2xs">
              <h3 className="text-[16px] font-bold text-[#1e293b] mb-4">
                Ziyaretçi Trafik Kaynakları &amp; E-Ticaret Dönüşüm Hunisi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-4 text-center">
                  <div className="text-[11.5px] font-semibold text-slate-500">1. Toplam Ziyaretçi</div>
                  <div className="text-[20px] font-extrabold text-[#0f172a] my-1">4.619</div>
                  <div className="text-[11.5px] font-bold text-[#0abb87]">%100</div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-4 text-center">
                  <div className="text-[11.5px] font-semibold text-slate-500">2. Sepete Ekleyen</div>
                  <div className="text-[20px] font-extrabold text-[#0f172a] my-1">197</div>
                  <div className="text-[11.5px] font-bold text-[#0abb87]">%4,26</div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-4 text-center">
                  <div className="text-[11.5px] font-semibold text-slate-500">3. Ödeme Adımına Geçen</div>
                  <div className="text-[20px] font-extrabold text-[#0f172a] my-1">94</div>
                  <div className="text-[11.5px] font-bold text-[#0abb87]">%2,03</div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-4 text-center">
                  <div className="text-[11.5px] font-semibold text-slate-500">4. Teslimat Adresi Seçen</div>
                  <div className="text-[20px] font-extrabold text-[#0f172a] my-1">67</div>
                  <div className="text-[11.5px] font-bold text-[#0abb87]">%1,45</div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-4 text-center">
                  <div className="text-[11.5px] font-semibold text-slate-500">5. Siparişi Tamamlayan</div>
                  <div className="text-[20px] font-extrabold text-[#0f172a] my-1">47</div>
                  <div className="text-[11.5px] font-bold text-[#0abb87]">%1,02 Dönüşüm</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Raporlar",
  icon: ChartBar,
})

export default ReportsPage
