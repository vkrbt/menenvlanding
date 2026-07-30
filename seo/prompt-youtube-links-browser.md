# Промт для Claude Cowork: проставить ссылки на канале самостоятельно через браузер

Вариант для случая, когда Cowork не просто подбирает ссылки, а **сам правит описания**
в YouTube Studio. Список без правки — в `prompt-youtube-links.md`.

**Перед запуском:** войди в свой Google-аккаунт в браузере, которым управляет Cowork,
и открой studio.youtube.com. Логин Cowork делать не должен и учётных данных у него быть не должно.

Скопируй всё после разделителя.

---

Ты работаешь с YouTube-каналом «Мужская среда» — https://www.youtube.com/@men-env.
Это канал закрытого онлайн-сообщества для мужчин 25+ (встречи в Zoom раз в две недели,
ведущие — гештальт-терапевт и психиатр-нарколог). Сайт проекта: `sreda.men`.

Тебе доступен браузер, и я уже авторизован в YouTube Studio. **Задача — не только подобрать
ссылки, но и проставить их самостоятельно** в описания видео и в посты вкладки «Сообщество».

## Зачем это делается

Сайту четыре месяца, у него ноль внешних ссылок, и Google его пока не индексирует. Описания
роликов — единственное место, где ссылку можно поставить без чьей-либо модерации. Восемнадцать
описаний дают восемнадцать **разных** точек входа вглубь блога, поэтому одинаковая ссылка везде
обесценивает всю работу: каждое описание ведёт на свою статью.

## Порядок работы — соблюдай последовательность, не забегай вперёд

**Шаг 1. Инвентаризация.** Открой studio.youtube.com → «Контент». Выпиши все видео: название,
идентификатор, ссылку. Отдельно пройди вкладку «Сообщество» и выпиши посты. Ничего пока не меняй.

**Шаг 2. Бэкап.** Для каждого видео открой описание и **скопируй его текст целиком, как есть**,
в отдельную таблицу. Это единственный способ откатиться, если что-то пойдёт не так. Без бэкапа
к шагу 4 не переходи.

**Шаг 3. План на согласование.** Составь таблицу: видео → подобранная статья → URL → анкор →
точный текст, который будет добавлен. **Покажи её мне и дождись подтверждения.** Не начинай
править до моего «ок».

**Шаг 4. Пилот на одном ролике.** После подтверждения отредактируй **только первое** видео.
Сохрани, открой страницу видео как зритель, убедись, что ссылка на месте, кликабельна и ведёт
куда надо, а главы видео не сломались. **Покажи мне результат и дождись подтверждения.**

**Шаг 5. Остальные.** Только после подтверждения пилота правь остальные — по одному, с проверкой
после каждого. Если YouTube выдаст любое предупреждение, ограничение или капчу — **остановись
и сообщи мне**, не обходи.

**Шаг 6. Отчёт.** См. формат в конце.

## Технические правила правки — нарушение ломает канал

1. **Дописывай в конец описания. Никогда не переписывай его целиком.**
2. **Не трогай таймкоды.** Если в описании есть строки вида `0:00`, `12:34` — это главы видео.
   Любое изменение их порядка или формата ломает главы. Добавляй свой текст **после** них.
3. **Не удаляй существующие ссылки, хештеги и упоминания.** Только добавляй.
4. Перед добавлением проверь, **нет ли в описании ссылки на `sreda.men` уже**. Если есть —
   не добавляй вторую, отметь видео как «уже размещено» и переходи к следующему.
5. Отделяй свой блок от существующего текста пустой строкой.
6. Сохраняй через кнопку «Сохранить» и убеждайся, что появилось подтверждение сохранения.

## Правила содержания — жёсткие

1. **Одна ссылка на `sreda.men` в описании.** Не две.
2. **Ссылка ведёт на статью блога**, формат `https://sreda.men/blog/<slug>`. Никогда — на главную,
   на страницу цен, на форму заявки.
3. **Ни одна статья не повторяется** между описаниями. Если два видео об одном, для второго
   бери смежную статью из каталога.
4. **Цена и стоимость участия не упоминаются** ни словом. Любая сумма превращает описание в рекламу.
5. **Запрещённые формулировки** — ни дословно, ни в пересказе:
   - обещания результата: «избавит от одиночества», «почувствуете облегчение», «результат гарантирован»;
   - диагнозы в адрес зрителя: «у вас депрессия», «это тревожное расстройство»;
   - позиционирование как замены помощи: «замена терапии», «вместо психотерапии», «эффективнее психолога»;
   - самоназвания: «группа поддержки», «терапевтическая группа», «психологическая помощь»;
   - обещания лечения: «вылечим», «поможем справиться с депрессией».
6. **Разрешённые формулировки** — можно копировать: «закрытое онлайн-сообщество для мужчин 25+»,
   «клуб, где мужчины раз в две недели говорят о своём», «сообщество, куда приходят поговорить,
   а не лечиться», «на встречах об этом говорят часто».
7. **Распределение анкоров по всем описаниям вместе:** примерно **8 брендовых**
   («Мужская среда», «сообщество Мужская среда», `sreda.men`), **8 безанкорных** («вот здесь»,
   «в этой статье», «подробный разбор», голый URL), **2 с вхождением ключа** («как проходит
   мужская группа», «мужской круг», «онлайн-сообщество для мужчин»).

   **Отдельный запрет:** анкор «мужская группа поддержки» использовать нельзя, даже если статья
   написана именно под этот запрос. Статья может отвечать на запрос, не называя так себя,
   а анкор назвал бы сообщество «группой поддержки» прямо — это нарушает позиционирование проекта.
8. **Если для видео нет близкой статьи — не подгоняй.** Оставь описание без изменений
   и отметь это в отчёте.
9. Текст живой, одна–две фразы. Без канцелярита и без «в данной статье вы узнаете».

## Что вернуть в отчёте

**Таблица результата:**

| № | Видео | Идентификатор | Статья (slug) | URL | Анкор | Тип анкора | Статус |
|---|---|---|---|---|---|---|---|

Статус: `проставлено`, `уже было`, `пропущено — нет подходящей статьи`, `ошибка`.

**Бэкап описаний** — отдельной таблицей: видео и исходный текст описания до правки.

**Строки для трекера** в формате TSV, чтобы я вставил их в `seo/linkbuilding-tracker.tsv`.
Колонки по порядку, разделитель — табуляция:

```
date	platform	post_url	link_type	anchor	anchor_type	target_url	indexed	visits_30d	goals_30d	note
```

`platform` — `youtube.com`, `link_type` — `nofollow`, `indexed` — `pending`,
`visits_30d` и `goals_30d` оставь пустыми.

**Сводка:** сколько проставлено, сколько пропущено и почему; сходится ли распределение анкоров
с 8/8/2; **какие темы каталога остались не использованы** — это подсказка, о чём снимать
следующий ролик.

## Каталог статей

Всего 124 статей. URL в последней колонке готов к вставке — собирать из slug не нужно.

| # | Тема | Целевой запрос статьи | URL для вставки |
|---|---|---|---|
| 1 | Достижения | добился всего но нет счастья | `https://sreda.men/blog/dobilsya-vsego-no-net-schastya` |
| 2 | Достижения | синдром самозванца у мужчин | `https://sreda.men/blog/sindrom-samozvanca-u-muzhchin` |
| 3 | Достижения | токсичная продуктивность | `https://sreda.men/blog/toksichnaya-produktivnost` |
| 4 | Достижения | трудоголизм | `https://sreda.men/blog/trudogolizm` |
| 5 | Достижения | устал от саморазвития | `https://sreda.men/blog/ustal-ot-samorazvitiya` |
| 6 | Достижения | хочу всё бросить и уехать | `https://sreda.men/blog/hochu-vse-brosit-i-uehat` |
| 7 | Зависимости | зависимость от ставок на спорт | `https://sreda.men/blog/stavki-na-sport` |
| 8 | Зависимости | игровая зависимость у взрослых | `https://sreda.men/blog/igrovaya-zavisimost` |
| 9 | Зависимости | порнозависимость | `https://sreda.men/blog/pornozavisimost` |
| 10 | Зависимости | пью каждый вечер | `https://sreda.men/blog/alkogol-kazhdyy-vecher` |
| 11 | Злость | вспыльчивость у мужчин | `https://sreda.men/blog/vspylchivost-u-muzhchin` |
| 12 | Злость | всё бесит и раздражает | `https://sreda.men/blog/vse-besit-i-razdrazhaet` |
| 13 | Злость | как перестать копить злость в себе | `https://sreda.men/blog/kak-perestat-kopit-zlobu` |
| 14 | Злость | как перестать срываться | `https://sreda.men/blog/kak-perestat-sryvatsya` |
| 15 | Злость | как перестать срываться на близких | `https://sreda.men/blog/kak-perestat-sryvatsya-na-blizkih` |
| 16 | Злость | как перестать срываться на окружающих | `https://sreda.men/blog/kak-perestat-sryvatsya-na-okruzhayushchih` |
| 17 | Тревога | воскресная тревога | `https://sreda.men/blog/voskresnaya-trevoga` |
| 18 | Тревога | панические атаки у мужчин | `https://sreda.men/blog/panicheskie-ataki-u-muzhchin` |
| 19 | Тревога | просыпаюсь в 4 утра | `https://sreda.men/blog/prosypayus-v-4-utra` |
| 20 | Тревога | тревога и потребность всё контролировать | `https://sreda.men/blog/trevoga-i-kontrol` |
| 21 | Тревога | тревожность у мужчин | `https://sreda.men/blog/trevozhnost-u-muzhchin` |
| 22 | Тревога | финансовая тревога | `https://sreda.men/blog/trevoga-o-dengah` |
| 23 | Апатия | апатия у мужчин | `https://sreda.men/blog/apatiya-u-muzhchin` |
| 24 | Апатия | живу на автопилоте | `https://sreda.men/blog/zhivu-na-avtopilote` |
| 25 | Апатия | нет сил ни на что | `https://sreda.men/blog/net-sil-ni-na-chto` |
| 26 | Апатия | ничего не радует | `https://sreda.men/blog/nichego-ne-raduet` |
| 27 | Апатия | ничего не хочется | `https://sreda.men/blog/nichego-ne-hochetsya` |
| 28 | Апатия | потерял интерес к жизни | `https://sreda.men/blog/poteryal-interes-k-zhizni` |
| 29 | Внимание | думскроллинг | `https://sreda.men/blog/doomscrolling` |
| 30 | Внимание | информационная перегрузка | `https://sreda.men/blog/informatsionnaya-peregruzka` |
| 31 | Внимание | не могу сосредоточиться | `https://sreda.men/blog/ne-mogu-sosredotochitsya` |
| 32 | Внимание | постоянно отвлекаюсь на телефон | `https://sreda.men/blog/postoyanno-otvlekayus-na-telefon` |
| 33 | Внимание | прокрастинация у мужчин | `https://sreda.men/blog/prokrastinatsiya-u-muzhchin` |
| 34 | Внимание | сдвг у взрослых мужчин | `https://sreda.men/blog/sdvg-u-vzroslyh-muzhchin` |
| 35 | Развод | как не спиться после развода | `https://sreda.men/blog/kak-ne-spitsya-posle-razvoda` |
| 36 | Развод | как пережить развод мужчине | `https://sreda.men/blog/kak-perezhit-razvod` |
| 37 | Развод | кто тяжелее переживает расставание | `https://sreda.men/blog/kto-tyazhelee-perezhivaet-rasstavanie` |
| 38 | Развод | новые отношения после развода | `https://sreda.men/blog/novye-otnosheniya-posle-razvoda` |
| 39 | Развод | отец после развода и дети | `https://sreda.men/blog/otec-posle-razvoda` |
| 40 | Развод | развёлся с женой что делать | `https://sreda.men/blog/razvelsya-s-zhenoy-chto-delat` |
| 41 | Развод | расстался с девушкой | `https://sreda.men/blog/rasstalsya-s-devushkoy` |
| 42 | Выгорание | выгорание у мужчин | `https://sreda.men/blog/vygoranie-u-muzhchin` |
| 43 | Выгорание | выгорел на работе что делать | `https://sreda.men/blog/vygorel-na-rabote` |
| 44 | Выгорание | голова не выключается | `https://sreda.men/blog/mozg-ne-otdyhaet` |
| 45 | Выгорание | не умею отдыхать | `https://sreda.men/blog/ne-mogu-rasslabitsya` |
| 46 | Выгорание | постоянная усталость | `https://sreda.men/blog/postoyannaya-ustalost` |
| 47 | Выгорание | стадии выгорания | `https://sreda.men/blog/stadii-vygoraniya` |
| 48 | Отношения с партнёршей | бьёт значит любит | `https://sreda.men/blog/bet-znachit-lyubit` |
| 49 | Отношения с партнёршей | не чувствую близости с женой | `https://sreda.men/blog/ne-chuvstvuyu-blizosti-s-zhenoy` |
| 50 | Отношения с партнёршей | перестали разговаривать с женой | `https://sreda.men/blog/perestali-razgovarivat-s-zhenoy` |
| 51 | Отношения с партнёршей | постоянные ссоры в браке | `https://sreda.men/blog/postoyannye-ssory-v-brake` |
| 52 | Отношения с партнёршей | пропало желание в отношениях | `https://sreda.men/blog/propalo-zhelanie-v-otnosheniyah` |
| 53 | Отношения с партнёршей | ревность у мужчин | `https://sreda.men/blog/revnost-u-muzhchin` |
| 54 | Отношения с партнёршей | характер и отношения у мужчин | `https://sreda.men/blog/harakter-i-otnosheniya-u-muzhchin` |
| 55 | Депрессия | депрессия у мужчин признаки | `https://sreda.men/blog/depressiya-u-muzhchin-priznaki` |
| 56 | Депрессия | сезонная депрессия | `https://sreda.men/blog/sezonnaya-depressiya` |
| 57 | Эмиграция | как найти друзей в эмиграции мужчине | `https://sreda.men/blog/kak-nayti-druzey-v-emigracii` |
| 58 | Эмиграция | одиночество в эмиграции | `https://sreda.men/blog/odinochestvo-v-emigracii` |
| 59 | Эмиграция | потерял себя после переезда | `https://sreda.men/blog/poteryal-sebya-posle-pereezda` |
| 60 | Эмиграция | работа не по специальности после переезда | `https://sreda.men/blog/rabota-ne-po-specialnosti-posle-pereezda` |
| 61 | Эмиграция | тоска по дому у мужчин | `https://sreda.men/blog/toska-po-domu-u-muzhchin` |
| 62 | Эмиграция | эмигрантская депрессия у мужчин | `https://sreda.men/blog/emigrantskaya-depressiya` |
| 63 | Эмиграция | этапы адаптации в эмиграции | `https://sreda.men/blog/etapy-adaptacii-v-emigracii` |
| 64 | Отцовство | как быть отцом если своего не было | `https://sreda.men/blog/kak-byt-otcom-esli-svoego-ne-bylo` |
| 65 | Отцовство | мужская послеродовая депрессия | `https://sreda.men/blog/muzhskaya-poslerodovaya-depressiya` |
| 66 | Отцовство | отношения отца с младенцем | `https://sreda.men/blog/ottsovstvo-kachestvo-otnosheniy-mladentsem` |
| 67 | Отцовство | отпуск по уходу за ребёнком для отца | `https://sreda.men/blog/otpusk-po-uhodu-dlya-otca` |
| 68 | Отцовство | стал отцом и накрыло | `https://sreda.men/blog/stal-otcom-i-nakrylo` |
| 69 | Отцовство | сын не вписывается в мужские рамки | `https://sreda.men/blog/syn-ne-vpisyvaetsya-v-ramki` |
| 70 | Отцовство | устал от отцовства | `https://sreda.men/blog/ustal-ot-otcovstva` |
| 71 | Формат и сообщество | группа или психолог что выбрать | `https://sreda.men/blog/gruppa-ili-psiholog` |
| 72 | Формат и сообщество | мужская группа онлайн | `https://sreda.men/blog/muzhskaya-gruppa-online` |
| 73 | Формат и сообщество | мужская группа поддержки онлайн | `https://sreda.men/blog/muzhskaya-gruppa-podderzhki-online` |
| 74 | Формат и сообщество | мужская терапевтическая группа | `https://sreda.men/blog/muzhskaya-terapevticheskaya-gruppa` |
| 75 | Формат и сообщество | мужской круг что это | `https://sreda.men/blog/muzhskoy-krug-chto-eto` |
| 76 | Формат и сообщество | сколько стоит мужская группа | `https://sreda.men/blog/skolko-stoit-muzhskaya-gruppa` |
| 77 | Формат и сообщество | сообщество для мужчин | `https://sreda.men/blog/soobshchestvo-dlya-muzhchin` |
| 78 | Формат и сообщество | страшно идти в группу | `https://sreda.men/blog/strashno-idti-v-gruppu` |
| 79 | Одиночество и дружба | игры и одиночество у мужчин | `https://sreda.men/blog/igry-i-odinochestvo` |
| 80 | Одиночество и дружба | как восстановить старую дружбу | `https://sreda.men/blog/kak-vosstanovit-staruyu-druzhbu` |
| 81 | Одиночество и дружба | как найти друзей взрослому мужчине | `https://sreda.men/blog/kak-nayti-druzey-vzroslomu-muzhchine` |
| 82 | Одиночество и дружба | мужчины не обнимаются и не ходят вдвоём | `https://sreda.men/blog/muzhskaya-druzhba-i-blizost` |
| 83 | Одиночество и дружба | не с кем поговорить о проблемах | `https://sreda.men/blog/ne-s-kem-pogovorit` |
| 84 | Одиночество и дружба | нет друзей после 30 | `https://sreda.men/blog/net-druzey-posle-30` |
| 85 | Одиночество и дружба | одиночество в браке | `https://sreda.men/blog/odinochestvo-v-brake` |
| 86 | Одиночество и дружба | почему мужская дружба распадается | `https://sreda.men/blog/pochemu-muzhskaya-druzhba-raspadaetsya` |
| 87 | Одиночество и дружба | почему мужчины избегают прикосновений | `https://sreda.men/blog/pochemu-muzhchiny-izbegayut-prikosnoveniy` |
| 88 | Одиночество и дружба | почему у мужчин нет близких друзей | `https://sreda.men/blog/pochemu-u-muzhchin-net-blizkih-druzey` |
| 89 | Кризис середины жизни | вторая половина жизни у мужчин | `https://sreda.men/blog/vtoraya-polovina-zhizni` |
| 90 | Кризис середины жизни | карьерный тупик в 40 | `https://sreda.men/blog/karernyy-tupik-v-40` |
| 91 | Кризис середины жизни | кризис 40 лет у мужчин | `https://sreda.men/blog/krizis-40-let-u-muzhchin` |
| 92 | Кризис середины жизни | кризис среднего возраста у мужчин | `https://sreda.men/blog/krizis-srednego-vozrasta-u-muzhchin` |
| 93 | Кризис середины жизни | не вижу смысла в том что делаю | `https://sreda.men/blog/ne-vizhu-smysla-v-tom-chto-delayu` |
| 94 | Роль добытчика | зарабатываю меньше жены | `https://sreda.men/blog/zarabatyvayu-menshe-zheny` |
| 95 | Роль добытчика | ловушка кормильца | `https://sreda.men/blog/lovushka-kormiltsa` |
| 96 | Роль добытчика | не могу обеспечить семью | `https://sreda.men/blog/ne-mogu-obespechit-semyu` |
| 97 | Роль добытчика | потерял работу мужчина как пережить | `https://sreda.men/blog/poteryal-rabotu-kak-perezhit` |
| 98 | Роль добытчика | страх бедности у мужчин | `https://sreda.men/blog/strah-bednosti-u-muzhchin` |
| 99 | Для близких | как помочь другу в депрессии | `https://sreda.men/blog/kak-pomoch-drugu-v-depressii` |
| 100 | Для близких | как уговорить мужа пойти к психологу | `https://sreda.men/blog/kak-ugovorit-muzha-k-psihologu` |
| 101 | Для близких | муж в депрессии что делать | `https://sreda.men/blog/muzh-v-depressii` |
| 102 | Для близких | муж замкнулся в себе | `https://sreda.men/blog/muzh-zamknulsya` |
| 103 | Для близких | муж не разговаривает со мной по душам | `https://sreda.men/blog/muzh-ne-razgovarivaet-po-dusham` |
| 104 | Для близких | муж стал раздражительным и агрессивным | `https://sreda.men/blog/muzh-stal-razdrazhitelnym` |
| 105 | Исследования | исследования мужской дружбы | `https://sreda.men/blog/issledovaniya-muzhskoy-druzhby` |
| 106 | Исследования | исследования о мужчинах и психике | `https://sreda.men/blog/issledovaniya-o-muzhchinah-i-psihike` |
| 107 | Исследования | исследования об отцовстве | `https://sreda.men/blog/issledovaniya-ob-otcovstve` |
| 108 | Исследования | исследования однополых пар | `https://sreda.men/blog/issledovaniya-odnopolyh-par` |
| 109 | Исследования | красота за статус в браке | `https://sreda.men/blog/krasota-za-status-v-brake` |
| 110 | Исследования | маскулинные нормы исследования | `https://sreda.men/blog/maskulinnye-normy-issledovaniya` |
| 111 | Исследования | мужское ментальное здоровье статистика | `https://sreda.men/blog/muzhskoe-mentalnoe-zdorovie-v-cifrah` |
| 112 | Исследования | почему мужчины скрывают эмоции | `https://sreda.men/blog/pochemu-muzhchiny-skryvayut-emocii` |
| 113 | Исследования | психолог мужчина или женщина | `https://sreda.men/blog/psiholog-muzhchina-ili-zhenshchina` |
| 114 | Психосоматика | болит а анализы в норме | `https://sreda.men/blog/bolit-a-analizy-v-norme` |
| 115 | Психосоматика | боль в спине от стресса | `https://sreda.men/blog/bol-v-spine-ot-stressa` |
| 116 | Психосоматика | ком в горле и тяжесть в груди | `https://sreda.men/blog/kom-v-gorle-i-tyazhest-v-grudi` |
| 117 | Психосоматика | проблемы с потенцией на фоне стресса | `https://sreda.men/blog/problemy-s-potentsiey-ot-stressa` |
| 118 | Психосоматика | психосоматика у мужчин | `https://sreda.men/blog/psihosomatika-u-muzhchin` |
| 119 | Стигма и помощь | как попросить о помощи мужчине | `https://sreda.men/blog/kak-poprosit-o-pomoshchi` |
| 120 | Стигма и помощь | мужчине не принято жаловаться | `https://sreda.men/blog/muzhchine-ne-prinyato-zhalovatsya` |
| 121 | Стигма и помощь | почему мужчины не обращаются за помощью | `https://sreda.men/blog/pochemu-muzhchiny-ne-obrashchayutsya-za-pomoshchyu` |
| 122 | Стигма и помощь | приложения для психического здоровья мужчинам | `https://sreda.men/blog/prilozheniya-dlya-mentalnogo-zdorovya` |
| 123 | Стигма и помощь | сам справлюсь почему не работает | `https://sreda.men/blog/sam-spravlyus-pochemu-ne-rabotaet` |
| 124 | Стигма и помощь | стыдно идти к психологу мужчине | `https://sreda.men/blog/stydno-idti-k-psihologu` |
