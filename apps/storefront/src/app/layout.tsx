export const dynamic = "force-dynamic"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "../styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta-sans" 
})

import PixelScripts from "@modules/layout/components/pixel-scripts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <PixelScripts />
        {children}
      </body>
    </html>
  )
}
