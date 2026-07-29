/**
 * Рендерит OG-картинки из HTML-шаблонов в PNG 1200×630.
 *
 * Шаблоны лежат в public/ и отдаются по своим URL, но в соцсети уходит
 * не они, а отрендеренный PNG — его и пересобирает этот скрипт.
 *
 * Запуск: node scripts/render-og.mjs [og-image|og-book]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'

const ROOT = process.cwd()

const TARGETS = {
  'og-image': { template: 'og-image.html', out: 'public/og-v2.png' },
  'og-book': { template: 'og-book.html', out: 'public/og-book.png' },
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
}

// Ищем сначала в public/ (там живут шаблоны и фотографии), затем в корне:
// «Frame 17.jpg» весит 4.8 МБ и в раздаваемую статику ему не место
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0])
  for (const base of [path.join(ROOT, 'public'), ROOT]) {
    const file = path.join(base, rel)
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
      return res.end(fs.readFileSync(file))
    }
  }
  res.writeHead(404)
  res.end()
})

await new Promise((r) => server.listen(0, '127.0.0.1', r))
const port = server.address().port

const wanted = process.argv[2] ? [process.argv[2]] : Object.keys(TARGETS)
const browser = await puppeteer.launch({ headless: true })

for (const key of wanted) {
  const target = TARGETS[key]
  if (!target) throw new Error(`Неизвестный шаблон: ${key}`)

  const page = await browser.newPage()
  // 2× — как в исходных картинках: og:image объявлен как 1200×630,
  // но сам файл рендерится в двойном разрешении под ретину
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
  await page.goto(`http://127.0.0.1:${port}/${target.template}`, { waitUntil: 'networkidle0' })
  // ждём готовности шрифтов, иначе в кадр попадёт запасная гарнитура
  await page.evaluate(() => document.fonts.ready)

  const out = path.join(ROOT, target.out)
  await page.screenshot({ path: out, type: 'png' })
  await page.close()

  console.log(`  ${target.out.padEnd(14)} ${(fs.statSync(out).size / 1024).toFixed(0)} КБ`)
}

await browser.close()
server.close()
