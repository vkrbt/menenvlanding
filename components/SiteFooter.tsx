import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { YOUTUBE_LABEL, YOUTUBE_URL } from '@/lib/site'

/**
 * Подвал. Идентичен на всех страницах — в исходнике различались только
 * переносы строк внутри тега <a>.
 *
 * Год раньше подставлялся скриптом в пустой <span id="footer-year">;
 * теперь приходит с сервера — итоговый DOM тот же, минус клиентский JS.
 */
export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />

        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="footer__yt"
          aria-label="YouTube канал"
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="22" height="16" rx="4" fill="#FF0000" />
            <path d="M9 5l6 3-6 3V5z" fill="white" />
          </svg>
          {YOUTUBE_LABEL}
        </a>

        <p className="footer__copy">
          © <span id="footer-year">{new Date().getFullYear()}</span> Мужская среда
        </p>

        <ThemeToggle />
      </div>
    </footer>
  )
}
