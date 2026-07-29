import { Fragment } from 'react'
import { FORMS_URL } from '@/lib/site'

const UNITS = [
  { id: 'cd-days', unit: 'дней' },
  { id: 'cd-hours', unit: 'часов' },
  { id: 'cd-mins', unit: 'минут' },
  { id: 'cd-secs', unit: 'секунд' },
]

export default function CountdownSection() {
  return (
    <section className="countdown-section" id="countdown" aria-label="Обратный отсчёт до старта">
      <div className="container countdown-section__inner">
        <p className="countdown-section__label">До ближайшей встречи</p>

        <div className="countdown">
          {UNITS.map(({ id, unit }, i) => (
            <Fragment key={id}>
              {i > 0 && <div className="countdown__sep" aria-hidden="true">:</div>}
              <div className="countdown__item">
                <span className="countdown__num" id={id}>--</span>
                <span className="countdown__unit">{unit}</span>
              </div>
            </Fragment>
          ))}
        </div>

        <a href={FORMS_URL} className="btn btn--primary">Оставить заявку</a>
      </div>
    </section>
  )
}
