# Clicker Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** адаптировать `clicker-screen--deck` под мобильные, планшетные и десктопные размеры без изменения игровой логики.

**Architecture:** сохранить текущую структуру экрана и добавить минимальные layout hooks в `ClickerScreen.jsx`, а всю основную адаптацию выполнить в `layout.css` через брейкпоинты для hero, header, tabbar, stat cards и `ProgressFieldPanel`. Проверка идёт через SSR-тест на новые классы и через build/test фронтенда.

**Tech Stack:** React, Vitest, CSS, Vite

---

### Task 1: Add Stable Layout Hooks

**Files:**

- Modify: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
- Modify: `web/src/components/clicker/ClickerScreen.jsx`
- Test: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
expect(html).toContain('clicker-deck-layout__panel')
expect(html).toContain('clicker-deck__copy')
expect(html).toContain('clicker-deck__tabs')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web test -- --run web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: FAIL because the new class hooks are not rendered yet.

- [ ] **Step 3: Write minimal implementation**

```jsx
<section className="clicker-deck clicker-deck-layout__panel pixel-surface" ...>
  <header className="clicker-deck__header">
    <div className="clicker-deck__copy">
```

```jsx
<div className="pixel-tabbar pixel-tabbar--deck clicker-deck__tabs" ...>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web test -- --run web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/clicker/ClickerScreen.jsx web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx
git commit -m "test: add clicker deck layout hooks"
```

### Task 2: Make Deck Layout Responsive

**Files:**

- Modify: `web/src/styles/layout.css`
- Test: `web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`

- [ ] **Step 1: Add responsive CSS for deck shell**

```css
.clicker-deck-layout {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 980px) {
  .clicker-deck-layout {
    grid-template-columns: minmax(18rem, 0.92fr) minmax(0, 1.08fr);
    align-items: stretch;
  }
}
```

- [ ] **Step 2: Add responsive CSS for hero, header, tabs, stats, and field grid**

```css
.clicker-deck__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .clicker-deck__tabs {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

```css
@media (max-width: 639px) {
  .clicker-deck__header,
  .clicker-deck__status,
  .progress-field-panel__header {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Refine mobile typography and spacing**

```css
@media (max-width: 640px) {
  .clicker-deck {
    padding: 0.75rem;
  }

  .clicker-deck__title {
    font-size: clamp(0.92rem, 4.2vw, 1.08rem);
  }
}
```

- [ ] **Step 4: Run targeted tests**

Run: `npm --prefix web test -- --run web/src/components/clicker/__tests__/ProgressFieldPanel.test.jsx`
Expected: PASS

- [ ] **Step 5: Run build verification**

Run: `npm --prefix web run build`
Expected: Vite build succeeds with exit code 0

- [ ] **Step 6: Commit**

```bash
git add web/src/styles/layout.css
git commit -m "feat: make clicker deck responsive"
```
