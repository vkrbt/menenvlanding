import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { gotland as scale } from './gotland.ts'

const fromList = (list: number[]): Answers => Object.fromEntries(list.map((v, i) => [String(i + 1), v]))
const all = (v: number) => fromList(Array(13).fill(v))

function run(answers: Answers) {
  const r = score(scale, answers)
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  assert.equal(r.subscales.length, 1, 'подшкалы не выводятся')
  return r.subscales[0]
}

/** Ответы с суммой ровно target: заполняем пункты по 3, остаток — в следующий */
function answersFor(target: number): Answers {
  let rest = target
  return fromList(
    Array.from({ length: 13 }, () => {
      const v = Math.min(3, rest)
      rest -= v
      return v
    }),
  )
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('13 пунктов, 0–3, обратных нет', () => {
  assert.equal(scale.items.length, 13)
  for (const item of scale.items) {
    assert.deepEqual(
      item.options.map((o) => [o.value, o.label, o.scores]),
      [
        [0, 'Совсем нет', { total: 0 }],
        [1, 'В некоторой степени', { total: 1 }],
        [2, 'Довольно сильно', { total: 2 }],
        [3, 'Очень сильно', { total: 3 }],
      ],
      `пункт ${item.id}`,
    )
  }
  assert.equal(scale.timeframe, 'за последний месяц')
  assert.match(scale.parts[0].instruction, /в течение последнего месяца/)
})

test('тестовые векторы T1–T8 (§7.1)', () => {
  const cases: Array<[string, number[], number, string]> = [
    ['T1 все 0', Array(13).fill(0), 0, 'none'],
    ['T2 все 3', Array(13).fill(3), 39, 'clear'],
    ['T3', [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], 12, 'none'],
    ['T4 все 1', Array(13).fill(1), 13, 'possible'],
    ['T5 все 2', Array(13).fill(2), 26, 'possible'],
    ['T6', [3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0], 27, 'clear'],
    ['T7 только дистресс', [3, 3, 0, 0, 3, 0, 0, 3, 3, 3, 0, 3, 0], 21, 'possible'],
    ['T8 только депрессия', [0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 3, 0, 3], 18, 'possible'],
  ]
  for (const [name, list, total, category] of cases) {
    const r = run(fromList(list))
    assert.equal(r.raw, total, name)
    assert.equal(r.category?.id, category, name)
  }
})

test('границы категорий 12/13 и 26/27 с обеих сторон', () => {
  const expected: Array<[number, string]> = [
    [0, 'none'],
    [12, 'none'],
    [13, 'possible'],
    [26, 'possible'],
    [27, 'clear'],
    [39, 'clear'],
  ]
  for (const [target, category] of expected) {
    const r = run(answersFor(target))
    assert.equal(r.raw, target)
    assert.equal(r.category?.id, category, `${target} баллов`)
  }
  assert.deepEqual(
    scale.subscales[0].categories.map((c) => [c.min, c.max, c.severity]),
    [
      [0, 12, 0],
      [13, 26, 1],
      [27, 39, 2],
    ],
  )
})

test('каждый пункт входит в сумму', () => {
  for (let n = 1; n <= 13; n++) {
    assert.equal(run({ ...all(0), [String(n)]: 3 }).raw, 3, `пункт ${n}`)
  }
})

test('неполные и недопустимые ответы не считаются', () => {
  const answers = all(1)
  delete answers['13']
  const r = score(scale, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['13'])
  // Нумерация колонок psytests 1–4 — не баллы: значения 4 нет
  const bad = score(scale, { ...all(1), '1': 4 })
  assert.equal(bad.ok, false)
  assert.deepEqual(!bad.ok && bad.invalid, ['1'])
})
