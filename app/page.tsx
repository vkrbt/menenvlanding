import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { startPhrase } from '@/lib/group'
import JsonLd from '@/components/JsonLd'
import MuzhikLanding, { FAQ } from '@/components/v2/MuzhikLanding'
import { homeGraph } from '@/lib/jsonld'
import { GROUP_MEETINGS, GROUP_SEATS, OG_IMAGE, SITE_URL } from '@/lib/site'

/**
 * Главная. С 18.11.2026 это лендинг «Устал тащить всё на себе?» (бывший /muzhik, components/v2/MuzhikLanding.tsx).
 * Прежняя главная спрятана в components/home/MainLanding.tsx — чтобы вернуть, отрендерить её здесь.
 */

const GTAG_ID = 'AW-17711060777'

export const metadata: Metadata = {
  title: 'Мужская терапевтическая группа онлайн — «Мужская среда»',
  description: `Мужская терапевтическая группа онлайн: ${GROUP_MEETINGS} встреч в Zoom, у каждой своя тема — детство, родители, злость, деньги, отношения, зависимости. Ведут психолог и психиатр, до ${GROUP_SEATS} человек. Старт ${startPhrase()}.`,
  alternates: { canonical: SITE_URL },
  verification: {
    google: 'sjb7kCjnfx5DRJe82WrcYUAtKzcv7SlB6nzpQYQ3iWA',
    yandex: '6472216fcda6ad1d',
  },
  openGraph: {
    title: 'Мужская терапевтическая группа онлайн — «Мужская среда»',
    description: `Устал тащить всё на себе? Терапевтическая группа для мужчин: ${GROUP_MEETINGS} встреч в Zoom, ведут психолог и психиатр. Старт ${startPhrase()}.`,
    type: 'website',
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph(FAQ.map(([q, a]) => ({ q, a })))} />

      <MuzhikLanding />

      {/* Google Ads. Раньше грузился в <head> синхронно и блокировал отрисовку */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GTAG_ID}');`}
      </Script>
    </>
  )
}
