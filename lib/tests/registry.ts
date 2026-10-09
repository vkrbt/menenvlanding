import { beck } from './scales/beck.ts'
import { hads } from './scales/hads.ts'
import { spielbergerKhanin } from './scales/spielberger-khanin.ts'
import { yakhinMendelevich } from './scales/yakhin-mendelevich.ts'
import { audit } from './scales/audit.ts'
import { boyko } from './scales/boyko.ts'
import { mbi } from './scales/mbi.ts'
import { gad7 } from './scales/gad7.ts'
import { gotland } from './scales/gotland.ts'
import { phq9 } from './scales/phq9.ts'
import { pss10 } from './scales/pss10.ts'
import { who5 } from './scales/who5.ts'
import { zung } from './scales/zung.ts'
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
    scale: phq9,
    topic: 'Депрессия',
    seoTitle: 'Тест на депрессию PHQ-9 онлайн — 9 вопросов, официальный перевод',
    seoDescription:
      'Опросник PHQ-9 — международный стандарт скрининга депрессии. Официальный русский перевод Pfizer, подсчёт по Kroenke 2001. Анонимно, 3 минуты.',
    related: ['depressiya-u-muzhchin-priznaki', 'sezonnaya-depressiya'],
  },
  {
    scale: zung,
    topic: 'Депрессия',
    seoTitle: 'Шкала депрессии Цунга онлайн — тест с индексом по первоисточнику',
    seoDescription:
      'Шкала самооценки депрессии Цунга: 20 вопросов, индекс как у автора (сырой балл × 1,25), а не пороги по сырому баллу, как на многих сайтах. Анонимно.',
    related: ['depressiya-u-muzhchin-priznaki', 'muzh-v-depressii'],
  },
  {
    scale: gotland,
    topic: 'Депрессия',
    seoTitle: 'Готландская шкала мужской депрессии онлайн — тест для мужчин',
    seoDescription:
      'Тест на мужскую депрессию: раздражительность, срывы, алкоголь и работа на износ вместо грусти. 13 вопросов, пороги по рецензируемым валидациям. Анонимно.',
    related: ['depressiya-u-muzhchin-priznaki', 'muzh-v-depressii'],
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
    scale: gad7,
    topic: 'Тревога',
    seoTitle: 'Тест на тревожность GAD-7 онлайн — 7 вопросов, официальный перевод',
    seoDescription:
      'Шкала GAD-7 — международный стандарт скрининга тревожного расстройства. Официальный русский перевод, подсчёт по Spitzer 2006. Анонимно, 2 минуты.',
    related: ['trevozhnost-u-muzhchin', 'trevoga-i-kontrol'],
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
    scale: pss10,
    topic: 'Стресс и выгорание',
    seoTitle: 'Шкала воспринимаемого стресса PSS-10 онлайн — тест на стресс',
    seoDescription:
      'PSS-10 в русской адаптации 2023 года: 10 вопросов, сравнение с нормой российских мужчин. Анонимно, 2 минуты.',
    related: ['postoyannaya-ustalost', 'bol-v-spine-ot-stressa'],
  },  {
    scale: mbi,
    topic: 'Стресс и выгорание',
    seoTitle: 'Тест на выгорание Маслач (MBI) онлайн — версия Водопьяновой с мужскими нормами',
    seoDescription:
      'Опросник профессионального выгорания Маслач в стандартизированной версии Водопьяновой 2013: 22 вопроса, три шкалы, уровни по мужским нормам. Анонимно.',
    related: ['vygoranie-u-muzhchin', 'stadii-vygoraniya'],
  },
  {
    scale: boyko,
    topic: 'Стресс и выгорание',
    seoTitle: 'Тест Бойко на эмоциональное выгорание онлайн — 84 вопроса, 3 фазы',
    seoDescription:
      'Методика Бойко: 12 симптомов и 3 фазы выгорания. Ключ сверен по трём изданиям, найденная во всех книгах опечатка исправлена. Анонимно, результат сразу.',
    related: ['stadii-vygoraniya', 'vygorel-na-rabote'],
  },

  {
    scale: audit,
    topic: 'Алкоголь',
    seoTitle: 'Тест на алкогольную зависимость AUDIT онлайн — версия ВОЗ для России',
    seoDescription:
      'RUS-AUDIT — официальная российская версия теста ВОЗ 2021 года с порогами для мужчин. 10 вопросов, анонимно, результат сразу.',
    related: ['alkogol-kazhdyy-vecher'],
  },
  {
    scale: who5,
    topic: 'Благополучие',
    seoTitle: 'Индекс благополучия ВОЗ WHO-5 онлайн — тест на самочувствие',
    seoDescription:
      'WHO-5 — 5 вопросов о самочувствии за две недели, официальный русский перевод ВОЗ. Показывает, стоит ли присмотреться к своему состоянию. Анонимно.',
    related: ['postoyannaya-ustalost', 'apatiya-u-muzhchin'],
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
