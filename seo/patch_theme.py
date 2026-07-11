#!/usr/bin/env python3
"""Inject theme support into static HTML pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

THEME_INIT = '  <script src="/scripts/theme-init.js"></script>\n'

THEME_TOGGLE = """      <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Тема: как в системе" title="Тема оформления">
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
"""

THEME_JS = '  <script src="/scripts/theme.js"></script>\n'


def patch_html(text: str) -> str:
    if "theme-init.js" not in text:
        text = text.replace(
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n',
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' + THEME_INIT,
            1,
        )

    if 'id="theme-toggle"' not in text:
        text = re.sub(
            r'(<div class="nav__end">\s*\n)',
            r"\1" + THEME_TOGGLE + "\n",
            text,
            count=1,
        )

    if "/scripts/theme.js" not in text:
        text = re.sub(
            r'\n(\s*</footer>)\n(\s*<script src="(?:\.\./)?scripts/main\.js"></script>)',
            r'\n\1\n\n  <script src="/scripts/theme.js"></script>\n\2',
            text,
            count=1,
        )

    return text


def main() -> None:
    paths = [
        ROOT / "index.html",
        ROOT / "book.html",
        ROOT / "muzhskaya_sreda_books.html",
        ROOT / "blog" / "index.html",
        *sorted((ROOT / "blog").glob("*.html")),
    ]
    seen: set[Path] = set()
    for path in paths:
        if not path.exists() or path in seen:
            continue
        seen.add(path)
        original = path.read_text(encoding="utf-8")
        updated = patch_html(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            print(f"patched {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
