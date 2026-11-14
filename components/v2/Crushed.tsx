'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Каменные слова падают на Стетема, когда блок появляется в экране.
 * Без JS и при reduced-motion камни просто лежат на месте.
 */
const STONES = ['Тревога', 'Должен', 'Выгорание', 'Молчи и терпи', 'Ипотека']

export default function Crushed() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={on ? 'v2-crush is-on' : 'v2-crush'} aria-hidden="true">
      <div className="v2-crush__pile">
        {STONES.map((s, i) => (
          <span key={s} className="v2-stone v2-crush__stone" style={{ ['--i' as string]: i }}>{s}</span>
        ))}
      </div>
      <img className="v2-crush__man" src="/v2/crushed.webp" alt="" width={700} height={974} loading="lazy" />
    </div>
  )
}
