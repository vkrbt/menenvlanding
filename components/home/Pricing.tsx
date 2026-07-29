import { FORMS_URL } from '@/lib/site'

type Plan = {
  label: string
  amount: string
  note: string
  noteAccent?: boolean
  includes: string[]
  cta: string
  ctaClass: string
  featured?: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    label: 'За каждую встречу',
    amount: '€25',
    note: 'Оплата перед каждым занятием',
    includes: ['Все встречи и материалы', 'Закрытый чат', 'Ранний доступ к подкасту'],
    cta: 'Оставить заявку',
    ctaClass: 'btn btn--outline btn--full',
  },
  {
    label: 'Минимальное членство',
    amount: '€20',
    note: '€40 за 2 встречи · 1 месяц',
    noteAccent: true,
    includes: ['Все встречи и материалы', 'Закрытый чат и нетворкинг', 'Ранний доступ к подкасту'],
    cta: 'Хочу попасть в комьюнити',
    ctaClass: 'btn btn--primary btn--full',
    featured: true,
    badge: 'Лучший выбор',
  },
  {
    label: 'На 3 месяца',
    amount: '€18',
    note: '€108 за 6 встреч · 3 месяца',
    noteAccent: true,
    includes: ['Все встречи и материалы', 'Закрытый чат и нетворкинг', 'Ранний доступ к подкасту'],
    cta: 'Оставить заявку',
    ctaClass: 'btn btn--outline btn--full',
  },
]

/** Галочка в списке включённого — цвет захардкожен в исходной вёрстке */
function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 5" stroke="#000DC3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Pricing() {
  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <h2 className="section-title">Стоимость</h2>

        <div className="pricing__grid">
          {PLANS.map((p) => (
            <div className={p.featured ? 'pricing__card pricing__card--featured' : 'pricing__card'} key={p.label}>
              {p.badge && <div className="pricing__badge">{p.badge}</div>}
              <p className="pricing__label">{p.label}</p>
              <div className="pricing__price">
                <span className="pricing__amount">{p.amount}</span>
                <span className="pricing__period">/ встреча</span>
              </div>
              <p className={p.noteAccent ? 'pricing__note pricing__note--accent' : 'pricing__note'}>{p.note}</p>
              <ul className="pricing__includes">
                {p.includes.map((item) => (
                  <li key={item}>
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={FORMS_URL} className={p.ctaClass}>{p.cta}</a>
            </div>
          ))}
        </div>

        <p className="pricing__footer-note">
          Месяц участия — дешевле одной сессии у психолога и полезнее чем разъебаться на мотоцикле
        </p>
      </div>
    </section>
  )
}
