import type { Metadata } from 'next'
import { YoutubeOpen, YoutubeTool } from '@/components/YoutubeTool'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
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
 * и генератор не мелькает.
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
            <h1 className="section-title">Открываем YouTube…</h1>
            <YoutubeOpen />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
