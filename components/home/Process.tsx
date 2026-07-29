const STEPS = [
  { num: '01', title: 'Оставляешь заявку', body: 'Анкета на 1 минуту — без лишнего' },
  { num: '02', title: 'Короткое знакомство', body: 'Созвонимся на 10-15 минут, чтобы убедиться, что комьюнити подходит тебе — и ты нам' },
  { num: '03', title: 'Вступаешь', body: 'Получаешь доступ к чату, материалам и первой встрече' },
]

export default function Process() {
  return (
    <section className="section process">
      <div className="container">
        <h2 className="section-title">Как попасть</h2>

        <ol className="steps">
          {STEPS.map((s) => (
            <li className="step" key={s.num}>
              <div className="step__num" aria-hidden="true">{s.num}</div>
              <div className="step__body">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
