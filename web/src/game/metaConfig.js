import { PRESTIGE_UPGRADES, QUOTA_RULES } from './economyConfig.js'
import { getQuotaTarget } from './economyMath.js'

function createUniqueFieldCodeIndex(items, label) {
  const index = {}

  for (const item of items) {
    const fieldCode = item?.fieldCode

    if (typeof fieldCode !== 'string' || !fieldCode) {
      throw new TypeError(`Invalid ${label} fieldCode`)
    }

    if (Object.prototype.hasOwnProperty.call(index, fieldCode)) {
      throw new RangeError(`Duplicate ${label} fieldCode: ${fieldCode}`)
    }

    index[fieldCode] = item
  }

  return index
}

const PRESTIGE_UPGRADE_BY_FIELD_CODE = createUniqueFieldCodeIndex(
  PRESTIGE_UPGRADES,
  'prestige upgrade',
)

export function getPrestigeUpgradeCost(item, level) {
  return Math.floor(item.baseCost * Math.pow(2.4, level))
}

export function getQuotaPreview(state) {
  return {
    current: getQuotaTarget(
      QUOTA_RULES.baseQuota,
      QUOTA_RULES.quotaGrowth,
      state.quotaIndex,
    ),
    next: getQuotaTarget(
      QUOTA_RULES.baseQuota,
      QUOTA_RULES.quotaGrowth,
      state.quotaIndex + 1,
    ),
  }
}

export function getPrestigeUpgradeCards(state) {
  return PRESTIGE_UPGRADES.map((item) => {
    const level = state?.prestigeUpgrades?.[item.id] ?? 0

    return {
      ...item,
      level,
      cost: getPrestigeUpgradeCost(item, level),
    }
  })
}

export function getPrestigeUpgradeByFieldCode(fieldCode) {
  return PRESTIGE_UPGRADE_BY_FIELD_CODE[fieldCode] ?? null
}
