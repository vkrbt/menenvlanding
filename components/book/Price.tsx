const ORDER_FORM_URL = 'https://forms.gle/VammyfFy9fGfKgk87'
const TELEGRAM_URL = 'https://t.me/vkrbt'

const CURRENCIES = [
  { value: '250', code: 'PLN' },
  { value: '200', code: 'BYN' },
  { value: '70', code: '$' },
  { value: '6 000', code: '₽' },
]

/** Стрелка вправо — используется в обеих ссылках, только разного размера */
function Arrow({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

export default function Price() {
  return (
    <section className="section price" id="order">
      <div className="container">
        <div className="price__inner animate-in">
          <div className="price__card">
            <div className="price__eyebrow">Комплект из трёх книг</div>
            <div className="price__amount">60 €</div>

            <div className="price__currencies">
              {CURRENCIES.map((c) => (
                <div className="price__cur" key={c.code}>
                  <span>{c.value}</span> {c.code}
                </div>
              ))}
            </div>

            <p className="price__note">
              Три книги. Одна посылка. Без наценки за «курирование» — ты платишь за книги и поддерживаешь проект.
            </p>

            <a href={ORDER_FORM_URL} className="btn btn--primary btn--lg">
              Заказать комплект
              <Arrow size={18} />
            </a>

            <a href={TELEGRAM_URL} className="price__telegram">
              Вопросы? Напиши в Telegram
              <Arrow size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
