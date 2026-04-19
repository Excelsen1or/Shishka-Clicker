import {
  BUILDINGS,
  MARKET_GOODS,
  RAP_CAMPAIGNS,
  RUN_UPGRADES,
} from '../game/economyConfig.js'
import { getPrestigeUpgradeCards, getQuotaPreview } from '../game/metaConfig.js'
import { getBuildingCost } from '../game/economyMath.js'
import { formatNumber } from '../lib/format.js'

export function buildEconomySnapshot(state, derived) {
  const buildings = BUILDINGS.map((item) => {
    const owned = state.buildings[item.id] ?? 0
    const cost = getBuildingCost(item.baseCost, owned)

    return {
      ...item,
      owned,
      level: state.buildingLevels[item.id] ?? 0,
      cost,
      canBuy: state.shishki >= cost,
    }
  })

  return {
    buildings,
    subscriptions: buildings,
    upgrades: RUN_UPGRADES.map((item) => ({
      ...item,
      level: state.upgrades[item.id] ?? 0,
      canBuy: state.shishki >= item.cost,
    })),
    prestigeUpgrades: getPrestigeUpgradeCards(state),
    marketGoods: MARKET_GOODS.map((item) => ({
      ...item,
      price: state.market.prices[item.id] ?? item.basePrice,
      owned: state.market.positions[item.id] ?? 0,
      averageBuyPrice: state.market.averageBuyPrice[item.id] ?? 0,
    })),
    campaigns: RAP_CAMPAIGNS.map((item) => ({
      ...item,
      active: state.activeCampaign?.id === item.id,
      canBuy: state.shishki >= item.cost,
    })),
    shishkiPerSecond: derived.shishkiPerSecond,
    clickPower: derived.clickPower,
  }
}

export function buildProgressOverviewData(state, derived) {
  const quota = getQuotaPreview(state)

  return {
    currentRunShishki: state.currentRunShishki,
    currentQuotaTarget: quota.current,
    nextQuotaTarget: quota.next,
    rebirthsText: formatNumber(state.rebirths),
    heavenlyShishkiText: formatNumber(state.heavenlyShishki),
    tarLumpsText: formatNumber(state.tarLumps),
    shishkiPerSecondText: formatNumber(derived.shishkiPerSecond),
  }
}

export function buildClickerFieldData(state) {
  return {
    buildingsFieldItems: BUILDINGS.map((item) => {
      const count = Math.max(0, state.buildings[item.id] ?? 0)

      return {
        id: item.id,
        title: item.title,
        code: item.fieldCode,
        type: 'building',
        state: count > 0 ? 'owned' : 'locked',
        count,
      }
    }),
    marketFieldItems: [
      ...MARKET_GOODS.map((item) => {
        const count = Math.max(0, state.market.positions[item.id] ?? 0)

        return {
          id: item.id,
          title: item.title,
          code: item.fieldCode,
          type: 'market',
          state: count > 0 ? 'owned' : 'locked',
          count,
        }
      }),
      ...RAP_CAMPAIGNS.map((item) => ({
        id: item.id,
        title: item.title,
        code: item.fieldCode,
        type: 'campaign',
        state: state.activeCampaign?.id === item.id ? 'active' : 'available',
        count: state.activeCampaign?.id === item.id ? 1 : 0,
      })),
    ],
    metaFieldItems: [
      ...RUN_UPGRADES.map((item) => {
        const count = Math.max(0, state.upgrades[item.id] ?? 0)

        return {
          id: item.id,
          title: item.title,
          code: item.fieldCode,
          type: 'upgrade',
          state: count > 0 ? 'upgraded' : 'locked',
          count,
        }
      }),
      ...getPrestigeUpgradeCards(state).map((item) => ({
        id: item.id,
        title: item.title,
        code: item.fieldCode,
        type: 'meta',
        state: item.level > 0 ? 'upgraded' : 'locked',
        count: item.level,
      })),
    ],
  }
}

export function buildDevConsoleResources(state) {
  return {
    shishki: state.shishki,
    shishkiText: formatNumber(state.shishki),
    heavenlyShishki: state.heavenlyShishki,
    heavenlyShishkiText: formatNumber(state.heavenlyShishki),
    tarLumps: state.tarLumps,
    tarLumpsText: formatNumber(state.tarLumps),
  }
}
