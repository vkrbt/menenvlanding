#!/usr/bin/env python3
"""Генерирует content/clusters.json из seo/_core_data.py.

Зачем через JSON: источник правды по кластерам — Python-модуль (из него же
собирается core.md и батчи Wordstat), а сайту нужен TypeScript. Держать два
списка кластеров руками — гарантированное расхождение, поэтому TS читает
сгенерированный JSON.

Запуск: python3 seo/gen_clusters.py
Пересобирать после каждой правки _core_data.py.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

# URL-сегмент рубрики. Латиница — согласованно с остальными адресами блога.
SLUGS = {
    "format": "soobshchestvo",
    "emigration": "emigraciya",
    "loneliness": "odinochestvo",
    "burnout": "vygoranie",
    "apathy": "apatiya",
    "anxiety": "trevoga",
    "anger": "zlost",
    "breakup": "razvod",
    "relatives": "dlya-blizkih",
    "fatherhood": "otcovstvo",
    "achievement": "dostigatorstvo",
    "attention": "vnimanie",
    "stigma": "stigma",
    "midlife": "krizis-srednego-vozrasta",
    "provider": "dengi-i-rabota",
    "couple": "otnosheniya",
    "soma": "telo",
    "research": "issledovaniya",
    "depression": "depressiya",
    "addiction": "zavisimosti",
}

# Вводный текст рубрики. Целевой запрос кластера обязан входить в него дословно —
# это проверяется в seo-check и в чек-листе качества.
LEDES = {
    "format": "Мужская группа поддержки онлайн — формат, о котором чаще всего спрашивают: "
              "что там происходит, кто ведёт, обязательно ли говорить. Здесь собрано всё, "
              "что стоит знать до первой встречи.",
    "emigration": "Эмигрантская депрессия у мужчин накрывает не в первый месяц, а когда "
                  "быт уже налажен. Разборы про адаптацию, потерю статуса и одиночество "
                  "в чужой стране.",
    "loneliness": "Нет друзей после 30 — не личный провал, а статистика. Про то, куда "
                  "девается мужской круг общения и что с этим делать.",
    "burnout": "Выгорание у мужчин легко спутать с усталостью и с ленью. Разбираем, "
               "чем они отличаются, по каким стадиям это разворачивается и что помогает.",
    "apathy": "Ничего не хочется — состояние, за которым может стоять что угодно: "
              "от накопленной усталости до депрессии. Разбираемся, что именно.",
    "anxiety": "Тревожность у мужчин редко выглядит как паника. Чаще — как контроль, "
               "раздражительность и невозможность расслабиться.",
    "anger": "Как перестать срываться — вопрос, который мужчины задают уже после того, "
             "как сорвались. Про упавший порог, накопленный стресс и что реально работает.",
    "breakup": "Как пережить развод мужчине: что происходит на самом деле, какие ошибки "
               "делают почти все и что помогает в первые месяцы.",
    "relatives": "Муж замкнулся в себе, друг перестал отвечать — здесь материалы для тех, "
                 "кто рядом с мужчиной и хочет помочь, не превращаясь в психолога.",
    "fatherhood": "Стал отцом и накрыло — про это почти не говорят. Отцовство глазами "
                  "мужчины: от послеродовой депрессии до усталости от роли.",
    "achievement": "Устал от саморазвития — точка, в которую приходят многие после "
                   "нескольких лет гонки за результатом. Про достигаторство и его цену.",
    "attention": "Не могу сосредоточиться — жалоба, за которой чаще стоит не дефицит "
                 "дисциплины, а перегруз, тревога или недосып.",
    "stigma": "Почему мужчины не обращаются за помощью — вопрос не про характер, "
              "а про усвоенные нормы. Разбираем механику стигмы и что с ней делать.",
    "midlife": "Кризис среднего возраста у мужчин — не про красную машину. "
               "Про переоценку того, что казалось решённым.",
    "provider": "Ловушка кормильца: роль обеспечивающего даёт статус и одновременно "
                "не оставляет права на слабость. Про деньги, работу и самооценку.",
    "couple": "Не чувствую близости с женой — отношения продолжаются, а дистанция растёт. "
              "Материалы про то, что происходит внутри пары.",
    "soma": "Болит, а анализы в норме — частый мужской сценарий: тело говорит за психику. "
            "Про психосоматику без эзотерики.",
    "research": "Исследования о мужчинах и психике: разборы научных работ со ссылками "
                "на первоисточники. Что показывают данные и как это читать.",
    "depression": "Материалы о мужской депрессии. Раздел не пополняется — см. решение Р-003.",
    "addiction": "Материалы о зависимостях у мужчин. Раздел не пополняется — см. решение Р-003.",
}


def load_clusters() -> list[dict]:
    spec = importlib.util.spec_from_file_location("_core_data", pathlib.Path(__file__).parent / "_core_data.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.CLUSTERS


def main() -> int:
    out = []
    for c in load_clusters():
        # Рубрика заводится только у кластеров, за которыми есть статьи
        if not c.get("pillar"):
            continue
        articles = []
        if c["pillar"][2]:
            articles.append(c["pillar"][2])
        articles += [s[2] for s in c["satellites"] if s[2]]
        if not articles:
            continue  # рубрика без единой статьи — пустая страница, не заводим
        key = c["key"]
        out.append({
            "key": key,
            "slug": SLUGS[key],
            "name": c["name"],
            "status": c["status"],
            "stage": c["stage"],
            "pillarQuery": c["pillar"][0],
            "pillarSlug": c["pillar"][2],
            "lede": LEDES[key],
            "articles": articles,
        })

    dst = ROOT / "content" / "clusters.json"
    dst.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total = sum(len(c["articles"]) for c in out)
    print(f"content/clusters.json: рубрик {len(out)}, статей привязано {total}")
    for c in out:
        pillar = "pillar есть" if c["pillarSlug"] else "PILLAR НЕ НАПИСАН"
        print(f"  /blog/tema/{c['slug']:26} {c['name'][:32]:34} статей {len(c['articles']):2}  {pillar}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
