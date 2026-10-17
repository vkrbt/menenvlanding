import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { FORMS_URL, VLAD, YOUTUBE_LABEL, YOUTUBE_URL, ZHENYA, navLinks } from '@/lib/site'

/**
 * Подвал. Одинаковый на всех страницах: логотип слева, колонки ссылок справа.
 *
 * Якоря берутся в виде «/#program»: со всех страниц они ведут на главную,
 * а на самой главной браузер просто прокручивает к разделу без перезагрузки.
 *
 * Год приходит с сервера в <span id="footer-year"> — клиентский JS не нужен.
 */
export default function SiteFooter() {
  const links = navLinks(false)
  const group = links.filter((l) => l.href.startsWith('/#'))
  const read = links.filter((l) => !l.href.startsWith('/#'))

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo />
          <p className="footer__copy">
            © <span id="footer-year">{new Date().getFullYear()}</span> Мужская среда
          </p>
          <ThemeToggle />
        </div>

        <nav className="footer__cols" aria-label="Ссылки в подвале">
          <div className="footer__col">
            <p className="footer__head">Группа</p>
            <ul>
              {group.map((l) => (
                <li key={l.href}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__head">Читать</p>
            <ul>
              {read.map((l) => (
                <li key={l.href}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__head">Связаться</p>
            <ul>
              <li><a href={FORMS_URL}>Оставить заявку</a></li>
              <li>
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="footer__ext">
                  {YOUTUBE_LABEL}
                </a>
              </li>
              <li>
                <a href={VLAD.url} target="_blank" rel="noopener noreferrer" className="footer__ext">{VLAD.handle}</a>
              </li>
              <li>
                <a href={ZHENYA.url} target="_blank" rel="noopener noreferrer" className="footer__ext">{ZHENYA.handle}</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  )
}
