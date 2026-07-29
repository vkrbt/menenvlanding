import type { Metadata } from 'next'
import BlogCard from '@/components/BlogCard'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { blogListGraph } from '@/lib/jsonld'
import { getAllPosts } from '@/lib/posts'
import { BLOG_URL, OG_IMAGE, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Блог «Мужской среды» — о мужском ментальном здоровье без клише',
  description:
    'Честные разборы о том, о чём мужчины обычно молчат: одиночество, выгорание, эмиграция, отношения. Пишут ведущие «Мужской среды» — терапевт и психиатр.',
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
  const posts = getAllPosts()

  return (
    <>
      <JsonLd data={blogListGraph()} />

      <SiteHeader />

      <main>
        <section className="blog-hero">
          <div className="container">
            <h1 className="blog-hero__title">Блог</h1>
            <p className="blog-hero__sub">
              О том, о чём мужчины предпочитают молчать: одиночество, выгорание, эмиграция, отношения. Пишут ведущие «Мужской среды» — гештальт-терапевт и психиатр. Без клише и морализаторства.
            </p>
          </div>
        </section>

        <section className="container">
          <div className="blog-list">
            {posts.map((post) => (
              <BlogCard post={post} key={post.slug} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
