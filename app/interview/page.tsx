import type { Metadata } from 'next'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import InterviewChecklist from './InterviewChecklist'
import './interview.css'

/**
 * Чеклист знакомства с кандидатом — для ведущих, открыть рядом с Meet и отмечать по ходу.
 * Исходник текста — plans/interview-checklist.md, порядок и фразы — plans/intro-meeting-flow.md.
 *
 * Как и /qr, от индексации закрыта в трёх местах: noindex ниже, Disallow
 * в app/robots.ts и заголовок X-Robots-Tag в vercel.json. В sitemap.ts страницы нет.
 */
export const metadata: Metadata = {
  title: 'Чеклист знакомства — служебная страница',
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
          <h1 className="section-title">Чеклист знакомства</h1>
          <p className="interview-page__lead">
            Знакомство на 10–15 минут, в течение 48 часов после заявки. Главный вопрос, на который отвечаем себе к концу: подходит ли
            этот человек в эту группу сейчас и к нам как к ведущим. Отметки хранятся только
            в этом браузере.
          </p>
          <InterviewChecklist />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
