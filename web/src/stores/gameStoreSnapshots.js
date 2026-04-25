import {
  BUILDINGS,
  MARKET_GOODS,
  QUOTA_RULES,
  RAP_CAMPAIGNS,
  RUN_UPGRADES,
} from '../game/economyConfig.js'
import { getPrestigeUpgradeCards } from '../game/metaConfig.js'
import {
  getCampaignLaunchCost,
  getBuildingPurchaseCost,
  getBuildingPerkSummary,
  getEffectiveBrokerLevel,
  getRunUpgradePurchaseCost,
} from '../game/economyMath.js'
import { formatNumber } from '../lib/format.js'

function getLifetimeProgress(state) {
  return Math.max(
    0,
    Number(
      state.lifetimeShishkiEarned ??
        state.totalShishkiEarned ??
        state.currentRunShishki ??
        state.shishki ??
        0,
    ),
  )
}

function getBuildingUnlockRule(state, item, index) {
  if (index === 0) {
    return {
      unlocked: true,
      unlockText: '',
      unlockProgress: null,
      unlockRule: null,
    }
  }

  const previous = BUILDINGS[index - 1]
  const threshold = Math.max(25, Math.floor(previous.baseCost * 6))
  const previousOwned = Number(state.buildings?.[previous.id] ?? 0)
  const progress = getLifetimeProgress(state)
  const unlocked = previousOwned > 0 || progress >= threshold

  return {
    unlocked,
    unlockText: `Откроется после ${formatNumber(threshold)} шишек за всё время или первой покупки "${previous.title}".`,
    unlockProgress: {
      shishki: Math.min(progress, threshold),
      previousOwned,
    },
    unlockRule: {
      shishki: threshold,
      previousTitle: previous.title,
    },
  }
}

function getUpgradeUnlockRule(state, item) {
  const lifetime = getLifetimeProgress(state)
  const rulesById = {
    warehouseRhythm: {
      unlocked: true,
      threshold: 0,
      buildingId: null,
      buildingTitle: '',
    },
    cashbackBug: {
      threshold: 80,
      buildingId: 'garagePicker',
      buildingTitle: 'Сборщик шишек у гаражей',
    },
    doubleSwing: {
      threshold: 180,
      buildingId: 'garagePicker',
      buildingTitle: 'Сборщик шишек у гаражей',
    },
    quietLogistics: {
      threshold: 500,
      buildingId: 'pickupPoint',
      buildingTitle: 'ПВЗ на окраине',
    },
    bulkDeal: {
      threshold: 900,
      buildingId: 'pickupPoint',
      buildingTitle: 'ПВЗ на окраине',
    },
    brokenCounter: {
      threshold: 2_000,
      buildingId: 'greySorting',
      buildingTitle: 'Серая сортировка',
    },
    grayTenderLoop: {
      threshold: 3_000,
      buildingId: 'greySorting',
      buildingTitle: 'Серая сортировка',
    },
    warmBackground: {
      threshold: 5_000,
      buildingId: 'resaleStall',
      buildingTitle: 'Ларёк перепродажи',
    },
    warehouseConcession: {
      threshold: 6_500,
      buildingId: 'selfEmployedCrew',
      buildingTitle: 'Бригада самозанятых',
    },
    streetPromoBurst: {
      threshold: 10_000,
      buildingId: 'resaleStall',
      buildingTitle: 'Ларёк перепродажи',
    },
    districtWarmup: {
      threshold: 12_000,
      buildingId: 'resaleStall',
      buildingTitle: 'Ларёк перепродажи',
    },
    handTrained: {
      threshold: 10_000,
      buildingId: 'packingLine',
      buildingTitle: 'Смоляной цех',
    },
    quietDetour: {
      threshold: 12_000,
      buildingId: 'packingLine',
      buildingTitle: 'Смоляной цех',
    },
    tarCacheMerge: {
      threshold: 40_000,
      buildingId: 'packingLine',
      buildingTitle: 'Смоляной цех',
    },
    nightSlotSale: {
      threshold: 20_000,
      buildingId: 'nightWarehouse',
      buildingTitle: 'Подпольный фулфилмент',
    },
    feedOnStandby: {
      threshold: 30_000,
      buildingId: 'nightWarehouse',
      buildingTitle: 'Подпольный фулфилмент',
    },
    mediaTail: {
      threshold: 45_000,
      buildingId: 'nightWarehouse',
      buildingTitle: 'Подпольный фулфилмент',
    },
    streetContractWave: {
      threshold: 150_000,
      buildingId: 'nightWarehouse',
      buildingTitle: 'Подпольный фулфилмент',
    },
    adOverdrive: {
      threshold: 200_000,
      buildingId: 'routerBrokerage',
      buildingTitle: 'Агентство инфошума',
    },
    shadowCourierLine: {
      threshold: 750_000,
      buildingId: 'logisticsDepot',
      buildingTitle: 'Автопарк последней мили',
    },
  }

  const rule = rulesById[item.id]
  if (!rule || rule.unlocked) {
    return {
      unlocked: true,
      unlockText: '',
      unlockProgress: null,
      unlockRule: null,
    }
  }

  const owned = Number(state.buildings?.[rule.buildingId] ?? 0)
  const unlocked = owned > 0 || lifetime >= rule.threshold

  return {
    unlocked,
    unlockText: `Откроется после ${formatNumber(rule.threshold)} шишек за всё время или после покупки "${rule.buildingTitle}".`,
    unlockProgress: {
      shishki: Math.min(lifetime, rule.threshold),
      previousOwned: owned,
    },
    unlockRule: {
      shishki: rule.threshold,
      previousTitle: rule.buildingTitle,
    },
  }
}

function getMarketGoodUnlockRule(state, item) {
  if (!state.market?.unlocked) {
    return {
      unlocked: false,
      unlockText:
        'Открой "Покупки" -> "Здания" и купи первый "Ларёк перепродажи". После этого откроются сделки, портфель и прогревы.',
      unlockProgress: {
        shishki: Math.min(getLifetimeProgress(state), BUILDINGS[4].baseCost),
        previousOwned: Number(state.buildings?.resaleStall ?? 0),
      },
      unlockRule: {
        shishki: BUILDINGS[4].baseCost,
        previousTitle: 'Ларёк перепродажи',
      },
    }
  }

  switch (item.id) {
    case 'tarDrums':
      return buildOwnedUnlockRule(
        state,
        'selfEmployedCrew',
        'Бригада самозанятых',
      )
    case 'railSlotTokens':
      return buildOwnedUnlockRule(state, 'resaleStall', 'Ларёк перепродажи', 3)
    case 'grayBrokerNotes':
      return buildOwnedUnlockRule(state, 'packingLine', 'Смоляной цех')
    case 'pineSealant':
      return buildOwnedUnlockRule(
        state,
        'nightWarehouse',
        'Подпольный фулфилмент',
      )
    default:
      return {
        unlocked: true,
        unlockText: '',
        unlockProgress: null,
        unlockRule: null,
      }
  }
}

function buildOwnedUnlockRule(state, buildingId, buildingTitle, amount = 1) {
  const owned = Number(state.buildings?.[buildingId] ?? 0)
  const unlocked = owned >= amount

  return {
    unlocked,
    unlockText: `Откроется после ${amount} шт. "${buildingTitle}".`,
    unlockProgress: {
      shishki: owned,
      previousOwned: owned,
    },
    unlockRule: {
      shishki: amount,
      previousTitle: buildingTitle,
    },
  }
}

function getCampaignUnlockRule(state, item) {
  if (state.activeCampaign?.id === item.id) {
    return {
      unlocked: true,
      unlockText: '',
      unlockProgress: null,
      unlockRule: null,
    }
  }

  if (!state.market?.unlocked) {
    return {
      unlocked: false,
      unlockText:
        'Сначала открой рынок через "Покупки" -> "Здания" -> "Ларёк перепродажи". Затем станут доступны кампании и прогревы.',
      unlockProgress: {
        shishki: Math.min(getLifetimeProgress(state), BUILDINGS[4].baseCost),
        previousOwned: Number(state.buildings?.resaleStall ?? 0),
      },
      unlockRule: {
        shishki: BUILDINGS[4].baseCost,
        previousTitle: 'Ларёк перепродажи',
      },
    }
  }

  switch (item.id) {
    case 'sundayProphet':
      return buildOwnedUnlockRule(state, 'resaleStall', 'Ларёк перепродажи', 2)
    case 'nightDistrict':
      return buildOwnedUnlockRule(state, 'packingLine', 'Смоляной цех')
    case 'grayTour':
      return buildOwnedUnlockRule(
        state,
        'nightWarehouse',
        'Подпольный фулфилмент',
      )
    case 'logisticsAnthem':
      return buildOwnedUnlockRule(
        state,
        'routerBrokerage',
        'Агентство инфошума',
      )
    default:
      return {
        unlocked: true,
        unlockText: '',
        unlockProgress: null,
        unlockRule: null,
      }
  }
}

function countItemsWithPositiveCount(items) {
  let count = 0

  for (const item of items) {
    if ((item?.count ?? 0) > 0) {
      count += 1
    }
  }

  return count
}

function getMarketScreenSummary(state, buildings) {
  const resaleStall = buildings.find((item) => item.id === 'resaleStall')
  const lifetimeShishki = getLifetimeProgress(state)
  const resaleUnlockTarget = Math.max(
    0,
    Number(resaleStall?.unlockRule?.shishki ?? 0),
  )
  const shishkiRemainingToUnlock = Math.max(
    0,
    resaleUnlockTarget - lifetimeShishki,
  )
  const resaleStallIndex = buildings.findIndex(
    (item) => item.id === 'resaleStall',
  )
  const buildingUnlockGoal = resaleStallIndex >= 0 ? resaleStallIndex + 1 : 0
  const buildingUnlockProgress =
    resaleStallIndex >= 0
      ? buildings.slice(0, resaleStallIndex + 1).filter((item) => item.unlocked)
          .length
      : 0
  const unlockProgressPercent =
    resaleUnlockTarget > 0
      ? Math.min(
          100,
          (Math.min(lifetimeShishki, resaleUnlockTarget) / resaleUnlockTarget) *
            100,
        )
      : 0

  return {
    unlockPrice: resaleStall ? formatNumber(resaleStall.cost) : '28 000',
    shishkiRemainingToUnlock,
    buildingUnlockGoal,
    buildingUnlockProgress,
    unlockProgressPercent,
  }
}

export function buildEconomySnapshot(state, derived) {
  const buildings = BUILDINGS.map((item, index) => {
    const owned = state.buildings[item.id] ?? 0
    const cost = getBuildingPurchaseCost(state, item, owned)
    const unlock = getBuildingUnlockRule(state, item, index)

    return {
      ...item,
      ...unlock,
      owned,
      level: state.buildingLevels[item.id] ?? 0,
      perkSummary: getBuildingPerkSummary(
        item.id,
        state.buildingLevels[item.id] ?? 0,
      ),
      cost,
      canBuy: unlock.unlocked && state.shishki >= cost,
    }
  })

  const upgrades = RUN_UPGRADES.map((item) => {
    const unlock = getUpgradeUnlockRule(state, item)
    const level = state.upgrades[item.id] ?? 0
    const cost = getRunUpgradePurchaseCost(state, item, level)

    return {
      ...item,
      ...unlock,
      level,
      cost,
      canBuy: unlock.unlocked && state.shishki >= cost,
    }
  })

  const marketGoods = MARKET_GOODS.map((item) => {
    const unlock = getMarketGoodUnlockRule(state, item)

    return {
      ...item,
      ...unlock,
      price: state.market.prices[item.id] ?? item.basePrice,
      owned: state.market.positions[item.id] ?? 0,
      averageBuyPrice: state.market.averageBuyPrice[item.id] ?? 0,
    }
  })

  const campaigns = RAP_CAMPAIGNS.map((item) => {
    const unlock = getCampaignUnlockRule(state, item)
    const launchCost = getCampaignLaunchCost(state, item)

    return {
      ...item,
      ...unlock,
      active: state.activeCampaign?.id === item.id,
      launchCost,
      canBuy: unlock.unlocked && state.shishki >= launchCost,
    }
  })

  return {
    buildings,
    subscriptions: buildings,
    upgrades,
    prestigeUpgrades: getPrestigeUpgradeCards(state),
    marketGoods,
    campaigns,
    marketScreen: getMarketScreenSummary(state, buildings),
    brokerLevel: getEffectiveBrokerLevel(state),
    shishkiPerSecond: derived.shishkiPerSecond,
    clickPower: derived.clickPower,
  }
}

export function buildClickerFieldData(state) {
  const marketUnlocked = Boolean(state.market?.unlocked)
  const lifetime = getLifetimeProgress(state)
  const firstQuota = QUOTA_RULES.baseQuota

  const buildingsFieldItems = BUILDINGS.map((item, index) => {
    const count = Math.max(0, state.buildings[item.id] ?? 0)
    const unlock = getBuildingUnlockRule(state, item, index)

    return {
      id: item.id,
      title: item.title,
      code: item.fieldCode,
      type: 'building',
      state: !unlock.unlocked ? 'locked' : count > 0 ? 'owned' : 'available',
      count,
      unlocked: unlock.unlocked,
    }
  })
  const marketFieldItems = [
    ...MARKET_GOODS.map((item) => {
      const count = Math.max(0, state.market.positions[item.id] ?? 0)
      const unlock = getMarketGoodUnlockRule(state, item)

      return {
        id: item.id,
        title: item.title,
        code: item.fieldCode,
        type: 'market',
        state: !unlock.unlocked ? 'locked' : count > 0 ? 'owned' : 'available',
        count,
        unlocked: unlock.unlocked,
      }
    }),
    ...RAP_CAMPAIGNS.map((item) => {
      const unlock = getCampaignUnlockRule(state, item)

      return {
        id: item.id,
        title: item.title,
        code: item.fieldCode,
        type: 'campaign',
        state: !unlock.unlocked
          ? 'locked'
          : state.activeCampaign?.id === item.id
            ? 'active'
            : 'available',
        count: state.activeCampaign?.id === item.id ? 1 : 0,
        unlocked: unlock.unlocked,
      }
    }),
  ]
  const upgradesFieldItems = RUN_UPGRADES.map((item) => {
    const count = Math.max(0, state.upgrades[item.id] ?? 0)
    const unlock = getUpgradeUnlockRule(state, item)

    return {
      id: item.id,
      title: item.title,
      code: item.fieldCode,
      type: 'upgrade',
      state: !unlock.unlocked ? 'locked' : count > 0 ? 'upgraded' : 'available',
      count,
      unlocked: unlock.unlocked,
    }
  })
  const metaFieldItems = getPrestigeUpgradeCards(state).map((item) => ({
    id: item.id,
    title: item.title,
    code: item.fieldCode,
    type: 'meta',
    state: item.level > 0 ? 'upgraded' : 'locked',
    count: item.level,
    unlocked:
      (state.totalHeavenlyShishkiEarned ?? 0) > 0 ||
      (state.currentRunShishki ?? 0) >= firstQuota,
  }))

  return {
    buildingsFieldItems,
    marketFieldItems,
    upgradesFieldItems,
    metaFieldItems,
    summary: {
      buildingCount: countItemsWithPositiveCount(buildingsFieldItems),
      upgradeCount: countItemsWithPositiveCount(upgradesFieldItems),
      metaCount: countItemsWithPositiveCount(metaFieldItems),
      marketExposure: countItemsWithPositiveCount(marketFieldItems),
    },
    deckLocks: {
      buildings: {
        unlocked: true,
        text: '',
        progress: null,
        goal: null,
      },
      market: {
        unlocked: marketUnlocked,
        text: 'Открой "Покупки" -> "Здания" и купи первый "Ларёк перепродажи". После этого включатся сделки, портфель и прогревы.',
        progress: Math.min(Number(state.buildings?.resaleStall ?? 0), 1),
        goal: 1,
      },
      upgrades: {
        unlocked: lifetime >= 80,
        text: 'Откроется после первых 80 шишек за всё время.',
        progress: Math.min(lifetime, 80),
        goal: 80,
      },
      meta: {
        unlocked:
          (state.totalHeavenlyShishkiEarned ?? 0) > 0 ||
          (state.currentRunShishki ?? 0) >= firstQuota,
        text: 'Откроется, когда подберёшься к первой квоте небесных шишек.',
        progress: Math.min(Number(state.currentRunShishki ?? 0), firstQuota),
        goal: firstQuota,
      },
    },
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
