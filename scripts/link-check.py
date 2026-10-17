#!/usr/bin/env python3
"""Перелинковка статьи по правилам seo/architecture.md, раздел 4.

Запуск: python3 scripts/link-check.py <slug> [<slug> ...]

Для каждой статьи проверяет исходящие ссылки (П1, П2, П4, П5, П8) и входящие (П9:
не меньше трёх существующих материалов ссылаются на статью). Код выхода 1, если
хоть одно правило нарушено.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "content" / "blog"
MIN_INCOMING = 3


def main() -> int:
    slugs = sys.argv[1:]
    if not slugs:
        print(__doc__)
        return 2

    clusters = json.loads((ROOT / "content" / "clusters.json").read_text(encoding="utf-8"))
    cluster_of = {a: c["key"] for c in clusters for a in c["articles"]}
    pillar_of = {c["key"]: c["pillarSlug"] for c in clusters}
    format_slugs = set(next(c for c in clusters if c["key"] == "format")["articles"])
    texts = {p.stem: p.read_text(encoding="utf-8") for p in BLOG.glob("*.md")}

    failed = False
    for slug in slugs:
        if slug not in texts:
            print(f"✗ {slug}: статьи нет в content/blog")
            failed = True
            continue
        md = texts[slug]
        out = sorted(set(re.findall(r"\]\(/blog/([a-z0-9-]+)\)", md)) - {slug})
        key = cluster_of.get(slug)
        related = md.split("## Читать дальше", 1)[1].count("\n- ") if "## Читать дальше" in md else 0
        incoming = sorted(s for s, t in texts.items() if s != slug and f"](/blog/{slug})" in t)

        checks = [("П1 исходящих ссылок ≥3", len(out) >= 3, str(len(out)))]
        if key is None:
            checks.append(("статья привязана к кластеру в content/clusters.json", False, "нет"))
        else:
            pillar = pillar_of[key]
            foreign = [s for s in out if cluster_of.get(s) not in (key, "format")]
            checks += [
                (f"П2 ссылка на pillar {pillar}", pillar == slug or pillar in out, ""),
                ("П4 ссылка на кластер format", key == "format" or bool(format_slugs & set(out)), ""),
                ("П5 чужих кластеров ≤2", len(foreign) <= 2, ", ".join(foreign)),
            ]
        checks += [
            ("П8 «Читать дальше» ≤4", related <= 4, str(related)),
            (f"П9 входящих ≥{MIN_INCOMING}", len(incoming) >= MIN_INCOMING, ", ".join(incoming) or "0"),
        ]

        print(f"\n{slug} [{key or '—'}]")
        for name, ok, detail in checks:
            print(f"  {'✓' if ok else '✗'} {name}" + (f": {detail}" if detail else ""))
            failed |= not ok

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
