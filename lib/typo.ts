import Typograf from 'typograf'

/**
 * Типограф для текстов сайта: неразрывные пробелы после предлогов и союзов,
 * перед тире и между числом и словом, «ёлочки», правильные тире.
 * Вызывается в серверных компонентах, то есть при сборке: в бандл не попадает
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
