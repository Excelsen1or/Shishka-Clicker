# Runtime Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce repeated runtime work in store calculations, hot UI renders, and canvas effect loops without changing gameplay logic.

**Architecture:** Keep the current MobX and React structure, add identity-based internal caching for repeated derived state and snapshot builders, move repeated render-time aggregations into precomputed screen data, and replace avoidable per-frame canvas work with reusable helpers.

**Tech Stack:** React 19, MobX, Vite, Vitest, canvas 2D.

---

### Task 1: Lock In Current Behavior With Tests

**Files:**

- Modify: `web/src/stores/__tests__/GameStore.test.js`
- Create or Modify: `web/src/stores/__tests__/gameStoreSnapshots.test.js`
- Modify: `web/src/components/clicker/__tests__/clickEffects.test.js`

- [ ] Add tests for stable derived/snapshot values on repeated reads.
- [ ] Add tests for repeated UI snapshot reads after state replacement.
- [ ] Add tests for any extracted click/effect helper behavior before implementation.
- [ ] Run targeted tests and confirm they fail only for the newly asserted behavior.

### Task 2: Optimize GameStore Internal Repeated Work

**Files:**

- Modify: `web/src/stores/GameStore.js`

- [ ] Add identity-based caches for `_state`, `uiSnapshotState`, derived production, UI-resolved state, and snapshot builders.
- [ ] Reuse shared internal helpers for expiration cleanup and repeated “has active effects / active state” style checks.
- [ ] Keep public methods, save behavior, and economy math unchanged.
- [ ] Re-run GameStore and snapshot tests until green.

### Task 3: Reduce Hot UI Render Work

**Files:**

- Modify: `web/src/stores/gameStoreSnapshots.js`
- Modify: `web/src/components/clicker/ClickerScreen.jsx`
- Modify: `web/src/components/market/MarketScreen.jsx`
- Modify tests if render assertions depend on moved data

- [ ] Precompute repeated counts, lookup results, and unlock progress data in snapshot builders.
- [ ] Remove repeated `find/filter/slice` work from hot render paths where precomputed data now exists.
- [ ] Keep rendered structure and labels stable.
- [ ] Re-run affected UI tests until green.

### Task 4: Optimize Effects And Ambient Canvas

**Files:**

- Modify: `web/src/components/clicker/ClickerEffectsOverlay.jsx`
- Modify: `web/src/components/clicker/clickEffects.js`
- Modify: `web/src/components/ui/AmbientCanvas.jsx`
- Modify tests if helper extraction changes test surface

- [ ] Consolidate repeated active-effect checks in the clicker overlay.
- [ ] Extract and test small helpers if they make effect-loop work cheaper and clearer.
- [ ] Replace per-frame random noise generation with reusable precomputed noise drawing.
- [ ] Preserve current visual behavior closely.

### Task 5: Verify

**Files:**

- Modify: none

- [ ] Run targeted Vitest suites for touched store, snapshot, UI, and effect modules.
- [ ] Run full `web` test suite.
- [ ] Run project build.
- [ ] Review diff for logic-preserving scope only.
