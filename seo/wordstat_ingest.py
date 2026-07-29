#!/usr/bin/env python3
"""Читает заполненные батчи Wordstat и сверяет фактическую частотность
с порядком кластеров в контент-плане.

Гипотеза, которую проверяем, — не число (чисел в core.md нет вовсе),
а ПОРЯДОК кластеров в ORDER из gen_content_plan.py. Скрипт сравнивает
его с порядком по фактической частотности и показывает расхождения.

Запуск: python3 seo/wordstat_ingest.py
Ничего не переписывает — только считает и печатает.
"""
import pathlib, sys, re

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from _core_data import CLUSTERS
from gen_content_plan import ORDER

def parse_num(s: str):
    s = (s or "").strip().replace(" ", "").replace(" ", "").replace(",", ".")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None

def main() -> int:
    q2cluster, q2role = {}, {}
    for c in CLUSTERS:
        if c["status"] != "ПРИНЯТ":
            continue
        q2cluster[c["pillar"][0]] = c["key"]; q2role[c["pillar"][0]] = "pillar"
        for s in c["satellites"]:
            q2cluster[s[0]] = c["key"]; q2role[s[0]] = "сателлит"

    rows, unknown = [], []
    files = sorted(HERE.glob("core-wordstat-batch-*.tsv"))
    if not files:
        print("wordstat: батчей не найдено", file=sys.stderr); return 2
    for f in files:
        for i, line in enumerate(f.read_text(encoding="utf-8").splitlines()):
            if i == 0 or not line.strip():
                continue
            p = (line.split("\t") + ["", "", "", ""])[:4]
            q = p[0].strip()
            if q not in q2cluster:
                unknown.append((f.name, q)); continue
            rows.append({"q": q, "cluster": q2cluster[q], "role": q2role[q],
                         "freq": parse_num(p[2]), "date": p[3].strip()})

    filled = [r for r in rows if r["freq"] is not None]
    print(f"wordstat: запросов в батчах {len(rows)}, из них с частотностью {len(filled)}")
    for fn, q in unknown:
        print(f"  · {fn}: запрос «{q}» отсутствует в ядре — устаревшая строка")

    if not filled:
        print("\nЧастотность не заполнена ни у одного запроса — сверять нечего.")
        print("Что делать: заполнить колонки «частотность» и «дата» в seo/core-wordstat-batch-*.tsv")
        return 0

    order_rank = {k: (m, i) for i, (k, m, _) in enumerate(ORDER)}
    per = {}
    for r in filled:
        per.setdefault(r["cluster"], []).append(r["freq"])

    incomplete = []
    for c in CLUSTERS:
        if c["status"] != "ПРИНЯТ":
            continue
        total = 1 + len(c["satellites"])
        got = len(per.get(c["key"], []))
        if got < total:
            incomplete.append((c["key"], got, total))

    stats = sorted(((k, sum(v), max(v), len(v)) for k, v in per.items()),
                   key=lambda x: -x[1])
    print(f"\n{'кластер':14} {'сумма':>9} {'макс':>9} {'запр':>5}  {'план':>5}  {'по частоте':>10}  сдвиг")
    for pos, (k, tot, mx, n) in enumerate(stats, 1):
        month, plan_pos = order_rank.get(k, (None, 99))
        shift = plan_pos + 1 - pos
        mark = "  ←— расхождение" if abs(shift) >= 5 else ""
        print(f"{k:14} {tot:9.0f} {mx:9.0f} {n:5}  {plan_pos+1:5}  {pos:10}  {shift:+d}{mark}")

    if incomplete:
        print("\nЗаполнено не полностью — цифры ниже предварительные:")
        for k, got, total in incomplete:
            print(f"  · {k}: {got} из {total}")

    big = [k for pos, (k, *_ ) in enumerate(stats, 1)
           if abs(order_rank.get(k, (None, 99))[1] + 1 - pos) >= 5]
    print(f"\nКластеров со сдвигом ≥5 позиций: {len(big)}"
          + (f" — {', '.join(big)}" if big else ""))
    if len(big) >= 5:
        print("Это порог эскалации из measurement.md: данные противоречат плану, "
              "нужен пересмотр стратегии, а не отдельной задачи.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
