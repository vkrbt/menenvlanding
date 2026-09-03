/**
 * Константы сайта. Единственный источник истины для URL, ссылок и авторов —
 * чтобы они не расползались по компонентам и JSON-LD.
 */

export const SITE_URL = 'https://sreda.men'
export const FORMS_URL = 'https://forms.gle/tvTnJuyBoedpJZ989'
/** URL страницы «Как проходит встреча» — узел конверсии между статьёй и заявкой */
export const MEETING_URL = '/vstrecha'

/**
 * Яндекс.Метрика. Идентификатор счётчика и цели держим здесь, а не в компонентах:
 * на них ссылаются и счётчик, и обработчик кликов по CTA.
 * Цели создаются в интерфейсе Метрики вручную, тип — «JavaScript-событие».
 */
export const METRIKA_COUNTER_ID = 111109205

export const METRIKA_GOALS = {
  /** Любой клик по CTA-ссылке на заявку — итоговая цель */
  ctaAny: 'cta_click',
  /** Клик со страницы «Как проходит встреча» */
  ctaMeetingPage: 'cta_vstrecha',
  /** Клик из статьи блога */
  ctaArticle: 'cta_article',
  /** Клик с лендинга или любой другой страницы */
  ctaLanding: 'cta_landing',
  /**
   * Переход из статьи на страницу встречи. Отдельная цель нужна потому,
   * что CTA статей ведёт не в форму, а на /vstrecha (см. funnel.md §2):
   * без неё не видно, какие материалы двигают человека к заявке.
   */
  ctaArticleToMeeting: 'cta_k_vstreche',
} as const
export const YOUTUBE_URL = 'https://www.youtube.com/@men-env'
export const YOUTUBE_LABEL = 'youtube.com/@men-env'

/** URL раздела блога. Без хвостового слеша — см. trailingSlash в next.config.mjs */
export const BLOG_URL = '/blog'

// Имя с версией: соцсети кешируют превью по URL, и без смены адреса
// в шарах ещё долго висела бы старая картинка
export const OG_IMAGE = `${SITE_URL}/og-v2.png`
export const OG_IMAGE_BOOK = `${SITE_URL}/og-book.png`

/** Идентификаторы узлов графа schema.org — на них ссылаются страницы блога */
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`

/**
 * `jobTitle` уходит в schema.org и потому пишется полностью, с ролью в проекте.
 * `profession` — то же самое для вёрстки: одно слово, строчными, без хвоста
 * «ведущий „Мужской среды“», который на самом сайте только мешает
 */
export const VLAD = {
  name: 'Влад',
  jobTitle: 'Психолог, ведущий «Мужской среды»',
  profession: 'психолог',
  url: 'https://www.instagram.com/vkrbt/',
  handle: '@vkrbt',
} as const

export const ZHENYA = {
  name: 'Женя',
  jobTitle: 'Психиатр-нарколог, ведущий «Мужской среды»',
  profession: 'психиатр-нарколог',
  url: 'https://www.instagram.com/evgeny_yakubovskiy/',
  handle: '@evgeny_yakubovskiy',
} as const

export type NavLink = { href: string; label: string }

/**
 * Единая навигация для всех страниц: наполнение шапки везде одинаковое.
 * Отличаются только адреса якорей — на главной это ссылки внутри страницы,
 * на остальных нужен переход на главную с якорем.
 */
const NAV_ITEMS: Array<{ label: string; anchor?: string; href?: string }> = [
  { label: 'Что внутри', anchor: '#features' },
  { label: 'Формат', anchor: '#community-format' },
  { label: 'Отзывы', anchor: '#testimonials' },
  { label: 'Ведущие', anchor: '#hosts' },
  { label: 'Цена', anchor: '#pricing' },
  { label: 'Вопросы', anchor: '#faq' },
  { label: 'Блог', href: BLOG_URL },
]

export function navLinks(isHome: boolean): NavLink[] {
  return NAV_ITEMS.map(({ label, anchor, href }) => ({
    label,
    href: href ?? (isHome ? anchor! : `/${anchor}`),
  }))
}
