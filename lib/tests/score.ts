import type { Answers, Category, Scale, ScoreResult, Subscale } from './types.ts'

/** Категория для целого балла; границы включительные */
export function categorize(subscale: Subscale, raw: number): Category | undefined {
  return subscale.categories.find((c) => raw >= c.min && raw <= c.max)
}

/**
 * Единственная функция подсчёта для всех шкал.
 *
 * Неполный или недопустимый набор ответов не считается вовсе: частичный
 * результат по опроснику хуже отсутствия результата.
 */
export function score(scale: Scale, answers: Answers): ScoreResult {
  const missing: string[] = []
  const invalid: string[] = []

  for (const item of scale.items) {
    const answer = answers[item.id]
    if (answer === undefined) missing.push(item.id)
    else if (!item.options.some((o) => o.value === answer)) invalid.push(item.id)
  }
  if (missing.length || invalid.length) return { ok: false, missing, invalid }

  const zeroed = new Set(
    (scale.modifiers ?? [])
      .filter((m) => answers[m.ifItem] === m.equals)
      .map((m) => m.item),
  )

  const totals = new Map<string, number>(scale.subscales.map((s) => [s.id, 0]))
  for (const item of scale.items) {
    if (zeroed.has(item.id)) continue
    const option = item.options.find((o) => o.value === answers[item.id])!
    for (const [sub, points] of Object.entries(option.scores)) {
      totals.set(sub, (totals.get(sub) ?? 0) + points)
    }
  }

  const flags = (scale.riskFlags ?? []).flatMap((f) => {
    const level = f.levels[answers[f.item]]
    return level ? [{ id: f.id, level }] : []
  })

  return {
    ok: true,
    subscales: scale.subscales.map((s) => {
      const raw = totals.get(s.id) ?? 0
      return { id: s.id, raw, value: raw / (s.divisor ?? 1), category: categorize(s, raw) }
    }),
    flags,
  }
}

/**
 * Самопроверка данных шкалы: диапазоны категорий покрывают [min, max]
 * без дыр и перекрытий, а заявленные min/max совпадают с тем, что дают
 * варианты ответа. Ловит «дыры» вроде «< 7 / > 11» у HADS на чужих сайтах.
 */
export function validateScale(scale: Scale): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const item of scale.items) {
    if (ids.has(item.id)) errors.push(`пункт ${item.id} повторяется`)
    ids.add(item.id)
    const values = item.options.map((o) => o.value)
    if (new Set(values).size !== values.length) errors.push(`пункт ${item.id}: значения вариантов повторяются`)
  }

  for (const s of scale.subscales) {
    let min = 0
    let max = 0
    for (const item of scale.items) {
      const pts = item.options.map((o) => o.scores[s.id]).filter((p): p is number => p !== undefined)
      if (!pts.length) continue
      // Модификатор может обнулить пункт — тогда 0 тоже достижим
      if (scale.modifiers?.some((m) => m.item === item.id)) pts.push(0)
      min += Math.min(...pts)
      max += Math.max(...pts)
    }
    if (min !== s.min || max !== s.max) {
      errors.push(`${s.id}: заявлено ${s.min}…${s.max}, по вариантам ${min}…${max}`)
    }

    if (s.categories.length) {
      const sorted = [...s.categories].sort((a, b) => a.min - b.min)
      if (sorted[0].min > s.min) errors.push(`${s.id}: категории начинаются с ${sorted[0].min}, а не с ${s.min}`)
      if (sorted.at(-1)!.max < s.max) errors.push(`${s.id}: категории кончаются на ${sorted.at(-1)!.max}, а не на ${s.max}`)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].min !== sorted[i - 1].max + 1) {
          errors.push(`${s.id}: между «${sorted[i - 1].label}» и «${sorted[i].label}» дыра или перекрытие`)
        }
      }
    }
  }

  for (const m of scale.modifiers ?? []) {
    if (!ids.has(m.item) || !ids.has(m.ifItem)) errors.push(`модификатор ссылается на несуществующий пункт`)
  }
  for (const f of scale.riskFlags ?? []) {
    if (!ids.has(f.item)) errors.push(`флаг ${f.id} ссылается на несуществующий пункт ${f.item}`)
  }
  return errors
}
