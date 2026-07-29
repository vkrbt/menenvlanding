/**
 * Синхронный скрипт, проставляющий data-theme на <html> до первой отрисовки.
 * Без него на тёмной теме будет вспышка светлого фона.
 *
 * Рендерится первым элементом внутри <body>: в App Router собственный <head>
 * из layout не отдать, а здесь скрипт всё равно отрабатывает раньше,
 * чем браузер успевает нарисовать содержимое страницы.
 */
const THEME_INIT = `(function () {
  var STORAGE_KEY = 'sreda-theme';
  var stored = localStorage.getItem(STORAGE_KEY);
  var theme = stored === 'light' || stored === 'dark' ? stored : 'system';
  document.documentElement.setAttribute('data-theme', theme);
})();`

export default function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
}
