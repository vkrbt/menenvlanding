import fs from 'node:fs'
import path from 'node:path'
import {
  parseFrontmatter,
  renderArticle,
  h1Title,
  authorsOf,
  type FaqPair,
  type Frontmatter,
} from './markdown'
import { BLOG_URL, SITE_URL, VLAD, ZHENYA } from './site'

const DIR = path.join(process.cwd(), 'content', 'blog')

export type Post = {
  slug: string
  fm: Frontmatter
  /** Внутренний HTML <main class="article"> целиком */
  html: string
  h1: string
  crumb: string
  faq: FaqPair[]
  title: string
  ogTitle: string
  description: string
  canonical: string
  datePublished: string
  dateModified: string
  authors: Array<typeof VLAD | typeof ZHENYA>
  /* поля карточки в листинге */
  category: string
  cardTitle: string
  cardDesc: string
  cardMeta: string
}

/** «≈ 11 минут» → «11 мин»: в карточке листинга формат короче, чем в шапке статьи */
function shortRead(readLine: string): string {
  const m = /(\d+)/.exec(readLine)
  return m ? `${m[1]} мин` : readLine
}

/** «Влад — гештальт-терапевт, …» → «Влад»; для двух авторов — «Влад и Женя» */
function shortAuthor(fm: Frontmatter): string {
  const names = authorsOf(fm).map((a) => a.name)
  return names.join(' и ')
}

function build(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8')
  const { fm, body } = parseFrontmatter(raw)
  const slug = fm.slug || path.basename(file, '.md')
  const rendered = renderArticle(fm, body)

  const ogTitle = fm.og_title || h1Title(fm)
  const datePublished = fm.date_published || ''

  return {
    slug,
    fm,
    html: rendered.html,
    h1: rendered.h1,
    crumb: rendered.crumb,
    faq: rendered.faq,
    title: fm.title || `${ogTitle} | Мужская среда`,
    ogTitle,
    description: fm.description || '',
    canonical: fm.canonical || `${SITE_URL}${BLOG_URL}/${slug}`,
    datePublished,
    dateModified: fm.date_modified || datePublished,
    authors: authorsOf(fm),
    category: fm.category || '',
    cardTitle: fm.card_title || ogTitle,
    cardDesc: fm.card_desc || fm.description || '',
    cardMeta:
      fm.card_meta ||
      [fm.author_short || shortAuthor(fm), fm.date_line || '', shortRead(fm.read_line || '')]
        .filter(Boolean)
        .join(' · '),
  }
}

let cache: Post[] | null = null

/** Опубликованные статьи, отсортированные как в текущем листинге: date_published DESC */
export function getAllPosts(): Post[] {
  if (cache) return cache

  cache = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .map(build)
    .filter((p) => (p.fm.status || 'released') === 'released')
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : a.datePublished > b.datePublished ? -1 : 0))

  return cache
}

export function getPostBySlug(slug: string): Post {
  const post = getAllPosts().find((p) => p.slug === slug)
  if (!post) throw new Error(`Статья не найдена: ${slug}`)
  return post
}

/* ============================================================
   Пагинация листинга
============================================================ */

/** Статей на странице листинга. 12 = 4 ряда по 3 на широком экране */
export const POSTS_PER_PAGE = 12

export function totalPages(): number {
  return Math.max(1, Math.ceil(getAllPosts().length / POSTS_PER_PAGE))
}

/** Срез статей для страницы n (нумерация с 1) */
export function postsForPage(page: number): Post[] {
  const start = (page - 1) * POSTS_PER_PAGE
  return getAllPosts().slice(start, start + POSTS_PER_PAGE)
}

/**
 * URL страницы листинга. Первая страница живёт на /blog без суффикса —
 * иначе появился бы дубль: /blog и /blog/page/1 с одинаковым содержимым.
 */
export function blogPageUrl(page: number): string {
  return page <= 1 ? BLOG_URL : `${BLOG_URL}/page/${page}`
}

/** Карточка для клиентской подгрузки: только то, что рисует BlogCard */
export type PostCard = {
  slug: string
  category: string
  cardTitle: string
  cardDesc: string
  cardMeta: string
}

export function allPostCards(): PostCard[] {
  return getAllPosts().map((p) => ({
    slug: p.slug,
    category: p.category,
    cardTitle: p.cardTitle,
    cardDesc: p.cardDesc,
    cardMeta: p.cardMeta,
  }))
}
