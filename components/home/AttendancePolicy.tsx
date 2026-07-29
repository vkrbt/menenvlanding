import type { ReactNode } from 'react'

const CARDS: Array<{ icon: ReactNode; title: string; body: string }> = [
  {
    icon: (
      <>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    title: 'Пропуск оплачивается',
    body: 'Если ты записался на встречу, но не пришёл — встреча всё равно считается оплаченной. Это помогает нам планировать и держать группу стабильной.',
  },
  {
    icon: (
      <>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    title: 'Предупреди заранее',
    body: 'Если знаешь, что не придёшь — напиши нам до встречи. Это уважение к другим участникам, которые пришли.',
  },
  {
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    title: 'Группа — это обязательство',
    body: 'Каждый участник влияет на качество встречи. Регулярное присутствие — это вклад в общее пространство, не только для себя.',
  },
]

export default function AttendancePolicy() {
  return (
    <section className="section attendance-policy" id="attendance-policy">
      <div className="container">
        <h2 className="section-title">Политика пропусков</h2>

        <div className="attendance-policy__grid">
          {CARDS.map((c) => (
            <div className="attendance-policy__card" key={c.title}>
              <div className="attendance-policy__icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {c.icon}
                </svg>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
