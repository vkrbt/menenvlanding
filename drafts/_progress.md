# Прогресс: MD-пайплайн блога sreda.men

## Рабочий процесс (актуальный)
1. **Пишем/держим статьи в Markdown** в `drafts/writing/` (в работе) и `drafts/released/` (опубликовано).
2. **Чистка** (этап 2): удалять кейсы участников «Мужской среды» / ситуации из клуба и истории личной практики Жени/Влада. **Оставлять** фактический оффер в CTA/цене и регалии авторов в подписи.
3. **Валидация:** `python3 seo/neurocheck.py <файл.md>`. Порог: HUMAN(+likely)/segments ≥ 80%.
4. **Публикация:** `python3 seo/publish.py` — MD → `blog/*.html`, перенос в `drafts/released/`, обновление `sitemap.xml`.

## Статус (2026-07-11)

### ✅ Опубликовано — `drafts/released/` + `blog/` (34)
Все статьи ≥80% neurocheck, HTML собран из MD через `seo/md2html.py`.

### ◀ В работе — `drafts/writing/` (1)
| slug | MD | примечание |
|---|---|---|
| kak-perestat-sryvatsya-na-blizkih | 5/9 (56%) | HTML обновлён из writing-версии (patch_kak); MD <80% |

## Инструменты
- `seo/html2md.py` — HTML → MD (извлечение)
- `seo/md2html.py` — MD → HTML (сборка)
- `seo/publish.py` — полный релиз
- `seo/neurocheck.py` — валидация человечности
