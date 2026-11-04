import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Scale } from '../types.ts'
import { dabrinskayaFemale, dabrinskayaMale } from './dabrinskaya-constitution.ts'
import { FEMALE_RUNS, MALE_RUNS } from './dabrinskaya-constitution.runs.ts'

function verdict(scale: Scale, digits: string) {
  const answers = Object.fromEntries(scale.items.map((item, i) => [item.id, Number(digits[i])]))
  const r = score(scale, answers)
  assert.ok(r.ok, `ответы ${digits} должны считаться`)
  return r.subscales[0].category?.id
}

for (const [name, scale, runs] of [
  ['для парней', dabrinskayaMale, MALE_RUNS],
  ['для девушек', dabrinskayaFemale, FEMALE_RUNS],
] as const) {
  test(`Норма секса ${name}: самопроверка данных`, () => {
    assert.deepEqual(validateScale(scale), [])
  })

  test(`Норма секса ${name}: повторяет все ${runs.length} проходов оригинала`, () => {
    assert.ok(runs.length > 200)
    const wrong = runs.filter((run) => {
      const [digits, expected] = run.split(':')
      return verdict(scale, digits) !== expected
    })
    assert.deepEqual(wrong, [])
  })
}

test('Норма секса: при ничьей побеждает конституция, первой набравшая счёт', () => {
  // Слабая, слабая, средняя, сильная, средняя, «не было», «не было»: 2 : 2 : 1, слабая набрала 2 раньше
  assert.equal(verdict(dabrinskayaMale, '2210100'), 'weak')
  // Средняя, средняя, сильная, слабая, слабая, сильная, «не было»: 2 : 2 : 2, первой два набрала средняя
  assert.equal(verdict(dabrinskayaMale, '1103230'), 'medium')
})

test('Норма секса: замер трохантерного индекса выбирает вариант автора', () => {
  const pick = (scale: Scale, index: number) =>
    scale.items.find((i) => i.measure)!.measure!.bands.find((b) => index <= b.upTo)!.value
  assert.equal(pick(dabrinskayaMale, 194), 1) // 1,92–1,98 — средняя
  assert.equal(pick(dabrinskayaMale, 200), 0) // 1,99 и больше — сильная
  assert.equal(pick(dabrinskayaFemale, 206), 0) // более 2,05 — редкий вариант
  assert.equal(pick(dabrinskayaFemale, 190), 3) // менее 1,91 — слабая
})
