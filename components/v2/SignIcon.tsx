// Значки к пунктам «Узнал себя?» на /muzhik: свои рисунки вместо эмодзи — на всех системах одинаково.
import type { ReactNode } from 'react'

// Стиль страницы: толстая обводка цветом рамок карточек (var(--line)), плоские яркие заливки.

const O = { stroke: 'var(--line)', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const BLUE = '#000dc3'
const SKY = '#b9c3ff'
const SUN = '#ffcf33'
const BEER = '#ffa726'
const RED = '#ff5a4e'
const WHITE = '#ffffff'

const ICONS: Record<string, ReactNode> = {
  // Рот на замке
  zip: (
    <>
      <circle cx="16" cy="16" r="12.5" fill={SUN} {...O} />
      <circle cx="11.5" cy="12.5" r="1.6" fill="var(--line)" />
      <circle cx="20.5" cy="12.5" r="1.6" fill="var(--line)" />
      <path d="M9 20h14" {...O} />
      <path d="M11 18.3v3.4M14 18.3v3.4M17 18.3v3.4M20 18.3v3.4" {...O} strokeWidth={1.6} />
      <rect x="21.5" y="18" width="4" height="5" rx="1" fill={BLUE} {...O} strokeWidth={1.6} />
    </>
  ),
  // Кружка пива
  beer: (
    <>
      <path d="M22 13h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-3" fill="none" {...O} />
      <rect x="7" y="10" width="15" height="18" rx="2" fill={BEER} {...O} />
      <path d="M11 15v9M15 15v9M18.5 15v9" stroke={WHITE} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
      <path d="M6 10.5c0-2.5 2-4 4-3.6.6-2 2.7-3.2 4.8-2.4 1.5-1.6 4.4-1.3 5.4.8 2 0 3.3 1.8 2.8 3.8-.3 1.2-1.5 1.9-2.7 1.9H8c-1.1 0-2-.4-2-.5Z" fill={WHITE} {...O} />
    </>
  ),
  // Севшая батарейка
  battery: (
    <>
      <rect x="4" y="9" width="21" height="14" rx="3" fill={WHITE} {...O} />
      <rect x="25" y="13" width="3.5" height="6" rx="1.2" fill="var(--line)" />
      <rect x="7" y="12" width="4" height="8" rx="1" fill={RED} />
      <path d="M18 11.5l-3 4.5h3.5l-3 4.5" fill="none" {...O} strokeWidth={1.8} />
    </>
  ),
  // Взрыв
  burst: (
    <>
      <path d="M16 2.5l3 7.5 7.5-3.5-3 7.5 7 2.5-7 3 3.5 7.5-7.5-3-3.5 7.5-3-7.5-7.5 3 3.5-7.5-7-3 7-2.5-3-7.5 7.5 3.5Z" fill={RED} {...O} />
      <path d="M16 10.5l1.6 3.4 3.6-1.3-1.4 3.5 3.3 1.5-3.5 1.1 1.2 3.6-3.4-1.6-1.4 3.4-1.4-3.4-3.4 1.6 1.2-3.6-3.5-1.1 3.3-1.5-1.4-3.5 3.6 1.3Z" fill={SUN} />
    </>
  ),
  // Машина
  car: (
    <>
      <path d="M3.5 21v-4.5c0-1.4 1-2.5 2.4-2.7l3.6-.5 3.3-4.1c.6-.8 1.5-1.2 2.5-1.2h5.4c1 0 2 .5 2.6 1.3l2.9 4 1.5.4c1.3.3 2.3 1.5 2.3 2.9V21c0 .8-.7 1.5-1.5 1.5H5c-.8 0-1.5-.7-1.5-1.5Z" fill={BLUE} {...O} />
      <path d="M11.5 13.6l2.6-3.3c.3-.4.7-.6 1.2-.6h2.2v3.9ZM19.5 13.6V9.7h1.1c.5 0 .9.2 1.2.6l2.4 3.3Z" fill={SKY} {...O} strokeWidth={1.6} />
      <circle cx="9.5" cy="22.5" r="3.2" fill={WHITE} {...O} />
      <circle cx="22.5" cy="22.5" r="3.2" fill={WHITE} {...O} />
    </>
  ),
  // Телефон, по которому некому позвонить
  nophone: (
    <>
      <rect x="9" y="3.5" width="14" height="25" rx="3" fill={WHITE} {...O} />
      <rect x="11.5" y="7" width="9" height="15" rx="1" fill={SKY} />
      <circle cx="16" cy="25" r="1.2" fill="var(--line)" />
      <circle cx="22" cy="22" r="7" fill={WHITE} {...O} stroke={RED} />
      <path d="M17.2 26.8l9.6-9.6" stroke={RED} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  // Никакое лицо
  meh: (
    <>
      <circle cx="16" cy="16" r="12.5" fill={SKY} {...O} />
      <path d="M10 12.5h3.5M18.5 12.5H22" {...O} />
      <path d="M11 20.5h10" {...O} />
      <path d="M24.5 6.5c1.2 1.5 1.2 3-.2 4.4" fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  // Кубок с трещиной
  trophy: (
    <>
      <path d="M9 8H5.5c0 4.5 2 7 5 7.5M23 8h3.5c0 4.5-2 7-5 7.5" fill="none" {...O} />
      <path d="M9 4.5h14v6c0 4.4-3.1 8-7 8s-7-3.6-7-8Z" fill={SUN} {...O} />
      <path d="M17 5l-2 4.5 2.5 2-2 4" fill="none" {...O} strokeWidth={1.6} />
      <path d="M16 18.5v4.5" {...O} />
      <rect x="10" y="23" width="12" height="5" rx="1.2" fill={BLUE} {...O} />
    </>
  ),
}

export function SignIcon({ name }: { name: string }) {
  return (
    <svg className="v2-signs__icon" width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}
