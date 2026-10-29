import type { Metadata, Viewport } from 'next'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import LonelinessTest from '@/components/tests/LonelinessTest'
import ScrollAnimations from '@/components/ScrollAnimations'
import Typo from '@/components/Typo'
import { OG_IMAGE, ORG_ID, SITE_URL, TESTS_URL, WEBSITE_ID } from '@/lib/site'
import { LONELINESS_SLUG, QUESTIONS } from '@/lib/tests/loneliness'
import '../tests.css'

/**
 * Авторский тест «Мужской среды» — отдельный маршрут, а не запись в реестре:
 * хаб обещает классические шкалы, а этот тест типологический и не валидирован.
 * Статический сегмент важнее [slug], так что конфликта с реестром нет.
 */

const CANONICAL = `${SITE_URL}${TESTS_URL}/${LONELINESS_SLUG}`
const TITLE = 'Друзья есть. А поговорить не с кем? Тест — «Мужская среда»'
const DESCRIPTION =
  'Авторский тест «Мужской среды»: есть ли рядом твои люди и о чём ты молчишь. 18 вопросов, около 4 минут, анонимно.'

/** Кнопка в бота прибита к низу экрана: без cover браузер не отдаёт env(safe-area-inset-bottom) */
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Друзья есть. А поговорить не с кем?',
    description: DESCRIPTION,
    type: 'website',
    url: CANONICAL,
    images: [OG_IMAGE],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': CANONICAL,
      name: 'Друзья есть. А поговорить не с кем?',
      description: DESCRIPTION,
      inLanguage: 'ru',
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
    },
  ],
}

export default function LonelinessPage() {
  return (
    <>
      <JsonLd data={graph} />
      <SiteHeader />

      <main className="tpage">
        <Typo>
          <section className="blog-hero">
            <div className="container">
              <nav className="blog-crumbs" aria-label="Хлебные крошки">
                <a href="/">Главная</a>
                <span aria-hidden="true"> · </span>
                <a href={TESTS_URL}>Тесты</a>
                <span aria-hidden="true"> · </span>
                <span>Поговорить не с кем</span>
              </nav>
              <h1 className="blog-hero__title">Друзья есть. А поговорить не с кем?</h1>
              <p className="blog-hero__sub">
                Две части. Первая — есть ли рядом твои люди: просто компания и те, с кем можно
                честно. Это разные вещи, и у мужчин чаще всего не хватает второго. Вторая — о чём ты
                молчишь, даже когда есть с кем поговорить.
              </p>
              <ul className="tpage__facts">
                <li>{QUESTIONS.length} вопросов</li>
                <li>около 4 мин</li>
                <li>результат сразу</li>
              </ul>
            </div>
          </section>

          <section className="container tpage__runner">
            <p className="tpage__privacy">
              Анонимно: ответы считаются в твоём браузере — мы их не видим и не сохраняем.
            </p>
            <LonelinessTest />
            <p className="tpage__disclaimer">
              Это авторский тест «Мужской среды», а не диагностика. Он помогает посмотреть на себя
              со стороны и не заменяет консультацию специалиста.
            </p>
          </section>

          <section className="container tmethod" aria-labelledby="method-title">
            <h2 id="method-title" className="meeting-section__title">О методике</h2>

            <h3>Как считается результат</h3>
            <p>
              Часть 1 — 10 утверждений по двум шкалам: «близость» (есть ли хотя бы один человек, с
              которым можно говорить о важном) и «компания» (есть ли круг общения). По каждой шкале
              ответы переводятся в 0–100, где больше — сильнее нехватка. Порог — 50. Сочетание двух
              шкал даёт один из четырёх типов. Ещё один вопрос — с кем ты обычно говоришь о том, что
              волнует, — уточняет картину.
            </p>
            <p>
              Часть 2 — 7 тем, о которых мужчинам чаще всего не с кем поговорить. Тема считается
              «молчаливой», если говорить о ней не с кем или есть с кем, но ты не говоришь.
            </p>

            <h3>Важные оговорки</h3>
            <ul>
              <li>
                Это авторский тест «Мужской среды». Вопросы оригинальные, тест не проходил
                психометрическую валидацию.
              </li>
              <li>
                Одиночество — не диагноз. Но если оно сопровождается подавленностью, потерей интереса
                ко всему, проблемами со сном, стоит проверить депрессию:{' '}
                <a href={`${TESTS_URL}/phq-9`}>PHQ-9</a> займёт 3 минуты.
              </li>
            </ul>

            <h3>На что опирается тест</h3>
            <ul className="tmethod__sources">
              <li>
                Weiss R. S. Loneliness: The Experience of Emotional and Social Isolation. MIT Press,
                1973<span className="tmethod__covers"> — разделение одиночества на эмоциональное и социальное</span>
              </li>
              <li>
                De Jong Gierveld J., Van Tilburg T. A 6-item scale for overall, emotional, and social
                loneliness. Research on Aging, 2006, 28(5), 582–598
              </li>
              <li>
                Russell D. W. UCLA Loneliness Scale (Version 3). Journal of Personality Assessment,
                1996, 66(1), 20–40
              </li>
            </ul>
          </section>
        </Typo>
      </main>

      <ScrollAnimations targets=".tmethod" />

      <SiteFooter />
    </>
  )
}
