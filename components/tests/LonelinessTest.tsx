'use client'

import { useEffect, useRef, useState } from 'react'
import { BOT_URL } from '@/lib/bot-link'
import { formatDay, meetingDate } from '@/lib/group'
import { METRIKA_COUNTER_ID, METRIKA_GOALS, TESTS_URL } from '@/lib/site'
import {
  LONELINESS_SLUG,
  QUESTIONS,
  TYPES,
  botPayload,
  compute,
  sourceFromSearch,
  typeText,
  type LonelinessResult,
  type TypeId,
} from '@/lib/tests/loneliness'
import { typo } from '@/lib/typo'

/**
 * Прохождение авторского теста «Поговорить не с кем». Как и TestRunner, ответы
 * живут только в памяти компонента: без localStorage и параметров в URL. Наружу
 * уходит только то, что человек сам отправит в бота кнопкой «Получить разбор».
 */

type Screen = 'intro' | 'question' | 'result'

/** Пауза перед автопереходом: человек успевает увидеть, что выбрал */
const ADVANCE_MS = 220

function reachGoal(goal: string) {
  const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym
  ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, { test: LONELINESS_SLUG })
}

function plural(n: number, f: [string, string, string]) {
  const m10 = n % 10
  const m100 = n % 100
  return f[m10 === 1 && m100 !== 11 ? 0 : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 1 : 2]
}

/** Клетки карты 2×2: сверху «близкий есть», слева «компания есть» */
const MAP: Array<{ t: TypeId; label: string }> = [
  { t: 'A', label: 'Свои люди есть' },
  { t: 'C', label: 'Всё держится на одном человеке' },
  { t: 'B', label: 'Друзья есть, поговорить не с кем' },
  { t: 'D', label: 'Один на один с собой' },
]

export default function LonelinessTest() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<number | null>>(() => QUESTIONS.map(() => null))
  const timer = useRef<number | undefined>(undefined)
  const heading = useRef<HTMLHeadingElement>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (screen === 'question') heading.current?.focus({ preventScroll: true })
    if (screen !== 'intro') {
      const top = root.current?.getBoundingClientRect().top ?? 0
      if (screen === 'result' || top < 0) root.current?.scrollIntoView({ block: 'start' })
    }
  }, [screen, index])

  useEffect(() => {
    if (screen === 'result') reachGoal(METRIKA_GOALS.lonelyComplete)
  }, [screen])

  function begin() {
    window.clearTimeout(timer.current)
    setAnswers(QUESTIONS.map(() => null))
    setIndex(0)
    setScreen('question')
  }

  function choose(i: number) {
    window.clearTimeout(timer.current)
    const next = answers.slice()
    next[index] = i
    setAnswers(next)
    timer.current = window.setTimeout(() => {
      if (index < QUESTIONS.length - 1) setIndex(index + 1)
      else setScreen('result')
    }, ADVANCE_MS)
  }

  function back() {
    window.clearTimeout(timer.current)
    if (index > 0) setIndex(index - 1)
  }

  // Клавиши 1–5 — вариант, Backspace — назад
  useEffect(() => {
    if (screen !== 'question') return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= QUESTIONS[index].opts.length) {
        e.preventDefault()
        choose(n - 1)
      } else if (e.key === 'Backspace' && index > 0) {
        e.preventDefault()
        back()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (screen === 'intro') {
    return (
      <div className="trun trun--intro ym-hide-content" ref={root}>
        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={() => {
            reachGoal(METRIKA_GOALS.lonelyStart)
            begin()
          }}
        >
          Начать тест
        </button>
        <p className="trun__intro-meta">{typo('Около 4 мин · можно вернуться к предыдущему вопросу')}</p>
        <noscript>
          <p className="trun__noscript">{typo('Чтобы пройти тест, включи JavaScript: подсчёт идёт прямо в браузере.')}</p>
        </noscript>
      </div>
    )
  }

  if (screen === 'result') {
    return (
      <div className="trun ym-hide-content" ref={root}>
        <Result result={compute(answers)} onRestart={begin} />
      </div>
    )
  }

  const q = QUESTIONS[index]
  const answered = answers[index]
  return (
    <div className="trun ym-hide-content" ref={root}>
      <div className="trun__progress" aria-hidden="true">
        <div className="trun__progress-bar" style={{ transform: `scaleX(${index / QUESTIONS.length})` }} />
      </div>
      <p className="trun__count lt-count">
        <span className="lt-count__part">{q.part === 1 ? 'Часть 1 из 2 · Кто рядом' : 'Часть 2 из 2 · О чём ты молчишь'}</span>
        <span>
          {index + 1} / {QUESTIONS.length}
        </span>
      </p>

      <div className="trun__q" key={index}>
        <h2 className="trun__text" tabIndex={-1} ref={heading} id={`lq-${index}`}>
          {typo(q.text)}
        </h2>
        <div className="trun__options" role="radiogroup" aria-labelledby={`lq-${index}`}>
          {q.opts.map(([label], i) => (
            <button
              type="button"
              role="radio"
              aria-checked={answered === i}
              className={answered === i ? 'trun__option is-checked' : 'trun__option'}
              key={label}
              onClick={() => choose(i)}
            >
              <span className="lt-key" aria-hidden="true">
                {i + 1}
              </span>
              <span>{typo(label)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="trun__nav">
        <button type="button" className="trun__back" onClick={back} disabled={index === 0}>
          ← Назад
        </button>
        {answered !== null && (
          <button
            type="button"
            className="trun__next"
            onClick={() => {
              window.clearTimeout(timer.current)
              if (index < QUESTIONS.length - 1) setIndex(index + 1)
              else setScreen('result')
            }}
          >
            {index === QUESTIONS.length - 1 ? 'К результату' : 'Дальше'} →
          </button>
        )}
      </div>
    </div>
  )
}

function Result({ result: r, onRestart }: { result: LonelinessResult; onRestart: () => void }) {
  // Источник из UTM — только после монтирования: при сборке location нет
  const [src, setSrc] = useState('')
  useEffect(() => setSrc(sourceFromSearch(window.location.search)), [])
  const tgHref = `${BOT_URL}?start=${botPayload(r, src)}`

  // Кнопка в бота, прибитая к низу экрана на мобильном; прячется, когда видна кнопка в карточке Telegram
  const tgCard = useRef<HTMLElement>(null)
  const [tgCardVisible, setTgCardVisible] = useState(false)
  useEffect(() => {
    const el = tgCard.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setTgCardVisible(e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const barrier = r.silent.filter((x) => x.kind === 'b').length
  const absent = r.silent.length - barrier
  const silentTitle =
    r.silent.length === 0
      ? 'О чём ты молчишь'
      : r.silent.length === 1
        ? 'Одна тема, о которой ты молчишь'
        : `${r.silent.length} ${plural(r.silent.length, ['тема', 'темы', 'тем'])}, о которых ты молчишь`

  return (
    <div className="tres">
      <section className="lt-card">
        <p className="lt-kicker">Твой тип</p>
        <h2 className="tres__heading lt-type" tabIndex={-1}>
          {typo(TYPES[r.type].title)}
        </h2>
        <p className="lt-text">{typo(typeText(r))}</p>

        <div className="lt-map" aria-hidden="true">
          <span className="lt-map__y">близкий человек есть</span>
          {MAP.slice(0, 2).map((c) => (
            <span key={c.t} className={c.t === r.type ? 'lt-map__cell is-on' : 'lt-map__cell'}>
              {typo(c.label)}
            </span>
          ))}
          <span className="lt-map__y">близкого нет</span>
          {MAP.slice(2).map((c) => (
            <span key={c.t} className={c.t === r.type ? 'lt-map__cell is-on' : 'lt-map__cell'}>
              {typo(c.label)}
            </span>
          ))}
          <span />
          <span className="lt-map__x">компания есть</span>
          <span className="lt-map__x">компании нет</span>
        </div>

        <div className="lt-axes">
          <Axis label="Нехватка близости" value={r.e} />
          <Axis label="Нехватка компании" value={r.s} />
        </div>
      </section>

      {/* Вопроса о мыслях о смерти в тесте нет — поэтому без блока экстренной помощи (он у PHQ-9 и подобных) */}
      {r.type === 'D' && (
        <>
          <section className="tres__next lt-care">
            <h3>Если сейчас тяжело</h3>
            <p>
              {typo(
                'Когда рядом почти никого, а внутри навалилось — начинать лучше с одного разговора один на один, со специалистом. Группа может стать следующим шагом.',
              )}{' '}
              <a href={tgHref} target="_blank" rel="noopener" onClick={() => reachGoal(METRIKA_GOALS.lonelyTgClick)}>
                Напиши нам в Telegram
              </a>
              {typo(' — подскажем, куда обратиться.')}
            </p>
          </section>
        </>
      )}

      <section>
        <h3 className="lt-h3">{silentTitle}</h3>
        {r.silent.length > 0 && (
          <p className="lt-lead">
            {typo(
              barrier > absent
                ? 'Чаще всего тебе есть с кем поговорить — ты сам не начинаешь этот разговор. Так делает большинство мужчин: кажется, что с этим надо справляться самому.'
                : 'Чаще всего поговорить об этом просто не с кем. Справа — встреча группы, где это и будет темой разговора.',
            )}
          </p>
        )}
        <div className="lt-silent">
          {r.silent.length === 0 ? (
            <p>{typo('Ни одной темы. Тебе есть с кем говорить обо всём из списка — и ты говоришь. Это редкость, серьёзно.')}</p>
          ) : (
            r.silent.map((t) => {
              const date = meetingDate(t.meet - 1)
              return (
                <div key={t.c} className={t.kind === 'b' ? 'lt-silent__item is-barrier' : 'lt-silent__item'}>
                  <div>
                    <p className="lt-silent__name">{typo(t.name)}</p>
                    <p className="lt-silent__tag">{t.kind === 'b' ? 'есть с кем, но молчишь' : 'не с кем'}</p>
                  </div>
                  <p className="lt-silent__meet">
                    <b>Встреча {t.meet}</b>
                    {date && <span>{formatDay(date)}</span>}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </section>

      <section className="lt-tg" ref={tgCard}>
        <h3>Продолжение — в Telegram</h3>
        <ul>
          <li>{typo('Разбор твоего типа: откуда это берётся и чем обходится')}</li>
          <li>{typo('Почему мужчины молчат именно о том, о чём молчишь ты — и видео от нас на эту тему')}</li>
          <li>{typo('Как устроена группа: формат, даты, правила, отзывы')}</li>
        </ul>
        <a
          className="btn btn--lg lt-tg__btn"
          href={tgHref}
          target="_blank"
          rel="noopener"
          onClick={() => reachGoal(METRIKA_GOALS.lonelyTgClick)}
        >
          Получить разбор в Telegram
        </a>
        <p className="lt-tg__note">
          {typo('Бот получит только тип, два числа и список тем — без ответов на отдельные вопросы.')}
        </p>
      </section>

      <div className="tres__actions">
        <a href="/#program" className="btn btn--outline">
          Программа группы
        </a>
        <button type="button" className="btn btn--outline" onClick={onRestart}>
          Пройти заново
        </button>
        <a href={TESTS_URL} className="trun__link">
          Другие тесты
        </a>
      </div>

      <p className="tres__disclaimer">
        {typo('Ответы посчитаны в твоём браузере и пропадут, когда ты закроешь страницу. В бота уходит только то, что ты отправишь кнопкой.')}
      </p>

      <div className={tgCardVisible ? 'lt-sticky is-hidden' : 'lt-sticky'} aria-hidden={tgCardVisible}>
        <a
          className="lt-sticky__btn"
          href={tgHref}
          target="_blank"
          rel="noopener"
          tabIndex={tgCardVisible ? -1 : 0}
          onClick={() => reachGoal(METRIKA_GOALS.lonelyTgClick)}
        >
          Получить разбор в Telegram →
        </a>
      </div>
    </div>
  )
}

function Axis({ label, value }: { label: string; value: number }) {
  // Полоса «дорастает» до значения после показа результата
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = window.setTimeout(() => setW(Math.max(value, 2)), 60)
    return () => window.clearTimeout(id)
  }, [value])
  return (
    <div className={value >= 50 ? 'lt-axis is-hot' : 'lt-axis'}>
      <p className="lt-axis__top">
        <b>{label}</b>
        <span>{value} из 100</span>
      </p>
      <div className="lt-axis__track">
        <i style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}
