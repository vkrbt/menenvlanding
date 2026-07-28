#!/usr/bin/env python3
"""Публикация: MD → HTML, перенос в drafts/released/, обновление sitemap.xml."""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

from datetime import date

ROOT = Path(__file__).resolve().parents[1]
READY = ROOT / "drafts" / "ready"
RELEASED = ROOT / "drafts" / "released"
WRITING = ROOT / "drafts" / "writing"
BLOG = ROOT / "blog"
SITEMAP = ROOT / "sitemap.xml"

sys.path.insert(0, str(ROOT / "seo"))
from md2html import convert, parse_frontmatter  # noqa: E402


def gen_sitemap(slugs_dates: list[tuple[str, str]], today: str | None = None) -> str:
    today = today or date.today().isoformat()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        f"  <url><loc>https://sreda.men/</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>",
        f"  <url><loc>https://sreda.men/book</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>",
        f"  <url><loc>https://sreda.men/blog/</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>",
    ]
    for slug, lastmod in sorted(slugs_dates, key=lambda x: x[1], reverse=True):
        lines.append(
            f"  <url><loc>https://sreda.men/blog/{slug}</loc>"
            f"<lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>"
        )
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def collect_dates() -> list[tuple[str, str]]:
    dates: dict[str, str] = {}
    for folder in (RELEASED, WRITING):
        if not folder.exists():
            continue
        for md in folder.glob("*.md"):
            fm, _ = parse_frontmatter(md.read_text(encoding="utf-8"))
            slug = fm.get("slug", md.stem)
            dates[slug] = fm.get("date_modified", fm.get("date_published", "2026-07-11"))
    # blog HTML without MD (shouldn't happen)
    for html in BLOG.glob("*.html"):
        if html.stem == "index":
            continue
        dates.setdefault(html.stem, "2026-07-11")
    # В карту сайта попадают только слаги, у которых реально есть страница:
    # черновики из drafts/writing/ иначе дают 404 для поисковика
    return [(slug, d) for slug, d in dates.items() if (BLOG / f"{slug}.html").exists()]


def main() -> None:
    RELEASED.mkdir(parents=True, exist_ok=True)

    md_files = sorted(READY.glob("*.md"))
    kak = WRITING / "kak-perestat-sryvatsya-na-blizkih.md"
    if kak.exists():
        md_files.append(kak)

    for md in md_files:
        convert(md, BLOG)
        print(f"html: {md.stem}")

    for md in READY.glob("*.md"):
        dest = RELEASED / md.name
        if dest.exists():
            dest.unlink()
        shutil.move(str(md), str(dest))
        fm, _ = parse_frontmatter(dest.read_text(encoding="utf-8"))
        fm_text = dest.read_text(encoding="utf-8")
        fm_text = re.sub(r"^status:.*$", "status: released", fm_text, flags=re.M)
        dest.write_text(fm_text, encoding="utf-8")
        print(f"released: {md.name}")

    SITEMAP.write_text(gen_sitemap(collect_dates()), encoding="utf-8")
    print(f"sitemap: {len(collect_dates())} blog URLs")


if __name__ == "__main__":
    main()
