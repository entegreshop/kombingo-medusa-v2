import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), "uploads", "pages-config.json")

const defaultPages = {
  "hakkimizda": {
    title: "Hakkımızda",
    content: "Özse Moda Tekstil Ltd. Şti. olarak moda dünyasında öncü markalardan biri olmayı hedefliyoruz."
  },
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    content: "İşbu sözleşme 13.06.2003 tarih ve 25137 sayılı Resmi Gazetede yayımlanan Mesafeli Sözleşmeler Uygulama Usul ve Esasları Hakkında Yönetmelik gereği internet üzerinden gerçekleştiren satışlar için sözleşme yapılması zorunluluğuna istinaden düzenlenmiş olup, maddeler halinde aşağıda belirtilmiştir."
  },
  "iade-ve-degisim": {
    title: "İptal, İade ve Değişim Koşulları",
    content: "Almış olduğunuz ürünleri kullanılmamış ve etiketleri sökülmemiş olması şartıyla 14 gün içerisinde iade edebilir veya değiştirebilirsiniz."
  },
  "kvkk": {
    title: "KVKK",
    content: "Kişisel Verilerin Korunması Kanunu uyarınca verileriniz güvenle işlenmektedir. Verileriniz üçüncü kişilerle paylaşılmamaktadır."
  },
  "teslimat-kargo": {
    title: "Teslimat ve Kargo Şartları",
    content: "Saat 15:00'a kadar verilen tüm siparişleriniz aynı gün kargoya teslim edilmektedir. Teslimat süresi ortalama 1-3 iş günüdür."
  },
  "kullanici-sozlesmesi": {
    title: "Kullanıcı Sözleşmesi",
    content: "Web sitemizi kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız."
  },
  "gizlilik-sozlesmesi": {
    title: "Gizlilik Sözleşmesi",
    content: "Müşterilerimizin gizliliğine önem veriyoruz ve kişisel verilerinizi yetkisiz erişime karşı koruyoruz."
  },
  "iletisim": {
    title: "İletişim",
    content: "ÖZSE MODA TEKSTİL LTD. ŞTİ.\nAdres: Merkez Mahallesi Merter Sokak NO 44 Güngören / İstanbul\nTel: +90 530 456 43 77\nE-posta: info@kombingo.com"
  },
  "siparis-takip": {
    title: "Sipariş Takip",
    content: "Siparişinizi hesabım sayfasından veya kargo takip numaranızı kullanarak kargo firması sitesinden takip edebilirsiniz."
  },
  "havale-bildirimleri": {
    title: "Havale Bildirimleri",
    content: "Havale/EFT ile yaptığınız ödemeleriniz için dekontunuzu WhatsApp hattımızdan bize iletebilirsiniz."
  }
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new Response("", { headers: corsHeaders })
}

function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      return JSON.parse(content)
    }
  } catch (err) {
    console.error("Error reading pages config:", err)
  }
  return defaultPages
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pages = readConfig()
  res.status(200).json({ pages })
}
