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

  it('uses shared sizing tokens in common screen layout rules', () => {
    const layoutCss = read('../layout.css')

    expect(layoutCss).toContain('padding: var(--ui-screen-padding);')
    expect(layoutCss).toContain('gap: var(--ui-screen-header-gap);')
    expect(layoutCss).toContain('font-size: var(--ui-title-size-lg);')
    expect(layoutCss).toContain('font-size: var(--ui-body-size-md);')
    expect(layoutCss).toContain('min-height: var(--ui-control-height);')
    expect(layoutCss).toContain('min-height: var(--ui-chip-height);')
  })

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

  it('applies shared token-based panel tiers to meta and settings', () => {
    const screensCss = read('../screens.css')

    expect(screensCss).toContain('--screen-density: var(--ui-density-meta);')
    expect(screensCss).toContain(
      '--screen-density: var(--ui-density-settings);',
    )
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

  it('pins collapsed clicker scene without transforming the click target', () => {
    const layoutCss = read('../layout.css')

    expect(layoutCss).toContain(
      '.clicker-deck-layout__hero--collapsed .clicker-wrap {',
    )
    expect(layoutCss).toContain('inset: auto 0 0;')
    expect(layoutCss).not.toContain('transform: translateY(-50%);')
  })

  it('softens the cursor on small screens and disables it on touch devices', () => {
    const baseCss = read('../base.css')

    expect(baseCss).toContain('@media (pointer: coarse)')
    expect(baseCss).toContain('cursor: auto !important;')
    expect(baseCss).toContain('@media (max-width: 720px) and (pointer: fine)')
    expect(baseCss).toContain('cursor: pointer;')
    expect(baseCss).toContain('cursor: text;')
  })

  it('defines arcade palette tokens and maps screen accents consistently', () => {
    const themeCss = read('../theme.css')
    const layoutCss = read('../layout.css')
    const screensCss = read('../screens.css')
    const shopCss = read('../shop-screen.css')

    expect(themeCss).toContain('--arcade-bg-rgb:')
    expect(themeCss).toContain('--arcade-surface-rgb:')
    expect(themeCss).toContain('--arcade-neon-rgb:')
    expect(themeCss).toContain('--arcade-pop-rgb:')
    expect(themeCss).toContain('--arcade-gold-rgb:')
    expect(themeCss).toContain('--shadow-pixel:')
    expect(themeCss).toContain('--shadow-pixel-accent:')
    expect(themeCss).toContain('--shadow-button:')
    expect(themeCss).toContain('--shadow-button-hover:')
    expect(themeCss).toContain('--text-success:')
    expect(themeCss).toContain('--text-danger-soft:')
    expect(themeCss).toContain('--ui-mobile-nav-clearance:')
    expect(themeCss).toContain('--screen-shop-rgb: var(--arcade-gold-rgb);')
    expect(themeCss).toContain('--screen-market-rgb: var(--arcade-neon-rgb);')
    expect(themeCss).toContain('--screen-meta-rgb: var(--arcade-pop-rgb);')
    expect(themeCss).toContain('--screen-settings-rgb: var(--accent-cyan-rgb);')

    expect(layoutCss).toContain(
      '--screen-accent-rgb: var(--screen-clicker-rgb);',
    )
    expect(layoutCss).toContain(
      '--screen-accent-rgb: var(--screen-market-rgb);',
    )
    expect(layoutCss).toContain('box-shadow: var(--shadow-pixel) !important;')
    expect(layoutCss).toContain(
      ':where(.shop-card__btn, .settings-ghost-btn, .reset-btn, .market-action-btn)',
    )
    expect(layoutCss).toContain('var(--ui-mobile-nav-clearance)')
    expect(screensCss).toContain('--screen-accent-rgb: var(--screen-meta-rgb);')
    expect(screensCss).toContain(
      '--screen-accent-rgb: var(--screen-settings-rgb);',
    )
    expect(shopCss).toContain('--screen-accent-rgb: var(--screen-shop-rgb);')
  })
})
