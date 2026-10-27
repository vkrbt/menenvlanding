import { startPhrase } from '@/lib/group'
import {
  BLOCK_SIZE,
  FORMS_URL,
  GROUP_MEETINGS,
  GROUP_SEATS,
  MEETING_TIME,
  PRICE_FROM,
  PRICE_PROGRAM,
  RECRUITMENT_NOTE,
  VLAD,
  ZHENYA,
} from '@/lib/site'
import { typo } from '@/lib/typo'
import TypoLines from '@/components/TypoLines'
import Typo from '@/components/Typo'

const INCLUDES = [
  `${GROUP_MEETINGS} встреч по 3 часа в Zoom, раз в две недели по средам в ${MEETING_TIME}`,
  'Программа из восьми тем и итоговая встреча',
  `Постоянный состав, до ${GROUP_SEATS} человек`,
  `Два ведущих: ${VLAD.profession} и ${ZHENYA.profession}`,
  'Ранний доступ к подкасту и материалы, которые в него не попадают',
]

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Offer() {
  return (
    <Typo>
    <section className="section offer" id="offer" aria-labelledby="offer-title">
      <div className="container offer__inner">
        <div className="offer__main">
          <h2 className="section-title" id="offer-title">Место в группе</h2>
          <ul className="offer__list">
            {INCLUDES.map((item) => (
              <li key={item}>
                <Check />
                {typo(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="offer__panel">
          <p className="offer__start">{typo([`Старт ${startPhrase()}`, RECRUITMENT_NOTE].filter(Boolean).join(' · '))}</p>
          <p className="offer__price">
            <span className="offer__amount">
              от {PRICE_FROM}
              <a href="#offer-payment-note" className="price-mark" aria-label="Об оплате из других стран">*</a>
            </span>
            <span className="offer__period">за встречу</span>
          </p>
          <p className="offer__terms">
            {typo(`€${PRICE_PROGRAM} сразу за все ${GROUP_MEETINGS} встреч.`)}<br />
            {typo(`Можно платить блоками по ${BLOCK_SIZE} или за каждую встречу — тарифы`)} <a href="#pricing">ниже</a>
          </p>
          <a href={FORMS_URL} className="btn btn--primary btn--full">{typo('Занять место в группе')}</a>
          <p className="offer__hint">
            <TypoLines parts={['Сначала созвонимся на 10–15 минут, это бесплатно.', 'Место твоё после первой оплаты.']} />
          </p>
        </div>
      </div>
      <p className="container payment-note" id="offer-payment-note">
        {typo('* Принимаем оплату из любой страны — для каждого подберём удобный способ.')}
      </p>
    </section>
    </Typo>
  )
}
