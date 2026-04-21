import { describe, expect, it } from 'vitest'
import {
  BUILDINGS,
  EVENT_DEFINITIONS,
  MARKET_GOODS,
  RAP_CAMPAIGNS,
  PRESTIGE_UPGRADES,
  RUN_UPGRADES,
  STARTING_STATE,
} from '../economyConfig.js'
import {
  accrueTarLumps,
  advanceMarketPrices,
  applyMarketTrade,
  deriveProduction,
  getBuildingPerkSummary,
  getBuildingCost,
  getCampaignById,
  getEventById,
  getEventPresentation,
  getQuotaTarget,
  resolveQuotaClosures,
} from '../economyMath.js'
import { getPrestigeUpgradeByFieldCode, getQuotaPreview } from '../metaConfig.js'

const assertUniqueFieldCodes = (items, label) => {
  const fieldCodes = items.map((item) => item.fieldCode)
  expect(new Set(fieldCodes).size).toBe(fieldCodes.length)
  expect(fieldCodes.every((fieldCode) => typeof fieldCode === 'string')).toBe(
    true,
  )
  expect(fieldCodes.length, `${label} fieldCode count`).toBeGreaterThan(0)
}

describe('economy schema', () => {
  it('starts without money or knowledge balances', () => {
    expect(STARTING_STATE).not.toHaveProperty('money')
    expect(STARTING_STATE).not.toHaveProperty('knowledge')
    expect(STARTING_STATE).toHaveProperty('heavenlyShishki', 0)
    expect(STARTING_STATE).toHaveProperty('tarLumps', 0)
    expect(Object.keys(STARTING_STATE.buildings)).toEqual(
      BUILDINGS.map((building) => building.id),
    )
    expect(BUILDINGS.length).toBeGreaterThanOrEqual(15)
    expect(RUN_UPGRADES.length).toBeGreaterThanOrEqual(8)
    expect(PRESTIGE_UPGRADES.length).toBeGreaterThanOrEqual(6)
    expect(MARKET_GOODS.length).toBeGreaterThanOrEqual(8)
    expect(RAP_CAMPAIGNS.length).toBeGreaterThanOrEqual(5)
    expect(EVENT_DEFINITIONS.length).toBeGreaterThanOrEqual(6)
    expect(BUILDINGS.every((item) => typeof item.fieldCode === 'string')).toBe(
      true,
    )
    expect(
      RUN_UPGRADES.every((item) => typeof item.fieldCode === 'string'),
    ).toBe(true)
    expect(
      PRESTIGE_UPGRADES.every((item) => typeof item.fieldCode === 'string'),
    ).toBe(true)
    expect(MARKET_GOODS.every((item) => typeof item.fieldCode === 'string')).toBe(
      true,
    )
    expect(
      RAP_CAMPAIGNS.every((item) => typeof item.fieldCode === 'string'),
    ).toBe(true)
    expect(
      EVENT_DEFINITIONS.every((item) => typeof item.fieldCode === 'string'),
    ).toBe(true)
    expect(EVENT_DEFINITIONS.some((item) => item.rarity === 'rare')).toBe(true)
    expect(EVENT_DEFINITIONS.some((item) => item.kind === 'chain')).toBe(true)
    expect(BUILDINGS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'greyImportExchange',
          fieldCode: 'building_grey_import_exchange',
        }),
        expect.objectContaining({
          id: 'ministryOfConeLogistics',
          fieldCode: 'building_ministry_of_cone_logistics',
        }),
      ]),
    )
    expect(RUN_UPGRADES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'tarCacheMerge',
          fieldCode: 'run_tar_cache_merge',
        }),
        expect.objectContaining({
          id: 'streetContractWave',
          fieldCode: 'run_street_contract_wave',
        }),
        expect.objectContaining({
          id: 'shadowCourierLine',
          fieldCode: 'run_shadow_courier_line',
        }),
      ]),
    )
    expect(PRESTIGE_UPGRADES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'logisticsIcon',
          fieldCode: 'prestige_logistics_icon',
        }),
        expect.objectContaining({
          id: 'coneEmpire',
          fieldCode: 'prestige_cone_empire',
        }),
      ]),
    )
    expect(MARKET_GOODS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'grayBrokerNotes',
          fieldCode: 'market_gray_broker_notes',
        }),
        expect.objectContaining({
          id: 'pineSealant',
          fieldCode: 'market_pine_sealant',
        }),
      ]),
    )
    expect(RAP_CAMPAIGNS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'logisticsAnthem',
          fieldCode: 'campaign_logistics_anthem',
        }),
      ]),
    )
    expect(EVENT_DEFINITIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'tarStorm',
          fieldCode: 'event_tar_storm',
        }),
        expect.objectContaining({
          id: 'logisticsCongress',
          fieldCode: 'event_logistics_congress',
        }),
      ]),
    )
    assertUniqueFieldCodes(BUILDINGS, 'building')
    assertUniqueFieldCodes(RUN_UPGRADES, 'run upgrade')
    assertUniqueFieldCodes(PRESTIGE_UPGRADES, 'prestige upgrade')
    assertUniqueFieldCodes(MARKET_GOODS, 'market good')
    assertUniqueFieldCodes(RAP_CAMPAIGNS, 'rap campaign')
    assertUniqueFieldCodes(EVENT_DEFINITIONS, 'event')
  })

  it('defines market goods, rap campaigns, and events', () => {
    expect(MARKET_GOODS.map((item) => item.id)).toContain('parallelImport')
    expect(RAP_CAMPAIGNS.map((item) => item.id)).toContain('iceFlexer')
    expect(getCampaignById('logisticsAnthem')?.fieldCode).toBe(
      'campaign_logistics_anthem',
    )
    expect(getEventById('tarStorm')?.title).toBe('Таровая буря')
    expect(
      getPrestigeUpgradeByFieldCode('prestige_heavenly_tar')?.id,
    ).toBe('heavenlyTar')
    expect(getEventPresentation('fieldAudit')).toMatch(/скидк/i)
    expect(getEventPresentation('logisticsCongress')).toMatch(/рын/i)
    expect(getEventById('cashbackGlitchChain')?.rarity).toBe('rare')
  })
})

describe('economy math', () => {
  it('scales building cost by 15 percent per purchase', () => {
    expect(getBuildingCost(100, 0)).toBe(100)
    expect(getBuildingCost(100, 1)).toBe(115)
    expect(getBuildingCost(100, 2)).toBe(132)
  })

  it('derives production from buildings and upgrades only', () => {
    const state = {
      ...STARTING_STATE,
      buildings: { ...STARTING_STATE.buildings, garagePicker: 10 },
      upgrades: {
        ...STARTING_STATE.upgrades,
        warehouseRhythm: 1,
        quietLogistics: 1,
        streetPromoBurst: 1,
      },
    }

    expect(deriveProduction(state).shishkiPerSecond).toBeGreaterThan(0)
    expect(deriveProduction(state).clickPower).toBeGreaterThan(1)
  })

  it('applies unique early building perks from building levels', () => {
    const baseState = {
      ...STARTING_STATE,
      buildings: {
        ...STARTING_STATE.buildings,
        garagePicker: 10,
        greySorting: 2,
      },
    }

    const leveledState = {
      ...baseState,
      buildingLevels: {
        ...STARTING_STATE.buildingLevels,
        garagePicker: 1,
        greySorting: 1,
      },
    }

    expect(deriveProduction(leveledState).clickPower).toBeGreaterThan(
      deriveProduction(baseState).clickPower,
    )
    expect(deriveProduction(leveledState).shishkiPerSecond).toBeGreaterThan(
      deriveProduction(baseState).shishkiPerSecond,
    )
    expect(getBuildingPerkSummary('garagePicker', 1)).toMatch(/клик/i)
    expect(getBuildingPerkSummary('greySorting', 1)).toMatch(/сорт/i)
  })

  it('accrues tar lumps on real-time cadence', () => {
    const result = accrueTarLumps(
      {
        ...STARTING_STATE,
        tarLumps: 0,
        tarLumpProgressMs: 7_200_000,
      },
      7_200_000,
    )

    expect(result.tarLumps).toBe(1)
    expect(result.tarLumpProgressMs).toBe(0)
  })

  it('lets tar lump upgrades accelerate the cadence', () => {
    const result = accrueTarLumps(
      {
        ...STARTING_STATE,
        tarLumps: 0,
        tarLumpProgressMs: 1_440_000,
        upgrades: {
          ...STARTING_STATE.upgrades,
          tarCacheMerge: 1,
        },
      },
      11_820_000,
    )

    expect(result.tarLumps).toBe(1)
  })

  it('lets packing line levels accelerate tar lump cadence further', () => {
    const result = accrueTarLumps(
      {
        ...STARTING_STATE,
        tarLumps: 0,
        tarLumpProgressMs: 1_000_000,
        buildingLevels: {
          ...STARTING_STATE.buildingLevels,
          packingLine: 1,
        },
      },
      12_000_000,
    )

    expect(result.tarLumps).toBe(1)
  })

  it('applies broker fee reduction with a floor', () => {
    const trade = applyMarketTrade({
      state: {
        ...STARTING_STATE,
        shishki: 10_000,
        market: {
          ...STARTING_STATE.market,
          brokerLevel: 8,
          prices: { parallelImport: 100 },
          positions: { parallelImport: 0 },
          averageBuyPrice: { parallelImport: 0 },
        },
      },
      goodId: 'parallelImport',
      quantity: 10,
      side: 'buy',
    })

    expect(trade.nextState.market.positions.parallelImport).toBe(10)
    expect(trade.feePaid).toBeGreaterThan(0)
  })

  it('applies prestige fee reductions to market trades', () => {
    const baseState = {
      ...STARTING_STATE,
      shishki: 10_000,
      market: {
        ...STARTING_STATE.market,
        brokerLevel: 0,
        prices: { parallelImport: 100 },
        positions: { parallelImport: 0 },
        averageBuyPrice: { parallelImport: 0 },
      },
    }

    const withoutPrestige = applyMarketTrade({
      state: baseState,
      goodId: 'parallelImport',
      quantity: 10,
      side: 'buy',
    })

    const withPrestige = applyMarketTrade({
      state: {
        ...baseState,
        prestigeUpgrades: {
          ...STARTING_STATE.prestigeUpgrades,
          taxBlindness: 2,
          shadowBrokerage: 1,
        },
      },
      goodId: 'parallelImport',
      quantity: 10,
      side: 'buy',
    })

    expect(withPrestige.feePaid).toBeLessThan(withoutPrestige.feePaid)
  })

  it('rejects trades that would oversell the portfolio', () => {
    expect(() =>
      applyMarketTrade({
        state: {
          ...STARTING_STATE,
          market: {
            ...STARTING_STATE.market,
            prices: { parallelImport: 100 },
            positions: { parallelImport: 0 },
            averageBuyPrice: { parallelImport: 0 },
          },
        },
        goodId: 'parallelImport',
        quantity: 1,
        side: 'sell',
      }),
    ).toThrow(/insufficient position/i)
  })

  it('rejects trades that would exceed available shishki', () => {
    expect(() =>
      applyMarketTrade({
        state: {
          ...STARTING_STATE,
          shishki: 50,
          market: {
            ...STARTING_STATE.market,
            prices: { parallelImport: 100 },
            positions: { parallelImport: 0 },
            averageBuyPrice: { parallelImport: 0 },
          },
        },
        goodId: 'parallelImport',
        quantity: 1,
        side: 'buy',
      }),
    ).toThrow(/insufficient shishki/i)
  })

  it('evolves market prices only after the market is unlocked', () => {
    const lockedResult = advanceMarketPrices(
      {
        ...STARTING_STATE,
        market: {
          ...STARTING_STATE.market,
          unlocked: false,
        },
      },
      () => 0.95,
    )

    expect(lockedResult.market.prices).toEqual(STARTING_STATE.market.prices)

    const unlockedResult = advanceMarketPrices(
      {
        ...STARTING_STATE,
        market: {
          ...STARTING_STATE.market,
          unlocked: true,
        },
      },
      () => 0.95,
    )

    expect(unlockedResult.market.prices.parallelImport).not.toBe(
      STARTING_STATE.market.prices.parallelImport,
    )
  })

  it('pushes hype goods harder during an active campaign', () => {
    const baseline = advanceMarketPrices(
      {
        ...STARTING_STATE,
        market: {
          ...STARTING_STATE.market,
          unlocked: true,
        },
      },
      () => 0.75,
    )

    const withCampaign = advanceMarketPrices(
      {
        ...STARTING_STATE,
        market: {
          ...STARTING_STATE.market,
          unlocked: true,
        },
        activeCampaign: {
          id: 'sundayProphet',
          productionBoost: 0.35,
          clickBoost: 0,
          eventBoost: 0.15,
        },
      },
      () => 0.75,
    )

    expect(withCampaign.market.prices.neuroCover).toBeGreaterThan(
      baseline.market.prices.neuroCover,
    )
  })

  it('pushes targeted goods harder during an active market event', () => {
    const baseline = advanceMarketPrices(
      {
        ...STARTING_STATE,
        market: {
          ...STARTING_STATE.market,
          unlocked: true,
        },
      },
      () => 0.75,
    )

    const withEvent = advanceMarketPrices(
      {
        ...STARTING_STATE,
        market: {
          ...STARTING_STATE.market,
          unlocked: true,
        },
        activeEvent: {
          id: 'districtHype',
          marketBoostGoodId: 'neuroCover',
          marketBoost: 0.08,
        },
      },
      () => 0.75,
    )

    expect(withEvent.market.prices.neuroCover).toBeGreaterThan(
      baseline.market.prices.neuroCover,
    )
  })

  it('amplifies campaign production with night warehouse levels', () => {
    const baseState = {
      ...STARTING_STATE,
      buildings: {
        ...STARTING_STATE.buildings,
        garagePicker: 10,
      },
      activeCampaign: {
        id: 'sundayProphet',
        productionBoost: 0.35,
        clickBoost: 0,
        eventBoost: 0.15,
      },
    }

    const leveledState = {
      ...baseState,
      buildingLevels: {
        ...STARTING_STATE.buildingLevels,
        nightWarehouse: 1,
      },
    }

    expect(deriveProduction(leveledState).shishkiPerSecond).toBeGreaterThan(
      deriveProduction(baseState).shishkiPerSecond,
    )
  })

  it('closes multiple quotas inside one life', () => {
    const result = resolveQuotaClosures({
      quotaIndex: 0,
      currentRunShishki: 3_500,
      heavenlyShishki: 0,
      totalHeavenlyShishkiEarned: 0,
      baseQuota: 1_000,
      quotaGrowth: 2,
    })

    expect(result.closedQuotas).toBe(2)
    expect(result.quotaIndex).toBe(2)
    expect(result.heavenlyShishki).toBe(2)
    expect(getQuotaTarget(1_000, 2, result.quotaIndex)).toBe(4_000)
  })

  it('reduces quota targets with cone legacy prestige upgrades', () => {
    const baseQuota = getQuotaPreview(STARTING_STATE)
    const discountedQuota = getQuotaPreview({
      ...STARTING_STATE,
      prestigeUpgrades: {
        ...STARTING_STATE.prestigeUpgrades,
        coneLegacy: 2,
      },
    })

    expect(discountedQuota.current).toBeLessThan(baseQuota.current)
    expect(discountedQuota.next).toBeLessThan(baseQuota.next)
  })

  it('sets a hard first quota for the first life', () => {
    expect(getQuotaPreview(STARTING_STATE).current).toBeGreaterThanOrEqual(30_000)
  })
})
