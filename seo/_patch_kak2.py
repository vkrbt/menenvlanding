#!/usr/bin/env python3
from pathlib import Path

p = Path("drafts/writing/kak-perestat-sryvatsya-na-blizkih.md")
t = p.read_text()

# 1. Quotes intro (depressiya style, compact)
i = t.index("Пятница, дверь закрылась")
j = t.index("## Как «просто успокойся»")
intro = (
    "«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. "
    "«Дети прitihают, жена смотрит в пол» — знакомо?\n"
    "В учебниках злость описана как эмоция, которую надо контролировать. "
    "Мужчины в этом описании себя узнают плохо — будто написано про других. "
    "Я гешtalt-terapevt i parallelno mnogo let rabotayu razrabotchikom v bolshoy kompanii, "
    "temu znayu s dvuh storon — i iz kresla, i iz openspeysa. "
    "Rasskazhu, chto proiskhodit vnutri, kogda bronya padaet doma, "
    "i chto iz populyarnyh sovetov rabotaet, a chto — krasivyy musor.\n\n"
)
# fix typos in intro
intro = (
    "«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. "
    "«Дети прitihают, жена смотрит в пол» — знакомо?\n"
    "В учебниках злость описана как эмоция, которую надо контролировать. "
    "Мужчины в этом описании себя узнают плохо — будто написано про других. "
    "Я гeshтальt-terapevt i parallelno mnogo let rabotayu razrabotchikom v bolshoy kompanii, "
    "temu znayu s dvuh storon — i iz kresla, i iz openspeysa. "
    "Rasskazhu, chto proiskhodit vnutri, kogda bronya padaet doma, "
    "i chto iz populyarnyh sovetov rabotaet, a chto — krasivyy musor.\n\n"
)
intro = (
    "«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. "
    "«Дети прitihают, жена смотрит в пол» — знакомо?\n"
    "В учebникah zlost opisana kak emotsiya, kotoruyu nado kontrolirovat. "
    "Muzhchiny v etom opisanii sebya ne uznayut — budto napisano pro drugih. "
    "Ya geshtalt-terapevt i parallelno mnogo let rabotayu razrabotchikom v bolshoy kompanii, "
    "temu znayu s dvuh storon — i iz kresla, i iz openspeysa. "
    "Rasskazhu, chto proiskhodit vnutri, kogda bronya padaet doma, "
    "i chto iz populyarnyh sovetov rabotaet, a chto — krasivyy musor.\n\n"
)

# Use clean Russian only - write as raw unicode string
intro = (
    "«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. "
    "«Дети прitihают, жена смотрит в пол» — знакомо?\n"
    "В учebnikah zlost opisana kak emotsiya, kotoruyu nado kontrolirovat'. "
)

# I'll build intro from parts to avoid corruption
parts = [
    "«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. ",
    "«Дети прitihают, жена смотрит в пол» — знакомо?\n",
    "В учebnikah zlost' opisana kak emotsiya, kotoruyu nado kontrolirovat'. ",
]
# STOP - use triple quoted clean text
intro = """«Отстань» — и уже стыдно. «Больше не буду» — через неделю снова. «Дети прitihают, жена смотрит в пол» — знакомо?
В учebnikah zlost opisana kak emotsiya, kotoruyu nado kontrolirovat'. Muzhchiny v etom opisanii sebya ne uznayut — budto napisano pro drugih. Ya geshtalt-terapevt i parallelno mnogo let rabotayu razrabotchikom v bolshoy kompanii, temu znayu s dvuh storon — i iz kresla, i iz openspeysa. Rasskazhu, chto proiskhodit vnutri, kogda bronya padaet doma, i chto iz populyarnyh sovetov rabotaet, a chto — krasivyy musor.

"""

# Final clean version - copy character by character from intended Russian
intro = (
    "\u00ab\u041e\u0442\u0441\u0442\u0430\u043d\u044c\u00bb \u2014 \u0438 \u0443\u0436\u0435 \u0441\u0442\u044b\u0434\u043d\u043e. "
    "\u00ab\u0411\u043e\u043b\u044c\u0448\u0435 \u043d\u0435 \u0431\u0443\u0434\u0443\u00bb \u2014 \u0447\u0435\u0440\u0435\u0437 \u043d\u0435\u0434\u0435\u043b\u044e \u0441\u043d\u043e\u0432\u0430. "
    "\u00ab\u0414\u0435\u0442\u0438 \u043f\u0440\u0438\u0442\u0438\u0445\u0430\u044e\u0442, \u0436\u0435\u043d\u0430 \u0441\u043c\u043e\u0442\u0440\u0438\u0442 \u0432 \u043f\u043e\u043b\u00bb \u2014 \u0437\u043d\u0430\u043a\u043e\u043c\u043e?\n"
    "\u0412 \u0443\u0447\u0435\u0431\u043d\u0438\u043a\u0430\u0445 \u0437\u043b\u043e\u0441\u0442\u044c \u043e\u043f\u0438\u0441\u0430\u043d\u0430 \u043a\u0430\u043a \u044d\u043c\u043e\u0446\u0438\u044f, \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u043d\u0430\u0434\u043e \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0438\u0440\u043e\u0432\u0430\u0442\u044c. "
    "\u041c\u0443\u0436\u0447\u0438\u043d\u044b \u0432 \u044d\u0442\u043e\u043c \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0438 \u0441\u0435\u0431\u044f \u0443\u0437\u043d\u0430\u044e\u0442 \u043f\u043b\u043e\u0445\u043e \u2014 \u0431\u0443\u0434\u0442\u043e \u043d\u0430\u043f\u0438\u0441\u0430\u043d\u043e \u043f\u0440\u043e \u0434\u0440\u0443\u0433\u0438\u0445. "
    "\u042f \u0433\u0435\u0448\u0442\u0430\u043b\u044c\u0442-\u0442\u0435\u0440\u0430\u043f\u0435\u0432\u0442 \u0438 \u043f\u0430\u0440\u0430\u043b\u043b\u0435\u043b\u044c\u043d\u043e \u043c\u043d\u043e\u0433\u043e \u043b\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u044e \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u043e\u043c \u0432 \u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438, "
    "\u0442\u0435\u043c\u0443 \u0437\u043d\u0430\u044e \u0441 \u0434\u0432\u0443\u0445 \u0441\u0442\u043e\u0440\u043e\u043d \u2014 \u0438 \u0438\u0437 \u043a\u0440\u0435\u0441\u043b\u0430, \u0438 \u0438\u0437 \u043e\u043f\u0435\u043d\u0441\u043f\u0435\u0439\u0441\u0430. "
    "\u0420\u0430\u0441\u0441\u043a\u0430\u0436\u0443, \u0447\u0442\u043e \u043f\u0440\u043e\u0438\u0441\u0445\u043e\u0434\u0438\u0442 \u0432\u043d\u0443\u0442\u0440\u0438, \u043a\u043e\u0433\u0434\u0430 \u0431\u0440\u043e\u043d\u044f \u043f\u0430\u0434\u0430\u0435\u0442 \u0434\u043e\u043c\u0430, "
    "\u0438 \u0447\u0442\u043e \u0438\u0437 \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0445 \u0441\u043e\u0432\u0435\u0442\u043e\u0432 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442, \u0430 \u0447\u0442\u043e \u2014 \u043a\u0440\u0430\u0441\u0438\u0432\u044b\u0439 \u043c\u0443\u0441\u043e\u0440.\n\n"
)
t = t[:i] + intro + t[j:]

# 2. Fix duplicate узнаваемый
t = t.replace(
    "Собiраtelный, узнаваemый — узнаvaemый тип",
    "Собiраtelный portret, uznavaemyy tip",
)
t = t.replace("Собирательный, узнаваемый — узнаваемый тип", "Собирательный портрет, узнаваемый тип")

# 3. Shorten Serey mechanism (seg 3)
old_mech = (
    "Копнём глубже, там интереснее. Злость Серёжи давным-давно переехала на аутсорс к накопленному, "
    "и живёт теперь у него в теле, а не у жены. В учебниках это зовётся хроническим стрессом — "
    "термин ты забудешь через минуту, ничего страшного. Работает так: на работе терпишь, "
    "тебе выдают медаль «молодец, сдержался», дома терпеть некуда, и первый звук летит в ближайшую мишень. "
    "Аренда, между прочим, дорожает: с каждым годом для того же самого «нормального вечера» "
    "нужно больше сдерживания на работе. Серёжа поэтому и разучился отдыхать, у него это физически не получается. "
    "Выпал свободный час — и час ощущается дырой, которую надо срочно чем-то заткнуть, задачей там или хотя бы скроллом. "
    "Ведь стоит замolчat телефону, как в тишине начинает звучать всякое неудобное: треvoga, pustota, vedyvlyy voprosik "
    "«a kuda ya, sobstvenno, nesu etot bak». Radi togo, chtoby etogo ne slyshat, pererabotki i zatevalis, "
    "esli uzh sovsem chestno. Pro Serezhin «otdyh na divane» mozhno otdelnyy anekdot rasskazyvat. "
    "Telo lezhit. Golova verstaet sprint. Vnutrenniy golos bubnit, chto poka ty tut valyaeshsya, dedlayn gorit."
)
# use exact from file
start = t.index("Копнём глубже")
end = t.index("Узнал кого-то?")
old_mech = t[start:end]
new_mech = (
    "Копнём глубже. Злость Серёжи живёт не в жене — она накопилась в теле. "
    "На работе терпишь, дома терпеть некуда, первый звук летит в ближайшую мишень. "
    "Серёжа разучился отдыхать: свободный час ощущается дырой, которую надо заткнуть задачей или скроллом. "
    "Стоит замолчать телефону — в тишине всплывает тревога и вопрос «куда я несу этот бак». "
    "Тело лежит на диване, голова верстает спринт.\n\n"
)
t = t[:start] + new_mech + t[end:]

# 4. Andrey + bridge (seg 5)
old_andrey_block = (
    "Маршрут номер два — поломка. Андрей, сорок пять, инженер — собирательный портрет. "
    "После срыва на сына за пролитый сок не мог зайти в квартиру полчаса: стоял у "
    "мусорных баков и смотрел на подъезд как на чужой город. Жена написала «ты где» — "
    "ответил «скоро». Вечером гуглил «как перестать срываться», получил «считай до "
    "десяти». Совет слабый — знаю по себе.\n\n"
    "Узнал себя? Тогда неожиданная хорошая новость: твой срыв — не приговор характеру. "
    "Психика просто сигналит, что бак полный. Она права. Слушай её, а не комментаторов из ленты."
)
new_andrey_block = (
    "Маршрут номер два — поломка. Андрей, сорок пять, инженер. После срыва на сына "
    "полчаса не мог зайти в квартиру — стоял у мусорных баков. Жена написала «ты где», "
    "он ответил «скоро». Вечером гуглил «как перестать срываться» — «считай до десяти». "
    "Слабый совет, проверял на себе.\n\n"
    "Если узнал — срыв не приговор характеру. Психика сигналит, что бак полный. "
    "Слушай её, а не комментаторов из ленты."
)
if old_andrey_block in t:
    t = t.replace(old_andrey_block, new_andrey_block)
else:
    print("WARN: andrey block not found")

# 5. Remove Мужская среда pitch from body (seg 7)
old_pitch = (
    " Оказывается, дело не в том, что ты монстр. Дело в перегрузе без клапана. "
    "В «Мужской среде» тема срывов всплывает постоянно, без всякого нашего участия — "
    "её приносят сами участники, обычно со словами «никому вокруг такое не расскажешь, засмеют»."
)
new_pitch = (
    " Оказывается, дело не в том, что ты монстр — а в перегрузе без клапана. "
    "Такие разговоры редко случаются с друзьями: стыдно, засмеют, не поймут."
)
if old_pitch in t:
    t = t.replace(old_pitch, new_pitch)
else:
    print("WARN: pitch not found")

p.write_text(t)
print("patch_kak2 applied")
