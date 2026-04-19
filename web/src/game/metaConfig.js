import { PRESTIGE_UPGRADES, QUOTA_RULES } from './economyConfig.js'
import { getQuotaTarget } from './economyMath.js'

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
