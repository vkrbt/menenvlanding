'use client'

import { useEffect, useState } from 'react'

import { THOUGHTS, mixThoughts } from './pov-thoughts'

/** Мужские мысли мелькают по одной; при reduced-motion стоит первая. */
export default function Thoughts() {
  // первая мысль одна и та же на сервере и в браузере, дальше порядок свой на каждый заход
  const [order, setOrder] = useState(THOUGHTS)
  const [i, setI] = useState(0)

  useEffect(() => {
    // на каждый заход свой порядок, но соседние мысли всё так же из разных тем
    setOrder(mixThoughts(Math.random, THOUGHTS[0]))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % THOUGHTS.length), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <p className="v2-pov">
      <span className="v2-pov__line" aria-live="off">
        <span key={i} className={order[i].length > 25 ? 'v2-pov__word v2-pov__word--long' : 'v2-pov__word'}>{order[i]}</span>
      </span>
    </p>
  )
}
