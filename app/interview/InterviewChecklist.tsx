'use client'

import { useEffect, useRef, useState } from 'react'
import { BOT_URL } from '@/lib/bot-link'
import { startPhrase } from '@/lib/group'
import { BLOCK_SIZE, GROUP_MEETINGS, MEETING_TIME, PRICE_BLOCK, PRICE_PROGRAM, PRICE_SINGLE } from '@/lib/site'

/** Ключ в localStorage. Поменять суффикс, если пункты переставлены и старые отметки собьются */
const STORAGE_KEY = 'interview-checklist-v1'
const NAME_KEY = 'interview-checklist-name'

/** Неразрывные пробелы из MEETING_TIME в сообщении не нужны: мессенджер переносит сам */
const TIME = MEETING_TIME.replace(/\u00A0/g, ' ')
const PRICES = `€${PRICE_PROGRAM} за всю программу, €${PRICE_BLOCK} за блок из ${BLOCK_SIZE} встреч или €${PRICE_SINGLE} за встречу`
const RECRUITMENT_ENDS = '15 ноября'

type Item = { text: string; hint?: string; message?: (name: string) => string }
type Group = { title: string; items: Item[] }
type Section = { id: string; title: string; note?: string; groups: Group[] }

const afterCallMessage = (name: string) =>
  `${name}, спасибо за разговор! Коротко: старт в среду, ${startPhrase()}, в ${TIME}, дальше раз в две недели. ` +
  `Место за тобой после первой оплаты: ${PRICES}. Оплатить можно в боте: ${BOT_URL}. ` +
  `Набор закрывается ${RECRUITMENT_ENDS}. Если остались вопросы, пиши.`

const waitlistMessage = (name: string) =>
  `Привет, ${name}! Набор в «Мужскую среду» закрывается в воскресенье, ${RECRUITMENT_ENDS}, первая встреча ${startPhrase()}. ` +
  'Место ещё есть, если хочешь. Если решил не сейчас, это нормально, позову в следующую группу.'

const SECTIONS: Section[] = [
  {
    id: 'before',
    title: 'Перед звонком',
    groups: [
      {
        title: '',
        items: [
          { text: 'Перечитать заявку: имя, город, UTM-метка' },
          { text: 'Решить, кто ведёт разговор, Влад или Женя, или оба' },
          { text: 'Держать под рукой контакт, куда направить, если группа не подходит (индивидуальный психолог, нарколог)' },
        ],
      },
    ],
  },
  {
    id: 'questions',
    title: 'Вопросы по порядку',
    groups: [
      {
        title: '1. Снять напряжение',
        items: [
          { text: '«Это не экзамен. Хочу понять, что тебя привело, и рассказать, как всё устроено»' },
          { text: '«Как ты сейчас, нормально так разговаривать?»', hint: 'Смотрим, как он держится в разговоре с незнакомым' },
        ],
      },
      {
        title: '2. Что привело',
        items: [
          { text: '«Что сейчас происходит в жизни?»' },
          { text: '«Почему решил написать именно сейчас?»' },
          { text: '«Сам решил или кто-то посоветовал?»', hint: 'Если «жена сказала, иначе уйдёт», прояснить, чего хочет он сам' },
        ],
      },
      {
        title: '3. Чего ждёт',
        items: [
          { text: `«Что должно случиться, чтобы через ${GROUP_MEETINGS} встреч ты сказал: не зря ходил?»` },
          { text: '«Что ты готов поменять в себе?»' },
          { text: 'Помочь сформулировать 1–2 темы, с которыми он придёт на первую встречу', hint: 'Чем конкретнее, тем лучше' },
        ],
      },
      {
        title: '4. Опыт',
        items: [
          { text: '«Был у психолога или в группе? Как это было, что дало?»' },
          { text: 'Если опыт плохой, расспросить, что именно не понравилось' },
        ],
      },
      {
        title: '5. Близкие люди',
        items: [
          {
            text: '«Есть рядом кто-то, с кем ты регулярно общаешься: жена, друг, брат, терапевт?»',
            hint: 'Нужна хотя бы одна долгая связь',
          },
        ],
      },
      {
        title: '6. Отсечка, спросить прямо',
        items: [
          { text: '«Не было ли за последние полгода чего-то тяжёлого: развод, смерть близкого, увольнение, переезд?»' },
          { text: '«Бывают мысли не жить?»' },
          { text: '«Нет ли того, что пьёшь, употребляешь или играешь так, что это уже управляет жизнью?»' },
          { text: '«Сейчас лечишься у врача? Нет ли такого, что группа должна заменить лечение?»' },
        ],
      },
      {
        title: '7. Формат и рамки',
        items: [
          { text: 'Рассказать: тема каждой встречи известна заранее, говоришь сколько хочешь, советов и оценок никто не раздаёт' },
          {
            text: 'Онлайн: камера и звук включены, ничего параллельно не делаем',
            hint: 'Особенно проговорить с айтишниками, у них привычка выключаться на созвонах',
          },
          { text: `«Получится ходить все ${GROUP_MEETINGS} встреч, раз в две недели по средам?»`, hint: 'Командировки, дети, смены' },
          { text: `Время: ${TIME}`, hint: 'Если он в другом поясе, вместе пересчитать на его время' },
          { text: 'Пропуск оплачивается, на встречи приходим без опозданий' },
          { text: `Цена: €${PRICE_PROGRAM} за всю программу, €${PRICE_BLOCK} за ${BLOCK_SIZE} встречи, €${PRICE_SINGLE} за одну. «Тебе это комфортно по деньгам?»` },
        ],
      },
      {
        title: '8. Вопросы и следующий шаг',
        items: [
          { text: '«Что ещё хочешь спросить?»' },
          { text: '«Если подходит, место за тобой после первой оплаты. Ссылку пришлю сегодня»' },
          { text: '«Кстати, откуда ты о нас узнал?»', hint: 'Записать' },
        ],
      },
    ],
  },
  {
    id: 'stop',
    title: 'На что смотреть по ходу',
    note: 'Если что-то насторожило, не пропускаем, задаём ещё пару вопросов на эту тему. Правило из лекции: если что-то будет напрягать, не берём. Один неподходящий участник может развалить группу.',
    groups: [
      {
        title: 'Не берём — честно говорим, что группа сейчас не подходит, и подсказываем, куда обратиться',
        items: [
          { text: 'Острый кризис: развод меньше полугода назад, утрата, увольнение или переезд меньше 3 месяцев назад' },
          { text: 'Мысли о суициде' },
          { text: 'Активная зависимость: алкоголь, наркотики, ставки' },
          { text: 'Группа вместо лечения у врача или вместо юриста' },
          { text: 'Явное расстройство личности, грубые нарушения мышления и речи' },
        ],
      },
      {
        title: 'Думаем вдвоём после звонка',
        items: [
          { text: '«Постараюсь ходить», частые командировки' },
          { text: 'Платит не он сам, или деньги впритык' },
          { text: 'Пришёл не сам, мотивация непонятная' },
          { text: 'В группе уже есть его родственник, друг, коллега или начальник' },
          { text: 'Сильно выделяется среди остальных: возраст, взгляды, ситуация' },
          { text: 'Любит доказывать свою правоту, тянет разговор на себя' },
          { text: 'Не слышит рамки: спорит про оплату пропусков, опоздал на сам звонок' },
          { text: 'Держится за нереальные ожидания и не готов их переформулировать' },
          { text: 'Очень неприятен или, наоборот, очень симпатичен ведущему' },
        ],
      },
    ],
  },
  {
    id: 'after',
    title: 'После звонка',
    groups: [
      {
        title: '',
        items: [
          { text: 'В тот же день отправить сообщение с итогом и ссылкой на оплату', message: afterCallMessage },
          { text: 'Если сомневается, не уговаривать: «Подумай до выходных, в пятницу напишу»' },
          { text: 'Не готов — в лист ожидания, 12–13 ноября написать ещё раз', message: waitlistMessage },
          { text: 'Записать: откуда узнал, его темы на первую встречу, что насторожило' },
        ],
      },
    ],
  },
]

const itemId = (s: Section, gi: number, ii: number) => `${s.id}-${gi}-${ii}`
const TOTAL = SECTIONS.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0), 0)

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

  const done = Object.values(checked).filter(Boolean).length

  function reset() {
    if (done > 0 && !window.confirm('Снять все отметки и стереть имя?')) return
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
        <span className="interview__progress">
          {done} из {TOTAL}
        </span>
        <button className="btn btn--outline btn--sm" type="button" onClick={reset}>
          Новый кандидат
        </button>
      </div>

      {SECTIONS.map((s) => (
        <section className="interview__section" key={s.id}>
          <h2>{s.title}</h2>
          {s.note && <p className="interview__note">{s.note}</p>}
          {s.groups.map((g, gi) => (
            <div className="interview__group" key={gi}>
              {g.title && <h3>{g.title}</h3>}
              <ul>
                {g.items.map((item, ii) => {
                  const id = itemId(s, gi, ii)
                  return (
                    <li key={id} className={checked[id] ? 'is-done' : undefined}>
                      <label className="interview__item">
                        <input
                          type="checkbox"
                          checked={!!checked[id]}
                          onChange={(e) => setChecked((c) => ({ ...c, [id]: e.target.checked }))}
                        />
                        <span>
                          {item.text}
                          {item.hint && <small>{item.hint}</small>}
                        </span>
                      </label>
                      {item.message && <MessageBox text={item.message(name.trim() || '[имя]')} />}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
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
