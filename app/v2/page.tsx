import type { Metadata, Viewport } from 'next'
import Crushed from '@/components/v2/Crushed'
import HostsV2 from '@/components/v2/HostsV2'
import LogoSvg from '@/components/v2/LogoSvg'
import QuizV2 from '@/components/v2/QuizV2'
import Thoughts from '@/components/v2/Thoughts'
import { THOUGHTS } from '@/components/v2/pov-thoughts'
import Typo from '@/components/Typo'
import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, MEETING_TIME, PRICE_BLOCK, PRICE_FROM, PRICE_PROGRAM, PRICE_SINGLE, BLOCK_SIZE, RECRUITMENT_NOTE, SITE_URL } from '@/lib/site'
import './v2.css'

/** Заголовки v2: Inter Tight — жирный и компактный; Oswald — надписи на деревянных табличках */
const HEAD_FONT = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800;900&family=Oswald:wght@400&display=swap'

/**
 * Версия лендинга для проверки гипотезы: оффер на самого человека, шуточный стиль,
 * тест прямо на странице. Закрыта от индексации: каноническая страница — главная.
 */
export const metadata: Metadata = {
  title: { absolute: 'Устал тащить всё на себе? Мужская группа — «Мужская среда»' },
  description: 'Терапевтическая группа для мужиков онлайн: 9 встреч в Zoom, психолог и психиатр. Первый созвон бесплатный.',
  alternates: { canonical: SITE_URL },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

const SIGNS = [
  'После работы сидишь в машине у дома. Домой не хочется',
  'Глушишь всё спортом, пивом или работой',
  'Всё бесит, все достали',
  'Не помнишь, когда последний раз говорил с кем-то по душам',
  'Работа и деньги больше не радуют',
  'На «как дела?» отвечаешь «нормально». Уже полгода',
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
  ['Место, где можно сказать вслух', 'Всё, что обычно глотаешь. Без «ты что, слабак» и без «просто возьми себя в руки».'],
  ['Мужики, которые не засмеются', 'Постоянный состав до 10 человек. Лица те же на каждой встрече, и уже со второй говорят по-настоящему.'],
  ['Ведущие психолог и психиатр-нарколог', 'Ведут каждую встречу и отвечают за всё, что в ней происходит.'],
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
          <a href="/" className="v2-top__logo"><LogoSvg /></a>
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
              <p className="v2-conclusion">Хоть один пункт про тебя? Не жди, пока всё развалится.</p>
              <Cta />
              </div>
              </div>
            </div>
          </section>

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
              <img className="v2-final__face" src="/v2/thumbs.webp" alt="" width={700} height={882} />
              <h2 className="v2-h2">Хватит тащить в одиночку</h2>
              <p className="v2-lead">Старт {startPhrase()}, {RECRUITMENT_NOTE.toLowerCase()}. Созвон бесплатный.</p>
              <Cta />
            </div>
          </section>
        </main>

        <footer className="v2-foot">
          <div className="v2-wrap">
            <p>
              Персонаж на картинках нарисован нами, он пародийный. Подписи на мемах — переделки известных интернет-мемов. С реальными людьми и правообладателями мы не связаны. Группа не заменяет лечение.
            </p>
            <p><a href="/">Основной сайт</a> · <a href="/privacy">Политика конфиденциальности</a></p>
          </div>
        </footer>
      </div>
    </Typo>
  )
}
