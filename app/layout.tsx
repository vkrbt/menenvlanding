import type { Metadata } from 'next'
import ThemeInit from '@/components/ThemeInit'
import MetrikaGoals from '@/components/MetrikaGoals'
import YandexMetrika from '@/components/YandexMetrika'
import { DELA_HREF, MANROPE_HREF } from '@/lib/fonts'
import { SITE_URL } from '@/lib/site'
import './globals.css'

/**
 * Общая обвязка всех страниц: <html lang="ru">, шрифты, иконки, анти-FOUC.
 * Заголовки, описания, canonical и OG задаёт каждая страница отдельно.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ThemeInit проставляет data-theme на <html> до гидратации, поэтому серверная
    // разметка заведомо не совпадает с клиентской — это ожидаемо и подавляется
    // только для атрибутов самого <html>, не для потомков
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Два запроса вместо одного: у Dela Gothic One свой набор глифов, см. lib/fonts.ts */}
        <link href={MANROPE_HREF} rel="stylesheet" />
        <link href={DELA_HREF} rel="stylesheet" />
      </head>
      <body>
        <ThemeInit />
        {children}
        <YandexMetrika />
        <MetrikaGoals />
      </body>
    </html>
  )
}
