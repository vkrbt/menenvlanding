import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { zung as scale } from './zung.ts'

/** Ключ, переписанный из ресёрча независимо от файла шкалы (§2.4) */
const DIRECT = [1, 3, 4, 7, 8, 9, 10, 13, 15, 19]
const REVERSE = [2, 5, 6, 11, 12, 14, 16, 17, 18, 20]

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const fill = (fn: (n: number) => number): Answers => Object.fromEntries(range(1, 20).map((n) => [String(n), fn(n)]))

function run(answers: Answers) {
  const r = score(scale, answers)
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  assert.equal(r.subscales.length, 1)
  return { index: r.subscales[0], flags: r.flags }
}

/** Сырой балл по формуле РНЦПЗ: УД = Σ прямых + Σ (5 − ответ) обратных */
const rawOf = (a: Answers) =>
  DIRECT.reduce((s, n) => s + a[String(n)], 0) + REVERSE.reduce((s, n) => s + 5 - a[String(n)], 0)

/** Ответы с сырым баллом ровно target: от минимума (прямые 1, обратные 4) добавляем по пунктам */
function answersFor(target: number): Answers {
  let extra = target - 20
  return fill((n) => {
    const points = 1 + Math.min(3, extra)
    extra -= points - 1
    return DIRECT.includes(n) ? points : 5 - points
  })
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('ключ: прямые и обратные пункты, вклад = балл × 125', () => {
  assert.equal(scale.items.length, 20)
  assert.deepEqual([...DIRECT, ...REVERSE].sort((a, b) => a - b), range(1, 20))
  for (const item of scale.items) {
    const n = Number(item.id)
    const reversed = REVERSE.includes(n)
    assert.deepEqual(
      item.options.map((o) => [o.value, o.scores]),
      [1, 2, 3, 4].map((v) => [v, { index: (reversed ? 5 - v : v) * 125 }]),
      `пункт ${n}`,
    )
    assert.deepEqual(item.options.map((o) => o.label), ['Никогда или изредка', 'Иногда', 'Часто', 'Почти всегда или постоянно'])
  }
  assert.equal(scale.subscales[0].divisor, 100)
  assert.equal(scale.subscales[0].signed, undefined)
})

test('обратные пункты по одному: ответ 4 вместо 1 снижает индекс на 3,75', () => {
  const base = fill(() => 2)
  const r0 = run(base).index.value
  for (const n of REVERSE) {
    assert.equal(run({ ...base, [n]: 1 }).index.value - run({ ...base, [n]: 4 }).index.value, 3.75, `пункт ${n}`)
  }
  for (const n of DIRECT) {
    assert.equal(run({ ...base, [n]: 4 }).index.value - run({ ...base, [n]: 1 }).index.value, 3.75, `пункт ${n}`)
  }
  // Пример из РНЦПЗ: на пункт 2 выбрана 1 — в сумму идёт 4 балла
  assert.equal(run({ ...base, '2': 1 }).index.raw - run(base).index.raw, (4 - 3) * 125)
  // Пункты 2 и 14 обратные (на /stat/84 их пропускают)
  assert.ok(run({ ...base, '2': 4, '14': 4 }).index.value < r0)
})

test('контрольные векторы §7.1', () => {
  const p3 = (n: number) => (DIRECT.includes(n) ? 3 : 4)
  const cases: Array<[string, (n: number) => number, number, number, string]> = [
    ['T1 П = 1, О = 4', (n) => (DIRECT.includes(n) ? 1 : 4), 20, 25, 'none'],
    ['T2 П = 4, О = 1', (n) => (DIRECT.includes(n) ? 4 : 1), 80, 100, 'severe'],
    ['T3 все 1', () => 1, 50, 62.5, 'moderate'],
    ['T4 все 4', () => 4, 50, 62.5, 'moderate'],
    ['T5', (n) => (n === 19 ? 2 : p3(n)), 39, 48.75, 'none'],
    ['T6 П = 3, О = 4', p3, 40, 50, 'mild'],
    ['T7', (n) => (DIRECT.includes(n) ? 3 : [2, 5, 6].includes(n) ? 4 : 3), 47, 58.75, 'mild'],
    ['T8', (n) => (DIRECT.includes(n) ? 3 : [2, 5, 6].includes(n) ? 4 : n === 20 ? 2 : 3), 48, 60, 'moderate'],
    ['T9', (n) => (DIRECT.includes(n) ? 4 : [2, 5, 6, 11, 12].includes(n) ? 4 : 3), 55, 68.75, 'moderate'],
    ['T10', (n) => (DIRECT.includes(n) ? 4 : [2, 5, 6, 11].includes(n) ? 4 : 3), 56, 70, 'severe'],
  ]
  for (const [name, fn, raw, index, category] of cases) {
    const answers = fill(fn)
    assert.equal(rawOf(answers), raw, `${name}: сырой по формуле`)
    const r = run(answers).index
    assert.equal(r.raw, raw * 125, `${name}: сотые`)
    assert.equal(r.value, index, `${name}: индекс`)
    assert.equal(r.category?.id, category, name)
  }
})

test('все одинаковые ответы: индекс 62,50, умеренная', () => {
  for (const v of [1, 2, 3, 4]) {
    const r = run(fill(() => v)).index
    assert.equal(r.value, 62.5)
    assert.equal(r.category?.id, 'moderate')
    assert.equal(r.category?.label, 'умеренная депрессия')
  }
})

test('границы категорий: сырые 39/40, 47/48, 55/56', () => {
  const expected: Array<[number, number, string]> = [
    [20, 25, 'none'],
    [39, 48.75, 'none'],
    [40, 50, 'mild'],
    [47, 58.75, 'mild'],
    [48, 60, 'moderate'],
    [55, 68.75, 'moderate'],
    [56, 70, 'severe'],
    [80, 100, 'severe'],
  ]
  for (const [raw, index, category] of expected) {
    const answers = answersFor(raw)
    assert.equal(rawOf(answers), raw)
    const r = run(answers).index
    assert.equal(r.value, index, `сырой ${raw}`)
    assert.equal(r.category?.id, category, `сырой ${raw}`)
  }
  // Все достижимые сырые баллы: категория совпадает с сырыми порогами 40/48/56 (Z3, табл. 1)
  for (const raw of range(20, 80)) {
    const id = run(answersFor(raw)).index.category?.id
    assert.equal(id, raw < 40 ? 'none' : raw < 48 ? 'mild' : raw < 56 ? 'moderate' : 'severe', `сырой ${raw}`)
  }
  const severities = scale.subscales[0].categories.map((c) => c.severity)
  assert.deepEqual(severities, [0, 1, 2, 3])
})

test('пункт 19: «Часто» и «Почти всегда» поднимают флаг риска', () => {
  const base = fill(() => 2)
  assert.deepEqual(run({ ...base, '19': 1 }).flags, [])
  assert.deepEqual(run({ ...base, '19': 2 }).flags, [])
  assert.deepEqual(run({ ...base, '19': 3 }).flags, [{ id: 'suicide', level: 2 }])
  assert.deepEqual(run({ ...base, '19': 4 }).flags, [{ id: 'suicide', level: 2 }])
})

test('неполные ответы не считаются', () => {
  const answers = fill(() => 2)
  delete answers['20']
  const r = score(scale, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['20'])
})
