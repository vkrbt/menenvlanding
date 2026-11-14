'use client'

import { useEffect, useState } from 'react'

import { THOUGHTS } from './pov-thoughts'

/** Мысли из рилса мелькают по одной; при reduced-motion стоит первая. */
export default function Thoughts() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % THOUGHTS.length), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <p className="v2-pov">
      <span className="v2-pov__label">POV: мозг мужика</span>
      <span className="v2-pov__line" aria-live="off">
        <span key={i} className="v2-pov__word">{THOUGHTS[i]}</span>
      </span>
    </p>
  )
}
