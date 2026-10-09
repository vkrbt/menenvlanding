import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { phq9 } from './phq9.ts'

/** Ответы пунктов 1–9 строкой как в ресёрче; вопрос 10 — отдельно */
function answers(vector: string, q10 = 0): Answers {
  const values = vector.split(' ').map(Number)
  assert.equal(values.length, 9)
  return { ...Object.fromEntries(values.map((v, i) => [String(i + 1), v])), '10': q10 }
}

function result(a: Answers) {
  const r = score(phq9, a)
  assert.ok(r.ok, 'ответы должны считаться')
  const [total] = r.subscales
  return { total, flags: r.flags }
}

/** Сумма target пунктами 1–8, пункт 9 = 0 */
function withSum(target: number): Answers {
  const a: Answers = { '9': 0, '10': 0 }
  let rest = target
  for (let i = 1; i <= 8; i++) {
    a[String(i)] = Math.min(3, rest)
    rest -= a[String(i)]
  }
  assert.equal(rest, 0)
  return a
}

test('PHQ-9: самопроверка данных', () => {
  assert.deepEqual(validateScale(phq9), [])
})

test('PHQ-9: 9 пунктов + вопрос 10, value = балл, вопрос 10 без баллов', () => {
  assert.deepEqual(
    phq9.items.map((i) => i.id),
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  )
  for (const item of phq9.items) {
    assert.deepEqual(
      item.options.map((o) => o.value),
      [0, 1, 2, 3],
    )
    for (const o of item.options) assert.deepEqual(o.scores, item.id === '10' ? {} : { total: o.value })
  }
  assert.deepEqual(
    phq9.items[0].options.map((o) => o.label),
    ['Ни разу', 'Несколько дней', 'Более недели', 'Почти каждый день'],
  )
})

// Векторы из plans/tests-research/phq9-gad7.md, §8
const vectors: Array<[string, number, string, 0 | 1 | 2]> = [
  ['0 0 0 0 0 0 0 0 0', 0, 'minimal', 0],
  ['3 3 3 3 3 3 3 3 3', 27, 'severe', 2],
  ['1 1 1 1 0 0 0 0 0', 4, 'minimal', 0],
  ['1 1 1 1 1 0 0 0 0', 5, 'mild', 0],
  ['1 1 1 1 1 1 1 1 1', 9, 'mild', 1],
  ['2 2 2 2 2 0 0 0 0', 10, 'moderate', 0],
  ['2 2 2 2 2 2 2 0 0', 14, 'moderate', 0],
  ['3 3 3 3 3 0 0 0 0', 15, 'moderately-severe', 0],
  ['1 1 1 2 2 3 3 3 0', 16, 'moderately-severe', 0],
  ['3 3 3 3 3 2 2 0 0', 19, 'moderately-severe', 0],
  ['3 3 3 3 3 3 2 0 0', 20, 'severe', 0],
  ['0 0 0 0 0 0 0 0 1', 1, 'minimal', 1],
  ['0 0 0 0 0 0 0 0 3', 3, 'minimal', 2],
]

for (const [vector, sum, category, flag] of vectors) {
  test(`PHQ-9: вектор ${vector} → ${sum}, ${category}`, () => {
    const r = result(answers(vector))
    assert.equal(r.total.raw, sum)
    assert.equal(r.total.value, sum)
    assert.equal(r.total.category?.id, category)
    assert.deepEqual(r.flags, flag ? [{ id: 'suicide', level: flag }] : [])
  })
}

test('PHQ-9: минимум 0, максимум 27', () => {
  assert.equal(result(answers('0 0 0 0 0 0 0 0 0')).total.raw, 0)
  assert.equal(result(answers('3 3 3 3 3 3 3 3 3', 3)).total.raw, 27)
})

test('PHQ-9: каждая граница категорий с обеих сторон', () => {
  const expected: Array<[number, string, number]> = [
    [4, 'minimal', 0],
    [5, 'mild', 1],
    [9, 'mild', 1],
    [10, 'moderate', 2],
    [14, 'moderate', 2],
    [15, 'moderately-severe', 2],
    [19, 'moderately-severe', 2],
    [20, 'severe', 3],
  ]
  for (const [sum, category, severity] of expected) {
    const r = result(withSum(sum))
    assert.equal(r.total.raw, sum)
    assert.equal(r.total.category?.id, category, `сумма ${sum}`)
    assert.equal(r.total.category?.severity, severity, `сумма ${sum}`)
  }
})

test('PHQ-9: вопрос 10 не влияет на сумму и категорию (пример из руководства, 16)', () => {
  for (const q10 of [0, 1, 2, 3]) {
    const r = result(answers('1 1 1 2 2 3 3 3 0', q10))
    assert.equal(r.total.raw, 16)
    assert.equal(r.total.category?.id, 'moderately-severe')
    assert.deepEqual(r.flags, [])
  }
})

test('PHQ-9: флаг пункта 9 при 0/1/2/3, в том числе при минимальной сумме', () => {
  const levels: Array<[number, Array<{ id: string; level: 1 | 2 }>]> = [
    [0, []],
    [1, [{ id: 'suicide', level: 1 }]],
    [2, [{ id: 'suicide', level: 2 }]],
    [3, [{ id: 'suicide', level: 2 }]],
  ]
  for (const [value, flags] of levels) {
    const r = result(answers(`0 0 0 0 0 0 0 0 ${value}`))
    assert.equal(r.total.raw, value)
    assert.equal(r.total.category?.id, 'minimal')
    assert.deepEqual(r.flags, flags, `пункт 9 = ${value}`)
  }
  assert.deepEqual(phq9.riskFlags, [{ id: 'suicide', item: '9', levels: { 1: 1, 2: 2, 3: 2 } }])
})

test('PHQ-9: пропуск и недопустимое значение не считаются', () => {
  const a = answers('1 1 1 1 1 1 1 1 0')
  delete a['5']
  assert.deepEqual(score(phq9, a), { ok: false, missing: ['5'], invalid: [] })
  assert.deepEqual(score(phq9, { ...answers('0 0 0 0 0 0 0 0 0'), '3': 4 }), { ok: false, missing: [], invalid: ['3'] })
})
