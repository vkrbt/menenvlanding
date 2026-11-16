'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Каменные слова падают на героя, когда блок на 60% в экране; ушёл из экрана — всё возвращается, и так каждый раз.
 * Без JS и при reduced-motion камни просто лежат на месте.
 */
const STONES = ['Тревога', 'Должен', 'Выгорание', 'Будь мужиком', 'Ипотека']

export default function Crushed() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // каждый раз заново: на 60% в экране камни падают, совсем ушёл из экрана — герой снова стоит
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.6) setOn(true)
      else if (!e.isIntersecting) setOn(false)
    }, { threshold: [0, 0.6] })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={on ? 'v2-crush is-on' : 'v2-crush'} aria-hidden="true">
      <div className="v2-crush__pile">
        {STONES.map((s, i) => (
          <span key={s} className="v2-stone v2-crush__stone" data-t={s} style={{ ['--i' as string]: i }}>{s}</span>
        ))}
      </div>
      <img className="v2-crush__man" src="/v2/crushed-sh.webp" alt="" width={820} height={1188} loading="lazy" />
    </div>
  )
}
