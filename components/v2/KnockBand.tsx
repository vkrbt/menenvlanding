'use client'

import { useEffect, useRef } from 'react'

/**
 * Наклонная бегущая строка с проблемами, которая буквально сбивает героя с ног (идея — блок у Ясно).
 * Герой стоит в строке, она идёт на уровне голеней. Когда слово доезжает до его ног, его сносит:
 * летит кувырком, на экране «ПОТРАЧЕНО» как в GTA San Andreas, потом он падает обратно в промежуток
 * между словами — и следующее слово сносит снова. Удар считается по реальному положению слов.
 * Строка едет только пока блок в экране; при reduced-motion всё стоит.
 */
const WORDS = ['Выгорание', 'Одиночество', 'Деньги', 'Тревога', 'Злость', 'Алкоголь', 'Кризис на работе', 'Сложные отношения', 'Нет сил', 'Стыд', 'Бессонница', 'Зависимости']

const SPEED = 130 // px в секунду

export default function KnockBand() {
  const box = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLParagraphElement>(null)
  const man = useRef<HTMLImageElement>(null)
  const wasted = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = box.current, r = row.current, m = man.current, w = wasted.current
    if (!el || !r || !m || !w) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let visible = false
    let raf = 0
    let last = 0
    let x = 0
    let state: 'stand' | 'hit' | 'gone' = 'stand'
    let timer = 0
    const spans = Array.from(r.children) as HTMLElement[]

    // какие слова сейчас перекрывают ноги героя (по горизонтали)
    const underFeet = () => {
      const mr = m.getBoundingClientRect()
      const l = mr.left + mr.width * 0.3, rr = mr.right - mr.width * 0.3
      return spans.some((s) => {
        const b = s.getBoundingClientRect()
        return b.left < rr && b.right > l
      })
    }

    const hit = () => {
      state = 'hit'
      m.classList.remove('is-drop')
      void m.offsetWidth
      m.classList.add('is-hit')
      w.classList.add('is-on')
      timer = window.setTimeout(() => {
        state = 'gone'
        w.classList.remove('is-on')
      }, 1900)
    }

    const respawn = () => {
      state = 'stand'
      m.classList.remove('is-hit')
      void m.offsetWidth
      m.classList.add('is-drop')
    }

    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 50) / 1000 : 0
      last = t
      const half = r.scrollWidth / 2
      x -= SPEED * dt
      if (x <= -half) x += half
      r.style.transform = `translateX(${x}px)`
      if (state === 'stand' && underFeet()) hit()
      else if (state === 'gone' && !underFeet()) respawn()
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      last = 0
      if (visible) raf = requestAnimationFrame(tick)
    }, { threshold: 0.2 })
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
      <p ref={wasted} className="v2-knock__wasted">ПОТРАЧЕНО</p>
    </div>
  )
}
