import { describe, expect, it } from 'vitest'
import {
  BUILDINGS,
  MARKET_GOODS,
  RAP_CAMPAIGNS,
  STARTING_STATE,
} from '../economyConfig.js'
import {
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  getBuildingCost,
  getQuotaTarget,
  resolveQuotaClosures,
} from '../economyMath.js'

describe('economy schema', () => {
  it('starts without money or knowledge balances', () => {
    expect(STARTING_STATE).not.toHaveProperty('money')
    expect(STARTING_STATE).not.toHaveProperty('knowledge')
    expect(STARTING_STATE).toHaveProperty('heavenlyShishki', 0)
    expect(STARTING_STATE).toHaveProperty('tarLumps', 0)
    expect(Object.keys(STARTING_STATE.buildings)).toEqual(
      BUILDINGS.map((building) => building.id),
    )
  })

  it('defines market goods and rap campaigns', () => {
    expect(MARKET_GOODS.map((item) => item.id)).toContain('parallelImport')
    expect(RAP_CAMPAIGNS.map((item) => item.id)).toContain('iceFlexer')
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
