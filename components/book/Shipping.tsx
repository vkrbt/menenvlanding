const CARDS = [
  { label: 'Что в комплекте', text: 'Три бумажные книги на русском языке. Только комплектом — отдельно не продаём.' },
  { label: 'Доставка', text: 'Отправляем по всему миру. Сроки и стоимость уточняем индивидуально.' },
  { label: 'Оплата', text: 'Карты, переводы, крипта — подберём удобный вариант. Детали после оформления заказа.' },
]

export default function Shipping() {
  return (
    <section className="section shipping">
      <div className="container">
        <span className="shipping__eyebrow animate-in">Детали</span>

        <div className="shipping__grid animate-in">
          {CARDS.map((c) => (
            <div className="shipping__card" key={c.label}>
              <div className="shipping__label">{c.label}</div>
              <div className="shipping__text">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
