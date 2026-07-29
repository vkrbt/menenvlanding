import { VLAD, ZHENYA } from '@/lib/site'

const HOSTS = [
  {
    name: 'Влад',
    photo: '/photos/vlad.png',
    social: VLAD.url,
    handle: VLAD.handle,
    roles: ['Гештальт-терапевт'],
    quote:
      'Днём пишет код в Big Tech, вечером ведёт клиентов. Прошёл путь от «я всё решу логикой» до «окей, кажется, не всё» — и теперь помогает другим мужчинам не застрять на первой стадии. Один из двух ведущих «Мужской среды» — закрытого онлайн-сообщества, где мужчины раз в две недели говорят о своём. Следит, чтобы никто не прятался за умными словами, включая себя.',
  },
  {
    name: 'Женя',
    photo: '/photos/eugene.jpeg',
    social: ZHENYA.url,
    handle: ZHENYA.handle,
    roles: ['Психиатр-нарколог'],
    quote:
      'Сбежал в дата-инженерию — не помогло, вокруг оказались мужчины с теми же вопросами, только в Zoom вместо кабинета. Второй ведущий «Мужской среды» — сообщества, куда мужчины приходят поговорить, а не лечиться. Не лечит — но если будешь врать себе, заметит.',
  },
]

export default function Hosts() {
  return (
    <section className="section hosts" id="hosts">
      <div className="container">
        <h2 className="section-title">Кто ведёт</h2>

        <div className="hosts__grid">
          {HOSTS.map((h) => (
            <div className="host-card" key={h.name}>
              <div className="host-card__avatar" aria-label={`Фото ${h.name === 'Влад' ? 'Влада' : 'Жени'}`}>
                <img src={h.photo} alt={h.name} />
              </div>
              <div className="host-card__body">
                <div className="host-card__name-row">
                  <h3 className="host-card__name">{h.name}</h3>
                  <a href={h.social} target="_blank" rel="noopener noreferrer" className="host-card__social">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                    </svg>
                    {h.handle}
                  </a>
                </div>
                <ul className="host-card__roles">
                  {h.roles.map((r) => <li key={r}>{r}</li>)}
                </ul>
                <blockquote className="host-card__quote">{h.quote}</blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
