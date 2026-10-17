import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, GROUP_SEATS } from '@/lib/site'
import { typo } from '@/lib/typo'

export default function CtaFinal() {
  return (
    <section className="section cta-final">
      <div className="cta-final__glow" aria-hidden="true" />
      <div className="container cta-final__inner">
        <h2 className="cta-final__title">{typo('Займи место в группе')}</h2>
        <p className="cta-final__time">
          {typo(`Старт ${startPhrase()} · ${GROUP_MEETINGS} встреч · до ${GROUP_SEATS} человек · Zoom`)}
        </p>
        <p className="cta-final__sub">{typo('Оставь заявку, мы напишем и договоримся о созвоне')}</p>
        <a href={FORMS_URL} className="btn btn--primary btn--lg">{typo('Занять место в группе')}</a>
        <p className="cta-final__hint">{typo('Созвон бесплатный. Поймёшь, что не твоё, — просто скажешь')}</p>
      </div>
    </section>
  )
}
