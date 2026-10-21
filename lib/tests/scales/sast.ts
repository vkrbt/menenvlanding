import type { Option, Scale } from '../types.ts'

/**
 * Скрининг-тест на сексуальную зависимость SAST — классическая версия
 * П. Карнеса из 25 вопросов «да/нет» (Contrary to Love, 1989). Сверка —
 * plans/tests-research/sast.md: §2 (английский текст), §3 (наш перевод
 * и ошибки ходового русского), §4 (подсчёт и порог 13).
 *
 * Почему не SAST-R: у ревизии 2010 года нет ни опубликованного русского
 * перевода, ни русской валидации, а порог ядра (≥ 6 из 20) на бланке
 * записан двусмысленно («Over 6»). Классический SAST сделан для мужчин —
 * это наша аудитория.
 *
 * Русский текст — наш перевод с английского оригинала, близко к тексту.
 * Ходовой русский перевод (b17, psi-test, lyubi.ru и др.) не взят: в нём
 * перевёрнуты пункты 7 и 24 и неверно переведён пункт 23, см. pitfalls.
 * Обратных пунктов нет: каждое «да» — 1 балл.
 */

const YES = 1
const NO = 0

const options = (): Option[] => [
  { value: YES, label: 'Да', scores: { total: 1 } },
  { value: NO, label: 'Нет', scores: { total: 0 } },
]

/** Номер → [наш перевод, английский оригинал для сверки] */
const ITEMS: Array<[string, string]> = [
  ['Был ли ты жертвой сексуального насилия в детстве или подростковом возрасте?', 'Were you sexually abused as a child or adolescent?'],
  [
    'Подписывался ли ты на откровенные эротические журналы вроде Playboy или Penthouse или регулярно их покупал?',
    'Have you subscribed or regularly purchased sexually explicit magazines like Playboy or Penthouse?',
  ],
  ['Были ли у твоих родителей проблемы с сексуальным поведением?', 'Did your parents have trouble with sexual behavior?'],
  ['Часто ли ты ловишь себя на том, что поглощён мыслями о сексе?', 'Do you often find yourself preoccupied with sexual thoughts?'],
  ['Кажется ли тебе, что твоё сексуальное поведение ненормально?', 'Do you feel that your sexual behavior is not normal?'],
  [
    'Беспокоится ли когда-нибудь жена или партнёрша (или другие близкие) из-за твоего сексуального поведения, жалуется ли на него?',
    'Does your spouse [or significant other(s)] ever worry or complain about your sexual behavior?',
  ],
  [
    'Трудно ли тебе остановиться, даже когда понимаешь, что твоё сексуальное поведение неуместно?',
    'Do you have trouble stopping your sexual behavior when you know it is inappropriate?',
  ],
  ['Бывает ли, что тебе плохо из-за своего сексуального поведения?', 'Do you ever feel bad about your sexual behavior?'],
  [
    'Создавало ли когда-нибудь твоё сексуальное поведение проблемы тебе и твоей семье?',
    'Has your sexual behavior ever created problems for you and your family?',
  ],
  [
    'Обращался ли ты когда-нибудь за помощью из-за сексуального поведения, которое тебе самому не нравилось?',
    'Have you ever sought help for sexual behavior you did not like?',
  ],
  [
    'Боялся ли ты когда-нибудь, что люди узнают о твоей сексуальной жизни?',
    'Have you ever worried about people finding out about your sexual activities?',
  ],
  [
    'Было ли кому-нибудь эмоционально больно из-за твоего сексуального поведения?',
    'Has anyone been hurt emotionally because of your sexual behavior?',
  ],
  ['Нарушает ли закон что-то из того, что ты делаешь в сексе?', 'Are any of your sexual activities against the law?'],
  [
    'Обещал ли ты себе бросить что-то в своём сексуальном поведении?',
    'Have you made promises to yourself to quit some aspect of your sexual behavior?',
  ],
  [
    'Пытался ли ты отказаться от какого-то вида сексуальной активности — и не смог?',
    'Have you made efforts to quit a type of sexual activity and failed?',
  ],
  [
    'Приходится ли тебе скрывать от других часть своего сексуального поведения?',
    'Do you have to hide some of your sexual behavior from others?',
  ],
  [
    'Пытался ли ты прекратить что-то из своей сексуальной активности?',
    'Have you attempted to stop some parts of your sexual activity?',
  ],
  ['Чувствовал ли ты себя когда-нибудь униженным из-за своего сексуального поведения?', 'Have you ever felt degraded by your sexual behavior?'],
  ['Был ли секс для тебя способом уйти от проблем?', 'Has sex been a way for you to escape your problems?'],
  ['Бывает ли, что после секса у тебя подавленное настроение?', 'When you have sex, do you feel depressed afterwards?'],
  [
    'Чувствовал ли ты, что тебе нужно отказаться от какой-то формы сексуальной активности?',
    'Have you felt the need to discontinue a certain form of sexual activity?',
  ],
  ['Мешала ли твоя сексуальная активность семейной жизни?', 'Has your sexual activity interfered with your family life?'],
  ['Были ли у тебя сексуальные контакты с несовершеннолетними?', 'Have you been sexual with minors?'],
  ['Чувствуешь ли ты, что сексуальное желание управляет тобой?', 'Do you feel controlled by your sexual desire?'],
  ['Бывает ли, что тебе кажется: твоё сексуальное желание сильнее тебя?', 'Do you ever think your sexual desire is stronger than you are?'],
]

/** Английский текст пунктов — для автотеста и сверки */
export const SAST_ORIGINAL = ITEMS.map(([, en]) => en)

/** Порог Карнеса: 13 «да» и больше */
export const SAST_CUTOFF = 13

export const sast: Scale = {
  slug: 'sast',
  title: 'Тест на сексуальную зависимость SAST (Карнес)',
  shortTitle: 'SAST',
  measures: 'Есть ли признаки сексуальной зависимости — компульсивного сексуального поведения',
  minutes: 4,
  intro: [
    'Это классический скрининг Патрика Карнеса — психолога, который первым начал системно изучать сексуальную зависимость. 25 вопросов, на каждый — «да» или «нет».',
    'Под «сексуальным поведением» здесь понимается всё сразу: секс с партнёршами, случайный секс, порно, мастурбация, переписки. Тест их не делит, и Аня в выпуске «Мужской среды» тоже их не делит: мастурбационная зависимость — та же сексуальная.',
    'Часть вопросов — про всю жизнь («когда-нибудь»), часть — про то, как сейчас. Отвечай честно: ответы никто, кроме тебя, не увидит.',
  ],
  parts: [
    {
      id: 'main',
      title: 'SAST',
      // Перевод вступления к бланку; в оригинале: «…answer each question by
      // placing a check in the appropriate yes/no column»
      instruction:
        'Скрининг-тест на сексуальную зависимость (SAST) помогает оценить компульсивное, или «зависимое», сексуальное поведение. Чтобы пройти тест, отметьте в каждом вопросе «да» или «нет».',
      online: 'Ответь «да» или «нет» на каждый вопрос.',
    },
  ],
  items: ITEMS.map(([text], i) => ({
    id: String(i + 1),
    text,
    options: options(),
    ...(i === 1 ? { hint: 'Вопрос оставлен как в оригинале 1989 года, когда порно продавали в журналах.' } : {}),
  })),
  subscales: [
    {
      id: 'total',
      title: 'Ответов «да»',
      min: 0,
      max: 25,
      // Carnes 1989: 13 и больше — признак сексуальной зависимости. Других
      // градаций у классического SAST нет: в таблице Карнеса 0–4, 5–8, 9–12
      // — только распределение выборки, не категории.
      categories: [
        { id: 'below', min: 0, max: SAST_CUTOFF - 1, label: 'ниже порога', severity: 0 },
        { id: 'above', min: SAST_CUTOFF, max: 25, label: 'выше порога: вероятна сексуальная зависимость', severity: 2 },
      ],
    },
  ],
  sources: [
    {
      covers: 'Английский текст 25 пунктов и инструкции, подсчёт «число ответов „да“»',
      citation:
        'Carnes P. J. Contrary to Love: Helping the Sexual Addict. Minneapolis: CompCare Publishers, 1989 — перепечатка бланка (Lifebuilders Counseling)',
      url: 'https://lifebuilderscounseling.org/wp-content/uploads/sexualaddictionscreeningtestsast.pdf',
    },
    {
      covers: 'Вторая перепечатка бланка: текст пунктов, таблица «баллы — доля зависимых» (13+ — 96,5 %), оговорки автора',
      citation: 'The Sexual Addiction Screening Test (SAST). Author Patrick Carnes, 1989 — перепечатка SAPTA (Кения)',
      url: 'https://www.sapta.or.ke/wp-content/uploads/2019/01/Sex-Addiction-Screening1.pdf',
    },
    {
      covers: 'Обзор: SAST — 25 пунктов, 13 и больше указывают на сексуальную зависимость (Carnes, 1989), выборки в основном из гетеросексуальных мужчин, α = 0,85–0,95',
      citation:
        'Hook J. N., Hook J. P., Davis D. E., Worthington E. L., Penberthy J. K. Measuring sexual addiction and compulsivity: a critical review of instruments. Journal of Sex & Marital Therapy, 2010, 36(3): 227–260',
      url: 'https://doi.org/10.1080/00926231003719673',
    },
    {
      covers: 'Однофакторная структура и высокая надёжность SAST на двух выборках ветеранов',
      citation:
        'Nelson K. G., Oehlert M. E. Psychometric exploration of the Sexual Addiction Screening Test in veterans. Sexual Addiction & Compulsivity, 2008, 15(1): 39–58',
      url: 'https://doi.org/10.1080/10720160701876609',
    },
    {
      covers: 'Ревизия SAST-R (45 пунктов, ядро из 20) — почему здесь не она, см. оговорки',
      citation:
        'Carnes P., Green B., Carnes S. The same yet different: refocusing the Sexual Addiction Screening Test (SAST) to reflect orientation and gender. Sexual Addiction & Compulsivity, 2010, 17(1): 7–30',
      url: 'https://doi.org/10.1080/10720161003604087',
    },
  ],
  methodology: {
    scoring: [
      'Каждое «да» — 1 балл, «нет» — 0. Обратных вопросов нет. Итог — число ответов «да», от 0 до 25.',
      '13 и больше — порог Карнеса: при таком результате вероятна сексуальная зависимость. В исходной выборке Карнеса среди набравших 13 и больше 96,5 % были людьми с сексуальной зависимостью.',
      'Ниже 13 тест признаков зависимости не находит. Других градаций у классического SAST нет.',
      'Результат считается, только когда отвечены все вопросы. Это скрининг, а не диагноз.',
    ],
    notes: [
      'Русский текст — наш перевод с английского оригинала. Опубликованного валидированного русского перевода SAST нет, а ходовой перевод содержит смысловые ошибки (см. ниже). Обращение на «ты», как везде на сайте.',
      'Классический SAST создавался и проверялся на мужчинах. Сам Карнес предупреждал: для женщин надёжность низкая, а с геями и всеми, чьё поведение осуждается в их среде, нужна осторожность — стыд и скрытность у них могут быть без всякой зависимости.',
      'Вопрос 2 о журналах устарел: в 1989 году порно продавали так. Мы его не меняли, иначе это был бы уже другой тест. В ревизии SAST-R 2010 года вопрос расширен до видео и порно в интернете.',
      'Почему не SAST-R: у ревизии нет ни опубликованного русского перевода, ни русской валидации, а порог её ядра на бланке записан двусмысленно («Over 6»), тогда как в статьях пишут о 6 и больше.',
      'В перепечатках разное слово в вопросе 5: «normal» и «not normal». Мы взяли «ненормально»: так в большинстве перепечаток и в SAST-R, а при «нормально» «да» не могло бы давать балл.',
      'В МКБ-11 слов «сексуальная зависимость» нет: близкое состояние называется «расстройство компульсивного сексуального поведения» (6C72). Тест показывает признаки, а не ставит этот диагноз.',
    ],
    pitfalls: [
      'В ходовом русском переводе (b17.ru, psi-test.ru, lyubi.ru и др.) вопрос 7 перевёрнут: «Можете ли Вы с легкостью отказаться…» вместо «трудно ли остановиться». При этом «да» всё равно даёт балл — и балл получает тот, у кого с контролем всё в порядке.',
      'Там же перевёрнут вопрос 24: «Можете ли Вы контролировать свое сексуальное желание?» вместо «чувствуете ли, что желание управляет вами».',
      'Вопрос 23 в том же переводе звучит как «партнеры из представителей сексуальных меньшинств», хотя в оригинале minors — несовершеннолетние. Ошибка и меняет смысл, и делает из гомосексуальности «симптом».',
      'На psi-test.ru результат выдаётся процентами («12–25 % — низкая вероятность…»). У Карнеса таких градаций нет: есть один порог — 13.',
      'Часто путают версии: 25-вопросный тест подписывают как SAST-R, а к нему применяют пороги ревизии (5–6 из 20) — или наоборот.',
    ],
  },
}
