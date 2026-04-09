import { formatNumber } from '../lib/format'

export const PRESTIGE_UPGRADES = [
  {
    id: 'coneTheory',
    title: 'Шишечная теория',
    description: 'Сжимает квоту по шишкам для каждого следующего перерождения.',
    baseCost: 2,
    costScale: 2.22,
    tint: 'amber',
  },
  {
    id: 'archiveIndex',
    title: 'Архив индексов',
    description: 'Снижает требование по знаниям для следующей квоты ребёрса.',
    baseCost: 2,
    costScale: 2.26,
    tint: 'cyan',
  },
  {
    id: 'trophyRoute',
    title: 'Маршрут достижений',
    description: 'Срезает требование по количеству открытых достижений.',
    baseCost: 3,
    costScale: 2.4,
    tint: 'fuchsia',
  },
  {
    id: 'rebirthCore',
    title: 'Ядро перерождения',
    description: 'Даёт постоянный множитель ко всей экономике поверх обычного престижа.',
    baseCost: 4,
    costScale: 2.45,
    tint: 'emerald',
  },
  {
    id: 'shardRefinery',
    title: 'Очистка осколков',
    description: 'Увеличивает количество осколков, которое выдаётся за выполненную квоту.',
    baseCost: 5,
    costScale: 2.55,
    tint: 'violet',
  },
  {
    id: 'overflowDoctrine',
    title: 'Доктрина перелива',
    description: 'Лучше конвертирует перебор квоты в дополнительные осколки.',
    baseCost: 6,
    costScale: 2.62,
    tint: 'rose',
  },
]

function geometricGain(level, firstGain, decay) {
  if (level <= 0) return 0
  if (decay === 1) return level * firstGain
  return firstGain * ((1 - Math.pow(decay, level)) / (1 - decay))
}

function getUpgradeLevel(state, id) {
  return Number(state?.prestigeUpgrades?.[id] ?? 0)
}

function getReductionFromLevel(level, firstGain, decay, cap) {
  return Math.min(cap, geometricGain(level, firstGain, decay))
}

function getFlatAchievementReduction(level) {
  if (level <= 0) return 0
  return Math.min(18, Math.floor(level + Math.max(0, level - 2) * 0.45))
}

export function getPrestigeUpgradeCost(item, level) {
  const penalty = 1 + level * 0.12
  return Math.max(1, Math.floor(item.baseCost * Math.pow(item.costScale, level) * penalty))
}

export function getPrestigeBonuses(state = {}) {
  const coneTheory = getUpgradeLevel(state, 'coneTheory')
  const archiveIndex = getUpgradeLevel(state, 'archiveIndex')
  const trophyRoute = getUpgradeLevel(state, 'trophyRoute')
  const rebirthCore = getUpgradeLevel(state, 'rebirthCore')
  const shardRefinery = getUpgradeLevel(state, 'shardRefinery')
  const overflowDoctrine = getUpgradeLevel(state, 'overflowDoctrine')

  const shishkiQuotaReduction = getReductionFromLevel(coneTheory, 0.055, 0.93, 0.58)
  const knowledgeQuotaReduction = getReductionFromLevel(archiveIndex, 0.052, 0.935, 0.56)
  const achievementQuotaReduction = getFlatAchievementReduction(trophyRoute)
  const permanentMultiplierBonus = getReductionFromLevel(rebirthCore, 0.075, 0.95, 0.92)
  const shardMultiplier = 1 + geometricGain(shardRefinery, 0.16, 0.955)
  const overflowMultiplier = 1 + geometricGain(overflowDoctrine, 0.18, 0.96)

  return {
    shishkiQuotaReduction,
    knowledgeQuotaReduction,
    achievementQuotaReduction,
    permanentMultiplierBonus,
    shardMultiplier,
    overflowMultiplier,
  }
}

function getRawQuota(rebirths = 0) {
  return {
    shishki: Math.floor(95_000 * Math.pow(1.82, rebirths) + rebirths * rebirths * 36_000),
    knowledge: Math.floor(2_600 * Math.pow(1.74, rebirths) + rebirths * rebirths * 760),
    achievements: Math.floor(45 + rebirths * 3 + Math.max(0, rebirths - 2) * 2),
  }
}

export function getRebirthQuota(state = {}, unlockedAchievements = 0, rebirthsOverride = null) {
  const rebirths = typeof rebirthsOverride === 'number' ? rebirthsOverride : Number(state?.rebirths ?? 0)
  const raw = getRawQuota(rebirths)
  const bonuses = getPrestigeBonuses(state)

  return {
    cycle: rebirths + 1,
    raw,
    shishki: Math.max(60_000, Math.floor(raw.shishki * (1 - bonuses.shishkiQuotaReduction))),
    knowledge: Math.max(1_800, Math.floor(raw.knowledge * (1 - bonuses.knowledgeQuotaReduction))),
    achievements: Math.max(32, raw.achievements - bonuses.achievementQuotaReduction),
  }
}

export function getShardPreview(state = {}, unlockedAchievements = 0, quota = null) {
  const targetQuota = quota ?? getRebirthQuota(state, unlockedAchievements)
  const bonuses = getPrestigeBonuses(state)
  const progress = {
    shishki: Number(state?.totalShishkiEarned ?? 0),
    knowledge: Number(state?.totalKnowledgeEarned ?? 0),
    achievements: Number(unlockedAchievements ?? 0),
  }

  const ratios = {
    shishki: progress.shishki / Math.max(1, targetQuota.shishki),
    knowledge: progress.knowledge / Math.max(1, targetQuota.knowledge),
    achievements: progress.achievements / Math.max(1, targetQuota.achievements),
  }

  const canRebirth =
    progress.shishki >= targetQuota.shishki &&
    progress.knowledge >= targetQuota.knowledge &&
    progress.achievements >= targetQuota.achievements

  const overflowScore =
    Math.max(0, ratios.shishki - 1) * 0.35 * bonuses.overflowMultiplier +
    Math.max(0, ratios.knowledge - 1) * 0.45 * bonuses.overflowMultiplier +
    Math.max(0, ratios.achievements - 1) * 0.22

  const quotaScore =
    ratios.shishki * 0.9 +
    ratios.knowledge * 1.15 +
    ratios.achievements * 0.55 +
    overflowScore

  const rawShards = Math.pow(Math.max(0, quotaScore - 1.95), 2.06) * bonuses.shardMultiplier
  const projectedShards = canRebirth ? Math.max(1, Math.floor(rawShards)) : Math.floor(rawShards)

  return {
    progress,
    ratios,
    quotaScore,
    overflowScore,
    canRebirth,
    projectedShards,
  }
}

function getMetricValue(id, level) {
  switch (id) {
    case 'coneTheory':
      return getReductionFromLevel(level, 0.055, 0.93, 0.58)
    case 'archiveIndex':
      return getReductionFromLevel(level, 0.052, 0.935, 0.56)
    case 'trophyRoute':
      return getFlatAchievementReduction(level)
    case 'rebirthCore':
      return getReductionFromLevel(level, 0.075, 0.95, 0.92)
    case 'shardRefinery':
      return geometricGain(level, 0.16, 0.955)
    case 'overflowDoctrine':
      return geometricGain(level, 0.18, 0.96)
    default:
      return 0
  }
}

function formatMetric(id, value) {
  switch (id) {
    case 'coneTheory':
      return `-${formatNumber(value * 100)}% к квоте шишек`
    case 'archiveIndex':
      return `-${formatNumber(value * 100)}% к квоте знаний`
    case 'trophyRoute':
      return `-${formatNumber(value)} к квоте достижений`
    case 'rebirthCore':
      return `+x${formatNumber(value)} к престижу`
    case 'shardRefinery':
      return `+${formatNumber(value * 100)}% к осколкам`
    case 'overflowDoctrine':
      return `+${formatNumber(value * 100)}% к переливу`
    default:
      return 'Эффект усиливает престиж'
  }
}

export function getPrestigeUpgradeCards(state = {}) {
  return PRESTIGE_UPGRADES.map((item) => {
    const level = getUpgradeLevel(state, item.id)
    const current = getMetricValue(item.id, level)
    const next = getMetricValue(item.id, level + 1)
    const delta = next - current

    return {
      ...item,
      level,
      cost: getPrestigeUpgradeCost(item, level),
      effectPreview: {
        currentText: level > 0 ? formatMetric(item.id, current) : 'Пока не изучено',
        nextText: `След. ур.: ${formatMetric(item.id, next)}${delta > 0 ? ` · +${formatMetric(item.id, delta).replace(/^[-+x]?/, '')}` : ''}`,
      },
    }
  })
}
