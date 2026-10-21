'use client'

import { useEffect, useMemo, useState } from 'react'
import { appLinks, detectPlatform, targetFromLocation, toSredaPath, toYoutubePath } from '@/lib/youtube-link'
import { SITE_URL } from '@/lib/site'

/**
 * Генератор: ссылка YouTube → ссылка sreda.men/youtube/…, которая из соцсетей
 * открывается сразу в приложении. Показывается на голой /youtube.
 */
export function YoutubeTool() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const youtubePath = useMemo(() => toYoutubePath(input), [input])
  const link = youtubePath ? SITE_URL + toSredaPath(youtubePath) : ''
  const error = input.trim() && !youtubePath ? 'Это не ссылка на видео, шортс, канал или плейлист YouTube' : null

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="ytl">
      <label className="qr__field">
        <span className="qr__label">Ссылка на YouTube</span>
        <input
          className="qr__input"
          type="url"
          inputMode="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://youtu.be/…"
          spellCheck={false}
          autoFocus
        />
      </label>

      {error && <p className="qr__error">{error}</p>}

      <div className="qr__link">
        <span className="qr__label">Ссылка для соцсетей</span>
        <p className="qr__link-value">{link || '—'}</p>
      </div>

      <div className="qr__actions">
        <button type="button" className="btn btn--primary" onClick={copyLink} disabled={!link}>
          {copied ? 'Скопировано' : 'Скопировать ссылку'}
        </button>
        {link && (
          <a className="btn btn--outline" href={link} target="_blank" rel="noopener">
            Проверить
          </a>
        )}
      </div>

      <p className="qr__note">
        Можно и без генератора: в любой ссылке замени «youtube.com» на «sreda.men/youtube».
        На телефоне ссылка открывает приложение YouTube, а если его нет или соцсеть не пускает —
        обычный сайт. На компьютере — сразу сайт.
      </p>
    </div>
  )
}

/**
 * Экран перехода. Само открытие делает встроенный скрипт страницы ещё до загрузки React,
 * а здесь — кнопки на случай, если соцсеть не дала открыть приложение без нажатия
 * или человек вернулся назад из YouTube.
 *
 * Вкладка остаётся открытой, пока смотрят видео. Когда человек возвращается, заголовок
 * меняется на «Стой, погоди», а data-yt-back на <html> запускает анимацию карточки
 * о группе (youtube.css) — при каждом возвращении заново.
 */
export function YoutubeOpen() {
  const [links, setLinks] = useState<{ app: string | null; web: string } | null>(null)
  const [returned, setReturned] = useState(false)

  useEffect(() => {
    const path = targetFromLocation(location.pathname, location.search)
    if (!path) return
    const l = appLinks(path)
    const platform = detectPlatform()
    setLinks({ app: platform === 'desktop' ? null : l[platform], web: l.web })

    const root = document.documentElement
    // Уйти в приложение могли ещё до гидратации — тогда об этом знает только метка скрипта
    let away = document.hidden || root.hasAttribute('data-yt-left')

    const leave = () => { away = true }
    const back = () => {
      if (!away || document.hidden) return
      away = false
      setReturned(true)
      // Снять и поставить атрибут заново — иначе CSS-анимация второй раз не запустится
      root.removeAttribute('data-yt-back')
      void root.offsetWidth
      root.setAttribute('data-yt-back', '')
    }
    const onVisibility = () => (document.hidden ? leave() : back())

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', leave)
    window.addEventListener('blur', leave)
    window.addEventListener('pageshow', back)
    window.addEventListener('focus', back)
    back()
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('blur', leave)
      window.removeEventListener('pageshow', back)
      window.removeEventListener('focus', back)
    }
  }, [])

  return (
    <>
      <h1 className="section-title ytl-opening__title">{returned ? 'Стой, погоди' : 'Открываем YouTube…'}</h1>
      <div className="ytl ytl--open">
        {!returned && <p className="ytl__hint">Если YouTube не открылся сам, нажми кнопку.</p>}
        <div className="qr__actions">
          {links?.app && (
            <a className="btn btn--primary btn--sm" href={links.app}>
              Открыть в приложении
            </a>
          )}
          {links && (
            <a className="btn btn--outline btn--sm" href={links.web}>
              В браузере
            </a>
          )}
        </div>
      </div>
    </>
  )
}
