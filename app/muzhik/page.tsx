import type { Metadata, Viewport } from 'next'
import Crushed from '@/components/v2/Crushed'
import HostsV2 from '@/components/v2/HostsV2'
import KnockBand from '@/components/v2/KnockBand'
import LogoSvg from '@/components/v2/LogoSvg'
import MenuV2 from '@/components/v2/MenuV2'
import QuizV2 from '@/components/v2/QuizV2'
import Thoughts from '@/components/v2/Thoughts'
import { THOUGHTS } from '@/components/v2/pov-thoughts'
import SiteFooter from '@/components/SiteFooter'
import Faq from '@/components/Faq'
import Program from '@/components/home/Program'
import Typo from '@/components/Typo'
import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, MEETING_TIME, PRICE_BLOCK, PRICE_FROM, PRICE_PROGRAM, PRICE_SINGLE, BLOCK_SIZE, RECRUITMENT_NOTE, SITE_URL } from '@/lib/site'
import './v2.css'

/** Заголовки v2: Inter Tight — жирный и компактный; Oswald — надписи на деревянных табличках */
const HEAD_FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800;900&family=Oswald:wght@400&display=swap'

/**
 * Второй лендинг: оффер на самого человека, шуточный стиль, тест прямо на странице.
 * С 14.11.2026 открыт для поиска, адрес /muzhik (бывший /v2, с него редирект в vercel.json), canonical и sitemap — на /muzhik.
 */
export const metadata: Metadata = {
  title: { absolute: 'Устал тащить всё на себе? Мужская группа — «Мужская среда»' },
  description: 'Терапевтическая группа для мужиков онлайн: 9 встреч в Zoom, психолог и психиатр. Первый созвон бесплатный.',
  alternates: { canonical: `${SITE_URL}/muzhik` },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

/** Переделанные мем-цитаты «пацанской мудрости» под группу; у каждой свой портрет героя public/v2/quote-N.webp (в другой одежде, почти везде лысый) */
const QUOTES = [
  'Утром йога — вечером «Мужская Среда»',
  'Волк слабее льва и тигра, но он ходит в стае. Хватит быть одиноким волком',
  'Не важно, в какой ты жопе. Важно, чтобы было с кем об этом поговорить',
  'Настоящий мужик всегда стирает носки и сообщения. Но иногда пишет: «Мне хреново»',
  'Утром деньги — вечером терапия',
  'Буйвол внутри меня просыпается, когда ты на «Мужскую Среду» не собираешься',
]

const SIGNS = [
  'Держишь всё в себе, потому что «мужик должен»',
  'Не можешь расслабиться без пива, рилсов и еды',
  'Чувство пустоты глушишь женщинами, спортом и работой',
  'Срываешься на своих, а потом сам себя грызёшь',
  'После работы сидишь в машине, не можешь зайти домой',
  'Друзья вроде есть, а позвонить некому',
  'Не помнишь, когда в последний раз получал удовольствие',
  'Достижения и деньги перестали радовать как раньше',
]

/**
 * Деревянные таблички на шипах «Должен»: слово, центр таблички в % от картинки drag.webp,
 * крупный ли шип (на телефоне видны только крупные), наклон в градусах
 */
const SPIKES: Array<[string, number, number, boolean, number]> = [
  ['будь мужиком', 28.5, 16, true, -4],
  ['потерпи', 52.5, 28, true, 3],
  ['не ной', 65.3, 25, true, -3],
  ['ответственность', 86, 22, true, 4],
  ['усталость', 92, 62, true, -2],
  ['работа', 21, 36, false, -6],
  ['семья', 41, 44, false, 5],
  ['дети', 58.5, 44, false, -4],
  ['родители', 75.5, 44, false, 3],
  ['вина', 86.5, 47, false, -5],
  ['недосып', 45, 86, false, 4],
  ['переезд', 72, 86, false, -3],
]

const FACTS: Array<[string, string, string]> = [
  ['2 000 000', 'мужчин в год умирают из-за алкоголя. Это три из четырёх смертей от выпивки в мире.', 'ВОЗ, 2024'],
  ['100 в час', 'смертей в мире связывают с одиночеством. Больше 870 тысяч в год.', 'ВОЗ, 2025'],
  ['15%', 'мужчин в США без единого близкого друга. В 1990 году таких было 3%.', 'Survey Center on American Life, 2021'],
  ['5 лет', 'на столько в среднем мужчины в мире живут меньше женщин. В России разрыв почти 11 лет: 68 против 78,7.', 'ВОЗ, 2025; Росстат, 2023'],
]

const GET = [
  ['Можно сказать вслух', 'То, что обычно глотаешь. Никто не скажет «ты что, слабак» или «возьми себя в руки».'],
  ['Мужики, которые не засмеются', 'Состав постоянный, до 10 человек. На каждой встрече одни и те же лица, и уже со второй разговор идёт по-настоящему.'],
  ['Ведущие — психолог и психиатр-нарколог', 'Ведут каждую встречу и отвечают за то, что на ней происходит.'],
  ['Девять тем по порядку', 'Дело и деньги, отношения, зависимости, злость, детство, мама, папа. Начинаем с того, о чём говорить проще.'],
]

const STEPS = [
  ['Оставляешь заявку', 'Две минуты: имя, возраст, Telegram. Анкету видят только ведущие.'],
  ['Созваниваемся на 10–15 минут', 'Бесплатно. Знакомимся и отвечаем на вопросы. Не твоё — так и скажешь.'],
  [`Первая встреча ${startPhrase()}`, 'Zoom, три часа, камера включена. Дальше раз в две недели по средам.'],
]

const FAQ = [
  ['Зачем мне в группу, если я и так всё понимаю?', 'Понимать и менять — разные вещи. Можно всё про себя знать и раз за разом наступать на те же грабли. Книги и ролики тут не помогут: что-то сдвигается, когда говоришь с живыми людьми и видишь, как они на тебя реагируют.'],
  ['В группу идут, когда уже совсем плохо?', 'Нет. Чаще приходят, когда «вроде всё нормально», а на деле давно не так: устал, всё бесит, поговорить не с кем. Доводить до края не обязательно.'],
  ['Чем это отличается от разговора с друзьями?', 'Друзья утешают, советуют или переводят всё в шутку. В группе есть ведущие и правила: тебя дослушают до конца, советов раздавать не будут, а другие мужики честно скажут, как это выглядит со стороны.'],
  ['С чего начать?', 'С заявки и бесплатного созвона на 10–15 минут. Познакомимся, расскажем, как всё устроено. Если поймёшь, что не твоё, так и скажешь.'],
  ['Придётся пить таблетки?', 'Нет. Группа — это разговор, таблетки там не выписывают. Один из ведущих психиатр-нарколог, и если увидим, что тебе сейчас нужнее врач, скажем прямо — лучше отправим к специалисту.'],
  ['Кто-то узнает, что было на встрече?', 'Нет. Правило конфиденциальности: что было на встрече, там и остаётся. Если в группе окажется знакомый, это правило и для него.'],
  ['Как проходит встреча?', `Раз в две недели по средам, ${MEETING_TIME}. Три часа в Zoom, камера включена. У каждой встречи своя тема: дело и деньги, отношения, зависимости, злость, детство, мама, папа. Тема — повод начать, дальше говорим о том, что у кого происходит.`],
  ['Сколько это стоит?', `€${PRICE_PROGRAM} за все ${GROUP_MEETINGS} встреч. Можно в рассрочку: по €${PRICE_BLOCK} за блок из ${BLOCK_SIZE} встреч или по €${PRICE_SINGLE} за каждую встречу. Первый созвон бесплатный.`],
  ['Я могу оплатить из России, Беларуси, Европы или Азии, любой точки мира?', 'Да. Принимаем оплату из любой страны без проблем: для каждого подберём удобный способ, договоримся на созвоне.'],
]

function Cta({ children = 'Занять место в группе', red = true }: { children?: string; red?: boolean }) {
  return <a href={FORMS_URL} className={red ? 'v2-btn v2-btn--red' : 'v2-btn'}>{children}</a>
}

export default function V2Page() {
  return (
    <Typo>
      <div className="v2">
        <link rel="stylesheet" href={HEAD_FONT} precedence="default" />
        <header className="v2-top">
          <a href="/" className="v2-top__logo"><LogoSvg /></a>
          <nav className="v2-top__nav">
            <Cta>Хочу в группу</Cta>
            <MenuV2 />
          </nav>
        </header>

        <main>
          <section className="v2-hero">
            <div className="v2-wall" aria-hidden="true">
              {[0, 1, 2, 3].map((r) => (
                <p key={r} className={r % 2 ? 'v2-wall__row v2-wall__row--rev' : 'v2-wall__row'}>
                  {/* у каждой строки свои 8 мыслей, повтор дважды — для бесшовной прокрутки на −50% */}
                  {[...THOUGHTS.slice(r * 12, r * 12 + 8), ...THOUGHTS.slice(r * 12, r * 12 + 8)].map((w, k) => <span key={k}>{w}</span>)}
                </p>
              ))}
            </div>
            <div className="v2-wrap v2-hero__grid">
              <div>
                <p className="v2-sticker v2-sticker--tilt">Мужская терапевтическая группа онлайн</p>
                <h1 className="v2-h1"><span>Устал тащить</span> <span>всё на себе?</span></h1>
                <Thoughts />
                <p className="v2-hero__sub">
                  Работа, семья, деньги и вечное «надо больше», и всё это в одной голове. Собираем в группу мужчин, которые тащат так же, как и ты. Ведут психолог и психиатр.
                </p>
                <div className="v2-hero__actions">
                  <Cta />
                  <a href="#test" className="v2-btn">Пройти тест</a>
                </div>
                <ul className="v2-chips">
                  <li>{GROUP_MEETINGS} встреч по 3 часа</li>
                  <li>Старт {startPhrase()}</li>
                  <li>{PRICE_FROM} за встречу</li>
                  <li>{RECRUITMENT_NOTE}</li>
                </ul>
              </div>
              <div className="v2-hero__art" aria-hidden="true">
                <img className="v2-hero__drag" src="/v2/drag.webp" alt="" width={1100} height={455} fetchPriority="high" />
                {SPIKES.map(([w, x, y, big, rot]) => (
                  <span key={w} className={big ? 'v2-spike' : 'v2-spike v2-spike--small'} style={{ left: `${x}%`, top: `${y}%`, rotate: `${rot}deg` }}>{w}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="v2-section">
            <div className="v2-wrap">
              <h2 className="v2-h2">Мудрость, которую мы заслужили</h2>
              <ul className="v2-quotes">
                {QUOTES.map((q, i) => (
                  <li className="v2-quote" key={q} style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}>
                    <img className="v2-quote__face" src={`/v2/quote-${i + 1}.webp`} alt="" width={240} height={240} loading="lazy" />
                    <p>«{q}»</p>
                    <span>(с) Пацанская мудрость</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="v2-section v2-section--blue" id="signs">
            <div className="v2-wrap">
              <div className="v2-signs-grid">
              <Crushed />
              <div>
              <h2 className="v2-h2">Узнал себя?</h2>
              <ul className="v2-signs">
                {SIGNS.map((s) => (
                  <li key={s}>
                    <svg className="v2-signs__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M10.3 3.9 1.9 18.5A2 2 0 0 0 3.6 21.5h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="12" cy="17.4" r="1.25" fill="currentColor" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
              <p className="v2-conclusion">Хоть один пункт про тебя? Значит, тебе к нам.</p>
              <Cta />
              </div>
              </div>
            </div>
          </section>

          <KnockBand />

          <section className="v2-section">
            <div className="v2-wrap">
              <h2 className="v2-h2">Молчание лишь маскирует проблему. Вот статистика</h2>
              <ul className="v2-facts">
                {FACTS.map(([n, t, src]) => (
                  <li key={n}><b>{n}</b><p>{t}</p><small>{src}</small></li>
                ))}
              </ul>
            </div>
          </section>

          <section className="v2-section v2-section--yellow" id="test">
            <div className="v2-wrap">
              <h2 className="v2-h2">Волк, медведь или конь? Пройди тест</h2>
              <p className="v2-lead">Пять вопросов, минута. Ответы нигде не сохраняются.</p>
              <QuizV2 />
            </div>
          </section>

          <section className="v2-section v2-section--paper" id="offer">
            <div className="v2-wrap">
              <h2 className="v2-h2">Что будет на группе</h2>
              <div className="v2-offer">
                <ul className="v2-get">
                  {GET.map(([t, d]) => (
                    <li key={t}><h3>{t}</h3><p>{d}</p></li>
                  ))}
                </ul>
                <aside className="v2-price">
                  <p className="v2-price__start">Старт {startPhrase()}</p>
                  <p className="v2-price__amount">€{PRICE_PROGRAM}<span className="v2-price__tag">за {GROUP_MEETINGS} встреч</span></p>
                  <p className="v2-price__total">({PRICE_FROM} за встречу)</p>
                  <p className="v2-price__or">Не обязательно сразу. Можно в рассрочку:</p>
                  <div className="v2-price__plans">
                    <p className="v2-price__plan v2-price__plan--hot"><b>€{PRICE_SINGLE}</b><span>перед каждой встречей</span></p>
                    <p className="v2-price__plan"><b>€{PRICE_BLOCK}</b><span>за блок из {BLOCK_SIZE} встреч</span></p>
                  </div>
                  <Cta />
                  <p className="v2-price__hint">{MEETING_TIME}. Сначала бесплатный созвон, место твоё после первой оплаты.</p>
                </aside>
              </div>
            </div>
          </section>

          <Program />

          <HostsV2 />

          <section className="v2-section">
            <div className="v2-wrap">
              <h2 className="v2-h2">Как попасть</h2>
              <ol className="v2-steps">
                {STEPS.map(([t, d], i) => (
                  <li key={t}><span className="v2-steps__n">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
                ))}
              </ol>
            </div>
          </section>

          <section className="v2-section v2-section--paper" id="faq">
            <div className="v2-wrap v2-wrap--narrow">
              <h2 className="v2-h2">Нестыдные вопросы про группу</h2>
              <div className="v2-faq-main">
                <Faq items={FAQ.map(([q, a]) => ({ q, a }))} />
              </div>
            </div>
          </section>

          <section className="v2-final">
            <div className="v2-wrap">
              <img className="v2-final__face" src="/v2/thumbs.webp" alt="" width={700} height={882} />
              <h2 className="v2-h2">Хватит тащить в одиночку</h2>
              <p className="v2-lead">Старт {startPhrase()}, {RECRUITMENT_NOTE.toLowerCase()}. Созвон бесплатный.</p>
              <Cta />
            </div>
          </section>
        </main>

        <div className="v2-foot">
          <div className="v2-wrap">
            <p>
              Персонаж на картинках нарисован нами, он пародийный. Подписи на мемах — переделки известных интернет-мемов. С реальными людьми и правообладателями мы не связаны. Группа не заменяет лечение.
            </p>
            <p><a href="/privacy">Политика конфиденциальности</a></p>
          </div>
        </div>
        <SiteFooter />
      </div>
    </Typo>
  )
}
