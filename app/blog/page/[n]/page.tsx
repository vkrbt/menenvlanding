import type { Metadata } from 'next'
import BlogList from '@/components/BlogList'
import JsonLd from '@/components/JsonLd'
import Pagination from '@/components/Pagination'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { nonEmptyClusters, topicUrl } from '@/lib/clusters'
import { blogListGraph } from '@/lib/jsonld'
import { allPostCards, blogPageUrl, postsForPage, totalPages, POSTS_PER_PAGE } from '@/lib/posts'
import { OG_IMAGE, SITE_URL } from '@/lib/site'

/** Страницы со второй и далее. Первая живёт на /blog, дубля не возникает */
export function generateStaticParams() {
  return Array.from({ length: Math.max(0, totalPages() - 1) }, (_, i) => ({ n: String(i + 2) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>
}): Promise<Metadata> {
  const { n } = await params
  const page = Number(n)
  const total = totalPages()
  const url = `${SITE_URL}${blogPageUrl(page)}`

  return {
    title: `Блог «Мужской среды» — страница ${page} из ${total}`,
    description: `Материалы блога «Мужской среды», страница ${page}: одиночество, выгорание, эмиграция, отношения, отцовство. Пишут психолог и психиатр.`,
    alternates: { canonical: url },
    // Пагинация не должна конкурировать со статьями в выдаче: страницы со второй
    // отдаются на индексацию, но продвигаются не они, а материалы, на которые ведут
    openGraph: {
      title: `Блог «Мужской среды» — страница ${page}`,
      description: 'О мужском ментальном здоровье без клише и мотивационных плакатов.',
      type: 'website',
      url,
      images: [OG_IMAGE],
      locale: 'ru_RU',
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  }
}

export default async function BlogPagedPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params
  const page = Number(n)
  const total = totalPages()

  const start = (page - 1) * POSTS_PER_PAGE
  const cards = allPostCards().slice(start, start + postsForPage(page).length)
  const topics = nonEmptyClusters()

  return (
    <>
      <JsonLd data={blogListGraph()} />

      <SiteHeader />

      <main>
        <section className="blog-hero">
          <div className="container">
            <nav className="blog-crumbs" aria-label="Хлебные крошки">
              <a href="/blog">Блог</a>
              <span aria-hidden="true"> · </span>
              <span>Страница {page}</span>
            </nav>
            <h1 className="blog-hero__title">Блог — страница {page}</h1>
            <p className="blog-hero__sub">
              О том, о чём мужчины предпочитают молчать: одиночество, выгорание, эмиграция,
              отношения. Пишут ведущие «Мужской среды» — психолог и психиатр.
            </p>
          </div>
        </section>

        <section className="container">
          <nav className="blog-topics" aria-label="Темы блога">
            <h2 className="blog-topics__title">Темы</h2>
            <div className="blog-topics__scroller">
              <ul className="blog-topics__list">
                {topics.map((c) => (
                  <li key={c.slug}>
                    <a href={topicUrl(c.slug)}>{c.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </section>

        <section className="container">
          <BlogList initial={cards} page={page} totalPages={total} />
          <Pagination page={page} totalPages={total} />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
