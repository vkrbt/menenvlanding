export default function HeroBooks() {
  return (
    <section className="hero-books">
      <div className="hero-books__bg-grid" aria-hidden="true" />
      <div className="hero-books__glow" aria-hidden="true" />

      <div className="container hero-books__inner">
        <span className="badge">Книжный комплект</span>

        <h1 className="hero-books__title">
          Три книги,<br />которые стоило<br />прочитать <em>вчера</em>
        </h1>

        <p className="hero-books__sub">
          У&nbsp;большинства мужчин одна и та же проблема:{' '}
          <strong>они чувствуют что-то, но не могут это назвать.</strong>{' '}
          Тревога без причины. Злость без адреса. Ощущение, что живёшь чужую жизнь, но непонятно — чью именно.
          <br /><br />
          Эти три книги дают то, чего не хватает: <strong>язык.</strong>{' '}
          Когда ты можешь назвать то, что с тобой происходит, — ты перестаёшь с этим бороться и начинаешь с этим&nbsp;работать.
        </p>

        <a href="#order" className="btn btn--primary btn--lg">Заказать комплект</a>
      </div>
    </section>
  )
}
