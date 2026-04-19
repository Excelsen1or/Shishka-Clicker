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
  applyMarketTrade,
  deriveProduction,
  getBuildingCost,
  getCampaignById,
  getEventById,
  getQuotaTarget,
  resolveQuotaClosures,
} from '../economyMath.js'
import { getPrestigeUpgradeByFieldCode } from '../metaConfig.js'

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
      upgrades: { ...STARTING_STATE.upgrades, warehouseRhythm: 1 },
    }

    expect(deriveProduction(state).shishkiPerSecond).toBeGreaterThan(0)
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
})
