import { test } from 'node:test'
import assert from 'node:assert/strict'
import { categorize, score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { boyko as scale } from './boyko.ts'

/**
 * «Итоговый ключ для кода» из ресёрча, переписанный независимо от файла шкалы:
 * пункт → [симптом, баллы за «да», баллы за «нет»]. Порядок симптомов
 * Н1 Н2 Н3 Н4 | Р1 Р2 Р3 Р4 | И1 И2 И3 И4.
 */
const SYMPTOMS = [
  'traumaticCircumstances', 'selfDissatisfaction', 'cornered', 'anxietyDepression',
  'selectiveResponse', 'moralDisorientation', 'emotionalEconomy', 'dutiesReduction',
  'emotionalDeficit', 'emotionalDetachment', 'personalDetachment', 'psychosomatic',
]
const PHASES: Record<string, string[]> = {
  tension: SYMPTOMS.slice(0, 4),
  resistance: SYMPTOMS.slice(4, 8),
  exhaustion: SYMPTOMS.slice(8, 12),
}
// prettier-ignore
const WEIGHTS: Array<[number, number]> = [
  [2, 0], [0, 3], [10, 0], [2, 0], [5, 0], [10, 0], [2, 0], [5, 0], [3, 0], [2, 0], [5, 0], [3, 0],   // 1–12
  [3, 0], [2, 0], [5, 0], [3, 0], [0, 3], [0, 3], [10, 0], [5, 0], [2, 0], [3, 0], [3, 0], [2, 0],   // 13–24
  [2, 0], [2, 0], [2, 0], [5, 0], [10, 0], [3, 0], [0, 2], [2, 0], [5, 0], [0, 2], [3, 0], [5, 0],   // 25–36
  [0, 3], [0, 10], [2, 0], [5, 0], [2, 0], [5, 0], [5, 0], [0, 2], [0, 5], [3, 0], [5, 0], [3, 0],   // 37–48
  [10, 0], [0, 5], [5, 0], [10, 0], [2, 0], [2, 0], [3, 0], [3, 0], [3, 0], [5, 0], [5, 0], [2, 0],  // 49–60
  [5, 0], [5, 0], [1, 0], [2, 0], [3, 0], [2, 0], [3, 0], [3, 0], [0, 10], [5, 0], [2, 0], [10, 0],  // 61–72
  [0, 5], [3, 0], [0, 5], [3, 0], [5, 0], [0, 5], [0, 5], [10, 0], [2, 0], [10, 0], [10, 0], [5, 0], // 73–84
]
const REVERSED = [2, 17, 18, 31, 34, 37, 38, 44, 45, 50, 69, 73, 75, 78, 79]

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const fill = (fn: (n: number) => number): Answers => Object.fromEntries(range(1, 84).map((n) => [String(n), fn(n)]))
/** Ответ «по ключу»: «нет» на обратные, «да» на остальные */
const keyed = (n: number) => (REVERSED.includes(n) ? 0 : 1)
const against = (n: number) => 1 - keyed(n)

function run(answers: Answers) {
  const r = score(scale, answers)
  assert.ok(r.ok, 'ответы должны быть полными и допустимыми')
  const get = (id: string) => r.subscales.find((s) => s.id === id)!
  return {
    symptoms: SYMPTOMS.map((id) => get(id).raw),
    phases: Object.keys(PHASES).map((id) => get(id).raw),
    phaseCats: Object.keys(PHASES).map((id) => get(id).category?.id),
    total: get('total'),
    get,
  }
}

test('шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(scale), [])
})

test('порядок подшкал: 3 фазы, 12 симптомов, итог', () => {
  assert.deepEqual(scale.subscales.map((s) => s.id), [...Object.keys(PHASES), ...SYMPTOMS, 'total'])
  assert.deepEqual(scale.subscales.at(-1)!.categories, [])
})

test('диапазоны: И3 и «Истощение» на 3 балла больше, итог 363', () => {
  const max = Object.fromEntries(scale.subscales.map((s) => [s.id, s.max]))
  for (const id of SYMPTOMS) assert.equal(max[id], id === 'personalDetachment' ? 33 : 30, id)
  assert.deepEqual([max.tension, max.resistance, max.exhaustion, max.total], [120, 120, 123, 363])
  for (const s of scale.subscales) assert.equal(s.min, 0)
})

test('ключ по пунктам совпадает с итоговым ключом ресёрча', () => {
  assert.equal(scale.items.length, 84)
  for (const item of scale.items) {
    const n = Number(item.id)
    const [yes, no] = WEIGHTS[n - 1]
    const symptom = SYMPTOMS[(n - 1) % 12]
    const phase = Object.keys(PHASES).find((p) => PHASES[p].includes(symptom))!
    const expected = (pts: number) => ({ [symptom]: pts, [phase]: pts, total: pts })
    assert.deepEqual(
      item.options.map((o) => [o.value, o.label, o.scores]),
      [[1, 'Да', expected(yes)], [0, 'Нет', expected(no)]],
      `пункт ${n}`,
    )
    assert.equal(REVERSED.includes(n), no > 0, `пункт ${n}: направление`)
  }
})

test('пункт 71 входит в «личностную отстраненность», 72 — только в психосоматику', () => {
  const scoresOf = (id: string) => scale.items.find((i) => i.id === id)!.options.find((o) => o.value === 1)!.scores
  assert.deepEqual(scoresOf('71'), { personalDetachment: 2, exhaustion: 2, total: 2 })
  assert.deepEqual(scoresOf('72'), { psychosomatic: 10, exhaustion: 10, total: 10 })
})

test('контрольные векторы V1–V7', () => {
  const cases: Array<[string, (n: number) => number, number[], number[], number]> = [
    ['V1 все «да»', () => 1, [22, 12, 25, 30, 27, 22, 23, 28, 15, 28, 33, 30], [89, 100, 106], 295],
    ['V2 все «нет»', () => 0, [8, 18, 5, 0, 3, 8, 7, 2, 15, 2, 0, 0], [31, 20, 17], 68],
    ['V3 по ключу', keyed, [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 33, 30], [120, 120, 123], 363],
    ['V4 против ключа', against, Array(12).fill(0), [0, 0, 0], 0],
    ['V5 «да» на нечётные', (n) => n % 2, [22, 18, 25, 0, 27, 8, 23, 2, 15, 2, 33, 0], [65, 60, 50], 175],
    ['V6 как V4, «да» на 71', (n) => (n === 71 ? 1 : against(n)), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0], [0, 0, 2], 2],
    ['V7 как V4, «да» на 72', (n) => (n === 72 ? 1 : against(n)), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10], [0, 0, 10], 10],
  ]
  for (const [name, fn, symptoms, phases, total] of cases) {
    const r = run(fill(fn))
    assert.deepEqual(r.symptoms, symptoms, `${name}: симптомы`)
    assert.deepEqual(r.phases, phases, `${name}: фазы`)
    assert.equal(r.total.raw, total, `${name}: итог`)
    assert.equal(r.total.category, undefined, `${name}: у итога нет уровня`)
  }
})

test('уровни в векторах', () => {
  const v1 = run(fill(() => 1))
  assert.deepEqual(v1.phaseCats, ['formed', 'formed', 'formed'])
  assert.equal(v1.get('selfDissatisfaction').category?.id, 'forming')
  assert.equal(v1.get('emotionalDeficit').category?.id, 'forming')
  assert.equal(v1.get('cornered').category?.id, 'formed')
  const v2 = run(fill(() => 0))
  assert.deepEqual(v2.phaseCats, ['notFormed', 'notFormed', 'notFormed'])
  assert.equal(v2.get('selfDissatisfaction').category?.id, 'formed')
  assert.equal(v2.get('traumaticCircumstances').category?.id, 'notFormed')
  assert.deepEqual(run(fill((n) => n % 2)).phaseCats, ['formed', 'forming', 'forming'])
  const v7 = run(fill((n) => (n === 72 ? 1 : against(n))))
  assert.equal(v7.get('psychosomatic').category?.id, 'forming')
})

test('границы категорий симптома 9/10, 15/16 и фазы 36/37, 60/61', () => {
  const symptom = scale.subscales.find((s) => s.id === 'personalDetachment')!
  const symptomCases: Array<[number, string, 0 | 1 | 2]> = [
    [0, 'notFormed', 0], [9, 'notFormed', 0], [10, 'forming', 1], [15, 'forming', 1], [16, 'formed', 2], [33, 'formed', 2],
  ]
  for (const [raw, id, severity] of symptomCases) {
    const c = categorize(symptom, raw)
    assert.equal(c?.id, id, `симптом ${raw}`)
    assert.equal(c?.severity, severity)
  }
  const phase = scale.subscales.find((s) => s.id === 'exhaustion')!
  const phaseCases: Array<[number, string]> = [[0, 'notFormed'], [36, 'notFormed'], [37, 'forming'], [60, 'forming'], [61, 'formed'], [123, 'formed']]
  for (const [raw, id] of phaseCases) assert.equal(categorize(phase, raw)?.id, id, `фаза ${raw}`)
})

test('граница фазы через score(): «Резистенция» 60 в V5 — ещё в стадии формирования', () => {
  const r = run(fill((n) => n % 2))
  assert.equal(r.get('resistance').raw, 60)
  assert.equal(r.get('resistance').category?.id, 'forming')
})

test('неполные ответы не считаются', () => {
  const answers = fill(() => 1)
  delete answers['84']
  const r = score(scale, answers)
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['84'])
})
