import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compute, botPayload, sourceFromSearch, typeText, PAYLOAD_RE, QUESTIONS, PART1, TOPICS, START_MAX, PARTNER_ONLY } from './loneliness.ts'

// Индексы вариантов: AGREE 0 «Точно да» … 4 «Точно нет»; WHO 0 n, 1 p, 2 f, 3 m, 4 t; TALK 0 ok, 1 b, 2 a
const WHO_INDEX = PART1.length
const TOPIC0 = PART1.length + 1

/** Ответ на утверждение, дающий заданную «нехватку» 0..4 с учётом обратных пунктов */
function agreeFor(lack: number, rev: boolean): number {
  const v = rev ? 4 - lack : lack // значение варианта
  return 4 - v // индекс в AGREE: значение 4 — индекс 0
}

function answers(o: { e: number; s: number; who?: number; talk?: number[] }): number[] {
  const out: number[] = PART1.map((q) => agreeFor(q.ax === 'E' ? o.e : o.s, q.rev))
  out.push(o.who ?? 2)
  out.push(...TOPICS.map((_, i) => o.talk?.[i] ?? 0))
  return out
}

test('18 вопросов: 10 утверждений, уточнение, 7 тем', () => {
  assert.equal(QUESTIONS.length, 18)
  assert.equal(PART1.filter((q) => q.ax === 'E').length, 5)
  assert.equal(PART1.filter((q) => q.ax === 'S').length, 5)
})

test('четыре типа по двум шкалам', () => {
  assert.equal(compute(answers({ e: 0, s: 0 })).type, 'A')
  assert.equal(compute(answers({ e: 4, s: 0 })).type, 'B')
  assert.equal(compute(answers({ e: 0, s: 4 })).type, 'C')
  assert.equal(compute(answers({ e: 4, s: 4 })).type, 'D')
  const r = compute(answers({ e: 4, s: 0 }))
  assert.equal(r.e, 100)
  assert.equal(r.s, 0)
})

test('порог 50 включительно', () => {
  // «Отчасти» везде = 2 из 4 = 50
  const r = compute(answers({ e: 2, s: 2 }))
  assert.equal(r.e, 50)
  assert.equal(r.s, 50)
  assert.equal(r.type, 'D')
  // 1 из 4 = 25 — ниже порога
  assert.equal(compute(answers({ e: 1, s: 1 })).type, 'A')
})

test('«Ни с кем, держу в себе» не пускает в «близкий есть»', () => {
  assert.equal(compute(answers({ e: 0, s: 0, who: 0 })).type, 'B')
  assert.equal(compute(answers({ e: 0, s: 4, who: 0 })).type, 'D')
})

test('молчаливые темы: барьер и отсутствие', () => {
  const talk = [2, 1, 0, 0, 1, 0, 2] // M не с кем, R молчу, K молчу, P не с кем
  const r = compute(answers({ e: 4, s: 0, who: 1, talk }))
  assert.deepEqual(r.silent.map((t) => [t.c, t.kind]), [['M', 'a'], ['R', 'b'], ['K', 'b'], ['P', 'a']])
  assert.equal(botPayload(r), 'l_B_100_0_p_MrkP')
})

test('текст про партнёршу — кроме типа C', () => {
  assert.ok(typeText(compute(answers({ e: 4, s: 0, who: 1 }))).endsWith(PARTNER_ONLY))
  assert.ok(!typeText(compute(answers({ e: 0, s: 4, who: 1 }))).endsWith(PARTNER_ONLY))
})

test('payload: без тем — «0», формат и лимит', () => {
  const r = compute(answers({ e: 0, s: 0 }))
  assert.equal(botPayload(r), 'l_A_0_0_f_0')
  assert.match(botPayload(r), PAYLOAD_RE)
  // Худший случай: трёхзначные числа, все 7 тем, длинный источник
  const worst = compute(answers({ e: 4, s: 4, who: 0, talk: [2, 2, 2, 2, 2, 2, 2] }))
  const long = 'instagram-' + 'x'.repeat(80)
  const p = botPayload(worst, long)
  assert.ok(p.length <= START_MAX, `${p.length}`)
  assert.match(p, PAYLOAD_RE)
  assert.ok(/^[A-Za-z0-9_-]+$/.test(p))
})

test('источник из UTM: только латиница, цифры и дефис', () => {
  assert.equal(sourceFromSearch('?utm_source=ig&utm_campaign=150_let!'), 'ig-150let')
  assert.equal(sourceFromSearch('?utm_source=bot'), 'bot')
  assert.equal(sourceFromSearch(''), '')
  const r = compute(answers({ e: 4, s: 0 }))
  assert.equal(botPayload(r, 'ig-150let'), 'l_B_100_0_f_0_ig-150let')
  assert.match(botPayload(r, 'ig-150let'), PAYLOAD_RE)
})

test('неполные ответы — ошибка', () => {
  const a = answers({ e: 0, s: 0 })
  a[WHO_INDEX] = null as unknown as number
  assert.throws(() => compute(a))
  assert.throws(() => compute(a.slice(0, TOPIC0)))
})
