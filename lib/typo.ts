import Typograf from 'typograf'

/**
 * Типограф для текстов сайта (библиотека Typograf): неразрывные пробелы после предлогов
 * и союзов, перед тире и частицами, между числом и словом, «ёлочки», правильные тире.
 * Вызывается в серверных компонентах, то есть при сборке. В браузер библиотека попадает
 * только на страницах тестов — там тексты вопросов и результатов рисует клиент
 */
const tp = new Typograf({ locale: ['ru', 'en-US'] })
tp.enableRule('common/nbsp/afterNumber')
// Свои неразрывные пробелы в строках (например, во времени встреч) не трогаем
tp.disableRule('common/nbsp/replaceNbsp')

/** Диапазон держим со следующим словом: «10–15 минут». Typograf этого не делает */
const RANGE = /(\d+–\d+) /g

export function typo(text: string): string {
  return tp.execute(text).replace(RANGE, '$1 ')
}

/**
 * Кусок текста между JSX-выражениями («{a} и {b}»): Typograf обрезает пробелы по краям
 * строки, а на стыке с соседним узлом они нужны — типографим середину, края возвращаем
 */
export function typoFragment(text: string): string {
  const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!m || !m[2]) return text
  return m[1] + typo(m[2]) + m[3]
}
