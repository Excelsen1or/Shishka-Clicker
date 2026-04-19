# Shishka Economy Reshape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `money + knowledge + subscriptions` loop with a Cookie Clicker style `shishki`-only economy that adds buildings, repeatable heavenly-shishki quotas, tar lumps, market speculation, and media-hype campaigns.

**Architecture:** Extract the new economy into pure data and math modules that can be tested independently, then rebuild `GameStore` as an orchestration layer over those helpers. Rewire the UI around new `buildings`, `market`, `event`, and `meta` views, and hard-break legacy saves by bumping the save schema and leaderboard parsing.

**Tech Stack:** React 19, MobX 6, Vite 8, Vitest, Testing Library, Supabase JSON saves, Vercel serverless API, SQL leaderboard function.

---

## File Structure

**Create:**
- `web/src/test/setup.js` — shared Vitest + DOM setup.
- `web/src/game/economyConfig.js` — buildings, upgrades, market goods, events, media campaigns, starting state.
- `web/src/game/economyMath.js` — cost scaling, production, quota chaining, market trades, tar lump timers, event helpers.
- `web/src/game/__tests__/economyMath.test.js` — pure economy math contract tests.
- `web/src/lib/__tests__/saveTransfer.test.js` — save format and legacy rejection tests.
- `web/src/stores/gameStoreState.js` — fresh-state creation and state merge helpers for the new save shape.
- `web/src/stores/gameStoreSnapshots.js` — UI-facing selectors for buildings, market, meta, and clicker snapshots.
- `web/src/stores/__tests__/GameStore.test.js` — store behavior tests for buying, passive income, quota chaining, rebirth, and market trades.
- `web/src/components/market/MarketScreen.jsx` — top-level market tab.
- `web/src/components/market/MarketTicker.jsx` — current prices and deltas.
- `web/src/components/market/MarketPortfolio.jsx` — owned positions and PnL.
- `web/src/components/market/MarketTradePanel.jsx` — buy/sell controls and broker fee messaging.
- `web/src/components/market/__tests__/MarketScreen.test.jsx` — smoke test for market rendering.
- `web/src/components/ui/devConsoleCommands.js` — parse and execute console commands against the new resources.
- `web/src/components/ui/__tests__/devConsoleCommands.test.js` — console command parser tests.
- `web/src/components/clicker/ProgressFieldPanel.jsx` — left/right/bottom field zones around the clicker.
- `web/src/components/clicker/ProgressSprite.jsx` — one 32x32 field sprite with state badges.
- `web/src/components/ui/EntityPlaceholderIcon.jsx` — shared placeholder tile system for cards and field entities.
- `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx` — clicker field smoke test.
- `web/src/components/ui/__tests__/EntityPlaceholderIcon.test.jsx` — placeholder rendering contract tests.

**Modify:**
- `web/package.json`
- `web/vite.config.js`
- `web/src/game/config.js`
- `web/src/game/metaConfig.js`
- `web/src/lib/saveTransfer.js`
- `web/src/lib/storage.js`
- `web/src/stores/GameStore.js`
- `web/src/context/NavContext.jsx`
- `web/src/components/wrapper/AppWrapper.jsx`
- `web/src/components/shop/ShopScreen.jsx`
- `web/src/components/meta/MetaScreen.jsx`
- `web/src/components/clicker/ProgressOverview.jsx`
- `web/src/components/clicker/ClickerScreen.jsx`
- `web/src/components/ui/DevConsole.jsx`
- `web/src/components/market/MarketTicker.jsx`
- `web/src/components/market/MarketTradePanel.jsx`
- `web/src/lib/discordPresence.js`
- `web/src/styles/layout.css`
- `web/src/styles/shop-screen.css`
- `api/leaderboard.js`
- `server/sql/2026-04-15_player_leaderboard_rpc.sql`

## Task 1: Install Vitest And Lock First Economy Contracts

**Files:**
- Create: `web/src/test/setup.js`
- Create: `web/src/game/economyMath.js`
- Create: `web/src/game/__tests__/economyMath.test.js`
- Modify: `web/package.json`
- Modify: `web/vite.config.js`

- [ ] **Step 1: Write the failing test**

Create `web/src/game/__tests__/economyMath.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  getBuildingCost,
  getQuotaTarget,
  resolveQuotaClosures,
} from '../economyMath.js'

describe('economyMath', () => {
  it('scales building cost by 15 percent per purchase', () => {
    expect(getBuildingCost(100, 0)).toBe(100)
    expect(getBuildingCost(100, 1)).toBe(115)
    expect(getBuildingCost(100, 2)).toBe(132)
  })

  it('closes multiple quotas inside one life', () => {
    const result = resolveQuotaClosures({
      quotaIndex: 0,
      currentRunShishki: 3_500,
      heavenlyShishki: 0,
      totalHeavenlyShishkiEarned: 0,
      baseQuota: 1_000,
      quotaGrowth: 2,
    })

    expect(result.closedQuotas).toBe(2)
    expect(result.quotaIndex).toBe(2)
    expect(result.heavenlyShishki).toBe(2)
    expect(getQuotaTarget(1_000, 2, result.quotaIndex)).toBe(4_000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/game/__tests__/economyMath.test.js`

Expected: FAIL because `vitest` is not installed and `web/src/game/economyMath.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Update `web/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.4",
    "vitest": "^3.2.4"
  }
}
```

Update `web/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

Create `web/src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest'
```

Create `web/src/game/economyMath.js`:

```js
export function getBuildingCost(baseCost, owned) {
  return Math.floor(baseCost * Math.pow(1.15, owned))
}

export function getQuotaTarget(baseQuota, quotaGrowth, quotaIndex) {
  return Math.floor(baseQuota * Math.pow(quotaGrowth, quotaIndex))
}

export function resolveQuotaClosures({
  quotaIndex,
  currentRunShishki,
  heavenlyShishki,
  totalHeavenlyShishkiEarned,
  baseQuota,
  quotaGrowth,
}) {
  let nextQuotaIndex = quotaIndex
  let nextHeavenly = heavenlyShishki
  let nextTotalHeavenly = totalHeavenlyShishkiEarned
  let closedQuotas = 0

  while (
    currentRunShishki >= getQuotaTarget(baseQuota, quotaGrowth, nextQuotaIndex)
  ) {
    nextQuotaIndex += 1
    nextHeavenly += 1
    nextTotalHeavenly += 1
    closedQuotas += 1
  }

  return {
    closedQuotas,
    quotaIndex: nextQuotaIndex,
    heavenlyShishki: nextHeavenly,
    totalHeavenlyShishkiEarned: nextTotalHeavenly,
  }
}
```

Install dependencies:

```bash
pnpm --dir web add -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/game/__tests__/economyMath.test.js`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add web/package.json web/vite.config.js web/src/test/setup.js web/src/game/economyMath.js web/src/game/__tests__/economyMath.test.js
git commit -m "test: add economy vitest harness"
```

## Task 2: Replace Config And Meta Math With The New Economy Schema

**Files:**
- Create: `web/src/game/economyConfig.js`
- Modify: `web/src/game/economyMath.js`
- Modify: `web/src/game/config.js`
- Modify: `web/src/game/metaConfig.js`
- Test: `web/src/game/__tests__/economyMath.test.js`

- [ ] **Step 1: Write the failing test**

Expand `web/src/game/__tests__/economyMath.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  STARTING_STATE,
  BUILDINGS,
  MARKET_GOODS,
  RAP_CAMPAIGNS,
} from '../economyConfig.js'
import {
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  resolveQuotaClosures,
} from '../economyMath.js'

describe('economy schema', () => {
  it('starts without money or knowledge balances', () => {
    expect(STARTING_STATE).not.toHaveProperty('money')
    expect(STARTING_STATE).not.toHaveProperty('knowledge')
    expect(STARTING_STATE).toHaveProperty('heavenlyShishki', 0)
    expect(STARTING_STATE).toHaveProperty('tarLumps', 0)
    expect(Object.keys(STARTING_STATE.buildings)).toEqual(
      BUILDINGS.map((building) => building.id),
    )
  })

  it('defines market goods and rap campaigns', () => {
    expect(MARKET_GOODS.map((item) => item.id)).toContain('parallelImport')
    expect(RAP_CAMPAIGNS.map((item) => item.id)).toContain('iceFlexer')
  })
})

describe('economy math', () => {
  it('derives production from buildings and upgrades only', () => {
    const state = {
      ...STARTING_STATE,
      buildings: { ...STARTING_STATE.buildings, garagePicker: 10 },
      upgrades: { ...STARTING_STATE.upgrades, warehouseRhythm: 1 },
    }

    expect(deriveProduction(state).shishkiPerSecond).toBeGreaterThan(0)
  })

  it('accrues tar lumps on real-time cadence', () => {
    const result = accrueTarLumps({
      ...STARTING_STATE,
      tarLumps: 0,
      tarLumpProgressMs: 7_200_000,
    }, 7_200_000)

    expect(result.tarLumps).toBe(1)
    expect(result.tarLumpProgressMs).toBe(0)
  })

  it('applies broker fee reduction with a floor', () => {
    const trade = applyMarketTrade({
      state: {
        ...STARTING_STATE,
        shishki: 10_000,
        market: {
          ...STARTING_STATE.market,
          brokerLevel: 8,
          prices: { parallelImport: 100 },
          positions: { parallelImport: 0 },
        },
      },
      goodId: 'parallelImport',
      quantity: 10,
      side: 'buy',
    })

    expect(trade.nextState.market.positions.parallelImport).toBe(10)
    expect(trade.feePaid).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/game/__tests__/economyMath.test.js`

Expected: FAIL because `economyConfig.js`, `deriveProduction`, `accrueTarLumps`, and `applyMarketTrade` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `web/src/game/economyConfig.js`:

```js
export const QUOTA_RULES = {
  baseQuota: 1_000,
  quotaGrowth: 2,
}

export const TAR_LUMP_RULES = {
  intervalMs: 14_400_000,
  maxBuildingLevel: 10,
}

export const BUILDINGS = [
  { id: 'garagePicker', title: 'Сборщик шишек у гаражей', baseCost: 15, baseOutput: 0.1 },
  { id: 'pickupPoint', title: 'ПВЗ на окраине', baseCost: 100, baseOutput: 1 },
  { id: 'greySorting', title: 'Серая сортировка', baseCost: 1_100, baseOutput: 8 },
  { id: 'selfEmployedCrew', title: 'Бригада самозанятых', baseCost: 12_000, baseOutput: 47 },
  { id: 'resaleStall', title: 'Ларёк перепродажи', baseCost: 130_000, baseOutput: 260 }
]

export const RUN_UPGRADES = [
  { id: 'warehouseRhythm', title: 'Складской ритм', kind: 'globalMultiplier', cost: 250, value: 0.2 },
  { id: 'cashbackBug', title: 'Ошибочный кэшбэк', kind: 'clickMultiplier', cost: 600, value: 1 }
]

export const PRESTIGE_UPGRADES = [
  { id: 'heavenlyTar', title: 'Небесная смола', baseCost: 1, value: 0.15 },
  { id: 'taxBlindness', title: 'Налоговая слепота', baseCost: 2, value: 0.01 }
]

export const MARKET_GOODS = [
  { id: 'pickupPointLeftovers', title: 'Остатки с ПВЗ', basePrice: 40, profile: 'stable' },
  { id: 'parallelImport', title: 'Параллельный завоз', basePrice: 100, profile: 'volatile' },
  { id: 'neuroCover', title: 'Нейро-обложки', basePrice: 75, profile: 'hype' }
]

export const RAP_CAMPAIGNS = [
  { id: 'iceFlexer', title: 'Ледяной флексер', cost: 8_000, durationMs: 90_000, productionBoost: 0, clickBoost: 2, eventBoost: 0.1 },
  { id: 'sundayProphet', title: 'Воскресный пророк', cost: 15_000, durationMs: 180_000, productionBoost: 0.35, clickBoost: 0, eventBoost: 0.15 }
]

export const STARTING_STATE = {
  shishki: 0,
  manualClicks: 0,
  totalShishkiEarned: 0,
  lifetimeShishkiEarned: 0,
  heavenlyShishki: 0,
  totalHeavenlyShishkiEarned: 0,
  tarLumps: 0,
  tarLumpProgressMs: 0,
  rebirths: 0,
  quotaIndex: 0,
  currentRunShishki: 0,
  buildings: Object.fromEntries(BUILDINGS.map((item) => [item.id, 0])),
  buildingLevels: Object.fromEntries(BUILDINGS.map((item) => [item.id, 0])),
  upgrades: Object.fromEntries(RUN_UPGRADES.map((item) => [item.id, 0])),
  prestigeUpgrades: Object.fromEntries(PRESTIGE_UPGRADES.map((item) => [item.id, 0])),
  market: {
    unlocked: false,
    brokerLevel: 0,
    prices: Object.fromEntries(MARKET_GOODS.map((item) => [item.id, item.basePrice])),
    positions: Object.fromEntries(MARKET_GOODS.map((item) => [item.id, 0])),
    averageBuyPrice: Object.fromEntries(MARKET_GOODS.map((item) => [item.id, 0])),
  },
  activeEvent: null,
  activeCampaign: null,
  achievements: {},
}
```

Update `web/src/game/economyMath.js`:

```js
import {
  BUILDINGS,
  QUOTA_RULES,
  RAP_CAMPAIGNS,
  RUN_UPGRADES,
  TAR_LUMP_RULES,
} from './economyConfig.js'

export function getBuildingCost(baseCost, owned) {
  return Math.floor(baseCost * Math.pow(1.15, owned))
}

export function getQuotaTarget(baseQuota, quotaGrowth, quotaIndex) {
  return Math.floor(baseQuota * Math.pow(quotaGrowth, quotaIndex))
}

export function deriveProduction(state) {
  const buildingOutput = BUILDINGS.reduce((total, building) => {
    return total + (state.buildings[building.id] ?? 0) * building.baseOutput
  }, 0)

  const campaignBoost = state.activeCampaign?.productionBoost ?? 0
  const globalMultiplier =
    1 +
    (state.upgrades.warehouseRhythm ?? 0) * (RUN_UPGRADES.find((item) => item.id === 'warehouseRhythm')?.value ?? 0) +
    (state.prestigeUpgrades.heavenlyTar ?? 0) * 0.15 +
    campaignBoost

  const clickPower = 1 + (state.upgrades.cashbackBug ?? 0) + (state.activeCampaign?.clickBoost ?? 0)

  return {
    clickPower,
    shishkiPerSecond: Number((buildingOutput * globalMultiplier).toFixed(2)),
  }
}

export function resolveQuotaClosures({
  quotaIndex,
  currentRunShishki,
  heavenlyShishki,
  totalHeavenlyShishkiEarned,
  baseQuota = QUOTA_RULES.baseQuota,
  quotaGrowth = QUOTA_RULES.quotaGrowth,
}) {
  let nextQuotaIndex = quotaIndex
  let nextHeavenly = heavenlyShishki
  let nextTotalHeavenly = totalHeavenlyShishkiEarned
  let closedQuotas = 0

  while (
    currentRunShishki >= getQuotaTarget(baseQuota, quotaGrowth, nextQuotaIndex)
  ) {
    nextQuotaIndex += 1
    nextHeavenly += 1
    nextTotalHeavenly += 1
    closedQuotas += 1
  }

  return {
    closedQuotas,
    quotaIndex: nextQuotaIndex,
    heavenlyShishki: nextHeavenly,
    totalHeavenlyShishkiEarned: nextTotalHeavenly,
  }
}

export function accrueTarLumps(state, elapsedMs) {
  const totalProgress = (state.tarLumpProgressMs ?? 0) + elapsedMs
  const earned = Math.floor(totalProgress / TAR_LUMP_RULES.intervalMs)
  return {
    ...state,
    tarLumps: (state.tarLumps ?? 0) + earned,
    tarLumpProgressMs: totalProgress % TAR_LUMP_RULES.intervalMs,
  }
}

export function applyMarketTrade({ state, goodId, quantity, side }) {
  const unitPrice = state.market.prices[goodId]
  const rawValue = unitPrice * quantity
  const feeRate = Math.max(0.02, 0.08 - (state.market.brokerLevel ?? 0) * 0.005)
  const feePaid = Math.ceil(rawValue * feeRate)
  const sign = side === 'buy' ? -1 : 1
  const owned = state.market.positions[goodId] ?? 0
  const nextOwned = side === 'buy' ? owned + quantity : owned - quantity

  return {
    feePaid,
    nextState: {
      ...state,
      shishki: state.shishki + sign * rawValue - feePaid,
      market: {
        ...state.market,
        positions: {
          ...state.market.positions,
          [goodId]: nextOwned,
        },
      },
    },
  }
}

export function getCampaignById(id) {
  return RAP_CAMPAIGNS.find((item) => item.id === id) ?? null
}
```

Replace `web/src/game/config.js` with a barrel:

```js
export {
  BUILDINGS,
  MARKET_GOODS,
  PRESTIGE_UPGRADES,
  RAP_CAMPAIGNS,
  RUN_UPGRADES as UPGRADES,
  STARTING_STATE,
} from './economyConfig.js'

export {
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  getBuildingCost,
  getCampaignById,
  getQuotaTarget,
  resolveQuotaClosures,
} from './economyMath.js'
```

Replace `web/src/game/metaConfig.js` with prestige helpers:

```js
import { PRESTIGE_UPGRADES, QUOTA_RULES } from './economyConfig.js'
import { getQuotaTarget } from './economyMath.js'

export function getPrestigeUpgradeCost(item, level) {
  return Math.floor(item.baseCost * Math.pow(2.4, level))
}

export function getQuotaPreview(state) {
  return {
    current: getQuotaTarget(QUOTA_RULES.baseQuota, QUOTA_RULES.quotaGrowth, state.quotaIndex),
    next: getQuotaTarget(QUOTA_RULES.baseQuota, QUOTA_RULES.quotaGrowth, state.quotaIndex + 1),
  }
}

export function getPrestigeUpgradeCards(state) {
  return PRESTIGE_UPGRADES.map((item) => {
    const level = state.prestigeUpgrades[item.id] ?? 0
    return {
      ...item,
      level,
      cost: getPrestigeUpgradeCost(item, level),
    }
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/game/__tests__/economyMath.test.js`

Expected: PASS with all schema and math assertions green.

- [ ] **Step 5: Commit**

```bash
git add web/src/game/economyConfig.js web/src/game/economyMath.js web/src/game/config.js web/src/game/metaConfig.js web/src/game/__tests__/economyMath.test.js
git commit -m "feat: add shishki-only economy schema"
```

## Task 3: Break Legacy Saves And Update Leaderboard Parsing

**Files:**
- Create: `web/src/lib/__tests__/saveTransfer.test.js`
- Modify: `web/src/lib/saveTransfer.js`
- Modify: `web/src/lib/storage.js`
- Modify: `api/leaderboard.js`
- Modify: `server/sql/2026-04-15_player_leaderboard_rpc.sql`

- [ ] **Step 1: Write the failing test**

Create `web/src/lib/__tests__/saveTransfer.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  SAVE_EXPORT_FORMAT,
  SAVE_EXPORT_VERSION,
  createSaveBundle,
  normalizeImportedBundle,
} from '../saveTransfer.js'

describe('saveTransfer', () => {
  it('exports the new format version with heavenly shishki fields', () => {
    const bundle = createSaveBundle({
      gameState: {
        shishki: 12,
        heavenlyShishki: 3,
        tarLumps: 1,
        buildings: { garagePicker: 2 },
        upgrades: { warehouseRhythm: 1 },
        prestigeUpgrades: { heavenlyTar: 1 },
      },
      includeSettings: false,
      appVersion: 'test',
    })

    expect(bundle.format).toBe(SAVE_EXPORT_FORMAT)
    expect(bundle.version).toBe(SAVE_EXPORT_VERSION)
    expect(bundle.payload.game.heavenlyShishki).toBe(3)
    expect(bundle.payload.game).not.toHaveProperty('money')
    expect(bundle.payload.game).not.toHaveProperty('knowledge')
  })

  it('rejects legacy money-knowledge saves', () => {
    expect(() =>
      normalizeImportedBundle({
        shishki: 10,
        money: 50,
        knowledge: 5,
        subscriptions: { gpt: 1 },
      }),
    ).toThrow('legacy_saves_not_supported')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/lib/__tests__/saveTransfer.test.js`

Expected: FAIL because the current importer still accepts legacy saves and the current export version is still `1`.

- [ ] **Step 3: Write minimal implementation**

Update `web/src/lib/saveTransfer.js`:

```js
import { normalizeSettings } from './settingsStorage'

export const SAVE_EXPORT_FORMAT = 'shishka-clicker-save'
export const SAVE_EXPORT_VERSION = 2
export const SAVE_FILE_EXTENSION = '.shishka-save.json'

function hasNewGameStateShape(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'shishki' in value &&
      'heavenlyShishki' in value &&
      'tarLumps' in value &&
      'buildings' in value &&
      'market' in value &&
      'prestigeUpgrades' in value,
  )
}

function isLegacyGameStateShape(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('money' in value || 'knowledge' in value || 'subscriptions' in value),
  )
}

export function createSaveBundle({
  gameState,
  settings,
  includeSettings = true,
  appVersion = 'unknown',
  exportedAt = new Date().toISOString(),
}) {
  return {
    format: SAVE_EXPORT_FORMAT,
    version: SAVE_EXPORT_VERSION,
    appVersion,
    exportedAt,
    payload: {
      game: gameState,
      ...(includeSettings && settings
        ? { settings: normalizeSettings(settings) }
        : {}),
    },
  }
}

export function normalizeImportedBundle(rawValue) {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    throw new Error('Файл сохранения пустой или повреждён.')
  }

  const game =
    rawValue.format === SAVE_EXPORT_FORMAT ? rawValue.payload?.game : rawValue

  if (isLegacyGameStateShape(game)) {
    throw new Error('legacy_saves_not_supported')
  }

  if (!hasNewGameStateShape(game)) {
    throw new Error('В файле не найден новый игровой прогресс.')
  }

  return {
    appVersion: rawValue.appVersion ?? 'unknown',
    exportedAt: rawValue.exportedAt ?? null,
    game,
    settings: rawValue.payload?.settings
      ? normalizeSettings(rawValue.payload.settings)
      : null,
    isLegacy: false,
  }
}
```

Update `web/src/lib/storage.js`:

```js
const LEGACY_SAVE_KEY = 'shishka-clicker-save-v5'
```

Update `api/leaderboard.js`:

```js
function buildMetricSnapshot(gameState) {
  if (!gameState || typeof gameState !== 'object') {
    return {
      shishki: 0,
      shards: 0,
      clicks: 0,
    }
  }

  return {
    shishki: normalizeMetricValue(
      gameState.lifetimeShishkiEarned ?? gameState.totalShishkiEarned,
    ),
    shards: normalizeMetricValue(
      gameState.totalHeavenlyShishkiEarned ?? gameState.heavenlyShishki,
    ),
    clicks: normalizeMetricValue(gameState.manualClicks),
  }
}
```

Update `server/sql/2026-04-15_player_leaderboard_rpc.sql`:

```sql
coalesce(
  nullif(ps.save_data -> 'payload' -> 'game' ->> 'totalHeavenlyShishkiEarned', '')::numeric,
  nullif(ps.save_data -> 'payload' -> 'game' ->> 'heavenlyShishki', '')::numeric,
  nullif(ps.save_data ->> 'totalHeavenlyShishkiEarned', '')::numeric,
  nullif(ps.save_data ->> 'heavenlyShishki', '')::numeric,
  0
) as shards_total,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/lib/__tests__/saveTransfer.test.js`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/__tests__/saveTransfer.test.js web/src/lib/saveTransfer.js web/src/lib/storage.js api/leaderboard.js server/sql/2026-04-15_player_leaderboard_rpc.sql
git commit -m "feat: break legacy saves for new economy"
```

## Task 4: Split GameStore And Rebuild The New Run Loop

**Files:**
- Create: `web/src/stores/gameStoreState.js`
- Create: `web/src/stores/gameStoreSnapshots.js`
- Create: `web/src/stores/__tests__/GameStore.test.js`
- Modify: `web/src/stores/GameStore.js`

- [ ] **Step 1: Write the failing test**

Create `web/src/stores/__tests__/GameStore.test.js`:

```js
import { describe, expect, it } from 'vitest'
import GameStore from '../GameStore.js'

function createStore() {
  return new GameStore({}, { autoStart: false })
}

describe('GameStore', () => {
  it('adds passive shishki from building production', () => {
    const store = createStore()
    store._state.buildings.garagePicker = 10
    store.applyPassiveIncome(10)

    expect(store.state.shishki).toBeGreaterThan(0)
    expect(store.state.totalShishkiEarned).toBeGreaterThan(0)
  })

  it('closes quotas and grants heavenly shishki before rebirth', () => {
    const store = createStore()
    store.commitState({
      ...store._state,
      shishki: 5_000,
      currentRunShishki: 5_000,
      lifetimeShishkiEarned: 5_000,
      totalShishkiEarned: 5_000,
    })

    store.resolveQuotaProgress()

    expect(store.state.heavenlyShishki).toBeGreaterThan(0)
    expect(store.state.quotaIndex).toBeGreaterThan(0)
  })

  it('keeps heavenly shishki and tar lumps through rebirth', () => {
    const store = createStore()
    store.commitState({
      ...store._state,
      heavenlyShishki: 3,
      totalHeavenlyShishkiEarned: 3,
      tarLumps: 2,
      quotaIndex: 2,
      buildings: {
        ...store._state.buildings,
        garagePicker: 20,
      },
    })

    store.prestigeReset()

    expect(store.state.heavenlyShishki).toBe(3)
    expect(store.state.tarLumps).toBe(2)
    expect(store.state.buildings.garagePicker).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/stores/__tests__/GameStore.test.js`

Expected: FAIL because the current `GameStore` still expects `money`, `knowledge`, `subscriptions`, and `prestigeShards`.

- [ ] **Step 3: Write minimal implementation**

Create `web/src/stores/gameStoreState.js`:

```js
import { STARTING_STATE } from '../game/economyConfig.js'

export function createFreshState() {
  return JSON.parse(JSON.stringify(STARTING_STATE))
}

export function mergeState(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return createFreshState()
  }

  return {
    ...createFreshState(),
    ...saved,
    buildings: {
      ...STARTING_STATE.buildings,
      ...(saved.buildings ?? {}),
    },
    buildingLevels: {
      ...STARTING_STATE.buildingLevels,
      ...(saved.buildingLevels ?? {}),
    },
    upgrades: {
      ...STARTING_STATE.upgrades,
      ...(saved.upgrades ?? {}),
    },
    prestigeUpgrades: {
      ...STARTING_STATE.prestigeUpgrades,
      ...(saved.prestigeUpgrades ?? {}),
    },
    market: {
      ...STARTING_STATE.market,
      ...(saved.market ?? {}),
      prices: {
        ...STARTING_STATE.market.prices,
        ...(saved.market?.prices ?? {}),
      },
      positions: {
        ...STARTING_STATE.market.positions,
        ...(saved.market?.positions ?? {}),
      },
      averageBuyPrice: {
        ...STARTING_STATE.market.averageBuyPrice,
        ...(saved.market?.averageBuyPrice ?? {}),
      },
    },
  }
}
```

Create `web/src/stores/gameStoreSnapshots.js`:

```js
import {
  BUILDINGS,
  MARKET_GOODS,
  RAP_CAMPAIGNS,
  RUN_UPGRADES,
} from '../game/economyConfig.js'
import {
  deriveProduction,
  getBuildingCost,
  getCampaignById,
  getQuotaTarget,
} from '../game/economyMath.js'

export function buildEconomySnapshot(state) {
  const production = deriveProduction(state)
  return {
    buildings: BUILDINGS.map((building) => {
      const owned = state.buildings[building.id] ?? 0
      return {
        ...building,
        owned,
        cost: getBuildingCost(building.baseCost, owned),
        canBuy: state.shishki >= getBuildingCost(building.baseCost, owned),
      }
    }),
    upgrades: RUN_UPGRADES.map((upgrade) => ({
      ...upgrade,
      level: state.upgrades[upgrade.id] ?? 0,
    })),
    marketGoods: MARKET_GOODS.map((good) => ({
      ...good,
      price: state.market.prices[good.id],
      owned: state.market.positions[good.id],
    })),
    campaigns: RAP_CAMPAIGNS.map((campaign) => ({
      ...campaign,
      active: state.activeCampaign?.id === campaign.id,
    })),
    production,
  }
}

export function buildMetaSnapshot(state) {
  return {
    heavenlyShishki: state.heavenlyShishki,
    tarLumps: state.tarLumps,
    quotaIndex: state.quotaIndex,
    currentRunShishki: state.currentRunShishki,
    currentQuotaTarget: getQuotaTarget(1_000, 2, state.quotaIndex),
    nextCampaign: state.activeCampaign
      ? getCampaignById(state.activeCampaign.id)
      : null,
  }
}
```

Replace `web/src/stores/GameStore.js` core shape with:

```js
import { startTransition } from 'react'
import { computed, makeAutoObservable, runInAction } from 'mobx'
import {
  STARTING_STATE,
  BUILDINGS,
} from '../game/config.js'
import {
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  getBuildingCost,
  getCampaignById,
  resolveQuotaClosures,
} from '../game/economyMath.js'
import {
  createFreshState,
  mergeState,
} from './gameStoreState.js'
import {
  buildEconomySnapshot,
  buildMetaSnapshot,
} from './gameStoreSnapshots.js'

export default class GameStore {
  constructor(rootStore, options = {}) {
    this.rootStore = rootStore
    this._state = createFreshState()
    this.uiSnapshotState = this._state
    this.initialized = false
    this.lastTickAt = 0
    this.clientRevision = 0

    makeAutoObservable(this, {
      rootStore: false,
      initialized: false,
      lastTickAt: false,
      clientRevision: false,
      economy: computed.struct,
      meta: computed.struct,
    }, { autoBind: true })

    if (options.autoStart !== false) {
      this.start()
    }
  }

  get derived() {
    return deriveProduction(this._state)
  }

  get state() {
    return {
      ...this._state,
      ...this.derived,
    }
  }

  get uiState() {
    return this.state
  }

  get economy() {
    return buildEconomySnapshot(this._state)
  }

  get uiEconomy() {
    return this.economy
  }

  get meta() {
    return buildMetaSnapshot(this._state)
  }

  get prestige() {
    return this.meta
  }

  get uiPrestige() {
    return this.meta
  }

  commitState(nextState) {
    this._state = nextState
    this.uiSnapshotState = nextState
    this.clientRevision += 1
  }

  resolveQuotaProgress() {
    const resolved = resolveQuotaClosures({
      quotaIndex: this._state.quotaIndex,
      currentRunShishki: this._state.currentRunShishki,
      heavenlyShishki: this._state.heavenlyShishki,
      totalHeavenlyShishkiEarned: this._state.totalHeavenlyShishkiEarned,
    })

    this.commitState({
      ...this._state,
      quotaIndex: resolved.quotaIndex,
      heavenlyShishki: resolved.heavenlyShishki,
      totalHeavenlyShishkiEarned: resolved.totalHeavenlyShishkiEarned,
    })
  }

  applyPassiveIncome(seconds) {
    if (seconds <= 0) return

    const production = deriveProduction(this._state)
    const shishkiGain = production.shishkiPerSecond * seconds
    const withIncome = {
      ...this._state,
      shishki: this._state.shishki + shishkiGain,
      currentRunShishki: this._state.currentRunShishki + shishkiGain,
      totalShishkiEarned: this._state.totalShishkiEarned + shishkiGain,
      lifetimeShishkiEarned: this._state.lifetimeShishkiEarned + shishkiGain,
    }

    this.commitState(accrueTarLumps(withIncome, seconds * 1000))
    this.resolveQuotaProgress()
  }

  buyBuilding(id) {
    const building = BUILDINGS.find((item) => item.id === id)
    if (!building) return
    const owned = this._state.buildings[id] ?? 0
    const cost = getBuildingCost(building.baseCost, owned)
    if (this._state.shishki < cost) return

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - cost,
      buildings: {
        ...this._state.buildings,
        [id]: owned + 1,
      },
    })
  }

  buyMarketGood(goodId, quantity = 1) {
    const trade = applyMarketTrade({
      state: this._state,
      goodId,
      quantity,
      side: 'buy',
    })
    this.commitState(trade.nextState)
  }

  sellMarketGood(goodId, quantity = 1) {
    const trade = applyMarketTrade({
      state: this._state,
      goodId,
      quantity,
      side: 'sell',
    })
    this.commitState(trade.nextState)
  }

  activateCampaign(campaignId) {
    const campaign = getCampaignById(campaignId)
    if (!campaign || this._state.shishki < campaign.cost) return

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - campaign.cost,
      activeCampaign: {
        id: campaign.id,
        title: campaign.title,
        productionBoost: campaign.productionBoost,
        clickBoost: campaign.clickBoost,
        eventBoost: campaign.eventBoost,
        endsAt: Date.now() + campaign.durationMs,
      },
    })
  }

  prestigeReset() {
    this.commitState({
      ...createFreshState(),
      heavenlyShishki: this._state.heavenlyShishki,
      totalHeavenlyShishkiEarned: this._state.totalHeavenlyShishkiEarned,
      tarLumps: this._state.tarLumps,
      tarLumpProgressMs: this._state.tarLumpProgressMs,
      buildingLevels: this._state.buildingLevels,
      prestigeUpgrades: this._state.prestigeUpgrades,
      achievements: this._state.achievements,
      rebirths: this._state.rebirths + 1,
      lifetimeShishkiEarned: this._state.lifetimeShishkiEarned,
      manualClicks: this._state.manualClicks,
    })
  }

  importGameSave(saveData, options = {}) {
    this.commitState(mergeState(saveData))
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/stores/__tests__/GameStore.test.js`

Expected: PASS with all store behavior tests green.

- [ ] **Step 5: Commit**

```bash
git add web/src/stores/gameStoreState.js web/src/stores/gameStoreSnapshots.js web/src/stores/__tests__/GameStore.test.js web/src/stores/GameStore.js
git commit -m "feat: rebuild game store for shishki economy"
```

## Task 5: Add The Market Tab And Render Tradable Goods

**Files:**
- Create: `web/src/components/market/MarketScreen.jsx`
- Create: `web/src/components/market/MarketTicker.jsx`
- Create: `web/src/components/market/MarketPortfolio.jsx`
- Create: `web/src/components/market/MarketTradePanel.jsx`
- Create: `web/src/components/market/__tests__/MarketScreen.test.jsx`
- Modify: `web/src/context/NavContext.jsx`
- Modify: `web/src/components/wrapper/AppWrapper.jsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/components/market/__tests__/MarketScreen.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import { MarketScreen } from '../MarketScreen.jsx'

const store = {
  gameStore: {
    economy: {
      marketGoods: [
        { id: 'parallelImport', title: 'Параллельный завоз', price: 110, owned: 3 },
      ],
      campaigns: [
        { id: 'iceFlexer', title: 'Ледяной флексер', active: false, cost: 8000 },
      ],
    },
    state: { shishki: 5000, activeCampaign: null },
    buyMarketGood: () => {},
    sellMarketGood: () => {},
    activateCampaign: () => {},
  },
}

describe('MarketScreen', () => {
  it('renders market goods and hype campaigns', () => {
    render(
      <StoresContext.Provider value={store}>
        <MarketScreen />
      </StoresContext.Provider>,
    )

    expect(screen.getByText('Параллельный завоз')).toBeInTheDocument()
    expect(screen.getByText('Ледяной флексер')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/components/market/__tests__/MarketScreen.test.jsx`

Expected: FAIL because the market components and tab wiring do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `web/src/components/market/MarketTicker.jsx`:

```jsx
export function MarketTicker({ goods }) {
  return (
    <section className="market-panel">
      <h3>Биржа серого шума</h3>
      <ul className="market-ticker">
        {goods.map((good) => (
          <li key={good.id}>
            <strong>{good.title}</strong> · {good.price} шишек
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Create `web/src/components/market/MarketPortfolio.jsx`:

```jsx
export function MarketPortfolio({ goods, onSell }) {
  return (
    <section className="market-panel">
      <h3>Портфель</h3>
      <ul className="market-portfolio">
        {goods.map((good) => (
          <li key={good.id}>
            {good.title} · {good.owned} шт.
            <button type="button" onClick={() => onSell(good.id, 1)} disabled={good.owned <= 0}>
              Продать 1
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Create `web/src/components/market/MarketTradePanel.jsx`:

```jsx
export function MarketTradePanel({ goods, campaigns, onBuy, onCampaign }) {
  return (
    <section className="market-panel">
      <h3>Сделки и прогревы</h3>
      <div className="market-trade-grid">
        {goods.map((good) => (
          <button key={good.id} type="button" onClick={() => onBuy(good.id, 1)}>
            Купить 1 {good.title}
          </button>
        ))}
      </div>
      <div className="market-campaign-grid">
        {campaigns.map((campaign) => (
          <button key={campaign.id} type="button" onClick={() => onCampaign(campaign.id)}>
            {campaign.title}
          </button>
        ))}
      </div>
    </section>
  )
}
```

Create `web/src/components/market/MarketScreen.jsx`:

```jsx
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { MarketTicker } from './MarketTicker.jsx'
import { MarketPortfolio } from './MarketPortfolio.jsx'
import { MarketTradePanel } from './MarketTradePanel.jsx'

export const MarketScreen = observer(function MarketScreen() {
  const { economy, buyMarketGood, sellMarketGood, activateCampaign } = useGameStore()

  return (
    <section className="screen market-screen">
      <div className="screen__header">
        <span className="screen__kicker">Рынок</span>
        <h2 className="screen__title">Серая биржа и прогревы</h2>
        <p className="screen__desc">
          Торгуй дефицитом, двигай цены и покупай подозрительный шум.
        </p>
      </div>

      <MarketTicker goods={economy.marketGoods} />
      <MarketPortfolio goods={economy.marketGoods} onSell={sellMarketGood} />
      <MarketTradePanel
        goods={economy.marketGoods}
        campaigns={economy.campaigns}
        onBuy={buyMarketGood}
        onCampaign={activateCampaign}
      />
    </section>
  )
})
```

Update `web/src/context/NavContext.jsx`:

```jsx
import { Coin, Community, Scroll, Settings, Trophy } from '../lib/pxlkit'

export const TABS = [
  { id: 'clicker', icon: <ConeIcon />, label: 'Кликер', description: 'Кликай шишку и лови события' },
  { id: 'subscriptions', icon: <PixelNavIcon icon={Community} label="Здания" />, label: 'Здания', description: 'Покупай шишечное производство' },
  { id: 'upgrades', icon: <PixelNavIcon icon={Scroll} label="Улучшения" />, label: 'Улучшения', description: 'Усиливай клик, рынок и события' },
  { id: 'market', icon: <PixelNavIcon icon={Coin} label="Рынок" />, label: 'Рынок', description: 'Торгуй серым дефицитом и шумом' },
  { id: 'meta', icon: <PixelNavIcon icon={Trophy} label="Мета" />, label: 'Мета', description: 'Небесные шишки и комочки' },
  { id: 'settings', icon: <PixelNavIcon icon={Settings} label="Настройки" />, label: 'Настройки', description: 'Звук и сохранения' },
]
```

Update `web/src/components/wrapper/AppWrapper.jsx`:

```jsx
export const loadMarketScreen = () => import('../market/MarketScreen')

const screenLoaders = {
  clicker: loadClickerScreen,
  subscriptions: loadShopScreen,
  upgrades: loadShopScreen,
  market: loadMarketScreen,
  meta: loadMetaScreen,
  settings: loadSettingsScreen,
}

if (tabId === 'market') {
  registerLoadedScreen('market', module.MarketScreen)
  return
}

case 'market':
  return <ScreenComponent />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/components/market/__tests__/MarketScreen.test.jsx`

Expected: PASS with the market UI smoke test green.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/market/MarketScreen.jsx web/src/components/market/MarketTicker.jsx web/src/components/market/MarketPortfolio.jsx web/src/components/market/MarketTradePanel.jsx web/src/components/market/__tests__/MarketScreen.test.jsx web/src/context/NavContext.jsx web/src/components/wrapper/AppWrapper.jsx
git commit -m "feat: add market tab and trading screen"
```

## Task 6: Rewrite Shop, Meta, Clicker, Dev Console, And Presence Around The New Economy

**Files:**
- Create: `web/src/components/ui/devConsoleCommands.js`
- Create: `web/src/components/ui/__tests__/devConsoleCommands.test.js`
- Modify: `web/src/components/shop/ShopScreen.jsx`
- Modify: `web/src/components/meta/MetaScreen.jsx`
- Modify: `web/src/components/clicker/ProgressOverview.jsx`
- Modify: `web/src/components/clicker/ClickerScreen.jsx`
- Modify: `web/src/components/ui/DevConsole.jsx`
- Modify: `web/src/lib/discordPresence.js`

- [ ] **Step 1: Write the failing test**

Create `web/src/components/ui/__tests__/devConsoleCommands.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { parseDevCommand } from '../devConsoleCommands.js'

describe('parseDevCommand', () => {
  it('accepts the new economy resources only', () => {
    expect(parseDevCommand('give shishki 100')).toEqual({
      type: 'give',
      key: 'shishki',
      value: 100,
    })

    expect(parseDevCommand('give heavenly 2')).toEqual({
      type: 'give',
      key: 'heavenlyShishki',
      value: 2,
    })

    expect(parseDevCommand('give money 100')).toEqual({
      type: 'invalid',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/components/ui/__tests__/devConsoleCommands.test.js`

Expected: FAIL because `devConsoleCommands.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `web/src/components/ui/devConsoleCommands.js`:

```js
const KEY_BY_ALIAS = {
  shishki: 'shishki',
  heavenly: 'heavenlyShishki',
  lumps: 'tarLumps',
}

export function parseDevCommand(input) {
  const cmd = input.trim().toLowerCase()

  if (cmd === 'status') {
    return { type: 'status' }
  }

  const patchMatch = cmd.match(/^(give|set)\s+(shishki|heavenly|lumps)\s+([0-9eE+.]+)$/)
  if (!patchMatch) {
    return { type: 'invalid' }
  }

  const [, type, resourceAlias, rawValue] = patchMatch
  const value = Number(rawValue)
  if (!Number.isFinite(value) || value < 0) {
    return { type: 'invalid' }
  }

  return {
    type,
    key: KEY_BY_ALIAS[resourceAlias],
    value,
  }
}
```

Update `web/src/components/ui/DevConsole.jsx` to use the parser:

```jsx
import { parseDevCommand } from './devConsoleCommands.js'

const RESOURCES = [
  { key: 'shishki', label: 'Шишки', icon: <ConeIcon /> },
  { key: 'heavenlyShishki', label: 'Небесные шишки', icon: <PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" /> },
  { key: 'tarLumps', label: 'Смоляные комочки', icon: <PxlKitIcon icon={Scroll} size={16} colorful className="pixel-inline-icon" /> },
]

const parsed = parseDevCommand(cmd)
if (parsed.type === 'give') {
  _devGiveResource(parsed.key, parsed.value)
  pushLog(`+${formatNumber(parsed.value)} к ${parsed.key}`, 'success')
  return
}

if (parsed.type === 'set') {
  _devSetResource(parsed.key, parsed.value)
  pushLog(`${parsed.key} = ${formatNumber(parsed.value)}`, 'success')
  return
}
```

Rewrite `web/src/components/shop/ShopScreen.jsx` header copy:

```jsx
const SCREEN_META = {
  subscriptions: {
    kicker: 'Производство',
    title: 'Здания',
    desc: 'Строй шишечную машину от гаражей до министерства логистики.',
    accent: 'orange',
    emptyText: 'Здания прогружаются...',
    categories: [
      { id: 'street', title: 'Улица и старт', desc: 'Гаражи, ПВЗ и ранняя серость.', icon: Community },
      { id: 'fulfillment', title: 'Склад и логистика', desc: 'Сортировка, самозанятые и фулфилмент.', icon: Package },
      { id: 'media', title: 'Шум и прогрев', desc: 'Инфошум, нейро-контент и спрос из воздуха.', icon: Scroll },
      { id: 'late', title: 'Системный абсурд', desc: 'Кредитный конвейер и министерство шишек.', icon: Trophy },
    ],
  },
  upgrades: {
    kicker: 'Усиления',
    title: 'Улучшения',
    desc: 'Разгоняй клик, рынок, события и грязный медийный шум.',
    accent: 'orange',
    emptyText: 'Улучшения прогружаются...',
    categories: [
      { id: 'click', title: 'Клик и суета', desc: 'Ручной темп и короткие окна силы.', icon: Target },
      { id: 'industry', title: 'Складская машина', desc: 'Мультипликаторы зданий и конвейера.', icon: Package },
      { id: 'market', title: 'Биржа и серость', desc: 'Комиссии, брокеры и спекуляция.', icon: Coin },
      { id: 'hype', title: 'Прогрев', desc: 'Рэп-амбассадоры, хайп и рекомендательные всплески.', icon: SocialStar },
    ],
  },
}
```

Rewrite `web/src/components/meta/MetaScreen.jsx` copy and stats shape:

```jsx
const prestigeStats = [
  { iconKey: 'rebirth', label: 'Ребёрсов', value: formatNumber(uiState.rebirths), hint: 'сделано циклов' },
  { iconKey: 'shards', label: 'Небесные', value: formatNumber(uiState.heavenlyShishki), hint: 'на руках сейчас' },
  { icon: pxl(Scroll, 'комочки', 18), label: 'Комочки', value: formatNumber(uiState.tarLumps), hint: 'редкий мета-ресурс' },
]
```

Rewrite `web/src/components/clicker/ProgressOverview.jsx` around the new metrics:

```jsx
const cards = [
  { iconKey: 'cone', label: 'Шишки/сек', value: formatNumber(uiState.shishkiPerSecond), hint: 'производство прямо сейчас' },
  { iconKey: 'rebirth', label: 'Квота', value: `${formatNumber(uiPrestige.currentRunShishki)} / ${formatNumber(uiPrestige.currentQuotaTarget)}`, hint: 'небесные шишки за жизнь' },
  { iconKey: 'shards', label: 'Небесные', value: formatNumber(uiState.heavenlyShishki), hint: 'собрано без ребёрса' },
  { iconKey: 'knowledge', label: 'Комочки', value: formatNumber(uiState.tarLumps), hint: 'улучшают здания навсегда' },
]
```

Rewrite `web/src/components/clicker/ClickerScreen.jsx` to surface event or hype state:

```jsx
export function ClickerScreen() {
  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout clicker-layout--pixel">
        <section className="clicker-layout__stats clicker-layout__pane">
          <ProgressStatsPanel />
        </section>

        <section className="clicker-layout__hero clicker-layout__pane clicker-layout__pane--hero">
          <ClickerButton />
          <div className="clicker-event-banner">
            Лови события, закрывай квоты и раскручивай шум.
          </div>
        </section>

        <section className="clicker-layout__meta clicker-layout__pane">
          <ProgressMetaPanel />
        </section>
      </div>

      <div className="clicker-below clicker-below--pixel">
        <ProgressOverview hideStats hideMeta />
      </div>
    </section>
  )
}
```

Update `web/src/lib/discordPresence.js`:

```js
const PRESENCE_DETAILS_BY_TAB = {
  clicker: 'Кликает по шишке',
  subscriptions: 'Строит шишечную машину',
  upgrades: 'Разгоняет рынок и прогрев',
  market: 'Торгует на серой бирже',
  meta: 'Планирует ребёрс',
  settings: 'Настраивает игру',
}

function buildPresenceState(activeTab, gameState, economy) {
  const buildingLevels = sumLevels(gameState?.buildings)
  const heavenlyShishki = Number(gameState?.heavenlyShishki ?? 0)
  const tarLumps = Number(gameState?.tarLumps ?? 0)
  const shishkiPerSecond = Number(economy?.shishkiPerSecond ?? 0)

  const partsByTab = {
    clicker: [`Шишки/с: ${formatNumber(shishkiPerSecond)}`, `Квот: ${formatNumber(gameState?.quotaIndex ?? 0)}`],
    subscriptions: [`Зданий: ${formatNumber(buildingLevels)}`, `Шишки/с: ${formatNumber(shishkiPerSecond)}`],
    upgrades: [`Апгрейдов: ${formatNumber(sumLevels(gameState?.upgrades))}`, `Комочки: ${formatNumber(tarLumps)}`],
    market: [`Портфель: ${formatNumber(sumLevels(gameState?.market?.positions))}`, `Небесные: ${formatNumber(heavenlyShishki)}`],
    meta: [`Небесные: ${formatNumber(heavenlyShishki)}`, `Комочки: ${formatNumber(tarLumps)}`],
    settings: [`Ачивок: ${formatNumber(countUnlockedAchievements(gameState?.achievements))}`, `v${APP_VERSION}`],
  }

  return (partsByTab[activeTab] ?? partsByTab.clicker).join(' • ')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/components/ui/__tests__/devConsoleCommands.test.js`

Expected: PASS with the new parser behavior green.

- [ ] **Step 5: Run integration verification**

Run: `pnpm --dir web test`
Expected: PASS with all Vitest suites green.

Run: `pnpm --dir web build`
Expected: PASS with a production bundle and no unresolved imports.

Run: `pnpm lint`
Expected: PASS with no new lint errors.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/ui/devConsoleCommands.js web/src/components/ui/__tests__/devConsoleCommands.test.js web/src/components/shop/ShopScreen.jsx web/src/components/meta/MetaScreen.jsx web/src/components/clicker/ProgressOverview.jsx web/src/components/clicker/ClickerScreen.jsx web/src/components/ui/DevConsole.jsx web/src/lib/discordPresence.js
git commit -m "feat: rewrite ui for the new shishki economy"
```

## Task 7: Expand Economy Content To Spec Scale

**Files:**
- Modify: `web/src/game/economyConfig.js`
- Modify: `web/src/game/economyMath.js`
- Modify: `web/src/game/metaConfig.js`
- Test: `web/src/game/__tests__/economyMath.test.js`

- [ ] **Step 1: Write the failing test**

Extend `web/src/game/__tests__/economyMath.test.js`:

```js
it('defines the full late-game building ladder and richer content pools', () => {
  expect(BUILDINGS).toHaveLength(15)
  expect(BUILDINGS.map((item) => item.id)).toContain('greyImportExchange')
  expect(BUILDINGS.map((item) => item.id)).toContain('shishkaLogisticsMinistry')
  expect(RUN_UPGRADES.length).toBeGreaterThanOrEqual(8)
  expect(PRESTIGE_UPGRADES.length).toBeGreaterThanOrEqual(6)
  expect(MARKET_GOODS.length).toBeGreaterThanOrEqual(8)
  expect(RAP_CAMPAIGNS.length).toBeGreaterThanOrEqual(4)
  expect(EVENT_DEFINITIONS.length).toBeGreaterThanOrEqual(6)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/game/__tests__/economyMath.test.js`

Expected: FAIL because the current config is still MVP-sized.

- [ ] **Step 3: Write minimal implementation**

Expand `web/src/game/economyConfig.js`:

```js
export const BUILDINGS = [
  { id: 'garagePicker', title: 'Сборщик шишек у гаражей', baseCost: 15, baseOutput: 0.1, fieldCode: 'GR' },
  { id: 'pickupPoint', title: 'ПВЗ на окраине', baseCost: 100, baseOutput: 1, fieldCode: 'PV' },
  { id: 'greySorting', title: 'Серая сортировка', baseCost: 1_100, baseOutput: 8, fieldCode: 'GS' },
  { id: 'selfEmployedCrew', title: 'Бригада самозанятых', baseCost: 12_000, baseOutput: 47, fieldCode: 'SE' },
  { id: 'resaleStall', title: 'Ларёк перепродажи', baseCost: 130_000, baseOutput: 260, fieldCode: 'RS' },
  { id: 'tarBoiler', title: 'Смоляной цех', baseCost: 1_400_000, baseOutput: 1_400, fieldCode: 'TB' },
  { id: 'shadowFulfillment', title: 'Подпольный фулфилмент', baseCost: 20_000_000, baseOutput: 7_800, fieldCode: 'SF' },
  { id: 'cardFactory', title: 'Фабрика карточек товара', baseCost: 330_000_000, baseOutput: 44_000, fieldCode: 'CF' },
  { id: 'noiseAgency', title: 'Агентство инфошума', baseCost: 5_100_000_000, baseOutput: 210_000, fieldCode: 'NA' },
  { id: 'creditConveyor', title: 'Кредитный конвейер', baseCost: 78_000_000_000, baseOutput: 1_100_000, fieldCode: 'CC' },
  { id: 'lastMileFleet', title: 'Автопарк последней мили', baseCost: 1_100_000_000_000, baseOutput: 5_400_000, fieldCode: 'LM' },
  { id: 'optimizationTemple', title: 'Храм оптимизации', baseCost: 16_000_000_000_000, baseOutput: 28_000_000, fieldCode: 'OT' },
  { id: 'neuroFarm', title: 'Нейро-ферма контента', baseCost: 240_000_000_000_000, baseOutput: 130_000_000, fieldCode: 'NF' },
  { id: 'greyImportExchange', title: 'Биржа серого импорта', baseCost: 3_600_000_000_000_000, baseOutput: 710_000_000, fieldCode: 'GI' },
  { id: 'shishkaLogisticsMinistry', title: 'Министерство шишечной логистики', baseCost: 52_000_000_000_000_000, baseOutput: 4_000_000_000, fieldCode: 'ML' },
]

export const RUN_UPGRADES = [
  { id: 'warehouseRhythm', title: 'Складской ритм', kind: 'globalMultiplier', cost: 250, value: 0.2, fieldCode: 'WR' },
  { id: 'cashbackBug', title: 'Ошибочный кэшбэк', kind: 'clickMultiplier', cost: 600, value: 1, fieldCode: 'CB' },
  { id: 'boxPanic', title: 'Паника коробок', kind: 'buildingMultiplier', target: 'greySorting', cost: 4_000, value: 0.35, fieldCode: 'BP' },
  { id: 'pickupRush', title: 'Пятничный разбор ПВЗ', kind: 'buildingMultiplier', target: 'pickupPoint', cost: 9_000, value: 0.45, fieldCode: 'PR' },
  { id: 'feedHijack', title: 'Захват ленты', kind: 'eventBoost', cost: 60_000, value: 0.15, fieldCode: 'FH' },
  { id: 'greyMargin', title: 'Серая маржа', kind: 'marketDiscount', cost: 140_000, value: 0.02, fieldCode: 'GM' },
  { id: 'conveyorMadness', title: 'Конвейер без тормозов', kind: 'lateMultiplier', cost: 1_800_000, value: 0.25, fieldCode: 'CM' },
  { id: 'viralDust', title: 'Пыль рекомендации', kind: 'campaignBoost', cost: 6_500_000, value: 0.2, fieldCode: 'VD' },
]

export const PRESTIGE_UPGRADES = [
  { id: 'heavenlyTar', title: 'Небесная смола', baseCost: 1, value: 0.15, fieldCode: 'HT' },
  { id: 'taxBlindness', title: 'Налоговая слепота', baseCost: 2, value: 0.01, fieldCode: 'TB' },
  { id: 'warehouseCult', title: 'Культ складского чуда', baseCost: 4, value: 0.2, fieldCode: 'WC' },
  { id: 'greyAccreditation', title: 'Серая аккредитация', baseCost: 6, value: 1, fieldCode: 'GA' },
  { id: 'hyperLogistics', title: 'Гиперлогистика', baseCost: 10, value: 0.2, fieldCode: 'HL' },
  { id: 'archiveDust', title: 'Пыль архивов', baseCost: 16, value: 0.15, fieldCode: 'AD' },
]

export const MARKET_GOODS = [
  { id: 'pickupPointLeftovers', title: 'Остатки с ПВЗ', basePrice: 40, profile: 'stable', fieldCode: 'OP' },
  { id: 'parallelImport', title: 'Параллельный завоз', basePrice: 100, profile: 'volatile', fieldCode: 'PI' },
  { id: 'neuroCover', title: 'Нейро-обложки', basePrice: 75, profile: 'hype', fieldCode: 'NC' },
  { id: 'counterfeitDrop', title: 'Паль', basePrice: 55, profile: 'trash', fieldCode: 'PL' },
  { id: 'cashbackCoupons', title: 'Кэшбэк-купоны', basePrice: 90, profile: 'manipulated', fieldCode: 'KC' },
  { id: 'returnCargo', title: 'Возвратный товар', basePrice: 120, profile: 'volatile', fieldCode: 'VT' },
  { id: 'courierSlots', title: 'Курьерские слоты', basePrice: 160, profile: 'scarcity', fieldCode: 'KS' },
  { id: 'deficitBoxes', title: 'Дефицитные коробки', basePrice: 210, profile: 'hype', fieldCode: 'DK' },
  { id: 'marketplaceCourse', title: 'Инфокурс по маркетплейсам', basePrice: 310, profile: 'manipulated', fieldCode: 'IK' },
  { id: 'greySupplies', title: 'Серые расходники', basePrice: 260, profile: 'stable', fieldCode: 'SR' },
]

export const RAP_CAMPAIGNS = [
  { id: 'iceFlexer', title: 'Ледяной флексер', cost: 8_000, durationMs: 90_000, productionBoost: 0, clickBoost: 2, eventBoost: 0.1, fieldCode: 'IF' },
  { id: 'sundayProphet', title: 'Воскресный пророк', cost: 15_000, durationMs: 180_000, productionBoost: 0.35, clickBoost: 0, eventBoost: 0.15, fieldCode: 'VP' },
  { id: 'promoBadBoy', title: 'Плохой парень с промо', cost: 140_000, durationMs: 120_000, productionBoost: 0.15, clickBoost: 1, eventBoost: 0.25, fieldCode: 'PB' },
  { id: 'districtRomantic', title: 'Мрачный романтик района', cost: 600_000, durationMs: 240_000, productionBoost: 0.5, clickBoost: 0, eventBoost: 0.05, fieldCode: 'DR' },
]

export const EVENT_DEFINITIONS = [
  { id: 'cashbackMist', title: 'Ошибочный кэшбэк', kind: 'instantBurst', fieldCode: 'OK' },
  { id: 'greyArrival', title: 'Серый завоз', kind: 'marketSpike', fieldCode: 'SZ' },
  { id: 'bugSale', title: 'Распродажа с багом', kind: 'discount', fieldCode: 'RB' },
  { id: 'warehouseFlood', title: 'Склад прорвало товаром', kind: 'productionBoost', fieldCode: 'SP' },
  { id: 'infoWarmup', title: 'Инфоцыганский прогрев', kind: 'clickBoost', fieldCode: 'IP' },
  { id: 'neuroConversion', title: 'Нейросеть выдала конверсию', kind: 'chain', fieldCode: 'NK' },
]
```

Export `EVENT_DEFINITIONS` from `web/src/game/config.js` and teach `web/src/game/metaConfig.js` to map the extra prestige upgrades.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/game/__tests__/economyMath.test.js`

Expected: PASS with the richer content pools.

- [ ] **Step 5: Commit**

```bash
git add web/src/game/economyConfig.js web/src/game/economyMath.js web/src/game/metaConfig.js web/src/game/__tests__/economyMath.test.js
git commit -m "feat: expand shishka economy content"
```

## Task 8: Add Clicker Field Panels And Shared Placeholder Sprites

**Files:**
- Create: `web/src/components/clicker/ProgressFieldPanel.jsx`
- Create: `web/src/components/clicker/ProgressSprite.jsx`
- Create: `web/src/components/ui/EntityPlaceholderIcon.jsx`
- Create: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
- Create: `web/src/components/ui/__tests__/EntityPlaceholderIcon.test.jsx`
- Modify: `web/src/stores/gameStoreSnapshots.js`
- Modify: `web/src/components/clicker/ClickerScreen.jsx`
- Modify: `web/src/styles/layout.css`

- [ ] **Step 1: Write the failing test**

Create `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`:

```jsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressFieldPanel } from '../ProgressFieldPanel.jsx'

describe('ProgressFieldPanel', () => {
  it('renders 32x32 field entities with state labels', () => {
    render(
      <ProgressFieldPanel
        title="Здания"
        items={[
          { id: 'garagePicker', title: 'Сборщик', code: 'GR', type: 'building', state: 'owned', count: 3 },
          { id: 'pickupPoint', title: 'ПВЗ', code: 'PV', type: 'building', state: 'locked', count: 0 },
        ]}
      />,
    )

    expect(screen.getByText('Здания')).toBeInTheDocument()
    expect(screen.getByLabelText('Сборщик')).toBeInTheDocument()
    expect(screen.getByLabelText('ПВЗ')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

Expected: FAIL because the field components do not exist.

- [ ] **Step 3: Write minimal implementation**

Create `web/src/components/ui/EntityPlaceholderIcon.jsx`:

```jsx
const TYPE_CLASS = {
  building: 'entity-placeholder--building',
  market: 'entity-placeholder--market',
  campaign: 'entity-placeholder--campaign',
  upgrade: 'entity-placeholder--upgrade',
  meta: 'entity-placeholder--meta',
}

export function EntityPlaceholderIcon({ code, label, type, state = 'owned' }) {
  return (
    <span
      className={['entity-placeholder', TYPE_CLASS[type], `is-${state}`].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
    >
      <span>{code}</span>
    </span>
  )
}
```

Create `web/src/components/clicker/ProgressSprite.jsx`:

```jsx
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

export function ProgressSprite({ item }) {
  return (
    <div className="progress-sprite">
      <EntityPlaceholderIcon
        code={item.code}
        label={item.title}
        type={item.type}
        state={item.state}
      />
      {item.count > 1 ? <span className="progress-sprite__count">x{item.count}</span> : null}
    </div>
  )
}
```

Create `web/src/components/clicker/ProgressFieldPanel.jsx`:

```jsx
import { ProgressSprite } from './ProgressSprite.jsx'

export function ProgressFieldPanel({ title, items }) {
  return (
    <section className="progress-field-panel pixel-surface">
      <h3>{title}</h3>
      <div className="progress-field-panel__grid">
        {items.map((item) => (
          <ProgressSprite key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
```

Extend `web/src/stores/gameStoreSnapshots.js`:

```js
export function buildClickerFieldData(state) {
  return {
    buildingsFieldItems: BUILDINGS.map((item) => ({
      id: item.id,
      title: item.title,
      code: item.fieldCode,
      type: 'building',
      state: (state.buildings[item.id] ?? 0) > 0 ? 'owned' : 'locked',
      count: Math.min(9, Math.max(0, state.buildings[item.id] ?? 0)),
    })),
    marketFieldItems: MARKET_GOODS.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      code: item.fieldCode,
      type: 'market',
      state: (state.market.positions[item.id] ?? 0) > 0 ? 'active' : 'locked',
      count: Math.min(9, Math.max(0, state.market.positions[item.id] ?? 0)),
    })),
    metaFieldItems: PRESTIGE_UPGRADES.map((item) => ({
      id: item.id,
      title: item.title,
      code: item.fieldCode,
      type: 'meta',
      state: (state.prestigeUpgrades[item.id] ?? 0) > 0 ? 'upgraded' : 'locked',
      count: state.prestigeUpgrades[item.id] ?? 0,
    })),
  }
}
```

Rewrite `web/src/components/clicker/ClickerScreen.jsx`:

```jsx
import { observer } from 'mobx-react-lite'
import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'
import { ProgressFieldPanel } from './ProgressFieldPanel.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'

export const ClickerScreen = observer(function ClickerScreen() {
  const { clickerFieldData } = useGameStore()

  return (
    <section className="screen clicker-screen clicker-screen--field">
      <div className="clicker-field-layout">
        <ProgressFieldPanel title="Здания" items={clickerFieldData.buildingsFieldItems} />
        <div className="clicker-field-layout__center">
          <ClickerButton />
        </div>
        <ProgressFieldPanel title="Рынок и шум" items={clickerFieldData.marketFieldItems} />
      </div>
      <div className="clicker-field-layout__bottom">
        <ProgressFieldPanel title="Мета и усиления" items={clickerFieldData.metaFieldItems} />
      </div>
      <ProgressOverview />
    </section>
  )
})
```

Update `web/src/styles/layout.css` with adaptive left/center/right plus bottom layout and fixed `32x32` placeholder size.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

Expected: PASS with the new clicker field smoke test.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/clicker/ProgressFieldPanel.jsx web/src/components/clicker/ProgressSprite.jsx web/src/components/ui/EntityPlaceholderIcon.jsx web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx web/src/components/ui/__tests__/EntityPlaceholderIcon.test.jsx web/src/stores/gameStoreSnapshots.js web/src/components/clicker/ClickerScreen.jsx web/src/styles/layout.css
git commit -m "feat: add clicker progress field"
```

## Task 9: Add Placeholder Slots To Economy Cards And Market UI

**Files:**
- Modify: `web/src/components/shop/ShopScreen.jsx`
- Modify: `web/src/components/market/MarketTicker.jsx`
- Modify: `web/src/components/market/MarketTradePanel.jsx`
- Modify: `web/src/styles/shop-screen.css`
- Test: `web/src/components/market/__tests__/MarketScreen.test.jsx`

- [ ] **Step 1: Write the failing test**

Extend `web/src/components/market/__tests__/MarketScreen.test.jsx`:

```jsx
it('renders placeholder tiles for goods and campaigns', () => {
  render(
    <StoresContext.Provider value={store}>
      <MarketScreen />
    </StoresContext.Provider>,
  )

  expect(screen.getAllByText(/PI|IF|NC/).length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web exec vitest run web/src/components/market/__tests__/MarketScreen.test.jsx`

Expected: FAIL because cards and market buttons still have no placeholder slots.

- [ ] **Step 3: Write minimal implementation**

Update `web/src/components/shop/ShopScreen.jsx`:

```jsx
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

function EconomyCard({ title, desc, meta, action, disabled, levelText, placeholderCode, placeholderType }) {
  return (
    <article className="shop-card shop-card--shishki shop-card--rarity-common">
      <div className="shop-card__head">
        <div className="shop-card__visual">
          <EntityPlaceholderIcon code={placeholderCode} label={title} type={placeholderType} state={disabled ? 'locked' : 'owned'} />
        </div>
        <div className="shop-card__meta">
          <div>
            <h3 className="shop-card__title">{title}</h3>
            <p className="shop-card__desc">{desc}</p>
          </div>
        </div>
        <div className="shop-card__chips">
          <span className="shop-card__tier">{levelText}</span>
        </div>
      </div>
```

Pass codes from `item.fieldCode`.

Update `web/src/components/market/MarketTicker.jsx`:

```jsx
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

<li key={good.id}>
  <EntityPlaceholderIcon code={good.fieldCode} label={good.title} type="market" state={good.owned > 0 ? 'active' : 'owned'} />
  <strong>{good.title}</strong> · {formatFullNumber(good.price)} шишек
</li>
```

Update `web/src/components/market/MarketTradePanel.jsx`:

```jsx
<button key={good.id} type="button" onClick={() => onBuy(good.id, 1)} disabled={disabled}>
  <EntityPlaceholderIcon code={good.fieldCode} label={good.title} type="market" state={disabled ? 'locked' : 'owned'} />
  Купить 1 {good.title} · {formatFullNumber(total)} шишек
</button>
```

```jsx
<button key={campaign.id} type="button" onClick={() => onCampaign(campaign.id)} disabled={disabled}>
  <EntityPlaceholderIcon code={campaign.fieldCode} label={campaign.title} type="campaign" state={campaign.active ? 'active' : 'owned'} />
  {campaign.active ? 'Активно: ' : ''}
  {campaign.title} · {formatFullNumber(campaign.cost)} шишек
</button>
```

Update `web/src/styles/shop-screen.css` to add aligned `32x32` visual slots in cards and compact inline placeholders in market rows/buttons.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web exec vitest run web/src/components/market/__tests__/MarketScreen.test.jsx`

Expected: PASS with placeholder assertions green.

- [ ] **Step 5: Run integration verification**

Run: `pnpm --dir web test`
Expected: PASS.

Run: `pnpm --dir web build`
Expected: PASS.

Run: `pnpm -C web lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/shop/ShopScreen.jsx web/src/components/market/MarketTicker.jsx web/src/components/market/MarketTradePanel.jsx web/src/styles/shop-screen.css web/src/components/market/__tests__/MarketScreen.test.jsx
git commit -m "feat: add placeholder visuals across economy cards"
```

## Verification Runbook

After Task 9, run the full project checks from the repo root:

```bash
pnpm --dir web test
pnpm lint
pnpm --dir web build
```

Expected:

- Vitest: all suites pass.
- ESLint: no new warnings or errors.
- Vite build: succeeds with the new `market` tab and no missing imports.

Then manually verify in `pnpm --dir web dev`:

1. Clicking adds `shishki`.
2. Buying buildings increases `shishki/sec`.
3. Quota closes in the same life and adds `heavenlyShishki`.
4. Rebirth resets run progress but keeps `heavenlyShishki`, `tarLumps`, and building levels.
5. Market tab renders goods and allows buy/sell.
6. Media hype campaign buttons start temporary buffs.
7. Dev console accepts `shishki`, `heavenly`, and `lumps`, and rejects `money`.
8. Importing an old save throws `legacy_saves_not_supported`.
9. The clicker hero has no extra banner clutter and renders left/right/bottom progress zones.
10. Shop and market cards show `32x32` placeholder tiles.
