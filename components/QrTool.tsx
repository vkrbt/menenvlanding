'use client'

import { useEffect, useMemo, useState } from 'react'
import { qrToPngBlob, qrToSvg } from '@/lib/qr-svg'
import { SITE_URL } from '@/lib/site'

/** Параметры UTM в том порядке, в каком их ждут Метрика и GA. */
const UTM_FIELDS = [
  { key: 'utm_source', label: 'Источник', hint: 'откуда трафик: telegram, instagram, flyer' },
  { key: 'utm_medium', label: 'Тип', hint: 'канал: qr, social, cpc, email' },
  { key: 'utm_campaign', label: 'Кампания', hint: 'что рекламируем: vstrecha-oct, kniga' },
  { key: 'utm_content', label: 'Содержание', hint: 'вариант креатива: flyer-a5, banner-2' },
  { key: 'utm_term', label: 'Ключевое слово', hint: 'для платного поиска, обычно пусто' },
] as const

type UtmKey = (typeof UTM_FIELDS)[number]['key']
type Utm = Record<UtmKey, string>

const EMPTY_UTM: Utm = {
  utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '',
}

const PNG_SIZES = [512, 1024, 2048]

/** Уровни коррекции ошибок: чем выше, тем больше грязи и перекрытий переживёт код. */
const LEVELS = [
  { value: 'L', label: 'L — 7%' },
  { value: 'M', label: 'M — 15%' },
  { value: 'Q', label: 'Q — 25%' },
  { value: 'H', label: 'H — 30%' },
] as const

type Level = (typeof LEVELS)[number]['value']

/** Сборка ссылки: пустые метки не добавляем, существующие в URL — перетираем. */
function buildUrl(base: string, utm: Utm): { url: string; error: string | null } {
  const trimmed = base.trim()
  if (!trimmed) return { url: '', error: 'Укажи ссылку' }

  let parsed: URL
  try {
    // Без протокола URL не парсится, а https нужен и для сканера: иначе ссылка «не кликнется»
    parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    return { url: '', error: 'Не похоже на ссылку' }
  }

  // URL() глотает почти любую строку: «не ссылка вовсе» станет punycode-доменом
  // без единой жалобы. Поэтому проверяем хост сами — точка есть, пробелов нет.
  const host = parsed.hostname
  if (!host.includes('.') || host.startsWith('.') || host.endsWith('.') || /\s|%20/i.test(host)) {
    return { url: '', error: 'Не похоже на ссылку' }
  }

  for (const { key } of UTM_FIELDS) {
    const value = utm[key].trim()
    if (value) parsed.searchParams.set(key, value)
    else parsed.searchParams.delete(key)
  }
  return { url: parsed.toString(), error: null }
}

/** Имя файла из кампании и источника — чтобы в папке «Загрузки» их можно было различить. */
function fileName(utm: Utm, ext: string): string {
  const parts = [utm.utm_campaign, utm.utm_source, utm.utm_content]
    .map((p) => p.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''))
    .filter(Boolean)
  return `qr-${parts.join('-') || 'sreda'}.${ext}`
}

function download(blob: Blob, name: string): void {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = name
  a.click()
  URL.revokeObjectURL(href)
}

export default function QrTool() {
  const [base, setBase] = useState(SITE_URL)
  const [utm, setUtm] = useState<Utm>(EMPTY_UTM)
  const [logo, setLogo] = useState(true)
  const [level, setLevel] = useState<Level>('H')
  const [pngSize, setPngSize] = useState(1024)
  const [svg, setSvg] = useState('')
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  const { url, error } = useMemo(() => buildUrl(base, utm), [base, utm])

  // Превью и SVG для скачивания — один и тот же вектор, так что скачивается ровно то, что видно
  useEffect(() => {
    if (!url) {
      setSvg('')
      return
    }
    try {
      setSvg(qrToSvg(url, { level, logo }))
      setFailed(null)
    } catch {
      setSvg('')
      setFailed('Ссылка слишком длинная для QR — сократи её или убери часть меток')
    }
  }, [url, level, logo])

  const setField = (key: UtmKey, value: string) => setUtm((prev) => ({ ...prev, [key]: value }))

  const copyLink = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const downloadSvg = () => {
    if (!svg) return
    download(new Blob([svg], { type: 'image/svg+xml' }), fileName(utm, 'svg'))
  }

  const downloadPng = async () => {
    if (!url) return
    try {
      download(await qrToPngBlob(url, { level, px: pngSize, logo }), fileName(utm, 'png'))
    } catch {
      setFailed('Не получилось собрать PNG — скачай SVG')
    }
  }

  const hasUtm = UTM_FIELDS.some(({ key }) => utm[key].trim())

  return (
    <div className="qr">
      <div className="qr__form">
        <label className="qr__field">
          <span className="qr__label">Ссылка</span>
          <input
            className="qr__input"
            type="url"
            inputMode="url"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder={SITE_URL}
            spellCheck={false}
          />
        </label>

        <div className="qr__utm-head">
          <span className="qr__label">UTM-метки</span>
          {hasUtm && (
            <button type="button" className="qr__clear" onClick={() => setUtm(EMPTY_UTM)}>
              Очистить
            </button>
          )}
        </div>

        <div className="qr__grid">
          {UTM_FIELDS.map(({ key, label, hint }) => (
            <label className="qr__field" key={key}>
              <span className="qr__label">
                {label} <code className="qr__code">{key}</code>
              </span>
              <input
                className="qr__input"
                type="text"
                value={utm[key]}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={hint}
                spellCheck={false}
              />
            </label>
          ))}
        </div>

        <label className="qr__toggle">
          <input
            type="checkbox"
            checked={logo}
            onChange={(e) => {
              setLogo(e.target.checked)
              // Логотип перекрывает модули — без максимальной коррекции код может не прочитаться
              if (e.target.checked) setLevel('H')
            }}
          />
          <span>
            Логотип «Мужская среда» в центре
            {logo && level !== 'H' && <em className="qr__warn"> — с ним нужен уровень H</em>}
          </span>
        </label>

        <div className="qr__row">
          <label className="qr__field qr__field--inline">
            <span className="qr__label">Коррекция ошибок</span>
            <select className="qr__input" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </label>
          <label className="qr__field qr__field--inline">
            <span className="qr__label">Размер PNG</span>
            <select className="qr__input" value={pngSize} onChange={(e) => setPngSize(Number(e.target.value))}>
              {PNG_SIZES.map((s) => (
                <option key={s} value={s}>{s}×{s} px</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="qr__result">
        <div className="qr__preview" aria-label="Предпросмотр QR-кода">
          {svg
            ? <div className="qr__code-box" dangerouslySetInnerHTML={{ __html: svg }} />
            : <p className="qr__empty">{error ?? 'Готовлю код…'}</p>}
        </div>

        <div className="qr__link">
          <span className="qr__label">Итоговая ссылка</span>
          <p className="qr__link-value">{url || '—'}</p>
        </div>

        {failed && <p className="qr__error">{failed}</p>}

        <div className="qr__actions">
          <button type="button" className="btn btn--primary" onClick={downloadSvg} disabled={!svg}>
            Скачать SVG
          </button>
          <button type="button" className="btn btn--outline" onClick={downloadPng} disabled={!url}>
            Скачать PNG
          </button>
          <button type="button" className="btn btn--outline" onClick={copyLink} disabled={!url}>
            {copied ? 'Скопировано' : 'Скопировать ссылку'}
          </button>
        </div>

        <p className="qr__note">
          SVG — вектор, его и отдавай в печать: масштабируется без потерь. PNG нужен там,
          где вектор не принимают, — соцсети, презентации, мессенджеры.
        </p>
      </div>
    </div>
  )
}
