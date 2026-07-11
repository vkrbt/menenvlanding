#!/usr/bin/env python3
"""Сборка blog/<slug>.html из Markdown-черновика с фронтматтером.

Использование:
    python3 seo/md2html.py drafts/ready/<slug>.md
    python3 seo/md2html.py drafts/ready/*.md
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ZHENYA = {
    "@type": "Person",
    "name": "Женя",
    "jobTitle": "Пsихиатр-нарколог, ведущий «Мужской среды»",
    "url": "https://www.instagram.com/evgeny_yakubovskiy/",
}
VLAD = {
    "@type": "Person",
    "name": "Влад",
    "jobTitle": "Гештальт-терапевт, ведущий «Мужской среды»",
    "url": "https://www.instagram.com/vkrbt/",
}
ZHENYA["jobTitle"] = "Психиатр-нарколог, ведущий «Мужской среды»"

FORMS_URL = "https://forms.gle/tvTnJuyBoedpJZ989"


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    if not m:
        return {}, text
    fm: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    body = text[m.end() :]
    return fm, body.lstrip("\n")


def inline_md(s: str) -> str:
    s = html.escape(s, quote=False)

    def link(m: re.Match[str]) -> str:
        label, href = m.group(1), m.group(2)
        label = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", label)
        if href.startswith("http"):
            return f'<a href="{href}" target="_blank" rel="noopener">{label}</a>'
        return f'<a href="{href}">{label}</a>'

    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\\w<])_([^_]+)_(?![\\w>])", r"<em>\1</em>", s)
    return s


def prose_to_html(text: str) -> str:
    lines = text.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()
        if not line:
            i += 1
            continue
        if line.startswith("## "):
            out.append(f"    <h2>{inline_md(line[3:])}</h2>")
        elif line.startswith("### "):
            out.append(f"    <h3>{inline_md(line[4:])}</h3>")
        elif line.startswith("- "):
            items: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(f"      <li>{inline_md(lines[i].strip()[2:])}</li>")
                i += 1
            out.append("    <ul>\n" + "\n".join(items) + "\n    </ul>")
            continue
        else:
            out.append(f"    <p>{inline_md(line)}</p>")
        i += 1
    return "\n\n".join(out)


def split_body(body: str) -> dict[str, str]:
    result = {"prose": body, "cta": "", "faq": "", "note": "", "related": ""}
    rest = body

    def cut(text: str, marker: str) -> tuple[str, str]:
        if marker not in text:
            return text, ""
        a, b = text.split(marker, 1)
        return a.rstrip(), b.lstrip("\n")

    result["prose"], rest = cut(rest, "<!-- CTA -->")
    result["cta"], rest = cut(rest, "## Частые вопросы")
    result["faq"], rest = cut(rest, "<!-- NOTE -->")
    result["note"], rest = cut(rest, "## Читать дальше")
    result["related"] = rest.strip()
    return result


def parse_cta(block: str) -> str:
    if not block.strip():
        return ""
    h3 = p = hint = ""
    for line in block.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("**") and line.endswith("**"):
            h3 = line.strip("*")
        elif line.startswith("_") and line.endswith("_"):
            hint = line.strip("_")
        else:
            p = line
    return f"""    <div class="article__cta">
      <h3>{inline_md(h3)}</h3>
      <p>{inline_md(p)}</p>
      <a href="{FORMS_URL}" class="btn btn--primary">Оставить заявку</a>
      <p class="article__cta-hint">{inline_md(hint)}</p>
    </div>"""


def parse_faq(block: str) -> tuple[str, list[tuple[str, str]]]:
    if not block.strip():
        return "", []
    pairs: list[tuple[str, str]] = []
    html_parts: list[str] = ['    <h2 id="faq">Частые вопросы</h2>', "", '    <div class="article__faq">']
    current_q = None
    buf: list[str] = []

    def flush_a() -> None:
        nonlocal buf, current_q
        if current_q and buf:
            ans = " ".join(buf).strip()
            pairs.append((current_q, ans))
            html_parts.append(f"      <h3>{inline_md(current_q)}</h3>")
            html_parts.append(f"      <p>{inline_md(ans)}</p>")
        buf = []

    for line in block.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("### "):
            flush_a()
            current_q = line[4:]
        elif current_q:
            buf.append(line)
    flush_a()
    html_parts.append("    </div>")
    return "\n".join(html_parts), pairs


def parse_note(block: str) -> str:
    if not block.strip():
        return ""
    paras: list[str] = []
    for line in block.splitlines():
        line = line.strip()
        if line.startswith("> "):
            paras.append(f"      <p>{inline_md(line[2:])}</p>")
        elif line.startswith(">"):
            paras.append(f"      <p>{inline_md(line[1:].strip())}</p>")
    if not paras:
        return ""
    return "    <div class=\"article__note\">\n" + "\n".join(paras) + "\n    </div>"


def parse_related(block: str) -> str:
    if not block.strip():
        return ""
    items: list[str] = []
    for line in block.splitlines():
        line = line.strip()
        m = re.match(r"^- \[([^\]]+)\]\(([^)]+)\)", line)
        if m:
            items.append(
                f'        <li><a href="{m.group(2)}">{inline_md(m.group(1))}</a></li>'
            )
    if not items:
        return ""
    return (
        "    <div class=\"article__related\">\n"
        "      <h2>Читать дальше</h2>\n"
        "      <ul>\n"
        + "\n".join(items)
        + "\n"
        "      </ul>\n"
        "    </div>"
    )


def authors_json(author_line: str) -> list[dict]:
    has_z = "Женя" in author_line
    has_v = "Влад" in author_line
    if has_z and has_v:
        return [VLAD.copy(), ZHENYA.copy()]
    if has_z:
        return [ZHENYA.copy()]
    return [VLAD.copy()]


def h1_title(fm: dict[str, str]) -> str:
    title = fm.get("title", fm.get("og_title", ""))
    if " | " in title:
        return title.split(" | ", 1)[0]
    return title or fm.get("og_title", "")


def breadcrumb_label(h1: str) -> str:
    if len(h1) <= 48:
        return h1
    if ":" in h1:
        return h1.split(":", 1)[0]
    return h1[:45] + "…"


def faq_json_ld(pairs: list[tuple[str, str]]) -> dict | None:
    if not pairs:
        return None
    return {
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in pairs
        ],
    }


def build_page(fm: dict[str, str], body: str, template_path: Path | None) -> str:
    slug = fm.get("slug", "article")
    url = fm.get("canonical", f"https://sreda.men/blog/{slug}")
    title_full = fm.get("title") or f"{h1_title(fm)} | Мужская среда"
    og_title = fm.get("og_title", h1_title(fm))
    desc = fm.get("description", "")
    og_desc = desc
    if template_path and template_path.exists():
        old = template_path.read_text(encoding="utf-8")
        m = re.search(r'<meta property="og:description" content="([^"]*)"', old)
        if m and m.group(1):
            og_desc = m.group(1)

    h1 = h1_title(fm)
    crumb = breadcrumb_label(h1)
    published = fm.get("date_published", "2026-07-10")
    modified = fm.get("date_modified", published)

    parts = split_body(body)
    prose_html = prose_to_html(parts.get("prose", ""))
    cta_html = parse_cta(parts.get("cta", ""))
    faq_html, faq_pairs = parse_faq(parts.get("faq", ""))
    note_html = parse_note(parts.get("note", ""))
    related_html = parse_related(parts.get("related", ""))

    main_chunks = [prose_html]
    if cta_html:
        main_chunks.append(cta_html)
    if faq_html:
        main_chunks.append(faq_html)
    if note_html:
        main_chunks.append(note_html)
    if related_html:
        main_chunks.append(related_html)
    main_body = "\n\n".join(c for c in main_chunks if c)

    authors = authors_json(fm.get("author_line", fm.get("tag", "")))
    graph: list[dict] = [
        {
            "@type": "Article",
            "@id": f"{url}#article",
            "headline": og_title,
            "description": desc[:300] if desc else og_title,
            "inLanguage": "ru",
            "datePublished": published,
            "dateModified": modified,
            "author": authors if len(authors) > 1 else authors[0],
            "publisher": {"@id": "https://sreda.men/#organization"},
            "mainEntityOfPage": url,
            "image": "https://sreda.men/og.png",
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Главная", "item": "https://sreda.men/"},
                {"@type": "ListItem", "position": 2, "name": "Блог", "item": "https://sreda.men/blog/"},
                {"@type": "ListItem", "position": 3, "name": crumb},
            ],
        },
    ]
    faq_ld = faq_json_ld(faq_pairs)
    if faq_ld:
        graph.append(faq_ld)

    ld_json = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)

    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="/scripts/theme-init.js"></script>
  <title>{html.escape(title_full)}</title>
  <meta name="description" content="{html.escape(desc)}" />
  <link rel="canonical" href="{html.escape(url)}" />

  <!-- OG -->
  <meta property="og:title" content="{html.escape(og_title)}" />
  <meta property="og:description" content="{html.escape(og_desc)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{html.escape(url)}" />
  <meta property="og:image" content="https://sreda.men/og.png" />
  <meta property="og:locale" content="ru_RU" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://sreda.men/og.png" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="../styles/main.css" />
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <script type="application/ld+json">
  {ld_json}
  </script>
</head>
<body>

  <header class="nav">
    <a href="/" class="logo" aria-label="Мужская среда">
      <span class="logo-line">МУЖСКАЯ</span>
      <span class="logo-line">СРЕДА</span>
    </a>
    <nav class="nav__links" aria-label="Навигация">
      <a href="/blog/" class="nav__link">Блог</a>
      <a href="/#features" class="nav__link">Что внутри</a>
      <a href="/#testimonials" class="nav__link">Отзывы</a>
      <a href="/#pricing" class="nav__link">Цена</a>
    </nav>
    <div class="nav__end">
      <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Тема: как в системе" title="Тема оформления">
        <svg class="theme-toggle__icon theme-toggle__icon--system" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
        </svg>
        <svg class="theme-toggle__icon theme-toggle__icon--light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
        <svg class="theme-toggle__icon theme-toggle__icon--dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      <a href="{FORMS_URL}" class="btn btn--sm btn--outline nav__cta">Оставить заявку</a>
    </div>
  </header>

  <main class="article">
    <nav class="article__breadcrumbs" aria-label="Хлебные крошки">
      <a href="/">Главная</a> · <a href="/blog/">Блог</a> · {html.escape(crumb)}
    </nav>

    <h1 class="article__title">{html.escape(h1)}</h1>

    <div class="article__meta">
      <span>{html.escape(fm.get("author_line", fm.get("tag", "")))}</span>
      <span>{html.escape(fm.get("date_line", ""))}</span>
      <span>{html.escape(fm.get("read_line", ""))}</span>
    </div>

{main_body}
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <a href="/" class="logo" aria-label="Мужская среда">
        <span class="logo-line">МУЖСКАЯ</span>
        <span class="logo-line">СРЕДА</span>
      </a>
      <a href="https://www.youtube.com/@men-env" target="_blank" rel="noopener noreferrer" class="footer__yt" aria-label="YouTube канал">
        <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="22" height="16" rx="4" fill="#FF0000"/>
          <path d="M9 5l6 3-6 3V5z" fill="white"/>
        </svg>
        youtube.com/@men-env
      </a>
      <p class="footer__copy">© <span id="footer-year"></span> Мужская среда</p>
    </div>
  </footer>

  <script src="/scripts/theme.js"></script>
  <script src="../scripts/main.js"></script>
</body>
</html>
"""


def convert(md_path: Path, out_dir: Path) -> Path:
    fm, body = parse_frontmatter(md_path.read_text(encoding="utf-8"))
    slug = fm.get("slug", md_path.stem)
    template = out_dir / f"{slug}.html" if (out_dir / f"{slug}.html").exists() else None
    html_out = build_page(fm, body, template)
    out_path = out_dir / f"{slug}.html"
    out_path.write_text(html_out, encoding="utf-8")
    return out_path


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    root = Path(__file__).resolve().parents[1]
    out_dir = root / "blog"
    for arg in sys.argv[1:]:
        p = Path(arg)
        if not p.exists():
            print(f"skip missing: {p}")
            continue
        out = convert(p, out_dir)
        print(out.name)


if __name__ == "__main__":
    main()
