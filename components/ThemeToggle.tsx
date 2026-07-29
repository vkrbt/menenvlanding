'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sreda-theme'
const ORDER = ['system', 'light', 'dark'] as const

type Theme = (typeof ORDER)[number]

const LABELS: Record<Theme, string> = {
  system: 'Тема: как в системе',
  light: 'Тема: светлая',
  dark: 'Тема: тёмная',
}

function currentTheme(): Theme {
  const value = document.documentElement.getAttribute('data-theme')
  return (ORDER as readonly string[]).includes(value ?? '') ? (value as Theme) : 'system'
}

function resolved(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  // До монтирования — null: разметка совпадает с той, что отдаёт сборка,
  // и гидратация проходит без расхождений. Реальную тему знает только браузер.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const initial = currentTheme()
    setTheme(initial)
    document.documentElement.setAttribute('data-theme-resolved', resolved(initial))

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(currentTheme())
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const onClick = () => {
    const next = ORDER[(ORDER.indexOf(theme ?? currentTheme()) + 1) % ORDER.length]
    document.documentElement.setAttribute('data-theme', next)
    if (next === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      id="theme-toggle"
      data-theme-mode={theme ?? undefined}
      aria-label={theme ? LABELS[theme] : LABELS.system}
      title={theme ? LABELS[theme] : 'Тема оформления'}
      onClick={onClick}
    >
      <svg
        className="theme-toggle__icon theme-toggle__icon--system"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
      <svg
        className="theme-toggle__icon theme-toggle__icon--light"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        className="theme-toggle__icon theme-toggle__icon--dark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}
