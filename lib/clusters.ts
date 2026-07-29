import clustersJson from '@/content/clusters.json'
import { BLOG_URL, SITE_URL } from './site'
import { getAllPosts, type Post } from './posts'

/**
 * Тематические кластеры блога.
 *
 * Источник правды — `seo/_core_data.py`; `content/clusters.json` из него
 * генерируется командой `python3 seo/gen_clusters.py`. Руками JSON не править:
 * он перезапишется при следующей пересборке ядра.
 *
 * Рубрики живут на `/blog/tema/<slug>`, а не на `/blog/<slug>`: последнее
 * столкнулось бы с маршрутом статьи — App Router не допускает два разных
 * динамических сегмента на одном уровне.
 */

export type Cluster = {
  key: string
  slug: string
  name: string
  status: string
  stage: string
  /** Целевой запрос pillar-страницы кластера */
  pillarQuery: string
  /** Slug pillar-статьи; null, пока она не написана */
  pillarSlug: string | null
  /** Вводный текст рубрики. Содержит pillarQuery дословно */
  lede: string
  /** Slug'и статей кластера: pillar первым, дальше сателлиты */
  articles: string[]
}

export const CLUSTERS = clustersJson as Cluster[]

/** Сегмент рубрик. Вынесен в константу — используется в маршруте, sitemap и JSON-LD */
export const TOPIC_SEGMENT = 'tema'

export function topicUrl(slug: string): string {
  return `${BLOG_URL}/${TOPIC_SEGMENT}/${slug}`
}

export function topicCanonical(slug: string): string {
  return `${SITE_URL}${topicUrl(slug)}`
}

export function getClusterBySlug(slug: string): Cluster {
  const c = CLUSTERS.find((x) => x.slug === slug)
  if (!c) throw new Error(`Кластер не найден: ${slug}`)
  return c
}

/** Кластер, к которому принадлежит статья. null — если статья ещё не привязана */
export function clusterOfPost(slug: string): Cluster | null {
  return CLUSTERS.find((c) => c.articles.includes(slug)) ?? null
}

/**
 * Статьи кластера в порядке из ядра (pillar первым), но только реально
 * опубликованные: ядро может ссылаться на статью, которой ещё нет на диске.
 */
export function postsOfCluster(cluster: Cluster): Post[] {
  const byslug = new Map(getAllPosts().map((p) => [p.slug, p]))
  return cluster.articles.map((s) => byslug.get(s)).filter((p): p is Post => Boolean(p))
}

/** Рубрики с хотя бы одной опубликованной статьёй — для навигации и sitemap */
export function nonEmptyClusters(): Cluster[] {
  return CLUSTERS.filter((c) => postsOfCluster(c).length > 0)
}
