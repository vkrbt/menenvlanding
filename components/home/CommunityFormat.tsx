import { typo } from '@/lib/typo'
import TypoLines from '@/components/TypoLines'

const STEPS = [
  {
    title: 'Тема — повод начать разговор',
    body: 'Тему ты знаешь заранее, она есть в программе. Придумывать, с чего начать, не придётся',
  },
  {
    title: 'Разговор',
    body: 'Уровень самораскрытия выбираешь сам. Ведущие следят, чтобы разговор не превращался в раздачу советов и оценок',
  },
  {
    title: 'Обмен',
    body: 'Важнее быть честным, чем красноречивым. Самое интересное начинается, когда кто-то говорит о себе, и другой понимает: «Блин, у меня же то же самое»',
  },
]

export default function CommunityFormat() {
  return (
    <section className="section community-format" id="community-format" aria-labelledby="community-format-title">
      <div className="container">
        <h2 className="community-format__title" id="community-format-title">
          <TypoLines parts={['Окей, но что конкретно', 'будет на встрече?']} />
        </h2>
        <p className="community-format__lead">
          <TypoLines
            parts={['Мы знаем, что неизвестность — главная причина не прийти.', 'Поэтому вот как это будет']}
          />
        </p>

        <ol className="community-format__list">
          {STEPS.map((s, i) => (
            <li className="community-format__item" key={s.title}>
              <span className="community-format__num" aria-hidden="true">{i + 1}</span>
              <div className="community-format__body">
                <h3>{typo(s.title)}</h3>
                <p>{typo(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
