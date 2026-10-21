import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appLinks, targetFromLocation, toSredaPath, toYoutubePath, OPEN_YOUTUBE_SCRIPT } from './youtube-link.ts'

const ID = 'dQw4w9WgXcQ'

test('toYoutubePath: все виды ссылок на видео сводятся к /watch', () => {
  for (const input of [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}&si=abc`,
    `youtube.com/watch?v=${ID}&feature=share`,
    `https://youtu.be/${ID}?si=xyz`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
  ]) {
    assert.equal(toYoutubePath(input), `/watch?v=${ID}`, input)
  }
})

test('toYoutubePath: таймкод, шортсы, каналы и плейлисты сохраняются', () => {
  assert.equal(toYoutubePath(`https://youtu.be/${ID}?t=42`), `/watch?t=42&v=${ID}`)
  assert.equal(toYoutubePath(`https://youtube.com/shorts/${ID}?si=1`), `/shorts/${ID}`)
  assert.equal(toYoutubePath('https://www.youtube.com/@men-env/'), '/@men-env')
  assert.equal(toYoutubePath('https://www.youtube.com/playlist?list=PL123'), '/playlist?list=PL123')
})

test('toYoutubePath: не YouTube, главная и битое видео — null', () => {
  for (const input of [
    '',
    'https://sreda.men/blog',
    'https://music.youtube.com/watch?v=' + ID,
    'https://www.youtube.com/',
    'https://www.youtube.com/watch?v=short',
    'https://youtu.be/',
    'не ссылка',
  ]) {
    assert.equal(toYoutubePath(input), null, input)
  }
})

test('toSredaPath: простое видео — короткой ссылкой, остальное — путём YouTube', () => {
  assert.equal(toSredaPath(`/watch?v=${ID}`), `/youtube/${ID}`)
  assert.equal(toSredaPath(`/watch?t=42&v=${ID}`), `/youtube/${ID}?t=42`)
  assert.equal(toSredaPath(`/watch?v=${ID}&list=PL1`), `/youtube/watch?v=${ID}&list=PL1`)
  assert.equal(toSredaPath(`/shorts/${ID}`), `/youtube/shorts/${ID}`)
  assert.equal(toSredaPath('/@men-env'), '/youtube/@men-env')
})

test('targetFromLocation разворачивает то, что собрал toSredaPath', () => {
  for (const input of [
    `https://youtu.be/${ID}?t=42`,
    `https://www.youtube.com/watch?v=${ID}&list=PL1`,
    `https://youtube.com/shorts/${ID}`,
    'https://www.youtube.com/@men-env',
  ]) {
    const yt = toYoutubePath(input)!
    const ours = new URL('https://sreda.men' + toSredaPath(yt))
    const back = targetFromLocation(ours.pathname, ours.search)!
    // Порядок параметров может поменяться — сравниваем по смыслу
    const a = new URL('https://www.youtube.com' + yt)
    const b = new URL('https://www.youtube.com' + back)
    assert.equal(b.pathname, a.pathname, input)
    assert.deepEqual([...b.searchParams].sort(), [...a.searchParams].sort(), input)
  }
})

test('targetFromLocation: сама страница без хвоста — генератор', () => {
  assert.equal(targetFromLocation('/youtube', ''), null)
  assert.equal(targetFromLocation('/youtube/', ''), null)
})

test('appLinks: хост YouTube зашит и в intent, и в фолбэке', () => {
  const l = appLinks(`/watch?v=${ID}`)
  assert.equal(l.web, `https://www.youtube.com/watch?v=${ID}`)
  assert.equal(l.ios, `youtube://www.youtube.com/watch?v=${ID}`)
  assert.equal(
    l.android,
    `intent://www.youtube.com/watch?v=${ID}#Intent;scheme=https;package=com.google.android.youtube;` +
      `S.browser_fallback_url=${encodeURIComponent(l.web)};end`,
  )
  // Попытка увести на чужой хост двойным слешем остаётся путём на youtube.com
  assert.equal(new URL(appLinks('//evil.com').web).hostname, 'www.youtube.com')
})

/** Прогон встроенного скрипта в подставном браузере */
function runScript(path: string, ua: string, hidden = false) {
  const nav: string[] = []
  const timers: Array<() => void> = []
  const listeners: Record<string, () => void> = {}
  const env = {
    location: {
      pathname: new URL('https://sreda.men' + path).pathname,
      search: new URL('https://sreda.men' + path).search,
      replace: (u: string) => nav.push('replace ' + u),
      set href(u: string) { nav.push('href ' + u) },
    },
    navigator: { userAgent: ua, platform: '', maxTouchPoints: 0 },
    document: {
      hidden,
      documentElement: { setAttribute: () => {} },
      addEventListener: (e: string, f: () => void) => { listeners[e] = f },
    },
    window: { addEventListener: (e: string, f: () => void) => { listeners['w:' + e] = f } },
    setTimeout: (f: () => void) => timers.push(f),
    clearTimeout: () => timers.splice(0),
  }
  new Function(...Object.keys(env), OPEN_YOUTUBE_SCRIPT)(...Object.values(env))
  return { nav, timers, listeners }
}

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Instagram 350.0'
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130.0 Mobile'
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0'

test('скрипт: iPhone — сначала приложение, без него через таймер сайт', () => {
  const r = runScript(`/youtube/${ID}`, IPHONE)
  assert.deepEqual(r.nav, [`href youtube://www.youtube.com/watch?v=${ID}`])
  r.timers.forEach((f) => f())
  assert.equal(r.nav[1], `replace https://www.youtube.com/watch?v=${ID}`)
})

test('скрипт: ушли в приложение — фолбэк не срабатывает', () => {
  const r = runScript(`/youtube/${ID}`, IPHONE)
  r.listeners['w:blur']()
  r.timers.forEach((f) => f())
  assert.equal(r.nav.length, 1)
})

test('скрипт: Android — intent, компьютер — сразу сайт, без хвоста — ничего', () => {
  assert.match(runScript(`/youtube/${ID}`, ANDROID).nav[0], /^href intent:\/\//)
  assert.deepEqual(runScript(`/youtube/${ID}`, MAC).nav, [`replace https://www.youtube.com/watch?v=${ID}`])
  assert.deepEqual(runScript('/youtube', IPHONE).nav, [])
})
