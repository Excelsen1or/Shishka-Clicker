# Screen Sizing Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize spacing, sizing, and density across the `shop`, `meta`, `settings`, `market`, and `clicker` screens without changing copy or business logic.

**Architecture:** Introduce a shared sizing token layer in `theme.css`, consume it through common screen and surface rules in `layout.css` and `screens.css`, then migrate each major screen stylesheet to local coefficient-based overrides instead of repeated hard-coded values. Guard the refactor with lightweight Vitest checks that assert the shared tokens and selector adoption exist in the CSS source.

**Tech Stack:** React 19, Vite, Vitest, plain CSS (`theme.css`, `layout.css`, `screens.css`, `shop-screen.css`)

---

## File Structure

### Shared foundation

- Modify: `web/src/styles/theme.css`
  - Add shared sizing tokens for sections, panels, cards, controls, chips, text tiers, and per-screen coefficients.
- Modify: `web/src/styles/layout.css`
  - Move common header, surface, control, and shared rhythm sizing to token-driven rules.
- Modify: `web/src/styles/screens.css`
  - Align `meta`, `settings`, and shared pixel-surface groups to the new tiers.

### Screen-specific styles

- Modify: `web/src/styles/shop-screen.css`
  - Convert `shop` to the new shared sizing model and keep it as the densest reference.
- Modify: `web/src/styles/layout.css`
  - Normalize `market` and `clicker` panel density where those rules already live here.
- Modify: `web/src/styles/screens.css`
  - Normalize `meta` and `settings` grids, panels, buttons, and compact cards.

### Tests

- Create: `web/src/styles/__tests__/screenSizing.test.js`
  - Add source-level regression checks for shared token definitions and screen adoption of tokenized sizing rules.

---

### Task 1: Add shared sizing tokens and CSS regression scaffold

**Files:**

- Modify: `web/src/styles/theme.css`
- Create: `web/src/styles/__tests__/screenSizing.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('screen sizing tokens', () => {
  it('defines the shared sizing tokens in theme.css', () => {
    const themeCss = read('../theme.css')

    expect(themeCss).toContain('--ui-section-gap:')
    expect(themeCss).toContain('--ui-panel-pad:')
    expect(themeCss).toContain('--ui-panel-pad-compact:')
    expect(themeCss).toContain('--ui-card-pad:')
    expect(themeCss).toContain('--ui-card-gap:')
    expect(themeCss).toContain('--ui-grid-gap:')
    expect(themeCss).toContain('--ui-control-height:')
    expect(themeCss).toContain('--ui-chip-height:')
    expect(themeCss).toContain('--ui-title-size-lg:')
    expect(themeCss).toContain('--ui-body-size-sm:')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir web test -- screenSizing
```

Expected: FAIL because `theme.css` does not define the new shared sizing tokens yet.

- [ ] **Step 3: Write the minimal implementation**

```css
:root {
  --ui-section-gap: 0.78rem;
  --ui-panel-pad: 0.88rem;
  --ui-panel-pad-compact: 0.72rem;
  --ui-card-pad: 0.78rem;
  --ui-card-gap: 0.62rem;
  --ui-grid-gap: 0.62rem;
  --ui-control-height: 2.5rem;
  --ui-chip-height: 1.8rem;
  --ui-title-size-lg: clamp(1.16rem, 2.4vw, 1.72rem);
  --ui-title-size-md: clamp(0.98rem, 1.8vw, 1.22rem);
  --ui-title-size-sm: 0.94rem;
  --ui-body-size-md: 0.84rem;
  --ui-body-size-sm: 0.78rem;
  --ui-micro-size: 0.68rem;

  --ui-density-shop: 0.96;
  --ui-density-meta: 1.02;
  --ui-density-settings: 1.04;
  --ui-density-market: 1;
  --ui-density-clicker: 1.06;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir web test -- screenSizing
```

Expected: PASS for the shared token existence test.

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/theme.css web/src/styles/__tests__/screenSizing.test.js
git commit -m "test: add shared screen sizing token scaffold"
```

### Task 2: Move shared screen rhythm into token-driven layout rules

**Files:**

- Modify: `web/src/styles/layout.css`
- Modify: `web/src/styles/__tests__/screenSizing.test.js`

- [ ] **Step 1: Write the failing test**

```js
it('uses shared sizing tokens in common screen layout rules', () => {
  const layoutCss = read('../layout.css')

  expect(layoutCss).toContain('padding: var(--ui-screen-padding);')
  expect(layoutCss).toContain('gap: var(--ui-screen-header-gap);')
  expect(layoutCss).toContain('font-size: var(--ui-title-size-lg);')
  expect(layoutCss).toContain('font-size: var(--ui-body-size-md);')
  expect(layoutCss).toContain('min-height: var(--ui-control-height);')
  expect(layoutCss).toContain('min-height: var(--ui-chip-height);')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir web test -- screenSizing
```

Expected: FAIL because `layout.css` still mixes shared tokens with hard-coded values for headers, chips, and controls.

- [ ] **Step 3: Write the minimal implementation**

```css
.screen__title {
  font-size: var(--ui-title-size-lg);
}

.screen__desc,
.shop-card__desc,
.shop-card__effect-next,
.shop-card__lock-text {
  font-size: var(--ui-body-size-md);
}

.pixel-tabbar__btn,
:where(.shop-card__btn, .settings-ghost-btn, .reset-btn) {
  min-height: var(--ui-control-height);
}

.settings-chip,
.shop-card__tier,
.shop-card__level,
.prestige-lab-card__level,
.achievement-category__count {
  min-height: var(--ui-chip-height);
  font-size: var(--ui-body-size-sm);
}

.pixel-surface {
  padding: var(--ui-panel-pad);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir web test -- screenSizing
pnpm --dir web build
```

Expected:

- `screenSizing` tests PASS
- Vite build succeeds without CSS parse errors

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/layout.css web/src/styles/__tests__/screenSizing.test.js
git commit -m "refactor: tokenise shared screen layout rhythm"
```

### Task 3: Migrate shop to the shared sizing model

**Files:**

- Modify: `web/src/styles/shop-screen.css`
- Modify: `web/src/styles/__tests__/screenSizing.test.js`

- [ ] **Step 1: Write the failing test**

```js
it('maps shop sizing to shared panel, card, and text tiers', () => {
  const shopCss = read('../shop-screen.css')

  expect(shopCss).toContain('--screen-density: var(--ui-density-shop);')
  expect(shopCss).toContain(
    'padding: calc(var(--ui-card-pad) * var(--screen-density));',
  )
  expect(shopCss).toContain(
    'gap: calc(var(--ui-card-gap) * var(--screen-density));',
  )
  expect(shopCss).toContain('font-size: var(--ui-body-size-sm);')
  expect(shopCss).toContain('min-height: var(--ui-control-height);')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir web test -- screenSizing
```

Expected: FAIL because `shop-screen.css` still uses direct numeric values for card padding, gap, and several body/control sizes.

- [ ] **Step 3: Write the minimal implementation**

```css
.shop-screen {
  --screen-density: var(--ui-density-shop);
  --shop-card-pad: calc(var(--ui-card-pad) * var(--screen-density));
  --shop-card-gap: calc(var(--ui-card-gap) * var(--screen-density));
  --shop-section-gap: calc(var(--ui-section-gap) * var(--screen-density));
}

.shop-categories {
  gap: var(--shop-section-gap);
}

.shop-card {
  padding: var(--shop-card-pad);
  gap: var(--shop-card-gap);
}

.shop-card__desc,
.shop-card__effect-next,
.shop-card__lock-text {
  font-size: var(--ui-body-size-sm);
}

.shop-card__btn {
  min-height: var(--ui-control-height);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir web test -- screenSizing
pnpm --dir web build
```

Expected:

- `screenSizing` tests PASS
- shop CSS compiles and build succeeds

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/shop-screen.css web/src/styles/__tests__/screenSizing.test.js
git commit -m "refactor: align shop sizing to shared tiers"
```

### Task 4: Align meta and settings to the same panel and grid tiers

**Files:**

- Modify: `web/src/styles/screens.css`
- Modify: `web/src/styles/__tests__/screenSizing.test.js`

- [ ] **Step 1: Write the failing test**

```js
it('applies shared token-based panel tiers to meta and settings', () => {
  const screensCss = read('../screens.css')

  expect(screensCss).toContain('--screen-density: var(--ui-density-meta);')
  expect(screensCss).toContain('--screen-density: var(--ui-density-settings);')
  expect(screensCss).toContain(
    'padding: calc(var(--ui-panel-pad) * var(--screen-density));',
  )
  expect(screensCss).toContain(
    'gap: calc(var(--ui-grid-gap) * var(--screen-density));',
  )
  expect(screensCss).toContain(
    'padding: calc(var(--ui-panel-pad-compact) * var(--screen-density));',
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir web test -- screenSizing
```

Expected: FAIL because `screens.css` still hard-codes panel padding and grid gaps for `meta` and `settings`.

- [ ] **Step 3: Write the minimal implementation**

```css
.meta-screen {
  --screen-density: var(--ui-density-meta);
}

.settings-screen {
  --screen-density: var(--ui-density-settings);
}

.settings-screen
  :is(.settings-card, .settings-info-box, .settings-save-text-box),
.meta-screen :is(.meta-card, .prestige-lab-card, .achievement-category) {
  padding: calc(var(--ui-panel-pad) * var(--screen-density));
  gap: calc(var(--ui-grid-gap) * var(--screen-density));
}

.settings-screen .settings-link-tile,
.meta-screen .prestige-step,
.meta-screen .achievement-card {
  padding: calc(var(--ui-panel-pad-compact) * var(--screen-density));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm --dir web test -- screenSizing
pnpm --dir web build
```

Expected:

- `screenSizing` tests PASS
- `meta` and `settings` CSS compiles cleanly

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/screens.css web/src/styles/__tests__/screenSizing.test.js
git commit -m "refactor: standardize meta and settings panel sizing"
```

### Task 5: Align market and clicker coefficients and run final verification

**Files:**

- Modify: `web/src/styles/layout.css`
- Modify: `web/src/styles/__tests__/screenSizing.test.js`

- [ ] **Step 1: Write the failing test**

```js
it('assigns density coefficients to market and clicker layouts', () => {
  const layoutCss = read('../layout.css')

  expect(layoutCss).toContain('.market-screen {')
  expect(layoutCss).toContain('--screen-density: var(--ui-density-market);')
  expect(layoutCss).toContain('.clicker-screen {')
  expect(layoutCss).toContain('--screen-density: var(--ui-density-clicker);')
  expect(layoutCss).toContain(
    'gap: calc(var(--ui-grid-gap) * var(--screen-density));',
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir web test -- screenSizing
```

Expected: FAIL because `market` and `clicker` still use screen-local gaps and paddings without shared density variables.

- [ ] **Step 3: Write the minimal implementation**

```css
.market-screen {
  --screen-density: var(--ui-density-market);
}

.clicker-screen {
  --screen-density: var(--ui-density-clicker);
}

.market-panel,
.clicker-layout__pane,
.clicker-deck,
.clicker-panel {
  gap: calc(var(--ui-grid-gap) * var(--screen-density));
}

.market-screen__header-event,
.clicker-deck,
.clicker-panel {
  padding: calc(var(--ui-panel-pad) * var(--screen-density));
}
```

- [ ] **Step 4: Run final verification**

Run:

```bash
pnpm --dir web test -- screenSizing
pnpm --dir web build
pnpm lint
pnpm format:check
```

Expected:

- `screenSizing` tests PASS
- Vite build PASS
- ESLint PASS
- Prettier check PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/styles/layout.css web/src/styles/__tests__/screenSizing.test.js
git commit -m "refactor: unify market and clicker sizing coefficients"
```

## Self-Review

### Spec coverage

- Shared token layer: covered in Task 1
- Shared screen/header/panel/control sizing: covered in Task 2
- `shop` as density reference: covered in Task 3
- `meta` and `settings` normalization: covered in Task 4
- `market` and `clicker` coefficient alignment: covered in Task 5
- No copy or logic changes: preserved across all tasks

### Placeholder scan

- No `TODO`, `TBD`, or “similar to previous task” references
- Every task includes explicit file paths, concrete code snippets, and exact commands

### Type consistency

- Shared density variable is consistently named `--screen-density`
- Shared sizing tokens use one naming scheme rooted in `--ui-*`
- Verification file path remains `web/src/styles/__tests__/screenSizing.test.js` in all tasks
