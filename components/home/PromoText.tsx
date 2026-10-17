import { typo } from '@/lib/typo'

export default function PromoText() {
  return (
    <section className="section promo-text">
      <div className="promo-text__glow" aria-hidden="true" />
      <div className="container promo-text__inner">
        <span className="promo-text__mark" aria-hidden="true">&quot;</span>
        <blockquote className="promo-text__copy">
          {typo('Мы не обещаем, что жизнь перевернётся после первой встречи.')}{' '}
          <br className="br-desktop" />
          {typo('Но мужчины, которые находят нормальное окружение,')}{' '}
          <strong>{typo('перестают тратить энергию и тащить всё в одиночку.')}</strong>
        </blockquote>
      </div>
    </section>
  )
}
