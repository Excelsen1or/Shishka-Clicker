# Upgrade Pool Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the run-upgrade pool from 8 to 20 entries and wire the new click, economy, event, and campaign upgrade types into the existing shop and economy flow.

**Architecture:** Keep all upgrade data inside `RUN_UPGRADES` in `web/src/game/economyConfig.js`, then extend the existing economy math helpers and `GameStore` purchase flow to honor the new kinds. Reuse the current shop card rendering path by teaching `ShopScreen` how to present the new kinds with readable labels and descriptions instead of adding any new screens.

**Tech Stack:** React 19, MobX, Vitest, plain JS config/math modules

---

## File Map

- Modify: `web/src/game/economyConfig.js`
  Adds the new run-upgrade entries and keeps field codes unique.
- Modify: `web/src/game/economyMath.js`
  Adds helper functions for reading upgrade bonuses and applies new upgrade kinds to building costs, upgrade costs, event math, and campaign math.
- Modify: `web/src/stores/GameStore.js`
  Routes purchase calculations through the new math helpers so buying buildings, buying upgrades, and launching campaigns respect the expanded upgrade pool.
- Modify: `web/src/components/shop/ShopScreen.jsx`
  Adds user-facing labels and effect text for the new upgrade kinds.
- Modify: `web/src/components/shop/__tests__/ShopScreen.test.jsx`
  Covers player-facing text for at least one new kind in each new category.
- Modify: `web/src/game/__tests__/economyMath.test.js`
  Covers config shape and math helpers for discount, event, and campaign effects.
- Modify: `web/src/stores/__tests__/GameStore.test.js`
  Covers end-to-end store behavior for discounted purchases and discounted campaign launches.

### Task 1: Expand `RUN_UPGRADES`

**Files:**

- Modify: `web/src/game/economyConfig.js`
- Test: `web/src/game/__tests__/economyMath.test.js`

- [ ] **Step 1: Write the failing config test**

Add expectations to `web/src/game/__tests__/economyMath.test.js` that the new pool includes the new ids and grows to 20 entries.

```js
it('defines the expanded run-upgrade pool', () => {
  expect(RUN_UPGRADES).toHaveLength(20)
  expect(RUN_UPGRADES).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'doubleSwing', kind: 'clickMultiplier' }),
      expect.objectContaining({ id: 'bulkDeal', kind: 'buildingDiscount' }),
      expect.objectContaining({
        id: 'warmBackground',
        kind: 'eventPositiveChance',
      }),
      expect.objectContaining({
        id: 'districtWarmup',
        kind: 'campaignDiscount',
      }),
    ]),
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web test -- src/game/__tests__/economyMath.test.js`

Expected: FAIL because `RUN_UPGRADES` still has the old length and missing ids.

- [ ] **Step 3: Add the new upgrade entries**

Extend `RUN_UPGRADES` in `web/src/game/economyConfig.js` with the agreed additions and keep the existing entries in place:

```js
{
  id: 'doubleSwing',
  fieldCode: 'run_double_swing',
  title: 'Двойной замах',
  kind: 'clickMultiplier',
  cost: 700,
  value: 0.75,
},
{
  id: 'bulkDeal',
  fieldCode: 'run_bulk_deal',
  title: 'Оптовая договорённость',
  kind: 'buildingDiscount',
  cost: 1_200,
  value: 0.03,
},
{
  id: 'warmBackground',
  fieldCode: 'run_warm_background',
  title: 'Тёплый фон',
  kind: 'eventPositiveChance',
  cost: 5_000,
  value: 0.08,
},
{
  id: 'districtWarmup',
  fieldCode: 'run_district_warmup',
  title: 'Прогрев района',
  kind: 'campaignDiscount',
  cost: 12_000,
  value: 0.08,
},
```

Add the remaining planned entries in the same shape:

- `brokenCounter`
- `handTrained`
- `warehouseConcession`
- `nightSlotSale`
- `quietDetour`
- `feedOnStandby`
- `mediaTail`
- `adOverdrive`

Keep `validateUniqueFieldCodes(RUN_UPGRADES, 'run upgrade')` unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --dir web test -- src/game/__tests__/economyMath.test.js`

Expected: PASS for the new pool-size and id coverage test.

- [ ] **Step 5: Commit**

```bash
git add web/src/game/economyConfig.js web/src/game/__tests__/economyMath.test.js
git commit -m "feat: expand run upgrade pool config"
```

### Task 2: Wire new upgrade kinds into economy math

**Files:**

- Modify: `web/src/game/economyMath.js`
- Test: `web/src/game/__tests__/economyMath.test.js`

- [ ] **Step 1: Write failing math tests**

Add focused tests for discount, event, and campaign helpers:

```js
it('applies building discount upgrades to building prices', () => {
  const state = {
    ...STARTING_STATE,
    upgrades: {
      ...STARTING_STATE.upgrades,
      bulkDeal: 1,
      warehouseConcession: 1,
    },
  }

  expect(getBuildingPurchaseCost(state, BUILDINGS[0], 0)).toBe(13)
})

it('applies upgrade discount upgrades to run-upgrade prices', () => {
  const state = {
    ...STARTING_STATE,
    upgrades: { ...STARTING_STATE.upgrades, nightSlotSale: 1 },
  }

  expect(
    getRunUpgradePurchaseCost(
      state,
      RUN_UPGRADES.find((item) => item.id === 'warehouseRhythm'),
      0,
    ),
  ).toBe(380)
})

it('adds event-positive chance from upgrades', () => {
  const state = {
    ...STARTING_STATE,
    market: { ...STARTING_STATE.market, unlocked: true },
    upgrades: { ...STARTING_STATE.upgrades, warmBackground: 1 },
  }

  expect(getEventSpawnChance(state, 1)).toBeGreaterThan(
    getEventSpawnChance(STARTING_STATE, 1),
  )
})

it('discounts campaign launch cost from upgrades', () => {
  const state = {
    ...STARTING_STATE,
    upgrades: { ...STARTING_STATE.upgrades, districtWarmup: 1 },
  }

  expect(getCampaignLaunchCost(state, RAP_CAMPAIGNS[0])).toBe(2300)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir web test -- src/game/__tests__/economyMath.test.js`

Expected: FAIL because the helper functions do not exist yet and current math ignores the new kinds.

- [ ] **Step 3: Implement minimal helper functions**

Add reusable helpers near the existing price/math helpers in `web/src/game/economyMath.js`:

```js
export function getRunUpgradeBonus(state, kind) {
  return RUN_UPGRADES.reduce((total, upgrade) => {
    if (upgrade.kind !== kind) {
      return total
    }

    return total + (state?.upgrades?.[upgrade.id] ?? 0) * upgrade.value
  }, 0)
}

export function getBuildingPurchaseCost(state, building, owned) {
  const purchaseDiscount = getPurchaseDiscount?.(state) ?? 0
  const buildingDiscount = Math.min(
    0.5,
    getRunUpgradeBonus(state, 'buildingDiscount'),
  )

  return Math.max(
    1,
    Math.floor(
      getBuildingCost(building.baseCost, owned) *
        (1 - buildingDiscount - purchaseDiscount),
    ),
  )
}

export function getRunUpgradePurchaseCost(state, upgrade, level) {
  const upgradeDiscount = Math.min(
    0.5,
    getRunUpgradeBonus(state, 'upgradeDiscount'),
  )

  return Math.max(
    1,
    Math.floor(getRunUpgradeCost(upgrade.cost, level) * (1 - upgradeDiscount)),
  )
}
```

Then apply the same pattern to:

- `getEventSpawnChance` with `eventPositiveChance`
- a new negative-event helper for later event penalty scaling with `eventNegativeReduction`
- event duration multiplier using `eventDurationBoost`
- `getCampaignLaunchCost` with `campaignDiscount`
- campaign potency in `deriveProduction` using `campaignEffectBoost`
- campaign duration helper using `campaignDurationBoost`

Keep the implementation additive and capped where needed:

- discounts capped at `50%`
- event spawn chance still capped at `0.45`
- penalty reduction capped at a sane max like `0.5`

- [ ] **Step 4: Route existing math through the new helpers**

Update the existing call sites in `web/src/game/economyMath.js` and `web/src/stores/GameStore.js` to use the helpers instead of duplicating formulas:

```js
const activeCampaignProductionBoost =
  (state?.activeCampaign?.productionBoost ?? 0) *
  (1 + campaignPotencyBonus + getRunUpgradeBonus(state, 'campaignEffectBoost'))
```

```js
const durationMultiplier =
  1 + getRunUpgradeBonus(state, 'campaignDurationBoost')
endsAt: Date.now() + Math.floor(campaign.durationMs * durationMultiplier)
```

Also scale spawned events before storing them:

```js
const eventDurationMultiplier =
  1 + getRunUpgradeBonus(clearedState, 'eventDurationBoost')
const negativeReduction = getRunUpgradeBonus(
  clearedState,
  'eventNegativeReduction',
)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --dir web test -- src/game/__tests__/economyMath.test.js`

Expected: PASS for all new math helper and modifier tests.

- [ ] **Step 6: Commit**

```bash
git add web/src/game/economyMath.js web/src/game/__tests__/economyMath.test.js web/src/stores/GameStore.js
git commit -m "feat: wire upgrade pool into economy math"
```

### Task 3: Update store purchase flow and shop labels

**Files:**

- Modify: `web/src/stores/GameStore.js`
- Modify: `web/src/components/shop/ShopScreen.jsx`
- Test: `web/src/stores/__tests__/GameStore.test.js`
- Test: `web/src/components/shop/__tests__/ShopScreen.test.jsx`

- [ ] **Step 1: Write failing UI and store tests**

Add a new store test covering discounted purchases and a shop rendering test covering the new kind labels:

```js
it('applies upgrade discounts when buying a run upgrade', () => {
  const store = createStore()
  const base = createFreshState()

  store.importGameSave({
    ...base,
    shishki: 1_000,
    upgrades: { ...base.upgrades, nightSlotSale: 1 },
  })

  store.buyUpgrade('warehouseRhythm')

  expect(store.state.shishki).toBe(620)
})
```

```jsx
it('renders readable labels for discount and campaign upgrade kinds', () => {
  const html = renderToStaticMarkup(
    <SettingsProvider>
      <StoresContext.Provider
        value={{
          gameStore: {
            uiEconomy: {
              subscriptions: [],
              upgrades: [
                {
                  id: 'districtWarmup',
                  title: 'Прогрев района',
                  fieldCode: 'run_district_warmup',
                  kind: 'campaignDiscount',
                  value: 0.08,
                  level: 1,
                  cost: 12_000,
                  canBuy: true,
                  unlocked: true,
                },
              ],
            },
            buySubscription: () => {},
            buyUpgrade: () => {},
          },
        }}
      >
        <ShopScreen initialView="upgrades" />
      </StoresContext.Provider>
    </SettingsProvider>,
  )

  expect(html).toContain('Скидка на кампании')
  expect(html).toContain('-8% к цене кампаний за уровень')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --dir web test -- src/stores/__tests__/GameStore.test.js src/components/shop/__tests__/ShopScreen.test.jsx`

Expected: FAIL because store math and shop labels do not support the new kinds yet.

- [ ] **Step 3: Update `GameStore` purchase and activation flow**

Replace inline cost formulas in `buyBuilding`, `buyUpgrade`, and `activateCampaign` with the new math helpers from `economyMath.js`:

```js
const cost = getBuildingPurchaseCost(this._state, building, owned)
```

```js
const cost = getRunUpgradePurchaseCost(this._state, upgrade, level)
```

```js
const launchCost = getCampaignLaunchCost(this._state, campaign)
```

This keeps all pricing logic in one place and ensures upgrade effects are not duplicated across modules.

- [ ] **Step 4: Update shop labels and description formatting**

Extend `UPGRADE_KIND_LABELS` and `getPurchaseDescription` in `web/src/components/shop/ShopScreen.jsx`:

```js
const UPGRADE_KIND_LABELS = {
  globalMultiplier: 'Буст производства',
  clickMultiplier: 'Буст клика',
  tarLumpMultiplier: 'Ускорение комочков',
  buildingDiscount: 'Скидка на здания',
  upgradeDiscount: 'Скидка на усиления',
  eventPositiveChance: 'Шанс хороших ивентов',
  eventNegativeReduction: 'Слабее плохие ивенты',
  eventDurationBoost: 'Дольше хорошие ивенты',
  campaignDiscount: 'Скидка на кампании',
  campaignDurationBoost: 'Дольше кампании',
  campaignEffectBoost: 'Сильнее кампании',
}
```

```js
if (item.kind === 'buildingDiscount') {
  return `-${formatNumber((item.value ?? 0) * 100)}% к цене зданий за уровень`
}
```

Add equivalent branches for the remaining new kinds so no new upgrade renders as `Эффект за уровень`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --dir web test -- src/stores/__tests__/GameStore.test.js src/components/shop/__tests__/ShopScreen.test.jsx`

Expected: PASS for the new purchase-discount and label-rendering tests.

- [ ] **Step 6: Commit**

```bash
git add web/src/stores/GameStore.js web/src/components/shop/ShopScreen.jsx web/src/stores/__tests__/GameStore.test.js web/src/components/shop/__tests__/ShopScreen.test.jsx
git commit -m "feat: expose expanded upgrade kinds in store and shop"
```

### Task 4: Add integration coverage for events and campaigns

**Files:**

- Modify: `web/src/stores/__tests__/GameStore.test.js`
- Modify: `web/src/game/__tests__/economyMath.test.js`

- [ ] **Step 1: Write failing integration tests**

Cover event and campaign modifiers through realistic state transitions:

```js
it('extends campaign duration from campaign duration upgrades', () => {
  const store = createStore()
  const base = createFreshState()

  store.importGameSave({
    ...base,
    shishki: 50_000,
    market: { ...base.market, unlocked: true },
    upgrades: { ...base.upgrades, mediaTail: 1 },
  })

  store.activateCampaign('iceFlexer')

  expect(store.state.activeCampaign.endsAt - Date.now()).toBeGreaterThan(
    100_000,
  )
})
```

```js
it('reduces negative event penalties from event reduction upgrades', () => {
  const state = {
    ...STARTING_STATE,
    upgrades: { ...STARTING_STATE.upgrades, quietDetour: 1 },
    activeEvent: {
      ...getEventById('tarStorm'),
      endsAt: Date.now() + 1000,
    },
  }

  expect(deriveProduction(state).shishkiPerSecond).toBeGreaterThan(0.8)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --dir web test -- src/game/__tests__/economyMath.test.js src/stores/__tests__/GameStore.test.js`

Expected: FAIL because event penalties and durations still ignore the new upgrades.

- [ ] **Step 3: Implement the missing integration logic**

Keep the logic narrow:

- scale negative `productionBoost` and `clickBoost` penalties only when the active event is negative or mixed;
- leave positive events untouched by `eventNegativeReduction`;
- scale `activeEvent.endsAt` and `activeCampaign.endsAt` only at spawn/activation time, not every tick;
- preserve existing building-level bonuses by adding upgrade bonuses on top rather than replacing them.

Minimal event penalty application shape in `deriveProduction`:

```js
const negativeReduction = getRunUpgradeBonus(state, 'eventNegativeReduction')
const activeEventProductionBoost =
  (state?.activeEvent?.productionBoost ?? 0) < 0
    ? (state.activeEvent.productionBoost ?? 0) * (1 - negativeReduction)
    : (state?.activeEvent?.productionBoost ?? 0)
```

- [ ] **Step 4: Run the targeted suite**

Run: `pnpm --dir web test -- src/game/__tests__/economyMath.test.js src/stores/__tests__/GameStore.test.js src/components/shop/__tests__/ShopScreen.test.jsx`

Expected: PASS.

- [ ] **Step 5: Run the broader web suite**

Run: `pnpm --dir web test`

Expected: PASS with the full existing suite green.

- [ ] **Step 6: Commit**

```bash
git add web/src/game/__tests__/economyMath.test.js web/src/stores/__tests__/GameStore.test.js
git commit -m "test: cover expanded upgrade event and campaign effects"
```

## Self-Review

- Spec coverage:
  - expanded pool size and new categories are covered in Task 1;
  - economy math for pricing, events, and campaigns is covered in Task 2;
  - shop readability is covered in Task 3;
  - integration and regression coverage is covered in Task 4.
- Placeholder scan:
  - no `TODO`/`TBD` markers remain;
  - each task names exact files and commands.
- Type consistency:
  - planned ids and kinds are used consistently across config, math, store, and shop tasks.

Plan complete and saved to `docs/superpowers/plans/2026-04-22-upgrade-pool-expansion.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
