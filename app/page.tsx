import type { Metadata } from 'next'
import Script from 'next/script'
import SiteHeader from '@/components/SiteHeader'
import JsonLd from '@/components/JsonLd'
import ScrollAnimations from '@/components/ScrollAnimations'
import SiteFooter from '@/components/SiteFooter'
import AttendancePolicy from '@/components/home/AttendancePolicy'
import CommunityFormat from '@/components/home/CommunityFormat'
import CtaFinal from '@/components/home/CtaFinal'
import FaqSection, { FAQ_JSONLD } from '@/components/home/FaqSection'
import ForWho from '@/components/home/ForWho'
import Hero from '@/components/home/Hero'
import Hosts from '@/components/home/Hosts'
import Offer from '@/components/home/Offer'
import Pricing from '@/components/home/Pricing'
import Program from '@/components/home/Program'
import Process from '@/components/home/Process'
import PromoText from '@/components/home/PromoText'
import Testimonials from '@/components/home/Testimonials'
import YouTubeSection from '@/components/home/YouTubeSection'
import { homeGraph } from '@/lib/jsonld'
import { OG_IMAGE, SITE_URL } from '@/lib/site'

/** Селекторы, которым скрипт раздаёт .animate-in — как в scripts/main.js */
const ANIMATED = '.for-who__item, .program__item, .host-card, .step, .faq__item, .pricing__card'

const GTAG_ID = 'AW-17711060777'

export const metadata: Metadata = {
  title: 'Мужская среда — тематическая мужская группа онлайн | Для мужчин 25+',
  description:
    'Тематическая группа для мужчин 25+: 9 встреч в Zoom раз в две недели, у каждой своя тема — дело и деньги, отношения, зависимости, агрессия, родители. Ведут психолог и психиатр. Русскоязычные мужчины по всему миру.',
  alternates: { canonical: SITE_URL },
  verification: {
    google: 'sjb7kCjnfx5DRJe82WrcYUAtKzcv7SlB6nzpQYQ3iWA',
    yandex: '6472216fcda6ad1d',
  },
  openGraph: {
    title: 'Мужская среда — тематическая мужская группа',
    description:
      'Для мужчин, которым есть что сказать — но некому. 9 встреч в Zoom, у каждой своя тема. Набор открыт.',
    type: 'website',
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph(FAQ_JSONLD)} />

      <SiteHeader home />

      <Hero />
      <ForWho />
      <Program />
      <Offer />
      <CommunityFormat />
      <Hosts />
      <Testimonials />
      <YouTubeSection />
      <Pricing />
      <AttendancePolicy />
      <Process />
      <FaqSection />
      <PromoText />
      <CtaFinal />

      <SiteFooter />

      <ScrollAnimations targets={ANIMATED} />

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
