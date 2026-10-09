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
  title: 'Психологические тесты онлайн: депрессия, тревога, выгорание, стресс, алкоголь',
  description:
    '13 анонимных тестов по классическим шкалам: Бек, PHQ-9, GAD-7, HADS, Спилбергер–Ханин, выгорание Маслач и Бойко, AUDIT, WHO-5. Подсчёт по первоисточникам, ответы не покидают браузер.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Психологические тесты: депрессия, тревога, выгорание',
    description: 'Классические шкалы с подсчётом по первоисточникам. Анонимно, результат сразу.',
    type: 'website',
    url: CANONICAL,
    images: [OG_IMAGE],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

/** Темы в порядке первого появления в реестре */
const groups = [...new Set(TESTS.map((t) => t.topic))].map(
  (topic) => [topic, TESTS.filter((t) => t.topic === topic)] as const,
)

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
            <h1 className="blog-hero__title">Психологические тесты</h1>
            <p className="blog-hero__sub">
              Классические психологические шкалы, по которым работают врачи и психологи. Каждый
              тест считается ровно так, как в первоисточнике: ключи и пороги сверены с методиками,
              а не взяты с других сайтов. Анонимно — ответы не покидают твой браузер.
            </p>
          </div>
        </section>

        <section className="container">
          {groups.map(([topic, tests]) => (
            <section className="thub__group" key={topic} aria-labelledby={`t-${topic}`}>
              <h2 className="thub__topic-title" id={`t-${topic}`}>{topic}</h2>
              <ul className="thub">
                {tests.map(({ scale }) => (
                  <li key={scale.slug}>
                    <a className="thub__card" href={`${TESTS_URL}/${scale.slug}`}>
                      <span className="thub__title">{scale.title}</span>
                      <span className="thub__measures">{scale.measures}</span>
                      <span className="thub__meta">
                        {questionsLabel(questionCount(scale))} · около {scale.minutes} мин
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}

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
