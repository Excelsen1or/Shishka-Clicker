# Clicker Button Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** вернуть `ClickerButton` в чистое рабочее состояние, восстановить корректные пропорции сцены и закрепить deck-панель ниже кнопки.

**Architecture:** сохранить текущую игровую логику клика и визуальных эффектов, но восстановить структуру кнопки как изолированный scene-блок без конфликтов с deck-layout. Основная работа идёт в `ClickerButton.jsx`, `ClickerScreen.jsx`, связанном тесте и в зачистке `layout.css`.

**Tech Stack:** React, Vitest, CSS, Vite

---

### Task 1: Lock The Intended Layout Contract

**Files:**
- Modify: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
- Modify: `web/src/components/clicker/ClickerScreen.jsx`
- Test: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
expect(html).toContain('clicker-deck-layout__hero')
expect(html).toContain('clicker-deck-layout__panel')
expect(html.indexOf('clicker-deck-layout__hero')).toBeLessThan(
  html.indexOf('clicker-deck-layout__panel'),
)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web test -- --run src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: FAIL because the current assertions for hero/panel ordering do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```jsx
<div className="clicker-deck-layout">
  <div className="clicker-deck-layout__hero">
```

```jsx
<section className="clicker-deck clicker-deck-layout__panel pixel-surface">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web test -- --run src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/clicker/ClickerScreen.jsx web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx
git commit -m "test: lock clicker hero and deck order"
```

### Task 2: Restore ClickerButton Structure

**Files:**
- Modify: `web/src/components/clicker/ClickerButton.jsx`
- Test: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

- [ ] **Step 1: Add a failing test for the clean button shell**

```jsx
expect(html).toContain('clicker-wrap--scene')
expect(html).toContain('clicker-wrap__scene-layer--clouds')
expect(html).toContain('clicker-btn__hero-motion')
```

- [ ] **Step 2: Run test to verify it fails if the clean shell is absent**

Run: `npm --prefix web test -- --run src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: FAIL if the scene shell changes unexpectedly during reset.

- [ ] **Step 3: Rebuild the button on the clean scene-based markup**

```jsx
return (
  <div className="clicker-wrap clicker-wrap--pixel clicker-wrap--scene">
    <button ...>
      <div className="clicker-wrap__scene" aria-hidden="true">
```

```jsx
<div className="clicker-btn__core">
  <span className="clicker-btn__hero-motion">
    <img ... className="clicker-btn__hero" ... />
  </span>
</div>
```

- [ ] **Step 4: Preserve only current click logic and effects**

```jsx
const nextVisualState = result.isEmojiExplosion
  ? 'prism'
  : result.isMega
    ? 'mega'
    : 'tap'
```

```jsx
effectsOverlayRef.current?.spawn({
  result,
  ...effectPoints,
})
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix web test -- --run src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/components/clicker/ClickerButton.jsx web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx
git commit -m "refactor: reset clicker button scene shell"
```

### Task 3: Clean And Stabilize Button CSS

**Files:**
- Modify: `web/src/styles/layout.css`
- Test: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

- [ ] **Step 1: Replace distorted scene-image rules**

```css
.clicker-wrap__scene-image {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  image-rendering: pixelated;
}
```

```css
.clicker-wrap__scene-image--mid,
.clicker-wrap__scene-image--front {
  object-position: center bottom;
}
```

- [ ] **Step 2: Reset button sizing to isolated values**

```css
.clicker-wrap--scene {
  aspect-ratio: 16 / 9;
  min-height: clamp(18rem, 52vw, 28rem);
}
```

```css
.clicker-btn__hero {
  width: auto;
  height: auto;
  max-width: min(78%, 16rem);
  max-height: 100%;
  object-fit: contain;
}
```

- [ ] **Step 3: Remove or overwrite conflicting deck-related mobile rules**

```css
.clicker-deck-layout {
  grid-template-columns: minmax(0, 1fr);
}

.clicker-deck-layout__hero {
  order: 1;
}

.clicker-deck-layout__panel {
  order: 2;
}
```

- [ ] **Step 4: Keep deck panel below hero at all breakpoints**

```css
@media (min-width: 980px) {
  .clicker-deck-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 5: Run targeted test**

Run: `npm --prefix web test -- --run src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: PASS

- [ ] **Step 6: Run build verification**

Run: `npm --prefix web run build`
Expected: Vite build succeeds with exit code 0

- [ ] **Step 7: Commit**

```bash
git add web/src/styles/layout.css
git commit -m "fix: restore clicker button proportions"
```
