import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { who5 as scale } from './who5.ts'

const toAnswers = (values: number[]): Answers => Object.fromEntries(values.map((v, i) => [String(i + 1), v]))

function run(values: number[]) {
  const r = score(scale, toAnswers(values))
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  assert.equal(r.subscales.length, 1)
  return r.subscales[0]
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('варианты в порядке бланка, вклад = балл × 4, обратных нет', () => {
  assert.equal(scale.items.length, 5)
  for (const item of scale.items) {
    assert.deepEqual(
      item.options.map((o) => [o.value, o.label, o.scores]),
      [
        [5, 'Все время', { percent: 20 }],
        [4, 'Большую часть времени', { percent: 16 }],
        [3, 'Более половины времени', { percent: 12 }],
        [2, 'Менее половины времени', { percent: 8 }],
        [1, 'Некоторое время', { percent: 4 }],
        [0, 'Никогда', { percent: 0 }],
      ],
    )
  }
  assert.equal(scale.subscales[0].divisor, undefined)
})

test('контрольные векторы §7.1', () => {
  const cases: Array<[number[], number, string]> = [
    [[5, 5, 5, 5, 5], 100, 'normal'],
    [[0, 0, 0, 0, 0], 0, 'very-low'],
    [[3, 3, 3, 3, 3], 60, 'normal'],
    [[3, 3, 3, 2, 2], 52, 'normal'],
    [[3, 3, 2, 2, 2], 48, 'low'],
    [[2, 2, 2, 1, 1], 32, 'low'],
    [[2, 2, 1, 1, 1], 28, 'very-low'],
    [[5, 0, 0, 0, 0], 20, 'very-low'],
  ]
  for (const [values, percent, category] of cases) {
    const r = run(values)
    assert.equal(r.value, percent, values.join(','))
    assert.equal(r.raw, percent)
    assert.equal(r.category?.id, category, values.join(','))
  }
})

test('границы категорий: 28/32 и 48/52', () => {
  assert.equal(run([2, 2, 1, 1, 1]).category?.id, 'very-low') // 28
  assert.equal(run([2, 2, 2, 1, 1]).category?.id, 'low') // 32
  assert.equal(run([3, 3, 2, 2, 2]).category?.id, 'low') // 48
  assert.equal(run([3, 3, 3, 2, 2]).category?.id, 'normal') // 52
  const cats = scale.subscales[0].categories
  assert.deepEqual(
    cats.map((c) => [c.id, c.severity]),
    [
      ['very-low', 2],
      ['low', 1],
      ['normal', 0],
    ],
  )
})

test('все суммы: процент кратен 4, 50 недостижимо, категория по сырому ≤ 7 / 8–12 / ≥ 13', () => {
  for (let raw = 0; raw <= 25; raw++) {
    let rest = raw
    const values = [0, 0, 0, 0, 0].map(() => {
      const v = Math.min(5, rest)
      rest -= v
      return v
    })
    const r = run(values)
    assert.equal(r.value, raw * 4)
    assert.equal(r.value % 4, 0)
    assert.notEqual(r.value, 50)
    assert.equal(r.category?.id, raw <= 7 ? 'very-low' : raw <= 12 ? 'low' : 'normal', `сырой ${raw}`)
  }
})

test('неполные ответы не считаются', () => {
  const r = score(scale, { '1': 3, '2': 3, '3': 3, '4': 3 })
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['5'])
})
