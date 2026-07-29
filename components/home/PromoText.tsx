export default function PromoText() {
  return (
    <section className="section promo-text">
      <div className="promo-text__glow" aria-hidden="true" />
      <div className="container promo-text__inner">
        <span className="promo-text__mark" aria-hidden="true">&quot;</span>
        <blockquote className="promo-text__copy">
          Мы&nbsp;не обещаем, что жизнь перевернётся после первой встречи. Но&nbsp;мужчины, которые находят нормальное окружение,{' '}
          <strong>перестают тратить энергию и&nbsp;тащить всё&nbsp;в&nbsp;одиночку.</strong>
        </blockquote>
      </div>
    </section>
  )
}
