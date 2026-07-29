import { FORMS_URL } from '@/lib/site'

export default function CtaFinal() {
  return (
    <section className="section cta-final">
      <div className="cta-final__glow" aria-hidden="true" />
      <div className="container cta-final__inner">
        {/* Дату подставляет MeetingClock */}
        <h2 className="cta-final__title" id="cta-date">Ближайшая встреча</h2>
        <p className="cta-final__time">18:00 по Варшаве&nbsp;(CET+1) · 19:00 по Минску</p>
        <p className="cta-final__sub">Оставь заявку — мы напишем тебе лично</p>
        <a href={FORMS_URL} className="btn btn--primary btn--lg">Оставить заявку</a>
        <p className="cta-final__hint">Это бесплатно и ни к чему не обязывает</p>
      </div>
    </section>
  )
}
