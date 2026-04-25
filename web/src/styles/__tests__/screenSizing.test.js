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

  it('lets clicks pass through the fixed bottom nav outside its track', () => {
    const layoutCss = read('../layout.css')

    expect(layoutCss).toContain('.bottom-nav {')
    expect(layoutCss).toContain('pointer-events: none;')
    expect(layoutCss).toContain('.bottom-nav__track {')
    expect(layoutCss).toContain('pointer-events: auto;')
  })

  it('defines reusable pixel primitives for panels, buttons, chips, and statuses', () => {
    const layoutCss = read('../layout.css')

    expect(layoutCss).toContain('.pixel-panel')
    expect(layoutCss).toContain('.pixel-button')
    expect(layoutCss).toContain('.pixel-chip')
    expect(layoutCss).toContain('.pixel-status')
    expect(layoutCss).toContain('.pixel-status--ready')
    expect(layoutCss).toContain('.pixel-status--danger')
    expect(layoutCss).toContain('.pixel-status--locked')
    expect(layoutCss).toContain('.pixel-status--active')
  })

  it('maps dev console colors to arcade terminal tokens', () => {
    const themeCss = read('../theme.css')
    const layoutCss = read('../layout.css')

    expect(themeCss).toContain('--terminal-cyan: var(--accent-cyan);')
    expect(themeCss).toContain('--terminal-fuchsia: var(--accent-fuchsia);')
    expect(themeCss).toContain('--terminal-gold: var(--accent-primary);')
    expect(themeCss).toContain('--terminal-success: var(--accent-emerald);')
    expect(layoutCss).toContain('var(--terminal-cyan)')
    expect(layoutCss).toContain('var(--terminal-fuchsia)')
    expect(layoutCss).toContain('var(--terminal-gold)')
    expect(layoutCss).toContain('var(--terminal-success)')
  })

  it('keeps the local dev server on one fixed port and exposes host script', () => {
    const viteConfig = read('../../../vite.config.js')
    const packageJson = read('../../../package.json')

    expect(viteConfig).toContain('port: 3001')
    expect(viteConfig).toContain('strictPort: true')
    expect(packageJson).toContain('"dev:host": "vite --host 0.0.0.0"')
  })

  it('normalizes visual states for buy, denied, danger, locked, and active controls', () => {
    const layoutCss = read('../layout.css')
    const shopCss = read('../shop-screen.css')
    const marketTradePanel = read(
      '../../components/market/MarketTradePanel.jsx',
    )
    const marketPortfolio = read('../../components/market/MarketPortfolio.jsx')

    expect(layoutCss).toContain(".market-action-btn[data-state='active']")
    expect(layoutCss).toContain(".market-action-btn[data-state='denied']")
    expect(layoutCss).toContain(".market-action-btn[data-state='danger']")
    expect(layoutCss).toContain(
      ".market-action-btn:hover:not([aria-disabled='true'])",
    )
    expect(layoutCss).toContain('.pixel-tabbar__btn--active')
    expect(layoutCss).toContain('.pixel-tabbar__btn--locked')
    expect(shopCss).toContain(".shop-card__btn[data-state='ready']")
    expect(shopCss).toContain(".shop-card__btn[data-state='denied']")
    expect(shopCss).toContain('.shop-card--locked .shop-card__btn')
    expect(marketTradePanel).toContain('data-state={canBuyOne ?')
    expect(marketTradePanel).toContain(
      'data-state={\n                              campaign.active',
    )
    expect(marketPortfolio).toContain('data-state="danger"')
  })
})
