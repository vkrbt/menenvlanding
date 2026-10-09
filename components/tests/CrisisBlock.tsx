import { CRISIS_CHECKED, CRISIS_CONTACTS, CRISIS_INTERNATIONAL } from '@/lib/tests/crisis'

/**
 * Блок экстренной помощи. Показывается по ответу на пункт о суицидальных
 * мыслях независимо от суммы баллов. Стоит сразу под баллом: результат
 * остаётся главным на экране, а 112 видно без прокрутки; линии по странам
 * раскрываются по клику. urgent — усиленная рамка при выраженных мыслях.
 */
export default function CrisisBlock({ urgent = false }: { urgent?: boolean }) {
  return (
    <section className={urgent ? 'crisis crisis--urgent' : 'crisis'} aria-labelledby="crisis-title">
      <h3 id="crisis-title">Если есть мысли о том, чтобы уйти из жизни</h3>
      <p>
        С этим не нужно справляться одному. Позвони на линию помощи — там выслушают и помогут
        разобраться, что делать прямо сейчас. Если есть непосредственная опасность, звони
        в экстренную службу <a href="tel:112">112</a>.
      </p>

      <details className="crisis__more">
        <summary>Линии помощи по странам</summary>
      <ul className="crisis__list">
        {CRISIS_CONTACTS.map((c) => (
          <li key={c.country}>
            <p className="crisis__country">{c.country}</p>
            {c.lines.map((l) => (
              <div className="crisis__line" key={l.phone}>
                <span className="crisis__service">{l.service}</span>
                <a className="crisis__phone" href={`tel:${l.tel}`}>{l.phone}</a>
                <span className="crisis__hours">{l.note}</span>
              </div>
            ))}
            {c.caveat && <p className="crisis__caveat">{c.caveat}</p>}
          </li>
        ))}
      </ul>
      </details>

      <p className="crisis__other">
        Другая страна — линию подберёт{' '}
        <a href={CRISIS_INTERNATIONAL.url} target="_blank" rel="noopener noreferrer">
          {CRISIS_INTERNATIONAL.name}
        </a>
        .
      </p>
      <p className="crisis__checked">Номера проверены по официальным источникам {CRISIS_CHECKED}.</p>
    </section>
  )
}
