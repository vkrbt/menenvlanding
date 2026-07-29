'use client'

import { useState } from 'react'

export type FaqItem = { q: string; a: string }

/**
 * Порт FAQ-аккордеона из scripts/main.js: открыт максимум один пункт,
 * повторный клик по открытому закрывает его.
 */
export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <dl className="faq__list">
      {items.map((item, i) => (
        <div className="faq__item" key={item.q}>
          <dt className="faq__q">
            <button
              className="faq__btn"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <svg className="faq__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </dt>
          <dd className={open === i ? 'faq__a is-open' : 'faq__a'}>{item.a}</dd>
        </div>
      ))}
    </dl>
  )
}
