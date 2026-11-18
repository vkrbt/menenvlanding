import Script from 'next/script'
import SiteHeader from '@/components/SiteHeader'
import JsonLd from '@/components/JsonLd'
import ScrollActive from '@/components/ScrollActive'
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

/**
 * Что появляется при прокрутке (.animate-in): заголовки секций и все блоки под ними.
 * Первый экран (Hero) не трогаем — он виден сразу, без ожидания скрипта.
 */
const ANIMATED = [
  '.section-title',
  '.section-lead',
  '.program__lead',
  '.for-who__item',
  '.for-who__conclusion',
  '.program__item',
  '.program__note',
  '.offer__inner',
  '.community-format__item',
  '.host-card',
  '.tcard',
  '.youtube__inner',
  '.pricing__card',
  '.pricing__footer-note',
  '.attendance-policy__card',
  '.step',
  '.process__note',
  '.faq__item',
  '.promo-text__inner',
  '.cta-final__inner',
].join(', ')

const GTAG_ID = 'AW-17711060777'

/**
 * Прежняя главная («Друзья есть, а поговорить не с кем?»). С 18.11.2026 спрятана: главной стал
 * лендинг components/v2/MuzhikLanding.tsx. Код оставлен, чтобы вернуть: в app/page.tsx отрендерить
 * <MainLanding /> вместо <MuzhikLanding /> и вернуть якоря шапки (NAV_ITEMS в lib/site.ts).
 */
export default function MainLanding() {
  return (
    <>
      <JsonLd data={homeGraph(FAQ_JSONLD)} />

      <SiteHeader home />

      <main className="home">
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
      </main>

      <SiteFooter />

      <ScrollAnimations targets={ANIMATED} />
      {/* На телефоне иллюстрации оживают при появлении в экране — как на десктопе при наведении */}
      <ScrollActive
        selector=".community-format__item, .attendance-policy__card, .host-card"
        watch=".fart, .attendance-policy__icon, .host-card__avatar"
      />

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
