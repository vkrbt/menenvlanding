import { Fragment } from 'react'

const STEPS = [
  { label: 'Зойя', text: 'Откуда пустота' },
  { label: 'Холлис', text: 'Почему болит' },
  { label: 'Гловер', text: 'Что делать' },
]

export default function Arc() {
  return (
    <section className="section arc">
      <div className="container">
        <div className="arc__box animate-in">
          <div className="arc__title">Три книги — одна траектория</div>

          <div className="arc__flow">
            {STEPS.map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && <div className="arc__arrow" aria-hidden="true">→</div>}
                <div className="arc__step">
                  <div className="arc__step-label">{s.label}</div>
                  <div className="arc__step-text">{s.text}</div>
                </div>
              </Fragment>
            ))}
          </div>

          <p className="arc__desc">
            От понимания — через узнавание — к действию. Зойя даёт масштаб: проблема не в тебе, а в культуре, которая потеряла отца. Холлис сужает фокус: вот как эта потеря живёт конкретно в тебе. Гловер даёт план: вот что делать, начиная с&nbsp;завтрашнего&nbsp;утра.
          </p>
        </div>
      </div>
    </section>
  )
}
