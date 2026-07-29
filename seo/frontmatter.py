#!/usr/bin/env python3
"""Разбор и сборка плоского фронтматтера статей.

Формат намеренно простой — `ключ: значение` построчно, без вложенности,
чтобы его одинаково читали и Python-скрипты, и lib/markdown.ts.
"""
from __future__ import annotations

import re

# Без этих полей статья не соберётся корректно
REQUIRED = (
    "slug",
    "title",
    "og_title",
    "description",
    "canonical",
    "author_line",
    "date_line",
    "read_line",
    "date_published",
    "category",
)

# Необязательные: у каждого есть разумный fallback в lib/posts.ts
OPTIONAL = (
    "date_modified",
    "status",
    "card_title",
    "card_desc",
    "card_meta",
    "author_short",
    "og_description",
)


def parse(text: str) -> tuple[dict[str, str], str]:
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
    return fm, text[m.end() :].lstrip("\n")


def dump(fm: dict[str, str], body: str) -> str:
    head = "\n".join(f"{k}: {v}" for k, v in fm.items())
    return f"---\n{head}\n---\n{body}"


def validate(fm: dict[str, str]) -> list[str]:
    """Список проблем; пустой список — статья готова к публикации."""
    problems = [f"нет обязательного поля «{k}»" for k in REQUIRED if not fm.get(k)]

    for k, v in fm.items():
        if "\n" in v:
            problems.append(f"многострочное значение «{k}» — фронтматтер должен быть плоским")

    slug = fm.get("slug", "")
    if slug and not re.fullmatch(r"[a-z0-9-]+", slug):
        problems.append(f"slug «{slug}» содержит недопустимые символы")

    canonical = fm.get("canonical", "")
    if slug and canonical and not canonical.endswith(f"/blog/{slug}"):
        problems.append(f"canonical «{canonical}» не совпадает со slug «{slug}»")

    for k in ("date_published", "date_modified"):
        v = fm.get(k)
        if v and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            problems.append(f"«{k}» должно быть в формате YYYY-MM-DD, а не «{v}»")

    return problems
