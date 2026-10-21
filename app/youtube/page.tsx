import type { Metadata } from 'next'
import { YoutubeOpen, YoutubeTool } from '@/components/YoutubeTool'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { startPhrase } from '@/lib/group'
import { FORMS_URL, GROUP_MEETINGS, GROUP_PITCH, GROUP_SEATS, PRICE_FROM, RECRUITMENT_NOTE } from '@/lib/site'
import { typo } from '@/lib/typo'
import { OPEN_YOUTUBE_SCRIPT } from '@/lib/youtube-link'
import '../qr/qr.css'
import './youtube.css'

/**
 * Ссылки на YouTube, которые из Instagram и других соцсетей открываются в приложении,
 * а не во встроенном браузере. Одна статичная страница на два режима:
 * - /youtube — генератор ссылок;
 * - /youtube/<путь YouTube> — переход. Все такие адреса vercel.json переписывает сюда,
 *   встроенный скрипт читает location, ставит data-yt-open на <html> и открывает приложение.
 * Режим переключает CSS по data-yt-open: скрипт успевает до первой отрисовки,
 * и генератор не мелькает. Под кнопками перехода — коротко о группе: вкладка остаётся
 * открытой, и человек видит её, когда возвращается из YouTube.
 *
 * От индексации закрыта так же, как /qr: noindex здесь, Disallow в app/robots.ts,
 * X-Robots-Tag в vercel.json. В sitemap.ts её нет.
 */
export const metadata: Metadata = {
  title: 'Открыть в YouTube',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function YoutubePage() {
  const facts = [
    `Старт ${startPhrase()}`,
    `${GROUP_MEETINGS} встреч по 3 часа`,
    `До ${GROUP_SEATS} человек`,
    `От ${PRICE_FROM} за встречу`,
  ]

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: OPEN_YOUTUBE_SCRIPT }} />
      <SiteHeader />

      <section className="section qr-page">
        <div className="container">
          <div className="ytl-tool">
            <h1 className="section-title">Ссылка на YouTube для соцсетей</h1>
            <p className="qr-page__lead">
              Вставь ссылку на видео, шортс или канал — получишь ссылку, которая из Instagram
              и других соцсетей открывается сразу в приложении YouTube.
            </p>
            <YoutubeTool />
          </div>

          <div className="ytl-opening">
            <h1 className="section-title ytl-opening__title">Открываем YouTube…</h1>
            <YoutubeOpen />

            <aside className="ytl-about">
              <p className="ytl-about__eyebrow">{typo('Ты на сайте «Мужской среды»')}</p>
              <h2 className="ytl-about__title">{typo('Друзья есть. А поговорить не с кем')}</h2>
              <p className="ytl-about__text">{typo(GROUP_PITCH[0])}</p>
              <div className="qr__actions">
                <a href={FORMS_URL} className="btn btn--primary btn--lg">{typo('Занять место в группе')}</a>
                <a href="/" className="btn btn--outline btn--lg">{typo('Подробнее о группе')}</a>
              </div>
              {/* Темы и факты под кнопкой: на телефоне кнопка должна попасть в первый экран */}
              <p className="ytl-about__text">{typo(GROUP_PITCH[1])}</p>
              <ul className="hero__facts ytl-about__facts">
                {facts.map((f) => <li key={f}>{typo(f)}</li>)}
              </ul>
              <p className="ytl-about__note">
                {typo([RECRUITMENT_NOTE, 'Сначала бесплатный созвон на 10–15 минут'].filter(Boolean).join(' · '))}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
