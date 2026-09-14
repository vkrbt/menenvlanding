import QRCode, { type QRCodeErrorCorrectionLevel } from 'qrcode'
import { LOGO_FONT_WOFF2_BASE64 } from './qr-logo-font'

/**
 * Свой рендер QR в SVG. Библиотечный `toString` отдаёт все модули одним path,
 * из которого угловые маркеры не выделить, — а их нужно скруглить отдельно.
 * Поэтому берём у библиотеки только матрицу и рисуем сами.
 */

/** Ширина угловой метки в модулях — величина из спецификации QR, не настройка. */
const FINDER = 7

/** Скругление метки в долях её ширины. Держим небольшим: сканеры ищут квадрат. */
const FINDER_RADIUS = 0.22

/** Поле вокруг кода (quiet zone). Меньше 4 модулей стандарт не рекомендует, но 2 читается. */
const MARGIN = 2

/**
 * Метрики «МС» в долях кегля — сняты с Dela Gothic One через canvas measureText.
 * По ним подбирается кегль: буквы рисуются в своих пропорциях, а не растягиваются
 * под коробку, иначе знак перестаёт быть собой.
 */
const MARK_TEXT_WIDTH = 1.956 // видимая ширина «МС»
const MARK_CAP_HEIGHT = 0.747 // высота прописной от базовой линии

/** Круг знака: диаметр в модулях, белый ободок и доля диаметра под ширину букв. */
const MARK_DIAMETER = 8.6
const MARK_RING = 0.55
const MARK_TEXT_RATIO = 0.79

export type QrOptions = {
  level: QRCodeErrorCorrectionLevel
  /** Размер стороны в пикселях для атрибутов width/height. Без него — только viewBox. */
  px?: number
  /** Врисовать логотип «Мужская среда» в центр кода. */
  logo?: boolean
}

/**
 * Знак «МС» в центре: фирменный круг с белыми буквами, вокруг белый ободок,
 * чтобы он не слипался с модулями.
 *
 * Перекрытые модули восстанавливает коррекция ошибок, поэтому со знаком нужен
 * уровень H: круг диаметром 8.6 модуля — это ~5% площади кода при запасе 30%.
 * Базовая линия опущена на половину высоты прописной, так буквы встают по
 * оптическому центру круга, а не по своей базовой линии.
 */
function logoMark(size: number): string {
  const center = size / 2 + MARGIN
  const radius = MARK_DIAMETER / 2
  const fontSize = (MARK_TEXT_RATIO * MARK_DIAMETER) / MARK_TEXT_WIDTH

  return (
    `<defs><style>@font-face{font-family:'QrLogo';font-style:normal;font-weight:400;` +
    `src:url(data:font/woff2;charset=utf-8;base64,${LOGO_FONT_WOFF2_BASE64}) format('woff2')}</style></defs>` +
    `<circle cx="${center}" cy="${center}" r="${radius + MARK_RING}" fill="#ffffff"/>` +
    `<circle cx="${center}" cy="${center}" r="${radius}" fill="#000DC3"/>` +
    `<text x="${center}" y="${(center + (MARK_CAP_HEIGHT * fontSize) / 2).toFixed(3)}" ` +
    `font-family="QrLogo" font-size="${fontSize.toFixed(3)}" text-anchor="middle" fill="#ffffff">МС</text>`
  )
}

/** Левые верхние углы трёх угловых меток. */
function finderOrigins(size: number): [number, number][] {
  return [
    [0, 0],
    [size - FINDER, 0],
    [0, size - FINDER],
  ]
}

/** Попадает ли модуль в область угловой метки — такие мы рисуем отдельно. */
function inFinder(size: number, row: number, col: number): boolean {
  return finderOrigins(size).some(([x, y]) => col >= x && col < x + FINDER && row >= y && row < y + FINDER)
}

/** Тёмные модули данных — одним path: так файл в разы меньше, чем из сотен <rect>. */
function dataPath(matrix: { size: number; data: Uint8Array }): string {
  const parts: string[] = []
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.data[row * matrix.size + col]) continue
      if (inFinder(matrix.size, row, col)) continue
      parts.push(`M${col + MARGIN} ${row + MARGIN}h1v1h-1z`)
    }
  }
  return parts.join('')
}

/**
 * Угловая метка: скруглённая рамка толщиной в модуль и скруглённый глаз 3×3.
 * Рамку рисуем обводкой, поэтому прямоугольник смещён на полмодуля — иначе
 * линия ляжет серединой на границу и метка вырастет на модуль.
 */
function finderMarks(size: number): string {
  return finderOrigins(size)
    .map(([x, y]) => {
      const left = x + MARGIN
      const top = y + MARGIN
      const outerR = (FINDER * FINDER_RADIUS).toFixed(2)
      const innerR = (3 * FINDER_RADIUS).toFixed(2)
      return (
        `<rect x="${left + 0.5}" y="${top + 0.5}" width="${FINDER - 1}" height="${FINDER - 1}" ` +
        `rx="${outerR}" ry="${outerR}" fill="none" stroke="#000000" stroke-width="1"/>` +
        `<rect x="${left + 2}" y="${top + 2}" width="3" height="3" ` +
        `rx="${innerR}" ry="${innerR}" fill="#000000"/>`
      )
    })
    .join('')
}

/**
 * SVG с кодом: белая подложка обязательна — сканер ждёт тёмное на светлом,
 * а файл могут положить на любой фон.
 */
export function qrToSvg(text: string, { level, px, logo }: QrOptions): string {
  const matrix = QRCode.create(text, { errorCorrectionLevel: level }).modules
  const side = matrix.size + MARGIN * 2
  const dimensions = px ? ` width="${px}" height="${px}"` : ''

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}"${dimensions}>` +
    `<rect width="${side}" height="${side}" fill="#ffffff"/>` +
    // Модули данных — строго по пиксельной сетке, иначе на мелком размере поползут края
    `<path d="${dataPath(matrix)}" fill="#000000" shape-rendering="crispEdges"/>` +
    finderMarks(matrix.size) +
    (logo ? logoMark(matrix.size) : '') +
    `</svg>`
  )
}

/** Растр из того же SVG — чтобы PNG и вектор были одной картинкой, а не двумя похожими. */
export async function qrToPngBlob(text: string, { level, px = 1024, logo }: QrOptions): Promise<Blob> {
  const svg = qrToSvg(text, { level, px, logo })
  const source = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Не удалось отрисовать QR'))
      image.src = source
    })

    const canvas = document.createElement('canvas')
    canvas.width = px
    canvas.height = px
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas недоступен')
    ctx.drawImage(image, 0, 0, px, px)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Пустой PNG'))), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(source)
  }
}
