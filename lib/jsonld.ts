import { plainText } from './markdown'
import type { Post } from './posts'
import { BLOG_URL, OG_IMAGE, ORG_ID, SITE_URL, VLAD, WEBSITE_ID, ZHENYA } from './site'

/**
 * Сборка JSON-LD. Граф статей ссылается на #organization с главной,
 * поэтому идентификаторы узлов живут в lib/site.ts и нигде не дублируются.
 */

export function articleGraph(post: Post) {
  const url = post.canonical

  const authors = post.authors.map((a) => ({
    '@type': 'Person',
    name: a.name,
    jobTitle: a.jobTitle,
    url: a.url,
  }))

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: post.ogTitle,
      description: post.description ? post.description.slice(0, 300) : post.ogTitle,
      inLanguage: 'ru',
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: authors.length > 1 ? authors : authors[0],
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: url,
      image: OG_IMAGE,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE_URL}${BLOG_URL}` },
        { '@type': 'ListItem', position: 3, name: post.crumb },
      ],
    },
  ]

  if (post.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: post.faq.map((p) => ({
        '@type': 'Question',
        name: plainText(p.question),
        acceptedAnswer: { '@type': 'Answer', text: plainText(p.answer) },
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

/* ============================================================
   Главная: Organization + WebSite + Service + FAQPage
============================================================ */

export function homeGraph(faq: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'Мужская среда',
        url: SITE_URL,
        description:
          'Закрытое онлайн-сообщество для русскоязычных мужчин 25+. Встречи в Zoom раз в две недели.',
        sameAs: ['https://www.youtube.com/@men-env', VLAD.url, ZHENYA.url],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: 'Мужская среда',
        inLanguage: 'ru',
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/#service`,
        name: 'Мужская среда — онлайн-встречи мужского сообщества',
        serviceType: 'Мужское онлайн-сообщество',
        provider: { '@id': ORG_ID },
        areaServed: 'Worldwide',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: SITE_URL,
          availableLanguage: 'ru',
        },
        offers: [
          { '@type': 'Offer', name: 'За каждую встречу', price: '25', priceCurrency: 'EUR', url: `${SITE_URL}/#pricing` },
          { '@type': 'Offer', name: 'Минимальное членство — 2 встречи в месяц', price: '20', priceCurrency: 'EUR', url: `${SITE_URL}/#pricing` },
          { '@type': 'Offer', name: '3 месяца — 6 встреч', price: '18', priceCurrency: 'EUR', url: `${SITE_URL}/#pricing` },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: faq.map((p) => ({
          '@type': 'Question',
          name: p.q,
          acceptedAnswer: { '@type': 'Answer', text: p.a },
        })),
      },
    ],
  }
}

/* ============================================================
   Листинг блога
============================================================ */

export function blogListGraph() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}${BLOG_URL}`,
    name: 'Блог «Мужской среды»',
    inLanguage: 'ru',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
  }
}
