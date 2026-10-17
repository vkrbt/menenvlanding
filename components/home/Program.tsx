import { formatDay, meetingDate } from '@/lib/group'
import { GROUP_MEETINGS, MEETING_TIME } from '@/lib/site'
import { typo } from '@/lib/typo'
import TypoLines from '@/components/TypoLines'

const TOPICS = [
  {
    title: 'Знакомство',
    body: 'Кто с чем пришёл и о чём договариваемся на эти месяцы.',
  },
  {
    title: 'Деньги',
    body: 'Сколько ты зарабатываешь и сколько, по-твоему, должен бы. Откуда стыд и вечное «я не умею».',
  },
  {
    title: 'Отношения',
    body: 'Женщины и партнёрство. Кто у вас в паре принимает решения и устраивает ли тебя это.',
  },
  {
    title: 'Зависимости',
    body: 'Алкоголь, телефон, работа, спорт до изнеможения: всё, чем удобно заглушить то, что не хочется чувствовать.',
  },
  {
    title: 'Конкуренция, конфликты и агрессия',
    body: 'Что делать со злостью, чтобы она не разрушала. И как говорить с другими мужчинами на равных, не снизу и не сверху.',
  },
  {
    title: 'Детство',
    body: 'Что ты вынес оттуда и до сих пор носишь с собой.',
  },
  {
    title: 'Мама',
    body: 'Какие у вас отношения сейчас. И где ты встречаешь её в своих женщинах.',
  },
  {
    title: 'Папа',
    body: 'Был ли он рядом и каким мужчиной из-за этого стал ты.',
  },
  {
    title: 'Завершение',
    body: 'Смотрим, что изменилось, и решаем, что дальше.',
  },
]

export default function Program() {
  return (
    <section className="section program" id="program">
      <div className="container">
        <h2 className="section-title">Программа: {GROUP_MEETINGS} встреч, 8 тем</h2>
        <p className="program__lead">
          <TypoLines
            parts={[
              `Раз в две недели по средам в ${MEETING_TIME}, 3 часа в Zoom.`,
              'Начинаем с тем, о которых говорить проще, и постепенно доходим до трудных.',
            ]}
          />
        </p>

        <ol className="program__list">
          {TOPICS.map((t, i) => {
            const date = meetingDate(i)
            return (
              <li className="program__item" key={t.title}>
                <span className="program__num" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3>
                    {typo(t.title)}
                    {date && <span className="program__date">{formatDay(date)}</span>}
                  </h3>
                  <p>{typo(t.body)}</p>
                </div>
              </li>
            )
          })}
        </ol>

        <p className="program__note">
          <TypoLines
            parts={['Кто захочет продолжить, сможет перейти в терапевтическую группу.', 'Там заданных тем уже нет.']}
          />
        </p>
      </div>
    </section>
  )
}
