import { beck } from './scales/beck.ts'
import { hads } from './scales/hads.ts'
import { spielbergerKhanin } from './scales/spielberger-khanin.ts'
import { yakhinMendelevich } from './scales/yakhin-mendelevich.ts'
import type { Scale } from './types.ts'

export { TESTS_URL } from '../site.ts'

export type TestEntry = {
  scale: Scale
  /** Тема для карточки хаба: «Депрессия», «Тревога»… */
  topic: string
  /** SEO-заголовок и описание страницы теста */
  seoTitle: string
  seoDescription: string
  /** Статьи блога по теме теста — slug из content/blog */
  related: string[]
}

/** Порядок — порядок карточек в хабе */
export const TESTS: TestEntry[] = [
  {
    scale: beck,
    topic: 'Депрессия',
    seoTitle: 'Тест на депрессию по шкале Бека онлайн — 21 вопрос, результат сразу',
    seoDescription:
      'Шкала депрессии Бека (BDI) в адаптации Н.В. Тарабриной: 21 вопрос, подсчёт по первоисточнику, анонимно — ответы не покидают браузер. Скрининг, не диагноз.',
    related: ['depressiya-u-muzhchin-priznaki', 'emigrantskaya-depressiya'],
  },
  {
    scale: spielbergerKhanin,
    topic: 'Тревога',
    seoTitle: 'Тест Спилбергера–Ханина онлайн: реактивная и личностная тревожность',
    seoDescription:
      'Шкала тревожности Спилбергера в адаптации Ю.Л. Ханина: 40 вопросов, две шкалы, верный ключ и подсчёт по первоисточнику. Анонимно, результат сразу.',
    related: ['trevoga-i-kontrol', 'voskresnaya-trevoga'],
  },
  {
    scale: hads,
    topic: 'Тревога и депрессия',
    seoTitle: 'Госпитальная шкала тревоги и депрессии HADS онлайн — 14 вопросов',
    seoDescription:
      'HADS в валидированном русском переводе 2023 года: 14 вопросов, тревога и депрессия считаются отдельно. Анонимно, подсчёт по первоисточнику. Скрининг, не диагноз.',
    related: ['depressiya-u-muzhchin-priznaki', 'trevoga-i-kontrol'],
  },
  {
    scale: yakhinMendelevich,
    topic: 'Невротические состояния',
    seoTitle: 'Опросник Яхина–Менделевича онлайн: 6 шкал невротических состояний',
    seoDescription:
      'Клинический опросник невротических состояний К.К. Яхина и Д.М. Менделевича: 68 вопросов, 6 шкал, таблица коэффициентов по первоисточнику. Анонимно, результат сразу.',
    related: ['psihosomatika-u-muzhchin', 'postoyannaya-ustalost'],
  },
]

export function getTest(slug: string): TestEntry | undefined {
  return TESTS.find((t) => t.scale.slug === slug)
}

/** Число вопросов бланка; доп. вопросы вроде «19а» не считаются отдельными */
export function questionCount(scale: Scale): number {
  return scale.items.filter((i) => /^\d+$/.test(i.id)).length
}

/** «21 вопрос», «22 вопроса», «40 вопросов» */
export function questionsLabel(n: number): string {
  const d = n % 10
  const dd = n % 100
  const word = d === 1 && dd !== 11 ? 'вопрос' : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? 'вопроса' : 'вопросов'
  return `${n} ${word}`
}
