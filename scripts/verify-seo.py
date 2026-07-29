#!/usr/bin/env python3
"""Сверка SEO-разметки старого сайта и нового экспорта: title, canonical,
мета-теги, иконки и JSON-LD.

Дополняет scripts/verify-parity.mjs, который смотрит только на <body>.
Всё, что не описано в APPROVED, считается регрессией.

Запуск: python3 scripts/verify-seo.py
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

# Мета-теги, которые Next выводит сам и сравнивать которые бессмысленно
IGNORE_META = {"viewport", "charset", "next-size-adjust"}

SITE = "https://sreda.men"

# Утверждённые изменения. Применяются к СТАРОЙ версии, чтобы сравнивать на равных.
# Только точные совпадения: как префиксы эти правила покалечили бы адреса статей
# (https://sreda.men/blog/<slug>) и внутренних страниц (https://sreda.men/book)
APPROVED_URL_REWRITES = {
    f"{SITE}/": SITE,                    # корень без хвостового слеша
    f"{SITE}/blog/": f"{SITE}/blog",     # решение №1: раздел блога без слеша
}

# Next добавляет их автоматически из openGraph; в старой вёрстке их не было
APPROVED_ADDED_META = {"twitter:title", "twitter:description"}


def approve(value: str) -> str:
    return APPROVED_URL_REWRITES.get(value, value)


def extract(html: str) -> dict:
    meta: dict[str, str] = {}
    for m in re.finditer(r"<meta\s+([^>]*?)/?>", html):
        attrs = dict(re.findall(r'(\w[\w:-]*)="([^"]*)"', m.group(1)))
        key = attrs.get("name") or attrs.get("property")
        if key and "content" in attrs:
            meta[key] = attrs["content"]

    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    icons = re.findall(r'<link rel="(icon|apple-touch-icon)"[^>]*?href="([^"]+)"', html)
    ld = [json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)]

    return {
        "title": title.group(1).strip() if title else None,
        "canonical": canonical.group(1) if canonical else None,
        "meta": meta,
        "icons": sorted(icons),
        "ld": ld,
    }


def canon_ld(obj):
    """Граф сравнивается по смыслу: порядок ключей и отступы не важны"""
    if isinstance(obj, dict):
        return {k: canon_ld(v) for k, v in sorted(obj.items())}
    if isinstance(obj, list):
        return [canon_ld(v) for v in obj]
    if isinstance(obj, str):
        return approve(obj)
    return obj


def pairs() -> list[tuple[str, pathlib.Path, pathlib.Path]]:
    out = [
        ("/", ROOT / "index.html", ROOT / "out/index.html"),
        ("/book", ROOT / "book.html", ROOT / "out/book.html"),
        ("/blog", ROOT / "blog/index.html", ROOT / "out/blog.html"),
    ]
    for f in sorted((ROOT / "blog").glob("*.html")):
        if f.stem != "index":
            out.append((f"/blog/{f.stem}", f, ROOT / "out/blog" / f.name))
    return out


def main() -> None:
    problems: list[str] = []
    checked = 0

    for url, old_path, new_path in pairs():
        if not new_path.exists():
            problems.append(f"{url}: нет файла {new_path.relative_to(ROOT)}")
            continue

        checked += 1
        old = extract(old_path.read_text(encoding="utf-8"))
        new = extract(new_path.read_text(encoding="utf-8"))

        if old["title"] != new["title"]:
            problems.append(f'{url}: title\n    было : {old["title"]}\n    стало: {new["title"]}')

        if approve(old["canonical"] or "") != (new["canonical"] or ""):
            problems.append(f'{url}: canonical {old["canonical"]} → {new["canonical"]}')

        for k, v in old["meta"].items():
            if k in IGNORE_META:
                continue
            if k not in new["meta"]:
                problems.append(f"{url}: ПОТЕРЯН мета-тег {k}")
            elif new["meta"][k] != approve(v):
                problems.append(f'{url}: {k}\n    было : {v}\n    стало: {new["meta"][k]}')

        added = set(new["meta"]) - set(old["meta"]) - IGNORE_META - APPROVED_ADDED_META
        if added:
            problems.append(f"{url}: неожиданные мета-теги: {sorted(added)}")

        if [(r, approve(h)) for r, h in old["icons"]] != new["icons"]:
            problems.append(f"{url}: набор иконок различается")

        if [canon_ld(x) for x in old["ld"]] != [canon_ld(x) for x in new["ld"]]:
            problems.append(f"{url}: JSON-LD различается")

    print(f"страниц сверено: {checked}")
    print(f"необъяснённых расхождений: {len(problems)}")
    for p in problems[:30]:
        print("  " + p)

    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
