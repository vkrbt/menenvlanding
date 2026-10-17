import TypoLines from '@/components/TypoLines'
import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, GROUP_SEATS, MEETING_TIME, PRICE_FROM, RECRUITMENT_NOTE } from '@/lib/site'
import { typo } from '@/lib/typo'

export default function Hero() {
  const facts = [
    `${GROUP_MEETINGS} встреч по 3 часа`,
    `Раз в 2 недели по средам, ${MEETING_TIME}`,
    `До ${GROUP_SEATS} человек`,
    `От ${PRICE_FROM} за встречу`,
  ]

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />

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
          <TypoLines
            parts={[
              '«Мужская среда» — тематическая онлайн-группа для мужчин, где мы говорим о том, о чём другие мужчины предпочитают молчать.',
              'Девять встреч, на каждой одна тема: дело и деньги, отношения, зависимости, злость, мама, папа. ' +
                'Ведут психолог и психиатр.',
            ]}
          />
        </p>

        <ul className="hero__facts">
          {facts.map((f) => <li key={f}>{typo(f)}</li>)}
        </ul>

        <div className="hero__actions">
          <a href={FORMS_URL} className="btn btn--primary btn--lg">{typo('Занять место в группе')}</a>
          <a href="#program" className="hero__link">Смотреть программу</a>
        </div>

        <p className="hero__note">
          {RECRUITMENT_NOTE && <><span className="hero__seats">{typo(RECRUITMENT_NOTE)}</span> · </>}
          {typo(`Старт ${startPhrase()} · Сначала бесплатный созвон на 10–15 минут`)}
        </p>
      </div>
    </section>
  )
}
