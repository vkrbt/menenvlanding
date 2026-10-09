/**
 * Модель самотеста. Шкала хранится в нормализованной форме: у каждого
 * варианта ответа явно записан его вклад в каждую (под)шкалу. Файлы шкал
 * собирают эту форму из ключа в том виде, в каком он напечатан в методике
 * (списки обратных пунктов, таблица коэффициентов), — так их можно сверить
 * с источником глазами, а считает всё одна функция score().
 *
 * Модуль импортируется и Next, и `node --test`, поэтому без алиаса `@/`.
 */

/** Ссылка на источник: что взято, откуда, где в ресёрче лежит сверка */
export type Source = {
  /** Что подтверждает источник: текст, ключ, пороги */
  covers: string
  /** Библиографическая ссылка как в ресёрче */
  citation: string
  url?: string
}

export type Option = {
  /** Значение, которое хранится как ответ. Не зависит от порядка показа */
  value: number
  label: string
  /** Вклад в (под)шкалы; пустой объект — вариант ни на что не влияет */
  scores: Record<string, number>
}

export type Item = {
  /** Номер пункта как на бланке; доп. вопросы — с суффиксом (например, «19а») */
  id: string
  text: string
  options: Option[]
  /** Часть бланка со своей инструкцией (у Спилбергера–Ханина их две) */
  part?: string
  /** Подсказка над вариантами */
  hint?: string
}

/**
 * Категория — включительный целочисленный диапазон [min, max].
 * Строгие пороги источника переводятся в целые: «больше +1,28» в сотых
 * долях — это min = 129. Бесконечные края — ±Infinity.
 */
export type Category = {
  id: string
  min: number
  max: number
  /** Название категории как в источнике */
  label: string
  /** 0 — норма … 3 — максимальная выраженность; задаёт порядок блоков результата */
  severity: 0 | 1 | 2 | 3
}

export type Subscale = {
  id: string
  title: string
  /** Теоретические минимум и максимум; проверяются автотестом */
  min: number
  max: number
  /** Нет порогов — показываем только число (подшкалы Бека) */
  categories: Category[]
  /** Делитель для показа: коэффициенты Яхина–Менделевича хранятся в сотых */
  divisor?: number
}

/** Обнулить вклад пункта, если на другой вопрос дан определённый ответ */
export type ZeroIfModifier = {
  kind: 'zeroIf'
  item: string
  ifItem: string
  equals: number
}

export type RiskFlag = {
  id: string
  item: string
  /** Уровень риска по значению ответа; значения вне списка — флага нет */
  levels: Record<number, 1 | 2>
}

export type Part = {
  id: string
  title: string
  /** Инструкция дословно по источнику — для блока «Все вопросы» */
  instruction: string
  /**
   * Пересказ для онлайн-прохождения, если оригинал про бумагу
   * («обведите кружком»). Смысл и временное окно — те же.
   */
  online?: string
}

export type Scale = {
  slug: string
  title: string
  /** Короткое имя для карточки и заголовков */
  shortTitle: string
  /** Что измеряет — одна фраза */
  measures: string
  /** Временное окно инструкции: «за последнюю неделю» и т. п. */
  timeframe?: string
  minutes: number
  parts: Part[]
  items: Item[]
  subscales: Subscale[]
  modifiers?: ZeroIfModifier[]
  riskFlags?: RiskFlag[]
  sources: Source[]
  /** Методическая справка под тестом — серверный HTML, индексируется */
  methodology: {
    /** Как считается результат: абзацы */
    scoring: string[]
    /** Наши отступления от бланка и спорные места источников */
    notes: string[]
    /** Ошибки популярных версий методики в рунете */
    pitfalls: string[]
  }
}

export type Answers = Record<string, number>

export type SubscaleResult = {
  id: string
  raw: number
  /** raw / divisor — то, что видит человек */
  value: number
  category?: Category
}

export type ScoreResult =
  | {
      ok: true
      subscales: SubscaleResult[]
      flags: Array<{ id: string; level: 1 | 2 }>
    }
  | {
      ok: false
      missing: string[]
      invalid: string[]
    }
