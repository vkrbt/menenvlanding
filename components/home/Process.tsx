import { startPhrase } from '@/lib/group'
import { GROUP_START } from '@/lib/site'
import { typo } from '@/lib/typo'

export default function Process() {
  const steps = [
    { num: '01', title: 'Оставляешь заявку', body: 'Анкета на 1 минуту — без лишнего' },
    {
      num: '02',
      title: 'Короткое знакомство',
      body: 'Созвонимся на 10–15 минут и поймём, подходит ли тебе группа, а ты ей. Говорим с каждым, потому что от состава зависит, получится ли разговор',
    },
    {
      num: '03',
      title: 'Занимаешь место',
      body: `После созвона делаешь первую оплату, и место твоё. Группа стартует ${startPhrase()}: ближе к делу ${GROUP_START ? '' : 'пришлём точную дату и '}добавим в чат`,
    },
  ]

  return (
    <section className="section process">
      <div className="container">
        <h2 className="section-title">Как попасть</h2>

        <ol className="steps">
          {steps.map((s) => (
            <li className="step" key={s.num}>
              <div className="step__num" aria-hidden="true">{s.num}</div>
              <div className="step__body">
                <h3>{typo(s.title)}</h3>
                <p>{typo(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="process__note">
          {typo(
            'Группа не подойдёт, если ты сейчас в остром кризисе: недавно потерял близкого, ' +
              'развёлся, появляются мысли не жить. Или если пьёшь или употребляешь так, что это ' +
              'уже управляет жизнью. В таких случаях начинать лучше с индивидуальной помощи. ' +
              'Подскажем, куда обратиться.',
          )}
        </p>
      </div>
    </section>
  )
}
