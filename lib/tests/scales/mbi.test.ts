import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { mbi as scale } from './mbi.ts'

/** Ключ, переписанный из ресёрча независимо от файла шкалы */
const EI = [1, 2, 3, 6, 8, 13, 14, 16, 20]
const DP = [5, 10, 11, 15, 22]
const PU = [4, 7, 9, 12, 17, 18, 19, 21]

/** Мужские стены VSN13, табл. 2: верхняя граница сырого балла для стенов 1…9 */
const STEN_UPPER = {
  exhaustion: [5, 8, 11, 15, 18, 22, 30, 35, 40],
  depersonalization: [1, 2, 4, 7, 9, 12, 17, 20, 23],
}
/** РЛД: нижняя граница для стенов 1…9 (> 43, 41–43, 38–40, …, 17–21; 0–16 — стен 10) */
const PU_STEN_LOWER = [44, 41, 38, 35, 32, 29, 25, 22, 17]

function sten(sub: 'exhaustion' | 'depersonalization' | 'achievement', raw: number): number {
  if (sub === 'achievement') {
    const i = PU_STEN_LOWER.findIndex((low) => raw >= low)
    return i === -1 ? 10 : i + 1
  }
  const i = STEN_UPPER[sub].findIndex((up) => raw <= up)
  return i === -1 ? 10 : i + 1
}
const stenLevel = (s: number) => (s <= 3 ? 'low' : s <= 7 ? 'medium' : 'high')

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const fill = (fn: (n: number) => number): Answers => Object.fromEntries(range(1, 22).map((n) => [String(n), fn(n)]))

function run(answers: Answers) {
  const r = score(scale, answers)
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  const get = (id: string) => r.subscales.find((s) => s.id === id)!
  return { ei: get('exhaustion'), dp: get('depersonalization'), pu: get('achievement'), count: r.subscales.length }
}

/** Ответы, дающие подшкале ровно target баллов; п. 6 обратный */
function answersFor(ids: number[], target: number): Answers {
  const answers = fill((n) => (n === 6 ? 6 : 0))
  let left = target
  for (const n of ids) {
    const pts = Math.min(6, left)
    left -= pts
    answers[String(n)] = n === 6 ? 6 - pts : pts
  }
  assert.equal(left, 0)
  return answers
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('ключ совпадает с методикой, 22 пункта, шкала 0–6', () => {
  assert.equal(scale.items.length, 22)
  assert.deepEqual(
    scale.items[0].options.map((o) => [o.value, o.label]),
    [[0, 'Никогда'], [1, 'Очень редко'], [2, 'Редко'], [3, 'Иногда'], [4, 'Часто'], [5, 'Очень часто'], [6, 'Каждый день']],
  )
  for (const item of scale.items) {
    const n = Number(item.id)
    const sub = EI.includes(n) ? 'exhaustion' : DP.includes(n) ? 'depersonalization' : 'achievement'
    assert.ok([...EI, ...DP, ...PU].includes(n))
    assert.deepEqual(
      item.options.map((o) => o.scores),
      range(0, 6).map((v) => ({ [sub]: n === 6 ? 6 - v : v })),
      `пункт ${n}`,
    )
  }
  assert.deepEqual(scale.subscales.map((s) => [s.id, s.max]), [['exhaustion', 54], ['depersonalization', 30], ['achievement', 48]])
})

test('пункт 6 обратный: «Каждый день» даёт 0, «Никогда» — 6', () => {
  const base = fill(() => 3)
  assert.equal(run({ ...base, '6': 0 }).ei.raw - run({ ...base, '6': 6 }).ei.raw, 6)
  const item = scale.items.find((i) => i.id === '6')!
  assert.deepEqual(item.options.find((o) => o.value === 6)!.scores, { exhaustion: 0 })
  assert.deepEqual(item.options.find((o) => o.value === 0)!.scores, { exhaustion: 6 })
  // Соседний прямой пункт ведёт себя наоборот
  assert.equal(run({ ...base, '8': 6 }).ei.raw - run({ ...base, '8': 0 }).ei.raw, 6)
})

test('контрольные векторы M1–M7', () => {
  const cases: Array<[string, (n: number) => number, number, number, number, [string, string, string]]> = [
    ['M1 все 0', () => 0, 6, 0, 0, ['low', 'low', 'high']],
    ['M2 все 6', () => 6, 48, 30, 48, ['high', 'high', 'low']],
    ['M3 максимум', (n) => (n === 6 ? 0 : PU.includes(n) ? 0 : 6), 54, 30, 0, ['high', 'high', 'high']],
    ['M4 минимум', (n) => (n === 6 ? 6 : PU.includes(n) ? 6 : 0), 0, 0, 48, ['low', 'low', 'low']],
    ['M5 все 3', () => 3, 27, 15, 24, ['medium', 'medium', 'high']],
    ['M6 все 0, п. 6 = 6', (n) => (n === 6 ? 6 : 0), 0, 0, 0, ['low', 'low', 'high']],
    ['M7', (n) => (n === 6 || PU.includes(n) ? 4 : 2), 18, 10, 32, ['medium', 'medium', 'medium']],
  ]
  for (const [name, fn, ei, dp, pu, levels] of cases) {
    const r = run(fill(fn))
    assert.equal(r.ei.raw, ei, `${name}: ЭИ`)
    assert.equal(r.dp.raw, dp, `${name}: ДП`)
    assert.equal(r.pu.raw, pu, `${name}: ПУ`)
    assert.deepEqual([r.ei.category?.id, r.dp.category?.id, r.pu.category?.id], levels, name)
    assert.equal(r.count, 3, 'интегрального показателя нет')
  }
})

test('категории совпадают со стенами 1–3 / 4–7 / 8–10 для каждого сырого балла', () => {
  for (const s of scale.subscales) {
    const sub = s.id as 'exhaustion' | 'depersonalization' | 'achievement'
    for (let raw = s.min; raw <= s.max; raw++) {
      const cat = s.categories.find((c) => raw >= c.min && raw <= c.max)
      assert.equal(cat?.id, stenLevel(sten(sub, raw)), `${sub} = ${raw}`)
    }
  }
})

test('граничные проверки стенов из ресёрча', () => {
  assert.deepEqual([5, 6, 22, 23, 30, 31].map((r) => sten('exhaustion', r)), [1, 2, 6, 7, 7, 8])
  assert.deepEqual([1, 2, 23, 24].map((r) => sten('depersonalization', r)), [1, 2, 9, 10])
  assert.deepEqual([44, 43, 17, 16].map((r) => sten('achievement', r)), [1, 2, 9, 10])
})

test('границы категорий через score()', () => {
  const cases: Array<[number[], 'ei' | 'dp' | 'pu', number, string]> = [
    [EI, 'ei', 11, 'low'], [EI, 'ei', 12, 'medium'], [EI, 'ei', 30, 'medium'], [EI, 'ei', 31, 'high'],
    [DP, 'dp', 4, 'low'], [DP, 'dp', 5, 'medium'], [DP, 'dp', 17, 'medium'], [DP, 'dp', 18, 'high'],
    [PU, 'pu', 38, 'low'], [PU, 'pu', 37, 'medium'], [PU, 'pu', 25, 'medium'], [PU, 'pu', 24, 'high'],
  ]
  for (const [ids, key, target, cat] of cases) {
    const r = run(answersFor(ids, target))[key]
    assert.equal(r.raw, target, `${key} = ${target}`)
    assert.equal(r.category?.id, cat, `${key} = ${target}`)
  }
})

test('редукция достижений: высокий сырой балл — низкое выгорание', () => {
  const pu = scale.subscales.find((s) => s.id === 'achievement')!
  const at = (raw: number) => pu.categories.find((c) => raw >= c.min && raw <= c.max)!
  assert.equal(at(48).severity, 0)
  assert.equal(at(0).severity, 2)
})

test('неполные ответы не считаются', () => {
  const answers = fill(() => 2)
  delete answers['22']
  const r = score(scale, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['22'])
})
