import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { sa20 } from './sa20.ts'

/** n ответов «да» с начала бланка, остальные «нет» */
function yes(n: number): Answers {
  return Object.fromEntries(sa20.items.map((item, i) => [item.id, i < n ? 1 : 0]))
}

function category(a: Answers) {
  const r = score(sa20, a)
  assert.ok(r.ok, 'ответы должны считаться')
  return r.subscales[0].category?.id
}

test('20 вопросов SA: самопроверка данных', () => {
  assert.deepEqual(validateScale(sa20), [])
  assert.equal(sa20.items.length, 20)
})

// Границы сверены прохождениями оригинала на onlinetestpad 2026-11-04
test('20 вопросов SA: границы как в оригинале', () => {
  const expected: Array<[number, string]> = [
    [0, 'none'], [2, 'none'],
    [3, 'light'], [4, 'light'],
    [5, 'present'], [9, 'present'],
    [10, 'moderate'], [14, 'moderate'],
    [15, 'severe'], [20, 'severe'],
  ]
  for (const [n, id] of expected) assert.equal(category(yes(n)), id, `${n} «да»`)
})

test('20 вопросов SA: «нет постоянного партнёра» в вопросе 19 баллов не даёт', () => {
  const a = { ...yes(2), '19': 2 }
  assert.equal(category(a), 'none')
  assert.equal(category({ ...yes(2), '19': 1 }), 'light')
})
