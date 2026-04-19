import { describe, expect, it } from 'vitest'
import GameStore from '../GameStore.js'
import { createFreshState } from '../gameStoreState.js'

function createStore() {
  return new GameStore({})
}

describe('GameStore', () => {
  it('buys a building with shishki', () => {
    const store = createStore()

    store._devSetResource('shishki', 100)
    store.buyBuilding('garagePicker')

    expect(store.state.shishki).toBe(85)
    expect(store.state.buildings.garagePicker).toBe(1)
  })

  it('applies passive income from owned buildings', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      buildings: {
        ...base.buildings,
        garagePicker: 10,
      },
      upgrades: {
        ...base.upgrades,
        warehouseRhythm: 1,
      },
    })

    store.applyPassiveIncome(10)

    expect(store.state.shishki).toBeGreaterThan(0)
    expect(store.state.currentRunShishki).toBeGreaterThan(0)
  })

  it('quantizes tiny passive income ticks without float tails', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      buildings: {
        ...base.buildings,
        garagePicker: 1,
      },
    })

    store.applyPassiveIncome(0.1)
    store.applyPassiveIncome(0.1)
    store.applyPassiveIncome(0.1)

    expect(store.state.shishki).toBe(0.03)
    expect(store.state.currentRunShishki).toBe(0.03)
    expect(store.state.totalShishkiEarned).toBe(0.03)
  })

  it('chains quota closures inside one life', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      buildings: {
        ...base.buildings,
        resaleStall: 2,
      },
    })

    store.applyPassiveIncome(10)

    expect(store.state.heavenlyShishki).toBeGreaterThanOrEqual(1)
    expect(store.state.quotaIndex).toBe(store.state.heavenlyShishki)
  })

  it('ignores prestige reset before earning any heavenly progress', () => {
    const store = createStore()
    const before = store.exportGameSave()

    expect(store.prestigeReset()).toBe(false)
    expect(store.exportGameSave()).toEqual(before)
  })

  it('keeps meta resources on prestige reset', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 500,
      currentRunShishki: 3_500,
      heavenlyShishki: 2,
      totalHeavenlyShishkiEarned: 2,
      tarLumps: 3,
      rebirths: 1,
      buildings: {
        ...base.buildings,
        garagePicker: 4,
      },
      buildingLevels: {
        ...base.buildingLevels,
        garagePicker: 2,
      },
      prestigeUpgrades: {
        ...base.prestigeUpgrades,
        heavenlyTar: 1,
      },
    })

    store.prestigeReset()

    expect(store.state.shishki).toBe(0)
    expect(store.state.buildings.garagePicker).toBe(0)
    expect(store.state.heavenlyShishki).toBe(2)
    expect(store.state.tarLumps).toBe(3)
    expect(store.state.buildingLevels.garagePicker).toBe(2)
    expect(store.state.prestigeUpgrades.heavenlyTar).toBe(1)
    expect(store.state.rebirths).toBe(2)
  })

  it('buys and sells market goods', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 10_000,
      market: {
        ...base.market,
        unlocked: true,
      },
    })

    store.buyMarketGood('parallelImport', 10)
    store.sellMarketGood('parallelImport', 4)

    expect(store.state.market.positions.parallelImport).toBe(6)
    expect(store.state.shishki).toBeLessThan(10_000)
  })
})
