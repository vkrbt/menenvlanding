/**
 * Порт seo/md2html.py на TypeScript.
 *
 * Разметка статей — не CommonMark, а узкий свой диалект, поэтому готовый парсер
 * дал бы другой HTML на всех 40 страницах. Порт сделан построчно с оригинала,
 * корректность проверяется диффом против текущих blog/*.html.
 *
 * Единственное намеренное отличие от Python-версии — фикс бага с курсивом,
 * см. комментарий в inlineMd().
 */

import { BLOG_URL, FORMS_URL, VLAD, ZHENYA } from './site'

export type Frontmatter = Record<string, string>

export type FaqPair = { question: string; answer: string }

export type RenderedArticle = {
  /** Внутренний HTML <main class="article"> целиком — вставляется одной строкой */
  html: string
  h1: string
  crumb: string
  faq: FaqPair[]
}

/* ============================================================
   Экранирование
   Python: html.escape(s, quote=False) — только & < >
           html.escape(s)              — плюс " и '
============================================================ */

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

/* ============================================================
   Фронтматтер
   Плоский key: value, без вложенности — YAML-парсер не нужен
============================================================ */

export function parseFrontmatter(text: string): { fm: Frontmatter; body: string } {
  if (!text.startsWith('---')) return { fm: {}, body: text }

  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!m) return { fm: {}, body: text }

  const fm: Frontmatter = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }

  return { fm, body: text.slice(m[0].length).replace(/^\n+/, '') }
}

/* ============================================================
   Инлайновая разметка
============================================================ */

const RE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g
const RE_BOLD = /\*\*([^*]+)\*\*/g

// Точный порт регулярки курсива из Python. Внимание: в исходнике r"(?<![\\w<])"
// внутри raw-строки «\\» — это литеральный обратный слэш, то есть класс перечисляет
// символы «\», «w», «<», а вовсе не \w. В JS-литерале [\\w<] означает ровно то же.
const RE_ITALIC = /(?<![\\w<])_([^_]+)_(?![\\w>])/g

// NUL как разделитель плейсхолдера: в текстах статей он встретиться не может,
// а на регулярку курсива не влияет
const PH = '\u0000'
const RE_PH = /\u0000(\d+)\u0000/g

export function inlineMd(s: string): string {
  let out = escapeText(s)

  // Ссылки прячем в плейсхолдеры до прохода курсивом.
  // В Python курсив шёл последним по уже собранному HTML, и подчёркивания двух
  // соседних target="_blank" склеивались в <em> — отсюда target="<em>blank"
  // в 38 статьях. Плейсхолдеры убирают саму возможность такого склеивания.
  const links: string[] = []
  out = out.replace(RE_LINK, (_full, label: string, href: string) => {
    const rendered = label.replace(RE_BOLD, '<strong>$1</strong>')
    links.push(
      href.startsWith('http')
        ? `<a href="${href}" target="_blank" rel="noopener">${rendered}</a>`
        : `<a href="${href}">${rendered}</a>`,
    )
    return `${PH}${links.length - 1}${PH}`
  })

  out = out.replace(RE_BOLD, '<strong>$1</strong>')
  out = out.replace(RE_ITALIC, '<em>$1</em>')

  return out.replace(RE_PH, (_full, i: string) => links[Number(i)])
}

/* ============================================================
   Проза: ## / ### / - / абзац
============================================================ */

export function proseToHtml(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line) {
      i += 1
      continue
    }

    if (line.startsWith('## ')) {
      out.push(`    <h2>${inlineMd(line.slice(3))}</h2>`)
    } else if (line.startsWith('### ')) {
      out.push(`    <h3>${inlineMd(line.slice(4))}</h3>`)
    } else if (line.startsWith('- ')) {
      // Пустая строка разрывает список — так же, как в Python-версии.
      // Отсюда в некоторых статьях идут несколько <ul> по одному <li>.
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(`      <li>${inlineMd(lines[i].trim().slice(2))}</li>`)
        i += 1
      }
      out.push(`    <ul>\n${items.join('\n')}\n    </ul>`)
      continue
    } else {
      out.push(`    <p>${inlineMd(line)}</p>`)
    }

    i += 1
  }

  return out.join('\n\n')
}

/* ============================================================
   Разбиение тела на блоки по маркерам
============================================================ */

type BodyParts = { prose: string; cta: string; faq: string; note: string; related: string }

function cut(text: string, marker: string): [string, string] {
  const i = text.indexOf(marker)
  if (i === -1) return [text, '']
  return [text.slice(0, i).replace(/\s+$/, ''), text.slice(i + marker.length).replace(/^\n+/, '')]
}

export function splitBody(body: string): BodyParts {
  let rest = body
  let prose: string
  let cta: string
  let faq: string
  let note: string

  ;[prose, rest] = cut(rest, '<!-- CTA -->')
  ;[cta, rest] = cut(rest, '## Частые вопросы')
  ;[faq, rest] = cut(rest, '<!-- NOTE -->')
  ;[note, rest] = cut(rest, '## Читать дальше')

  return { prose, cta, faq, note, related: rest.trim() }
}

/* ============================================================
   Блоки: CTA / FAQ / NOTE / RELATED
============================================================ */

function parseCta(block: string): string {
  if (!block.trim()) return ''

  let h3 = ''
  let p = ''
  let hint = ''

  for (const raw of block.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('**') && line.endsWith('**')) {
      h3 = line.replace(/^\*+|\*+$/g, '')
    } else if (line.startsWith('_') && line.endsWith('_')) {
      hint = line.replace(/^_+|_+$/g, '')
    } else {
      p = line
    }
  }

  return `    <div class="article__cta">
      <h3>${inlineMd(h3)}</h3>
      <p>${inlineMd(p)}</p>
      <a href="${FORMS_URL}" class="btn btn--primary">Оставить заявку</a>
      <p class="article__cta-hint">${inlineMd(hint)}</p>
    </div>`
}

function parseFaq(block: string): { html: string; pairs: FaqPair[] } {
  if (!block.trim()) return { html: '', pairs: [] }

  const pairs: FaqPair[] = []
  const parts: string[] = ['    <h2 id="faq">Частые вопросы</h2>', '', '    <div class="article__faq">']

  let currentQ: string | null = null
  let buf: string[] = []

  const flush = () => {
    if (currentQ && buf.length) {
      const answer = buf.join(' ').trim()
      pairs.push({ question: currentQ, answer })
      parts.push(`      <h3>${inlineMd(currentQ)}</h3>`)
      parts.push(`      <p>${inlineMd(answer)}</p>`)
    }
    buf = []
  }

  for (const raw of block.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('### ')) {
      flush()
      currentQ = line.slice(4)
    } else if (currentQ) {
      buf.push(line)
    }
  }
  flush()

  parts.push('    </div>')
  return { html: parts.join('\n'), pairs }
}

function parseNote(block: string): string {
  if (!block.trim()) return ''

  const paras: string[] = []
  for (const raw of block.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('> ')) {
      paras.push(`      <p>${inlineMd(line.slice(2))}</p>`)
    } else if (line.startsWith('>')) {
      paras.push(`      <p>${inlineMd(line.slice(1).trim())}</p>`)
    }
  }

  if (!paras.length) return ''
  return `    <div class="article__note">\n${paras.join('\n')}\n    </div>`
}

function parseRelated(block: string): string {
  if (!block.trim()) return ''

  const items: string[] = []
  for (const raw of block.split('\n')) {
    const m = /^- \[([^\]]+)\]\(([^)]+)\)/.exec(raw.trim())
    if (m) items.push(`        <li><a href="${m[2]}">${inlineMd(m[1])}</a></li>`)
  }

  if (!items.length) return ''
  return `    <div class="article__related">
      <h2>Читать дальше</h2>
      <ul>
${items.join('\n')}
      </ul>
    </div>`
}

/* ============================================================
   Заголовки и авторы
============================================================ */

export function h1Title(fm: Frontmatter): string {
  const title = fm.title ?? fm.og_title ?? ''
  if (title.includes(' | ')) return title.split(' | ')[0]
  return title || (fm.og_title ?? '')
}

export function breadcrumbLabel(h1: string): string {
  if (h1.length <= 48) return h1
  if (h1.includes(':')) return h1.split(':')[0]
  return `${h1.slice(0, 45)}…`
}

/** Markdown → простой текст: в JSON-LD разметка не нужна, её видит поисковик */
export function plainText(s: string): string {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
}

export function authorsOf(fm: Frontmatter): Array<typeof VLAD | typeof ZHENYA> {
  const line = fm.author_line ?? fm.tag ?? ''
  const hasZ = line.includes('Женя')
  const hasV = line.includes('Влад')
  if (hasZ && hasV) return [VLAD, ZHENYA]
  if (hasZ) return [ZHENYA]
  return [VLAD]
}

/* ============================================================
   Сборка внутреннего HTML <main class="article">
============================================================ */

export function renderArticle(fm: Frontmatter, body: string): RenderedArticle {
  const h1 = h1Title(fm)
  const crumb = breadcrumbLabel(h1)

  const parts = splitBody(body)
  const faqBlock = parseFaq(parts.faq)

  const chunks = [
    proseToHtml(parts.prose),
    parseCta(parts.cta),
    faqBlock.html,
    parseNote(parts.note),
    parseRelated(parts.related),
  ].filter(Boolean)

  const html = `
    <nav class="article__breadcrumbs" aria-label="Хлебные крошки">
      <a href="/">Главная</a> · <a href="${BLOG_URL}">Блог</a> · ${escapeAttr(crumb)}
    </nav>

    <h1 class="article__title">${escapeAttr(h1)}</h1>

    <div class="article__meta">
      <span>${escapeAttr(fm.author_line ?? fm.tag ?? '')}</span>
      <span>${escapeAttr(fm.date_line ?? '')}</span>
      <span>${escapeAttr(fm.read_line ?? '')}</span>
    </div>

${chunks.join('\n\n')}
  `

  return { html, h1, crumb, faq: faqBlock.pairs }
}
