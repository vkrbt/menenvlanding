'use client'

import { useEffect } from 'react'

type Props = {
  /** Блоки, чьи иллюстрации оживают (поза — в globals.css, раздел HOVERS) */
  selector: string
  /** Когда блок считается «в экране»: по умолчанию — верх блока поднялся выше 80% высоты экрана */
  rootMargin?: string
}

/**
 * На тач-экранах ховера нет, поэтому иллюстрации принимают ту же позу, что на десктопе
 * при наведении, когда блок появляется в экране (.is-active), и возвращаются, когда он уходит.
 * С мышью и при prefers-reduced-motion ничего не делает — там работает обычный :hover.
 */
export default function ScrollActive({ selector, rootMargin = '0px 0px -20% 0px' }: Props) {
  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle('is-active', e.isIntersecting)
      },
      { rootMargin },
    )
    document.querySelectorAll(selector).forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [selector, rootMargin])

  return null
}
