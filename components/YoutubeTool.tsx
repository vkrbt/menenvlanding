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
 */
export function YoutubeOpen() {
  const [links, setLinks] = useState<{ app: string | null; web: string } | null>(null)

  useEffect(() => {
    const path = targetFromLocation(location.pathname, location.search)
    if (!path) return
    const l = appLinks(path)
    const platform = detectPlatform()
    setLinks({ app: platform === 'desktop' ? null : l[platform], web: l.web })
  }, [])

  return (
    <div className="ytl ytl--open">
      <p className="ytl__hint">Если YouTube не открылся сам, нажми кнопку.</p>
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
  )
}
