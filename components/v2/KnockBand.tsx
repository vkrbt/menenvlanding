'use client'

import { useEffect, useRef } from 'react'

/**
 * Бегущая строка с проблемами, которая сбивает героя с ног (идея — блок у Ясно). Один раз:
 * герой стоит по центру блока, строка идёт на уровне его груди; справа на скорости вылетают слова, первое сносит его за экран
 * («ПОТРАЧЕНО» как в GTA San Andreas), дальше остаётся просто бегущая строка. Удар считается
 * по реальному положению слов. Начинается, когда блок наполовину в экране; при reduced-motion
 * герой не показывается, строка стоит.
 */
const WORDS = ['Выгорание', 'Одиночество', 'Деньги', 'Тревога', 'Злость', 'Алкоголь', 'Кризис на работе', 'Сложные отношения', 'Нет сил', 'Стыд', 'Бессонница', 'Зависимости']

// скорость строки одна и та же всё время (до удара и после); на широком экране быстрее, чтобы до героя не ехать долго
const speedFor = (w: number) => Math.min(320, Math.max(160, w * 0.3)) // px/с

export default function KnockBand() {
  const box = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLParagraphElement>(null)
  const man = useRef<HTMLImageElement>(null)
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

    const hit = () => {
      state = 'hit'
      m.classList.add('is-hit')
      w.classList.add('is-on')
      timer = window.setTimeout(() => {
        state = 'done'
        w.classList.remove('is-on')
      }, 2200)
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
    }
  }, [])

  return (
    <div ref={box} className="v2-knock" aria-hidden="true">
      <div className="v2-knock__band">
        <p ref={row} className="v2-knock__row">
          {[...WORDS, ...WORDS].map((t, k) => <span key={k}>{t}</span>)}
        </p>
      </div>
      <img ref={man} className="v2-knock__man" src="/v2/stand.webp" alt="" width={420} height={1398} loading="lazy" />
      <p ref={wasted} className="v2-knock__wasted"><img src="/v2/wasted.webp" alt="" width={1000} height={166} /></p>
    </div>
  )
}
