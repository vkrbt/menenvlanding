'use client'

import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import { BLOG_URL, TESTS_URL } from '@/lib/site'

/**
 * Меню главной (лендинг «Устал тащить всё на себе?»): на широком экране ссылки на блоки и разделы сайта
 * видны в шапке; кнопка меню есть всегда — в выпадающем списке те же пункты и переключатель темы (в шапке его нет).
 * Закрывается по клику на пункт, по Escape и при прокрутке.
 */
export const MENU: Array<[string, string]> = [
  ['#signs', 'Узнал себя?'],
  ['#test', 'Тест'],
  ['#offer', 'Цена'],
  ['#program', 'Программа'],
  ['#hosts', 'Ведущие'],
  ['#faq', 'Вопросы'],
  // разделы сайта — не прокрутка, а переход на другие страницы
  [BLOG_URL, 'Блог'],
  [TESTS_URL, 'Тесты'],
]

export default function MenuV2() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close)
    }
  }, [open])

  return (
    <>
      <ul className="v2-menu">
        {MENU.map(([href, label]) => (
          <li key={href}><a href={href}>{label}</a></li>
        ))}
      </ul>
      <button
        type="button"
        className={open ? 'v2-burger is-open' : 'v2-burger'}
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={open}
        aria-controls="v2-drawer"
        onClick={() => setOpen(!open)}
      >
        <span /><span /><span />
      </button>
      <ul id="v2-drawer" className={open ? 'v2-drawer is-open' : 'v2-drawer'}>
        {MENU.map(([href, label]) => (
          <li key={href}><a href={href} onClick={() => setOpen(false)}>{label}</a></li>
        ))}
        <li className="v2-drawer__theme"><span>Тема</span><ThemeToggle /></li>
      </ul>
    </>
  )
}
