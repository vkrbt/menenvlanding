import { clusterOfPost, topicCanonical, type Cluster } from './clusters'
import { plainText } from './markdown'
import type { Post } from './posts'
import {
  BLOCK_SIZE,
  BLOG_URL,
  GROUP_MEETINGS,
  OG_IMAGE,
  ORG_ID,
  PRICE_BLOCK,
  PRICE_PROGRAM,
  PRICE_SINGLE,
  SITE_URL,
  TESTS_URL,
  VLAD,
  WEBSITE_ID,
  ZHENYA,
} from './site'
import { TESTS, type TestEntry } from './tests/registry'

/**
 * Сборка JSON-LD. Граф статей ссылается на #organization с главной,
 * поэтому идентификаторы узлов живут в lib/site.ts и нигде не дублируются.
 */

function breadcrumbsFor(post: Post) {
  const items: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE_URL}${BLOG_URL}` },
  ]

  const cluster = clusterOfPost(post.slug)
  if (cluster) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: cluster.name,
      item: topicCanonical(cluster.slug),
    })
  }

  items.push({ '@type': 'ListItem', position: items.length + 1, name: post.crumb })
  return items
}

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
      // Рубрика вклинивается третьим уровнем, если статья привязана к кластеру:
      // Главная → Блог → Тема → Статья. Пока привязки нет — цепочка как была
      itemListElement: breadcrumbsFor(post),
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
          'Тематическая онлайн-группа для русскоязычных мужчин 25+. Девять встреч в Zoom раз в две недели, ведут психолог и психиатр.',
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
        name: 'Мужская среда — тематическая мужская группа онлайн',
        serviceType: 'Мужская группа онлайн',
        provider: { '@id': ORG_ID },
        areaServed: 'Worldwide',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: SITE_URL,
          availableLanguage: 'ru',
        },
        offers: [
          {
            '@type': 'Offer',
            name: `Вся программа — ${GROUP_MEETINGS} встреч`,
            price: String(PRICE_PROGRAM),
            priceCurrency: 'EUR',
            url: `${SITE_URL}/#pricing`,
          },
          {
            '@type': 'Offer',
            name: `Блок из ${BLOCK_SIZE} встреч`,
            price: String(PRICE_BLOCK),
            priceCurrency: 'EUR',
            url: `${SITE_URL}/#pricing`,
          },
          { '@type': 'Offer', name: 'Одна встреча', price: String(PRICE_SINGLE), priceCurrency: 'EUR', url: `${SITE_URL}/#pricing` },
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

/* ============================================================
   Рубрика: CollectionPage + BreadcrumbList + ItemList
============================================================ */

export function topicGraph(cluster: Cluster, posts: Post[]) {
  const url = topicCanonical(cluster.slug)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: cluster.name,
        description: cluster.lede,
        inLanguage: 'ru',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE_URL}${BLOG_URL}` },
          { '@type': 'ListItem', position: 3, name: cluster.name },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: posts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: p.canonical,
          name: p.ogTitle,
        })),
      },
    ],
  }
}

/**
 * Самотесты. Намеренно WebPage, а не MedicalWebPage: это скрининг, не
 * медицинская услуга, а тематика и так YMYL.
 */
const testsCrumb = { '@type': 'ListItem', position: 2, name: 'Тесты', item: `${SITE_URL}${TESTS_URL}` }

export function testsHubGraph() {
  const url = `${SITE_URL}${TESTS_URL}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: 'Психологические тесты',
        inLanguage: 'ru',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: TESTS.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.scale.title,
            url: `${url}/${t.scale.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Тесты' },
        ],
      },
    ],
  }
}

export function testGraph(test: TestEntry) {
  const url = `${SITE_URL}${TESTS_URL}/${test.scale.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        name: test.scale.title,
        description: test.seoDescription,
        inLanguage: 'ru',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
        about: { '@type': 'Thing', name: test.topic },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
          testsCrumb,
          { '@type': 'ListItem', position: 3, name: test.scale.shortTitle },
        ],
      },
    ],
  }
}
