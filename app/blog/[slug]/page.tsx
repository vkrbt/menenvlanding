import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { articleGraph } from '@/lib/jsonld'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { OG_IMAGE } from '@/lib/site'

/** Все 40 статей известны на этапе билда — рантайм-фетчинга нет */
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.canonical },
    openGraph: {
      // og:description исторически отличается от meta description — храним отдельно
      title: post.ogTitle,
      description: post.fm.og_description || post.description,
      type: 'article',
      url: post.canonical,
      images: [OG_IMAGE],
      locale: 'ru_RU',
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  return (
    <>
      <JsonLd data={articleGraph(post)} />

      <SiteHeader />

      {/*
        Тело статьи вставляется одной строкой: так в <main> не появляется
        лишней обёртки, а разметка совпадает с текущей побайтово
      */}
      <main className="article" dangerouslySetInnerHTML={{ __html: post.html }} />

      <SiteFooter />
    </>
  )
}
