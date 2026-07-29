# Инструменты, доступные прогону

Определено 2026-07-29.

| Инструмент | Статус | Где используется |
|---|---|---|
| WebSearch | доступен | Фаза 5 — верификация площадок. Основной инструмент |
| WebFetch | доступен | Фаза 5 — чтение правил площадок по URL |
| MCP Яндекс.Вебмастер | доступен, host `https:sreda.men:443` | Базовая линия (0 ссылок), метрики фазы 8: `get-external-links`, `get-external-links-history`, `get-sqi-history` |
| MCP Яндекс.Метрика | доступен, счётчик 111109205 | Метрики фазы 8: `get-quality-referral-traffic`, `get-referral-full-urls`, `get-referral-conversions`, `get-social-networks-traffic` |
| Context7 | отсутствует | не нужен |
| Скилл `humanizer-ru` | доступен | Фаза 10 — переписывание прозы, если нейродетектор ниже порога |
| `seo/neurocheck.py` | локальный, требует сети до `yandex.ru/lab/neurodetector` | Фаза 10 — гейт человечности |
| `scripts/seo-check.py` | локальный, без внешних зависимостей | Фазы 9 и 10 — регрессия |

## Заблокировано

- MCP claude.ai Gmail и Google Calendar требуют авторизации, в этой сессии недоступны.
  Прогону не нужны.
