#!/usr/bin/env python3
"""Генерирует seo/content-plan.md из seo/_core_data.py.

План материалов строится из ядра, а не пишется руками: так уникальность
целевых запросов гарантируется конструкцией, а не проверяется постфактум.

Порядок кластеров задан в ORDER — он же обоснован в architecture.md, раздел 5.
Внутри кластера pillar идёт первым: сателлит без хаба не закрывает кластер.

Запуск: python3 seo/gen_content_plan.py
"""
from __future__ import annotations

import collections
import importlib.util
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

# Порядок работы по кластерам и месяц выхода. Обоснование — architecture.md §5.
ORDER = [
    ("format", 1, "BOFU, ближайший к заявке, слабейшая конкуренция. Разрешает каннибализацию Р-004"),
    ("emigration", 2, "Пустая ниша, полное совпадение с УТП, основной канал под Google"),
    ("research", 3, "22 черновика уже написаны — самый дешёвый прирост и сильнейший E-E-A-T-сигнал"),
    ("loneliness", 4, "TOFU-мост с готовым покрытием: pillar есть, дописать 4"),
    ("anger", 5, "TOFU с готовым покрытием, разводит каннибализацию «срываюсь»"),
    ("apathy", 6, "Мост «от состояния к разговору», pillar нужно написать"),
    ("attention", 6, "Мост «от привычного к глубокому»: заходит через продуктивность"),
    ("achievement", 7, "Отстройка от «клубов успеха»"),
    ("fatherhood", 8, "Мужская родительская оптика почти не представлена"),
    ("relatives", 8, "Вторая воронка: ищет не мужчина, а близкий"),
    ("couple", 9, "Семейный контур, отделён от развода"),
    ("stigma", 10, "Кластер с нуля: нужен накопленный траст, зато прямой мост к продукту"),
    ("provider", 10, "Кластер с нуля, есть готовый черновик про ловушку кормильца"),
    ("soma", 11, "Кластер с нуля: вход через тело, естественный для ЦА"),
    ("midlife", 11, "Кластер с нуля, head-запрос не берём — только переживательные хвосты"),
    ("burnout", 12, "Добор: pillar есть, дописать 2"),
    ("anxiety", 12, "Добор: pillar есть, дописать 1"),
    ("breakup", 12, "Добор: pillar есть, дописать 3"),
]

# Тип материала по стадии воронки кластера — определяет CTA по матрице funnel.md §2
CTA_BY_ROLE = {
    "pillar": "средний → /vstrecha",
    "TOFU": "мягкий → /vstrecha",
    "MOFU": "средний → /vstrecha",
    "BOFU": "прямой → заявка",
}


def load():
    spec = importlib.util.spec_from_file_location("_core_data", pathlib.Path(__file__).parent / "_core_data.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return {c["key"]: c for c in m.CLUSTERS}


def main() -> int:
    clusters = load()
    slugs = {c["key"]: c["slug"] for c in json.loads((ROOT / "content" / "clusters.json").read_text(encoding="utf-8"))}

    accepted = {k for k, c in clusters.items() if c["status"] == "ПРИНЯТ"}
    ordered = [k for k, _, _ in ORDER]
    missing = accepted - set(ordered)
    extra = set(ordered) - accepted
    if missing or extra:
        print(f"ORDER рассинхронизирован с ядром. Нет в ORDER: {missing}. Лишние: {extra}", file=sys.stderr)
        return 1

    rows = []          # (месяц, кластер, роль, запрос, интент, статус, cta)
    seen = collections.defaultdict(list)

    for key, month, why in ORDER:
        c = clusters[key]
        stage = c["stage"]
        # Стадия кластера может быть составной («TOFU→MOFU») — для CTA берём первую
        base = stage.split("→")[0]

        pq, pi, pa = c["pillar"]
        rows.append((month, key, "pillar", pq, pi, "написана" if pa else "писать",
                     CTA_BY_ROLE["pillar"], pa or ""))
        seen[pq.lower()].append(key)

        for sq, si, sa in c["satellites"]:
            role = "BOFU" if key == "format" else base
            rows.append((month, key, "сателлит", sq, si, "написана" if sa else "писать",
                         CTA_BY_ROLE.get(role, CTA_BY_ROLE["TOFU"]), sa or ""))
            seen[sq.lower()].append(key)

    dups = {q: v for q, v in seen.items() if len(v) > 1}

    to_write = [r for r in rows if r[5] == "писать"]
    written = [r for r in rows if r[5] == "написана"]
    by_month = collections.Counter(r[0] for r in to_write)

    L = []
    A = L.append
    A("# Контент-план\n")
    A("_Фаза 7, 2026-07-29. Генерируется из [_core_data.py](_core_data.py) командой "
      "`python3 seo/gen_content_plan.py` — руками не править, перезапишется._\n")
    A("Уникальность целевых запросов гарантируется конструкцией: план строится из ядра, "
      "где один запрос принадлежит ровно одному материалу. Проверка внизу документа.\n")
    A("Порядок кластеров и его обоснование — [architecture.md](architecture.md), раздел 5. "
      "Внутри кластера pillar идёт первым: сателлит без хаба не закрывает кластер.\n")
    A("---\n")
    A("## Сводка\n")
    A(f"| Показатель | Значение |\n|---|---|")
    A(f"| Целевых запросов в ядре (принятые кластеры) | {len(rows)} |")
    A(f"| Уже покрыто существующими статьями | {len(written)} |")
    A(f"| **К написанию** | **{len(to_write)}** |")
    A(f"| Из них pillar-страниц | {sum(1 for r in to_write if r[2] == 'pillar')} |")
    A(f"| Кластеров к закрытию | {len(ORDER)} |\n")
    A("Распределение по месяцам:\n")
    A("| Месяц | Материалов | Кластеры |\n|---|---|---|")
    for mth in sorted(by_month):
        ks = sorted({r[1] for r in to_write if r[0] == mth})
        A(f"| {mth} | {by_month[mth]} | {', '.join(ks)} |")
    A("")

    A("---\n")
    A("## План по месяцам\n")
    cur = None
    for mth in sorted(by_month):
        A(f"### Месяц {mth}\n")
        for key, m, why in ORDER:
            if m != mth:
                continue
            c = clusters[key]
            slug = slugs.get(key)
            url = f"`/blog/tema/{slug}`" if slug else "рубрика появится с первой статьёй"
            A(f"**{c['name']}** · `{key}` · {url} · стадия {c['stage']}\n")
            A(f"_Почему сейчас:_ {why}\n")
            A("| Роль | Целевой запрос | Интент | Статус | CTA |\n|---|---|---|---|---|")
            for r in rows:
                if r[1] != key:
                    continue
                mark = f"`{r[7]}`" if r[7] else "**писать**"
                A(f"| {r[2]} | {r[3]} | {r[4]} | {mark} | {r[6]} |")
            A("")

    A("---\n")
    A("## Проверка уникальности целевых запросов\n")
    if dups:
        A(f"**НАЙДЕНЫ ДУБЛИ: {len(dups)}**\n")
        for q, v in dups.items():
            A(f"- `{q}` → {', '.join(v)}")
    else:
        A(f"Уникальных целевых запросов: **{len(seen)}**. Дублей: **0**.\n")
        A("Ни один запрос не назначен двум материалам. Проверено автоматически при генерации "
          "этого файла — при появлении дубля генератор выведет его здесь вместо этой строки.\n")

    (ROOT / "seo" / "content-plan.md").write_text("\n".join(L) + "\n", encoding="utf-8")

    print(f"seo/content-plan.md: запросов {len(rows)}, покрыто {len(written)}, к написанию {len(to_write)}")
    print(f"  pillar к написанию: {sum(1 for r in to_write if r[2]=='pillar')}")
    print(f"  уникальных запросов: {len(seen)}, дублей: {len(dups)}")
    print("  по месяцам:", dict(sorted(by_month.items())))
    return 1 if dups else 0


if __name__ == "__main__":
    sys.exit(main())
