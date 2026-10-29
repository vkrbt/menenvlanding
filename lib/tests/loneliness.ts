/**
 * Авторский тест «Друзья есть. А поговорить не с кем?» (тексты — Женя).
 * Типологический: две шкалы (близость и компания) дают один из четырёх
 * типов, вторая часть — список тем, о которых человек молчит. В модель
 * Scale не ложится, поэтому логика своя; страница — app/tests/pogovorit-ne-s-kem.
 *
 * Модуль импортируется и Next, и `node --test`, поэтому без алиаса `@/`
 * и без импорта lib/group.ts (у того импорт без расширения): даты встреч
 * подставляет компонент.
 */

export const LONELINESS_SLUG = 'pogovorit-ne-s-kem'

/** Шкала согласия. Значение 0..4 = «сколько нехватки» для прямых утверждений */
export const AGREE: Array<[string, number]> = [
  ['Точно да', 4],
  ['Скорее да', 3],
  ['Отчасти', 2],
  ['Скорее нет', 1],
  ['Точно нет', 0],
]

export type Axis = 'E' | 'S'

/** Часть 1. E — близость, S — компания. rev: «позитивное» утверждение, считается наоборот */
export const PART1: Array<{ ax: Axis; rev: boolean; t: string }> = [
  { ax: 'E', rev: true, t: 'Есть человек, которому я могу рассказать, что со мной на самом деле происходит.' },
  { ax: 'S', rev: true, t: 'У меня есть компания, с которой я регулярно вижусь вживую.' },
  { ax: 'E', rev: false, t: 'Даже когда вокруг люди, внутри ощущение, что я сам по себе.' },
  { ax: 'S', rev: false, t: 'Мой круг общения за последние годы заметно сузился.' },
  { ax: 'E', rev: false, t: 'Когда мне плохо, я разбираюсь с этим сам и никому не говорю.' },
  { ax: 'S', rev: true, t: 'Если захочу провести вечер с друзьями, мне есть кому написать.' },
  { ax: 'E', rev: true, t: 'Хотя бы один человек знает меня по-настоящему, не только с хорошей стороны.' },
  { ax: 'S', rev: false, t: 'Мне не хватает мужской компании.' },
  { ax: 'E', rev: false, t: 'Мне не хватает человека, с которым можно говорить без масок.' },
  { ax: 'S', rev: true, t: 'Я чувствую себя частью какой-то компании или сообщества.' },
]

export type Who = 'n' | 'p' | 'f' | 'm' | 't'

/** Уточняющий вопрос: с кем говоришь о важном */
export const WHO: { t: string; o: Array<[string, Who]> } = {
  t: 'С кем ты обычно говоришь о том, что тебя по-настоящему волнует?',
  o: [
    ['Ни с кем, держу в себе', 'n'],
    ['Только с партнёршей', 'p'],
    ['С одним-двумя друзьями', 'f'],
    ['С несколькими людьми', 'm'],
    ['С психологом', 't'],
  ],
}

export type TopicCode = 'M' | 'R' | 'Z' | 'G' | 'K' | 'O' | 'P'

export type Topic = {
  c: TopicCode
  name: string
  /** Хвост вопроса: «Есть ли человек, с кем ты можешь честно поговорить …?» */
  q: string
  /** Номер встречи группы, где это тема (1 — знакомство) */
  meet: number
  title: string
}

/** Часть 2. Темы привязаны к встречам программы; даты считает страница по старту группы */
export const TOPICS: Topic[] = [
  { c: 'M', name: 'Работа и деньги', q: 'о работе и деньгах — где буксуешь, чего боишься, сколько на самом деле зарабатываешь', meet: 2, title: 'Дело и деньги' },
  { c: 'R', name: 'Отношения', q: 'о том, что на самом деле происходит у тебя в отношениях', meet: 3, title: 'Отношения' },
  { c: 'Z', name: 'Чем ты себя глушишь', q: 'о том, чем ты себя глушишь: алкоголь, телефон, работа, спорт до изнеможения', meet: 4, title: 'Зависимости' },
  { c: 'G', name: 'Злость', q: 'о своей злости — на кого и за что', meet: 5, title: 'Конкуренция, конфликты и агрессия' },
  { c: 'K', name: 'Детство', q: 'о своём детстве и о том, что ты оттуда вынес', meet: 6, title: 'Детство' },
  { c: 'O', name: 'Мама', q: 'о маме и ваших отношениях сейчас', meet: 7, title: 'Мама' },
  { c: 'P', name: 'Отец', q: 'об отце — каким он был и каким из-за этого стал ты', meet: 8, title: 'Папа' },
]

/** Ответы части 2: 'ok' говорю; 'b' есть с кем, но молчу (барьер); 'a' не с кем (отсутствие) */
export type Talk = 'ok' | 'b' | 'a'
export const TALK: Array<[string, Talk]> = [
  ['Да, и говорю', 'ok'],
  ['Есть с кем, но не говорю', 'b'],
  ['Не с кем', 'a'],
]

export type Question =
  | { kind: 'agree'; part: 1; ax: Axis; rev: boolean; text: string; opts: Array<[string, number]> }
  | { kind: 'who'; part: 1; text: string; opts: Array<[string, Who]> }
  | { kind: 'topic'; part: 2; topic: Topic; text: string; opts: Array<[string, Talk]> }

export const QUESTIONS: Question[] = [
  ...PART1.map((q): Question => ({ kind: 'agree', part: 1, ax: q.ax, rev: q.rev, text: q.t, opts: AGREE })),
  { kind: 'who', part: 1, text: WHO.t, opts: WHO.o },
  ...TOPICS.map((t): Question => ({
    kind: 'topic',
    part: 2,
    topic: t,
    text: `Есть ли человек, с кем ты можешь честно поговорить ${t.q}?`,
    opts: TALK,
  })),
]

export type TypeId = 'A' | 'B' | 'C' | 'D'

export const TYPES: Record<TypeId, { title: string; text: string }> = {
  A: {
    title: 'Свои люди есть',
    text: 'У тебя есть и компания, и хотя бы один человек, с которым можно говорить честно. После тридцати это есть далеко не у всех мужчин. Если в списке ниже всё же есть темы, которые ты держишь при себе, присмотрись к ним: иногда молчат просто по привычке.',
  },
  B: {
    title: 'Друзья есть, поговорить не с кем',
    text: 'Людей вокруг хватает: работа, пацаны, созвоны, чаты. Разговоры идут про дела, тачки и новости, а то, что действительно грызёт, остаётся при тебе. Снаружи всё выглядит нормально, и так живёт огромное количество мужчин. Цена у этого есть: всё, что не проговорено, потом вылезает раздражением, усталостью и плохим сном.',
  },
  C: {
    title: 'Всё держится на одном человеке',
    text: 'Человек, с которым можно поговорить по-настоящему, у тебя есть. А своего круга почти нет. Пока всё спокойно, это работает. Но когда на одного человека ложится всё — поддержка, разговоры, твои загоны, — отношения начинают проседать под этим весом. А если вы поссорились, поговорить становится не с кем совсем.',
  },
  D: {
    title: 'Один на один с собой',
    text: 'Сейчас рядом почти нет ни компании, ни человека, с которым можно говорить честно. Так бывает после переезда, развода, смены работы. А бывает постепенно: люди отваливаются по одному, и однажды замечаешь, что звонить некому. Само это обычно не рассасывается. Начать можно с малого — с одного настоящего разговора.',
  },
}

/** Добавка к тексту типа, если всё важное — только с партнёршей (кроме типа C, где это и так сказано) */
export const PARTNER_ONLY =
  ' И ещё: всё важное ты обсуждаешь только с партнёршей. Это хорошо, что она есть, но одному человеку тяжело быть для тебя всеми сразу.'

export const THRESHOLD = 50

export type SilentTopic = Topic & { kind: 'b' | 'a' }

export type LonelinessResult = {
  /** Нехватка близости, 0–100 */
  e: number
  /** Нехватка компании, 0–100 */
  s: number
  who: Who
  type: TypeId
  silent: SilentTopic[]
}

/**
 * Ответы — индексы вариантов по порядку QUESTIONS (как в исходном HTML).
 * Неотвеченный вопрос — ошибка: страница считает только полный набор.
 */
export function compute(answers: Array<number | null | undefined>): LonelinessResult {
  if (answers.length !== QUESTIONS.length) throw new Error(`ожидалось ${QUESTIONS.length} ответов, пришло ${answers.length}`)
  const sum = { E: 0, S: 0 }
  const cnt = { E: 0, S: 0 }
  let who: Who = 'n'
  const silent: SilentTopic[] = []
  QUESTIONS.forEach((q, i) => {
    const a = answers[i]
    if (a == null || !q.opts[a]) throw new Error(`нет ответа на вопрос ${i + 1}`)
    if (q.kind === 'agree') {
      let v = q.opts[a][1]
      if (q.rev) v = 4 - v
      sum[q.ax] += v
      cnt[q.ax]++
    } else if (q.kind === 'who') {
      who = q.opts[a][1]
    } else {
      const kind = q.opts[a][1]
      if (kind !== 'ok') silent.push({ ...q.topic, kind })
    }
  })
  const e = Math.round((sum.E / (cnt.E * 4)) * 100)
  const s = Math.round((sum.S / (cnt.S * 4)) * 100)
  // «Ни с кем, держу в себе» не даёт попасть в «близкий человек есть»
  const eHigh = e >= THRESHOLD || who === 'n'
  const sHigh = s >= THRESHOLD
  const type: TypeId = !eHigh && !sHigh ? 'A' : eHigh && !sHigh ? 'B' : !eHigh && sHigh ? 'C' : 'D'
  return { e, s, who, type, silent }
}

/** Текст типа с добавкой про партнёршу */
export function typeText(r: LonelinessResult): string {
  const base = TYPES[r.type].text
  return r.who === 'p' && r.type !== 'C' ? base + PARTNER_ONLY : base
}

/** Telegram пропускает в /start только A-Z a-z 0-9 _ - и до 64 символов */
export const START_MAX = 64

/**
 * Источник для хвоста payload: utm_source и utm_campaign через «-», только
 * [A-Za-z0-9-] — подчёркивание в payload разделитель полей, его выкидываем
 */
export function sourceFromSearch(search: string): string {
  const p = new URLSearchParams(search)
  const clean = (v: string | null) => (v ?? '').replace(/[^A-Za-z0-9-]+/g, '')
  return [clean(p.get('utm_source')), clean(p.get('utm_campaign'))].filter(Boolean).join('-')
}

/**
 * Параметр /start для бота: l_<тип>_<близость>_<компания>_<с кем>_<темы>[_<источник>].
 * Темы: ЗАГЛАВНАЯ — «не с кем», строчная — «есть с кем, но молчу», «0» — молчаливых тем нет.
 * Пример: l_B_75_30_p_MgzP_ig-150let. Ядро — до 22 символов, источник режется под лимит.
 */
export function botPayload(r: LonelinessResult, src = ''): string {
  const topics = r.silent.map((t) => (t.kind === 'b' ? t.c.toLowerCase() : t.c)).join('') || '0'
  const core = `l_${r.type}_${r.e}_${r.s}_${r.who}_${topics}`
  const tail = src.replace(/[^A-Za-z0-9-]+/g, '').slice(0, START_MAX - core.length - 1).replace(/-+$/, '')
  return tail ? `${core}_${tail}` : core
}

/** Разбор payload обратно — для тестов и как образец для бота */
export const PAYLOAD_RE = /^l_([ABCD])_(\d{1,3})_(\d{1,3})_([npfmt])_(0|[MRZGKOPmrzgkop]{1,7})(?:_([A-Za-z0-9-]+))?$/
