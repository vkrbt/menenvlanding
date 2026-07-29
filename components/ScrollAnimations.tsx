'use client'

import { useEffect } from 'react'

type Props = {
  /**
   * Кому раздать .animate-in и transition-delay.
   * Если не задан — класс уже стоит в разметке (вариант book.html)
   */
  targets?: string
  selector?: string
  threshold?: number
  rootMargin?: string
}

/**
 * Порт scroll-in анимаций из scripts/main.js и инлайнового скрипта book.html.
 *
 * Работает через DOM напрямую — так секции остаются серверными компонентами
 * и не утягиваются в клиентский бандл ради одного класса.
 */
export default function ScrollAnimations({
  targets,
  selector = '.animate-in',
  threshold = 0.12,
  rootMargin,
}: Props) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      },
      rootMargin ? { threshold, rootMargin } : { threshold },
    )

    const nodes = document.querySelectorAll<HTMLElement>(targets ?? selector)

    nodes.forEach((el, i) => {
      if (targets) {
        el.classList.add('animate-in')
        // Задержка считается по сквозному индексу по всему списку — как в оригинале
        el.style.transitionDelay = `${(i % 4) * 60}ms`
      }
      io.observe(el)
    })

    return () => io.disconnect()
  }, [targets, selector, threshold, rootMargin])

  return null
}
