#!/usr/bin/env python3
"""Проверка текста через Яндекс Нейродетектор (yandex.ru/lab/neurodetector).

Использование:
    python3 seo/neurocheck.py <файл.txt|файл.html> [--full]

HTML очищается от тегов автоматически. Печатает статистику и сегменты
с метками AI / LIKELY_AI (--full — показать и человеческие сегменты).
"""
import json
import re
import sys
import urllib.request

API = "https://yandex.ru/lab/neurodetector/api/analyze/text"


def strip_html(html: str) -> str:
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style.*?</style>", " ", html, flags=re.S | re.I)
    html = re.sub(r"</(p|h1|h2|h3|li|blockquote|dd|dt)>", "\n\n", html, flags=re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    html = html.replace("&nbsp;", " ").replace("&amp;", "&").replace("&mdash;", "—")
    html = re.sub(r"[ \t]+", " ", html)
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html.strip()


def analyze(text: str) -> dict:
    req = urllib.request.Request(
        API,
        data=json.dumps({"text": text}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    path = sys.argv[1]
    show_full = "--full" in sys.argv

    with open(path, encoding="utf-8") as f:
        text = f.read()
    if path.endswith((".html", ".htm")):
        text = strip_html(text)

    result = analyze(text)
    if not result.get("ok"):
        print("Ошибка API:", json.dumps(result, ensure_ascii=False))
        sys.exit(2)

    stats = result["results"]["stats"]
    total = stats["segments_count"]
    ai = stats["AI_count"]
    likely_ai = stats["LIKELY_AI_count"]
    human = stats["HUMAN_count"] + stats["LIKELY_HUMAN_count"]
    print(f"Сегментов: {total} | AI: {ai} | LIKELY_AI: {likely_ai} | HUMAN(+likely): {human}")
    verdict = "✅ текст читается как человеческий" if ai + likely_ai == 0 else "⚠️  есть сегменты под подозрением"
    print(f"Вердикт: {verdict}\n")

    for i, seg in enumerate(result["results"]["segments"], 1):
        label = seg["label"]
        if label in ("AI", "LIKELY_AI") or show_full:
            marker = {"AI": "🔴", "LIKELY_AI": "🟡", "LIKELY_HUMAN": "🟢", "HUMAN": "🟢"}[label]
            print(f"{marker} [{i}/{total}] {label} ({seg['len']} симв.)")
            print(seg["text"][:600])
            print("---")


if __name__ == "__main__":
    main()
