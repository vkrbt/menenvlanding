import type { Metadata } from 'next'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import InterviewChecklist from './InterviewChecklist'
import './interview.css'

/**
 * Шпаргалка знакомства с кандидатом — для ведущих, открыть рядом с Meet.
 * Повторяет PDF «Шпаргалка созвона — Мужская среда»: 8 шагов разговора слева, справочные карточки справа.
 *
 * Как и /qr, от индексации закрыта в трёх местах: noindex ниже, Disallow
 * в app/robots.ts и заголовок X-Robots-Tag в vercel.json. В sitemap.ts страницы нет.
 */
export const metadata: Metadata = {
  title: 'Шпаргалка знакомства — служебная страница',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function InterviewPage() {
  return (
    <>
      <SiteHeader />

      <section className="section interview-page">
        <div className="container interview-page__inner">
          <div className="interview-page__head">
            <h1 className="section-title">Знакомство · 15–20 минут</h1>
            <p className="interview-page__lead">
              Он говорит 70% времени. Записывай его слова — в блоке 6 они вернутся к нему.
            </p>
          </div>
          <InterviewChecklist />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
