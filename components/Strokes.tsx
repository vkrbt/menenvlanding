'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Дуги акцентным цветом вокруг блока — приём из remotion.dev, переосмысленный
 * под группу: несколько толстых дуг постоянно идут по одному кругу вокруг
 * содержимого, как люди, которые сидят в кругу. Стоят у финального призыва.
 *
 * Дуги — отрезки одного пунктира (stroke-dasharray), сумма которого равна
 * длине кольца (pathLength="1"), поэтому дуги стоят по кругу без шва.
 * Движение по кругу — анимация stroke-dashoffset, «дыхание» — смена длин
 * в том же пунктире (globals.css). При prefers-reduced-motion дуги стоят.
 *
 * Кольцо не должно проходить по тексту: синяя дуга под синей ссылкой съедает её.
 * Поэтому компонент меряет реальный блок текста (дети соседнего *__inner)
 * и строит суперэллипс |x/a|ⁿ + |y/b|ⁿ = 1, вписанный в секцию и описанный
 * вокруг текста с зазором. Показатель n подбирается наименьший, при котором
 * углы блока текста остаются внутри кольца: на широком экране выходит мягкий
 * «скруглённый круг», на узком — рамка у краёв. Если места нет совсем,
 * кольцо не рисуется.
 */

type Geometry = { w: number; h: number; d: string; sw: number }

/** Толщина дуги: на телефоне тоньше, чтобы поместиться между краем экрана и текстом */
const strokeWidth = (w: number) => (w < 640 ? 18 : 34)

/** Сколько точек на кольце: ломаная со скруглёнными стыками на глаз гладкая */
const SAMPLES = 160

function superellipse(cx: number, cy: number, a: number, b: number, n: number): string {
  const pts: string[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    const x = cx + a * Math.sign(c) * Math.abs(c) ** (2 / n)
    const y = cy + b * Math.sign(s) * Math.abs(s) ** (2 / n)
    pts.push(`${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return `${pts.join(' ')} Z`
}

function measure(host: HTMLElement): Geometry | null {
  const w = host.clientWidth
  const h = host.clientHeight
  const inner = host.querySelector<HTMLElement>(':scope > [class*="__inner"]')
  if (!inner || !w || !h) return null

  // Габариты текста относительно секции
  const origin = host.getBoundingClientRect()
  let top = Infinity
  let bottom = -Infinity
  let left = Infinity
  let right = -Infinity
  for (const el of Array.from(inner.children)) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    top = Math.min(top, r.top - origin.top)
    bottom = Math.max(bottom, r.bottom - origin.top)
    left = Math.min(left, r.left - origin.left)
    right = Math.max(right, r.right - origin.left)
  }
  if (!Number.isFinite(top)) return null

  const sw = strokeWidth(w)
  const gap = sw / 2 + (w < 640 ? 6 : 18) // от дуги до текста
  const edge = sw / 2 + (w < 640 ? 4 : 10) // от дуги до края секции

  const cx = w / 2
  const cy = (top + bottom) / 2
  const a = w / 2 - edge - (w < 640 ? 0 : 40)
  const b = Math.min(cy, h - cy) - edge
  const cw = Math.max(cx - left, right - cx) + gap
  const ch = (bottom - top) / 2 + gap
  if (cw >= a || ch >= b) return null

  // Наименьший показатель, при котором угол блока текста внутри кольца
  let n = 2
  while (n < 40 && (cw / a) ** n + (ch / b) ** n > 1) n += 0.25

  return { w, h, sw, d: superellipse(cx, cy, a, b, n) }
}

export default function Strokes() {
  const ref = useRef<SVGSVGElement>(null)
  const [geo, setGeo] = useState<Geometry | null>(null)

  useEffect(() => {
    const host = ref.current?.parentElement
    if (!host) return
    const update = () => setGeo(measure(host))
    update()
    // Следим и за секцией, и за текстом: он меняет размер, когда догружается шрифт
    const ro = new ResizeObserver(update)
    ro.observe(host)
    const inner = host.querySelector(':scope > [class*="__inner"]')
    if (inner) ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  return (
    <svg
      ref={ref}
      className="strokes"
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {geo && <path d={geo.d} pathLength={1} strokeWidth={geo.sw} className="strokes__path" />}
    </svg>
  )
}
