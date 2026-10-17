/**
 * Константы сайта. Единственный источник истины для URL, ссылок и авторов —
 * чтобы они не расползались по компонентам и JSON-LD.
 */

export const SITE_URL = 'https://sreda.men'
export const FORMS_URL = 'https://forms.gle/tvTnJuyBoedpJZ989'
/**
 * Старый адрес страницы «Как проходит встреча». Страницу убрали: формат, программа
 * и цена теперь на главной. Ссылки из статей переписываются на главную при рендере
 * (lib/markdown.ts), прямые заходы ловит редирект в vercel.json
 */
export const LEGACY_MEETING_PATH = '/vstrecha'

/**
 * Старт тематической группы — время первой встречи в UTC.
 * Пока null, идёт набор: страница пишет «собираем группу» и не показывает дат.
 * Как только впишешь дату, она появится в первом экране, оффере и у каждой встречи программы.
 * Встреча в 19:00 по Москве — это всегда 16:00 UTC: Москва часы не переводит.
 */
export const GROUP_START: string | null = null

/** Ориентир старта, пока точной даты нет. В предложном падеже: «Старт в ноябре 2026» */
export const GROUP_START_APPROX = 'в ноябре 2026'

/** Сколько мест в группе */
export const GROUP_SEATS = 12

/** Минимальная цена встречи — для оффера; полные тарифы в components/home/Pricing.tsx */
export const PRICE_FROM = '€36'

/** Сколько встреч в группе: восемь тем и завершение */
export const GROUP_MEETINGS = 9

/**
 * Время встреч. Привязано к Москве: 19:00 MSK круглый год.
 * CET верно для зимы — с последнего воскресенья марта Варшава живёт по CEST,
 * и та же встреча там в 18:00. Поток стартует в ноябре, поэтому пишем зимнее время
 */
export const MEETING_TIME = '17:00 CET / 19:00 MSK'

/**
 * Яндекс.Метрика. Идентификатор счётчика и цели держим здесь, а не в компонентах:
 * на них ссылаются и счётчик, и обработчик кликов по CTA.
 * Цели создаются в интерфейсе Метрики вручную, тип — «JavaScript-событие».
 */
export const METRIKA_COUNTER_ID = 111109205

export const METRIKA_GOALS = {
  /** Любой клик по CTA-ссылке на заявку — итоговая цель */
  ctaAny: 'cta_click',
  /** Клик из статьи блога */
  ctaArticle: 'cta_article',
  /** Клик с лендинга или любой другой страницы */
  ctaLanding: 'cta_landing',
  /**
   * Переход из статьи на главную по кнопке CTA. Имя цели осталось от страницы
   * /vstrecha, чтобы не рвать историю в Метрике. CTA статей ведёт не в форму,
   * а на главную (см. funnel.md §2): без цели не видно, какие материалы двигают к заявке.
   */
  ctaArticleToMeeting: 'cta_k_vstreche',
  /**
   * Самотесты: начало и завершение. В параметрах — только slug теста.
   * Ответы, баллы и категории в Метрику не уходят никогда (анонимность).
   */
  testStart: 'test_start',
  testComplete: 'test_complete',
} as const
export const YOUTUBE_URL = 'https://www.youtube.com/@men-env'
export const YOUTUBE_LABEL = 'youtube.com/@men-env'

/** URL раздела блога. Без хвостового слеша — см. trailingSlash в next.config.mjs */
export const BLOG_URL = '/blog'

/** Хаб самотестов */
export const TESTS_URL = '/tests'

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
  { label: 'Программа', anchor: '#program' },
  { label: 'Формат', anchor: '#community-format' },
  { label: 'Отзывы', anchor: '#testimonials' },
  { label: 'Ведущие', anchor: '#hosts' },
  { label: 'Цена', anchor: '#pricing' },
  { label: 'Вопросы', anchor: '#faq' },
  { label: 'Блог', href: BLOG_URL },
  { label: 'Тесты', href: TESTS_URL },
]

export function navLinks(isHome: boolean): NavLink[] {
  return NAV_ITEMS.map(({ label, anchor, href }) => ({
    label,
    href: href ?? (isHome ? anchor! : `/${anchor}`),
  }))
}
