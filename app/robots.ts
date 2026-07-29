import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// output: 'export' требует явно объявить маршрут статическим
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Служебные страницы: шаблоны OG-картинок и одноразовые лендинги
        '/og-image', '/og-book', '/instagram-carousel', '/muzhskaya_sreda_books',
        // Пагинация блога: страницы-списки без собственного содержания.
        // Все статьи и так есть в карте сайта и в рубриках, так что обход
        // /blog/page/N только тратит краулинговый бюджет.
        '/blog/page/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
