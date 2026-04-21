# Screen Sizing Standardization Design

Date: 2026-04-21
Scope: `shop`, `meta`, `settings`, `market`, `clicker`
Out of scope: new text, logic changes, new decorative systems, component rewrites

## Goal

Standardize the visual rhythm and sizing system across the main game screens so the UI feels coherent, less uneven, and easier to extend. The first wave focuses on spacing, density, panel/card sizing, headers, controls, and grids.

## Current Problems

- Similar UI regions use different padding, gap, and text sizing rules across screens.
- Screen headers follow a shared pattern, but local overrides drift in rhythm and scale.
- Panel and card density differs too much between `shop`, `meta`, `settings`, `market`, and `clicker`.
- Buttons, chips, and support text sizes are not consistently tiered.
- Local CSS overrides are doing work that should come from shared tokens.

## Design Direction

Use `shop` as the density reference, but do not copy its orange-accent character across the rest of the app.

The system should be layered:

1. Global sizing tokens in `theme.css`
2. Shared layout rules in `layout.css` and `screens.css`
3. Screen-specific coefficients and overrides in each screen stylesheet

This keeps one sizing language while preserving each screen's identity.

## Token Model

Add or normalize shared sizing tokens for:

- Screen padding and header rhythm
- Section spacing
- Panel padding
- Compact panel padding
- Card padding
- Card gap
- Grid gap
- Control height
- Chip height
- Large, medium, and small title sizes
- Medium, small, and micro body sizes

Representative token groups:

- `--ui-section-gap`
- `--ui-panel-pad`
- `--ui-panel-pad-compact`
- `--ui-card-pad`
- `--ui-card-gap`
- `--ui-grid-gap`
- `--ui-control-height`
- `--ui-chip-height`
- `--ui-title-size-lg`
- `--ui-title-size-md`
- `--ui-title-size-sm`
- `--ui-body-size-md`
- `--ui-body-size-sm`
- `--ui-micro-size`

Existing shop-specific tokens should either map to these shared tokens or be retained only where the screen truly needs its own density control.

## Shared Layout Rules

Standardize these patterns across the five core screens:

- `screen__header` spacing, underline treatment, and title/description sizing tiers
- Section-to-section spacing
- Default panel padding for `pixel-surface` and related panel classes
- Compact panel/card spacing for denser dashboards and side panels
- Button height and inner padding tiers
- Chip height and padding tiers
- Common support text sizing for labels, hints, and muted descriptions
- Grid gap tiers for dense versus relaxed layouts

## Screen Coefficients

Each screen uses the same base system with a local coefficient:

- `shop`: densest reference layout
- `meta`: medium density, slightly more breathing room in dashboard and summary blocks
- `settings`: medium-calm, especially around control groups
- `market`: medium, with emphasis on key trade surfaces
- `clicker`: slightly larger emphasis on primary gameplay panels

The coefficient model should be implemented with local custom properties rather than repeated hard-coded values.

## Screen-by-Screen Changes

### Shop

- Keep as the reference density
- Standardize card, section, and control tiers against the new shared tokens
- Reduce local one-off sizing where shared tiers are sufficient

### Meta

- Align `meta-card`, `prestige-lab-card`, `achievement-category`, and related grids to shared card/panel tiers
- Normalize dashboard gaps and section headers
- Keep meta-specific accent styling, only unify rhythm and scale

### Settings

- Align `settings-card`, `settings-info-box`, `settings-save-text-box`, and `settings-link-tile` to the same panel system
- Normalize button heights and label/hint text sizes
- Keep the calmer feel through coefficient choice, not unique hard-coded spacing

### Market

- Align market panels and header spacing to the shared system
- Preserve the feature importance of trade and ticker panels with selective larger panel sizing
- Normalize support text and internal panel gaps

### Clicker

- Keep gameplay-critical blocks visually prominent
- Normalize deck/stat/progress panel rhythm to the shared system
- Avoid shrinking primary information density below quick-scan usability

## Implementation Plan Shape

Phase 1:

- Add shared sizing tokens in `theme.css`
- Introduce shared layout tiers in `layout.css` and `screens.css`

Phase 2:

- Refactor `shop-screen.css` to consume shared tiers
- Refactor `screens.css` and screen-specific files for `meta`, `settings`, `market`, and `clicker`

Phase 3:

- Remove redundant local values where the shared system already covers the case
- Verify desktop and mobile breakpoints still preserve the intended density order

## Constraints

- No new copy or text labels
- No component logic changes
- No decorative redesign in this wave
- No large markup rewrites unless required to consume a shared sizing pattern cleanly

## Risks

- Existing local overrides may silently fight the new token layer
- Some mobile breakpoints may need follow-up tuning after shared tiers land
- `shop` and `clicker` may expose hidden assumptions because they are the most visually opinionated screens

## Success Criteria

- The five main screens share a visible rhythm in spacing and sizing
- Similar UI structures use the same tiered sizing system
- Screen-specific character remains intact
- Future visual polish can be added on top of a consistent foundation instead of one-off values
