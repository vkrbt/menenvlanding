/**
 * Проверка паритета старого статического сайта и нового экспорта Next.
 *
 * Побайтовый дифф не годится: React не сохраняет форматирование исходника
 * и сериализует SVG как <rect></rect> вместо <rect/>. Поэтому сравниваем то,
 * что реально видит пользователь:
 *   1) нормализованное DOM-дерево после отработки клиентских скриптов
 *   2) вычисленные стили и геометрию каждого элемента
 *
 * Старый сайт удалён из репозитория, поэтому эталон берётся из worktree
 * на последнем дореформенном коммите:
 *
 *   git worktree add /tmp/sreda-old c596a89
 *   node scripts/verify-parity.mjs --old=/tmp/sreda-old
 *
 * Запуск: node scripts/verify-parity.mjs --old=<dir> [--only=/blog/slug] [--shots]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'

const ROOT = process.cwd()
const NEW_DIR = path.join(ROOT, 'out')

const args = process.argv.slice(2)
const only = args.find((a) => a.startsWith('--only='))?.slice(7)
const wantShots = args.includes('--shots')
const OLD_DIR = args.find((a) => a.startsWith('--old='))?.slice(6)

if (!OLD_DIR || !fs.existsSync(path.join(OLD_DIR, 'index.html'))) {
  console.error(
    'Не задан каталог со старым сайтом.\n' +
      '  git worktree add /tmp/sreda-old c596a89\n' +
      '  node scripts/verify-parity.mjs --old=/tmp/sreda-old',
  )
  process.exit(2)
}

/* ============================================================
   Статический сервер с поведением Vercel cleanUrls
============================================================ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
}

function serve(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0])
      const candidates = [
        path.join(dir, url),
        path.join(dir, `${url}.html`),
        path.join(dir, url, 'index.html'),
      ]
      for (const p of candidates) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          res.writeHead(200, { 'content-type': MIME[path.extname(p)] ?? 'application/octet-stream' })
          return res.end(fs.readFileSync(p))
        }
      }
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    })
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

/* ============================================================
   Снимок страницы: DOM + стили
============================================================ */

// Узлы, которых в старой версии не было и быть не могло
const IGNORE_SELECTORS = [
  'script',
  'link',
  'style',
  'meta',
  'title',
  'next-route-announcer',
  '[hidden]',
  // <noscript>-пиксель Метрики: при включённом JS его содержимое не парсится,
  // но сам элемент присутствует в дереве
  'noscript',

  // Шапка и мобильное меню сравнению не подлежат: по отдельному требованию
  // они приведены к единому наполнению на всех страницах (раньше было четыре
  // разных варианта), а CTA стал акцентным. Это осознанное изменение дизайна,
  // а не регрессия — проверяется глазами, см. чек-лист Этапа 5
  'header.nav',
  '.mnav',

  // Переключатель темы переехал из шапки в подвал — тоже по отдельной просьбе
  '.theme-toggle',
]

/**
 * Утверждённые отличия новой версии. Применяются к снимку СТАРОЙ страницы,
 * чтобы она сравнивалась с новой на равных. Всё, что не описано здесь,
 * считается регрессией.
 */
const APPROVED = [
  // Решение №1: /blog/ со слешем уезжает на /blog
  (s) => s.replaceAll('href="/blog/"', 'href="/blog"'),
  // Решение №2: баг курсива в генераторе ломал target и href внешних ссылок
  (s) => s.replaceAll('<em>', '_').replaceAll('</em>', '_'),
  // Год в подвале приходит с сервера, а не дорисовывается скриптом
  (s) => s.replace(/^(\d+\|span\|\|id="footer-year"\|)\|/, `$1${new Date().getFullYear()}|`),
  // Инлайновый onclick карусели заменён обработчиком React
  (s) => s.replace(/ ?onclick="ytCarouselScroll\(-?1\)"/, ''),
]

const approve = (row) => APPROVED.reduce((acc, fn) => fn(acc), row)

/**
 * Недетерминированное содержимое — приводится к общему виду с ОБЕИХ сторон.
 * Иначе живой таймер обратного отсчёта валит проверку сам по себе.
 */
const NORMALIZE = [
  // относительные пути ассетов стали абсолютными: URL резолвится в тот же файл
  (s) => s.replace(/src="(?!\/|https?:|data:)/g, 'src="/'),
  // цифры и ширина ячеек обратного отсчёта зависят от момента снимка
  (s) => (/id="cd-(days|hours|mins|secs)"/.test(s) ? s.replace(/\|\d+\|/, '|NN|').replace(/box=\d+x/, 'box=NNx') : s),
  // высота <body> = высота всей страницы, а шапка намеренно переделана.
  // Габариты остальных узлов сравниваются как обычно
  (s) => (s.startsWith('0|body|') ? s.replace(/box=\d+x\d+/, 'box=NN') : s),
  // подвал вырос: в нём появился переключатель темы, на узких экранах
  // он переносится на новую строку. Классы в снимке отсортированы и склеены
  // точкой, поэтому проверяем именно поле классов
  (s) => {
    const cls = s.split('|')[2] ?? ''
    return /(^|\.)footer(__inner)?($|\.)/.test(cls) ? s.replace(/box=(\d+)x\d+/, 'box=$1xNN') : s
  },
]

const normalize = (row) => NORMALIZE.reduce((acc, fn) => fn(acc), row)

const STYLE_PROPS = [
  'display', 'position', 'flexDirection', 'justifyContent', 'alignItems', 'gap',
  'gridTemplateColumns', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
  'letterSpacing', 'textAlign', 'textTransform', 'color', 'backgroundColor',
  'borderTopWidth', 'borderTopColor', 'borderRadius', 'opacity', 'visibility',
  'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
]

async function snapshot(page, url, width, theme) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: theme },
    // Без этого замер ловит середину scroll-in перехода и «плавает»:
    // правила .animate-in объявлены внутри @media (prefers-reduced-motion: no-preference)
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ])
  // Аналитика на вёрстку не влияет, но её внешние запросы делают
  // ожидание сети ненадёжным — режем их. Шрифты, наоборот, нужны: без них
  // сравнивались бы метрики запасной гарнитуры
  if (!page.listenerCount('request')) {
    await page.setRequestInterception(true)
    page.on('request', (r) =>
      /mc\.yandex\.ru|googletagmanager\.com|google-analytics\.com/.test(r.url())
        ? r.abort()
        : r.continue(),
    )
  }

  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  // даём отработать клиентским эффектам (тема, анимации, countdown)
  await new Promise((r) => setTimeout(r, 400))

  return page.evaluate(
    (ignoreSel, styleProps) => {
      const skip = new Set()
      for (const sel of ignoreSel) {
        for (const el of document.querySelectorAll(sel)) skip.add(el)
      }

      const rows = []
      const walk = (el, depth) => {
        if (skip.has(el)) return

        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        const styles = styleProps.map((p) => `${p}=${cs[p]}`).join(';')

        // текст только собственный, без потомков
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .join(' ')

        const attrs = Array.from(el.attributes)
          .filter((a) => !['style', 'class'].includes(a.name))
          .filter((a) => !a.name.startsWith('data-react'))
          .map((a) => `${a.name}="${a.value}"`)
          .sort()
          .join(' ')

        rows.push(
          [
            depth,
            el.tagName.toLowerCase(),
            Array.from(el.classList).sort().join('.'),
            attrs,
            own,
            styles,
            `box=${Math.round(r.width)}x${Math.round(r.height)}`,
          ].join('|'),
        )

        for (const child of el.children) walk(child, depth + 1)
      }

      walk(document.body, 0)
      return rows
    },
    IGNORE_SELECTORS,
    STYLE_PROPS,
  )
}

/* ============================================================
   Прогон
============================================================ */

function urlsToCheck() {
  if (only) return [only]
  const list = ['/']
  if (fs.existsSync(path.join(NEW_DIR, 'book.html'))) list.push('/book')
  if (fs.existsSync(path.join(NEW_DIR, 'blog.html'))) list.push('/blog')
  for (const f of fs.readdirSync(path.join(NEW_DIR, 'blog')).sort()) {
    if (f.endsWith('.html')) list.push(`/blog/${f.replace(/\.html$/, '')}`)
  }
  return list
}

const old = await serve(OLD_DIR)
const fresh = await serve(NEW_DIR)
const browser = await puppeteer.launch({ headless: true })

const shotsDir = path.join(ROOT, '.parity-shots')
if (wantShots) fs.mkdirSync(shotsDir, { recursive: true })

let checked = 0
let failed = 0
const report = []

for (const url of urlsToCheck()) {
  // старый сайт: /blog/ отдавался со слешем, новый — без
  const oldUrl = url === '/blog' ? '/blog/' : url
  if (!fs.existsSync(path.join(NEW_DIR, url === '/' ? 'index.html' : `${url.slice(1)}.html`))) {
    report.push(`SKIP  ${url} — ещё не собрана`)
    continue
  }

  for (const width of [360, 768, 1440]) {
    for (const theme of ['light', 'dark']) {
      const pOld = await browser.newPage()
      const pNew = await browser.newPage()
      const a = await snapshot(pOld, `http://127.0.0.1:${old.port}${oldUrl}`, width, theme)
      const b = await snapshot(pNew, `http://127.0.0.1:${fresh.port}${url}`, width, theme)

      if (wantShots) {
        const name = `${url.replace(/\//g, '_') || '_root'}-${width}-${theme}`
        await pOld.screenshot({ path: path.join(shotsDir, `${name}.old.png`), fullPage: true })
        await pNew.screenshot({ path: path.join(shotsDir, `${name}.new.png`), fullPage: true })
      }

      await pOld.close()
      await pNew.close()
      checked++

      if (a.length !== b.length) {
        failed++
        report.push(`FAIL  ${url} ${width}px ${theme}: узлов ${a.length} → ${b.length}`)
        continue
      }

      const diffs = []
      for (let i = 0; i < a.length; i++) {
        if (normalize(approve(a[i])) !== normalize(b[i])) {
          diffs.push(`      было : ${a[i]}\n      стало: ${b[i]}`)
        }
        if (diffs.length >= 3) break
      }
      if (diffs.length) {
        failed++
        report.push(`FAIL  ${url} ${width}px ${theme}:\n${diffs.join('\n')}`)
      }
    }
  }
  report.push(`OK    ${url}`)
}

await browser.close()
old.server.close()
fresh.server.close()

console.log(report.join('\n'))
console.log(`\nпроверок: ${checked}, провалов: ${failed}`)
if (wantShots) console.log(`скриншоты: ${shotsDir}`)
process.exit(failed ? 1 : 0)
