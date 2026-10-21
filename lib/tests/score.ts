import type { Answers, Category, Option, Scale, ScoreResult, Subscale } from './types.ts'

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
  const counts = new Map<string, number>(scale.subscales.map((s) => [s.id, 0]))
  const add = (sub: string, points: number) => {
    totals.set(sub, (totals.get(sub) ?? 0) + points)
    counts.set(sub, (counts.get(sub) ?? 0) + 1)
  }
  const floating: Option[] = []
  for (const item of scale.items) {
    if (zeroed.has(item.id)) continue
    const option = item.options.find((o) => o.value === answers[item.id])!
    if (option.span) {
      floating.push(option)
      continue
    }
    for (const [sub, points] of Object.entries(option.scores)) add(sub, points)
  }

  // «Плывущие» графы — после всех остальных: им нужно среднее соседей
  // без них самих, поэтому опираемся на снимок до первой подстановки
  const fixedTotals = new Map(totals)
  const fixedCounts = new Map(counts)
  for (const option of floating) {
    const { min, max, near } = option.span!
    const n = fixedCounts.get(near) ?? 0
    const target = n ? fixedTotals.get(near)! / n : (min + max) / 2
    const points = Math.min(max, Math.max(min, Math.round(target)))
    for (const sub of Object.keys(option.scores)) add(sub, points)
  }

  const flags = (scale.riskFlags ?? []).flatMap((f) => {
    const level = f.levels[answers[f.item]]
    return level ? [{ id: f.id, level }] : []
  })

  return {
    ok: true,
    subscales: scale.subscales.map((s) => {
      const total = totals.get(s.id) ?? 0
      if (s.aggregate === 'mean') {
        const count = counts.get(s.id) ?? 0
        // Среднее в сотых с округлением. Делители 1–7 не дают значений между
        // x,50 и x,57, так что на границы категорий (x,5) округление не влияет
        const raw = count ? Math.round((total * 100) / count) : NaN
        return { id: s.id, raw, value: raw / (s.divisor ?? 1), category: count ? categorize(s, raw) : undefined, count }
      }
      return { id: s.id, raw: total, value: total / (s.divisor ?? 1), category: categorize(s, total) }
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
    if (s.aggregate === 'mean') {
      // Среднее лежит между наименьшим и наибольшим вкладом любого варианта; в сотых
      const pts = scale.items.flatMap((i) =>
        i.options.flatMap((o) =>
          o.scores[s.id] === undefined ? [] : o.span ? [o.span.min, o.span.max] : [o.scores[s.id]],
        ),
      )
      min = Math.min(...pts) * 100
      max = Math.max(...pts) * 100
      if (s.divisor !== 100) errors.push(`${s.id}: у подшкалы со средним divisor должен быть 100`)
    } else for (const item of scale.items) {
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

  for (const item of scale.items) {
    for (const o of item.options) {
      if (!o.span) continue
      const near = scale.subscales.find((x) => x.id === o.span!.near)
      if (near?.aggregate !== 'mean') errors.push(`пункт ${item.id}: плывущая графа ссылается не на подшкалу со средним`)
      for (const sub of Object.keys(o.scores)) {
        if (scale.subscales.find((x) => x.id === sub)?.aggregate !== 'mean') {
          errors.push(`пункт ${item.id}: плывущая графа входит в подшкалу ${sub} без среднего`)
        }
      }
    }
    const m = item.measure
    if (m) {
      const values = new Set(item.options.map((o) => o.value))
      for (const b of m.bands) if (!values.has(b.value)) errors.push(`пункт ${item.id}: полоса ведёт к несуществующему варианту ${b.value}`)
      for (let i = 1; i < m.bands.length; i++) {
        if (m.bands[i].upTo <= m.bands[i - 1].upTo) errors.push(`пункт ${item.id}: полосы замера не по возрастанию`)
      }
      if (m.bands.at(-1)?.upTo !== Infinity) errors.push(`пункт ${item.id}: последняя полоса замера должна быть открытой`)
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
