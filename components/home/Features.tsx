import type { ReactNode } from 'react'

type Feature = { icon: ReactNode; title: string; body: ReactNode; time?: string }

const FEATURES: Feature[] = [
  {
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="14" r="1" fill="currentColor" />
        <circle cx="12" cy="14" r="1" fill="currentColor" />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
      </>
    ),
    title: 'Встречи раз в 2 недели',
    body: '3 часа в Zoom. Хватает, чтобы разговор дошёл до сути, и никто при этом не выматывается',
    time: '18:00 по Варшаве · 19:00 по Минску',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11v3a4 4 0 008 0v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    title: 'Ранний доступ к подкасту',
    body: 'Новые выпуски участники слушают до того, как они выйдут для всех',
  },
  {
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 7h6M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    title: 'Эксклюзивные материалы',
    body: 'То, что в подкаст не попадает. Для тех, кому трёх часов раз в две недели мало.',
  },
  {
    icon: (
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    ),
    title: 'Закрытый чат',
    body: 'Можно продолжить разговор после встречи, поделиться важным или просто спросить «мужики, у вас тоже так?»',
  },
  {
    icon: (
      <>
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 19c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 15c1.5-.7 3.5-.5 5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    title: 'Нетворкинг',
    body: 'Участники встречаются и один на один, вне общего круга. Из таких разговоров и получается что-то большее, чем знакомство по Zoom.',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 3l1.5 1.5L22 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    title: 'Перспектива',
    body: (
      <>
        <b>В планах:</b> тематические группы для тех, кто хочет глубже, офлайн-встречи, стримы с приглашёнными спикерами.
      </>
    ),
  },
]

export default function Features() {
  return (
    <section className="section features" id="features">
      <div className="container">
        <h2 className="section-title">Что ты получаешь</h2>

        <ul className="features__list">
          {FEATURES.map((f) => (
            <li className="feature-item" key={f.title}>
              <div className="feature-item__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {f.icon}
                </svg>
              </div>
              <div className="feature-item__body">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                {f.time && <p className="feature-item__time">{f.time}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
