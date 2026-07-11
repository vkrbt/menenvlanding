#!/usr/bin/env python3
"""Равномерно расставить даты публикации статей с START по END (включительно)."""
from __future__ import annotations

import re
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASED = ROOT / "drafts" / "released"
WRITING = ROOT / "drafts" / "writing"
BLOG_INDEX = ROOT / "blog" / "index.html"
SITEMAP = ROOT / "sitemap.xml"

START = date(2026, 2, 2)
END = date(2026, 7, 12)

MONTHS_RU = {
    1: "января",
    2: "февраля",
    3: "марта",
    4: "апреля",
    5: "мая",
    6: "июня",
    7: "июля",
    8: "августа",
    9: "сентября",
    10: "октября",
    11: "ноября",
    12: "декабря",
}

sys.path.insert(0, str(ROOT / "seo"))
from md2html import convert, parse_frontmatter  # noqa: E402
from publish import gen_sitemap, collect_dates  # noqa: E402


def ru_date(d: date) -> str:
    return f"{d.day} {MONTHS_RU[d.month]} {d.year}"


def slug_order_from_index() -> list[str]:
    text = BLOG_INDEX.read_text(encoding="utf-8")
    return re.findall(r'href="/blog/([a-z0-9-]+)" class="blog-card"', text)


def evenly_spaced(n: int) -> list[date]:
    if n == 1:
        return [END]
    span = (END - START).days
    return [START + timedelta(days=round(i * span / (n - 1))) for i in range(n)]


def update_md(path: Path, d: date) -> None:
    iso = d.isoformat()
    ru = ru_date(d)
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"^date_published:.*$", f"date_published: {iso}", text, flags=re.M)
    text = re.sub(r"^date_modified:.*$", f"date_modified: {iso}", text, flags=re.M)
    text = re.sub(r"^date_line:.*$", f"date_line: {ru}", text, flags=re.M)
    path.write_text(text, encoding="utf-8")


def update_index(slug_dates: dict[str, date]) -> None:
    text = BLOG_INDEX.read_text(encoding="utf-8")
    for slug, d in slug_dates.items():
        ru = ru_date(d)
        pattern = (
            rf'(<a href="/blog/{re.escape(slug)}" class="blog-card">.*?'
            rf'<span class="blog-card__meta">)(.*? · )([^·]+)( · [^<]+</span>)'
        )

        def repl(m: re.Match[str], _ru: str = ru) -> str:
            return m.group(1) + m.group(2) + _ru + m.group(4)

        text = re.sub(pattern, repl, text, count=1, flags=re.S)
    BLOG_INDEX.write_text(text, encoding="utf-8")


def md_path(slug: str) -> Path | None:
    for folder in (RELEASED, WRITING):
        p = folder / f"{slug}.md"
        if p.exists():
            return p
    return None


def main() -> None:
    slugs = slug_order_from_index()
    dates = evenly_spaced(len(slugs))
    # index.html: сверху новые → первому slug — END, последнему — START
    slug_dates = dict(zip(slugs, reversed(dates)))

    for slug, d in slug_dates.items():
        p = md_path(slug)
        if not p:
            print(f"skip no md: {slug}")
            continue
        update_md(p, d)
        convert(p, ROOT / "blog")
        print(f"{slug}: {d.isoformat()} ({ru_date(d)})")

    update_index(slug_dates)
    today = END.isoformat()
    SITEMAP.write_text(gen_sitemap(collect_dates(), today=END.isoformat()), encoding="utf-8")
    print(f"updated {len(slug_dates)} articles, sitemap, index")


if __name__ == "__main__":
    main()
