#!/usr/bin/env python3
"""Публикация статьи: drafts/ready/<slug>.md → content/blog/<slug>.md.

HTML и sitemap.xml больше здесь не собираются — это делает Next при `npm run build`
из content/blog/. Задача скрипта сузилась до проверки фронтматтера и переноса файла,
чтобы битая статья не доехала до сборки.

Использование:
    python3 seo/publish.py            # опубликовать всё из drafts/ready/
    python3 seo/publish.py --check    # только проверить, ничего не двигать
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from frontmatter import dump, parse, validate  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
READY = ROOT / "drafts" / "ready"
CONTENT = ROOT / "content" / "blog"


def check_all() -> int:
    """Проверить уже опубликованное — ловит статьи, сломанные ручной правкой."""
    total = 0
    problems = 0
    for md in sorted(CONTENT.glob("*.md")):
        total += 1
        fm, _ = parse(md.read_text(encoding="utf-8"))
        issues = validate(fm)
        if issues:
            problems += 1
            print(f"✗ {md.name}")
            for i in issues:
                print(f"    {i}")
    if not problems:
        print(f"✓ все {total} статей в content/blog/ корректны")
    return problems


def publish() -> int:
    CONTENT.mkdir(parents=True, exist_ok=True)
    drafts = sorted(READY.glob("*.md"))

    if not drafts:
        print("в drafts/ready/ пусто — публиковать нечего")
        return 0

    # Сначала проверяем всё, и только потом двигаем файлы:
    # иначе половина статей уедет, а половина останется
    staged: list[tuple[Path, dict[str, str], str]] = []
    failed = 0

    for md in drafts:
        fm, body = parse(md.read_text(encoding="utf-8"))
        issues = validate(fm)
        if issues:
            failed += 1
            print(f"✗ {md.name}")
            for i in issues:
                print(f"    {i}")
            continue
        fm["status"] = "released"
        fm.setdefault("date_modified", fm["date_published"])
        staged.append((md, fm, body))

    if failed:
        print(f"\nне опубликовано: {failed}. Исправь и запусти снова — ничего не перенесено")
        return failed

    for md, fm, body in staged:
        slug = fm["slug"]
        (CONTENT / f"{slug}.md").write_text(dump(fm, body), encoding="utf-8")
        md.unlink()
        print(f"✓ {slug}")

    print(f"\nопубликовано: {len(staged)}. Дальше — npm run build")
    return 0


def main() -> None:
    if "--check" in sys.argv:
        sys.exit(1 if check_all() else 0)
    sys.exit(1 if publish() else 0)


if __name__ == "__main__":
    main()
