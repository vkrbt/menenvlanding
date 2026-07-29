/**
 * Подключение шрифтов через Google Fonts.
 *
 * Manrope запрашивается как обычно: это основной текст, он должен покрывать
 * любой контент, а браузер и так скачает только нужные подмножества
 * по unicode-range (~700 байт CSS).
 *
 * Dela Gothic One — японская гарнитура, и Google отдаёт для неё 129 блоков
 * @font-face (≈30 КБ сжатого блокирующего CSS) ради CJK-чанков, которые сайту
 * не нужны никогда. Параметр &subset= в css2-API не работает — проверено,
 * ответ побайтно тот же. Поэтому для неё запрашивается точный набор глифов
 * через &text=: получается один @font-face и подрезанный файл шрифта.
 *
 * Этим шрифтом набраны только логотип, имена ведущих, кавычка-акцент,
 * заголовок блога, заголовки статей и номера книг — то есть буквы, цифры
 * и пунктуация. Набор ниже покрывает их с запасом; актуальность проверяет
 * scripts/verify-fonts.py.
 */

const RU = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
const LAT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const PUNCT = ' .,:;!?()[]/%+&@#*-—–«»“”‘’…№"\''

/** Полный набор символов, которые может понадобиться нарисовать Dela Gothic One */
export const DELA_CHARSET = [
  ...new Set(RU + RU.toLowerCase() + LAT + LAT.toLowerCase() + DIGITS + PUNCT),
]
  .sort()
  .join('')

export const MANROPE_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap'

export const DELA_HREF =
  'https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap' +
  `&text=${encodeURIComponent(DELA_CHARSET)}`
