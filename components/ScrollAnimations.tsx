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
    const timers: number[] = []
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          el.classList.add('is-visible')
          io.unobserve(el)
          // После появления задержка не нужна: иначе с ней же срабатывает hover карточки
          if (el.style.transitionDelay) {
            timers.push(window.setTimeout(() => { el.style.transitionDelay = '' }, 900))
          }
        }
      },
      rootMargin ? { threshold, rootMargin } : { threshold },
    )

    const nodes = document.querySelectorAll<HTMLElement>(targets ?? selector)

    nodes.forEach((el) => {
      if (targets) {
        el.classList.add('animate-in')
        // Лесенка внутри своей группы: первая карточка секции стартует без задержки
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [el]
        const i = siblings.indexOf(el)
        el.style.transitionDelay = `${Math.min(i, 3) * 70}ms`
      }
      io.observe(el)
    })

    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [targets, selector, threshold, rootMargin])

  return null
}
