#!/usr/bin/env python3
"""Отбор постов menmasculinities под блог sreda.men.

Логика: канонический файл на id (крупнейший по телу) -> должен нести внешние
ссылки (## Ссылки) -> тематический скоринг (мужская психология/одиночество/
дружба/эмоции/отношения/кризисы/здоровье) -> отсев личных дневниковых/книжных/
рекламных постов. Выдаёт JSON-кандидатов со slug/author/tag/date.
"""
import json, re, sys
from pathlib import Path

SRC = Path("telegram/menmasculinities")

# --- тематические сигналы (релевантность сайту) ---
THEMES = {
    "Состояния": ["депресс", "суицид", "самоуб", "тревог", "апати", "выгоран",
                   "психическ", "ментальн", "стресс", "здоров", "терап", "психолог",
                   "уязвим", "эмоци", "чувств", "help-seeking", "обращ", "суицидальн"],
    "Одиночество": ["одиноч", "изоляц", "loneli", "друж", "друг", "принадлеж", "связи"],
    "Отношения": ["отношени", "расстав", "развод", "брак", "партнёр", "партнер",
                   "близост", "интим", "дейтинг", "знаком", "свидан"],
    "Отцовство": ["отцов", "отец", "отц", "папа", "родител", "дети"],
    "Достигаторство": ["работ", "карьер", "успех", "достиж", "самореализ"],
}
# сигналы «личное/книжное/рекламное/чисто теоретическое» — понижают приоритет
NEG = ["sapiens", "реклам", "плакат", "ролик", "сериал", "симпсон", "фильм недел",
       "мой личн", "мою книг", "моя книга", "лекци", "прайд", "5 лет канал",
       "день рожд", "с новым годом", "подкаст", "приглаша", "вебинар", "опрос",
       "прими участие", "исследовани и", "конкурс", "анонс"]
# грубые маркеры мужской психологии/норм здоровья — обязательный минимум релевантности
CORE = ["мужчин", "муж", "маскулин", "парн", "отц", "мальчик"]


def read(f):
    return f.read_text(encoding="utf-8")


def canonical_by_id():
    best = {}
    for f in SRC.glob("*.md"):
        m = re.search(r"^id:\s*(\d+)", read(f), re.M)
        if not m:
            continue
        i = int(m.group(1))
        if i not in best or f.stat().st_size > best[i].stat().st_size:
            best[i] = f
    return best


def translit(s):
    table = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
        "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
    s = s.lower()
    out = "".join(table.get(c, c if c.isalnum() else " ") for c in s)
    words = [w for w in out.split() if w and w not in {"the", "a", "of", "i", "v", "s", "k", "po", "na", "i"}]
    return "-".join(words[:6]).strip("-")


def score(text_l):
    sc, tag = 0, None
    best_tag_hits = 0
    for t, kws in THEMES.items():
        hits = sum(text_l.count(k) for k in kws)
        if hits > best_tag_hits:
            best_tag_hits, tag = hits, t
        sc += hits
    for k in NEG:
        sc -= 4 * text_l.count(k)
    core = sum(text_l.count(k) for k in CORE)
    if core == 0:
        sc -= 10
    return sc, tag or "Состояния"


MEDICAL = {"Состояния"}


def main():
    best = canonical_by_id()
    cands = []
    seen_slug = set()
    for i, f in best.items():
        txt = read(f)
        if "## Ссылки" not in txt:  # нужны внешние источники
            continue
        # тело без фронтматтера
        body = re.sub(r"^---\n.*?\n---\n", "", txt, flags=re.S)
        low = txt.lower()
        title = ""
        mt = re.search(r"^title:\s*\"?\**(.*)", txt, re.M)
        if mt:
            title = mt.group(1).strip().strip('"*')
        # длина тела (без медиа/ссылок секций)
        prose = re.split(r"\n## (Медиа|Ссылки)", body)[0]
        words = len(prose.split())
        if words < 90:  # слишком короткие — нечего переписывать
            continue
        sc, tag = score(low)
        views = 0
        mv = re.search(r'views:\s*"?([\d.]+)(K)?', txt)
        if mv:
            views = float(mv.group(1)) * (1000 if mv.group(2) else 1)
        if sc < 3:
            continue
        slug = translit(title.split(".")[0][:70]) or f"post-{i}"
        slug = re.sub(r"-+", "-", slug)[:60].strip("-")
        base = slug
        n = 2
        while slug in seen_slug:
            slug = f"{base}-{n}"; n += 1
        seen_slug.add(slug)
        author = "Женя" if tag in MEDICAL else "Влад"
        links = re.findall(r"https?://[^\s)]+", txt.split("## Ссылки")[-1])
        cands.append({
            "id": i, "file": str(f), "slug": slug, "title": title[:120],
            "tag": tag, "author": author, "score": round(sc, 1),
            "views": int(views), "words": words, "n_links": len(links),
        })
    cands.sort(key=lambda c: (c["score"], c["views"]), reverse=True)
    # даты — еженедельно по пятницам, продолжая цепочку трекера (последняя 2027-02-19)
    import datetime
    d = datetime.date(2027, 2, 26)
    for c in cands:
        c["date_published"] = d.isoformat()
        d = d + datetime.timedelta(days=7)
    print(json.dumps(cands, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
