import type { MetadataRoute } from 'next'
import { nonEmptyClusters, postsOfCluster, topicCanonical } from '@/lib/clusters'
import { blogPageUrl, getAllPosts, totalPages } from '@/lib/posts'
import { BLOG_URL, MEETING_URL, SITE_URL } from '@/lib/site'

// output: 'export' требует явно объявить маршрут статическим
export const dynamic = 'force-static'

/**
 * Порт seo/publish.py:gen_sitemap. Даты берутся из фронтматтера,
 * поэтому карта сайта не может разъехаться с контентом.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const newest = posts[0]?.dateModified ?? posts[0]?.datePublished ?? ''

  return [
    // Без хвостового слеша — так же, как canonical на страницах (trailingSlash: false)
    { url: SITE_URL, lastModified: newest, changeFrequency: 'weekly', priority: 1.0 },
    // Узел конверсии: приоритет сразу за главной
    { url: `${SITE_URL}${MEETING_URL}`, lastModified: newest, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/book`, lastModified: newest, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}${BLOG_URL}`, lastModified: newest, changeFrequency: 'weekly', priority: 0.8 },
    // Страницы пагинации: приоритет ниже листинга — это маршрут обхода, а не цель
    ...Array.from({ length: Math.max(0, totalPages() - 1) }, (_, i) => ({
      url: `${SITE_URL}${blogPageUrl(i + 2)}`,
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
    // Рубрики: приоритет выше статей — это хабы кластеров, они собирают вес
    ...nonEmptyClusters().map((c) => {
      const inCluster = postsOfCluster(c)
      const freshest = inCluster
        .map((p) => p.dateModified || p.datePublished)
        .sort()
        .at(-1)
      return {
        url: topicCanonical(c.slug),
        lastModified: freshest || newest,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }
    }),
    ...posts.map((p) => ({
      url: `${SITE_URL}${BLOG_URL}/${p.slug}`,
      lastModified: p.dateModified || p.datePublished,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
