import { formatNumber } from '../lib/format'

export const PRESTIGE_UPGRADES = [
  {
    id: 'coneTheory',
    title: 'Шишечная теория',
    description: 'Сжимает квоту по шишкам для каждого следующего перерождения.',
    baseCost: 1,
    costScale: 2.35,
    costRamp: 1,
    tint: 'amber',
  },
  {
    id: 'archiveIndex',
    title: 'Архив индексов',
    description: 'Снижает требование по знаниям для следующей квоты ребёрса.',
    baseCost: 1,
    costScale: 2.38,
    costRamp: 1,
    tint: 'cyan',
  },
  {
    id: 'trophyRoute',
    title: 'Маршрут достижений',
    description: 'Срезает требование по количеству открытых достижений.',
    baseCost: 2,
    costScale: 2.55,
    costRamp: 1.1,
    tint: 'fuchsia',
  },
  {
    id: 'rebirthCore',
    title: 'Ядро ребёрсов',
    description:
      'Даёт постоянный множитель ко всей экономике.',
    baseCost: 3,
    costScale: 2.62,
    costRamp: 1.15,
    tint: 'emerald',
  },
  {
    id: 'shardRefinery',
    title: 'Очистка осколков',
    description:
      'Увеличивает количество осколков, которое выдаётся за выполненную квоту.',
    baseCost: 5,
    costScale: 2.85,
    costRamp: 1.2,
    tint: 'violet',
  },
  {
    id: 'overflowDoctrine',
    title: 'Доктрина перелива',
    description: 'Лучше конвертирует перебор квоты в дополнительные осколки.',
    baseCost: 6,
    costScale: 2.95,
    costRamp: 1.25,
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

export function getPrestigeUpgradeCost(item, level) {
  const ramp = Number(item?.costRamp ?? 1)
  const linearPenalty = 1 + level * (0.082 * ramp)
  const quadraticPenalty = 1 + level * level * (0.01 * ramp)
  return Math.max(
    1,
    Math.floor(
      item.baseCost *
        Math.pow(item.costScale, level) *
        linearPenalty *
        quadraticPenalty,
    ),
  )
}

export function getPrestigeBonuses(state = {}) {
  const coneTheory = getUpgradeLevel(state, 'coneTheory')
  const archiveIndex = getUpgradeLevel(state, 'archiveIndex')
  const trophyRoute = getUpgradeLevel(state, 'trophyRoute')
  const rebirthCore = getUpgradeLevel(state, 'rebirthCore')
  const shardRefinery = getUpgradeLevel(state, 'shardRefinery')
  const overflowDoctrine = getUpgradeLevel(state, 'overflowDoctrine')

  const shishkiQuotaReduction = getReductionFromLevel(
    coneTheory,
    0.042,
    0.943,
    0.46,
  )
  const knowledgeQuotaReduction = getReductionFromLevel(
    archiveIndex,
    0.04,
    0.945,
    0.44,
  )
  const achievementQuotaReduction = Math.min(
    14,
    Math.floor(trophyRoute * 0.9 + Math.max(0, trophyRoute - 3) * 0.45),
  )
  const permanentMultiplierBonus = getReductionFromLevel(
    rebirthCore,
    0.06,
    0.956,
    0.68,
  )
  const shardMultiplier = 1 + geometricGain(shardRefinery, 0.08, 0.97)
  const overflowMultiplier = 1 + geometricGain(overflowDoctrine, 0.085, 0.971)

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
  const cycle = Math.max(0, rebirths)

  return {
    shishki: Math.floor(120_000 * Math.pow(1.62, cycle)),
    knowledge: Math.floor(3_400 * Math.pow(1.95, cycle)),
    achievements: Math.floor(18 + cycle * 2 + Math.max(0, cycle - 2)),
  }
}

export function getRebirthQuota(
  state = {},
  _unlockedAchievements = 0,
  rebirthsOverride = null,
) {
  const rebirths =
    typeof rebirthsOverride === 'number'
      ? rebirthsOverride
      : Number(state?.rebirths ?? 0)
  const raw = getRawQuota(rebirths)
  const bonuses = getPrestigeBonuses(state)

  return {
    cycle: rebirths + 1,
    raw,
    shishki: Math.max(
      95_000,
      Math.floor(raw.shishki * (1 - bonuses.shishkiQuotaReduction)),
    ),
    knowledge: Math.max(
      2_400,
      Math.floor(raw.knowledge * (1 - bonuses.knowledgeQuotaReduction)),
    ),
    achievements: Math.max(
      14,
      raw.achievements - bonuses.achievementQuotaReduction,
    ),
  }
}

export function getShardPreview(
  state = {},
  unlockedAchievements = 0,
  quota = null,
) {
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

  const shishkiOverflow = Math.max(0, ratios.shishki - 1)
  const knowledgeOverflow = Math.max(0, ratios.knowledge - 1)
  const achievementsOverflow = Math.max(0, ratios.achievements - 1)

  const overflowScore =
    Math.pow(shishkiOverflow, 0.86) * 0.28 * bonuses.overflowMultiplier +
    Math.pow(knowledgeOverflow, 0.9) * 0.36 * bonuses.overflowMultiplier +
    Math.pow(achievementsOverflow, 0.94) * 0.17

  const quotaScore =
    ratios.shishki * 0.78 +
    ratios.knowledge * 0.98 +
    ratios.achievements * 0.44 +
    overflowScore

  const rawShards =
    Math.pow(Math.max(0, quotaScore - 2.04), 2.25) * bonuses.shardMultiplier
  const projectedShards = canRebirth
    ? Math.max(1, Math.floor(rawShards))
    : Math.floor(rawShards)

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
      return getReductionFromLevel(level, 0.042, 0.943, 0.46)
    case 'archiveIndex':
      return getReductionFromLevel(level, 0.04, 0.945, 0.44)
    case 'trophyRoute':
      return Math.min(
        14,
        Math.floor(level * 0.9 + Math.max(0, level - 3) * 0.45),
      )
    case 'rebirthCore':
      return getReductionFromLevel(level, 0.06, 0.956, 0.68)
    case 'shardRefinery':
      return geometricGain(level, 0.08, 0.97)
    case 'overflowDoctrine':
      return geometricGain(level, 0.085, 0.971)
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
        currentText:
          level > 0 ? formatMetric(item.id, current) : 'Пока не изучено',
        nextText: `След. ур.: ${formatMetric(item.id, next)}${delta > 0 ? ` · +${formatMetric(item.id, delta).replace(/^[-+x]?/, '')}` : ''}`,
      },
    }
  })
}
