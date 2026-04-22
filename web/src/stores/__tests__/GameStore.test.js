import { afterEach, describe, expect, it, vi } from 'vitest'
import GameStore from '../GameStore.js'
import { createFreshState } from '../gameStoreState.js'

function createStore() {
  return new GameStore({})
}

afterEach(() => {
  vi.restoreAllMocks()
})

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
        resaleStall: 4,
        selfEmployedCrew: 5,
      },
      upgrades: {
        ...base.upgrades,
        warehouseRhythm: 1,
        grayTenderLoop: 1,
      },
    })

    store.applyPassiveIncome(20)

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
      currentRunShishki: 35_000,
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

    expect(store.state.shishki).toBeGreaterThan(0)
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

  it('counts realized market profit toward the current quota', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 10_000,
      market: {
        ...base.market,
        unlocked: true,
        prices: {
          ...base.market.prices,
          parallelImport: 50,
        },
      },
    })

    store.buyMarketGood('parallelImport', 5)
    store.importGameSave({
      ...store.exportGameSave(),
      market: {
        ...store.state.market,
        prices: {
          ...store.state.market.prices,
          parallelImport: 120,
        },
      },
    })

    const before = store.state.currentRunShishki
    store.sellMarketGood('parallelImport', 5)

    expect(store.state.currentRunShishki).toBeGreaterThan(before)
    expect(store.state.totalShishkiEarned).toBeGreaterThan(0)
  })

  it('unlocks the market after buying the first resale stall', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 200_000,
      buildings: {
        ...base.buildings,
        selfEmployedCrew: 1,
      },
    })

    store.buyBuilding('resaleStall')

    expect(store.state.buildings.resaleStall).toBe(1)
    expect(store.state.market.unlocked).toBe(true)
  })

  it('ignores market trades and campaigns before the market is unlocked', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 50_000,
      market: {
        ...base.market,
        unlocked: false,
      },
    })

    const before = store.exportGameSave()

    store.buyMarketGood('parallelImport', 1)
    store.sellMarketGood('parallelImport', 1)
    store.activateCampaign('iceFlexer')

    expect(store.exportGameSave()).toEqual(before)
  })

  it('refuses to buy locked market goods even if the market is unlocked', () => {
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

    const before = store.exportGameSave()
    store.buyMarketGood('grayBrokerNotes', 1)

    expect(store.exportGameSave()).toEqual(before)
  })

  it('refuses to launch locked hype campaigns before their building gates are met', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 50_000,
      market: {
        ...base.market,
        unlocked: true,
      },
      buildings: {
        ...base.buildings,
        resaleStall: 1,
      },
    })

    store.activateCampaign('sundayProphet')
    expect(store.state.activeCampaign).toBe(null)

    store.activateCampaign('grayTour')
    expect(store.state.activeCampaign).toBe(null)
  })

  it('lets packing line levels discount campaign launches', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 2_400,
      market: {
        ...base.market,
        unlocked: true,
      },
      buildingLevels: {
        ...base.buildingLevels,
        packingLine: 1,
      },
    })

    store.activateCampaign('iceFlexer')

    expect(store.state.activeCampaign?.id).toBe('iceFlexer')
    expect(store.state.shishki).toBeGreaterThanOrEqual(0)
  })

  it('updates market prices during passive ticks after unlock', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      market: {
        ...base.market,
        unlocked: true,
      },
    })

    const before = store.state.market.prices.parallelImport

    store.applyPassiveIncome(1)

    expect(store.state.market.prices.parallelImport).not.toBe(before)
  })

  it('spawns and expires active events during passive ticks', () => {
    const base = createFreshState()
    const store = createStore()

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    store.importGameSave({
      ...base,
      market: {
        ...base.market,
        unlocked: true,
      },
    })

    store.applyPassiveIncome(1)

    expect(store.state.activeEvent).toEqual(
      expect.objectContaining({
        id: 'tarStorm',
      }),
    )

    store.importGameSave({
      ...store.exportGameSave(),
      activeEvent: {
        ...store.state.activeEvent,
        endsAt: Date.now() - 1,
      },
    })

    randomSpy.mockRestore()
    store.applyPassiveIncome(0.1)

    expect(store.state.activeEvent).toBe(null)
  })

  it('applies active event bonuses to manual clicks', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      activeEvent: {
        id: 'districtHype',
        title: 'Районный хайп',
        clickBoost: 1,
        productionBoost: 0.15,
        endsAt: Date.now() + 60_000,
      },
    })

    expect(store.mineShishki().amount).toBe(2)
  })

  it('spends tar lumps on building levels and boosts early production breakpoints', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      tarLumps: 1,
      buildings: {
        ...base.buildings,
        garagePicker: 10,
      },
    })

    const before = store.state.shishkiPerSecond

    store.upgradeBuildingLevel('garagePicker')

    expect(store.state.tarLumps).toBe(0)
    expect(store.state.buildingLevels.garagePicker).toBe(1)
    expect(store.state.shishkiPerSecond).toBeGreaterThan(before)
  })

  it('grants immediate click payoff after the first rebirth upgrade', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      heavenlyShishki: 1,
      totalHeavenlyShishkiEarned: 1,
    })

    store.buyPrestigeUpgrade('heavenlyTar')
    expect(store.state.prestigeUpgrades.heavenlyTar).toBe(1)

    const clickResult = store.mineShishki()

    expect(clickResult.amount).toBeGreaterThan(1)
  })

  it('lets discount-type events cheapen early building purchases', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      shishki: 15,
      activeEvent: {
        id: 'fieldAudit',
        title: 'Полевой аудит',
        clickBoost: 2,
        productionBoost: -0.05,
        purchaseDiscount: 0.25,
        endsAt: Date.now() + 60_000,
      },
    })

    store.buyBuilding('garagePicker')

    expect(store.state.buildings.garagePicker).toBe(1)
    expect(store.state.shishki).toBeGreaterThan(0)
  })

  it('starts a new life with a small prestige-backed seed reserve', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      currentRunShishki: 35_000,
      heavenlyShishki: 4,
      totalHeavenlyShishkiEarned: 4,
      prestigeUpgrades: {
        ...base.prestigeUpgrades,
        heavenlyTar: 1,
        coneLegacy: 1,
      },
    })

    store.prestigeReset()

    expect(store.state.shishki).toBeGreaterThan(0)
    expect(store.state.currentRunShishki).toBe(0)
  })

  it('grants instant shishki when a positive event spawns', () => {
    const base = createFreshState()
    const store = createStore()

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.2)

    store.importGameSave({
      ...base,
      market: {
        ...base.market,
        unlocked: true,
      },
    })

    store.applyPassiveIncome(1)

    expect(store.state.activeEvent?.id).toBe('districtHype')
    expect(store.state.shishki).toBeGreaterThan(0)
  })

  it('queues an event toast when a new event starts', () => {
    const base = createFreshState()
    const store = createStore()

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.01).mockReturnValueOnce(0.2)

    store.importGameSave({
      ...base,
      market: {
        ...base.market,
        unlocked: true,
      },
    })

    store.applyPassiveIncome(1)

    expect(store.eventToastQueue[0]).toEqual(
      expect.objectContaining({
        id: 'districtHype',
        title: 'Районный хайп',
        description: expect.any(String),
      }),
    )
  })

  it('adds the current market event to the stats bar data', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      activeEvent: {
        id: 'districtHype',
        title: 'Районный хайп',
        kind: 'positive',
        endsAt: Date.now() + 60_000,
      },
    })

    expect(store.statsBarData).toHaveLength(5)
    expect(store.statsBarData[4]).toEqual(
      expect.objectContaining({
        label: 'Ивент',
        value: 'Районный хайп',
        hint: expect.any(String),
      }),
    )
  })

  it('resolves chain events through repeated clicks', () => {
    const base = createFreshState()
    const store = createStore()

    store.importGameSave({
      ...base,
      activeEvent: {
        id: 'cashbackGlitchChain',
        title: 'Кэшбэк-глитч',
        kind: 'chain',
        clickBoost: 1,
        productionBoost: 0,
        chainStep: 0,
        chainGoal: 3,
        chainRewardShishki: 180,
        endsAt: Date.now() + 60_000,
      },
    })

    store.mineShishki()
    store.mineShishki()
    const before = store.state.shishki
    store.mineShishki()

    expect(store.state.activeEvent).toBe(null)
    expect(store.state.shishki).toBeGreaterThan(before)
  })
})
