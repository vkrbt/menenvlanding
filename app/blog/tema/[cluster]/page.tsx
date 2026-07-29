import type { Metadata } from 'next'
import BlogCard from '@/components/BlogCard'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import {
  getClusterBySlug,
  nonEmptyClusters,
  postsOfCluster,
  topicCanonical,
  topicUrl,
} from '@/lib/clusters'
import { topicGraph } from '@/lib/jsonld'
import { BLOG_URL, OG_IMAGE } from '@/lib/site'

/** Рубрики без единой опубликованной статьи не собираются — это была бы пустая страница */
export function generateStaticParams() {
  return nonEmptyClusters().map((c) => ({ cluster: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cluster: string }>
}): Promise<Metadata> {
  const { cluster } = await params
  const c = getClusterBySlug(cluster)
  const n = postsOfCluster(c).length

  // Title и description собираются из целевого запроса кластера: так они
  // заведомо уникальны между рубриками и содержат ключ без ручной вычитки
  const title = `${c.name}: разборы и материалы | Мужская среда`
  const description = `${c.lede} ${n} ${plural(n, 'материал', 'материала', 'материалов')} от ведущих «Мужской среды» — гештальт-терапевта и психиатра.`

  return {
    title,
    description,
    alternates: { canonical: topicCanonical(c.slug) },
    openGraph: {
      title: `${c.name} — блог «Мужской среды»`,
      description: c.lede,
      type: 'website',
      url: topicCanonical(c.slug),
      images: [OG_IMAGE],
      locale: 'ru_RU',
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  }
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ cluster: string }>
}) {
  const { cluster } = await params
  const c = getClusterBySlug(cluster)
  const posts = postsOfCluster(c)
  const others = nonEmptyClusters().filter((x) => x.slug !== c.slug)

  return (
    <>
      <JsonLd data={topicGraph(c, posts)} />

      <SiteHeader />

      <main>
        <section className="blog-hero">
          <div className="container">
            <nav className="blog-crumbs" aria-label="Хлебные крошки">
              <a href={BLOG_URL}>Блог</a>
              <span aria-hidden="true"> · </span>
              <span>{c.name}</span>
            </nav>
            <h1 className="blog-hero__title">{c.name}</h1>
            <p className="blog-hero__sub">{c.lede}</p>
          </div>
        </section>

        <section className="container">
          <div className="blog-list">
            {posts.map((post) => (
              <BlogCard post={post} key={post.slug} />
            ))}
          </div>
        </section>

        <section className="container">
          <nav className="blog-topics" aria-label="Другие темы">
            <h2 className="blog-topics__title">Другие темы</h2>
            <div className="blog-topics__scroller">
              <ul className="blog-topics__list">
                {others.map((o) => (
                  <li key={o.slug}>
                    <a href={topicUrl(o.slug)}>{o.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
