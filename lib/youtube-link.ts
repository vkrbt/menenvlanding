/**
 * Ссылки «открыть в приложении YouTube» для страницы /youtube.
 *
 * Ссылка на нашем сайте — это путь YouTube после /youtube: sreda.men/youtube/watch?v=ID,
 * sreda.men/youtube/shorts/ID, sreda.men/youtube/@men-env. Обычное видео сокращаем
 * до sreda.men/youtube/ID — как youtu.be. Все такие адреса vercel.json переписывает
 * на одну статичную страницу, а куда вести, она узнаёт уже в браузере из location.
 *
 * targetFromLocation, appLinks и openYoutube уходят во встроенный скрипт страницы
 * через toString() (как в next-themes), поэтому они самодостаточны: никаких
 * импортов, констант модуля и вызовов друг друга — только аргументы и window.
 */

/** Адрес страницы. Тот же префикс зашит в targetFromLocation — см. комментарий выше */
export const YOUTUBE_PAGE = '/youtube'

/** Метки «откуда поделились»: к видео отношения не имеют, только удлиняют ссылку */
const TRACKING_PARAMS = ['si', 'feature', 'pp']

const VIDEO_ID = /^[\w-]{11}$/

/**
 * Любая ссылка YouTube → путь с параметрами: «/watch?v=ID&t=30», «/shorts/ID», «/@men-env».
 * null — если это не YouTube или ссылка ведёт на главную, где открывать нечего.
 */
export function toYoutubePath(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '')
  let path = url.pathname.replace(/\/+$/, '')
  const params = url.searchParams

  if (host === 'youtu.be') {
    const id = path.slice(1)
    if (!VIDEO_ID.test(id)) return null
    path = '/watch'
    params.set('v', id)
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    // Плеер для встраивания в приложении не откроется — превращаем в обычную страницу видео
    const embed = path.match(/^\/(?:embed|v)\/([\w-]{11})$/)
    if (embed) {
      path = '/watch'
      params.set('v', embed[1])
    }
    if (!path) return null
  } else {
    // music.youtube.com и прочие поддомены — другие приложения, их схемы тут не работают
    return null
  }

  if (path === '/watch' && !VIDEO_ID.test(params.get('v') ?? '')) return null

  for (const p of TRACKING_PARAMS) params.delete(p)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

/**
 * Путь YouTube → хвост ссылки на нашем сайте. Видео, у которого кроме номера есть
 * разве что таймкод, сокращаем до /ID и /ID?t=30 — targetFromLocation развернёт обратно.
 */
export function toSredaPath(youtubePath: string): string {
  const [path, query = ''] = youtubePath.split('?')
  if (path === '/watch') {
    const params = new URLSearchParams(query)
    const id = params.get('v') ?? ''
    params.delete('v')
    if (VIDEO_ID.test(id) && [...params.keys()].every((k) => k === 't')) {
      const rest = params.toString()
      return `${YOUTUBE_PAGE}/${id}${rest ? `?${rest}` : ''}`
    }
  }
  return `${YOUTUBE_PAGE}${youtubePath}`
}

/** Адрес нашей страницы → путь YouTube. null — адреса нет, значит показываем генератор */
export function targetFromLocation(pathname: string, search: string): string | null {
  const path = pathname.replace(/^\/youtube(?=\/|$)/, '').replace(/\/+$/, '')
  if (!path) return null
  // Короткая форма /ID — это обычное видео, остальные параметры (таймкод) идут следом
  if (/^\/[\w-]{11}$/.test(path)) {
    return '/watch?v=' + path.slice(1) + (search.length > 1 ? '&' + search.slice(1) : '')
  }
  return path + search
}

/**
 * Три адреса одного и того же. Хост в каждом зашит, путь всегда начинается с «/»,
 * так что увести куда-то кроме YouTube такая ссылка не может.
 * На Android intent:// с browser_fallback_url: Chrome сам откроет сайт, если приложения нет.
 */
export function appLinks(path: string): { web: string; ios: string; android: string } {
  const web = 'https://www.youtube.com' + path
  return {
    web: web,
    ios: 'youtube://www.youtube.com' + path,
    android:
      'intent://www.youtube.com' + path +
      '#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=' +
      encodeURIComponent(web) + ';end',
  }
}

/** Платформа по user agent: iPad с iPadOS 13+ притворяется маком, его выдаёт тачскрин */
export function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  return 'desktop'
}

/**
 * Встроенный скрипт страницы: срабатывает до гидратации, чтобы не ждать загрузки React.
 * Пробуем открыть приложение; если через FALLBACK_MS страница всё ещё на экране —
 * приложения нет или соцсеть не пустила, уводим на сайт. Уход в приложение прячет
 * страницу (visibilitychange/pagehide), а системный вопрос «Открыть в YouTube?»
 * снимает с неё фокус (blur) — в обоих случаях таймер отменяем, чтобы не перебить.
 */
export function openYoutube(
  target: typeof targetFromLocation,
  links: typeof appLinks,
  platform: typeof detectPlatform,
): void {
  const FALLBACK_MS = 1800
  const path = target(location.pathname, location.search)
  if (!path) return
  document.documentElement.setAttribute('data-yt-open', '')

  const l = links(path)
  const p = platform()
  if (p === 'desktop') {
    location.replace(l.web)
    return
  }

  // Переход на youtube:// посреди разбора HTML обрывает загрузку: если приложения нет
  // или человек вернулся из него, остаётся пустая страница без кнопок. Ждём разметку —
  // это всё равно раньше, чем загрузится React
  const go = function () {
    const timer = setTimeout(function () {
      if (!document.hidden) location.replace(l.web)
    }, FALLBACK_MS)
    // data-yt-left: React грузится позже и сам уход не застанет, а по метке
    // экран перехода поймёт, что человек возвращается из YouTube
    const cancel = function () {
      clearTimeout(timer)
      document.documentElement.setAttribute('data-yt-left', '')
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) cancel() })
    window.addEventListener('pagehide', cancel)
    window.addEventListener('blur', cancel)

    location.href = p === 'android' ? l.android : l.ios
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go)
  else go()
}

/** Готовый текст встроенного скрипта */
export const OPEN_YOUTUBE_SCRIPT = `(${openYoutube})(${targetFromLocation}, ${appLinks}, ${detectPlatform});`
