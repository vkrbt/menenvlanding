import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { gad7 } from './gad7.ts'

function answers(vector: string): Answers {
  const values = vector.split(' ').map(Number)
  assert.equal(values.length, 7)
  return Object.fromEntries(values.map((v, i) => [String(i + 1), v]))
}

function total(a: Answers) {
  const r = score(gad7, a)
  assert.ok(r.ok, 'ответы должны считаться')
  assert.deepEqual(r.flags, [])
  return r.subscales[0]
}

function withSum(target: number): Answers {
  const a: Answers = {}
  let rest = target
  for (let i = 1; i <= 7; i++) {
    a[String(i)] = Math.min(3, rest)
    rest -= a[String(i)]
  }
  assert.equal(rest, 0)
  return a
}

test('GAD-7: самопроверка данных', () => {
  assert.deepEqual(validateScale(gad7), [])
})

test('GAD-7: 7 пунктов, value = балл, вопроса о трудностях нет', () => {
  assert.deepEqual(
    gad7.items.map((i) => i.id),
    ['1', '2', '3', '4', '5', '6', '7'],
  )
  for (const item of gad7.items) {
    for (const o of item.options) assert.deepEqual(o.scores, { total: o.value })
    assert.deepEqual(
      item.options.map((o) => o.label),
      ['Ни разу', 'Несколько дней', 'Более недели', 'Почти каждый день'],
    )
  }
  assert.equal(gad7.riskFlags, undefined)
})

// Векторы из plans/tests-research/phq9-gad7.md, §8
const vectors: Array<[string, number, string]> = [
  ['0 0 0 0 0 0 0', 0, 'minimal'],
  ['3 3 3 3 3 3 3', 21, 'severe'],
  ['1 1 1 1 0 0 0', 4, 'minimal'],
  ['1 1 1 1 1 0 0', 5, 'mild'],
  ['2 2 2 1 1 1 0', 9, 'mild'],
  ['2 2 2 2 2 0 0', 10, 'moderate'],
  ['2 2 2 2 2 2 2', 14, 'moderate'],
  ['3 3 3 3 3 0 0', 15, 'severe'],
]

for (const [vector, sum, category] of vectors) {
  test(`GAD-7: вектор ${vector} → ${sum}, ${category}`, () => {
    const t = total(answers(vector))
    assert.equal(t.raw, sum)
    assert.equal(t.category?.id, category)
  })
}

test('GAD-7: минимум 0, максимум 21', () => {
  assert.equal(total(answers('0 0 0 0 0 0 0')).raw, 0)
  assert.equal(total(answers('3 3 3 3 3 3 3')).raw, 21)
})

test('GAD-7: каждая граница категорий с обеих сторон', () => {
  const expected: Array<[number, string, number]> = [
    [4, 'minimal', 0],
    [5, 'mild', 1],
    [9, 'mild', 1],
    [10, 'moderate', 2],
    [14, 'moderate', 2],
    [15, 'severe', 3],
  ]
  for (const [sum, category, severity] of expected) {
    const t = total(withSum(sum))
    assert.equal(t.raw, sum)
    assert.equal(t.category?.id, category, `сумма ${sum}`)
    assert.equal(t.category?.severity, severity, `сумма ${sum}`)
  }
})

test('GAD-7: 6 ответов не считаются', () => {
  const a = answers('1 1 1 1 1 1 1')
  delete a['7']
  assert.deepEqual(score(gad7, a), { ok: false, missing: ['7'], invalid: [] })
})
