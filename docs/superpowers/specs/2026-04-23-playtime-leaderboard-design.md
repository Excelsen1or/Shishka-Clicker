# Playtime Leaderboard And Cursor Design

## Goal

Добавить учёт общего времени сессий игрока с записью в Supabase, вывести это время в мета-экране и отдельном топе по времени, обновить визуальную структуру leaderboard в текущем pixel UI и скорректировать поведение кастомного курсора на маленьких и touch-экранах.

## Scope

В рамках этой работы:

- сохраняется общее время игры в отдельном поле рядом с сейвом
- leaderboard получает новый таб по времени в игре
- блок leaderboard визуально перерабатывается без смены дизайн-языка
- meta screen получает новый lifetime-блок со временем в игре
- кастомный курсор уменьшается на маленьких экранах и отключается на touch-устройствах

Вне рамок:

- аналитика по отдельным сессиям
- история онлайна по дням
- серверные cron-задачи
- отдельная таблица presence/analytics

## Data Model

Используется существующая таблица `public.player_saves`.

Добавляется поле:

- `session_seconds_total bigint not null default 0`

Поле хранит накопленное общее время игры в секундах для игрока.

Причина выбора:

- leaderboard и meta могут читать значение напрямую без разбора `save_data`
- не требуется отдельная таблица и дополнительный join
- изменение минимально по отношению к текущему контуру сохранения

## Session Tracking Model

Клиент считает **всё время текущей сессии с момента запуска**, включая фон/свернутое окно.

На клиенте вводится простой runtime-счётчик:

- `sessionStartedAtMs` фиксируется один раз после готовности bootstrap
- `baseSessionSecondsTotal` берётся из последнего известного серверного значения
- текущее значение вычисляется как `base + floor((Date.now() - startedAt)/1000)`

Отправка времени происходит:

- при регулярной синхронизации сейва
- при ручной синхронизации
- при `pagehide` / уходе со страницы

Сервер принимает `sessionSecondsTotal` отдельно от `save_data`.

Правило записи:

- хранится `greatest(existing_session_seconds_total, incoming_session_seconds_total)`

Это защищает от гонок, старых вкладок и повторных запросов, где клиент может прислать устаревшее значение.

## API And Persistence Changes

Меняются текущие пути сохранения без ввода новых endpoints.

### Client

Расширяется payload текущего сохранения:

- `uploadCloudSave(...)` принимает `sessionSecondsTotal`
- `flushLatestSaveOnExit(...)` также отправляет `sessionSecondsTotal`

### Server

Обновляются:

- `api/save.js`
- SQL RPC `save_player_progress`
- fallback legacy query path

Сервер:

- принимает `sessionSecondsTotal`
- записывает его в `player_saves.session_seconds_total`
- возвращает актуальное значение обратно клиенту вместе с save metadata

### Load Path

`api/load.js` должен возвращать `sessionSecondsTotal`, чтобы клиент мог восстановить `baseSessionSecondsTotal` после старта.

## Leaderboard Changes

Текущий leaderboard остаётся в том же месте, но получает новый metric tab:

- `shishki`
- `shards`
- `clicks`
- `time`

### Ranking Rules

Для `time` сортировка идёт по `session_seconds_total desc`, затем по `updated_at desc`.

### Data Source

`api/leaderboard.js` и/или соответствующий Supabase RPC читают `session_seconds_total` напрямую из `player_saves`.

Новый SQL/RPC leaderboard должен уметь возвращать `time_seconds` для быстрой выборки топа.

## Leaderboard UI Redesign

Цель редизайна: сделать leaderboard более цельным, адаптивным и читаемым, без визуального мусора.

### Visual Direction

- сохранить текущий pixel UI
- усилить иерархию: header, табы, строки
- уменьшить ощущение “зажатости”
- убрать лишние декоративные элементы внутри строк

### Structure

Новая панель leaderboard:

- более устойчивый header с текущей категорией и коротким summary
- табы с лучшей адаптацией по ширине
- строки с более ясным разделением имени и значения
- вторичная мета-информация по строке в компактном виде

Для строки leaderboard:

- ранг
- имя игрока
- основное значение
- краткая вторичная подпись: например, “обновлено недавно” / “обновлено N мин назад”

Без:

- лишних иконок в каждой строке
- декоративных бейджей без функционального смысла
- шумных фоновых элементов внутри списка

### Responsiveness

На узких экранах:

- панель не должна упираться в край
- табы должны либо переноситься, либо прокручиваться по горизонтали
- строки должны сохранять читаемость без налезания имени на значение

## Meta Screen Changes

В meta screen добавляется новый блок lifetime-статистики в существующем стиле экрана.

Новый элемент:

- карточка или stat-block `В игре`
- показывает суммарное время в человекочитаемом формате

Формат отображения:

- краткий: `12ч 14м`
- при малых значениях: `34м 10с`
- при необходимости в подробной карточке: `123 ч 41 м`

Блок должен визуально соответствовать текущим `meta-card` / `StatCard`, без отдельного нового дизайн-языка.

## Cursor Changes

Изменяется только поведение курсора, не hover-логика.

### Small Screens

На маленьких desktop-экранах:

- кастомный курсор делается визуально менее крупным/агрессивным
- при необходимости для части состояний разрешён fallback на системный курсор

### Touch Devices

На устройствах с coarse pointer:

- кастомный курсор полностью отключается
- возвращаются системные `auto`, `pointer`, `text`, `not-allowed`, `zoom-in`, `resize`

Это исключает бессмысленный cursor override на телефонах и планшетах.

## Error Handling

### Save Conflicts

При `409` для сейва время не должно откатываться назад.

Правило остаётся тем же:

- сервер хранит максимум из существующего и нового значения

### Missing Time Data

Если у старого игрока ещё нет `session_seconds_total`:

- использовать `0`
- UI должен корректно показывать “0м” / “меньше минуты”

### Legacy Rows

Leaderboard и meta не должны падать на старых строках без нового поля.

## Testing Strategy

### Unit Tests

- форматирование времени для UI
- вычисление total session time на клиенте
- merge-логика серверного `greatest(existing, incoming)`
- leaderboard metric builder для `time`

### Integration / API Tests

- `api/load.js` возвращает `sessionSecondsTotal`
- `api/save.js` принимает и сохраняет `sessionSecondsTotal`
- leaderboard response содержит `time`

### UI Tests

- новый таб leaderboard рендерится
- meta screen показывает блок времени
- leaderboard корректно показывает строки для `time`
- cursor rules для touch и small screens не ломают desktop state

## Files Likely To Change

### SQL / Server

- `server/sql/...player_saves...sql`
- `server/sql/...save_player_progress_rpc.sql`
- `server/sql/...player_leaderboard_rpc.sql`
- `api/save.js`
- `api/load.js`
- `api/leaderboard.js`

### Client State / Sync

- `web/src/context/DiscordActivityContext.jsx`
- `web/src/lib/cloudSave.js`

### UI

- `web/src/components/clicker/LeaderboardWidget.jsx`
- `web/src/components/meta/MetaScreen.jsx`
- `web/src/styles/screens.css`
- `web/src/styles/base.css`

### Tests

- existing leaderboard/meta/save tests
- new time-format and px/per-device cursor tests as needed

## Risks

### Session Overcounting

Если пользователь откроет несколько вкладок одновременно, каждая будет считать своё время. Базовая защита от потери данных есть через `greatest(...)`, но это не устраняет логическую проблему множественных активных клиентов.

Для текущей задачи это допустимо: считаем время клиента/сессии, а не строгую серверную аналитику присутствия.

### Sync Frequency

Частые sync не должны превращаться в лишнюю нагрузку. Поэтому время не отправляется отдельным heartbeat endpoint, а piggyback'ится на текущий контур сохранения.

### Responsive Density

Редизайн leaderboard должен остаться компактным в header placement. Нельзя превращать его в тяжёлую панель, перекрывающую игру на малых экранах.

## Recommendation

Реализовать всё в текущей архитектуре:

- отдельное поле `session_seconds_total` в `player_saves`
- piggyback на существующий save flow
- новый tab `time` в leaderboard
- новый lifetime-блок в meta
- редизайн leaderboard в пределах существующего pixel UI
- media-query правки курсора в `base.css`

Это минимально инвазивный путь с быстрым чтением, понятной SQL-моделью и низким риском для текущего продукта.
