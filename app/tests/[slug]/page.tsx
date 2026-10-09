import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import TestRunner from '@/components/tests/TestRunner'
import { testGraph } from '@/lib/jsonld'
import { getPostBySlug } from '@/lib/posts'
import { BLOG_URL, OG_IMAGE, SITE_URL, TESTS_URL } from '@/lib/site'
import { getTest, questionCount, questionsLabel, TESTS } from '@/lib/tests/registry'
import type { Scale } from '@/lib/tests/types'
import '../tests.css'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return TESTS.map((t) => ({ slug: t.scale.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const test = getTest(slug)
  if (!test) return {}
  const canonical = `${SITE_URL}${TESTS_URL}/${slug}`
  return {
    title: test.seoTitle,
    description: test.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: test.scale.title,
      description: test.seoDescription,
      type: 'website',
      url: canonical,
      images: [OG_IMAGE],
      locale: 'ru_RU',
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  }
}

/** Полный текст методики: пункты, ключ, границы — из тех же данных, что и подсчёт */
function FullMethod({ scale }: { scale: Scale }) {
  const fmt = (n: number, divisor = 1) =>
    !Number.isFinite(n) ? (n > 0 ? '∞' : '−∞') : String(n / divisor).replace('.', ',').replace('-', '−')

  return (
    <details className="tmethod__full">
      <summary>Все вопросы, ключ и пороги</summary>

      {scale.parts.map((part) => {
        const items = scale.items.filter((i) => (scale.parts.length > 1 ? i.part === part.id : true))
        return (
          <div key={part.id}>
            {scale.parts.length > 1 && <h3>{part.title}</h3>}
            <p className="tmethod__instruction">{part.instruction}</p>
            <ol className="tmethod__items">
              {items.map((item) => (
                <li key={item.id} value={/^\d+$/.test(item.id) ? Number(item.id) : undefined}>
                  {!/^\d+$/.test(item.id) && <span className="tmethod__id">{item.id}. </span>}
                  {item.text && <span>{item.text}</span>}
                  <ul>
                    {item.options.map((o) => {
                      const pts = Object.entries(o.scores)
                      return (
                        <li key={o.value}>
                          {o.label}
                          {pts.length > 0 && (
                            <span className="tmethod__pts">
                              {' '}— {pts.map(([sub, p]) => {
                                const s = scale.subscales.find((x) => x.id === sub)!
                                return `${s.title}: ${fmt(p, s.divisor)}`
                              }).join('; ')}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )
      })}

      <h3>Границы категорий</h3>
      {scale.subscales
        .filter((s) => s.categories.length)
        .map((s) => (
          <div key={s.id}>
            <p className="tmethod__sub">{s.title}</p>
            <ul>
              {s.categories.map((c) => (
                <li key={c.id}>
                  {fmt(Math.max(c.min, s.min), s.divisor)}…{fmt(Math.min(c.max, s.max), s.divisor)} — {c.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </details>
  )
}

export default async function TestPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const test = getTest(slug)
  if (!test) notFound()
  const { scale } = test
  const related = test.related.map((s) => getPostBySlug(s))

  return (
    <>
      <JsonLd data={testGraph(test)} />
      <SiteHeader />

      <main className="tpage">
        <section className="blog-hero">
          <div className="container">
            <nav className="blog-crumbs" aria-label="Хлебные крошки">
              <a href="/">Главная</a>
              <span aria-hidden="true"> · </span>
              <a href={TESTS_URL}>Тесты</a>
              <span aria-hidden="true"> · </span>
              <span>{scale.shortTitle}</span>
            </nav>
            <h1 className="blog-hero__title">{scale.title}</h1>
            <p className="blog-hero__sub">{scale.measures}</p>
            <ul className="tpage__facts">
              <li>{questionsLabel(questionCount(scale))}</li>
              <li>около {scale.minutes} мин</li>
              {scale.timeframe && <li>{scale.timeframe}</li>}
            </ul>
          </div>
        </section>

        <section className="container tpage__runner">
          <p className="tpage__privacy">
            Анонимно: ответы не покидают твой браузер — мы их не видим и не сохраняем.
          </p>
          <TestRunner scale={scale} questions={questionCount(scale)} />
          <p className="tpage__disclaimer">
            Это скрининг, а не диагноз. Он не заменяет консультацию специалиста.
          </p>
        </section>

        <section className="container tmethod" aria-labelledby="method-title">
          <h2 id="method-title" className="meeting-section__title">О методике</h2>

          <h3>Как считается результат</h3>
          {scale.methodology.scoring.map((p) => (
            <p key={p}>{p}</p>
          ))}

          {scale.methodology.notes.length > 0 && (
            <>
              <h3>Важные оговорки</h3>
              <ul>
                {scale.methodology.notes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}

          {scale.methodology.pitfalls.length > 0 && (
            <>
              <h3>Где ошибаются другие версии этого теста</h3>
              <ul>
                {scale.methodology.pitfalls.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Источники</h3>
          <ul className="tmethod__sources">
            {scale.sources.map((s) => (
              <li key={s.citation + s.covers}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.citation}</a>
                ) : (
                  s.citation
                )}
                <span className="tmethod__covers"> — {s.covers}</span>
              </li>
            ))}
          </ul>

          <FullMethod scale={scale} />
        </section>

        {related.length > 0 && (
          <section className="container tpage__related">
            <h2 className="meeting-section__title">Почитать по теме</h2>
            <ul>
              {related.map((p) => (
                <li key={p.slug}>
                  <a href={`${BLOG_URL}/${p.slug}`}>{p.cardTitle}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
