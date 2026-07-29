import type { Metadata } from 'next'
import ScrollAnimations from '@/components/ScrollAnimations'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import Arc from '@/components/book/Arc'
import Books from '@/components/book/Books'
import HeroBooks from '@/components/book/HeroBooks'
import Price from '@/components/book/Price'
import Shipping from '@/components/book/Shipping'
import Support from '@/components/book/Support'
import Why from '@/components/book/Why'
import { OG_IMAGE_BOOK, SITE_URL } from '@/lib/site'
import './book.css'

export const metadata: Metadata = {
  title: 'Три книги для мужчин — Мужская среда',
  description: 'Три книги, которые стоило прочитать вчера. Комплект от «Мужской среды».',
  alternates: { canonical: `${SITE_URL}/book` },
  openGraph: {
    title: 'Три книги, которые стоило прочитать вчера',
    description:
      'Зойя, Холлис, Гловер — комплект от «Мужской среды». Для тех, кто чувствует что-то, но не может это назвать.',
    type: 'website',
    url: `${SITE_URL}/book`,
    images: [{ url: OG_IMAGE_BOOK, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Три книги, которые стоило прочитать вчера',
    description:
      'Зойя, Холлис, Гловер — комплект от «Мужской среды». Для тех, кто чувствует что-то, но не может это назвать.',
    images: [OG_IMAGE_BOOK],
  },
}

export default function BookPage() {
  return (
    <>
      <SiteHeader />

      <HeroBooks />
      <Books />
      <Arc />
      <Why />
      <Support />
      <Price />
      <Shipping />

      {/* Финальная цитата: своя разметка, от промо-блока главной отличается подписью */}
      <section className="section promo-text">
        <div className="promo-text__glow" aria-hidden="true" />
        <div className="container promo-text__inner animate-in">
          <span className="promo-text__mark" aria-hidden="true">&quot;</span>
          <blockquote className="promo-text__copy">
            Мужчина, который не знает своей раны,<br />
            <strong>обречён её воспроизводить.</strong>
          </blockquote>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '12px' }}>— Джеймс Холлис</p>
        </div>
      </section>

      <SiteFooter />

      {/* У страницы книг свои пороги наблюдателя — как в инлайновом скрипте book.html */}
      <ScrollAnimations threshold={0.08} rootMargin="0px 0px -40px 0px" />
    </>
  )
}
