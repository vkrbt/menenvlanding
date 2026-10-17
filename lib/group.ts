import { GROUP_START, GROUP_START_APPROX } from './site'

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

const DAY_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
})

/**
 * Дата встречи по номеру, с нуля. Пока старт не назначен — null.
 * Шаг ровно 14 суток в UTC: при переводе часов сдвигается час, но не день,
 * а на странице выводится только день
 */
export function meetingDate(index: number): Date | null {
  if (!GROUP_START) return null
  return new Date(new Date(GROUP_START).getTime() + index * TWO_WEEKS_MS)
}

/** «18 ноября» — по варшавскому календарю */
export function formatDay(date: Date): string {
  return DAY_FORMAT.format(date)
}

/** Хвост к слову «Старт»: «18 ноября», пока даты нет — «в ноябре 2026» */
export function startPhrase(): string {
  const start = meetingDate(0)
  return start ? formatDay(start) : GROUP_START_APPROX
}
