import type { Metadata } from 'next'
import QrTool from '@/components/QrTool'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import './qr.css'

/**
 * Внутренний инструмент: QR-код на любую ссылку сайта с UTM-метками.
 * Всё считается в браузере — при output: 'export' сервера нет, да и ссылки
 * кампаний незачем куда-то отправлять.
 *
 * Страница служебная и от индексации закрыта в трёх местах, потому что каждое
 * перекрывает свою дыру: noindex ниже — для роботов, которые пришли по прямой
 * ссылке; Disallow в app/robots.ts — чтобы её вообще не обходили; заголовок
 * X-Robots-Tag в vercel.json — на случай, если до HTML дело не дойдёт.
 * В sitemap.ts её нет: там список маршрутов задан явно.
 */
export const metadata: Metadata = {
  title: 'QR-код с UTM — служебная страница',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function QrPage() {
  return (
    <>
      <SiteHeader />

      <section className="section qr-page">
        <div className="container">
          <h1 className="section-title">QR-код со ссылкой</h1>
          <p className="qr-page__lead">
            Ссылка, метки — и код готов. Считается прямо в браузере, ничего никуда не уходит.
          </p>
          <QrTool />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
