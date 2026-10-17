'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { FORMS_URL, GOOGLE_FORM_ACTION, GOOGLE_FORM_FIELDS, METRIKA_COUNTER_ID, METRIKA_GOALS } from '@/lib/site'

/**
 * Заявка прямо на сайте — окно поверх страницы (на телефоне выезжает снизу).
 *
 * Открывается по любой ссылке на Google-форму (FORMS_URL): слушатель делегированный,
 * поэтому кнопки и CTA внутри статей менять не нужно, а без JS ссылка по-прежнему
 * ведёт в саму Google-форму. Ответ уходит в ту же Google-форму, поэтому попадает
 * в ту же таблицу и в бот. UTM-метка из адреса запоминается при заходе на сайт
 * и пишется в скрытое поле, если она есть.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const UTM_STORAGE = 'sreda-utm'
const UTM_TTL_MS = 30 * 24 * 60 * 60 * 1000

type Fields = { name: string; age: string; city: string; telegram: string; motivation: string }
type Errors = Partial<Record<keyof Fields, string>>
const EMPTY: Fields = { name: '', age: '', city: '', telegram: '', motivation: '' }

/** Последняя метка из адреса — живёт 30 дней, пока человек ходит по сайту */
function rememberUtm(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const parts = UTM_KEYS.filter((k) => params.get(k)).map((k) => `${k}=${params.get(k)}`)
    if (parts.length) localStorage.setItem(UTM_STORAGE, JSON.stringify({ value: parts.join('; '), ts: Date.now() }))
  } catch {
    /* без localStorage метка живёт только на странице входа */
  }
}

function storedUtm(): string {
  try {
    const raw = localStorage.getItem(UTM_STORAGE)
    if (!raw) return ''
    const { value, ts } = JSON.parse(raw) as { value: string; ts: number }
    return Date.now() - ts < UTM_TTL_MS ? value : ''
  } catch {
    return ''
  }
}

function isFormLink(href: string): boolean {
  return href.includes('forms.gle/') || href.includes('docs.google.com/forms/')
}

/** @username, t.me/username или номер телефона — приводим к виду, понятному ведущим */
function normalizeTelegram(v: string): string {
  const s = v.trim()
  const fromLink = s.match(/(?:https?:\/\/)?t(?:elegram)?\.me\/([A-Za-z0-9_]{4,32})/i)
  if (fromLink) return `@${fromLink[1]}`
  if (/^[A-Za-z0-9_]{4,32}$/.test(s)) return `@${s}`
  return s
}

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Как к тебе обращаться?'
  const age = Number(f.age)
  if (!f.age.trim()) e.age = 'Сколько лет?'
  else if (!Number.isInteger(age) || age < 16 || age > 99) e.age = 'Числом: 34'
  const tg = f.telegram.trim()
  if (!tg) e.telegram = 'Нужен, чтобы мы могли написать'
  else if (!/^@?[A-Za-z0-9_]{4,32}$/.test(tg) && !/t(elegram)?\.me\//i.test(tg) && !/^\+?[\d\s()-]{7,}$/.test(tg)) {
    e.telegram = 'Ник вида @username или номер телефона'
  }
  if (!f.motivation.trim()) e.motivation = 'Пара слов — этого достаточно'
  return e
}

type Ym = (id: number, action: string, ...rest: unknown[]) => void
type Gtag = (...args: unknown[]) => void

export default function LeadForm() {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    rememberUtm()

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as HTMLElement | null)?.closest?.('a')
      if (!link || link.dataset.direct !== undefined || !isFormLink(link.getAttribute('href') || '')) return
      // Цели Метрики на клик считает MetrikaGoals — его слушатель тоже на document, мы его не глушим
      e.preventDefault()
      lastFocus.current = link
      setStatus((s) => (s === 'sent' ? 'idle' : s))
      setOpen(true)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('lead-open', open)
    if (open) {
      const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('input, button.btn')?.focus({ preventScroll: true }), 60)
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close()
      }
      document.addEventListener('keydown', onKey)
      return () => {
        window.clearTimeout(t)
        document.removeEventListener('keydown', onKey)
      }
    }
    lastFocus.current?.focus({ preventScroll: true })
    lastFocus.current = null
  }, [open, close])

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length) {
      panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }

    const F = GOOGLE_FORM_FIELDS
    const body = new URLSearchParams({
      [F.name]: fields.name.trim(),
      [F.age]: fields.age.trim(),
      [F.city]: fields.city.trim(),
      [F.telegram]: normalizeTelegram(fields.telegram),
      [F.motivation]: fields.motivation.trim(),
    })
    const utm = storedUtm()
    if (F.utm && utm) body.set(F.utm, utm)

    setStatus('sending')
    try {
      // Google Forms не отдаёт CORS-заголовки: ответ «непрозрачный», поэтому успехом считаем
      // отсутствие сетевой ошибки. Обязательные поля проверены выше теми же правилами
      await fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body })
      setStatus('sent')
      setFields(EMPTY)
      const w = window as unknown as { ym?: Ym; gtag?: Gtag }
      if (typeof w.ym === 'function') w.ym(METRIKA_COUNTER_ID, 'reachGoal', METRIKA_GOALS.leadSent, { page: window.location.pathname })
      if (typeof w.gtag === 'function') w.gtag('event', 'generate_lead')
    } catch {
      setStatus('error')
    }
  }

  const field = (k: keyof Fields) => ({
    id: `lead-${k}`,
    value: fields[k],
    onChange: set(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `lead-${k}-err` : undefined,
  })
  const err = (k: keyof Fields) =>
    errors[k] ? (
      <span className="lead__err" id={`lead-${k}-err`}>
        {errors[k]}
      </span>
    ) : null

  return (
    <div className={open ? 'lead lead--open' : 'lead'} aria-hidden={!open} inert={!open}>
      <div className="lead__overlay" onClick={close} />
      <div className="lead__panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="lead-title">
        <button type="button" className="lead__close" aria-label="Закрыть" onClick={close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {status === 'sent' ? (
          <div className="lead__done">
            <div className="lead__done-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="lead__title" id="lead-title">Заявка у нас</h2>
            <p className="lead__sub">Скоро напишем тебе в Telegram, чтобы договориться о коротком созвоне на 10–15 минут. Это бесплатно.</p>
            <button type="button" className="btn btn--primary btn--full" onClick={close}>
              Хорошо
            </button>
          </div>
        ) : (
          <form className="lead__form" onSubmit={submit} noValidate>
            <h2 className="lead__title" id="lead-title">Заявка в группу</h2>
            <p className="lead__sub">Пара минут. Потом напишем в Telegram и договоримся о коротком бесплатном созвоне.</p>

            <label className="lead__field">
              <span className="lead__label">Имя и фамилия</span>
              <input className="lead__input" type="text" autoComplete="name" {...field('name')} />
              {err('name')}
            </label>

            <div className="lead__row">
              <label className="lead__field lead__field--age">
                <span className="lead__label">Возраст</span>
                <input className="lead__input" type="text" inputMode="numeric" maxLength={2} {...field('age')} />
                {err('age')}
              </label>
              <label className="lead__field">
                <span className="lead__label">
                  Страна и город <span className="lead__opt">необязательно</span>
                </span>
                <input className="lead__input" type="text" autoComplete="address-level2" {...field('city')} />
              </label>
            </div>

            <label className="lead__field">
              <span className="lead__label">Telegram для связи</span>
              <input className="lead__input" type="text" placeholder="@username" autoCapitalize="none" autoCorrect="off" spellCheck={false} {...field('telegram')} />
              {err('telegram')}
            </label>

            <label className="lead__field">
              <span className="lead__label">Для чего хочешь попасть в Мужскую среду?</span>
              <textarea className="lead__input lead__textarea" rows={3} {...field('motivation')} />
              {err('motivation')}
            </label>

            {status === 'error' && (
              <p className="lead__fail" role="alert">
                Не получилось отправить — проверь интернет и попробуй ещё раз или{' '}
                <a href={FORMS_URL} target="_blank" rel="noopener" data-direct>
                  заполни Google-форму
                </a>
                .
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--full lead__submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}
            </button>
            <p className="lead__note">Анкету видят только ведущие группы.</p>
          </form>
        )}
      </div>
    </div>
  )
}
