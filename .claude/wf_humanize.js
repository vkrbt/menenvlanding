export const meta = {
  name: 'sreda-humanize-blog',
  description: 'Rewrite menmasculinities telegram posts into humanized sreda.men blog MD drafts, each validated to >=77% neurodetector (avg of 2 runs). MD only, no HTML.',
  phases: [{ title: 'Write+Humanize', detail: 'one agent per post: copywrite MD -> neurocheck loop to >=77% avg-of-2' }],
}

const RESULT = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'status'],
  properties: {
    slug: { type: 'string' },
    status: { type: 'string', enum: ['passed', 'failed', 'skipped'] },
    avg_score: { type: 'number', description: 'final average human% over 2 runs' },
    run1: { type: 'number' },
    run2: { type: 'number' },
    iterations: { type: 'integer' },
    reason: { type: 'string', description: 'if skipped/failed, why' },
  },
}

const ROLES = {
  'Женя': 'Женя — психиатр-нарколог, ведущий «Мужской среды»',
  'Влад': 'Влад — гештальт-терапевт, ведущий «Мужской среды»',
}
const RELATED = 'net-druzey-posle-30, ne-s-kem-pogovorit, odinochestvo-v-emigracii, odinochestvo-v-brake, kak-perezhit-razvod, depressiya-u-muzhchin-priznaki, vygoranie-u-muzhchin, muzhskaya-gruppa-online, gruppa-ili-psiholog, kak-pomoch-drugu-v-depressii, apatiya-u-muzhchin, muzh-v-depressii, muzh-zamknulsya, trevozhnost-u-muzhchin, muzhskoe-mentalnoe-zdorovie-v-cifrah'

function prompt(it) {
  const role = ROLES[it.author] || ROLES['Влад']
  const ymyl = /Состояния/.test(it.tag)
  return `Ты — редактор-копирайтер блога sreda.men («Мужская среда»), онлайн-сообщества мужчин 25+. Пишешь для мужской аудитории живым, разговорным, экспертным тоном от первого лица — как умный специалист объясняет другу, без канцелярита и морализаторства.

ЗАДАЧА: превратить пост телеграм-канала в статью-черновик MARKDOWN и довести её человечность до >=77% по нейродетектору (среднее из 2 прогонов). ТОЛЬКО MD, в HTML НЕ конвертировать.

ИСТОЧНИК: прочитай файл \`${it.file}\`. Это пост канала menmasculinities (мужская психология/гендер).

ШАГ 0 — отсев. Если пост — ЛИЧНОЕ дневниковое эссе/мнение автора канала без переиспользуемой фактуры (нет исследований/данных/практики), либо чисто про рекламу/книгу/анонс/кино и не про мужскую психологию — верни {slug:"${it.slug}", status:"skipped", reason:"..."} и НИЧЕГО не пиши. Если пост несёт исследования, факты, статистику или практические выводы про мужскую психологию/одиночество/дружбу/эмоции/отношения/кризисы/здоровье — работай дальше.

ШАГ 1 — копирайт. Напиши файл \`drafts/writing/${it.slug}.md\`. Если он уже существует — доработай существующий (не выкидывай удачное). Формат СТРОГО такой (фронтматтер + тело):

---
slug: ${it.slug}
title: <SEO-заголовок> | Мужская среда
og_title: <тот же заголовок без « | Мужская среда»>
description: <SEO-описание 150–200 симв, живое, с сутью и пользой>
canonical: https://sreda.men/blog/${it.slug}
tag: ${role}
author_line: ${role}
date_line: <дата словами, напр. «17 июля 2026»>
read_line: ≈ <N> минут
date_published: ${it.date}
date_modified: ${it.date}
status: writing
---
<ТЕЛО: 1400–1700 слов. Абзацы прозы. Подзаголовки ## и ### по смыслу (не дроби на мелкие). Первая строка — сразу в суть/сцену/факт, без «В современном мире». [ссылки](url) прямо в тексте.>

<!-- CTA -->
**<цепляющий заголовок призыва под тему статьи>**
«Мужская среда» — онлайн-сообщество мужчин 25+, где можно говорить о настоящем, а можно молчать и слушать. Раз в две недели, три часа в Zoom. <1 фраза-связка с темой статьи>
_Заявка бесплатна и ни к чему не обязывает.${ymyl ? ' Сообщество не заменяет врача и терапию.' : ''}_

## Частые вопросы
### <вопрос 1 по теме>
<ответ, живой, 2–4 предложения>
### <вопрос 2>
<ответ>
### <вопрос 3>
<ответ>

<!-- NOTE -->
> **Автор:** ${it.author === 'Женя' ? 'Женя (Евгений Якубовский) — психиатр-нарколог, ведущий «Мужской среды».' : 'Влад — гештальт-терапевт, ведущий «Мужской среды». Днём пишет код в Big Tech, вечером ведёт клиентов.'}
> Статья носит информационный характер и не заменяет консультацию специалиста.${ymyl ? ' Если появляются мысли о том, что жить не хочется — не оставайся с этим один: Беларусь 8-801-100-16-11, Россия 8-800-2000-122 / 051, другие страны — [findahelpline.com](https://findahelpline.com/ru).' : ''}
> **Источники:** <ВСЕ внешние ссылки из поста, как [понятное имя](url), через « · »>

## Читать дальше
- [<название>](/blog/<slug>)
- [<название>](/blog/<slug>)

Правила «Читать дальше»: выбери 2–3 ТЕМАТИЧЕСКИ близких из существующих: ${RELATED}. Название придумай осмысленное.

ЖЁСТКИЕ ТРЕБОВАНИЯ:
- ФАКТ-ЗАМОК: все числа, проценты, названия исследований, имена — точно как в источнике. НИЧЕГО не выдумывать (ни цифр, ни кейсов «у меня был пациент», ни исследований). Нет конкретики — оживляй голосом, не выдумкой.
- СОХРАНИ ВСЕ ССЫЛКИ из поста (и из блока «## Ссылки», и внутритекстовые) — в тело и/или в «Источники». Ни одной не потерять.
- Переработай под аудиторию sreda.men: не пересказ новости, а польза для мужчины-читателя.

ШАГ 2 — гуманизация до >=77%. Прогоняй: \`python3 seo/neurocheck.py drafts/writing/${it.slug}.md\`. Первая строка вывода: «Сегментов: N | AI: a | LIKELY_AI: b | HUMAN(+likely): h». Человечность = h/N*100. Прогони ДВАЖДЫ, возьми среднее (детектор шумит). Если среднее < 77:
  1) Запусти ещё раз и посмотри флаги 🔴 (AI) и 🟡 (LIKELY_AI) — это проблемные сегменты.
  2) Перепиши ИМЕННО их. Что реально двигает сегмент AI→HUMAN (проверено):
     • Убей перечисления «Первое/Второе/Третье» и параллельные структуры — размажь в живую прозу.
     • Сломай гладкое «тезис → объяснение»: начни с реакции, вопроса, короткой рубленой фразы.
     • Вставляй самоперебивы, оговорки в тире/скобках, риторические вопросы, очень короткие предложения (3–5 слов) среди длинных.
     • Добавь авторскую реакцию на факты («меня зацепило», «цифра, от которой не по себе»), мнение, лёгкую разговорность («ну», «вот», «смотри», «да»).
     • Убери канцелярит, «является», кальки «стоит отметить/важно понимать», длинное тире «—» замени где можно на дефис/запятую/точку.
  3) Перепроверь (дважды, среднее). Границы сегментов сдвигаются — это норма, продолжай.
  Повторяй до 5 итераций. Дольше не сиди.

Если после 5 итераций среднее так и < 77 — верни status:"failed" с лучшим достигнутым avg_score. Если >=77 — status:"passed".
НЕ трогай blog/, index.html, sitemap.xml. Работай только с drafts/writing/${it.slug}.md.
Верни строго объект результата: slug, status, avg_score, run1, run2, iterations, reason.`
}

let items = []
if (Array.isArray(args)) {
  items = args
} else if (typeof args === 'string') {
  const loaded = await agent(
    `Прочитай файл \`${args}\` (JSON-массив объектов). Верни его содержимое как есть, ничего не меняя.`,
    { label: 'load-args', phase: 'Write+Humanize', schema: { type: 'object', additionalProperties: false, required: ['json'], properties: { json: { type: 'string', description: 'raw JSON array text from the file' } } } }
  )
  items = JSON.parse(loaded.json)
}
log(`Humanizing ${items.length} posts to >=77% (avg of 2). MD only.`)

const results = await parallel(items.map((it) => () =>
  agent(prompt(it), {
    label: `write:${it.slug.slice(0, 28)}`,
    phase: 'Write+Humanize',
    agentType: 'general-purpose',
    effort: 'high',
    schema: RESULT,
  })
))

const ok = results.filter(Boolean)
const passed = ok.filter(r => r.status === 'passed')
const failed = ok.filter(r => r.status === 'failed')
const skipped = ok.filter(r => r.status === 'skipped')
log(`DONE: ${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped, ${items.length - ok.length} died`)
return { passed: passed.map(r => ({ slug: r.slug, avg: r.avg_score })), failed: failed.map(r => ({ slug: r.slug, avg: r.avg_score })), skipped: skipped.map(r => ({ slug: r.slug, reason: r.reason })) }
