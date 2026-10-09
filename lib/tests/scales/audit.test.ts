import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { audit } from './audit.ts'

/** Ответы Q1…Q10 баллами, как в ресёрче */
function answers(values: number[]): Answers {
  assert.equal(values.length, 10)
  return Object.fromEntries(values.map((v, i) => [String(i + 1), v]))
}

/** Подстановка пропущенных ответов — как делает TestRunner перед подсчётом */
function fillSkipped(a: Answers): Answers {
  const out = { ...a }
  for (const item of audit.items) {
    if (item.skipIf && out[item.skipIf.ifItem] === item.skipIf.equals) out[item.id] = item.skipIf.value
  }
  return out
}

function total(a: Answers) {
  const r = score(audit, a)
  assert.ok(r.ok, 'ответы должны считаться')
  assert.deepEqual(r.flags, [])
  return r.subscales[0]
}

/** Заменить ответ одного вопроса */
const with_ = (base: number[], q: number, v: number) => base.map((x, i) => (i === q - 1 ? v : x))

test('AUDIT: самопроверка данных', () => {
  assert.deepEqual(validateScale(audit), [])
})

test('AUDIT: 10 вопросов, value = балл, у 1–8 баллы 0–4, у 9–10 — 0/2/4', () => {
  assert.deepEqual(
    audit.items.map((i) => i.id),
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  )
  for (const item of audit.items) {
    const expected = Number(item.id) >= 9 ? [0, 2, 4] : [0, 1, 2, 3, 4]
    assert.deepEqual(
      item.options.map((o) => o.value),
      expected,
      `вопрос ${item.id}`,
    )
    for (const o of item.options) assert.deepEqual(o.scores, { total: o.value })
  }
  assert.deepEqual(
    audit.items[8].options.map((o) => o.label),
    ['Никогда', 'Да, более 12 месяцев назад', 'Да, в течение последних 12 месяцев'],
  )
})

test('AUDIT: skipIf стоит ровно на вопросах 2–8 и срабатывает на Q1 = «Никогда»', () => {
  const skipped = audit.items.filter((i) => i.skipIf).map((i) => i.id)
  assert.deepEqual(skipped, ['2', '3', '4', '5', '6', '7', '8'])
  for (const item of audit.items.filter((i) => i.skipIf)) {
    assert.deepEqual(item.skipIf, { ifItem: '1', equals: 0, value: 0 })
    // Автоответ 0 — допустимый вариант вопроса
    assert.ok(item.options.some((o) => o.value === 0 && o.scores.total === 0))
  }
  assert.equal(audit.items[0].options[0].label, 'Никогда')
  assert.equal(audit.items[0].options[0].value, 0)
})

test('AUDIT: пояснение о стандартной порции — у вопроса 2', () => {
  assert.match(audit.items[1].hint ?? '', /^Одна стандартная порция содержит 10 г этилового спирта\./)
})

// Векторы из plans/tests-research/audit.md, §8. Зона — мужская RUS-AUDIT (колонка «М»).
const vectors: Array<[string, number[], number, string]> = [
  ['T1', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 'zone-1'],
  ['T2', [4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 40, 'zone-4'],
  ['T3', [2, 1, 1, 0, 0, 0, 1, 0, 0, 2], 7, 'zone-1'],
  // 8: по ВОЗ 2001 зона II, по мужской RUS-AUDIT — I
  ['T4', [2, 2, 2, 0, 0, 0, 2, 0, 0, 0], 8, 'zone-1'],
  ['T5', [2, 2, 2, 0, 0, 0, 2, 1, 0, 0], 9, 'zone-2'],
  ['T6', [3, 2, 2, 1, 1, 0, 2, 0, 0, 2], 13, 'zone-2'],
  // 14: по ВОЗ 2001 зона II, по мужской RUS-AUDIT — III
  ['T7', [3, 2, 2, 1, 1, 1, 2, 0, 0, 2], 14, 'zone-3'],
  ['T8', [3, 2, 2, 1, 1, 1, 2, 0, 0, 4], 16, 'zone-3'],
  // 17: по ВОЗ 2001 зона III, по мужской RUS-AUDIT — IV
  ['T9', [3, 2, 2, 1, 1, 1, 2, 1, 0, 4], 17, 'zone-4'],
  ['T10', [4, 3, 3, 2, 1, 1, 1, 0, 0, 4], 19, 'zone-4'],
  ['T11', [4, 3, 3, 2, 1, 1, 1, 1, 0, 4], 20, 'zone-4'],
  // T13 и T14 в ресёрче проверяют женские границы 4/5 и 9/10/11; здесь — те же векторы по мужским порогам
  ['T13a', [1, 0, 1, 0, 0, 0, 0, 0, 0, 2], 4, 'zone-1'],
  ['T13b', [1, 0, 1, 0, 0, 0, 1, 0, 0, 2], 5, 'zone-1'],
  ['T14a', [2, 1, 1, 1, 0, 0, 2, 0, 0, 2], 9, 'zone-2'],
  ['T14b', [2, 1, 1, 1, 0, 0, 2, 1, 0, 2], 10, 'zone-2'],
  ['T14c', [2, 1, 1, 1, 0, 1, 2, 1, 0, 2], 11, 'zone-2'],
  // T17: правило эскалации ВОЗ 2001 в RUS-AUDIT не входит — только сумма, зона II
  ['T17', [2, 2, 2, 0, 0, 2, 2, 1, 0, 0], 11, 'zone-2'],
]

for (const [name, values, sum, zone] of vectors) {
  test(`AUDIT: ${name} → ${sum}, ${zone}`, () => {
    const t = total(answers(values))
    assert.equal(t.raw, sum)
    assert.equal(t.value, sum)
    assert.equal(t.category?.id, zone)
  })
}

test('AUDIT: T12 — Q1 = «Никогда», Q2–8 подставляются нулями, Q9 = 2, Q10 = 4 → 6, зона I', () => {
  const a = fillSkipped({ '1': 0, '9': 2, '10': 4 })
  assert.deepEqual(a, answers([0, 0, 0, 0, 0, 0, 0, 0, 2, 4]))
  const t = total(a)
  assert.equal(t.raw, 6)
  assert.equal(t.category?.id, 'zone-1')
})

test('AUDIT: без Q1 = 0 пропуск не срабатывает', () => {
  assert.deepEqual(fillSkipped({ '1': 1 }), { '1': 1 })
})

test('AUDIT: T15 — Q9 или Q10 = 1 или 3 недопустимы', () => {
  for (const q of ['9', '10']) {
    for (const v of [1, 3]) {
      const a = { ...answers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), [q]: v }
      assert.deepEqual(score(audit, a), { ok: false, missing: [], invalid: [q] })
    }
  }
})

test('AUDIT: T16 — 7–9 СП (пример бланка: 200 мл водки + 500 мл пива ≈ 8 СП) = 3 балла', () => {
  const o = audit.items[1].options.find((x) => x.label === '7–9 СП')
  assert.equal(o?.value, 3)
  assert.equal(o?.scores.total, 3)
})

test('AUDIT: каждая граница мужских зон с обеих сторон', () => {
  // Сумма набирается вопросами 1–8 по 4 балла, остаток — следующим
  const withSum = (target: number) => {
    const v = Array(10).fill(0)
    let rest = target
    for (let i = 0; i < 8; i++) {
      v[i] = Math.min(4, rest)
      rest -= v[i]
    }
    assert.equal(rest, 0)
    return answers(v)
  }
  const expected: Array<[number, string, number]> = [
    [0, 'zone-1', 0],
    [8, 'zone-1', 0],
    [9, 'zone-2', 1],
    [13, 'zone-2', 1],
    [14, 'zone-3', 2],
    [16, 'zone-3', 2],
    [17, 'zone-4', 3],
    [32, 'zone-4', 3],
  ]
  for (const [sum, zone, severity] of expected) {
    const t = total(withSum(sum))
    assert.equal(t.raw, sum)
    assert.equal(t.category?.id, zone, `сумма ${sum}`)
    assert.equal(t.category?.severity, severity, `сумма ${sum}`)
  }
})

test('AUDIT: баллы 0/2/4 вопросов 9–10 входят в сумму', () => {
  for (const q of [9, 10]) {
    for (const v of [0, 2, 4]) {
      assert.equal(total(answers(with_(Array(10).fill(0), q, v))).raw, v, `вопрос ${q} = ${v}`)
    }
  }
})

test('AUDIT: пропуск ответа не считается', () => {
  const a = answers([1, 1, 1, 1, 1, 1, 1, 1, 0, 0])
  delete a['5']
  assert.deepEqual(score(audit, a), { ok: false, missing: ['5'], invalid: [] })
})
