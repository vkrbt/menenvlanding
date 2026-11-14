'use client'

import { useState } from 'react'
import { FORMS_URL, METRIKA_COUNTER_ID, METRIKA_GOALS, TESTS_URL } from '@/lib/site'

/**
 * Короткий тест на странице /v2: пять вопросов, три исхода. Не диагностика и не шкала —
 * это крючок для сомневающихся. Ответы живут только в памяти компонента, в Метрику уходит
 * только факт начала и конца (без ответов), как у остальных тестов сайта.
 */

const SLUG = 'v2-quiz'

const QUESTIONS: Array<{ q: string; a: string[] }> = [
  {
    q: 'Тебя спрашивают «как дела?». Что отвечаешь?',
    a: ['«Нормально». Всегда «нормально»', 'По-разному, но обычно честно', 'Расскажу, как есть. Если спросит свой человек'],
  },
  {
    q: 'Когда тебе по-настоящему хреново, ты…',
    a: ['Иду в зал, на работу или в телефон', 'Пишу другу, но всё равно не договариваю', 'Говорю с тем, кому можно доверять'],
  },
  {
    q: 'Сколько мужиков знают, что у тебя реально на душе?',
    a: ['Ноль', 'Один, и то не всё', 'Двое-трое'],
  },
  {
    q: 'Слово «психолог» вызывает у тебя…',
    a: ['«Я что, псих?»', '«Наверное, полезно. Но не сейчас»', '«Нормально, сам ходил или хочу»'],
  },
  {
    q: 'Последний раз ты говорил с мужиком о чём-то, кроме работы, тачек и футбола…',
    a: ['Не помню', 'Пару месяцев назад', 'На прошлой неделе'],
  },
]

type Outcome = { mood: string; name: string; title: string; text: string; cta: boolean; meme: string; top: string; bottom: string }

/** Исход теста: кто ты, плюс мем-картинка (кадр нарисован нами, подписи Lobster впечатаны в картинку) */
function outcome(score: number): Outcome {
  if (score >= 7) {
    return {
      mood: 'nod',
      name: 'одинокий волк',
      title: 'Ты тащишь всё сам',
      meme: '/v2/lob-wolf.jpg',
      top: 'Волк слабее льва и тигра',
      bottom: 'Но он ходит в стае',
      text: 'Ты тащишь всё один, а «нормально» у тебя давно не про самочувствие. Таких мужиков много, и группа сделана ровно для них: девять встреч, десять человек, двое ведущих.',
      cta: true,
    }
  }
  if (score >= 4) {
    return {
      mood: 'grin',
      name: 'тигр в клетке',
      title: 'Сила есть, а наружу не выходит',
      meme: '/v2/lob-tiger.jpg',
      top: 'Тигр не выступает в цирке',
      bottom: 'Но и из клетки не выходит',
      text: 'С мужиками ты говоришь, но про главное молчишь. Что-то проговариваешь, а остальное держишь в себе, и оно рычит изнутри. Приходи на бесплатный созвон на 10–15 минут. Не зайдёт, так и скажешь.',
      cta: true,
    }
  }
  return {
    mood: 'sigh',
    name: 'вожак стаи',
    title: 'У тебя есть свои люди',
    meme: '/v2/lob-pack.jpg',
    top: 'Утром йога',
    bottom: 'Вечером с братьями',
    text: 'С тобой есть кому поговорить по-настоящему, это редкость. Если захочется глубже, загляни в наш большой тест про то, о чём мужчины молчат.',
    cta: false,
  }
}

function reachGoal(goal: string) {
  const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym
  ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, { test: SLUG })
}

export default function QuizV2() {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const done = started && step >= QUESTIONS.length

  function answer(i: number) {
    // варианты идут от «хуже» к «лучше», поэтому вес обратный
    const next = score + (2 - i)
    setScore(next)
    setStep(step + 1)
    if (step + 1 >= QUESTIONS.length) reachGoal(METRIKA_GOALS.testComplete)
  }

  function reset() {
    setStep(0)
    setScore(0)
    setStarted(false)
  }

  if (!started) {
    return (
      <div className="v2-quiz">
        <img className="v2-quiz__face" src="/v2/bust.webp" alt="" width={700} height={1114} />
        <div>
          <p className="v2-quiz__lead">Не уверен, что тебе в группу? Пять вопросов, и узнаешь, кто ты.</p>
          <button
            type="button"
            className="v2-btn v2-btn--red"
            onClick={() => {
              setStarted(true)
              reachGoal(METRIKA_GOALS.testStart)
              // мемы грузим заранее, чтобы в результате картинка была сразу
              ;['wolf', 'tiger', 'pack'].forEach((m) => { new Image().src = `/v2/lob-${m}.jpg` })
            }}
          >
            Пройти тест
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    const o = outcome(score)
    return (
      <div className="v2-quiz v2-quiz--result" aria-live="polite">
        <figure className="v2-meme">
          <img src={o.meme} alt={`Мем: «${o.top}. ${o.bottom}»`} width={900} height={900} />
        </figure>
        <div>
          <h3 className="v2-quiz__title">Ты — {o.name}</h3>
          <p className="v2-quiz__sub">{o.title}</p>
          <p className="v2-quiz__lead">{o.text}</p>
          <div className="v2-quiz__actions">
            {o.cta ? (
              <a href={FORMS_URL} className="v2-btn v2-btn--red">Занять место в группе</a>
            ) : (
              <a href={`${TESTS_URL}/pogovorit-ne-s-kem`} className="v2-btn v2-btn--red">Большой тест</a>
            )}
            <button type="button" className="v2-btn v2-btn--ghost" onClick={reset}>Пройти заново</button>
          </div>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[step]
  return (
    <div className="v2-quiz v2-quiz--q">
      <div className="v2-quiz__bar" aria-hidden="true">
        <span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="v2-quiz__count">Вопрос {step + 1} из {QUESTIONS.length}</p>
      <h3 className="v2-quiz__q">{q.q}</h3>
      <ul className="v2-quiz__opts">
        {q.a.map((a, i) => (
          <li key={a}>
            <button type="button" className="v2-opt" onClick={() => answer(i)}>{a}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
