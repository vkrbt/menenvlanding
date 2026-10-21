import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { SAST_CUTOFF, SAST_ORIGINAL, sast } from './sast.ts'

/** n ответов «да» с начала бланка, остальные «нет» */
function yes(n: number): Answers {
  return Object.fromEntries(sast.items.map((item, i) => [item.id, i < n ? 1 : 0]))
}

function total(a: Answers) {
  const r = score(sast, a)
  assert.ok(r.ok, 'ответы должны считаться')
  return r.subscales[0]
}

test('SAST: самопроверка данных', () => {
  assert.deepEqual(validateScale(sast), [])
})

test('SAST: 25 пунктов, «да» = 1, «нет» = 0, обратных нет', () => {
  assert.equal(sast.items.length, 25)
  assert.equal(SAST_ORIGINAL.length, 25)
  assert.deepEqual(
    sast.items.map((i) => i.id),
    Array.from({ length: 25 }, (_, i) => String(i + 1)),
  )
  for (const item of sast.items) {
    assert.deepEqual(
      item.options.map((o) => [o.label, o.scores.total]),
      [
        ['Да', 1],
        ['Нет', 0],
      ],
    )
  }
})

test('SAST: перевод не повторяет ошибки ходовой русской версии', () => {
  const t = (n: number) => sast.items[n - 1].text
  // 7 и 24 — прямые формулировки («трудно остановиться», «управляет тобой»), а не «можете ли контролировать»
  assert.match(SAST_ORIGINAL[6], /trouble stopping/)
  assert.match(t(7), /Трудно ли тебе остановиться/)
  assert.match(SAST_ORIGINAL[23], /controlled by your sexual desire/)
  assert.doesNotMatch(t(24), /можешь|контролировать/i)
  // 23 — minors = несовершеннолетние, не «сексуальные меньшинства»
  assert.match(SAST_ORIGINAL[22], /minors/)
  assert.match(t(23), /несовершеннолетн/)
  assert.doesNotMatch(t(23), /меньшинств/)
  // 5 — «not normal»
  assert.match(SAST_ORIGINAL[4], /not normal/)
  assert.match(t(5), /ненормально/)
})

test('SAST: порог 13 с обеих сторон', () => {
  assert.equal(SAST_CUTOFF, 13)
  const expected: Array<[number, string, number]> = [
    [0, 'below', 0],
    [12, 'below', 0],
    [13, 'above', 2],
    [25, 'above', 2],
  ]
  for (const [n, category, severity] of expected) {
    const t = total(yes(n))
    assert.equal(t.raw, n)
    assert.equal(t.category?.id, category, `${n} «да»`)
    assert.equal(t.category?.severity, severity)
  }
})

test('SAST: 24 ответа не считаются', () => {
  const a = yes(5)
  delete a['25']
  assert.deepEqual(score(sast, a), { ok: false, missing: ['25'], invalid: [] })
})
