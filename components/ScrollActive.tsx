'use client'

import { useEffect } from 'react'

type Props = {
  /** Блоки, чьи иллюстрации оживают (поза — в globals.css, раздел HOVERS) */
  selector: string
  /** Сама картинка внутри блока — за ней и следим, чтобы поза включалась, когда её видно */
  watch: string
}

/** Включаем позу, когда картинка доехала до средней части экрана (между 25% и 55% высоты) */
const ENTER_ZONE = '-25% 0px -45% 0px'

/**
 * На тач-экранах ховера нет, поэтому иллюстрации принимают ту же позу, что на десктопе
 * при наведении (.is-active на блоке): когда картинка доезжает до середины экрана,
 * и возвращаются, только когда она уходит с экрана совсем.
 * С мышью и при prefers-reduced-motion ничего не делает — там работает обычный :hover.
 */
export default function ScrollActive({ selector, watch }: Props) {
  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const owner = new Map<Element, Element>()
    const enter = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) owner.get(e.target)?.classList.add('is-active')
      },
      { rootMargin: ENTER_ZONE },
    )
    const leave = new IntersectionObserver((entries) => {
      for (const e of entries) if (!e.isIntersecting) owner.get(e.target)?.classList.remove('is-active')
    })

    document.querySelectorAll(selector).forEach((block) => {
      const pic = block.querySelector(watch) ?? block
      owner.set(pic, block)
      enter.observe(pic)
      leave.observe(pic)
    })
    return () => {
      enter.disconnect()
      leave.disconnect()
    }
  }, [selector, watch])

  return null
}
