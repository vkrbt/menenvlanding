import type { Metadata } from 'next'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import Typo from '@/components/Typo'
import './reels-demo.css'

/**
 * Черновики рилсов для @sreda.men — посмотреть и обсудить с телефона.
 * Исходники и сборка роликов — в blog/reels/ основного репозитория; сюда кладутся
 * облегчённые копии 540×960 (public/reels-demo/<slug>.mp4 и постер <slug>.jpg).
 *
 * Как и /qr, от индексации закрыта в трёх местах: noindex ниже, Disallow
 * в app/robots.ts и заголовок X-Robots-Tag в vercel.json — он же закрывает
 * сами видео и постеры. В sitemap.ts страницы нет.
 */
export const metadata: Metadata = {
  title: 'Демки рилсов — служебная страница',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

type Reel = { slug: string; title: string; format: string; what: string }

const REELS: Reel[] = [
  {
    slug: 'samec-v-srede',
    title: 'Необъяснимо, но мужик. Выпуск 1: двадцать минут у подъезда',
    format: 'Мульт в стиле South Park',
    what: 'Пародия на «Необъяснимо, но факт»: ведущий в тренче и тёмных очках расследует, почему Андрей не выходит из машины. Свидетели — жена, соседка и кот. «Ты как? — Норм. — Сильное заявление». В конце ведущий снимает очки и оказывается психологом. Слово: «СРЕДА»',
  },
  {
    slug: 'tablica-chuvstva',
    title: 'Что делать мужчине со своими чувствами',
    format: 'Инструкция IKEA',
    what: 'Инструкция по сборке «KÄNSLA»: шаг за шагом ✕ как обычно делаем и ✓ как нужно. Финал: некоторые вещи в одиночку не собрать. Слово: «таблица»',
  },
  {
    slug: 'tablica-mama',
    title: 'Что мужчина выносит из отношений с мамой',
    format: 'Обновление прошивки',
    what: '«Мужчина 1.0» загружается, всплывают ошибки «Обнаружен баг, источник: мама», ставятся исправления 1/5…5/5, в конце — патчноуты «Мужчина 2.0». Ведёт на встречу «Мама». Слово: «мама»',
  },
  {
    slug: 'men-captialism',
    title: 'Ни за что не верь, что мужчины не плачут',
    format: 'Коллаж',
    what: 'Архивные фото, мем-карточки, штампы, счётчики 3% → 15% и −5 лет',
  },
  {
    slug: 'pochemu-mne-ploho',
    title: 'Мужинатор: почему тебе хреново',
    format: 'Пародия на Акинатора',
    what: 'Джинн задаёт вопросы, палец жмёт «Да», растёт шкала уверенности, в конце «угадывает»: ты ни с кем не говоришь о том, что внутри. Слово: «да»',
  },
  {
    slug: 'matematika-muzhikov',
    title: 'Математика мужиков',
    format: 'Spotify Wrapped',
    what: 'Итоги года: топ-траты на других, траты на себя — «НЕ КУПЛЕНО», карточка «на других 1085 €, на себя 0 €, топ-жанр «потом»». Башня трат рушится без «ТЫ». Слово: «себе»',
  },
  {
    slug: 'psih-zato',
    title: 'Логика настоящего мужика',
    format: '8-битная игра',
    what: 'Квест «сходить к психологу» — «Отклонить», достижения «Держу в себе» и «Спина деда», полоски здоровья тают, GAME OVER, в финале — режим кооператива. Слово: «норм»',
  },
  {
    slug: 'zrelye-muzhchiny',
    title: 'Разочарую вас в зрелых мужчинах',
    format: 'Срочные новости',
    what: 'Канал «МС 24»: «СРОЧНО», LIVE, плашки, телетекст и бегущая строка — а новости хорошие: идёт к врачу, просит помощи, может заплакать. Слово: «зрелый»',
  },
  {
    slug: 'napugat-30',
    title: 'Как напугать мужчину после 30',
    format: 'Трейлер хоррора на VHS',
    what: 'Карточки из темноты, тёмная гостиная, «знаешь, кого ты мне напоминаешь? — Своего папу», скример, зеркало, постер. Встреча «Папа». Слово: «папа»',
  },
  {
    slug: 'ne-hodyat-k-psihologu',
    title: 'Почему я не хожу к психологу',
    format: 'Кринж-презентация PowerPoint',
    what: 'WordArt, Comic Sans, переходы-звёздочки, диаграмма «минус отгул», пирог «сон: 4 ч». Финал: встречи в Zoom без отгулов. Слово: «понятно»',
  },
  {
    slug: 'ostanovi-video',
    title: 'Останови видео — узнаешь, чем глушишь стресс',
    format: 'Мелькание',
    what: 'Карточки по 3 кадра: телефон до 2 ночи, «одно» пиво, «я в норме»… Пересматривают и пишут, что выпало',
  },
  {
    slug: 'mankeeping',
    title: 'Почему жена — твой единственный психолог',
    format: 'Зин-коллаж',
    what: 'Растровые ретро-фото с рваными краями и скотчем, буквы из вырезок, список «напомнить ему», башня на одном человеке. Стэнфорд, 2024. Слово: «друг»',
  },
  {
    slug: 'lovushka-dostizheniya',
    title: 'Ловушка достижения',
    format: 'Неон и синтвейв',
    what: 'Пёс гонится за механическим зайцем по неоновой дорожке, вывески целей мигают и гаснут, «радость — на неделю». Слово: «заяц»',
  },
  {
    slug: 'vnezapnye-hobbi',
    title: 'Мужчина после 30 внезапно загорается хобби',
    format: 'Стикер-бомбинг',
    what: 'Покупки прыгают с ценниками и штампом «КУПЛЕНО», всё уезжает в гараж, чек за год 3450 €, ценники отклеиваются: скука, пустота, автопилот',
  },
  {
    slug: 'gus-vygoranie',
    title: 'Выгорание, объяснённое на гусе',
    format: 'Милый дудл',
    what: 'Гусь меняет настроение, предметы всплывают с маркерными стрелками и перечёркиваются, манометр «давление». Встреча «Дело и деньги». Слово: «гусь»',
  },
]

export default function ReelsDemoPage() {
  return (
    <>
      <SiteHeader />

      <section className="section reels-demo">
        <div className="container">
          <Typo>
            <h1 className="section-title">Демки рилсов</h1>
            <p className="reels-demo__lead">
              Черновики роликов для @sreda.men. Голос пока синтезированный — в финале его заменит живая запись
            </p>
          </Typo>

          <ol className="reels-demo__grid">
            {REELS.map((r, i) => (
              <li key={r.slug} className="reels-demo__card">
                <video
                  className="reels-demo__video"
                  src={`/reels-demo/${r.slug}.mp4`}
                  poster={`/reels-demo/${r.slug}.jpg`}
                  controls
                  playsInline
                  preload="none"
                />
                <Typo>
                  <div className="reels-demo__head">
                    <span className="reels-demo__num">{i + 1}</span>
                    <span className="reels-demo__tag">{r.format}</span>
                  </div>
                  <h2 className="reels-demo__title">{r.title}</h2>
                  <p className="reels-demo__what">{r.what}</p>
                </Typo>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
