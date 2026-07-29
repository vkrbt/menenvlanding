/**
 * Замер Lighthouse на мобильном профиле для старой и новой версии сайта.
 *
 * Обе версии поднимаются локально, поэтому цифры сравнимы между собой,
 * но абсолютные значения оптимистичнее продакшена: нет сетевой задержки
 * до Vercel. Смотреть надо на разницу, а не на абсолют.
 *
 * Запуск: node scripts/lighthouse.mjs [/url ...]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'

const ROOT = process.cwd()

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

function serve(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0])
      for (const p of [path.join(dir, url), path.join(dir, `${url}.html`), path.join(dir, url, 'index.html')]) {
        if (!fs.existsSync(p) || !fs.statSync(p).isFile()) continue

        const type = MIME[path.extname(p)] ?? 'application/octet-stream'
        let body = fs.readFileSync(p)

        // Vercel отдаёт текстовые ресурсы сжатыми. Без этого замер
        // штрафует Next за сырой размер бандла и врёт в разы
        const accept = req.headers['accept-encoding'] ?? ''
        const compressible = /text|javascript|json|xml|svg/.test(type)
        const headers = { 'content-type': type }

        if (compressible && accept.includes('br')) {
          body = zlib.brotliCompressSync(body)
          headers['content-encoding'] = 'br'
        } else if (compressible && accept.includes('gzip')) {
          body = zlib.gzipSync(body)
          headers['content-encoding'] = 'gzip'
        }

        res.writeHead(200, headers)
        return res.end(body)
      }
      res.writeHead(404)
      res.end()
    })
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

const URLS = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/blog', '/blog/vygoranie-u-muzhchin']

const old = await serve(ROOT)
const fresh = await serve(path.join(ROOT, 'out'))
const browser = await puppeteer.launch({ headless: true })

const CATEGORIES = ['performance', 'seo', 'accessibility', 'best-practices']

async function audit(url) {
  const res = await lighthouse(
    url,
    { output: 'json', logLevel: 'error', onlyCategories: CATEGORIES, formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } },
    undefined,
    browser.target ? undefined : undefined,
  )
  return res.lhr
}

// Lighthouse сам поднимает вкладку в уже запущенном браузере
const { port } = new URL(browser.wsEndpoint().replace('ws:', 'http:'))

console.log('страница               версия   perf   seo   a11y   bp    LCP      TBT     CLS')
console.log('─'.repeat(84))

for (const u of URLS) {
  for (const [label, srv] of [['старая', old], ['новая', fresh]]) {
    const target = label === 'старая' && u === '/blog' ? '/blog/' : u
    const lhr = await lighthouse(
      `http://127.0.0.1:${srv.port}${target}`,
      { output: 'json', logLevel: 'error', onlyCategories: CATEGORIES, port: Number(port) },
    ).then((r) => r.lhr)

    const s = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100)
    const m = (id) => lhr.audits[id]?.displayValue ?? '—'
    console.log(
      `${u.padEnd(22)} ${label.padEnd(8)} ${String(s('performance')).padStart(4)}  ${String(s('seo')).padStart(4)}  ` +
        `${String(s('accessibility')).padStart(4)}  ${String(s('best-practices')).padStart(4)}  ` +
        `${m('largest-contentful-paint').padStart(7)}  ${m('total-blocking-time').padStart(6)}  ${m('cumulative-layout-shift')}`,
    )
  }
}

await browser.close()
old.server.close()
fresh.server.close()
