import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { hads } from './hads.ts'

const ANXIETY = ['1', '3', '5', '7', '9', '11', '13']
const DEPRESSION = ['2', '4', '6', '8', '10', '12', '14']

/** Ответы, выбранные функцией от списка вариантов пункта */
function pick(choose: (values: number[]) => number): Answers {
  return Object.fromEntries(hads.items.map((i) => [i.id, choose(i.options.map((o) => o.value))]))
}

function result(answers: Answers) {
  const r = score(hads, answers)
  assert.ok(r.ok, 'ответы должны считаться')
  const byId = Object.fromEntries(r.subscales.map((s) => [s.id, s]))
  return { list: r.subscales, anxiety: byId.anxiety, depression: byId.depression }
}

/** Набрать заданную сумму по одной подшкале, другая — 0 */
function withSum(subscale: 'anxiety' | 'depression', target: number): Answers {
  const answers: Answers = Object.fromEntries(hads.items.map((i) => [i.id, 0]))
  let rest = target
  for (const id of subscale === 'anxiety' ? ANXIETY : DEPRESSION) {
    const points = Math.min(3, rest)
    answers[id] = points
    rest -= points
  }
  assert.equal(rest, 0)
  return answers
}

test('HADS: самопроверка данных', () => {
  assert.deepEqual(validateScale(hads), [])
})

test('HADS: 14 пунктов в порядке бланка, по 4 варианта, value = балл', () => {
  assert.deepEqual(
    hads.items.map((i) => i.id),
    Array.from({ length: 14 }, (_, k) => String(k + 1)),
  )
  for (const item of hads.items) {
    assert.equal(item.options.length, 4)
    const sub = Number(item.id) % 2 ? 'anxiety' : 'depression'
    for (const o of item.options) assert.deepEqual(o.scores, { [sub]: o.value })
  }
})

test('HADS: все первые варианты → тревога 15, депрессия 9', () => {
  const r = result(pick((v) => v[0]))
  assert.equal(r.anxiety.raw, 15)
  assert.equal(r.depression.raw, 9)
})

test('HADS: все последние варианты → тревога 6, депрессия 12', () => {
  const r = result(pick((v) => v.at(-1)!))
  assert.equal(r.anxiety.raw, 6)
  assert.equal(r.depression.raw, 12)
})

test('HADS: все минимальные → 0/0, все максимальные → 21/21', () => {
  const min = result(pick((v) => Math.min(...v)))
  assert.equal(min.anxiety.raw, 0)
  assert.equal(min.depression.raw, 0)
  const max = result(pick((v) => Math.max(...v)))
  assert.equal(max.anxiety.raw, 21)
  assert.equal(max.depression.raw, 21)
  assert.equal(max.anxiety.category?.id, 'clinical')
})

for (const sub of ['anxiety', 'depression'] as const) {
  test(`HADS: границы 7/8 и 10/11 по подшкале ${sub}`, () => {
    const expected: Array<[number, string]> = [
      [7, 'norm'],
      [8, 'subclinical'],
      [10, 'subclinical'],
      [11, 'clinical'],
    ]
    for (const [sum, category] of expected) {
      const r = result(withSum(sub, sum))
      assert.equal(r[sub].raw, sum)
      assert.equal(r[sub].category?.id, category, `${sub} = ${sum}`)
      const other = sub === 'anxiety' ? r.depression : r.anxiety
      assert.equal(other.raw, 0, 'вторая подшкала не меняется')
    }
  })
}

test('HADS: в результате ровно две подшкалы, общей суммы нет', () => {
  const r = result(pick((v) => v[0]))
  assert.deepEqual(
    r.list.map((s) => s.id),
    ['anxiety', 'depression'],
  )
  assert.deepEqual(
    hads.subscales.map((s) => s.id),
    ['anxiety', 'depression'],
  )
})

test('HADS: направление баллов — первый вариант 0 у пунктов 2, 4, 7, 9, 12, 14, у остальных 3', () => {
  const ascending = new Set(['2', '4', '7', '9', '12', '14'])
  for (const item of hads.items) {
    const points = item.options.map((o) => Object.values(o.scores)[0])
    assert.deepEqual(points, ascending.has(item.id) ? [0, 1, 2, 3] : [3, 2, 1, 0], `пункт ${item.id}`)
  }
})
