import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { dabrinskayaSa } from './dabrinskaya-sa.ts'

/** n ответов «да» с начала бланка, остальные «нет» */
function yes(n: number): Answers {
  return Object.fromEntries(dabrinskayaSa.items.map((item, i) => [item.id, i < n ? 1 : 0]))
}

function category(a: Answers) {
  const r = score(dabrinskayaSa, a)
  assert.ok(r.ok, 'ответы должны считаться')
  return r.subscales[0].category?.id
}

test('Дабринская, зависимость: самопроверка данных', () => {
  assert.deepEqual(validateScale(dabrinskayaSa), [])
  assert.equal(dabrinskayaSa.items.length, 20)
})

// Границы сверены прохождениями оригинала на onlinetestpad 2026-11-04
test('Дабринская, зависимость: границы как в оригинале', () => {
  const expected: Array<[number, string]> = [
    [0, 'none'], [2, 'none'],
    [3, 'light'], [4, 'light'],
    [5, 'present'], [9, 'present'],
    [10, 'moderate'], [14, 'moderate'],
    [15, 'severe'], [20, 'severe'],
  ]
  for (const [n, id] of expected) assert.equal(category(yes(n)), id, `${n} «да»`)
})

test('Дабринская, зависимость: «нет постоянного партнёра» в вопросе 19 баллов не даёт', () => {
  const a = { ...yes(2), '19': 2 }
  assert.equal(category(a), 'none')
  assert.equal(category({ ...yes(2), '19': 1 }), 'light')
})
