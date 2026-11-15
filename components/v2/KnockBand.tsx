'use client'

import { useEffect, useRef } from 'react'

/**
 * Бегущая строка с проблемами, которая сбивает героя с ног (идея — блок у Ясно). Один раз:
 * герой стоит по центру блока, строка идёт на уровне его груди; справа на скорости вылетают слова, первое сбивает его с ног:
 * падает навзничь, раскалывается на осколки, и они понемногу растворяются («ПОТРАЧЕНО» как в GTA San Andreas),
 * дальше остаётся просто бегущая строка. Удар считается
 * по реальному положению слов. Начинается, когда блок наполовину в экране; при reduced-motion
 * герой не показывается, строка стоит.
 */
const WORDS = ['Выгорание', 'Одиночество', 'Деньги', 'Тревога', 'Злость', 'Алкоголь', 'Кризис на работе', 'Сложные отношения', 'Нет сил', 'Стыд', 'Бессонница', 'Зависимости']

// скорость строки одна и та же всё время (до удара и после); на широком экране быстрее, чтобы до героя не ехать долго
const speedFor = (w: number) => Math.min(320, Math.max(160, w * 0.3)) // px/с

/**
 * Осколки героя: сетка 3×6 со сдвинутыми узлами — неровные трещины. Каждый осколок — та же картинка с clip-path,
 * вместе они складываются в целого героя. Сдвиги и наклоны в системе картинки (он лежит головой влево:
 * её «вправо» — это вверх на экране, «вниз» — вправо), поэтому оседание — отрицательный dx.
 */
const SHARDS = (() => {
  const xs = [0, 34, 67, 100]
  const ys = [0, 17, 33, 49, 65, 82, 100]
  const j = (i: number, k: number, amp: number) => (i === 0 || k === 0 ? 0 : Math.sin(i * 12.9898 + k * 78.233) * amp)
  const pt = (c: number, r: number) => {
    const x = c === 0 || c === xs.length - 1 ? xs[c] : xs[c] + j(c, r + 1, 7)
    const y = r === 0 || r === ys.length - 1 ? ys[r] : ys[r] + j(r, c + 3, 5)
    return [x, y] as const
  }
  const out: { clip: string; dx: number; dy: number; rot: number; delay: number }[] = []
  for (let r = 0; r < ys.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const q = [pt(c, r), pt(c + 1, r), pt(c + 1, r + 1), pt(c, r + 1)]
      const cx = q.reduce((a, p) => a + p[0], 0) / 4
      const n = r * 3 + c
      const rnd = (k: number) => Math.sin(n * 91.7 + k * 17.3) // -1…1, одинаково при каждой сборке
      out.push({
        clip: `polygon(${q.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(', ')})`,
        dx: -(cx / 100) * 26 - 4 + rnd(1) * 6, // верхние (по экрану) осколки оседают сильнее
        dy: rnd(2) * 14, // расползаются вдоль тела
        rot: rnd(3) * 28,
        delay: (Math.abs(rnd(4)) * 0.9 + (r / ys.length) * 0.5), // крошится не разом
      })
    }
  }
  return out
})()

export default function KnockBand() {
  const box = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLParagraphElement>(null)
  const man = useRef<HTMLDivElement>(null)
  const wasted = useRef<HTMLParagraphElement>(null) // «потрачено» шрифтом как у «wasted» в GTA, картинкой: у Pricedown нет кириллицы

  useEffect(() => {
    const el = box.current, r = row.current, m = man.current, w = wasted.current
    if (!el || !r || !m || !w) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let last = 0
    // строка уже выехала на треть экрана справа (полоса сдвинута на 10% влево) — до героя доезжает быстро
    let x = el.clientWidth * (0.1 + 2 / 3)
    let state: 'stand' | 'hit' | 'done' = 'stand'
    let timer = 0
    const spans = Array.from(r.children) as HTMLElement[]

    // доехало ли первое слово до героя (удар в грудь)
    const reachedFeet = () => {
      const mr = m.getBoundingClientRect()
      const feet = mr.left + mr.width * 0.65
      return spans.some((sp) => {
        const b = sp.getBoundingClientRect()
        return b.left < feet && b.right > mr.left
      })
    }

    let timer2 = 0
    const hit = () => {
      state = 'hit'
      m.classList.add('is-hit')
      w.classList.add('is-on')
      // упал и подпрыгнул — раскалывается и растворяется
      timer2 = window.setTimeout(() => m.classList.add('is-broken'), 1250)
      timer = window.setTimeout(() => {
        state = 'done'
        w.classList.remove('is-on')
      }, 2600)
    }

    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 50) / 1000 : 0
      last = t
      const v = speedFor(el.clientWidth)
      const half = r.scrollWidth / 2
      x -= v * dt
      if (x <= -half) x += half
      r.style.transform = `translateX(${x}px)`
      if (state === 'stand' && reachedFeet()) hit()
      raf = requestAnimationFrame(tick)
    }

    r.style.transform = `translateX(${x}px)`
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      last = 0
      if (e.isIntersecting) raf = requestAnimationFrame(tick) // без паузы: строка едет сразу, как блок в кадре
    }, { threshold: 0.6 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div ref={box} className="v2-knock" aria-hidden="true">
      <div className="v2-knock__band">
        <p ref={row} className="v2-knock__row">
          {[...WORDS, ...WORDS].map((t, k) => <span key={k}>{t}</span>)}
        </p>
      </div>
      <div ref={man} className="v2-knock__man">
        <img className="v2-knock__whole" src="/v2/stand.webp" alt="" width={420} height={1398} loading="lazy" />
        {SHARDS.map((sh, k) => (
          <img
            key={k}
            className="v2-knock__shard"
            src="/v2/stand.webp"
            alt=""
            width={420}
            height={1398}
            loading="lazy"
            style={{ clipPath: sh.clip, ['--dx' as string]: `${sh.dx.toFixed(1)}px`, ['--dy' as string]: `${sh.dy.toFixed(1)}px`, ['--rot' as string]: `${sh.rot.toFixed(1)}deg`, ['--d' as string]: `${sh.delay.toFixed(2)}s` }}
          />
        ))}
      </div>
      <p ref={wasted} className="v2-knock__wasted"><img src="/v2/wasted.webp" alt="" width={1000} height={166} /></p>
    </div>
  )
}
