import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { pss10 as scale } from './pss10.ts'

/** Ключ, переписанный из методики независимо от файла шкалы (§2.3 ресёрча) */
const REVERSE = [4, 5, 7, 8]
const DIRECT = [1, 2, 3, 6, 9, 10]

const fromList = (list: number[]): Answers => Object.fromEntries(list.map((v, i) => [String(i + 1), v]))

function run(answers: Answers) {
  const r = score(scale, answers)
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  assert.equal(r.subscales.length, 1)
  return r.subscales[0]
}

/** Ответы с суммой target: минимум (прямые 0, обратные 4), затем добавляем по пунктам */
function answersFor(target: number): Answers {
  let rest = target
  const list = Array.from({ length: 10 }, (_, i) => {
    const add = Math.min(4, rest)
    rest -= add
    return REVERSE.includes(i + 1) ? 4 - add : add
  })
  assert.equal(rest, 0)
  return fromList(list)
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('ключ совпадает с методикой: обратные 4, 5, 7, 8', () => {
  assert.equal(scale.items.length, 10)
  for (const item of scale.items) {
    const reversed = REVERSE.includes(Number(item.id))
    assert.deepEqual(
      item.options.map((o) => [o.value, o.scores.total]),
      [0, 1, 2, 3, 4].map((v) => [v, reversed ? 4 - v : v]),
      `пункт ${item.id}`,
    )
    assert.deepEqual(
      item.options.map((o) => o.label),
      ['Никогда', 'Почти никогда', 'Иногда', 'Часто', 'Очень часто'],
    )
  }
  assert.deepEqual([...DIRECT, ...REVERSE].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.equal(scale.timeframe, 'за последний месяц')
})

test('пункт 8 — редакционная правка «владеете ситуацией»', () => {
  const text = scale.items[7].text
  assert.equal(text, 'В течение прошедшего месяца как часто Вы чувствовали, что владеете ситуацией?')
  assert.doesNotMatch(text, /вершине успеха/)
  assert.ok(scale.methodology.notes.some((n) => n.includes('на вершине успеха')), 'оригинал Золотаревой назван в notes')
})

test('тестовые векторы P1–P12 (§6.1)', () => {
  const cases: Array<[string, number[], number]> = [
    ['P1 все «никогда»', Array(10).fill(0), 16],
    ['P2 все «очень часто»', Array(10).fill(4), 24],
    ['P3 все «иногда»', Array(10).fill(2), 20],
    ['P4 минимум', [0, 0, 0, 4, 4, 0, 4, 4, 0, 0], 0],
    ['P5 максимум', [4, 4, 4, 0, 0, 4, 0, 0, 4, 4], 40],
    ['P6', [2, 2, 2, 4, 4, 2, 4, 3, 2, 2], 13],
    ['P7', [3, 2, 2, 4, 4, 2, 4, 3, 2, 2], 14],
    ['P8', [4, 4, 4, 3, 3, 4, 4, 4, 4, 4], 26],
    ['P9', [4, 4, 4, 3, 3, 4, 3, 4, 4, 4], 27],
    ['P10 изоляция п4', [0, 0, 0, 0, 4, 0, 4, 4, 0, 0], 4],
    ['P11 изоляция п8', [0, 0, 0, 4, 4, 0, 4, 0, 0, 0], 4],
    ['P12 прямой п1', [4, 0, 0, 4, 4, 0, 4, 4, 0, 0], 4],
  ]
  for (const [name, list, total] of cases) {
    assert.equal(run(fromList(list)).raw, total, name)
  }
})

test('каждый обратный пункт по отдельности: «никогда» = 4, «очень часто» = 0', () => {
  const min = fromList([0, 0, 0, 4, 4, 0, 4, 4, 0, 0])
  for (const n of REVERSE) {
    for (let v = 0; v <= 4; v++) {
      assert.equal(run({ ...min, [String(n)]: v }).raw, 4 - v, `пункт ${n}, ответ ${v}`)
    }
  }
  for (const n of DIRECT) {
    assert.equal(run({ ...min, [String(n)]: 4 }).raw, 4, `прямой пункт ${n}`)
  }
})

test('границы категорий 10/11 и 21/22 с обеих сторон', () => {
  const expected: Array<[number, string]> = [
    [0, 'below'],
    [10, 'below'],
    [11, 'average'],
    [16, 'average'],
    [21, 'average'],
    [22, 'above'],
    [40, 'above'],
  ]
  for (const [target, category] of expected) {
    const r = run(answersFor(target))
    assert.equal(r.raw, target)
    assert.equal(r.category?.id, category, `${target} баллов`)
  }
})

test('границы — целые за пределами M ± 1 SD нормы мужчин (16,00 ± 5,94)', () => {
  const [M, SD] = [16.0, 5.94]
  const [below, average, above] = scale.subscales[0].categories
  assert.ok(below.max < M - SD && average.min > M - SD)
  assert.ok(average.max < M + SD && above.min > M + SD)
  assert.deepEqual(
    scale.subscales[0].categories.map((c) => c.severity),
    [0, 0, 1],
  )
})

test('неполные ответы не считаются', () => {
  const answers = fromList(Array(10).fill(2))
  delete answers['8']
  const r = score(scale, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['8'])
})
