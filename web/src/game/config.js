export const BALANCE = {
  start: {
    shishki: 0,
    money: 25,
    knowledge: 0,
    manualClicks: 0,
    totalShishkiEarned: 0,
    totalMoneyEarned: 25,
    totalKnowledgeEarned: 0,
    subscriptions: {
      gigachat: 0,
      gpt: 0,
      claude: 0,
    },
    upgrades: {
      textbooks: 0,
      coffee: 0,
      internship: 0,
      promptEngineering: 0,
      researchLab: 0,
    },
  },
  price: {
    levelPenaltyStep: 0.06,
  },
  growth: {
    aiMultiplier: {
      base: 1,
      source: 'promptEngineering',
      firstGain: 0.08,
      decay: 0.88,
    },
    aiPowerSoftcapSource: 'subscriptions',
  },
  softcaps: {
    clickPower: { threshold: 18, power: 0.7 },
    shishkiPerSecond: { threshold: 90, power: 0.68 },
    moneyPerSecond: { threshold: 45, power: 0.72 },
    knowledgePerSecond: { threshold: 25, power: 0.7 },
    aiPower: { threshold: 30, power: 0.75 },
  },
  subscriptions: {
    gigachat: {
      id: 'gigachat',
      title: 'Гига чат',
      description: 'Дешевый AI-стажер. Хорошо стартует, но быстро уходит в мягкое насыщение.',
      baseCost: 40,
      costScale: 1.62,
      tier: 1,
      effectLabel: 'Ранний буст к шишкам и знаниям',
      unlock: { shishki: 0, knowledge: 0 },
      aiPowerWeight: 1,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 1.8, decay: 0.96, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.16, decay: 0.97, aiScaled: true },
      ],
    },
    gpt: {
      id: 'gpt',
      title: 'Чат ГПТ помоги',
      description: 'Середина игры: стабильный приток шишек и знаний без взрывного роста.',
      baseCost: 135,
      costScale: 1.76,
      tier: 2,
      effectLabel: 'Универсальный AI-майнер',
      unlock: { shishki: 120, knowledge: 8 },
      aiPowerWeight: 2.4,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 4.8, decay: 0.95, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.5, decay: 0.96, aiScaled: true },
      ],
    },
    claude: {
      id: 'claude',
      title: 'Клоуд АИ',
      description: 'Дорогой и мощный инструмент, но с более строгой экономикой масштабирования.',
      baseCost: 320,
      costScale: 1.92,
      tier: 3,
      effectLabel: 'Поздний буст для сложной экономики',
      unlock: { shishki: 650, knowledge: 55 },
      aiPowerWeight: 4.5,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 11, decay: 0.94, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 1.2, decay: 0.95, aiScaled: true },
      ],
    },
  },
  upgrades: {
    textbooks: {
      id: 'textbooks',
      title: 'Учебники и методички',
      description: 'Укрепляют ручной прогресс и понемногу повышают темп получения знаний.',
      currency: 'money',
      baseCost: 22,
      costScale: 1.48,
      tier: 1,
      effectLabel: 'Клик + немного знаний/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [
        { stat: 'clickPower', firstGain: 0.85, decay: 0.98, baseBonus: 1 },
        { stat: 'knowledgePerSecond', firstGain: 0.12, decay: 0.98 },
      ],
    },
    coffee: {
      id: 'coffee',
      title: 'Кофе и дедлайны',
      description: 'Добавляют шишки в секунду, но без диких ускорений.',
      currency: 'money',
      baseCost: 52,
      costScale: 1.61,
      tier: 1,
      effectLabel: 'Пассивные шишки/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.9, decay: 0.97 },
      ],
    },
    internship: {
      id: 'internship',
      title: 'Работа на складе OZON',
      description: 'Превращает академический прогресс в стабильный денежный поток.',
      currency: 'shishki',
      baseCost: 95,
      costScale: 1.68,
      tier: 2,
      effectLabel: 'Деньги/сек',
      unlock: { shishki: 60, knowledge: 0 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.4, decay: 0.97, baseBonus: 1 },
      ],
    },
    promptEngineering: {
      id: 'promptEngineering',
      title: 'Промпт-инжиниринг',
      description: 'Усиливает AI-экономику процентом, но с затухающей отдачей от каждого уровня.',
      currency: 'knowledge',
      baseCost: 35,
      costScale: 1.82,
      tier: 2,
      effectLabel: 'Мягкий множитель AI',
      unlock: { shishki: 0, knowledge: 20 },
      effects: [
        { stat: 'clickPower', firstGain: 0.18, decay: 0.94 },
      ],
    },
    researchLab: {
      id: 'researchLab',
      title: 'Лаба и научрук',
      description: 'Укрепляет исследовательский контур: знания и деньги растут более устойчиво.',
      currency: 'knowledge',
      baseCost: 55,
      costScale: 1.9,
      tier: 3,
      effectLabel: 'Знания/сек + деньги/сек',
      unlock: { shishki: 300, knowledge: 45 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.25, decay: 0.96 },
        { stat: 'moneyPerSecond', firstGain: 0.9, decay: 0.95 },
        { stat: 'knowledgePerSecond', firstGain: 0.6, decay: 0.96 },
      ],
    },
  },
}

export const STARTING_STATE = BALANCE.start

export const SUBSCRIPTIONS = Object.values(BALANCE.subscriptions)
export const UPGRADES = Object.values(BALANCE.upgrades)

const STAT_META = {
  clickPower: { label: 'клик', prefix: '+', suffix: '' },
  shishkiPerSecond: { label: 'шишки/сек', prefix: '+', suffix: '' },
  moneyPerSecond: { label: 'деньги/сек', prefix: '+', suffix: '' },
  knowledgePerSecond: { label: 'знания/сек', prefix: '+', suffix: '' },
  aiMultiplier: { label: 'AI множитель', prefix: 'x', suffix: '' },
}

function getUnlockRule(id) {
  return BALANCE.subscriptions[id]?.unlock ?? BALANCE.upgrades[id]?.unlock ?? { shishki: 0, knowledge: 0 }
}

export function getUnlockStatus(state, id) {
  const rule = getUnlockRule(id)
  const progress = {
    shishki: state.totalShishkiEarned ?? 0,
    knowledge: state.totalKnowledgeEarned ?? 0,
  }

  const unlocked = progress.shishki >= rule.shishki && progress.knowledge >= rule.knowledge

  return {
    unlocked,
    rule,
    progress,
  }
}

export function formatUnlockText(rule) {
  const parts = []
  if (rule.shishki > 0) parts.push(`шишки: ${rule.shishki}`)
  if (rule.knowledge > 0) parts.push(`знания: ${rule.knowledge}`)
  return parts.length ? `Открывается при ${parts.join(' · ')}` : 'Открыто с начала игры'
}

export function getScaledCost(baseCost, costScale, level) {
  const levelPenalty = 1 + level * BALANCE.price.levelPenaltyStep
  return Math.floor(baseCost * Math.pow(costScale, level) * levelPenalty)
}

function geometricGain(level, firstGain, decay) {
  if (level <= 0) return 0
  if (decay === 1) return level * firstGain
  return firstGain * ((1 - Math.pow(decay, level)) / (1 - decay))
}

function softcap(value, threshold, power = 0.72) {
  if (value <= threshold) return value
  return threshold * Math.pow(value / threshold, power)
}

function applySoftcap(name, value) {
  const cap = BALANCE.softcaps[name]
  return softcap(value, cap.threshold, cap.power)
}

function accumulateEffects(items, levels, aiMultiplier = 1) {
  return items.reduce(
    (totals, item) => {
      const level = levels[item.id] ?? 0
      if (level <= 0) return totals

      item.effects.forEach((effect) => {
        const gain = geometricGain(level, effect.firstGain, effect.decay)
        const scaledGain = effect.aiScaled ? gain * aiMultiplier : gain
        totals[effect.stat] = (totals[effect.stat] ?? 0) + scaledGain + (effect.baseBonus ?? 0)
      })

      return totals
    },
    {
      clickPower: 0,
      shishkiPerSecond: 0,
      moneyPerSecond: 0,
      knowledgePerSecond: 0,
    },
  )
}


function getEffectTotalAtLevel(effect, level, aiMultiplier = 1) {
  if (level <= 0) return 0
  const gain = geometricGain(level, effect.firstGain, effect.decay)
  const scaledGain = effect.aiScaled ? gain * aiMultiplier : gain
  return scaledGain + (effect.baseBonus ?? 0)
}

function getEffectIncrement(effect, level, aiMultiplier = 1) {
  return getEffectTotalAtLevel(effect, level + 1, aiMultiplier) - getEffectTotalAtLevel(effect, level, aiMultiplier)
}

function formatEffectStat(stat, value) {
  const meta = STAT_META[stat] ?? { label: stat, prefix: '+', suffix: '' }
  return `${meta.prefix}${Number(value.toFixed(2))} ${meta.label}${meta.suffix}`.trim()
}

function describeItemEffects(item, level, aiMultiplier) {
  const current = []
  const next = []

  item.effects.forEach((effect) => {
    const total = getEffectTotalAtLevel(effect, level, aiMultiplier)
    const delta = getEffectIncrement(effect, level, aiMultiplier)

    if (total > 0) current.push(formatEffectStat(effect.stat, total))
    if (delta > 0) next.push(formatEffectStat(effect.stat, delta))
  })

  const aiSource = BALANCE.growth.aiMultiplier
  if (item.id === aiSource.source) {
    const currentAi = aiSource.base + geometricGain(level, aiSource.firstGain, aiSource.decay)
    const nextAi = aiSource.base + geometricGain(level + 1, aiSource.firstGain, aiSource.decay)
    const aiDelta = nextAi - currentAi

    if (level > 0 || currentAi > aiSource.base) current.push(formatEffectStat('aiMultiplier', currentAi))
    if (aiDelta > 0) next.push(formatEffectStat('aiMultiplier', aiDelta))
  }

  return {
    currentText: current.length ? current.join(' · ') : item.effectLabel,
    nextText: next.length ? `След. ур.: ${next.join(' · ')}` : 'Максимум полезного эффекта достигнут',
  }
}

export function getItemEffectPreview(item, level, aiMultiplier) {
  return describeItemEffects(item, level, aiMultiplier)
}

function deriveAiMultiplier(state) {
  const source = BALANCE.growth.aiMultiplier
  const level = state.upgrades[source.source] ?? 0
  return source.base + geometricGain(level, source.firstGain, source.decay)
}

function deriveAiPower(state) {
  const raw = SUBSCRIPTIONS.reduce((sum, item) => {
    const level = state.subscriptions[item.id] ?? 0
    return sum + level * (item.aiPowerWeight ?? 0)
  }, 0)

  return applySoftcap('aiPower', raw)
}

export function deriveEconomy(state) {
  const aiMultiplier = deriveAiMultiplier(state)

  const upgradeTotals = accumulateEffects(UPGRADES, state.upgrades ?? {}, aiMultiplier)
  const subscriptionTotals = accumulateEffects(SUBSCRIPTIONS, state.subscriptions ?? {}, aiMultiplier)

  const clickPowerRaw = upgradeTotals.clickPower || 1
  const shishkiPerSecondRaw = upgradeTotals.shishkiPerSecond + subscriptionTotals.shishkiPerSecond
  const moneyPerSecondRaw = upgradeTotals.moneyPerSecond || 1
  const knowledgePerSecondRaw = upgradeTotals.knowledgePerSecond + subscriptionTotals.knowledgePerSecond

  const clickPower = applySoftcap('clickPower', clickPowerRaw)
  const shishkiPerSecond = applySoftcap('shishkiPerSecond', shishkiPerSecondRaw)
  const moneyPerSecond = applySoftcap('moneyPerSecond', moneyPerSecondRaw)
  const knowledgePerSecond = applySoftcap('knowledgePerSecond', knowledgePerSecondRaw)
  const aiPower = deriveAiPower(state)

  return {
    clickPower: Number(clickPower.toFixed(1)),
    shishkiPerSecond: Number(shishkiPerSecond.toFixed(1)),
    moneyPerSecond: Number(moneyPerSecond.toFixed(1)),
    knowledgePerSecond: Number(knowledgePerSecond.toFixed(1)),
    aiPower: Number(aiPower.toFixed(1)),
    aiMultiplier: Number(aiMultiplier.toFixed(2)),
  }
}
