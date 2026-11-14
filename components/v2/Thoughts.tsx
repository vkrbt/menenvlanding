'use client'

import { useEffect, useState } from 'react'

import { THOUGHTS } from './pov-thoughts'

/** Мужские мысли мелькают по одной; при reduced-motion стоит первая. */
export default function Thoughts() {
  // первая мысль одна и та же на сервере и в браузере, дальше порядок свой на каждый заход
  const [order, setOrder] = useState(THOUGHTS)
  const [i, setI] = useState(0)

  useEffect(() => {
    const rest = THOUGHTS.slice(1)
    for (let k = rest.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1))
      ;[rest[k], rest[j]] = [rest[j], rest[k]]
    }
    setOrder([THOUGHTS[0], ...rest])
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % THOUGHTS.length), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <p className="v2-pov">
      <span className="v2-pov__line" aria-live="off">
        <span key={i} className="v2-pov__word">{order[i]}</span>
      </span>
    </p>
  )
}
