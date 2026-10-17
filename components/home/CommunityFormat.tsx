import type { ReactNode } from 'react'
import { typo } from '@/lib/typo'
import TypoLines from '@/components/TypoLines'

/**
 * Иллюстрации к шагам — карточки и реплики с толстой обводкой, в духе remotion.dev.
 * Чисто декоративные: весь смысл шага — в заголовке и тексте под ними
 */
const ART: Record<'topic' | 'talk' | 'share', ReactNode> = {
  topic: (
    <div className="fart fart--topic">
      <div className="fart__card fart__card--back" />
      <div className="fart__card fart__card--front">
        <span className="fart__label">Тема встречи</span>
        <span className="fart__topic">Папа</span>
      </div>
    </div>
  ),
  talk: (
    <div className="fart fart--talk">
      <div className="fart__bubble fart__bubble--l"><i /><i /></div>
      <div className="fart__bubble fart__bubble--r"><i /></div>
      <div className="fart__bubble fart__bubble--l fart__bubble--wide"><i /><i /><i /></div>
    </div>
  ),
  share: (
    <div className="fart fart--share">
      <div className="fart__bubble fart__bubble--l fart__bubble--text">…и до сих пор жду, что он позвонит первым</div>
      <div className="fart__bubble fart__bubble--r fart__bubble--accent">Блин, у меня же то же самое</div>
    </div>
  ),
}

const STEPS = [
  {
    art: ART.topic,
    title: 'Тема — повод начать разговор',
    body: 'Тему ты знаешь заранее, она есть в программе. Придумывать, с чего начать, не придётся',
  },
  {
    art: ART.talk,
    title: 'Разговор',
    body: 'Уровень самораскрытия выбираешь сам. Ведущие следят, чтобы разговор не превращался в раздачу советов и оценок',
  },
  {
    art: ART.share,
    title: 'Обмен',
    body: 'Важнее быть честным, чем красноречивым. Самое интересное начинается, когда кто-то говорит о себе, и другой понимает: «Блин, у меня же то же самое»',
  },
]

export default function CommunityFormat() {
  return (
    <section className="section community-format" id="community-format" aria-labelledby="community-format-title">
      <div className="container">
        <h2 className="section-title" id="community-format-title">
          <TypoLines parts={['Окей, но что конкретно', 'будет на встрече?']} />
        </h2>
        <p className="section-lead">
          <TypoLines
            parts={['Мы знаем, что неизвестность — главная причина не прийти.', 'Поэтому вот как это будет']}
          />
        </p>

        <ol className="community-format__list">
          {STEPS.map((s, i) => (
            <li className="community-format__item" key={s.title}>
              <div className="community-format__art" aria-hidden="true">{s.art}</div>
              <h3>
                <span className="kicker">Шаг {i + 1}</span>
                {typo(s.title)}
              </h3>
              <p>{typo(s.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
