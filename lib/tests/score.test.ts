import { test } from 'node:test'
import assert from 'node:assert/strict'
import { score, validateScale } from './score.ts'
import type { Scale } from './types.ts'

/** Игрушечная шкала: два пункта, второй обратный, строгий порог в сотых */
const toy: Scale = {
  slug: 'toy',
  title: 'Игрушечная шкала',
  shortTitle: 'Игрушка',
  measures: '',
  minutes: 1,
  parts: [],
  items: [
    {
      id: '1',
      text: 'Прямой',
      options: [
        { value: 1, label: 'нет', scores: { s: 0 } },
        { value: 2, label: 'да', scores: { s: 150 } },
      ],
    },
    {
      id: '2',
      text: 'Обратный, варианты показаны в обратном порядке',
      options: [
        { value: 2, label: 'да', scores: { s: 0 } },
        { value: 1, label: 'нет', scores: { s: 128 } },
      ],
    },
    { id: '3', text: 'Не считается', options: [{ value: 1, label: 'а', scores: {} }, { value: 2, label: 'б', scores: {} }] },
    { id: '3а', text: 'Обнуляет пункт 1', options: [{ value: 0, label: 'нет', scores: {} }, { value: 1, label: 'да', scores: {} }] },
  ],
  subscales: [
    {
      id: 's',
      title: 'S',
      min: 0,
      max: 278,
      divisor: 100,
      categories: [
        { id: 'low', min: -Infinity, max: 128, label: 'до +1,28 включительно', severity: 0 },
        { id: 'high', min: 129, max: Infinity, label: 'больше +1,28', severity: 1 },
      ],
    },
  ],
  modifiers: [{ kind: 'zeroIf', item: '1', ifItem: '3а', equals: 1 }],
  riskFlags: [{ id: 'risk', item: '1', levels: { 2: 2 } }],
  sources: [],
  methodology: { scoring: [], notes: [], pitfalls: [] },
}

const full = { '1': 1, '2': 2, '3': 1, '3а': 0 }

test('валидная шкала проходит самопроверку', () => {
  assert.deepEqual(validateScale(toy), [])
})

test('неполные ответы не считаются', () => {
  const r = score(toy, { '1': 1, '3': 1, '3а': 0 })
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.missing, ['2'])
})

test('недопустимое значение отклоняется', () => {
  const r = score(toy, { ...full, '2': 7 })
  assert.equal(r.ok, false)
  assert.deepEqual(!r.ok && r.invalid, ['2'])
})

test('ответ определяется значением, а не позицией варианта', () => {
  const r = score(toy, { ...full, '2': 1 })
  assert.ok(r.ok)
  assert.equal(r.subscales[0].raw, 128)
})

test('строгий порог: ровно 128 ещё не «больше», 129 уже да', () => {
  const at = score(toy, { ...full, '2': 1 })
  assert.ok(at.ok)
  assert.equal(at.subscales[0].category?.id, 'low')
  assert.equal(at.subscales[0].value, 1.28)
})

test('пункты без вклада не влияют на сумму', () => {
  const a = score(toy, { ...full, '3': 1 })
  const b = score(toy, { ...full, '3': 2 })
  assert.ok(a.ok && b.ok)
  assert.equal(a.subscales[0].raw, b.subscales[0].raw)
})

test('модификатор обнуляет пункт', () => {
  const r = score(toy, { ...full, '1': 2, '3а': 1 })
  assert.ok(r.ok)
  assert.equal(r.subscales[0].raw, 0)
})

test('флаг риска не зависит от суммы и модификаторов', () => {
  const r = score(toy, { ...full, '1': 2, '3а': 1 })
  assert.ok(r.ok)
  assert.deepEqual(r.flags, [{ id: 'risk', level: 2 }])
  const none = score(toy, full)
  assert.ok(none.ok)
  assert.deepEqual(none.flags, [])
})

test('самопроверка ловит дыру между категориями и неверный максимум', () => {
  const broken: Scale = {
    ...toy,
    subscales: [
      {
        ...toy.subscales[0],
        max: 300,
        categories: [
          { id: 'a', min: 0, max: 6, label: 'меньше 7', severity: 0 },
          { id: 'b', min: 12, max: 300, label: 'больше 11', severity: 1 },
        ],
      },
    ],
  }
  const errors = validateScale(broken)
  assert.ok(errors.some((e) => e.includes('дыра')))
  assert.ok(errors.some((e) => e.includes('заявлено')))
})
