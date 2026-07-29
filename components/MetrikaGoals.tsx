'use client'

import { useEffect } from 'react'
import { METRIKA_COUNTER_ID, METRIKA_GOALS } from '@/lib/site'

/**
 * Цели Яндекс.Метрики на клики по CTA.
 *
 * Слушатель делегированный, на document. Так сделано намеренно: CTA-блок
 * внутри статьи собирает lib/markdown.ts — ручной порт парсера, вставка
 * onclick прямо в разметку статьи изменила бы HTML всех 40 проиндексированных
 * страниц и сломала бы паритет вёрстки. Делегирование не трогает разметку вовсе.
 *
 * Цели нужно создать в интерфейсе Метрики (тип «JavaScript-событие»),
 * идентификаторы — в lib/site.ts, METRIKA_GOALS.
 */
export default function MetrikaGoals() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      const link = target?.closest?.('a')
      if (!link) return

      const href = link.getAttribute('href') || ''
      if (!href.includes('forms.gle')) return

      // Откуда кликнули — это и есть ответ на вопрос «какие материалы приводят заявки»
      const path = window.location.pathname
      const goal = path.startsWith('/vstrecha')
        ? METRIKA_GOALS.ctaMeetingPage
        : path.startsWith('/blog')
          ? METRIKA_GOALS.ctaArticle
          : METRIKA_GOALS.ctaLanding

      const ym = (window as unknown as { ym?: (id: number, action: string, ...rest: unknown[]) => void }).ym
      if (typeof ym !== 'function') return

      // Общая цель + уточняющая: общая даёт итог, уточняющая — разрез по источнику
      ym(METRIKA_COUNTER_ID, 'reachGoal', METRIKA_GOALS.ctaAny, { page: path })
      ym(METRIKA_COUNTER_ID, 'reachGoal', goal, { page: path })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
