const STEPS = [
  {
    title: 'Тема — повод начать разговор',
    body: 'Мы объявляем тему заранее. Работа и отношения, отцы и сыновья, одиночество в эмиграции, деньги, злость, дружба',
  },
  {
    title: 'Разговор',
    body: 'Уровень самораскрытия выбираешь сам',
  },
  {
    title: 'Обмен',
    body: 'Важнее быть честным, чем красноречивым. Самое интересное начинается, когда кто-то говорит о себе, и другой понимает: «Блин, у меня же то же самое»',
  },
]

export default function CommunityFormat() {
  return (
    <section className="section community-format" id="community-format" aria-labelledby="community-format-title">
      <div className="container">
        <h2 className="community-format__title" id="community-format-title">
          Окей, но что конкретно будет на встрече?
        </h2>
        <p className="community-format__lead">
          Мы знаем, что неизвестность - это главная причина не прийти. Поэтому вот как это будет
        </p>

        <ol className="community-format__list">
          {STEPS.map((s, i) => (
            <li className="community-format__item" key={s.title}>
              <span className="community-format__num" aria-hidden="true">{i + 1}</span>
              <div className="community-format__body">
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
