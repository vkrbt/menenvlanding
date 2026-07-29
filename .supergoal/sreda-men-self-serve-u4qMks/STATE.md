# State: стратегия внешних упоминаний sreda.men (self-serve)

**Status:** READY_TO_DISPATCH
**Current phase:** 1
**Started:** 2026-07-29
**Last update:** 2026-07-29
**Run root:** .supergoal/sreda-men-self-serve-u4qMks
**Baseline ref:** 38c744e84d35cef8d2a20b3ac48db0ae72e2c884

## Phase progress

| # | Phase | Status | Started | Completed | Notes |
|---|-------|--------|---------|-----------|-------|
| 1 | Инвентаризация активов и запретов | pending | — | — | — |
| 2 | Реестр: UGC и сообщества | pending | — | — | — |
| 3 | Реестр: медиа, каталоги, подкасты | pending | — | — | — |
| 4 | Реестр: Q&A, форумы, профили | pending | — | — | — |
| 5 | Верификация площадок | pending | — | — | — |
| 6 | Правила контента, ссылок, темпа | pending | — | — | — |
| 7 | Приоритизация и переиспользование | pending | — | — | — |
| 8 | Помесячный план и метрики | pending | — | — | — |
| 9 | Сборка документа и приложение | pending | — | — | — |
| 10 | Polish & Harden | pending | — | — | — |

## Engineering check status

- Build (`npm run build`): —
- SEO (`python3 scripts/seo-check.py`): —
- Neurocheck (`python3 seo/neurocheck.py seo/linkbuilding.md`): —

## Baseline facts (не перепроверять, зафиксировано 2026-07-29)

- Внешних ссылок на `sreda.men` в Яндекс.Вебмастере: **0** (`get-external-links`, host `https:sreda.men:443`)
- Домен создан 2026-03-24 → возраст 4 месяца
- Счётчик Метрики: 111109205
- Опубликовано статей в `content/blog/`: 96 файлов на момент старта прогона

## Notable events

- 2026-07-29 — Рамка зафиксирована владельцем: только self-serve, outreach отдельным приложением, максимальный безопасный темп.
- 2026-07-29 — Установлено поиском: большинство UGC-площадок отдаёт nofollow/ugc. Акцент стратегии развёрнут с веса на упоминания и трафик.
- 2026-07-29 19:20 — Пред-полёт: `npm run build` exit=0; `python3 scripts/seo-check.py` exit=1, 3 нарушения. Все три — из соседнего активного прогона `.supergoal/sreda-men-tgN2w6` (файл `krizis-srednego-vozrasta-u-muzhchin.md`), к этой задаче не относятся.
- 2026-07-29 19:20 — Пред-полёт обойдён решением владельца: запуск при активном втором прогоне в том же дереве. Приняты риски коллизии `npm run build` и конкурентной записи в `seo/decisions.md` и `seo/state.md`.

## Failure log

_(пусто)_

## Escalation queue

- **[пред-полёт] Чужие битые ссылки.** `content/blog/krizis-srednego-vozrasta-u-muzhchin.md` ссылается на `/blog/ne-vizhu-smysla-v-tom-chto-delayu` и `/blog/krizis-40-let-u-muzhchin` — статей нет. Это долг соседнего прогона, здесь не чинится.
