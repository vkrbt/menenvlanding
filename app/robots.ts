import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// output: 'export' требует явно объявить маршрут статическим
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Служебные страницы: шаблоны OG-картинок и одноразовые лендинги
      disallow: ['/og-image', '/og-book', '/instagram-carousel', '/muzhskaya_sreda_books'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
