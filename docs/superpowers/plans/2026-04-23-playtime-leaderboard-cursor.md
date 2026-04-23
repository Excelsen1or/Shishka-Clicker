# Playtime Leaderboard And Cursor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить учёт общего времени игры в Supabase, вывести его в meta и leaderboard, переработать leaderboard UI и адаптировать кастомный курсор под маленькие и touch-экраны.

**Architecture:** Время игры хранится в отдельном поле `session_seconds_total` в `player_saves` и piggyback'ится на текущий save flow. Клиент считает общее время текущей сессии локально, сервер сохраняет максимум из текущего и входящего значения. Leaderboard и meta читают уже готовое поле без разбора `save_data`, а cursor rules остаются чисто CSS-слоем.

**Tech Stack:** React 19, MobX, Vite, Vercel serverless API routes, Supabase, SQL RPC, Vitest, CSS.

---

## File Structure

### SQL / persistence

- `server/sql/2026-04-23_player_saves_playtime.sql`
  - Добавляет `session_seconds_total` в `player_saves`
- `server/sql/2026-04-14_save_player_progress_rpc.sql`
  - Расширяет RPC сохранения новым параметром времени
- `server/sql/2026-04-15_player_leaderboard_rpc.sql`
  - Возвращает время в leaderboard query

### API

- `api/save.js`
  - Принимает и сохраняет `sessionSecondsTotal`
- `api/load.js`
  - Возвращает `sessionSecondsTotal`
- `api/leaderboard.js`
  - Собирает metric `time`

### Client state / sync

- `web/src/lib/cloudSave.js`
  - Передаёт playtime в save API
- `web/src/context/DiscordActivityContext.jsx`
  - Считает total playtime за сессию и подмешивает его в sync
- `web/src/lib/format.js`
  - Получает форматтер времени

### UI

- `web/src/components/meta/MetaScreen.jsx`
  - Показывает общее время в meta
- `web/src/components/clicker/LeaderboardWidget.jsx`
  - Новый таб `time`, новый layout
- `web/src/styles/screens.css`
  - Стили leaderboard и meta-блока
- `web/src/styles/base.css`
  - Cursor media rules для small/touch

### Tests

- `web/src/lib/__tests__/format.test.js`
- `web/src/context/__tests__/DiscordActivityContext.test.js`
- `web/src/components/meta/__tests__/MetaScreen.test.jsx`
- `web/src/components/header/__tests__/Header.test.jsx`
- `web/src/components/market/__tests__/MarketScreen.test.jsx` only if leaderboard mounting side-effects leak here

---

### Task 1: Add Playtime Column In Supabase

**Files:**
- Create: `server/sql/2026-04-23_player_saves_playtime.sql`
- Modify: `server/sql/2026-04-14_save_player_progress_rpc.sql`
- Modify: `server/sql/2026-04-15_player_leaderboard_rpc.sql`

- [ ] **Step 1: Write the migration SQL for the new column**

```sql
begin;

alter table public.player_saves
  add column if not exists session_seconds_total bigint not null default 0;

create index if not exists player_saves_session_seconds_total_idx
  on public.player_saves (session_seconds_total desc, updated_at desc);

commit;
```

- [ ] **Step 2: Extend the save RPC signature**

Add parameter:

```sql
p_session_seconds_total bigint default 0
```

Extend return payload only if needed for debug; otherwise keep current shape.

- [ ] **Step 3: Update RPC write logic to store max playtime**

In both `insert ... on conflict do update` and optimistic update path, set:

```sql
session_seconds_total = greatest(
  coalesce(player_saves.session_seconds_total, 0),
  coalesce(p_session_seconds_total, 0)
)
```

- [ ] **Step 4: Update leaderboard RPC to return playtime**

Add output column:

```sql
playtime_seconds bigint
```

Read from `ps.session_seconds_total` and return:

```sql
greatest(0, coalesce(ps.session_seconds_total, 0))::bigint as playtime_seconds
```

- [ ] **Step 5: Run the SQL manually in Supabase SQL editor**

Run in order:

1. `2026-04-23_player_saves_playtime.sql`
2. updated `2026-04-14_save_player_progress_rpc.sql`
3. updated `2026-04-15_player_leaderboard_rpc.sql`

Expected: all scripts complete without errors.

- [ ] **Step 6: Commit**

```bash
git add server/sql/2026-04-23_player_saves_playtime.sql server/sql/2026-04-14_save_player_progress_rpc.sql server/sql/2026-04-15_player_leaderboard_rpc.sql
git commit -m "feat: add playtime persistence schema"
```

---

### Task 2: Extend Save/Load API With Playtime

**Files:**
- Modify: `api/save.js`
- Modify: `api/load.js`

- [ ] **Step 1: Write the failing API payload tests or assertions**

Add coverage that `sessionSecondsTotal`:

- is accepted by `api/save.js`
- is included in `api/load.js` response

If there is no existing route-test harness, add pure helper tests first by extracting helpers.

Example helper expectations:

```js
expect(normalizeSessionSecondsTotal(12.9)).toBe(12)
expect(normalizeSessionSecondsTotal(-5)).toBe(0)
expect(normalizeSessionSecondsTotal(undefined)).toBe(0)
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/lib/__tests__/format.test.js
```

Expected: fail if helper or assertions are not implemented yet.

- [ ] **Step 3: Add normalization helper in `api/save.js`**

Implement:

```js
function normalizeSessionSecondsTotal(value) {
  const parsed = Number(value ?? 0)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.floor(parsed))
}
```

- [ ] **Step 4: Pass playtime through RPC and legacy save paths**

Extend function signatures:

```js
async function saveViaRpc({
  supabase,
  playerId,
  playerUsername,
  appVersion,
  save,
  expectedVersion,
  force,
  sessionSecondsTotal,
}) { ... }
```

RPC call adds:

```js
p_session_seconds_total: sessionSecondsTotal,
```

Legacy `.update()` / `.insert()` adds:

```js
session_seconds_total: Math.max(
  Number(existingSave?.session_seconds_total ?? 0),
  sessionSecondsTotal,
),
```

- [ ] **Step 5: Return playtime in `api/load.js`**

Update select:

```js
.select('save_data, updated_at, app_version, save_version, session_seconds_total')
```

Return:

```js
sessionSecondsTotal: data.session_seconds_total ?? 0,
```

- [ ] **Step 6: Run build and route-adjacent tests**

Run:

```bash
cmd /c pnpm build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add api/save.js api/load.js
git commit -m "feat: persist playtime through save api"
```

---

### Task 3: Track Session Playtime On The Client

**Files:**
- Modify: `web/src/lib/cloudSave.js`
- Modify: `web/src/context/DiscordActivityContext.jsx`
- Test: `web/src/context/__tests__/DiscordActivityContext.test.js`

- [ ] **Step 1: Write failing tests for playtime math**

Add helpers to test:

```js
expect(
  getSessionSecondsTotal({
    baseSessionSecondsTotal: 120,
    sessionStartedAtMs: 1_000,
    nowMs: 11_900,
  }),
).toBe(130)
```

and:

```js
expect(
  getSessionSecondsTotal({
    baseSessionSecondsTotal: 0,
    sessionStartedAtMs: null,
    nowMs: 11_900,
  }),
).toBe(0)
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/context/__tests__/DiscordActivityContext.test.js
```

Expected: fail because helper is missing.

- [ ] **Step 3: Implement session playtime helpers**

In `DiscordActivityContext.jsx`, add exported helper:

```js
export function getSessionSecondsTotal({
  baseSessionSecondsTotal,
  sessionStartedAtMs,
  nowMs = Date.now(),
}) {
  if (!Number.isFinite(sessionStartedAtMs)) {
    return Math.max(0, Math.floor(baseSessionSecondsTotal ?? 0))
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((nowMs - sessionStartedAtMs) / 1000),
  )

  return Math.max(0, Math.floor(baseSessionSecondsTotal ?? 0)) + elapsedSeconds
}
```

- [ ] **Step 4: Store playtime refs in the activity context**

Add refs:

```js
const baseSessionSecondsTotalRef = useRef(0)
const sessionStartedAtMsRef = useRef(null)
```

After bootstrap success:

```js
baseSessionSecondsTotalRef.current = Number(session?.sessionSecondsTotal ?? 0)
sessionStartedAtMsRef.current = Date.now()
```

After cloud load:

```js
baseSessionSecondsTotalRef.current = Number(cloudSave?.sessionSecondsTotal ?? 0)
sessionStartedAtMsRef.current = Date.now()
```

After successful upload:

```js
baseSessionSecondsTotalRef.current =
  Number(result.sessionSecondsTotal ?? baseSessionSecondsTotalRef.current)
sessionStartedAtMsRef.current = Date.now()
```

- [ ] **Step 5: Send playtime in `uploadCloudSave`**

Extend `web/src/lib/cloudSave.js`:

```js
export async function uploadCloudSave({
  appVersion,
  save,
  expectedVersion = null,
  force = false,
  sessionSecondsTotal = 0,
}) {
```

POST body adds:

```js
sessionSecondsTotal,
```

- [ ] **Step 6: Use the computed total in sync and exit flush**

In `uploadLatestSave()` and `flushLatestSaveOnExit()` pass:

```js
sessionSecondsTotal: getSessionSecondsTotal({
  baseSessionSecondsTotal: baseSessionSecondsTotalRef.current,
  sessionStartedAtMs: sessionStartedAtMsRef.current,
}),
```

- [ ] **Step 7: Expose playtime to UI state**

Add state field:

```js
sessionSecondsTotal: 0,
```

Update it after load/upload/manual sync with the current computed or returned total.

- [ ] **Step 8: Re-run the context tests**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/context/__tests__/DiscordActivityContext.test.js
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add web/src/lib/cloudSave.js web/src/context/DiscordActivityContext.jsx web/src/context/__tests__/DiscordActivityContext.test.js
git commit -m "feat: track session playtime on client"
```

---

### Task 4: Add Time Formatting Utilities

**Files:**
- Modify: `web/src/lib/format.js`
- Test: `web/src/lib/__tests__/format.test.js`

- [ ] **Step 1: Write failing tests for playtime formatting**

Add:

```js
expect(formatDurationCompact(42)).toBe('42с')
expect(formatDurationCompact(75)).toBe('1м 15с')
expect(formatDurationCompact(3661)).toBe('1ч 1м')
expect(formatDurationDetailed(7322)).toBe('2 ч 2 м')
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/lib/__tests__/format.test.js
```

Expected: fail because formatters do not exist.

- [ ] **Step 3: Implement compact and detailed duration formatters**

Example:

```js
export function formatDurationCompact(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) return `${hours}ч ${minutes}м`
  if (minutes > 0) return `${minutes}м ${remainingSeconds}с`
  return `${remainingSeconds}с`
}
```

- [ ] **Step 4: Run the formatter tests again**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/lib/__tests__/format.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/format.js web/src/lib/__tests__/format.test.js
git commit -m "feat: add playtime formatting helpers"
```

---

### Task 5: Add Playtime To Leaderboard Data

**Files:**
- Modify: `api/leaderboard.js`
- Modify: `web/src/stores/WebsocketStore.js`
- Test: `web/src/components/header/__tests__/Header.test.jsx`

- [ ] **Step 1: Write failing assertions for new leaderboard metric**

At minimum add assertions that leaderboard tabs or payload include `time`.

Example expected row:

```js
{
  username: 'Player',
  time: 120,
}
```

- [ ] **Step 2: Run the relevant test to verify failure**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/components/header/__tests__/Header.test.jsx
```

Expected: fail once test expects the new tab.

- [ ] **Step 3: Extend API leaderboard normalization**

In `api/leaderboard.js`, read:

```js
time: normalizeMetricValue(row.session_seconds_total),
```

or from RPC result:

```js
time: normalizeMetricValue(row.playtime_seconds),
```

Update:

```js
return {
  shishki: ...,
  heavenlyShishki,
  shards: heavenlyShishki,
  clicks: ...,
  time: ...,
}
```

Add `time` leaderboard in `buildLeaderboards()`.

- [ ] **Step 4: Extend websocket store defaults**

In `WebsocketStore.js`:

```js
leaderboards = {
  shishki: [],
  shards: [],
  clicks: [],
  time: [],
}
```

And in payload parsing:

```js
time: Array.isArray(payload?.leaderboards?.time)
  ? payload.leaderboards.time
  : [],
```

- [ ] **Step 5: Re-run leaderboard-adjacent tests**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/components/header/__tests__/Header.test.jsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add api/leaderboard.js web/src/stores/WebsocketStore.js web/src/components/header/__tests__/Header.test.jsx
git commit -m "feat: add playtime leaderboard metric"
```

---

### Task 6: Redesign Leaderboard Widget

**Files:**
- Modify: `web/src/components/clicker/LeaderboardWidget.jsx`
- Modify: `web/src/styles/screens.css`
- Test: `web/src/components/header/__tests__/Header.test.jsx`

- [ ] **Step 1: Write a failing UI test for the time tab and summary**

Add expectations:

```js
expect(screen.getByRole('tab', { name: /время/i })).toBeInTheDocument()
expect(screen.getByText(/top-5/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run the test to verify failure**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/components/header/__tests__/Header.test.jsx
```

Expected: fail if tab/layout not present.

- [ ] **Step 3: Extend leaderboard tabs**

In `LeaderboardWidget.jsx`:

```js
const LEADERBOARD_TABS = [
  { id: 'shishki', label: 'шишки', icon: null, valueLabel: 'Шишек всего' },
  { id: 'shards', label: 'небесные', icon: Gem, valueLabel: 'Небесных' },
  { id: 'clicks', label: 'клики', icon: Lightning, valueLabel: 'Кликов' },
  { id: 'time', label: 'время', icon: Crown, valueLabel: 'В игре' },
]
```

- [ ] **Step 4: Render formatted time values**

For leaderboard rows:

```js
const displayValue =
  activeTab === 'time'
    ? formatDurationCompact(entry.time ?? 0)
    : formatNumber(entry[activeTab] ?? 0)
```

- [ ] **Step 5: Restructure the panel markup**

Introduce:

- stronger head summary
- tabs wrapper that can scroll on small widths
- row meta text based on `updatedAt`

Example secondary text:

```js
function formatUpdatedAgo(value) {
  const diffMs = Date.now() - (Date.parse(value ?? '') || 0)
  if (diffMs < 5 * 60_000) return 'обновлено недавно'
  if (diffMs < 60 * 60_000) return 'обновлено < 1ч назад'
  return 'обновлено давно'
}
```

- [ ] **Step 6: Update CSS for cleaner responsive layout**

In `screens.css`:

- make panel width adaptive
- improve row spacing and rank column
- make tabs wrap or scroll
- keep pixel borders and glow restrained

- [ ] **Step 7: Run the leaderboard UI test again**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/components/header/__tests__/Header.test.jsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add web/src/components/clicker/LeaderboardWidget.jsx web/src/styles/screens.css web/src/components/header/__tests__/Header.test.jsx
git commit -m "feat: redesign leaderboard widget"
```

---

### Task 7: Add Playtime To Meta Screen

**Files:**
- Modify: `web/src/components/meta/MetaScreen.jsx`
- Modify: `web/src/styles/screens.css`
- Test: `web/src/components/meta/__tests__/MetaScreen.test.jsx`

- [ ] **Step 1: Write a failing meta test for the new playtime block**

Add expectation like:

```js
expect(screen.getByText(/в игре/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run the meta test to verify failure**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/components/meta/__tests__/MetaScreen.test.jsx
```

Expected: fail before the new block exists.

- [ ] **Step 3: Read playtime from activity/game state**

Use `sessionSecondsTotal` from activity context if exposed there, or from game/UI props if you route it through store context.

Recommended:

```js
import { useDiscordActivity } from '../../context/DiscordActivityContext.jsx'
```

and then:

```js
const { sessionSecondsTotal } = useDiscordActivity()
```

- [ ] **Step 4: Add a new pixel card in the meta screen**

Example block:

```jsx
<article className="meta-card pixel-surface">
  <div className="meta-card__kicker">В игре</div>
  <h3>{formatDurationDetailed(sessionSecondsTotal)}</h3>
  <p>Общее время всех сессий этого профиля.</p>
</article>
```

- [ ] **Step 5: Add responsive styling in `screens.css`**

Keep it aligned with existing `meta-card` spacing and typography.

- [ ] **Step 6: Re-run the meta test**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/components/meta/__tests__/MetaScreen.test.jsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/meta/MetaScreen.jsx web/src/styles/screens.css web/src/components/meta/__tests__/MetaScreen.test.jsx
git commit -m "feat: show playtime on meta screen"
```

---

### Task 8: Adapt Custom Cursor For Small And Touch Screens

**Files:**
- Modify: `web/src/styles/base.css`
- Test: `web/src/styles/__tests__/screenSizing.test.js`

- [ ] **Step 1: Write a failing style-oriented test or token assertion**

If CSS tests are token-based, add expectations for presence of a touch/cursor rule string.

If no direct CSS parsing exists, at minimum add a focused assertion in an existing style snapshot test.

- [ ] **Step 2: Run the style test to verify failure**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/styles/__tests__/screenSizing.test.js
```

Expected: fail after adding the new expectation.

- [ ] **Step 3: Add touch cursor reset rules**

In `base.css`:

```css
@media (pointer: coarse) {
  html,
  body,
  button:not(:disabled),
  a,
  input,
  textarea,
  [contenteditable='true'],
  [data-cursor='zoom'],
  .cursor-zoom,
  [data-cursor='resize-ew'],
  .cursor-resize-ew,
  [data-cursor='resize-ns'],
  .cursor-resize-ns {
    cursor: auto !important;
  }
}
```

- [ ] **Step 4: Add small-screen cursor softening**

In `base.css`:

```css
@media (max-width: 720px) and (pointer: fine) {
  html {
    cursor: auto;
  }

  button:not(:disabled),
  a {
    cursor: pointer;
  }

  input,
  textarea,
  [contenteditable='true'] {
    cursor: text;
  }
}
```

- [ ] **Step 5: Re-run the style test**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/styles/__tests__/screenSizing.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/styles/base.css web/src/styles/__tests__/screenSizing.test.js
git commit -m "feat: adapt custom cursor for mobile and small screens"
```

---

### Task 9: Full Verification

**Files:**
- Modify: none
- Test: full targeted verification only

- [ ] **Step 1: Run focused client tests**

Run:

```bash
cmd /c pnpm --dir web test -- --run src/lib/__tests__/format.test.js src/lib/__tests__/pxlkit.test.js src/context/__tests__/DiscordActivityContext.test.js src/components/meta/__tests__/MetaScreen.test.jsx src/components/header/__tests__/Header.test.jsx src/__tests__/discord.test.js src/__tests__/discordOAuth.test.js
```

Expected: all targeted tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
cmd /c pnpm build
```

Expected: Vite build succeeds with no new errors.

- [ ] **Step 3: Manual verification checklist**

Verify in app:

- leaderboard has `время`
- time values render as duration, not raw integers
- meta screen shows total time
- custom cursor is absent on phone/touch device
- custom cursor is softened on small desktop widths
- save/load preserves playtime
- new sessions keep increasing the total after manual sync or page hide

- [ ] **Step 4: Commit final polish**

```bash
git add .
git commit -m "feat: add playtime tracking and leaderboard refresh"
```

---

## Self-Review

Spec coverage:

- playtime in Supabase: Tasks 1-3
- top by time: Tasks 1, 5, 6
- leaderboard redesign: Task 6
- meta UI: Task 7
- cursor behavior: Task 8

Placeholder scan:

- No `TODO`/`TBD`
- Every task has files, commands, and expected outcomes

Type consistency:

- use `sessionSecondsTotal` in API/client JSON
- use `session_seconds_total` in database
- use leaderboard metric key `time` in client payload
