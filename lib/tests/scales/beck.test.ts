import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { beck } from './beck.ts'

const NUMBERED = Array.from({ length: 21 }, (_, i) => String(i + 1))

/** Все пункты = value, в доп. вопросе к пункту 19 — «Нет» */
function all(value: number): Answers {
  return { ...Object.fromEntries(NUMBERED.map((id) => [id, value])), '19а': 0 }
}

/**
 * Набор ответов с заданной суммой. Пункт 9 не трогаем (остаётся 0),
 * чтобы флаг риска не мешал; баллы раскладываем по остальным пунктам.
 */
function withTotal(total: number): Answers {
  const answers = all(0)
  let rest = total
  for (const id of NUMBERED) {
    if (id === '9' || rest === 0) continue
    const v = Math.min(3, rest)
    answers[id] = v
    rest -= v
  }
  assert.equal(rest, 0, `сумму ${total} не собрать без пункта 9`)
  return answers
}

function run(answers: Answers) {
  const r = score(beck, answers)
  assert.ok(r.ok, 'ожидался полный набор ответов')
  const sub = (id: string) => r.subscales.find((s) => s.id === id)!
  return { total: sub('total'), ca: sub('ca'), sp: sub('sp'), flags: r.flags }
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(beck), [])
})

test('21 пункт и доп. вопрос «19а» сразу после пункта 19', () => {
  const ids = beck.items.map((i) => i.id)
  assert.equal(ids.length, 22)
  assert.equal(ids[ids.indexOf('19') + 1], '19а')
  for (const item of beck.items.filter((i) => i.id !== '19а')) {
    assert.deepEqual(item.options.map((o) => o.value), [0, 1, 2, 3])
  }
})

test('минимум 0 — нет депрессивных симптомов', () => {
  const r = run(all(0))
  assert.equal(r.total.raw, 0)
  assert.equal(r.total.category?.id, 'none')
})

test('максимум 63 — тяжёлая выраженность', () => {
  const r = run(all(3))
  assert.equal(r.total.raw, 63)
  assert.equal(r.total.category?.id, 'severe')
})

for (const [total, category] of [
  [9, 'none'],
  [10, 'moderate'],
  [18, 'moderate'],
  [19, 'critical'],
  [29, 'critical'],
  [30, 'severe'],
] as const) {
  test(`граница: итог ${total} → ${category}`, () => {
    const r = run(withTotal(total))
    assert.equal(r.total.raw, total)
    assert.equal(r.total.category?.id, category)
  })
}

test('итог 14 — не самая низкая категория (пороги BDI-II не применяются)', () => {
  const r = run(withTotal(14))
  assert.equal(r.total.category?.id, 'moderate')
})

test('пункт 19 = 3 и намеренное похудение «Да» → вклад 0', () => {
  const no = run({ ...all(0), '19': 3, '19а': 0 })
  const yes = run({ ...all(0), '19': 3, '19а': 1 })
  assert.equal(no.total.raw, 3)
  assert.equal(no.sp.raw, 3)
  assert.equal(yes.total.raw, 0)
  assert.equal(yes.sp.raw, 0)
})

test('при максимуме и «Да» в доп. вопросе итог 60', () => {
  assert.equal(run({ ...all(3), '19а': 1 }).total.raw, 60)
})

test('флаг риска по пункту 9 не зависит от суммы', () => {
  const expected = { 0: [], 1: [{ id: 'suicide', level: 1 }], 2: [{ id: 'suicide', level: 2 }], 3: [{ id: 'suicide', level: 2 }] }
  for (const v of [0, 1, 2, 3] as const) {
    const r = run({ ...all(0), '9': v })
    assert.equal(r.total.category?.id, 'none')
    assert.deepEqual(r.flags, expected[v])
  }
})

test('сценарий спеки: итог 3, пункт 9 = 2 → риск уровня 2, категория «нет»', () => {
  const r = run({ ...all(0), '9': 2, '1': 1 })
  assert.equal(r.total.raw, 3)
  assert.equal(r.total.category?.id, 'none')
  assert.deepEqual(r.flags, [{ id: 'suicide', level: 2 }])
})

test('без ответа на «19а» результат не считается', () => {
  const { '19а': _, ...partial } = all(0)
  const r = score(beck, partial)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['19а'])
})

test('подшкалы: пп. 1–13 в ca, пп. 14–21 в sp', () => {
  const answers = all(0)
  answers['1'] = 3
  answers['13'] = 2
  answers['14'] = 1
  answers['21'] = 3
  const r = run(answers)
  assert.equal(r.ca.raw, 5)
  assert.equal(r.sp.raw, 4)
  assert.equal(r.total.raw, 9)
  assert.equal(r.ca.category, undefined)
  assert.equal(r.sp.category, undefined)

  const max = run(all(3))
  assert.equal(max.ca.raw, 39)
  assert.equal(max.sp.raw, 24)
})
