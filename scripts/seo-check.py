#!/usr/bin/env python3
"""Сквозной SEO-гейт проекта: проверяет собранный экспорт и исходный контент.

В отличие от scripts/verify-parity.mjs и scripts/verify-seo.py — это не сверка
со старым сайтом, а самодостаточная проверка: эталон не нужен, каталог старого
сайта не требуется. Поэтому скрипт годится как обязательная команда любой фазы.

Проверки:
  1. title уникален среди индексируемых страниц и непустой
  2. description уникален среди индексируемых страниц и непустой
  3. ровно один <h1> на страницу
  4. canonical есть и совпадает с собственным URL страницы
  5. sitemap.xml и набор страниц в out/ совпадают в обе стороны
  6. внутренние ссылки ](/blog/<slug>) ведут на существующие статьи
  7. целевые запросы статей (поле target_query во фронтматтере) не дублируются

Страницы, закрытые в robots.txt, и 404 из проверок 1-4 исключаются: это
служебные шаблоны OG-картинок и одноразовые лендинги, они не индексируются.

Запуск: python3 scripts/seo-check.py [--out DIR] [--content DIR]
Код выхода: 0 — чисто, 1 — есть нарушения (перечисляются), 2 — нечего проверять.
"""
from __future__ import annotations

import argparse
import html
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE_URL = "https://sreda.men"
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

# Страницы вне индекса: закрыты в robots.txt либо служебные
EXCLUDED_STEMS = {
    "404",
    "_not-found",
    "og-image",
    "og-book",
    "instagram-carousel",
    "muzhskaya_sreda_books",
}


def page_url(path: pathlib.Path, out_dir: pathlib.Path) -> str:
    """URL страницы по её файлу в экспорте. index.html -> корень сайта."""
    rel = path.relative_to(out_dir).with_suffix("")
    if rel.name == "index":
        rel = rel.parent
    s = str(rel).strip(".")
    return SITE_URL if s in ("", ".") else f"{SITE_URL}/{s}"


def meta_content(doc: str, name: str) -> str | None:
    """Значение <meta name="..."> в любом порядке атрибутов."""
    for m in re.finditer(r"<meta\b[^>]*>", doc, re.I):
        tag = m.group(0)
        n = re.search(r'\bname="([^"]*)"', tag, re.I)
        if n and n.group(1).lower() == name.lower():
            c = re.search(r'\bcontent="([^"]*)"', tag, re.I)
            return html.unescape(c.group(1)) if c else ""
    return None


def collect_pages(out_dir: pathlib.Path) -> list[pathlib.Path]:
    pages = sorted(p for p in out_dir.rglob("*.html") if p.stem not in EXCLUDED_STEMS)
    return pages


def parse_frontmatter(text: str) -> dict[str, str]:
    """Плоский key: value — тот же формат, что читает lib/markdown.ts."""
    if not text.startswith("---"):
        return {}
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    if not m:
        return {}
    fm: dict[str, str] = {}
    for line in m.group(1).split("\n"):
        i = line.find(":")
        if i != -1:
            fm[line[:i].strip()] = line[i + 1 :].strip()
    return fm


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "out"))
    ap.add_argument("--content", default=str(ROOT / "content" / "blog"))
    args = ap.parse_args()

    out_dir = pathlib.Path(args.out)
    content_dir = pathlib.Path(args.content)

    if not out_dir.is_dir():
        print(f"seo-check: каталога {out_dir} нет — сначала `npm run build`", file=sys.stderr)
        return 2

    problems: list[str] = []
    notes: list[str] = []

    pages = collect_pages(out_dir)
    if not pages:
        print(f"seo-check: в {out_dir} нет html-страниц", file=sys.stderr)
        return 2

    # --- 1-4: метаданные страниц -------------------------------------------
    titles: dict[str, list[str]] = {}
    descs: dict[str, list[str]] = {}

    for p in pages:
        url = page_url(p, out_dir)
        doc = p.read_text(encoding="utf-8", errors="replace")

        t = re.search(r"<title>(.*?)</title>", doc, re.S | re.I)
        title = html.unescape(t.group(1)).strip() if t else ""
        if not title:
            problems.append(f"[title] {url}: пустой или отсутствует")
        else:
            titles.setdefault(title, []).append(url)

        desc = meta_content(doc, "description")
        if not desc:
            problems.append(f"[description] {url}: пустой или отсутствует")
        else:
            descs.setdefault(desc.strip(), []).append(url)

        h1 = re.findall(r"<h1\b[^>]*>", doc, re.I)
        if len(h1) != 1:
            problems.append(f"[h1] {url}: найдено {len(h1)}, должен быть ровно 1")

        c = re.search(r'<link\b[^>]*\brel="canonical"[^>]*>', doc, re.I)
        if not c:
            problems.append(f"[canonical] {url}: отсутствует")
        else:
            href = re.search(r'\bhref="([^"]*)"', c.group(0), re.I)
            canon = html.unescape(href.group(1)).rstrip("/") if href else ""
            if canon != url.rstrip("/"):
                problems.append(f"[canonical] {url}: указывает на {canon}")

    for title, urls in titles.items():
        if len(urls) > 1:
            problems.append(f"[title] дубль {title!r}: {', '.join(urls)}")
    for desc, urls in descs.items():
        if len(urls) > 1:
            problems.append(f"[description] дубль на {len(urls)} страницах: {', '.join(urls)}")

    # --- 5: sitemap в обе стороны ------------------------------------------
    sm_path = out_dir / "sitemap.xml"
    if not sm_path.is_file():
        problems.append("[sitemap] out/sitemap.xml отсутствует")
    else:
        try:
            locs = {
                (e.text or "").strip().rstrip("/")
                for e in ET.parse(sm_path).getroot().iter(f"{SITEMAP_NS}loc")
            }
        except ET.ParseError as e:
            problems.append(f"[sitemap] невалидный XML: {e}")
            locs = set()
        page_urls = {page_url(p, out_dir).rstrip("/") for p in pages}
        for u in sorted(page_urls - locs):
            problems.append(f"[sitemap] страница есть, в карте нет: {u}")
        for u in sorted(locs - page_urls):
            problems.append(f"[sitemap] в карте есть, страницы нет: {u}")

    # --- 6: целостность внутренних ссылок ----------------------------------
    md_files = sorted(content_dir.glob("*.md")) if content_dir.is_dir() else []
    slugs = {f.stem for f in md_files}
    for f in md_files:
        body = f.read_text(encoding="utf-8", errors="replace")
        for target in re.findall(r"\]\(/blog/([A-Za-z0-9_-]+)", body):
            if target not in slugs:
                problems.append(f"[ссылка] {f.name}: /blog/{target} не существует")

    # --- 6a: круглые скобки в адресах ссылок --------------------------------
    # Парсер ссылок в lib/markdown.ts читает адрес как [^)]+ — первая же
    # закрывающая скобка обрывает href. DOI вида 10.1016/S0140-6736(16)31140-0
    # молча превращается в битую ссылку с хвостом в виде текста.
    for f in md_files:
        body = f.read_text(encoding="utf-8", errors="replace")
        for label, href in re.findall(r"\[([^\]]+)\]\(([^)]*)\)", body):
            if "(" in href:
                problems.append(
                    f"[ссылка] {f.name}: адрес «{href}» содержит круглую скобку — "
                    f"парсер оборвёт href на первой закрывающей "
                    f"(ссылка «{label[:40]}»)"
                )

    # --- 7: дубли целевых запросов -----------------------------------------
    queries: dict[str, list[str]] = {}
    for f in md_files:
        fm = parse_frontmatter(f.read_text(encoding="utf-8", errors="replace"))
        q = fm.get("target_query", "").strip().lower()
        if q:
            queries.setdefault(q, []).append(f.stem)
    if not queries:
        notes.append(
            "[запросы] поле target_query во фронтматтере ещё не заполнено — "
            "проверка дублей пропущена (заполняется в фазе 8)"
        )
    else:
        covered = sum(len(v) for v in queries.values())
        if covered < len(md_files):
            notes.append(
                f"[запросы] target_query заполнен у {covered} из {len(md_files)} статей"
            )
        for q, ss in queries.items():
            if len(ss) > 1:
                problems.append(f"[запросы] дубль целевого запроса {q!r}: {', '.join(ss)}")

    # --- отчёт --------------------------------------------------------------
    print(f"seo-check: страниц проверено {len(pages)}, статей {len(md_files)}")
    for n in notes:
        print(f"  · {n}")
    if problems:
        print(f"\n✗ нарушений: {len(problems)}")
        for pr in problems:
            print(f"  {pr}")
        return 1
    print("\n✓ нарушений нет")
    return 0


if __name__ == "__main__":
    sys.exit(main())
