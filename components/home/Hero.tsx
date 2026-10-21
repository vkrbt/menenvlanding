import TypoLines from '@/components/TypoLines'
import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, GROUP_PITCH, GROUP_SEATS, MEETING_TIME, PRICE_FROM, RECRUITMENT_NOTE } from '@/lib/site'
import { typo } from '@/lib/typo'

export default function Hero() {
  const facts = [
    `${GROUP_MEETINGS} встреч по 3 часа`,
    'По средам раз в 2 недели',
    MEETING_TIME,
    `До ${GROUP_SEATS} человек`,
    `От ${PRICE_FROM} за встречу`,
  ]

  return (
    <section className="hero">
      <div className="hero__image-wrap" aria-hidden="true">
        <img
          src="/assets/images/hero.webp"
          alt=""
          className="hero__image"
          width={1600}
          height={900}
          decoding="async"
          fetchPriority="low"
        />
      </div>

      <div className="container hero__inner">
        {/* Перенос здесь нужен и на мобильном, поэтому обычный <br />, а не TypoLines */}
        <h1 className="hero__title">
          {typo('Друзья есть.')}<br />{typo('А поговорить не с кем')}
        </h1>

        {/* Определение для человека и для сниппета поисковика */}
        <p className="hero__sub">
          <TypoLines parts={GROUP_PITCH} />
        </p>

        <ul className="hero__facts">
          {facts.map((f) => <li key={f}>{typo(f)}</li>)}
        </ul>

        <div className="hero__actions">
          <a href={FORMS_URL} className="btn btn--primary btn--lg">{typo('Занять место в группе')}</a>
          <a href="#program" className="btn btn--outline btn--lg">Смотреть программу</a>
        </div>

        <p className="hero__note">
          {RECRUITMENT_NOTE && <><span className="hero__seats">{typo(RECRUITMENT_NOTE)}</span> · </>}
          {typo(`Старт ${startPhrase()} · Сначала бесплатный созвон на 10–15 минут`)}
        </p>
      </div>
    </section>
  )
}
