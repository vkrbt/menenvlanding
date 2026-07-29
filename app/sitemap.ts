import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { BLOG_URL, SITE_URL } from '@/lib/site'

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
    { url: `${SITE_URL}/book`, lastModified: newest, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}${BLOG_URL}`, lastModified: newest, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}${BLOG_URL}/${p.slug}`,
      lastModified: p.dateModified || p.datePublished,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
