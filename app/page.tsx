import type { Metadata } from 'next'
import Script from 'next/script'
import SiteHeader from '@/components/SiteHeader'
import JsonLd from '@/components/JsonLd'
import MeetingClock from '@/components/MeetingClock'
import ScrollAnimations from '@/components/ScrollAnimations'
import SiteFooter from '@/components/SiteFooter'
import AttendancePolicy from '@/components/home/AttendancePolicy'
import CommunityFormat from '@/components/home/CommunityFormat'
import CountdownSection from '@/components/home/CountdownSection'
import CtaFinal from '@/components/home/CtaFinal'
import FaqSection, { FAQ_JSONLD } from '@/components/home/FaqSection'
import Features from '@/components/home/Features'
import ForWho from '@/components/home/ForWho'
import Hero from '@/components/home/Hero'
import Hosts from '@/components/home/Hosts'
import Pricing from '@/components/home/Pricing'
import Process from '@/components/home/Process'
import PromoText from '@/components/home/PromoText'
import Testimonials from '@/components/home/Testimonials'
import YouTubeSection from '@/components/home/YouTubeSection'
import { homeGraph } from '@/lib/jsonld'
import { OG_IMAGE, SITE_URL } from '@/lib/site'

/** Селекторы, которым скрипт раздаёт .animate-in — как в scripts/main.js */
const ANIMATED = '.card, .feature-item, .host-card, .step, .faq__item, .pricing__card'

const GTAG_ID = 'AW-17711060777'

export const metadata: Metadata = {
  title: 'Мужская среда — мужское онлайн-сообщество | Клуб для мужчин 25+',
  description:
    'Закрытое онлайн-сообщество для мужчин 25+. Встречи в Zoom раз в две недели, ведущие — психолог и психиатр. Подкаст, нетворкинг, закрытый чат. Русскоязычные мужчины по всему миру.',
  alternates: { canonical: SITE_URL },
  verification: {
    google: 'sjb7kCjnfx5DRJe82WrcYUAtKzcv7SlB6nzpQYQ3iWA',
    yandex: '6472216fcda6ad1d',
  },
  openGraph: {
    title: 'Мужская среда — мужское онлайн-сообщество',
    description:
      'Для мужчин, которым есть что сказать — но некому. Закрытый онлайн-клуб 25+. Встречи раз в две недели в Zoom.',
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
      <CountdownSection />
      <ForWho />
      <Features />
      <CommunityFormat />
      <Testimonials />
      <Hosts />
      <YouTubeSection />
      <Pricing />
      <AttendancePolicy />
      <Process />
      <FaqSection />
      <PromoText />
      <CtaFinal />

      <SiteFooter />

      <MeetingClock />
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
