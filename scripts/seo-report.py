#!/usr/bin/env python3
"""Сводит выгрузки из панелей вебмастера и Метрики в таблицу по кластерам.

Скрипт не ходит в API — токенов нет. Он читает файлы, которые владелец
выгружает руками в seo/data/, и привязывает URL к кластерам через
content/clusters.json.

Если данных нет — печатает это прямо и завершается кодом 0. Пустой честный
вывод правильнее выдуманных цифр: отчёт о несделанном замере хуже его отсутствия.

Запуск:  python3 scripts/seo-report.py [--data DIR] [--clusters FILE]
Формат входных файлов описан в seo/data/README.md.
"""
from __future__ import annotations

import argparse
import csv
import json
import pathlib
import sys
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = "https://sreda.men"

# Как называются колонки в выгрузках разных панелей. Панели переименовывают
# колонки от версии к версии, поэтому сопоставление по набору синонимов,
# а не по жёсткому индексу.
COLUMN_ALIASES = {
    "url": {"url", "адрес", "страница", "page", "адрес страницы", "landing page"},
    "query": {"query", "запрос", "поисковый запрос", "фраза", "ключевая фраза"},
    "impressions": {"impressions", "показы", "показов", "показы всего"},
    "clicks": {"clicks", "клики", "кликов", "переходы"},
    "position": {"position", "позиция", "средняя позиция", "avg. position", "average position"},
    "visits": {"visits", "визиты", "визитов", "сеансы", "sessions"},
    "goals": {"goals", "достижения цели", "достижения целей", "конверсии", "conversions"},
}


def norm_header(name: str) -> str | None:
    n = name.strip().strip('"').lower()
    for canon, aliases in COLUMN_ALIASES.items():
        if n in aliases:
            return canon
    return None


def path_of(url: str) -> str:
    u = url.strip().rstrip("/")
    if u.startswith(SITE):
        u = u[len(SITE):]
    if not u.startswith("/"):
        u = "/" + u
    return u or "/"


def slug_of(url: str) -> str | None:
    """/blog/vygoranie-u-muzhchin -> vygoranie-u-muzhchin; рубрики и прочее -> None"""
    p = path_of(url)
    if not p.startswith("/blog/") or p.startswith("/blog/tema/"):
        return None
    return p[len("/blog/"):] or None


def sniff_read(path: pathlib.Path) -> list[dict]:
    """Читает CSV или TSV с любым из поддерживаемых наборов колонок."""
    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    if not raw.strip():
        return []
    delim = "\t" if raw.count("\t") > raw.count(",") else ","
    rows = list(csv.reader(raw.splitlines(), delimiter=delim))
    if not rows:
        return []

    # Заголовок может быть не первой строкой: панели любят преамбулу
    head_i, mapping = None, {}
    for i, row in enumerate(rows[:10]):
        m = {j: norm_header(c) for j, c in enumerate(row)}
        m = {j: c for j, c in m.items() if c}
        if len(m) >= 2:
            head_i, mapping = i, m
            break
    if head_i is None:
        return []

    out = []
    for row in rows[head_i + 1:]:
        if not any(c.strip() for c in row):
            continue
        rec = {}
        for j, canon in mapping.items():
            if j < len(row):
                rec[canon] = row[j].strip()
        if rec:
            rec["_file"] = path.name
            out.append(rec)
    return out


def to_num(s: str | None) -> float:
    if not s:
        return 0.0
    s = s.replace(" ", "").replace(" ", "").replace(",", ".").replace("%", "")
    try:
        return float(s)
    except ValueError:
        return 0.0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=str(ROOT / "seo" / "data"))
    ap.add_argument("--clusters", default=str(ROOT / "content" / "clusters.json"))
    args = ap.parse_args()

    data_dir = pathlib.Path(args.data)
    clusters_file = pathlib.Path(args.clusters)

    if not clusters_file.is_file():
        print(f"seo-report: нет {clusters_file} — выполни `python3 seo/gen_clusters.py`", file=sys.stderr)
        return 2

    clusters = json.loads(clusters_file.read_text(encoding="utf-8"))
    cluster_of = {}
    for c in clusters:
        for a in c["articles"]:
            cluster_of[a] = c

    files = sorted(p for p in data_dir.glob("*") if p.suffix.lower() in (".csv", ".tsv", ".txt")) if data_dir.is_dir() else []

    if not files:
        print("seo-report: выгрузок нет.")
        print(f"  Ожидаю файлы .csv/.tsv в {data_dir}")
        print("  Что выгружать и как назвать — seo/data/README.md")
        print("  Данных нет — это не ошибка скрипта, а отсутствие замера.")
        return 0

    rows: list[dict] = []
    for f in files:
        got = sniff_read(f)
        print(f"  прочитано {f.name}: строк {len(got)}")
        rows += got

    if not rows:
        print("seo-report: файлы найдены, но ни в одном не распознаны колонки.")
        print("  Ожидаемые заголовки — см. seo/data/README.md")
        return 0

    agg = defaultdict(lambda: {"impressions": 0.0, "clicks": 0.0, "visits": 0.0,
                               "goals": 0.0, "pos_sum": 0.0, "pos_n": 0, "urls": set()})
    unmatched = defaultdict(float)

    for r in rows:
        url = r.get("url")
        if not url:
            continue
        slug = slug_of(url)
        c = cluster_of.get(slug) if slug else None
        key = c["key"] if c else ("__" + path_of(url))
        if not c:
            unmatched[path_of(url)] += to_num(r.get("impressions")) or to_num(r.get("visits"))
            continue
        a = agg[key]
        a["impressions"] += to_num(r.get("impressions"))
        a["clicks"] += to_num(r.get("clicks"))
        a["visits"] += to_num(r.get("visits"))
        a["goals"] += to_num(r.get("goals"))
        if r.get("position"):
            a["pos_sum"] += to_num(r["position"])
            a["pos_n"] += 1
        a["urls"].add(path_of(url))

    name_of = {c["key"]: c["name"] for c in clusters}
    size_of = {c["key"]: len(c["articles"]) for c in clusters}

    print()
    print(f"{'Кластер':34} {'Стат':>5} {'URL':>4} {'Показы':>9} {'Клики':>7} {'CTR':>6} {'Поз':>6} {'Визиты':>7} {'Цели':>6}")
    print("-" * 96)
    total = defaultdict(float)
    for key in sorted(agg, key=lambda k: -agg[k]["impressions"]):
        a = agg[key]
        ctr = (a["clicks"] / a["impressions"] * 100) if a["impressions"] else 0.0
        pos = (a["pos_sum"] / a["pos_n"]) if a["pos_n"] else 0.0
        print(f"{name_of.get(key, key)[:33]:34} {size_of.get(key, 0):5} {len(a['urls']):4} "
              f"{a['impressions']:9.0f} {a['clicks']:7.0f} {ctr:5.1f}% {pos:6.1f} {a['visits']:7.0f} {a['goals']:6.0f}")
        for k in ("impressions", "clicks", "visits", "goals"):
            total[k] += a[k]

    print("-" * 96)
    ctr = (total["clicks"] / total["impressions"] * 100) if total["impressions"] else 0.0
    print(f"{'ИТОГО':34} {'':5} {'':4} {total['impressions']:9.0f} {total['clicks']:7.0f} {ctr:5.1f}% "
          f"{'':6} {total['visits']:7.0f} {total['goals']:6.0f}")

    # Кластеры без единого показа — кандидаты в отстающие
    silent = [name_of[c["key"]] for c in clusters if c["key"] not in agg]
    if silent:
        print(f"\nКластеры без данных ({len(silent)}): {', '.join(silent)}")

    if unmatched:
        print(f"\nURL вне кластеров ({len(unmatched)}):")
        for u, v in sorted(unmatched.items(), key=lambda x: -x[1])[:10]:
            print(f"  {u:44} {v:9.0f}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
