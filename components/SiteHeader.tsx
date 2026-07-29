'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { FORMS_URL, navLinks } from '@/lib/site'

/**
 * Шапка сайта — одна на все страницы.
 *
 * Бургер живёт внутри .nav__end, а мобильная панель .mnav — соседом <header>,
 * поэтому общее состояние держит один компонент, отдающий оба узла фрагментом.
 * Порядок в DOM тот же, что был в index.html.
 */
export default function SiteHeader({ home = false }: { home?: boolean }) {
  const links = navLinks(home)

  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<Element | null>(null)

  const close = useCallback(() => setOpen(false), [])

  // --mnav-top: панель выезжает из-под шапки, высота которой зависит от вёрстки
  useEffect(() => {
    const sync = () => {
      const header = document.querySelector<HTMLElement>('.nav')
      if (header) {
        document.documentElement.style.setProperty('--mnav-top', `${header.offsetHeight}px`)
      }
    }

    const onResize = () => {
      sync()
      if (!window.matchMedia('(max-width: 767px)').matches) setOpen(false)
    }

    sync()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Классы на <header> и <body> ставятся напрямую: они вне поддерева компонента
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.nav')
    header?.classList.toggle('nav--menu-open', open)
    document.body.classList.toggle('mnav-open', open)

    if (open) {
      if (header) {
        document.documentElement.style.setProperty('--mnav-top', `${header.offsetHeight}px`)
      }
      lastFocus.current = document.activeElement
      closeRef.current?.focus()
    } else if (lastFocus.current) {
      const el = lastFocus.current as HTMLElement
      lastFocus.current = null
      if (typeof el.focus === 'function') {
        try {
          el.focus()
        } catch {
          burgerRef.current?.focus()
        }
      } else {
        burgerRef.current?.focus()
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <header className="nav">
        <Logo />

        <nav className="nav__links" aria-label="Навигация по разделам">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <a href={FORMS_URL} className="btn btn--sm btn--primary nav__cta">
            Оставить заявку
          </a>

          <button
            type="button"
            className="nav__burger"
            id="nav-burger"
            ref={burgerRef}
            aria-expanded={open}
            aria-controls="mnav-panel"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav__burger-lines" aria-hidden="true">
              <span className="nav__burger-line" />
              <span className="nav__burger-line" />
              <span className="nav__burger-line" />
            </span>
          </button>
        </div>
      </header>

      <div className={open ? 'mnav mnav--open' : 'mnav'} id="mnav" aria-hidden={!open}>
        <div className="mnav__overlay" id="mnav-overlay" tabIndex={-1} onClick={close} />
        <nav
          className="mnav__panel"
          id="mnav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Меню сайта"
          aria-hidden={!open}
        >
          <div className="mnav__head">
            <span className="mnav__title">Меню</span>
            <button
              type="button"
              className="mnav__close"
              id="mnav-close"
              ref={closeRef}
              aria-label="Закрыть меню"
              onClick={close}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mnav__links">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="mnav__link" onClick={close}>
                {l.label}
              </a>
            ))}
          </div>

          <a href={FORMS_URL} className="btn btn--primary mnav__cta" onClick={close}>
            Оставить заявку
          </a>
        </nav>
      </div>
    </>
  )
}
