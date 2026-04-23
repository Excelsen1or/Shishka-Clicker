# Runtime Optimization Design

## Context

The web client performs frequent state updates from the game tick, click actions, market updates, and visual effects. Current code already preserves game behavior, but several hot paths repeat the same expensive work:

- `GameStore` recomputes derived production and snapshot data from the same underlying state multiple times per tick and per action.
- Screen components perform repeated array scans and aggregate calculations during render.
- Canvas-based visual layers repeat avoidable checks and regenerate expensive transient data every frame.

The goal is to reduce CPU time, allocations, and unnecessary render work without changing gameplay formulas, persistence format, public store API, or visible game logic.

## Scope

This work includes:

- store-level runtime optimization in `web/src/stores/GameStore.js`
- snapshot optimization in `web/src/stores/gameStoreSnapshots.js`
- targeted UI render optimization in the hottest React screens
- targeted effect-loop optimization in clicker and ambient canvas layers
- regression tests for critical derived and snapshot behavior

This work does not include:

- economy rebalance
- UI redesign
- save schema changes
- store architecture rewrite
- switching state management or rendering libraries

## Constraints

- Gameplay behavior must remain unchanged.
- Existing save import/export behavior must remain unchanged.
- Public methods on `GameStore` must keep the same behavior and call sites.
- MobX reactivity must remain intact.
- Visual output may become cheaper to render, but should not become meaningfully different to the player.

## Recommended Approach

Use a conservative optimization pass that keeps the current architecture and removes repeated work in place.

Why this approach:

- It targets the actual hot paths already visible in the current code.
- It has lower regression risk than decomposing the store or changing rendering architecture.
- It preserves current behavior, which is the main requirement.

Alternatives considered:

1. Partial store decomposition
   Improves long-term structure, but raises risk around MobX reactivity, snapshots, and save flow.
2. Effects-only optimization
   Helps FPS, but does not address repeated state and snapshot computation.
3. Large-scale refactor
   Highest potential upside, but unnecessary risk for the current goal.

## Design

### 1. Store and Derived Computation

`GameStore` will keep its public shape, but internal repeated computation will be reduced.

Changes:

- Cache `deriveProduction` results separately for `_state` and `uiSnapshotState`.
- Cache `resolveUiState` results for the current UI snapshot.
- Cache snapshot builders derived from a stable state reference:
  - `buildEconomySnapshot`
  - `buildClickerFieldData`
  - `buildDevConsoleResources`
- Reuse shared internal helpers for common cleanup and expiration checks instead of recomputing equivalent intermediate objects repeatedly.

Non-goals:

- No behavioral change to `applyPassiveIncome`, `mineShishki`, purchasing, prestige, save import, or save export.
- No change to formulas in economy or meta math modules unless a test proves behavior is already inconsistent.

Expected effect:

- fewer repeated object allocations
- fewer repeated math passes over the same state
- more stable access patterns for MobX computed data

### 2. Snapshot and Screen Data

The project currently rebuilds large snapshot structures and then performs additional filtering and searches in render functions.

Changes:

- Move repeated render-time aggregations for hot screens into memoized store-backed snapshot data where appropriate.
- Precompute values that are scanned repeatedly from the same arrays, such as:
  - counts of owned or upgraded items
  - unlock progress values
  - frequently requested item lookups for market screens
- Keep component props and layout logic stable so UI structure does not change.

Primary targets:

- `web/src/components/clicker/ClickerScreen.jsx`
- `web/src/components/market/MarketScreen.jsx`

Rule:

- Only move calculations out of render when they are repeated, derived from the same source arrays, and do not make component boundaries worse.

### 3. Effects and Canvas Loops

Canvas logic already uses pooled state in places, but there are still avoidable costs.

Changes:

- In `ClickerEffectsOverlay`, consolidate repeated “has active effects” checks and reduce repeated collection scanning where possible.
- Preserve effect spawn behavior, caps, and draw sequencing.
- In `AmbientCanvas`, replace full random-noise regeneration per frame with reusable precomputed noise data or pattern-based reuse.
- Preserve the same general visual feel: ambient blobs plus subtle noise.

Rule:

- Do not reduce effect density by changing gameplay outputs.
- Prefer cheaper draw preparation over lowering effect counts unless a setting already caps those counts.

## Testing Strategy

Apply TDD for risky logic-preserving changes.

Tests to add or extend:

- `GameStore` derived and snapshot access should continue returning the same gameplay-relevant values for representative states.
- Snapshot builders should preserve unlock states, counts, and market/meta data after optimization.
- Effect helper tests should cover any extracted utility behavior if logic is moved.

Verification:

- run focused `vitest` suites for touched modules first
- run full web test suite
- run project build

## Risks and Mitigations

Risk: cache invalidation mistakes produce stale UI or stale derived values.
Mitigation: key caches strictly by object identity of the current state references and reset them on state replacement paths.

Risk: MobX computed behavior changes due to over-caching.
Mitigation: keep caching internal and deterministic; do not move mutable data outside store ownership.

Risk: ambient noise optimization changes the look too much.
Mitigation: keep palette, density, and composite result visually aligned with the current implementation.

## Implementation Order

1. Add regression tests for critical state-derived behavior.
2. Optimize `GameStore` internal derived and snapshot computation.
3. Move repeated hot-screen render aggregations into cheaper precomputed data.
4. Optimize clicker and ambient effect loops.
5. Run tests and build to confirm no logic regressions.

## Success Criteria

- No gameplay logic changes observed in tests.
- No save format or store API changes required by callers.
- Lower repeated computation in store and render hot paths.
- Canvas layers perform less per-frame unnecessary work.
- Test suite and build remain green.
