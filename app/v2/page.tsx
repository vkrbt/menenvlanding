import type { Metadata, Viewport } from 'next'
import Crushed from '@/components/v2/Crushed'
import QuizV2 from '@/components/v2/QuizV2'
import Typo from '@/components/Typo'
import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, GROUP_SEATS, MEETING_TIME, PRICE_BLOCK, PRICE_FROM, PRICE_PROGRAM, PRICE_SINGLE, BLOCK_SIZE, RECRUITMENT_NOTE, SITE_URL } from '@/lib/site'
import './v2.css'

/** Заголовки v2: Inter Tight — жирный и компактный, Dela Gothic One в блоках не помещалась */
const HEAD_FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800;900&display=swap'

/**
 * Версия лендинга для проверки гипотезы: оффер на самого человека, шуточный стиль,
 * тест прямо на странице. Закрыта от индексации: каноническая страница — главная.
 */
export const metadata: Metadata = {
  title: { absolute: 'Стетем зовёт тебя в мужскую группу — «Мужская среда»' },
  description: 'Терапевтическая группа для мужиков онлайн: 9 встреч в Zoom, психолог и психиатр. Первый созвон бесплатный.',
  alternates: { canonical: SITE_URL },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

const QUOTES: Array<{ t: string; mood: string }> = [
  { t: 'Утром йога — вечером «Мужская Среда»', mood: 'nod' },
  { t: 'Волк слабее льва и тигра, но он ходит в стае. Хватит быть одиноким волком', mood: 'stare' },
  { t: 'Не важно, в какой ты жопе. Важно, чтобы было с кем об этом поговорить', mood: 'sigh' },
  { t: 'Настоящий мужик всегда стирает носки и сообщения. Но иногда пишет: «Мне хреново»', mood: 'grin' },
  { t: 'Утром деньги — вечером терапия', mood: 'nod' },
  { t: 'Буйвол внутри меня просыпается, когда ты на «Мужскую Среду» не собираешься', mood: 'stare' },
]

const SIGNS = [
  'Тебя всю жизнь спрашивают: «Почему не женат? Почему без машины? Когда дети?» А чего хочешь ты, не спрашивает никто',
  'Другу пишешь «ты где пропал, козёл?», а имеешь в виду «я соскучился»',
  'На «как дела?» отвечаешь «нормально». Уже полгода',
  'Тащишь работу, семью и ипотеку, устал, а сказать некому',
  'Срываешься на близких и потом три дня себя за это жрёшь',
  'С мужиками говоришь про работу, тачки и футбол. Про остальное нет',
]

const WALL = ['Должен быть сильным', 'Не ной', 'Молчи и терпи', 'Заплакал — не мужик', 'Решай всё сам', 'Тащи семью', 'Не жалуйся', 'Будь мужиком']

const GET = [
  ['Место, где можно сказать вслух', 'Всё, что обычно глотаешь. Без «ты что, слабак» и без «просто возьми себя в руки».'],
  ['Мужики, которые не засмеются', 'Постоянный состав до 10 человек. Лица те же на каждой встрече, и уже со второй говорят по-настоящему.'],
  ['Двое взрослых за рулём', 'Психолог и психиатр-нарколог ведут встречу и отвечают за всё, что в ней происходит.'],
  ['Девять тем по порядку', 'Дело и деньги, отношения, зависимости, злость, детство, мама, папа. Идём от лёгкого к трудному.'],
]

const STEPS = [
  ['Оставляешь заявку', 'Две минуты: имя, возраст, Telegram. Анкету видят только ведущие.'],
  ['Созваниваемся на 10–15 минут', 'Бесплатно. Познакомимся, ответим на вопросы. Если не твоё, просто скажешь.'],
  [`Первая встреча ${startPhrase()}`, 'Zoom, три часа, камера включена. Дальше раз в две недели по средам.'],
]

const FAQ = [
  ['Я не умею говорить о чувствах', 'Половина группы скажет то же самое на первой встрече. Говорить «о чувствах» не обязательно, достаточно говорить о том, что происходит. Остальное подтянется.'],
  ['Это для тех, у кого проблемы? У меня вроде всё ок', 'У большинства участников тоже «вроде всё ок». Просто они заметили, что «ок» и «хорошо» разные вещи. Диагноз не нужен, нужен интерес.'],
  ['Это терапия или просто разговоры?', 'Терапия. Один состав, общие правила, двое ведущих. Но это не лечение: диагнозов не ставим, лекарства не назначаем. Если поймём, что тебе сейчас нужнее врач, скажем прямо.'],
  ['А вдруг там мой знакомый?', 'Значит, вы оба нормальные мужики, которые решили попробовать. А что было на встрече, остаётся на встрече: у группы есть правило конфиденциальности.'],
  ['Камеру надо включать?', 'Да, на все три часа, кроме перерывов. Разговор лицом к лицу работает иначе. Подключайся с компьютера, в наушниках, из тихого места.'],
  ['Можно прийти не с первой встречи?', 'Нет. Темы идут по порядку, и разговор получается, когда приходят одни и те же люди. Состав набираем до старта.'],
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
          <a href="/" className="v2-top__logo" aria-label="Мужская среда">МУЖСКАЯ СРЕДА</a>
          <nav className="v2-top__nav">
            <a href="#test" className="v2-top__test">Пройти тест</a>
            <Cta>Хочу в группу</Cta>
          </nav>
        </header>

        <main>
          <section className="v2-hero">
            <div className="v2-wall" aria-hidden="true">
              {[0, 1, 2, 3].map((r) => (
                <p key={r} className={r % 2 ? 'v2-wall__row v2-wall__row--rev' : 'v2-wall__row'}>
                  {[...WALL.slice(r), ...WALL.slice(0, r), ...WALL.slice(r), ...WALL.slice(0, r)].map((w, k) => <span key={k}>{w}</span>)}
                </p>
              ))}
            </div>
            <div className="v2-wrap v2-hero__grid">
              <div>
                <p className="v2-sticker v2-sticker--tilt">Мужская терапевтическая группа онлайн</p>
                <h1 className="v2-h1">Стетем зовёт тебя на мужскую группу</h1>
                <p className="v2-hero__sub">
                  Ты тащишь работу, семью и «нормально». Хватит молча. Девять встреч в Zoom, до {GROUP_SEATS} мужиков, психолог и психиатр. Говорим о том, о чём обычно молчат.
                </p>
                <div className="v2-hero__actions">
                  <Cta />
                  <a href="#test" className="v2-btn">Пройти тест: тебе сюда?</a>
                </div>
                <ul className="v2-chips">
                  <li>{GROUP_MEETINGS} встреч по 3 часа</li>
                  <li>Старт {startPhrase()}</li>
                  <li>{PRICE_FROM} за встречу</li>
                  <li>{RECRUITMENT_NOTE}</li>
                </ul>
              </div>
              <div className="v2-hero__art" aria-hidden="true">
                <img className="v2-hero__man" src="/v2/push.webp" alt="" width={900} height={786} fetchPriority="high" />
                <span className="v2-stone v2-hero__stone">Должен</span>
              </div>
            </div>
          </section>

          <section className="v2-section">
            <div className="v2-wrap">
              <h2 className="v2-h2">Стетем говорит</h2>
              <p className="v2-lead">Известные цитаты, переписанные под нас.</p>
              <ul className="v2-quotes">
                {QUOTES.map((q, i) => (
                  <li className="v2-quote" key={q.t} style={{ ['--tilt' as string]: `${i % 2 ? 1.2 : -1.2}deg` }}>
                    <img className="v2-quote__face" src="/v2/bust.webp" alt="" width={700} height={1114} loading="lazy" />
                    <p>«{q.t}»</p>
                    <span>(с) Джейсон Стетем</span>
                    
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="v2-section v2-section--blue">
            <div className="v2-wrap">
              <div className="v2-signs-grid">
              <Crushed />
              <div>
              <h2 className="v2-h2">Узнал себя?</h2>
              <ul className="v2-signs">
                {SIGNS.map((s) => (
                  <li key={s}><span aria-hidden="true">⚠</span>{s}</li>
                ))}
              </ul>
              <p className="v2-conclusion">Хоть один пункт про тебя? Значит, ты по адресу.</p>
              <Cta />
              </div>
              </div>
            </div>
          </section>

          <section className="v2-section">
            <div className="v2-wrap">
              <h2 className="v2-h2">Так было не всегда</h2>
              <ul className="v2-facts">
                <li><b>5 000 фото</b><p>Историк Джон Ибсон собрал больше пяти тысяч старых снимков, где мужики сидят друг у друга на коленях и держатся за руки. Современные фотостудии в ответ: двое мужчин на общее фото к нам не приходят.</p></li>
                <li><b>3% → 15%</b><p>Столько мужчин в США не имели ни одного близкого друга в 1990 и в 2021 году. Сейчас это каждый седьмой.</p></li>
                <li><b>−5 лет</b><p>На столько в среднем мужчины живут меньше женщин (данные ВОЗ). Идут к врачам реже и терпят до последнего.</p></li>
              </ul>
              <p className="v2-conclusion">«Молчи и терпи» дорого обходится. Группа нужна, чтобы это прекратить.</p>
            </div>
          </section>

          <section className="v2-section v2-section--paper">
            <div className="v2-wrap">
              <h2 className="v2-h2">Что ты получаешь</h2>
              <div className="v2-offer">
                <ul className="v2-get">
                  {GET.map(([t, d]) => (
                    <li key={t}><h3>{t}</h3><p>{d}</p></li>
                  ))}
                </ul>
                <aside className="v2-price">
                  <p className="v2-price__start">Старт {startPhrase()}</p>
                  <p className="v2-price__amount">{PRICE_FROM}</p>
                  <p className="v2-price__per">за встречу</p>
                  <p className="v2-price__note">€{PRICE_PROGRAM} за все {GROUP_MEETINGS} встреч сразу. Можно блоками по {BLOCK_SIZE} (€{PRICE_BLOCK}) или по €{PRICE_SINGLE} за каждую.</p>
                  <Cta />
                  <p className="v2-price__hint">{MEETING_TIME}. Сначала бесплатный созвон, место твоё после первой оплаты.</p>
                </aside>
              </div>
            </div>
          </section>

          <section className="v2-section v2-section--yellow" id="test">
            <div className="v2-wrap">
              <h2 className="v2-h2">Тебе в группу? Пройди тест</h2>
              <p className="v2-lead">Пять вопросов, минута. Ответы нигде не сохраняются.</p>
              <QuizV2 />
            </div>
          </section>

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

          <section className="v2-section v2-section--paper">
            <div className="v2-wrap v2-wrap--narrow">
              <h2 className="v2-h2">Нестыдные вопросы</h2>
              <div className="v2-faq">
                {FAQ.map(([q, a]) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="v2-final">
            <div className="v2-wrap">
              <img className="v2-final__face" src="/v2/thumbs.webp" alt="Стетем показывает большой палец" width={700} height={882} />
              <h2 className="v2-h2">Стетем ждёт. Он не любит ждать</h2>
              <p className="v2-lead">Старт {startPhrase()}, {RECRUITMENT_NOTE.toLowerCase()}. Созвон бесплатный.</p>
              <Cta />
            </div>
          </section>
        </main>

        <footer className="v2-foot">
          <div className="v2-wrap">
            <p>
              Стетем здесь пародийный персонаж, нарисованный нами. Цитаты — переделки известных интернет-мемов, а не слова реального актёра. С ним и его правообладателями мы не связаны, рекламу он не делает. Группа не заменяет лечение.
            </p>
            <p><a href="/">Основной сайт</a> · <a href="/privacy">Политика конфиденциальности</a></p>
          </div>
        </footer>
      </div>
    </Typo>
  )
}
