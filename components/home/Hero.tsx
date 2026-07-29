import { FORMS_URL } from '@/lib/site'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg-grid" aria-hidden="true" />
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
        <span className="badge">
          {/* Дату подставляет MeetingClock; в разметке — та же заглушка, что и раньше */}
          <span className="badge__desktop">
            <span id="badge-date">Ближайшая встреча</span> · 18:00 Варшава / 19:00 Минск · Онлайн в Zoom
          </span>
          <span className="badge__mobile">
            <span id="badge-date-m">Ближайшая встреча</span> · Онлайн в Zoom
          </span>
        </span>

        <h1 className="hero__title">
          Для мужчин,<br />которым есть<br />что сказать —<br />но некому
        </h1>

        <p className="hero__sub">Говорим о том, о чем другие мужчины предпочитают молчать</p>

        <a href={FORMS_URL} className="btn btn--primary btn--lg">Оставить заявку</a>
      </div>
    </section>
  )
}
