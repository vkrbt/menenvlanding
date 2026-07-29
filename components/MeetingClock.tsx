'use client'

import { useEffect } from 'react'

/**
 * Порт блока COUNTDOWN из scripts/main.js.
 *
 * Правит текст уже отрендеренных узлов, а не рендерит их сам — так пять секций
 * главной остаются серверными компонентами, а initial HTML совпадает с текущим
 * (там тоже стоят заглушки «--» и «Ближайшая встреча»).
 */

// 18:00 по Варшаве (UTC+2 / CEST) = 19:00 по Минску = 16:00 UTC
const FIRST_MEETING = new Date('2026-04-01T16:00:00Z')
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

function nextMeeting(): Date {
  const now = Date.now()
  if (now < FIRST_MEETING.getTime()) return FIRST_MEETING
  const periods = Math.floor((now - FIRST_MEETING.getTime()) / TWO_WEEKS_MS)
  return new Date(FIRST_MEETING.getTime() + (periods + 1) * TWO_WEEKS_MS)
}

const pad = (n: number) => String(n).padStart(2, '0')

function formatMeetingDate(date: Date): string {
  const warsaw = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }))
  return `${warsaw.getDate()} ${MONTHS[warsaw.getMonth()]}`
}

const setText = (id: string, text: string) => {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

export default function MeetingClock() {
  useEffect(() => {
    const label = `Ближайшая встреча ${formatMeetingDate(nextMeeting())}`
    setText('badge-date', label)
    setText('badge-date-m', label)
    setText('cta-date', label)

    const tick = () => {
      const diff = nextMeeting().getTime() - Date.now()
      if (diff <= 0) return // пересчитается на следующем тике

      setText('cd-days', pad(Math.floor(diff / 86400000)))
      setText('cd-hours', pad(Math.floor((diff % 86400000) / 3600000)))
      setText('cd-mins', pad(Math.floor((diff % 3600000) / 60000)))
      setText('cd-secs', pad(Math.floor((diff % 60000) / 1000)))
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return null
}
