import { FORMS_URL } from '@/lib/site'
import { typo } from '@/lib/typo'

const QUOTES = [
  'Хочу компанию мужиков, с которыми можно не только про работу, тачки и футбол',
  'По паспорту я взрослый, а внутри будто так и не повзрослел',
  'Многое хочу сделать, но ссыкотно. И сам не понимаю, что мешает',
  'Всё время куда-то спешу. А куда — сам не знаю',
  'Интересно, у других мужиков так же? Или это только со мной что-то не так?',
  'Ни разу не был у психолога и не понимаю, с чего вообще начать',
]

export default function ForWho() {
  return (
    <section className="section for-who" id="for-who">
      <div className="container">
        <h2 className="section-title">Знакомо?</h2>

        <ul className="for-who__list">
          {QUOTES.map((text) => (
            <li className="for-who__item" key={text}>{typo(text)}</li>
          ))}
        </ul>

        <p className="for-who__conclusion">
          {typo('Если узнал себя хотя бы в одном пункте, группа для тебя.')}{' '}
          <a href={FORMS_URL}>{typo('Занять место в группе')}</a>
        </p>
      </div>
    </section>
  )
}
