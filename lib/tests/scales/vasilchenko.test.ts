import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from '../score.ts'
import type { Answers } from '../types.ts'
import { vasilchenko } from './vasilchenko.ts'

const NA = 0

/** Ответы по векторам I–VII; value варианта = исходный индекс, 0 — не учитывается */
function answers(vector: string): Answers {
  const values = vector.split(' ').map(Number)
  assert.equal(values.length, 7)
  return Object.fromEntries(values.map((v, i) => [String(i + 1), v]))
}

function result(a: Answers) {
  const r = score(vasilchenko, a)
  assert.ok(r.ok, 'ответы должны считаться')
  const by = Object.fromEntries(r.subscales.map((s) => [s.id, s]))
  return { phenotype: by.phenotype, genotype: by.genotype, activity: by.activity }
}

const item = (id: string) => vasilchenko.items.find((i) => i.id === id)!
const label = (id: string, value: number) => item(id).options.find((o) => o.value === value)!.label

test('Васильченко: самопроверка данных', () => {
  assert.deepEqual(validateScale(vasilchenko), [])
})

test('Васильченко: графы таблицы 7 справочника 1990 года', () => {
  // I: 17 и позже = 1, 16 = 2, 15 = 3, 14 = 4, 13 = 5, 12 = 6, 11 = 7, 10 = 8, 9 и раньше = 9
  assert.equal(label('1', 1), '17 лет и позже')
  assert.equal(label('1', 4), '14 лет')
  assert.equal(label('1', 5), '13 лет')
  assert.equal(label('1', 9), '9 лет и раньше')
  // II: 19 и позже = 1, 17–18 = 2, 16 = 3, 15 = 4, 14 = 5, 13 = 6, 12 = 7, 11 = 8, 10 и раньше = 9
  assert.equal(label('2', 2), '17–18 лет')
  assert.equal(label('2', 4), '15 лет')
  assert.equal(label('2', 5), '14 лет')
  assert.equal(label('2', 9), '10 лет и раньше')
  // VI: графы 1 нет; «медовый месяц» = 2, 1 год = 3 … 30 и больше = 9
  assert.ok(!item('6').options.some((o) => o.value === 1))
  assert.equal(label('6', 2), 'Сразу после медового месяца')
  assert.equal(label('6', 9), 'Через 30 лет и больше')
  // VII: до 22 = 2 … 51 и больше = 9
  assert.equal(label('7', 2), 'До 22 лет')
  assert.equal(label('7', 6), '37–40 лет')
})

test('Васильченко: трохантерный индекс — полосы граф и границы', () => {
  const m = item('3').measure!
  const band = (a: number, b: number) => m.bands.find((x) => Math.round((a / b) * 100) <= x.upTo)!.value
  const cases: Array<[number, number]> = [
    [185, 1], [186, 2], [189, 2], [190, 3], [191, 3], [192, 4], [194, 4],
    [195, 5], [196, 5], [197, 6], [198, 6], [199, 7], [200, 8], [201, 9], [216, 9], [170, 1],
  ]
  for (const [hundredths, value] of cases) {
    assert.equal(band(hundredths, 100), value, `индекс ${hundredths / 100}`)
  }
  // Рост 180 см, нога 90 см → 2,00 → графа 8; 176 / 90 = 1,9556 → 1,96 → графа 5
  assert.equal(band(180, 90), 8)
  assert.equal(band(176, 90), 5)
})

test('Васильченко: среднее по учтённым векторам, Кг и Ка отдельно', () => {
  // I=5, II=5, III=5, IV — мужской тип (4–6, плывёт к 5), V=5, VI=5, VII=5 → всё 5,00
  const r = result(answers('5 5 5 4 5 5 5'))
  assert.equal(r.phenotype.value, 5)
  assert.equal(r.phenotype.count, 7)
  assert.equal(r.phenotype.category?.label, 'средняя')
  assert.equal(r.genotype.value, 5)
  assert.equal(r.activity.value, 5)
})

test('Васильченко: «не помню» и «не относится» не идут в делитель', () => {
  // I не помню, II=3, III=4, IV=3 (тенденция к горизонтали), V=3, VI и VII не относятся
  const r = result(answers(`${NA} 3 4 3 3 ${NA} ${NA}`))
  assert.equal(r.phenotype.count, 4)
  assert.equal(r.phenotype.raw, 325) // (3+4+3+3)/4 = 3,25
  assert.equal(r.phenotype.category?.label, 'слабая')
  assert.equal(r.genotype.count, 3)
  assert.equal(r.genotype.raw, 333) // 10/3 = 3,33
  assert.equal(r.activity.count, 1)
  assert.equal(r.activity.raw, 300)
})

test('Васильченко: Ка без ответов не считается', () => {
  const r = result(answers(`5 5 5 4 ${NA} ${NA} ${NA}`))
  assert.equal(r.activity.count, 0)
  assert.ok(Number.isNaN(r.activity.raw))
  assert.equal(r.activity.category, undefined)
  assert.equal(r.phenotype.count, 4)
})

test('Васильченко: плывущие графы оволосения берут значение, ближайшее к I–III', () => {
  // I–III = 2: «по мужскому типу» (4–6) → 4
  assert.equal(result(answers(`2 2 2 4 ${NA} ${NA} ${NA}`)).genotype.raw, 250) // (2+2+2+4)/4
  // I–III = 9: «по мужскому типу» → 6
  assert.equal(result(answers(`9 9 9 4 ${NA} ${NA} ${NA}`)).genotype.raw, 825) // (27+6)/4
  // I–III = 5: «с гипертрихозом» (7–9) → 7
  assert.equal(result(answers(`5 5 5 7 ${NA} ${NA} ${NA}`)).genotype.raw, 550) // (15+7)/4
  // I–III = 8: «с гипертрихозом» → 8; в Кф тот же вклад
  const r = result(answers('8 8 8 7 8 8 8'))
  assert.equal(r.genotype.raw, 800)
  assert.equal(r.phenotype.raw, 800)
})

test('Васильченко: граница x,5 — у нижней ступени (1 (1–1,5), 2 (1,6–2,5) …)', () => {
  // 1,5 — чрезвычайно слабая; 2,5 — очень слабая; 3,5 — слабая
  const r = (v: string) => result(answers(v)).phenotype
  assert.equal(r(`2 1 1 2 ${NA} ${NA} ${NA}`).raw, 150) // (2+1+1+2)/4
  assert.equal(r(`2 1 1 2 ${NA} ${NA} ${NA}`).category?.label, 'чрезвычайно слабая')
  assert.equal(r(`3 2 2 3 ${NA} ${NA} ${NA}`).raw, 250)
  assert.equal(r(`3 2 2 3 ${NA} ${NA} ${NA}`).category?.label, 'очень слабая')
  assert.equal(r(`4 3 3 3 ${NA} ${NA} ${NA}`).raw, 325)
  assert.equal(r(`4 4 3 3 ${NA} ${NA} ${NA}`).raw, 350)
  assert.equal(r(`4 4 3 3 ${NA} ${NA} ${NA}`).category?.label, 'слабая')
  // 32/7 = 4,57 → «средняя» (4,6–5,5 после округления до десятых)
  assert.equal(r('5 5 5 4 4 4 4').raw, 457)
  assert.equal(r('5 5 5 4 4 4 4').category?.label, 'средняя')
  assert.equal(r('9 9 9 7 9 9 9').category?.label, 'чрезвычайно сильная')
})

test('Васильченко: VII пропускается, если VI «не относится»', () => {
  assert.deepEqual(item('7').skipIf, { ifItem: '6', equals: NA, value: NA })
})

test('Васильченко: типологическая шкала — без совета «к специалисту по высоким баллам»', () => {
  assert.equal(vasilchenko.typology, true)
  const r = result(answers('9 9 9 7 9 9 9'))
  assert.equal(r.phenotype.category?.severity, 2)
})
