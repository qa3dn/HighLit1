import type { Metadata, Viewport } from 'next'
import { Fira_Code, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HighLit - كود وفضفض',
  description: 'المنصة الرقمية للمبرمجين الأردنيين - كود وفضفض',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${ibmPlexSansArabic.variable} ${firaCode.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

