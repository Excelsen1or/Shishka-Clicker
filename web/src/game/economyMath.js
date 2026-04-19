import {
  BUILDINGS,
  EVENT_DEFINITIONS,
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

export function getBuildingCost(baseCost, owned) {
  return Math.floor(baseCost * Math.pow(1.15, owned) + 1e-9)
}

export function getQuotaTarget(baseQuota, quotaGrowth, quotaIndex) {
  return Math.floor(baseQuota * Math.pow(quotaGrowth, quotaIndex))
}

export function deriveProduction(state) {
  const buildingOutput = BUILDINGS.reduce((total, building) => {
    return total + (state?.buildings?.[building.id] ?? 0) * building.baseOutput
  }, 0)
  const warehouseRhythmLevel = state?.upgrades?.warehouseRhythm ?? 0
  const heavenlyTarLevel = state?.prestigeUpgrades?.heavenlyTar ?? 0
  const clickBugLevel = state?.upgrades?.cashbackBug ?? 0
  const globalMultiplier =
    1 +
    warehouseRhythmLevel * (RUN_UPGRADE_BY_ID.warehouseRhythm?.value ?? 0) +
    heavenlyTarLevel * (PRESTIGE_UPGRADE_BY_ID.heavenlyTar?.value ?? 0) +
    (state?.activeCampaign?.productionBoost ?? 0)
  const clickPower =
    1 +
    clickBugLevel * (RUN_UPGRADE_BY_ID.cashbackBug?.value ?? 0) +
    (state?.activeCampaign?.clickBoost ?? 0)

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
    const nextTarget = getQuotaTarget(baseQuota, quotaGrowth, nextQuotaIndex + 1)

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
  const totalProgress = (state?.tarLumpProgressMs ?? 0) + elapsedMs
  const earned = Math.floor(totalProgress / TAR_LUMP_RULES.intervalMs)

  return {
    ...state,
    tarLumps: (state?.tarLumps ?? 0) + earned,
    tarLumpProgressMs: totalProgress % TAR_LUMP_RULES.intervalMs,
  }
}

export function applyMarketTrade({ state, goodId, quantity, side }) {
  const unitPrice = state?.market?.prices?.[goodId] ?? 0
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
  const feeRate = Math.max(
    0.02,
    0.08 - (state?.market?.brokerLevel ?? 0) * 0.005,
  )
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
