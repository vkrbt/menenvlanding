'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { BOT_URL } from '@/lib/bot-link'
import { startPhrase } from '@/lib/group'
import { BLOCK_SIZE, GROUP_MEETINGS, MEETING_TIME, PRICE_BLOCK, PRICE_PROGRAM, PRICE_SINGLE, SITE_URL } from '@/lib/site'

/** Ключ в localStorage. Поменять суффикс, если пункты «ок» переставлены и старые отметки собьются */
const STORAGE_KEY = 'interview-checklist-v2'
const NAME_KEY = 'interview-checklist-name'

/** Неразрывные пробелы из MEETING_TIME в сообщении не нужны: мессенджер переносит сам */
const TIME = MEETING_TIME.replace(/\u00A0/g, ' ')
const PRICES = `€${PRICE_PROGRAM} за всю программу, €${PRICE_BLOCK} за блок из ${BLOCK_SIZE} встреч или €${PRICE_SINGLE} за встречу`
const RECRUITMENT_ENDS = '15 ноября'
const SITE = SITE_URL.replace('https://', '')

const afterCallMessage = (name: string) =>
  `${name}, спасибо за разговор! Коротко: старт в среду, ${startPhrase()}, в ${TIME}, дальше раз в две недели. ` +
  `Место за тобой после первой оплаты: ${PRICES}. Оплатить можно в боте: ${BOT_URL}. ` +
  `Всё про группу — на ${SITE}. Набор закрывается ${RECRUITMENT_ENDS}. Если остались вопросы, пиши.`

const waitlistMessage = (name: string) =>
  `Привет, ${name}! Набор в «Мужскую среду» закрывается в воскресенье, ${RECRUITMENT_ENDS}, первая встреча ${startPhrase()}. ` +
  'Место ещё есть, если хочешь. Если решил не сейчас, это нормально, позову в следующую группу.'

type Step = {
  title: string
  minutes: string
  quotes: string[]
  /** Короткие вопросы в две колонки — только у скрининга */
  list?: string[]
  facts?: string
  /** Вывод, который нельзя пропустить: подсвечен цветом */
  alert?: string
  hint?: string
  tone?: 'alert' | 'final'
}

const STEPS: Step[] = [
  {
    title: 'Рамка',
    minutes: '1 мин',
    quotes: ['«Задача — понять, подходит ли тебе группа, а ты ей. Сказать „не моё“ — нормальный исход»'],
    hint: 'Снять напряжение и оставить себе право отказать',
  },
  {
    title: 'Что привело',
    minutes: '3–4 мин',
    quotes: ['«Что тебя привело? Почему именно сейчас?»'],
    hint: 'Если общо: что конкретно происходит · как давно · что уже пробовал',
  },
  {
    title: 'Как ты сейчас',
    minutes: '3 мин',
    quotes: ['«Расскажи коротко о себе. Как ты сейчас, от 1 до 10?»'],
    hint: 'Смотрим: может ли говорить о себе · слышит ли вопросы · не винит ли во всём других',
  },
  {
    title: 'Скрининг безопасности',
    minutes: '2 мин',
    quotes: ['«Несколько вопросов, которые задаём всем — для безопасности группы»'],
    list: [
      'Диагнозы, препараты?',
      'Тяжёлое за полгода: потеря, развод, увольнение?',
      'Алкоголь, вещества — управляют днём?',
      'Бывали мысли не жить? (прямо и спокойно)',
    ],
    alert: 'Остро → сначала индивидуальная помощь, группа потом',
    tone: 'alert',
  },
  {
    title: 'Опыт и ожидания',
    minutes: '2 мин',
    quotes: [
      '«Был у психолога или в группах?»',
      `«Что должно произойти, чтобы через ${GROUP_MEETINGS} встреч ты сказал „не зря“?»`,
    ],
    hint: 'Ждёт советов или хочет «исправить» другого → честно сказать, что группа про другое',
  },
  {
    title: 'Группа — через его слова',
    minutes: '4–5 мин',
    quotes: ['«Ты сказал [его слова] — об этом у нас встреча [номер]»'],
    facts:
      `Тематическая, для старта · ${GROUP_MEETINGS} встреч · среды раз в 2 недели · ${TIME} · 3 часа · ` +
      'подкаст к каждой · тема → разговор → обмен, без советов',
    hint: 'Условия и правила — по одному, с «ок?» после каждого (карточка «Получить „ок“»)',
  },
  {
    title: 'Что может помешать',
    minutes: '2 мин',
    quotes: [`«Что может помешать тебе прийти и ходить все ${GROUP_MEETINGS} встреч?»`],
    hint: 'Вместо «есть вопросы?» — так всплывают деньги, график, страх, «жена не поймёт»',
  },
  {
    title: 'Решение',
    minutes: '2 мин',
    quotes: ['«Мне кажется, тебе в группе будет хорошо — и нам с тобой тоже. Идёшь?»'],
    tone: 'final',
  },
]

const OUTCOMES = [
  {
    title: 'Да',
    quote: `«Сразу за все ${GROUP_MEETINGS} или блоками по ${BLOCK_SIZE}?»`,
    hint: 'Ссылка на оплату · «Место держу до [день]»',
  },
  {
    title: '«Подумаю»',
    quote: '«Что именно хочешь обдумать?»',
    hint: 'Снять сомнение сейчас · или договориться о дне ответа',
  },
  {
    title: 'Не подходит',
    quote: '«Сейчас тебе больше поможет [индивидуальная работа / врач]»',
    hint: 'Подсказать, куда обратиться · в группу можно вернуться позже',
  },
]

/** Условия группы: по одному, после каждого ждём «ок» и отмечаем */
const OKS = [
  { text: '3 часа в тихом месте, с компьютера, камера и звук включены, трезвым.', ask: 'Получится по средам?' },
  { text: 'Все встречи — в приоритете, пропуск оплачивается.', ask: 'Ок?' },
  { text: 'Решишь уйти — приходишь попрощаться, не пропадаешь.', ask: 'Договорились?' },
  { text: 'Насколько открываться — решаешь сам, тянуть никто не будет.', ask: '' },
]

const RED_FLAGS = [
  'Острый кризис: недавняя потеря, развод, мысли не жить',
  'Алкоголь или вещества управляют жизнью',
  'Ждёт советов и решений вместо разговора',
  'Цель — «исправить» жену, начальника, родителей',
  'Перебивает, не слышит вопросов — три часа слушать других не сможет',
]

const OBJECTIONS = [
  {
    q: '«Не умею говорить о чувствах»',
    a: 'Половина группы скажет то же на первой встрече. Достаточно говорить о том, что происходит.',
  },
  {
    q: '«Дорого»',
    a:
      `Встреча 3 часа — по цене часа у психолога: €${PRICE_PROGRAM / GROUP_MEETINGS} при оплате всей программы. ` +
      `Можно блоками по ${BLOCK_SIZE} (€${PRICE_BLOCK}) или по одной (€${PRICE_SINGLE}).`,
  },
  { q: '«Вдруг там знакомый»', a: 'Конфиденциальность: что было на встрече — остаётся на встрече.' },
]

export default function InterviewChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [name, setName] = useState('')
  const [loaded, setLoaded] = useState(false)

  // Отметки и имя переживают перезагрузку, чтобы случайно закрытая вкладка не сбила разговор
  useEffect(() => {
    try {
      setChecked(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'))
      setName(localStorage.getItem(NAME_KEY) ?? '')
    } catch {
      // битое значение — начинаем с чистого листа
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    localStorage.setItem(NAME_KEY, name)
  }, [checked, name, loaded])

  const who = name.trim() || '[имя]'

  function reset() {
    const dirty = name !== '' || Object.values(checked).some(Boolean)
    if (dirty && !window.confirm('Снять отметки и стереть имя?')) return
    setChecked({})
    setName('')
  }

  return (
    <div className="interview">
      <div className="interview__bar">
        <label className="interview__name">
          <span>Имя кандидата</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="подставится в сообщения"
            autoComplete="off"
          />
        </label>
        <button className="btn btn--outline btn--sm" type="button" onClick={reset}>
          Новый кандидат
        </button>
      </div>

      <div className="interview__layout">
        <div className="interview__flow">
          {STEPS.map((s, i) => (
            <Fragment key={s.title}>
              {i > 0 && (
                <div className="interview__arrow" aria-hidden="true">
                  ↓
                </div>
              )}
              <section className={s.tone ? `interview__step interview__step--${s.tone}` : 'interview__step'}>
                <header>
                  <span className="interview__num">{i + 1}</span>
                  <h2>{s.title}</h2>
                  <span className="interview__min">{s.minutes}</span>
                </header>
                {s.quotes.map((q) => (
                  <p className="interview__quote" key={q}>
                    {q}
                  </p>
                ))}
                {s.list && (
                  <ul className="interview__list">
                    {s.list.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                )}
                {s.facts && <p className="interview__facts">{s.facts}</p>}
                {s.alert && <p className="interview__alert">{s.alert}</p>}
                {s.hint && <p className="interview__hint">{s.hint}</p>}
              </section>
            </Fragment>
          ))}

          <div className="interview__arrow" aria-hidden="true">
            ↙ ↓ ↘
          </div>
          <div className="interview__outcomes">
            {OUTCOMES.map((o) => (
              <section className="interview__outcome" key={o.title}>
                <h3>{o.title}</h3>
                <p className="interview__quote">{o.quote}</p>
                <p className="interview__hint">{o.hint}</p>
              </section>
            ))}
          </div>
        </div>

        <aside className="interview__side">
          <section className="interview__card">
            <h2 className="interview__label">Блок 6 · получить «ок» на каждое</h2>
            <ul className="interview__oks">
              {OKS.map((o, i) => {
                const id = `ok-${i}`
                return (
                  <li key={id} className={checked[id] ? 'is-done' : undefined}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!checked[id]}
                        onChange={(e) => setChecked((c) => ({ ...c, [id]: e.target.checked }))}
                      />
                      <span>
                        {o.text} {o.ask && <b>{o.ask}</b>}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <p className="interview__hint">Замялся на пункте — разберитесь сейчас, до оплаты</p>
          </section>

          <section className="interview__card interview__card--alert">
            <h2 className="interview__label">Красные флаги</h2>
            <ul className="interview__dots">
              {RED_FLAGS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>

          <section className="interview__card">
            <h2 className="interview__label">Частые возражения</h2>
            {OBJECTIONS.map((o) => (
              <div className="interview__objection" key={o.q}>
                <b>{o.q}</b>
                <p>{o.a}</p>
              </div>
            ))}
          </section>

          <section className="interview__card interview__card--muted">
            <h2 className="interview__label">После знакомства · в тот же день</h2>
            <p>
              <b>Ему:</b> резюме договорённостей + ссылка на оплату + сайт
            </p>
            <MessageBox text={afterCallMessage(who)} />
            <p>
              <b>Себе, 3 строки:</b> запрос · цель его словами · сомнения
            </p>
            <p>
              <b>Сказал «подумаю»</b> и пропал — ближе к концу набора:
            </p>
            <MessageBox text={waitlistMessage(who)} />
          </section>
        </aside>
      </div>
    </div>
  )
}

function MessageBox({ text }: { text: string }) {
  const content = useRef<HTMLParagraphElement>(null)
  const [status, setStatus] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Скопировано ✓')
    } catch {
      // Без доступа к буферу — выделяем текст, чтобы скопировать вручную
      const selection = window.getSelection()
      if (content.current && selection) {
        const range = document.createRange()
        range.selectNodeContents(content.current)
        selection.removeAllRanges()
        selection.addRange(range)
        setStatus('Текст выделен — нажми ⌘C или Ctrl+C')
      }
    }
  }

  return (
    <div className="interview__message">
      <p ref={content}>{text}</p>
      <div className="interview__message-foot">
        <button className="btn btn--outline btn--sm" type="button" onClick={copy}>
          Скопировать текст
        </button>
        <span role="status">{status}</span>
      </div>
    </div>
  )
}
