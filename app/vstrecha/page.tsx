import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { meetingGraph } from '@/lib/jsonld'
import { FORMS_URL, MEETING_URL, SITE_URL, OG_IMAGE, VLAD, ZHENYA } from '@/lib/site'

const CANONICAL = `${SITE_URL}${MEETING_URL}`

export const metadata: Metadata = {
  title: 'Как проходит встреча «Мужской среды»: формат, правила, цена',
  description:
    'Что происходит на встрече мужского сообщества: тема, разговор, правила круга и конфиденциальность. Сколько говорить — решаешь сам. Цены и как попасть.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Как проходит встреча «Мужской среды»',
    description:
      'Неизвестность — главная причина не прийти. Здесь подробно: что происходит на встрече, какие правила и сколько это стоит.',
    type: 'website',
    url: CANONICAL,
    images: [OG_IMAGE],
    locale: 'ru_RU',
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
}

/** Правила круга. Все до одного взяты с лендинга — ничего не додумано */
const RULES = [
  {
    title: 'Что было на встрече — остаётся на встрече',
    body: 'Правило конфиденциальности действует для всех без исключений. Оно и есть то, на чём держится готовность говорить откровенно.',
  },
  {
    title: 'Сколько говорить — решаешь ты',
    body: 'Уровень самораскрытия выбираешь сам. Говорить о чувствах не обязательно: достаточно говорить о том, что происходит. Половина участников на первой встрече говорит, что не умеет — это нормально и ожидаемо.',
  },
  {
    title: 'Камера включена',
    body: 'Это единственное жёсткое требование к формату. Разговор лицом к лицу — другой уровень контакта, чем голос из чёрного квадрата.',
  },
  {
    title: 'Диагноз не нужен',
    body: 'Сюда приходят не потому, что «всё плохо». У большинства участников «вроде всё ок» — они просто заметили, что «ок» и «хорошо» это разные вещи.',
  },
  {
    title: 'Присоединиться можно в любое время',
    body: 'Сообщество открытое: ждать нового набора или начала «сезона» не нужно.',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Тема объявляется заранее',
    body: 'Работа и отношения, отцы и сыновья, одиночество в эмиграции, деньги, злость, дружба. Ты приходишь, уже зная, о чём будет разговор, и можешь заранее решить, насколько тебе это близко.',
  },
  {
    n: 2,
    title: 'Разговор',
    body: 'Ведут двое: гештальт-терапевт и психиатр. Это не приём и не терапия — ведущие держат рамку и следят, чтобы разговор не сваливался в советы и оценки.',
  },
  {
    n: 3,
    title: 'Обмен',
    body: 'Важнее быть честным, чем красноречивым. Самое интересное начинается, когда кто-то говорит о себе, а другой понимает: «Блин, у меня же то же самое».',
  },
]

const PRICES = [
  { title: 'За каждую встречу', price: '€25', note: 'Разовое участие, без обязательств' },
  { title: 'Минимальное членство', price: '€20', note: 'За встречу при участии 2 раза в месяц' },
  { title: 'Три месяца', price: '€18', note: 'За встречу при 6 встречах — €108 целиком' },
]

export default function MeetingPage() {
  return (
    <>
      <JsonLd data={meetingGraph()} />

      <SiteHeader />

      <main>
        <section className="blog-hero">
          <div className="container">
            <nav className="blog-crumbs" aria-label="Хлебные крошки">
              <a href="/">Главная</a>
              <span aria-hidden="true"> · </span>
              <span>Как проходит встреча</span>
            </nav>
            <h1 className="blog-hero__title">Как проходит встреча</h1>
            <p className="blog-hero__sub">
              Неизвестность — главная причина не прийти. Поэтому здесь подробно: что происходит
              на встрече «Мужской среды», какие действуют правила, сколько это стоит и что
              будет, если ты просто просидишь молча.
            </p>
          </div>
        </section>

        <section className="container meeting-section">
          <h2 className="meeting-section__title">Коротко о формате</h2>
          <ul className="meeting-facts">
            <li><strong>Раз в две недели, по средам</strong> — 18:00 по Варшаве, 19:00 по Минску</li>
            <li>Длительность — <strong>три часа</strong>, в Zoom</li>
            <li><strong>Мужчины 25+</strong>, состав постоянный</li>
            <li>Ведут <strong>двое</strong>: {VLAD.name} — {VLAD.jobTitle.toLowerCase()}, {ZHENYA.name} — {ZHENYA.jobTitle.toLowerCase()}</li>
            <li>Начинается с <strong>короткого созвона-знакомства</strong> — до первой встречи</li>
            <li>Сообщество <strong>русскоязычное</strong>: без страховок, направлений и языкового барьера</li>
            <li>Тема каждой встречи известна заранее</li>
          </ul>
        </section>

        <section className="container meeting-section">
          <h2 className="meeting-section__title">Что происходит на встрече</h2>
          <ol className="meeting-steps">
            {STEPS.map((s) => (
              <li className="meeting-steps__item" key={s.n}>
                <span className="meeting-steps__num" aria-hidden="true">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="container meeting-section">
          <h2 className="meeting-section__title">Правила круга</h2>
          <div className="meeting-rules">
            {RULES.map((r) => (
              <div className="meeting-rules__card" key={r.title}>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container meeting-section">
          <h2 className="meeting-section__title">Кому это подходит, а кому нет</h2>
          <p className="meeting-text">
            Подходит, если тебе не с кем поговорить о том, что происходит на самом деле, —
            при том что внешне всё в порядке. Если хочется слышать других мужчин, а не советы.
            Если готов появляться регулярно: группа держится на людях, которые приходят.
          </p>
          <p className="meeting-text">
            Не подходит, если ищешь индивидуальную работу с конкретным запросом — для этого
            есть личная терапия, и сообщество её не заменяет. Не подходит, если нужна помощь
            прямо сейчас, в остром состоянии: встречи раз в две недели для этого не годятся,
            в такой ситуации стоит обратиться к врачу или психотерапевту.
          </p>
          <p className="meeting-note">
            «Мужская среда» — сообщество, а не медицинская услуга и не групповая терапия.
            Ведущие по профессии терапевт и психиатр, но встреча не является ни приёмом,
            ни лечением и не заменяет работу со специалистом.
          </p>
        </section>

        <section className="container meeting-section">
          <h2 className="meeting-section__title">Сколько стоит</h2>
          <div className="meeting-prices">
            {PRICES.map((p) => (
              <div className="meeting-prices__card" key={p.title}>
                <span className="meeting-prices__value">{p.price}</span>
                <span className="meeting-prices__title">{p.title}</span>
                <span className="meeting-prices__note">{p.note}</span>
              </div>
            ))}
          </div>
          <p className="meeting-text">
            Если записался и не пришёл — встреча считается оплаченной: это позволяет держать
            состав стабильным. Знаешь заранее, что не сможешь, — просто напиши до встречи.
          </p>
        </section>

        <section className="container meeting-section">
          <h2 className="meeting-section__title">Как попасть</h2>
          <p className="meeting-text">
            Оставь заявку — мы вернёмся с датой ближайшей встречи и темой. Заявка ни к чему
            не обязывает: можно прийти один раз и решить, что это не твоё.
          </p>
          <div className="article__cta">
            <h3>Первый шаг — самый трудный</h3>
            <p>
              Дальше проще: на встрече не нужно ничего объяснять с нуля — остальные пришли
              примерно с тем же.
            </p>
            <a href={FORMS_URL} className="btn btn--primary">Оставить заявку</a>
            <p className="article__cta-hint">Заполнить — минута. Ответим и расскажем детали</p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
