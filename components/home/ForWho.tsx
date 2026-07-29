const QUOTES = [
  'У тебя есть друзья. А ты говорил с ними о чем-то кроме новостей, работы и футбола?',
  'Живёшь на автопилоте. Чего-то не хватает, а чего — не знаешь',
  'Решаешь чужие задачи. Но свои ставят тебя в тупик',
  'Читал книжки, слушал подкасты, ходил к психологу. Но живой контакт с мужчинами — то, что заочно не получишь ',
]

export default function ForWho() {
  return (
    <section className="section for-who" id="for-who">
      <div className="container">
        <h2 className="section-title">Знакомо?</h2>

        <div className="cards-grid cards-grid--2x2">
          {QUOTES.map((text) => (
            <div className="card card--quote" key={text}>
              <span className="card__mark" aria-hidden="true">&quot;</span>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <p className="for-who__conclusion">Если узнал себя — «Мужская среда» создана для таких, как ты</p>
      </div>
    </section>
  )
}
