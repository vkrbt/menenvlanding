import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { spielbergerKhanin as scale } from './spielberger-khanin.ts'

/** Ключ, переписанный из методики независимо от файла шкалы (§3.1 ресёрча) */
const STATE_DIRECT = [3, 4, 6, 7, 9, 12, 13, 14, 17, 18]
const STATE_REVERSE = [1, 2, 5, 8, 10, 11, 15, 16, 19, 20]
const TRAIT_DIRECT = [22, 23, 24, 25, 28, 29, 31, 32, 34, 35, 37, 38, 40]
const TRAIT_REVERSE = [21, 26, 27, 30, 33, 36, 39]
const DIRECT = [...STATE_DIRECT, ...TRAIT_DIRECT]

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const fill = (fn: (n: number) => number): Answers =>
  Object.fromEntries(range(1, 40).map((n) => [String(n), fn(n)]))

function run(answers: Answers) {
  const r = score(scale, answers)
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  const get = (id: string) => r.subscales.find((s) => s.id === id)!
  return { state: get('state'), trait: get('trait'), count: r.subscales.length }
}

/** Формула Ханина как на бланке: Σпрям − Σобр + константа */
function hanin(answers: Answers) {
  const sum = (ids: number[]) => ids.reduce((s, n) => s + answers[String(n)], 0)
  return {
    state: sum(STATE_DIRECT) - sum(STATE_REVERSE) + 50,
    trait: sum(TRAIT_DIRECT) - sum(TRAIT_REVERSE) + 35,
  }
}

/** Ответы, дающие подшкале ровно target баллов (остальная подшкала — минимум) */
function answersFor(sub: 'state' | 'trait', target: number): Answers {
  const ids = sub === 'state' ? range(1, 20) : range(21, 40)
  let extra = target - 20
  const answers = fill((n) => (DIRECT.includes(n) ? 1 : 4))
  for (const n of ids) {
    const contribution = 1 + Math.min(3, extra)
    extra -= contribution - 1
    answers[String(n)] = DIRECT.includes(n) ? contribution : 5 - contribution
  }
  assert.equal(extra, 0)
  return answers
}

/** Детерминированный ГПСЧ (mulberry32) */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('ключ шкалы совпадает с методикой, части и варианты на месте', () => {
  assert.equal(scale.items.length, 40)
  for (const item of scale.items) {
    const n = Number(item.id)
    const sub = n <= 20 ? 'state' : 'trait'
    assert.equal(item.part, sub)
    const reversed = [...STATE_REVERSE, ...TRAIT_REVERSE].includes(n)
    assert.deepEqual(
      item.options.map((o) => [o.value, o.scores]),
      [1, 2, 3, 4].map((v) => [v, { [sub]: reversed ? 5 - v : v }]),
      `пункт ${n}`,
    )
  }
  assert.deepEqual(scale.items[0].options.map((o) => o.label), ['Нет, это не так', 'Пожалуй, так', 'Верно', 'Совершенно верно'])
  assert.deepEqual(scale.items[20].options.map((o) => o.label), ['Почти никогда', 'Иногда', 'Часто', 'Почти всегда'])
  assert.deepEqual(scale.parts.map((p) => p.id), ['state', 'trait'])
})

test('контрольные векторы §3.4', () => {
  const cases: Array<[string, (n: number) => number, number, number]> = [
    ['все 1', () => 1, 50, 41],
    ['все 4', () => 4, 50, 59],
    ['все 2', () => 2, 50, 47],
    ['все 3', () => 3, 50, 53],
    ['прямые 1, обратные 4', (n) => (DIRECT.includes(n) ? 1 : 4), 20, 20],
    ['прямые 4, обратные 1', (n) => (DIRECT.includes(n) ? 4 : 1), 80, 80],
  ]
  for (const [name, fn, state, trait] of cases) {
    const r = run(fill(fn))
    assert.equal(r.state.raw, state, `${name}: реактивная`)
    assert.equal(r.trait.raw, trait, `${name}: личностная`)
    assert.equal(r.count, 2, 'общего балла нет')
  }
})

test('ловушка +35: максимум реактивной 80, а не 65', () => {
  const r = run(fill((n) => (DIRECT.includes(n) ? 4 : 1)))
  assert.equal(r.state.raw, 80)
  assert.notEqual(r.state.raw, 65)
  assert.equal(r.state.category?.id, 'high')
})

test('пункт 13 прямой, пункт 15 обратный', () => {
  const base = fill(() => 2)
  const r0 = run(base).state.raw
  // Только пункт 13: 2 → 4 повышает реактивную на 2
  assert.equal(run({ ...base, '13': 4 }).state.raw, r0 + 2)
  // Только пункт 15: 2 → 4 понижает реактивную на 2
  assert.equal(run({ ...base, '15': 4 }).state.raw, r0 - 2)
  // Сценарий спеки: 13 = 4, 15 = 1 — оба дают по 4 балла.
  // На базе «все 2» вклад 13 был 2, вклад 15 был 3: итог r0 + 2 + 1
  const both = run({ ...base, '13': 4, '15': 1 }).state.raw
  assert.equal(both, r0 + 3)
  const contribution = (id: string, v: number) =>
    scale.items.find((i) => i.id === id)!.options.find((o) => o.value === v)!.scores.state
  assert.equal(contribution('13', 4), 4)
  assert.equal(contribution('15', 1), 4)
  // С перепутанным ключом Минздрава (13 обратный, 15 прямой) было бы r0 − 2 − 1
  assert.notEqual(both, r0 - 3)
})

test('пункт 33 обратный: ответ 4 даёт 1 балл', () => {
  const base = fill(() => 2)
  const at1 = run({ ...base, '33': 1 }).trait.raw
  const at4 = run({ ...base, '33': 4 }).trait.raw
  assert.equal(at1 - at4, 3)
  const option = scale.items.find((i) => i.id === '33')!.options.find((o) => o.value === 4)!
  assert.deepEqual(option.scores, { trait: 1 })
})

test('границы категорий 30/31 и 45/46 в обеих подшкалах', () => {
  const expected: Array<[number, string]> = [
    [20, 'low'],
    [30, 'low'],
    [31, 'moderate'],
    [45, 'moderate'],
    [46, 'high'],
    [80, 'high'],
  ]
  for (const sub of ['state', 'trait'] as const) {
    for (const [target, category] of expected) {
      const r = run(answersFor(sub, target))[sub]
      assert.equal(r.raw, target, `${sub} = ${target}`)
      assert.equal(r.category?.id, category, `${sub} = ${target}`)
    }
  }
  const labels = scale.subscales[0].categories.map((c) => c.label)
  assert.deepEqual(labels, ['низкая', 'умеренная', 'высокая'])
})

test('случайные наборы ответов: score() совпадает с формулой Ханина', () => {
  const rand = mulberry32(20261009)
  for (let i = 0; i < 200; i++) {
    const answers = fill(() => 1 + Math.floor(rand() * 4))
    const expected = hanin(answers)
    const r = run(answers)
    assert.equal(r.state.raw, expected.state)
    assert.equal(r.trait.raw, expected.trait)
  }
})

test('неполные ответы не считаются', () => {
  const answers = fill(() => 2)
  delete answers['40']
  const r = score(scale, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['40'])
})
