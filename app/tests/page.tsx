import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { testsHubGraph } from '@/lib/jsonld'
import { OG_IMAGE, SITE_URL, TESTS_URL } from '@/lib/site'
import { questionCount, questionsLabel, TESTS } from '@/lib/tests/registry'
import './tests.css'

const CANONICAL = `${SITE_URL}${TESTS_URL}`

export const metadata: Metadata = {
  title: 'Психологические тесты онлайн: депрессия, тревожность — шкалы Бека, HADS, Спилбергера',
  description:
    'Анонимные тесты по классическим шкалам: депрессия Бека, тревожность Спилбергера–Ханина, HADS, опросник Яхина–Менделевича. Подсчёт по первоисточникам, ответы не покидают браузер.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Психологические тесты: депрессия и тревога',
    description: 'Классические шкалы с подсчётом по первоисточникам. Анонимно, результат сразу.',
    type: 'website',
    url: CANONICAL,
    images: [OG_IMAGE],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

export default function TestsHub() {
  return (
    <>
      <JsonLd data={testsHubGraph()} />
      <SiteHeader />

      <main className="tpage">
        <section className="blog-hero">
          <div className="container">
            <nav className="blog-crumbs" aria-label="Хлебные крошки">
              <a href="/">Главная</a>
              <span aria-hidden="true"> · </span>
              <span>Тесты</span>
            </nav>
            <h1 className="blog-hero__title">Тесты на депрессию и тревогу</h1>
            <p className="blog-hero__sub">
              Классические психологические шкалы, по которым работают врачи и психологи. Каждый
              тест считается ровно так, как в первоисточнике: ключи и пороги сверены с методиками,
              а не взяты с других сайтов. Анонимно — ответы не покидают твой браузер.
            </p>
          </div>
        </section>

        <section className="container">
          <ul className="thub">
            {TESTS.map(({ scale, topic }) => (
              <li key={scale.slug}>
                <a className="thub__card" href={`${TESTS_URL}/${scale.slug}`}>
                  <span className="thub__title">{scale.title}</span>
                  <span className="thub__measures">{scale.measures}</span>
                  <span className="thub__meta">
                    {topic} · {questionsLabel(questionCount(scale))} · около {scale.minutes} мин
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="tpage__disclaimer thub__disclaimer">
            Тесты — это скрининг, а не диагноз, и они не заменяют консультацию специалиста.
            Если тебе сейчас очень плохо или есть мысли о самоубийстве — звони в экстренную службу 112.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
