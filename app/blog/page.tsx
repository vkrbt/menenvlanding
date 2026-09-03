import type { Metadata } from 'next'
import BlogList from '@/components/BlogList'
import Pagination from '@/components/Pagination'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { nonEmptyClusters, topicUrl } from '@/lib/clusters'
import { blogListGraph } from '@/lib/jsonld'
import { postsForPage, totalPages, allPostCards } from '@/lib/posts'
import { BLOG_URL, OG_IMAGE, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Блог «Мужской среды» — о мужском ментальном здоровье без клише',
  description:
    'Честные разборы о том, о чём мужчины обычно молчат: одиночество, выгорание, эмиграция, отношения. Пишут ведущие «Мужской среды» — психолог и психиатр.',
  alternates: { canonical: `${SITE_URL}${BLOG_URL}` },
  openGraph: {
    title: 'Блог «Мужской среды»',
    description:
      'О мужском ментальном здоровье без клише и мотивационных плакатов — от людей, которые сами это проходили.',
    type: 'website',
    url: `${SITE_URL}${BLOG_URL}`,
    images: [OG_IMAGE],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

export default function BlogIndexPage() {
  const total = totalPages()
  const cards = allPostCards().slice(0, postsForPage(1).length)
  const topics = nonEmptyClusters()

  return (
    <>
      <JsonLd data={blogListGraph()} />

      <SiteHeader />

      <main>
        <section className="blog-hero">
          <div className="container">
            <h1 className="blog-hero__title">Блог</h1>
            <p className="blog-hero__sub">
              О том, о чём мужчины предпочитают молчать: одиночество, выгорание, эмиграция, отношения. Пишут ведущие «Мужской среды» — психолог и психиатр. Без клише и морализаторства.
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
          <BlogList initial={cards} page={1} totalPages={total} />
          <Pagination page={1} totalPages={total} />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
