import { BLOCK_SIZE, FORMS_URL, GROUP_MEETINGS, PRICE_BLOCK, PRICE_PROGRAM, PRICE_SINGLE } from '@/lib/site'
import { typo } from '@/lib/typo'
import TypoLines from '@/components/TypoLines'

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

/** Сколько стоила бы вся программа при оплате за каждую встречу — от неё считаем экономию */
const FULL_PRICE = PRICE_SINGLE * GROUP_MEETINGS
const BLOCKS = GROUP_MEETINGS / BLOCK_SIZE
const PROGRAM = `Вся программа: ${GROUP_MEETINGS} встреч и 8 тем`
const EXTRAS = 'Чат группы и ранний доступ к подкасту'

/** Программа у всех одна, тарифы — это способы её оплатить. Самый выгодный — по центру */
const PLANS: Plan[] = [
  {
    label: `Блоками по ${BLOCK_SIZE} встречи`,
    amount: `€${PRICE_BLOCK / BLOCK_SIZE}`,
    note: `€${PRICE_BLOCK} за блок · ${BLOCKS} платежа`,
    noteAccent: true,
    includes: [PROGRAM, `На €${FULL_PRICE - PRICE_BLOCK * BLOCKS} дешевле, чем платить за каждую встречу`, EXTRAS],
    cta: 'Оставить заявку',
    ctaClass: 'btn btn--outline btn--full',
  },
  {
    label: 'Вся программа сразу',
    amount: `€${PRICE_PROGRAM / GROUP_MEETINGS}`,
    note: `€${PRICE_PROGRAM} за все ${GROUP_MEETINGS} встреч`,
    noteAccent: true,
    includes: [PROGRAM, `На €${FULL_PRICE - PRICE_PROGRAM} дешевле, чем платить за каждую встречу`, EXTRAS],
    cta: 'Занять место в группе',
    ctaClass: 'btn btn--primary btn--full',
    featured: true,
    badge: 'Выгоднее всего',
  },
  {
    label: 'За каждую встречу',
    amount: `€${PRICE_SINGLE}`,
    note: 'Оплата перед каждой встречей',
    includes: [PROGRAM, 'Без оплаты вперёд', EXTRAS],
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
              <p className="pricing__label">{typo(p.label)}</p>
              <div className="pricing__price">
                <span className="pricing__amount">{p.amount}</span>
                <span className="pricing__period">/ встреча</span>
              </div>
              <p className={p.noteAccent ? 'pricing__note pricing__note--accent' : 'pricing__note'}>{typo(p.note)}</p>
              <ul className="pricing__includes">
                {p.includes.map((item) => (
                  <li key={item}>
                    <Check />
                    {typo(item)}
                  </li>
                ))}
              </ul>
              <a href={FORMS_URL} className={p.ctaClass}>{typo(p.cta)}</a>
            </div>
          ))}
        </div>

        <p className="pricing__footer-note">
          <TypoLines
            parts={['Встреча идёт три часа и стоит как час у психолога.', 'И полезнее, чем разъебаться на мотоцикле']}
          />
        </p>
      </div>
    </section>
  )
}
