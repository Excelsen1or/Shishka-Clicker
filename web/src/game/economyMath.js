import {
  BUILDINGS,
  EVENT_DEFINITIONS,
  MARKET_GOODS,
  PRESTIGE_UPGRADES,
  QUOTA_RULES,
  RAP_CAMPAIGNS,
  RUN_UPGRADES,
  TAR_LUMP_RULES,
} from './economyConfig.js'

const RUN_UPGRADE_BY_ID = Object.fromEntries(
  RUN_UPGRADES.map((item) => [item.id, item]),
)
const PRESTIGE_UPGRADE_BY_ID = Object.fromEntries(
  PRESTIGE_UPGRADES.map((item) => [item.id, item]),
)

function createUniqueIdIndex(items, label) {
  const index = {}

  for (const item of items) {
    const id = item?.id

    if (typeof id !== 'string' || !id) {
      throw new TypeError(`Invalid ${label} id`)
    }

    if (Object.prototype.hasOwnProperty.call(index, id)) {
      throw new RangeError(`Duplicate ${label} id: ${id}`)
    }

    index[id] = item
  }

  return index
}

const EVENT_DEFINITION_BY_ID = createUniqueIdIndex(EVENT_DEFINITIONS, 'event')
const MARKET_GOOD_BY_ID = createUniqueIdIndex(MARKET_GOODS, 'market good')
const BUILDING_BY_ID = createUniqueIdIndex(BUILDINGS, 'building')
const MARKET_PROFILE_RULES = {
  stable: { swing: 0.02, trend: 0.002 },
  volatile: { swing: 0.07, trend: 0.006 },
  hype: { swing: 0.05, trend: 0.004 },
}
const BUILDING_PERK_STEPS = {
  garagePicker: {
    label: 'Уровни усиливают ручной клик и стартовый темп.',
    clickPower: [0.3, 0.75, 1.5],
  },
  pickupPoint: {
    label: 'Уровни усиливают выпадение и силу положительных окон.',
    eventChance: [0.012, 0.025, 0.05],
  },
  greySorting: {
    label: 'Уровни усиливают сортировку и общий прод.',
    productionMultiplier: [0.08, 0.18, 0.35],
  },
  selfEmployedCrew: {
    label: 'Уровни режут комиссию на рынке.',
    feeReduction: [0.003, 0.007, 0.015],
  },
  resaleStall: {
    label: 'Уровни поднимают наценку с удачных перепродаж.',
    marketProfitBonus: [0.05, 0.12, 0.22],
  },
  packingLine: {
    label: 'Уровни ускоряют комочки и удешевляют прогревы.',
    tarLumpRate: [0.12, 0.28, 0.55],
    campaignDiscount: [0.08, 0.18, 0.3],
  },
  nightWarehouse: {
    label: 'Уровни усиливают кампании и награды событий.',
    campaignPotency: [0.12, 0.25, 0.45],
    eventRewardBonus: [0.15, 0.3, 0.5],
  },
  bunkerSortingHub: {
    label: 'Уровни усиливают редкие события и цепочки.',
    rareEventChance: [0.01, 0.02, 0.035],
  },
  logisticsDepot: {
    label: 'Уровни усиливают квотный темп и базовый прод.',
    productionMultiplier: [0.1, 0.22, 0.4],
  },
  tarpCollective: {
    label: 'Уровни ускоряют комочки и усиливают тентовые окна.',
    tarLumpRate: [0.08, 0.18, 0.3],
  },
  routerBrokerage: {
    label: 'Уровни поднимают рынок и брокерскую силу.',
    feeReduction: [0.004, 0.009, 0.018],
    marketProfitBonus: [0.04, 0.1, 0.18],
  },
  railSideHub: {
    label: 'Уровни усиливают кампании и всплески на слотах.',
    campaignPotency: [0.08, 0.16, 0.3],
  },
  greyImportExchange: {
    label: 'Уровни усиливают редкие рыночные всплески.',
    rareEventChance: [0.015, 0.03, 0.05],
    marketProfitBonus: [0.05, 0.12, 0.22],
  },
  coneDerivativeDesk: {
    label: 'Уровни разгоняют поздние перепродажи и редкие окна.',
    marketProfitBonus: [0.06, 0.14, 0.28],
    rareEventChance: [0.015, 0.03, 0.05],
  },
  ministryOfConeLogistics: {
    label: 'Уровни усиливают почти всю машину поздней жизни.',
    productionMultiplier: [0.12, 0.28, 0.5],
    eventRewardBonus: [0.12, 0.24, 0.45],
  },
}
const EVENT_PRESENTATION = {
  tarStorm:
    'Тяжёлая буря по дефицитным коробкам: производство проседает, а рынок сильно трясёт.',
  districtHype:
    'Короткий районный хайп: сразу приносит награду, усиливает клик и поднимает шум вокруг рынка.',
  fieldAudit:
    'Проверка с подвохом: клик становится сильнее, производство слегка проседает, зато покупки идут со скидкой.',
  routeOverflow:
    'Маршруты захлебнулись: и клик, и производство проседают, так что лучше переждать этот сбой.',
  pineBloom:
    'Шишечное цветение: производство заметно растёт, а квота закрывается ощутимо быстрее.',
  logisticsCongress:
    'Конгресс логистики: даёт сильный разгон производству и заметно оживляет рынок завоза.',
}

function getBreakpointIndex(level) {
  if (level >= 10) return 2
  if (level >= 5) return 1
  if (level >= 1) return 0
  return -1
}

function getBuildingPerkValue(id, level, perkKey) {
  const breakpointIndex = getBreakpointIndex(level)
  if (breakpointIndex < 0) return 0

  return BUILDING_PERK_STEPS[id]?.[perkKey]?.[breakpointIndex] ?? 0
}

function getBuildingLevelMultiplier(level) {
  const normalizedLevel = Math.max(0, Number(level) || 0)
  let bonus = 0

  if (normalizedLevel >= 1) bonus += 0.15
  if (normalizedLevel >= 5) bonus += 0.35
  if (normalizedLevel >= 10) bonus += 0.75

  return 1 + bonus
}

export function getEffectiveBrokerLevel(state) {
  const explicitLevel = Math.max(0, Number(state?.market?.brokerLevel ?? 0))
  const resaleLevel = Math.max(0, Number(state?.buildings?.resaleStall ?? 0))
  const packingLine = Math.max(0, Number(state?.buildings?.packingLine ?? 0))
  const nightWarehouse = Math.max(
    0,
    Number(state?.buildings?.nightWarehouse ?? 0),
  )
  const routerBrokerage = Math.max(
    0,
    Number(state?.buildings?.routerBrokerage ?? 0),
  )
  const prestigeLevel = Math.max(
    0,
    Number(state?.prestigeUpgrades?.shadowBrokerage ?? 0),
  )
  const derivedLevel =
    (resaleLevel >= 1 ? 1 : 0) +
    (resaleLevel >= 3 ? 1 : 0) +
    (packingLine >= 1 ? 1 : 0) +
    (nightWarehouse >= 1 ? 1 : 0) +
    (routerBrokerage >= 1 ? 2 : 0) +
    prestigeLevel

  return Math.min(8, Math.max(explicitLevel, derivedLevel))
}

export function getMarketFeeRate(state) {
  const prestigeFeeReduction =
    (state?.prestigeUpgrades?.taxBlindness ?? 0) *
      (PRESTIGE_UPGRADE_BY_ID.taxBlindness?.value ?? 0) +
    (state?.prestigeUpgrades?.shadowBrokerage ?? 0) *
      (PRESTIGE_UPGRADE_BY_ID.shadowBrokerage?.value ?? 0)

  return Math.max(
    0.02,
    0.08 -
      getEffectiveBrokerLevel(state) * 0.005 -
      prestigeFeeReduction -
      getBuildingPerkValue(
        'selfEmployedCrew',
        state?.buildingLevels?.selfEmployedCrew ?? 0,
        'feeReduction',
      ),
  )
}

export function getBuildingCost(baseCost, owned) {
  return Math.floor(baseCost * Math.pow(1.15, owned) + 1e-9)
}

export function getRunUpgradeCost(baseCost, level) {
  return Math.floor(baseCost * Math.pow(1.15, level) + 1e-9)
}

export function getQuotaTarget(baseQuota, quotaGrowth, quotaIndex) {
  return Math.floor(baseQuota * Math.pow(quotaGrowth, quotaIndex))
}

export function deriveProduction(state) {
  const buildingOutput = BUILDINGS.reduce((total, building) => {
    const owned = state?.buildings?.[building.id] ?? 0
    const level = state?.buildingLevels?.[building.id] ?? 0

    return (
      total + owned * building.baseOutput * getBuildingLevelMultiplier(level)
    )
  }, 0)
  const globalUpgradeBonus = RUN_UPGRADES.reduce((total, upgrade) => {
    if (upgrade.kind !== 'globalMultiplier') {
      return total
    }

    return total + (state?.upgrades?.[upgrade.id] ?? 0) * upgrade.value
  }, 0)
  const clickUpgradeBonus = RUN_UPGRADES.reduce((total, upgrade) => {
    if (upgrade.kind !== 'clickMultiplier') {
      return total
    }

    return total + (state?.upgrades?.[upgrade.id] ?? 0) * upgrade.value
  }, 0)
  const prestigeProductionBonus =
    (state?.prestigeUpgrades?.heavenlyTar ?? 0) *
      (PRESTIGE_UPGRADE_BY_ID.heavenlyTar?.value ?? 0) +
    (state?.prestigeUpgrades?.logisticsIcon ?? 0) *
      (PRESTIGE_UPGRADE_BY_ID.logisticsIcon?.value ?? 0) +
    (state?.prestigeUpgrades?.coneEmpire ?? 0) *
      (PRESTIGE_UPGRADE_BY_ID.coneEmpire?.value ?? 0)
  const prestigeClickBonus =
    (state?.prestigeUpgrades?.heavenlyTar ?? 0) * 0.25 +
    (state?.prestigeUpgrades?.coneEmpire ?? 0) *
      ((PRESTIGE_UPGRADE_BY_ID.coneEmpire?.value ?? 0) * 0.5)
  const buildingProductionBonus = BUILDINGS.reduce((total, building) => {
    return (
      total +
      getBuildingPerkValue(
        building.id,
        state?.buildingLevels?.[building.id] ?? 0,
        'productionMultiplier',
      )
    )
  }, 0)
  const buildingClickBonus = BUILDINGS.reduce((total, building) => {
    return (
      total +
      getBuildingPerkValue(
        building.id,
        state?.buildingLevels?.[building.id] ?? 0,
        'clickPower',
      )
    )
  }, 0)
  const campaignPotencyBonus = getBuildingPerkValue(
    'nightWarehouse',
    state?.buildingLevels?.nightWarehouse ?? 0,
    'campaignPotency',
  )
  const activeEventProductionBoost = state?.activeEvent?.productionBoost ?? 0
  const activeEventClickBoost = state?.activeEvent?.clickBoost ?? 0
  const activeCampaignProductionBoost =
    (state?.activeCampaign?.productionBoost ?? 0) * (1 + campaignPotencyBonus)
  const activeCampaignClickBoost =
    (state?.activeCampaign?.clickBoost ?? 0) * (1 + campaignPotencyBonus)
  const globalMultiplier =
    1 +
    globalUpgradeBonus +
    prestigeProductionBonus +
    buildingProductionBonus +
    activeCampaignProductionBoost +
    activeEventProductionBoost
  const clickPower =
    1 +
    clickUpgradeBonus +
    prestigeClickBonus +
    buildingClickBonus +
    activeCampaignClickBoost +
    activeEventClickBoost

  return {
    clickPower,
    shishkiPerSecond: Number((buildingOutput * globalMultiplier).toFixed(2)),
  }
}

export function resolveQuotaClosures({
  quotaIndex,
  currentRunShishki,
  heavenlyShishki,
  totalHeavenlyShishkiEarned,
  baseQuota = QUOTA_RULES.baseQuota,
  quotaGrowth = QUOTA_RULES.quotaGrowth,
}) {
  if (
    !Number.isInteger(quotaIndex) ||
    quotaIndex < 0 ||
    !Number.isFinite(baseQuota) ||
    baseQuota <= 0 ||
    !Number.isFinite(quotaGrowth) ||
    quotaGrowth <= 1
  ) {
    throw new RangeError('Invalid quota config')
  }

  let nextQuotaIndex = quotaIndex
  let nextHeavenly = heavenlyShishki
  let nextTotalHeavenly = totalHeavenlyShishkiEarned
  let closedQuotas = 0
  let currentTarget = getQuotaTarget(baseQuota, quotaGrowth, nextQuotaIndex)

  if (!Number.isFinite(currentTarget) || currentTarget <= 0) {
    throw new RangeError('Invalid quota config')
  }

  while (currentRunShishki >= currentTarget) {
    const nextTarget = getQuotaTarget(
      baseQuota,
      quotaGrowth,
      nextQuotaIndex + 1,
    )

    if (!Number.isFinite(nextTarget) || nextTarget <= currentTarget) {
      throw new RangeError('Invalid quota config')
    }

    nextQuotaIndex += 1
    nextHeavenly += 1
    nextTotalHeavenly += 1
    closedQuotas += 1
    currentTarget = nextTarget
  }

  return {
    closedQuotas,
    quotaIndex: nextQuotaIndex,
    heavenlyShishki: nextHeavenly,
    totalHeavenlyShishkiEarned: nextTotalHeavenly,
  }
}

export function accrueTarLumps(state, elapsedMs) {
  const tarUpgradeBonus = RUN_UPGRADES.reduce((total, upgrade) => {
    if (upgrade.kind !== 'tarLumpMultiplier') {
      return total
    }

    return total + (state?.upgrades?.[upgrade.id] ?? 0) * upgrade.value
  }, 0)
  const buildingTarBonus = getBuildingPerkValue(
    'packingLine',
    state?.buildingLevels?.packingLine ?? 0,
    'tarLumpRate',
  )
  const adjustedElapsedMs = elapsedMs * (1 + tarUpgradeBonus + buildingTarBonus)
  const totalProgress = (state?.tarLumpProgressMs ?? 0) + adjustedElapsedMs
  const earned = Math.floor(totalProgress / TAR_LUMP_RULES.intervalMs)

  return {
    ...state,
    tarLumps: (state?.tarLumps ?? 0) + earned,
    tarLumpProgressMs: totalProgress % TAR_LUMP_RULES.intervalMs,
  }
}

export function advanceMarketPrices(state, random = Math.random) {
  if (!state?.market?.unlocked) {
    return state
  }

  const nextPrices = { ...state.market.prices }

  for (const good of MARKET_GOODS) {
    const currentPrice = state.market.prices?.[good.id] ?? good.basePrice
    const profileRules = MARKET_PROFILE_RULES[good.profile] ?? {
      swing: 0.03,
      trend: 0.002,
    }
    const randomOffset = (random() * 2 - 1) * profileRules.swing
    const anchorPull = ((good.basePrice - currentPrice) / good.basePrice) * 0.08
    const campaignBoost =
      good.profile === 'hype' && state.activeCampaign
        ? 0.025 + (state.activeCampaign.eventBoost ?? 0) * 0.08
        : 0
    const activeEventBoost =
      state.activeEvent?.marketBoostGoodId === good.id
        ? (state.activeEvent.marketBoost ?? 0)
        : 0
    const proposedPrice = Math.max(
      Math.floor(good.basePrice * 0.35),
      Math.round(
        currentPrice *
          (1 +
            profileRules.trend +
            randomOffset +
            anchorPull +
            campaignBoost +
            activeEventBoost),
      ),
    )
    const driftDirection =
      randomOffset +
        anchorPull +
        campaignBoost +
        activeEventBoost +
        profileRules.trend >=
      0
        ? 1
        : -1
    const nextPrice =
      proposedPrice === currentPrice
        ? Math.max(
            Math.floor(good.basePrice * 0.35),
            currentPrice + driftDirection,
          )
        : proposedPrice

    nextPrices[good.id] = nextPrice
  }

  return {
    ...state,
    market: {
      ...state.market,
      prices: nextPrices,
    },
  }
}

export function applyMarketTrade({ state, goodId, quantity, side }) {
  const marketGood = MARKET_GOOD_BY_ID[goodId]
  const unitPrice =
    state?.market?.prices?.[goodId] ?? marketGood?.basePrice ?? 0
  const normalizedQuantity = Number(quantity)

  if (
    !Number.isFinite(unitPrice) ||
    unitPrice <= 0 ||
    !Number.isFinite(normalizedQuantity) ||
    normalizedQuantity <= 0 ||
    !Number.isInteger(normalizedQuantity) ||
    (side !== 'buy' && side !== 'sell')
  ) {
    throw new RangeError('Invalid trade')
  }

  const rawValue = unitPrice * normalizedQuantity
  const feeRate = getMarketFeeRate(state)
  const feePaid = Math.ceil(rawValue * feeRate)
  const owned = state?.market?.positions?.[goodId] ?? 0
  const averageBuyPrice = state?.market?.averageBuyPrice?.[goodId] ?? 0
  const availableShishki = state?.shishki ?? 0
  const nextOwned =
    side === 'buy' ? owned + normalizedQuantity : owned - normalizedQuantity

  if (side === 'buy' && availableShishki < rawValue + feePaid) {
    throw new RangeError('Insufficient shishki')
  }

  if (side === 'sell' && nextOwned < 0) {
    throw new RangeError('Insufficient position')
  }
  const nextAverageBuyPrice =
    side === 'buy' && nextOwned > 0
      ? Math.round((averageBuyPrice * owned + rawValue) / nextOwned)
      : nextOwned > 0
        ? averageBuyPrice
        : 0

  return {
    feePaid,
    realizedProfit:
      side === 'sell'
        ? Math.max(
            0,
            rawValue -
              averageBuyPrice * normalizedQuantity -
              feePaid +
              averageBuyPrice *
                normalizedQuantity *
                getBuildingPerkValue(
                  'resaleStall',
                  state?.buildingLevels?.resaleStall ?? 0,
                  'marketProfitBonus',
                ),
          )
        : 0,
    nextState: {
      ...state,
      shishki:
        side === 'buy'
          ? state.shishki - rawValue - feePaid
          : state.shishki + rawValue - feePaid,
      market: {
        ...state.market,
        positions: {
          ...state.market.positions,
          [goodId]: nextOwned,
        },
        averageBuyPrice: {
          ...state.market.averageBuyPrice,
          [goodId]: nextAverageBuyPrice,
        },
      },
    },
  }
}

export function getCampaignById(id) {
  return RAP_CAMPAIGNS.find((item) => item.id === id) ?? null
}

export function getEventById(id) {
  return EVENT_DEFINITION_BY_ID[id] ?? null
}

export function getBuildingById(id) {
  return BUILDING_BY_ID[id] ?? null
}

export function getBuildingPerkSummary(id, level = 0) {
  const baseLabel = BUILDING_PERK_STEPS[id]?.label ?? 'Базовый permanent perk.'
  const breakpointIndex = getBreakpointIndex(level)

  if (breakpointIndex < 0) {
    return baseLabel
  }

  if (id === 'garagePicker') {
    return `${baseLabel} Сейчас: +${getBuildingPerkValue(id, level, 'clickPower')} к клику.`
  }

  if (id === 'greySorting') {
    return `${baseLabel} Сейчас: +${Math.round(
      getBuildingPerkValue(id, level, 'productionMultiplier') * 100,
    )}% к сортировке.`
  }

  if (id === 'selfEmployedCrew') {
    return `${baseLabel} Сейчас: -${
      Math.round(getBuildingPerkValue(id, level, 'feeReduction') * 1000) / 10
    }% комиссии.`
  }

  if (id === 'resaleStall') {
    return `${baseLabel} Сейчас: +${Math.round(
      getBuildingPerkValue(id, level, 'marketProfitBonus') * 100,
    )}% к удачной перепродаже.`
  }

  if (id === 'pickupPoint') {
    return `${baseLabel} Сейчас: +${
      Math.round(getBuildingPerkValue(id, level, 'eventChance') * 1000) / 10
    }% к хорошим окнам.`
  }

  if (id === 'packingLine') {
    return `${baseLabel} Сейчас: -${Math.round(
      getBuildingPerkValue(id, level, 'campaignDiscount') * 100,
    )}% к цене кампаний.`
  }

  if (id === 'nightWarehouse') {
    return `${baseLabel} Сейчас: +${Math.round(
      getBuildingPerkValue(id, level, 'campaignPotency') * 100,
    )}% к силе кампаний.`
  }

  if (
    ['bunkerSortingHub', 'greyImportExchange', 'coneDerivativeDesk'].includes(
      id,
    )
  ) {
    return `${baseLabel} Сейчас: выше шанс редкого окна.`
  }

  return baseLabel
}

export function getEventSpawnChance(state, seconds) {
  const baseChance =
    seconds * (0.018 + (state?.activeCampaign?.eventBoost ?? 0) * 0.06)
  const pickupPointBonus = getBuildingPerkValue(
    'pickupPoint',
    state?.buildingLevels?.pickupPoint ?? 0,
    'eventChance',
  )
  const rareBonus = BUILDINGS.reduce((total, building) => {
    return (
      total +
      getBuildingPerkValue(
        building.id,
        state?.buildingLevels?.[building.id] ?? 0,
        'rareEventChance',
      )
    )
  }, 0)

  return Math.min(0.45, baseChance + pickupPointBonus + rareBonus)
}

export function getEventPresentation(id) {
  return EVENT_PRESENTATION[id] ?? 'Окно события активно.'
}

export function getCampaignLaunchCost(state, campaign) {
  const campaignDiscount = getBuildingPerkValue(
    'packingLine',
    state?.buildingLevels?.packingLine ?? 0,
    'campaignDiscount',
  )

  return Math.max(1, Math.floor(campaign.cost * (1 - campaignDiscount)))
}

export function getEventRewardMultiplier(state) {
  return (
    1 +
    (state?.prestigeUpgrades?.logisticsIcon ?? 0) * 0.15 +
    getBuildingPerkValue(
      'nightWarehouse',
      state?.buildingLevels?.nightWarehouse ?? 0,
      'eventRewardBonus',
    )
  )
}

export function rollEventDefinition(random = Math.random, state = null) {
  const rareBias = state
    ? BUILDINGS.reduce((total, building) => {
        return (
          total +
          getBuildingPerkValue(
            building.id,
            state?.buildingLevels?.[building.id] ?? 0,
            'rareEventChance',
          )
        )
      }, 0)
    : 0
  const weighted = EVENT_DEFINITIONS.map((event) => {
    const baseWeight =
      event.rarity === 'rare'
        ? 0.35 + rareBias * 10
        : event.kind === 'chain'
          ? 0.5 + rareBias * 8
          : 1

    return { event, weight: baseWeight }
  })
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
  let cursor = random() * totalWeight

  for (const item of weighted) {
    cursor -= item.weight
    if (cursor <= 0) {
      return item.event
    }
  }

  return weighted[weighted.length - 1]?.event ?? EVENT_DEFINITIONS[0]
}
