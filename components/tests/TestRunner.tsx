'use client'

import { useEffect, useReducer, useRef } from 'react'
import { score } from '@/lib/tests/score'
import type { Answers, Scale } from '@/lib/tests/types'
import { METRIKA_COUNTER_ID, METRIKA_GOALS } from '@/lib/site'
import TestResult from './TestResult'

/**
 * Прохождение теста. Состояние живёт только в памяти компонента: никаких
 * localStorage, sessionStorage и параметров в URL — перезагрузка начинает
 * тест заново. Это часть обещания анонимности, а не недоработка.
 */

type State = { screen: 'intro' | 'question' | 'result'; index: number; answers: Answers }

type Action =
  | { type: 'start' }
  | { type: 'answer'; id: string; value: number }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'restart' }

/** Пропускаемый вопрос: ответ на нём подставляется сам */
function skipped(scale: Scale, index: number, answers: Answers): boolean {
  const s = scale.items[index]?.skipIf
  return !!s && answers[s.ifItem] === s.equals
}

/** Подставить ответы всем пропускаемым вопросам — до подсчёта и при переходе */
function fillSkipped(scale: Scale, answers: Answers): Answers {
  const out = { ...answers }
  for (const item of scale.items) {
    if (item.skipIf && out[item.skipIf.ifItem] === item.skipIf.equals) out[item.id] = item.skipIf.value
  }
  return out
}

function reducer(scale: Scale) {
  const last = scale.items.length - 1
  const step = (from: number, dir: 1 | -1, answers: Answers) => {
    let i = from + dir
    while (i >= 0 && i <= last && skipped(scale, i, answers)) i += dir
    return i
  }
  return (state: State, action: Action): State => {
    switch (action.type) {
      case 'start':
        return { screen: 'question', index: 0, answers: {} }
      case 'answer':
        return { ...state, answers: { ...state.answers, [action.id]: action.value } }
      case 'next': {
        const answers = fillSkipped(scale, state.answers)
        const i = step(state.index, 1, answers)
        return i <= last ? { ...state, answers, index: i } : { ...state, answers, screen: 'result' }
      }
      case 'back': {
        const from = state.screen === 'result' ? last + 1 : state.index
        const i = step(from, -1, state.answers)
        return { ...state, screen: 'question', index: Math.max(0, i) }
      }
      case 'restart':
        return { screen: 'question', index: 0, answers: {} }
    }
  }
}

/** Цель Метрики. Параметр — только slug теста, без ответов и баллов */
function reachGoal(goal: string, slug: string) {
  const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym
  ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, { test: slug })
}

/** Пауза перед автопереходом: человек успевает увидеть, что выбрал */
const ADVANCE_MS = 220

export default function TestRunner({ scale, questions }: { scale: Scale; questions: number }) {
  const [state, dispatch] = useReducer(reducer(scale), { screen: 'intro', index: 0, answers: {} })
  const timer = useRef<number | undefined>(undefined)
  const heading = useRef<HTMLHeadingElement>(null)
  const root = useRef<HTMLDivElement>(null)

  const item = scale.items[state.index]
  const total = scale.items.length
  // Номер вопроса по бланку: уточнение «19а» идёт под номером своего пункта
  const isExtra = item ? !/^\d+$/.test(item.id) : false
  const number = scale.items.slice(0, state.index + 1).filter((i) => /^\d+$/.test(i.id)).length
  const answered = item ? state.answers[item.id] : undefined
  const prevPart = state.index > 0 ? scale.items[state.index - 1].part : undefined
  const part =
    scale.parts.length > 1 && item?.part && item.part !== prevPart
      ? scale.parts.find((p) => p.id === item.part)
      : scale.parts.length === 1 && state.index === 0
        ? scale.parts[0]
        : undefined

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Фокус на новый вопрос: скринридер читает его, клавиатура продолжает с него
  useEffect(() => {
    if (state.screen === 'question') heading.current?.focus({ preventScroll: true })
    if (state.screen !== 'intro') {
      const top = root.current?.getBoundingClientRect().top ?? 0
      // Результат всегда к верху экрана; между вопросами — только если блок ушёл вверх
      if (state.screen === 'result' || top < 0) root.current?.scrollIntoView({ block: 'start' })
    }
  }, [state.screen, state.index])

  useEffect(() => {
    if (state.screen === 'result') reachGoal(METRIKA_GOALS.testComplete, scale.slug)
  }, [state.screen, scale.slug])

  function start() {
    reachGoal(METRIKA_GOALS.testStart, scale.slug)
    dispatch({ type: 'start' })
  }

  function choose(value: number) {
    window.clearTimeout(timer.current)
    dispatch({ type: 'answer', id: item.id, value })
    timer.current = window.setTimeout(() => dispatch({ type: 'next' }), ADVANCE_MS)
  }

  if (state.screen === 'intro') {
    return (
      <div className="trun trun--intro ym-hide-content" ref={root}>
        <button type="button" className="btn btn--primary btn--lg" onClick={start}>
          Начать тест
        </button>
        <p className="trun__intro-meta">
          Около {scale.minutes} мин · можно вернуться к предыдущему вопросу
        </p>
        <noscript>
          <p className="trun__noscript">Чтобы пройти тест, включи JavaScript: подсчёт идёт прямо в браузере.</p>
        </noscript>
      </div>
    )
  }

  if (state.screen === 'result') {
    const result = score(scale, state.answers)
    return (
      <div className="trun ym-hide-content" ref={root}>
        {result.ok ? (
          <TestResult scale={scale} result={result} onRestart={() => dispatch({ type: 'restart' })} />
        ) : (
          <p className="trun__error">
            Не все вопросы отвечены. <button type="button" className="trun__link" onClick={() => dispatch({ type: 'back' })}>Вернуться к вопросам</button>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="trun ym-hide-content" ref={root}>
      <div className="trun__progress" aria-hidden="true">
        <div className="trun__progress-bar" style={{ transform: `scaleX(${(number - 1) / questions})` }} />
      </div>
      <p className="trun__count">
        Вопрос {number} из {questions}
        {isExtra && <span className="trun__frame"> · уточнение</span>}
        {scale.timeframe && <span className="trun__frame"> · {scale.timeframe}</span>}
      </p>

      <div className="trun__q" key={item.id}>
        {part && (
          <div className="trun__part">
            {scale.parts.length > 1 && <p className="trun__part-title">{part.title}</p>}
            <p>{part.online ?? part.instruction}</p>
          </div>
        )}

        <h2 className="trun__text" tabIndex={-1} ref={heading} id={`q-${item.id}`}>
          {/* У пунктов Бека нет вопроса — только набор утверждений */}
          {item.text || 'Выбери утверждение, которое лучше всего описывает твоё состояние'}
        </h2>
        {item.hint && <p className="trun__hint">{item.hint}</p>}

        <div className="trun__options" role="radiogroup" aria-labelledby={`q-${item.id}`}>
          {item.options.map((o) => (
            <button
              type="button"
              role="radio"
              aria-checked={answered === o.value}
              className={answered === o.value ? 'trun__option is-checked' : 'trun__option'}
              key={o.value}
              onClick={() => choose(o.value)}
            >
              <span className="trun__radio" aria-hidden="true" />
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="trun__nav">
        <button
          type="button"
          className="trun__back"
          onClick={() => {
            window.clearTimeout(timer.current)
            dispatch({ type: 'back' })
          }}
          disabled={state.index === 0}
        >
          ← Назад
        </button>
        {answered !== undefined && (
          <button
            type="button"
            className="trun__next"
            onClick={() => {
              window.clearTimeout(timer.current)
              dispatch({ type: 'next' })
            }}
          >
            {state.index === total - 1 ? 'К результату' : 'Дальше'} →
          </button>
        )}
      </div>
    </div>
  )
}
