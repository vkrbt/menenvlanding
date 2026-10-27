/**
 * Запись идёт через Telegram-бота: анкета, выбор времени знакомства, напоминания.
 * Кнопки «Оставить заявку» ведут сюда (components/LeadForm.tsx). Метка в ссылке
 * попадает в заявку бота (колонка utm листа Applications) — видно, откуда пришёл человек.
 */
export const BOT_URL = 'https://t.me/menenvpaybot'

/**
 * Метка для /start: «site», дальше источник и кампания из UTM, если человек пришёл по
 * размеченной ссылке. Telegram пропускает только A-Z a-z 0-9 _ - и до 64 символов.
 */
export function botStartPayload(utm: string, path: string): string {
  const params = new Map(
    utm
      .split(';')
      .map((p) => p.trim().split('='))
      .filter((kv) => kv.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()] as [string, string]),
  )
  const clean = (s = '') => s.replace(/[^A-Za-z0-9_-]+/g, '').slice(0, 24)
  const parts = ['site', clean(params.get('utm_source')), clean(params.get('utm_campaign'))].filter(Boolean)
  if (parts.length === 1 && path.startsWith('/blog')) parts.push('blog')
  return parts.join('_').slice(0, 64)
}

export function botLink(utm: string, path: string): string {
  return `${BOT_URL}?start=${botStartPayload(utm, path)}`
}
