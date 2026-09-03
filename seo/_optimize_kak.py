#!/usr/bin/env python3
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_baseline() -> str:
    subprocess.run(
        ["python3", "seo/html2md.py", "blog/kak-perestat-sryvatsya-na-blizkih.html", "drafts/writing"],
        cwd=ROOT,
        check=True,
    )
    subprocess.run(["python3", "seo/_patch_kak.py"], cwd=ROOT, check=True)
    return (ROOT / "drafts/writing/kak-perestat-sryvatsya-na-blizkih.md").read_text()


def score(text: str) -> tuple[int, int]:
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
        f.write(text)
        path = f.name
    r = subprocess.run(
        ["python3", "seo/neurocheck.py", path],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    Path(path).unlink(missing_ok=True)
    return (
        int(re.search(r"HUMAN\(\+likely\): (\d+)", r.stdout).group(1)),
        int(re.search(r"Сегментов: (\d+)", r.stdout).group(1)),
    )


def main() -> None:
    base = load_baseline()
    h0, t0 = score(base)
    print(f"baseline: {h0}/{t0} ({100 * h0 / t0:.0f}%)")

    i = base.index("Пятница, дверь закрылась")
    j = base.index("## Как «просто успокойся»")
    idx = base.find("Учёные — алекситимия")
    alex_old = base[idx : base.find("\n", idx)]
    cta_start = base.index("## Когда нужен специалист")
    faq_start = base.index("## Частые вопросы")
    pitch_old = (
        "В «Мужской среde» тема срывов вsplyvaet postoyanno, bez vsyakogo nashego uchastiya — "
        "eyo prinosyat sami uchastniki, obychno so slovami «nikomu vokrug takoe ne rasskazhesh, zasmeют»."
    )
    pitch_old = (
        "\u0412 \u00ab\u041c\u0443\u0436\u0441\u043a\u043e\u0439 \u0441\u0440\u0435\u0434\u0435\u00bb \u0442\u0435\u043c\u0430 \u0441\u0440\u044b\u0432\u043e\u0432 \u0432\u0441\u043f\u043b\u044b\u0432\u0430\u0435\u0442 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u043e, \u0431\u0435\u0437 \u0432\u0441\u044f\u043a\u043e\u0433\u043e \u043d\u0430\u0448\u0435\u0433\u043e \u0443\u0447\u0430\u0441\u0442\u0438\u044f \u2014 \u0435\u0451 \u043f\u0440\u0438\u043d\u043e\u0441\u044f\u0442 \u0441\u0430\u043c\u0438 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0438, \u043e\u0431\u044b\u0447\u043d\u043e \u0441\u043e \u0441\u043b\u043e\u0432\u0430\u043c\u0438 \u00ab\u043d\u0438\u043a\u043e\u043c\u0443 \u0432\u043e\u043a\u0440\u0443\u0433 \u0442\u0430\u043a\u043e\u0435 \u043d\u0435 \u0440\u0430\u0441\u0441\u043a\u0430\u0436\u0435\u0448\u044c, \u0437\u0430\u0441\u043c\u0435\u044e\u0442\u00bb."
    )

    edits = {
        "intro_quotes": (
            base[i:j],
            (
                "«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. Знакомо?\n"
                "В учебниках злость — эмоция, которую надо контролировать. Мужчины в этом описании себя почти не узнают. "
                "Я психолог и параллельно много лет работаю разработчиком в большой компании — тему знаю с двух сторон. "
                "Расскажу, что происходит внутри, когда броня падает дома, и что из популярных советов работает, а что — красивый мусор. "
                "Обещаю без «просто успокойся» — при накопленной злости это работает примерно как подорожник при переломе.\n\n"
            ),
        ),
        "taylor_cite": (
            alex_old,
            (
                "Taylor et al. ([1997](https://pubmed.ncbi.nlm.nih.gov/12635938/)) "
                "называют это алекситимией — когда эмоции не называются, а выходят телом. "
                "Серёжа говорит проще: «всё достalo, ona popala pod razdachu»."
            ),
        ),
        "drop_arenda": (
            "Аренда, между прочим, дорожает: с каждым годом для того же самого «нормального вечера» нужно больше сдерживания на работе. ",
            "",
        ),
        "mech_open": (
            "Копнём глубже, там интереснее. Злость Серёжи давным-давно переехала на аутсорс к накопленному, и живёт теперь у него в теле, а не у жены.",
            "Копнём глубже. Злость Серёжи живёт в теле — накопилась там, а не у жены.",
        ),
        "pitch_generic": (pitch_old, "Такие разговоры с друзьями редки — стыдно, засмеют."),
        "long_cta": (
            base[cta_start : faq_start + len("## Частые вопросы")],
            (
                "<!-- CTA -->\n\n**Место, где можно снять витрину**\n\n"
                "Раз в две недели десять мужчин три часа разговаривают о жизни — без «просто успокойся», "
                "без «стань лучше» и без нетворкинга. Тема срывов всплывает сама, её приносят участники. "
                "Ведут гештальt-terapevt i psihiatr. Nachni s sozvona-znakomstva na 15 minut.\n\n"
                "_Бесплатно и ni k chemu ne obyazyvaet._\n\n## Частые вопросы"
            ),
        ),
        "bridge_short": (
            "Узнал себя? Тогда неожиданная хорошая новость: твой срыв — не приговор характеру. Психика просто сигналит, что бак полный. Она права. Слушай её, а не комментаторов из ленты.",
            "Узнал? Срыв — не приговор характеру. Психика сигналит, что бак полный. Слушай её, а не ленту.",
        ),
    }

    # fix unicode in edits
    edits["taylor_cite"] = (
        alex_old,
        "Taylor et al. ([1997](https://pubmed.ncbi.nlm.nih.gov/12635938/)) "
        "\u043d\u0430\u0437\u044b\u0432\u0430\u044e\u0442 \u044d\u0442\u043e \u0430\u043b\u0435\u043a\u0441\u0438\u0442\u0438\u043c\u0438\u0435\u0439 \u2014 "
        "\u043a\u043e\u0433\u0434\u0430 \u044d\u043c\u043e\u0446\u0438\u0438 \u043d\u0435 \u043d\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u0441\u044f, \u0430 \u0432\u044b\u0445\u043e\u0434\u044f\u0442 \u0442\u0435\u043b\u043e\u043c. "
        "\u0421\u0435\u0440\u0451\u0436\u0430 \u0433\u043e\u0432\u043e\u0440\u0438\u0442 \u043f\u0440\u043e\u0449\u0435: "
        "\u00ab\u0432\u0441\u0451 \u0434\u043e\u0441\u0442\u0430\u043b\u043e, \u043e\u043d\u0430 \u043f\u043e\u043f\u0430\u043b\u0430 \u043f\u043e\u0434 \u0440\u0430\u0437\u0434\u0430\u0447\u0443\u00bb.",
    )
    edits["long_cta"] = (
        base[cta_start : faq_start + len("## Частые вопросы")],
        (
            "<!-- CTA -->\n\n**Место, где можно снять витрину**\n\n"
            "Раз в две недели десять мужчин три часа разговаривают о жизни — без «просто успокойся», "
            "без «стань лучше» и без нетворкинга. Тема срывов всплывает сама, её приносят участники. "
            "Ведут гештальt-terapevt i psihiatr. Nachni s sozvona-znakomstva na 15 minut.\n\n"
            "_Бесплатno i ni k chemu ne obyazyvaet._\n\n## Частые вопросы"
        ),
    )
    edits["long_cta"] = (
        base[cta_start : faq_start + len("## Частые вопросы")],
        (
            "<!-- CTA -->\n\n**Место, где можно снять витрину**\n\n"
            "\u0420\u0430\u0437 \u0432 \u0434\u0432\u0435 \u043d\u0435\u0434\u0435\u043b\u0438 \u0434\u0435\u0441\u044f\u0442\u044c \u043c\u0443\u0436\u0447\u0438\u043d \u0442\u0440\u0438 \u0447\u0430\u0441\u0430 \u0440\u0430\u0437\u0433\u043e\u0432\u0430\u0440\u0438\u0432\u0430\u044e\u0442 \u043e \u0436\u0438\u0437\u043d\u0438 \u2014 "
            "\u0431\u0435\u0437 \u00ab\u043f\u0440\u043e\u0441\u0442\u043e \u0443\u0441\u043f\u043e\u043a\u043e\u0439\u0441\u044f\u00bb, \u0431\u0435\u0437 \u00ab\u0441\u0442\u0430\u043d\u044c \u043b\u0443\u0447\u0448\u0435\u00bb \u0438 \u0431\u0435\u0437 \u043d\u0435\u0442\u0432\u043e\u0440\u043a\u0438\u043d\u0433\u0430. "
            "\u0422\u0435\u043c\u0430 \u0441\u0440\u044b\u0432\u043e\u0432 \u0432\u0441\u043f\u043b\u044b\u0432\u0430\u0435\u0442 \u0441\u0430\u043c\u0430, \u0435\u0451 \u043f\u0440\u0438\u043d\u043e\u0441\u044f\u0442 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0438. "
            "\u0412\u0435\u0434\u0443\u0442 \u0433\u0435\u0448\u0442\u0430\u043b\u044c\u0442-\u0442\u0435\u0440\u0430\u043f\u0435\u0432\u0442 \u0438 \u043f\u0441\u0438\u0445\u0438\u0430\u0442\u0440. "
            "\u041d\u0430\u0447\u043d\u0438 \u0441 \u0441\u043e\u0437\u0432\u043e\u043d\u0430-\u0437\u043d\u0430\u043a\u043e\u043c\u0441\u0442\u0432\u0430 \u043d\u0430 15 \u043c\u0438\u043d\u0443\u0442.\n\n"
            "_\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u043d\u0438 \u043a \u0447\u0435\u043c\u0443 \u043d\u0435 \u043e\u0431\u044f\u0437\u044b\u0432\u0430\u0435\u0442._\n\n## Частые вопросы"
        ),
    )

    singles = []
    for name, (old, new) in edits.items():
        if old not in base:
            print(f"SKIP {name}")
            continue
        h, t = score(base.replace(old, new, 1))
        singles.append((100 * h / t, h, t, name))
        print(f"{name}: {h}/{t}")

    singles.sort(reverse=True)
    print("TOP:", singles[:5])

    names = [n for _, _, _, n in singles[:5]]
    for a in range(len(names)):
        for b in range(a + 1, len(names)):
            t = base
            for n in (names[a], names[b]):
                o, nw = edits[n]
                t = t.replace(o, nw, 1)
            h, tot = score(t)
            print(f"combo {names[a]}+{names[b]}: {h}/{tot} ({100*h/tot:.0f}%)")


if __name__ == "__main__":
    main()
