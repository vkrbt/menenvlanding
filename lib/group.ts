import { GROUP_START_APPROX, MEETING_DATES } from './site'

const DAY_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
})

/**
 * Дата встречи по номеру, с нуля — из списка MEETING_DATES (шаг не ровный: на праздники
 * перерыв бывает длиннее). Пока дат нет или такой встречи в списке нет — null
 */
export function meetingDate(index: number): Date | null {
  const d = MEETING_DATES[index]
  return d ? new Date(d) : null
}

/** «5 декабря» — по варшавскому календарю */
export function formatDay(date: Date): string {
  return DAY_FORMAT.format(date)
}

/** Хвост к слову «Старт»: «5 декабря», пока даты нет — GROUP_START_APPROX */
export function startPhrase(): string {
  const start = meetingDate(0)
  return start ? formatDay(start) : GROUP_START_APPROX
}
