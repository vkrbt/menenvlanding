import { test } from 'node:test'
import assert from 'node:assert/strict'
import { categorize, score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { KEY, yakhinMendelevich as ym } from './yakhin-mendelevich.ts'

const ORDER = ['anxiety', 'neuroticDepression', 'asthenia', 'hystericalReaction', 'obsessivePhobic', 'autonomic']

function all(value: number): Answers {
  return Object.fromEntries(ym.items.map((i) => [i.id, value]))
}

function raws(answers: Answers): number[] {
  const r = score(ym, answers)
  assert.ok(r.ok)
  return ORDER.map((id) => r.subscales.find((s) => s.id === id)!.raw)
}

test('самопроверка шкалы проходит', () => {
  assert.deepEqual(validateScale(ym), [])
})

test('68 вопросов с id 1..68 и пятью вариантами 1..5', () => {
  assert.equal(ym.items.length, 68)
  assert.deepEqual(ym.items.map((i) => i.id), Array.from({ length: 68 }, (_, i) => String(i + 1)))
  for (const item of ym.items) {
    assert.deepEqual(item.options.map((o) => o.value).sort(), [1, 2, 3, 4, 5])
  }
  assert.deepEqual(
    ym.items[0].options.map((o) => [o.value, o.label]),
    [[1, 'Постоянно или всегда'], [2, 'Часто'], [3, 'Иногда'], [4, 'Редко'], [5, 'Никогда не было']],
  )
})

test('шесть шкал в порядке источника, без общего балла', () => {
  assert.deepEqual(ym.subscales.map((s) => s.id), ORDER)
  assert.ok(ym.subscales.every((s) => s.divisor === 100))
})

test('контрольный вектор: все ответы 5', () => {
  assert.deepEqual(raws(all(5)), [781, 779, 990, 724, 603, 1723])
  const r = score(ym, all(5))
  assert.ok(r.ok && r.subscales.every((s) => s.category?.id === 'healthy'))
})

test('контрольный вектор: все ответы 1', () => {
  assert.deepEqual(raws(all(1)), [-1140, -1312, -1331, -1372, -1085, -2717])
  const r = score(ym, all(1))
  assert.ok(r.ok && r.subscales.every((s) => s.category?.id === 'disorder'))
})

test('контрольный вектор: все ответы 3', () => {
  assert.deepEqual(raws(all(3)), [-19, -391, 84, -683, -470, -539])
  const r = score(ym, all(3))
  assert.ok(r.ok)
  assert.deepEqual(
    r.subscales.map((s) => s.category?.id),
    ['uncertain', 'disorder', 'uncertain', 'disorder', 'disorder', 'disorder'],
  )
})

test('теоретические минимум и максимум шкал', () => {
  assert.deepEqual(
    ym.subscales.map((s) => [s.min, s.max]),
    [[-1274, 1010], [-1377, 815], [-1365, 1120], [-1498, 785], [-1299, 660], [-2936, 1837]],
  )
})

test('пороги строгие: ±1,28 — неопределённый результат', () => {
  for (const s of ym.subscales) {
    assert.equal(categorize(s, 129)?.id, 'healthy')
    assert.equal(categorize(s, 128)?.id, 'uncertain')
    assert.equal(categorize(s, 0)?.id, 'uncertain')
    assert.equal(categorize(s, -128)?.id, 'uncertain')
    assert.equal(categorize(s, -129)?.id, 'disorder')
  }
})

test('вопросы 55 и 60 не входят ни в одну шкалу', () => {
  for (const id of ['55', '60']) {
    const item = ym.items.find((i) => i.id === id)!
    assert.ok(item.options.every((o) => Object.keys(o.scores).length === 0))
    for (const base of [1, 3, 5]) {
      const before = raws(all(base))
      for (const v of [1, 2, 3, 4, 5]) assert.deepEqual(raws({ ...all(base), [id]: v }), before)
    }
  }
})

test('состав шкал и вопросы из двух шкал', () => {
  const members = (sub: string) =>
    ym.items.filter((i) => sub in i.options[0].scores).map((i) => Number(i.id))
  assert.deepEqual(members('anxiety'), [6, 12, 26, 28, 32, 33, 37, 41, 50, 61])
  assert.deepEqual(members('neuroticDepression'), [2, 7, 15, 17, 18, 35, 48, 49, 58, 68])
  assert.deepEqual(members('asthenia'), [3, 8, 9, 10, 14, 16, 24, 27, 45, 62])
  assert.deepEqual(members('hystericalReaction'), [5, 21, 31, 34, 35, 36, 45, 47, 49, 57, 64])
  assert.deepEqual(members('obsessivePhobic'), [11, 13, 19, 38, 40, 46, 53, 56, 61, 66])
  assert.deepEqual(
    members('autonomic'),
    [1, 4, 6, 20, 22, 23, 25, 29, 30, 32, 39, 42, 43, 44, 51, 52, 54, 57, 59, 63, 65, 67],
  )
  assert.deepEqual(ORDER.map((id) => members(id).length), [10, 10, 10, 11, 10, 22])

  const double = ym.items.filter((i) => Object.keys(i.options[0].scores).length === 2).map((i) => Number(i.id))
  assert.deepEqual(double, [6, 32, 35, 45, 49, 57, 61])
  assert.ok(ym.items.every((i) => Object.keys(i.options[0].scores).length <= 2))
  assert.equal(ym.items.filter((i) => Object.keys(i.options[0].scores).length === 0).length, 2)
})

test('вопрос из двух шкал берёт коэффициент из строки каждой шкалы', () => {
  const opt = (id: string, value: number) => ym.items.find((i) => i.id === id)!.options.find((o) => o.value === value)!
  assert.deepEqual(opt('32', 4).scores, { anxiety: 41, autonomic: 42 })
  assert.deepEqual(opt('32', 5).scores, { anxiety: 130, autonomic: 119 })
  assert.deepEqual(opt('35', 3).scores, { neuroticDepression: -50, hystericalReaction: -52 })
  assert.deepEqual(opt('49', 4).scores, { neuroticDepression: 0, hystericalReaction: -10 })
  assert.deepEqual(opt('6', 1).scores, { anxiety: -133, autonomic: -133 })
})

test('спорные ячейки взяты по изданию 2005 года', () => {
  assert.equal(KEY.anxiety[32][1], -132)
  assert.equal(KEY.autonomic[43][1], -44)
  assert.equal(KEY.hystericalReaction[47][3], -10)
  const opt = (id: string, value: number) => ym.items.find((i) => i.id === id)!.options.find((o) => o.value === value)!
  assert.equal(opt('32', 2).scores.anxiety, -132)
  assert.equal(opt('43', 2).scores.autonomic, -44)
  assert.equal(opt('47', 4).scores.hystericalReaction, -10)
})

test('порядок показа вариантов не влияет на результат (ловушка перевёрнутых кодов)', () => {
  const reversed = { ...ym, items: ym.items.map((i) => ({ ...i, options: [...i.options].reverse() })) }
  const answers = Object.fromEntries(ym.items.map((i, n) => [i.id, (n % 5) + 1]))
  const a = score(ym, answers)
  const b = score(reversed, answers)
  assert.ok(a.ok && b.ok)
  assert.deepEqual(a.subscales.map((s) => s.raw), b.subscales.map((s) => s.raw))
})

test('неполный набор ответов не считается', () => {
  const answers = all(3)
  delete answers['60']
  const r = score(ym, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['60'])
})
