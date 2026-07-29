/**
 * Одноразовая миграция контента блога в content/blog/.
 *
 * Забирает из существующего HTML то, чего нет во фронтматтере:
 *   - category / card_title / card_desc / author_short — из карточек blog/index.html
 *   - og_description — из <meta property="og:description"> страницы статьи
 *     (исторически отличается от meta description)
 *
 * Падает, если хоть одна статья не сошлась: молча «почти мигрировать» нельзя.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'content', 'blog')

const SOURCES = [
  ...fs
    .readdirSync(path.join(ROOT, 'drafts', 'released'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(ROOT, 'drafts', 'released', f)),
  path.join(ROOT, 'drafts', 'writing', 'kak-perestat-sryvatsya-na-blizkih.md'),
]

const unescape = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

/* ---- карточки листинга ---- */

const indexHtml = fs.readFileSync(path.join(ROOT, 'blog', 'index.html'), 'utf8')
const CARD_RE =
  /<a href="\/blog\/([a-z0-9-]+)" class="blog-card">\s*<span class="blog-card__tag">([\s\S]*?)<\/span>\s*<span class="blog-card__title">([\s\S]*?)<\/span>\s*<span class="blog-card__desc">([\s\S]*?)<\/span>\s*<span class="blog-card__meta">([\s\S]*?)<\/span>\s*<\/a>/g

const cards = new Map()
for (const m of indexHtml.matchAll(CARD_RE)) {
  cards.set(m[1], {
    category: unescape(m[2].trim()),
    card_title: unescape(m[3].trim()),
    card_desc: unescape(m[4].trim()),
    meta: unescape(m[5].trim()),
  })
}

if (cards.size !== 40) {
  throw new Error(`Разобрано карточек: ${cards.size}, ожидалось 40 — регулярка не подошла`)
}

/* ---- перенос ---- */

fs.mkdirSync(OUT, { recursive: true })

const problems = []
let written = 0

for (const src of SOURCES) {
  const raw = fs.readFileSync(src, 'utf8')
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(raw)
  if (!m) {
    problems.push(`${path.basename(src)}: нет фронтматтера`)
    continue
  }

  const fm = new Map()
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    fm.set(line.slice(0, i).trim(), line.slice(i + 1).trim())
  }

  const slug = fm.get('slug') || path.basename(src, '.md')
  const card = cards.get(slug)
  if (!card) {
    problems.push(`${slug}: нет карточки в blog/index.html`)
    continue
  }

  // og:description берём из уже собранной страницы
  const pageHtml = fs.readFileSync(path.join(ROOT, 'blog', `${slug}.html`), 'utf8')
  const ogm = /<meta property="og:description" content="([^"]*)"/.exec(pageHtml)
  const ogDesc = ogm ? unescape(ogm[1]) : ''

  // author_short восстанавливаем из строки меты и проверяем обратной сборкой
  const parts = card.meta.split('·').map((s) => s.trim())
  const authorShort = parts[0] ?? ''
  const readShort = (fm.get('read_line') || '').match(/(\d+)/)
  const rebuilt = [authorShort, fm.get('date_line') || '', readShort ? `${readShort[1]} мин` : '']
    .filter(Boolean)
    .join(' · ')

  fm.delete('tag')
  fm.set('status', 'released')
  fm.set('category', card.category)
  fm.set('card_title', card.card_title)
  fm.set('card_desc', card.card_desc)
  fm.set('author_short', authorShort)
  if (ogDesc && ogDesc !== fm.get('description')) fm.set('og_description', ogDesc)
  // если формат меты не восстанавливается — сохраняем строку целиком
  if (rebuilt !== card.meta) fm.set('card_meta', card.meta)

  for (const [k, v] of fm) {
    if (v.includes('\n')) problems.push(`${slug}: многострочное значение ${k}`)
  }

  const head = [...fm].map(([k, v]) => `${k}: ${v}`).join('\n')
  fs.writeFileSync(path.join(OUT, `${slug}.md`), `---\n${head}\n---\n${raw.slice(m[0].length)}`, 'utf8')
  written++
}

if (problems.length) {
  console.error('Проблемы:\n  ' + problems.join('\n  '))
  process.exit(1)
}

console.log(`Перенесено статей: ${written}`)
