export const BALANCE = {
  start: {
    shishki: 0,
    money: 25,
    knowledge: 0,
    manualClicks: 0,
    totalShishkiEarned: 0,
    totalMoneyEarned: 25,
    totalKnowledgeEarned: 0,
    lifetimeShishkiEarned: 0,
    lifetimeMoneyEarned: 25,
    lifetimeKnowledgeEarned: 0,
    prestigeShards: 0,
    totalPrestigeShardsEarned: 0,
    rebirths: 0,
    megaClicks: 0,
    emojiBursts: 0,
    achievements: {},
    subscriptions: {
      gigachat: 0,
      yandex_alisa: 0,
      gpt: 0,
      claude: 0,
      perplexity: 0,
      copilot: 0,
      deepseek: 0,
    },
    upgrades: {
      textbooks: 0,
      coffee: 0,
      internship: 0,
      promptEngineering: 0,
      researchLab: 0,
      autoClicker: 0,
      serverRack: 0,
      focusMode: 0,
      memeMarketing: 0,
      ventureFund: 0,
    },
  },
  price: {
    levelPenaltyStep: 0.05,
  },
  growth: {
    aiMultiplier: {
      base: 1,
      source: 'promptEngineering',
      firstGain: 0.08,
      decay: 0.9,
    },
    prestigeMultiplier: {
      rebirthGain: 0.15,
      shardGain: 0.025,
    },
    megaClick: {
      chanceBase: 0.08,
      chancePerFocus: 0.015,
      powerMultiplier: 5,
      emojiChance: 0.28,
      emojiChancePerMeme: 0.08,
      pool: ['🔥', '✨', '💥', '🎉', '🧠', '🚀', '😎', '🪩', '⚡', '🍀'],
    },
  },
  prestige: {
    unlock: {
      shishki: 8000,
      knowledge: 260,
      achievements: 18,
    },
    rebirth: {
      shishki: 20000,
      knowledge: 450,
    },
    shards: {
      shishkiDivisor: 950,
      knowledgeDivisor: 125,
      achievementDivisor: 6,
      rebirthPenalty: 2,
    },
  },
  softcaps: {
    clickPower: { threshold: 24, power: 0.72 },
    shishkiPerSecond: { threshold: 130, power: 0.72 },
    moneyPerSecond: { threshold: 68, power: 0.75 },
    knowledgePerSecond: { threshold: 42, power: 0.74 },
    aiPower: { threshold: 54, power: 0.8 },
  },
  subscriptions: {
    gigachat: {
      id: 'gigachat',
      title: 'Гига чат',
      description: 'Дешёвый AI-стажёр. Лучший старт, но быстро упирается в насыщение.',
      baseCost: 32,
      costScale: 1.55,
      tier: 1,
      effectLabel: 'Ранний буст к шишкам и знаниям',
      unlock: { shishki: 0, knowledge: 0 },
      aiPowerWeight: 1,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 1.6, decay: 0.965, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.16, decay: 0.975, aiScaled: true },
      ],
    },
    yandex_alisa: {
      id: 'yandex_alisa',
      title: 'Яндекс Алиса',
      description: 'Универсальный помощник с хорошим темпом на раннем и среднем этапе.',
      baseCost: 110,
      costScale: 1.68,
      tier: 2,
      effectLabel: 'Универсальный AI-майнер',
      unlock: { shishki: 100, knowledge: 8 },
      aiPowerWeight: 2.1,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 4.2, decay: 0.955, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.48, decay: 0.965, aiScaled: true },
      ],
    },
    gpt: {
      id: 'gpt',
      title: 'Чат ГПТ помоги',
      description: 'Стабильная середина игры: уверенный приток шишек и знаний.',
      baseCost: 280,
      costScale: 1.74,
      tier: 3,
      effectLabel: 'Стабильный средний тир',
      unlock: { shishki: 220, knowledge: 22 },
      aiPowerWeight: 3,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 7.5, decay: 0.95, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.72, decay: 0.958, aiScaled: true },
      ],
    },
    claude: {
      id: 'claude',
      title: 'Клоуд АИ',
      description: 'Дорогой и мощный инструмент для поздней стадии экономики.',
      baseCost: 470,
      costScale: 1.82,
      tier: 4,
      effectLabel: 'Поздний буст экономики',
      unlock: { shishki: 600, knowledge: 52 },
      aiPowerWeight: 4.5,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 10.8, decay: 0.945, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 1.15, decay: 0.952, aiScaled: true },
      ],
    },
    perplexity: {
      id: 'perplexity',
      title: 'Perplexity Pro',
      description: 'Добывает знания заметно лучше остальных и помогает выйти в престиж.',
      baseCost: 900,
      costScale: 1.86,
      tier: 5,
      effectLabel: 'Знания и деньги для поздней игры',
      unlock: { shishki: 1200, knowledge: 115 },
      aiPowerWeight: 5.8,
      effects: [
        { stat: 'knowledgePerSecond', firstGain: 2.8, decay: 0.95, aiScaled: true },
        { stat: 'moneyPerSecond', firstGain: 2.4, decay: 0.955, aiScaled: true },
      ],
    },
    copilot: {
      id: 'copilot',
      title: 'GitHub Copilot+',
      description: 'Делает сборку конвейера быстрее и заметно ускоряет пассивные шишки.',
      baseCost: 1450,
      costScale: 1.9,
      tier: 6,
      effectLabel: 'Производственный буст',
      unlock: { shishki: 2200, knowledge: 180 },
      aiPowerWeight: 7.5,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 18, decay: 0.946, aiScaled: true },
        { stat: 'moneyPerSecond', firstGain: 3, decay: 0.952, aiScaled: true },
      ],
    },
    deepseek: {
      id: 'deepseek',
      title: 'DeepSeek Ultra',
      description: 'Поздний экспериментальный монстр. Дорогой, но даёт лучший скейл.',
      baseCost: 2600,
      costScale: 1.95,
      tier: 7,
      effectLabel: 'Лейт-гейм AI-ускоритель',
      unlock: { shishki: 4200, knowledge: 320 },
      aiPowerWeight: 10,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 28, decay: 0.945, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 3.4, decay: 0.95, aiScaled: true },
        { stat: 'moneyPerSecond', firstGain: 4.2, decay: 0.95, aiScaled: true },
      ],
    },
  },
  upgrades: {
    textbooks: {
      id: 'textbooks',
      title: 'Учебники и методички',
      description: 'Укрепляют ручной прогресс и понемногу повышают темп получения знаний.',
      currency: 'money',
      baseCost: 18,
      costScale: 1.42,
      tier: 1,
      effectLabel: 'Клик + немного знаний/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [
        { stat: 'clickPower', firstGain: 0.9, decay: 0.985, baseBonus: 1 },
        { stat: 'knowledgePerSecond', firstGain: 0.12, decay: 0.985 },
      ],
    },
    coffee: {
      id: 'coffee',
      title: 'Кофе и дедлайны',
      description: 'Добавляют шишки в секунду, но без диких ускорений.',
      currency: 'money',
      baseCost: 46,
      costScale: 1.52,
      tier: 1,
      effectLabel: 'Пассивные шишки/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [{ stat: 'shishkiPerSecond', firstGain: 1, decay: 0.978 }],
    },
    internship: {
      id: 'internship',
      title: 'Работа на складе OZON',
      description: 'Превращает академический прогресс в стабильный денежный поток.',
      currency: 'shishki',
      baseCost: 90,
      costScale: 1.58,
      tier: 2,
      effectLabel: 'Деньги/сек',
      unlock: { shishki: 60, knowledge: 0 },
      effects: [{ stat: 'moneyPerSecond', firstGain: 1.5, decay: 0.975, baseBonus: 1 }],
    },
    promptEngineering: {
      id: 'promptEngineering',
      title: 'Промпт-инжиниринг',
      description: 'Усиливает AI-экономику процентом и немного улучшает силу клика.',
      currency: 'knowledge',
      baseCost: 30,
      costScale: 1.72,
      tier: 2,
      effectLabel: 'Мягкий множитель AI',
      unlock: { shishki: 0, knowledge: 18 },
      effects: [{ stat: 'clickPower', firstGain: 0.18, decay: 0.95 }],
    },
    researchLab: {
      id: 'researchLab',
      title: 'Лаба и научрук',
      description: 'Укрепляет исследовательский контур: знания и деньги растут устойчивее.',
      currency: 'knowledge',
      baseCost: 55,
      costScale: 1.82,
      tier: 3,
      effectLabel: 'Знания/сек + деньги/сек',
      unlock: { shishki: 280, knowledge: 40 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.4, decay: 0.97 },
        { stat: 'moneyPerSecond', firstGain: 0.9, decay: 0.96 },
        { stat: 'knowledgePerSecond', firstGain: 0.65, decay: 0.97 },
      ],
    },
    autoClicker: {
      id: 'autoClicker',
      title: 'Автокликер на парах',
      description: 'Слегка поднимает клик и заметно улучшает пассивную добычу шишек.',
      currency: 'money',
      baseCost: 160,
      costScale: 1.66,
      tier: 3,
      effectLabel: 'Клик + шишки/сек',
      unlock: { shishki: 190, knowledge: 18 },
      effects: [
        { stat: 'clickPower', firstGain: 0.9, decay: 0.97 },
        { stat: 'shishkiPerSecond', firstGain: 2.6, decay: 0.97 },
      ],
    },
    focusMode: {
      id: 'focusMode',
      title: 'Режим фокуса',
      description: 'Увеличивает шанс мега-клика и немного ускоряет добычу знаний.',
      currency: 'knowledge',
      baseCost: 120,
      costScale: 1.74,
      tier: 4,
      effectLabel: 'Мега-клик и знания',
      unlock: { shishki: 540, knowledge: 75 },
      effects: [{ stat: 'knowledgePerSecond', firstGain: 1.2, decay: 0.965 }],
    },
    memeMarketing: {
      id: 'memeMarketing',
      title: 'Мемный маркетинг',
      description: 'Учит игру любить эмодзи и приносит доход на хайпе.',
      currency: 'money',
      baseCost: 480,
      costScale: 1.8,
      tier: 4,
      effectLabel: 'Деньги/сек + эмодзи-шанс',
      unlock: { shishki: 760, knowledge: 90 },
      effects: [{ stat: 'moneyPerSecond', firstGain: 2.8, decay: 0.965 }],
    },
    serverRack: {
      id: 'serverRack',
      title: 'Серверная стойка',
      description: 'Поднимает все пассивные процессы, но стоит уже по-взрослому.',
      currency: 'money',
      baseCost: 780,
      costScale: 1.84,
      tier: 5,
      effectLabel: 'Шишки/сек + знания/сек',
      unlock: { shishki: 1200, knowledge: 120 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 5, decay: 0.962 },
        { stat: 'knowledgePerSecond', firstGain: 1.8, decay: 0.965 },
      ],
    },
    ventureFund: {
      id: 'ventureFund',
      title: 'Венчурный фонд кафедры',
      description: 'Поздняя инвестиция для рывка в престиж и ребёрс.',
      currency: 'knowledge',
      baseCost: 260,
      costScale: 1.86,
      tier: 6,
      effectLabel: 'Деньги/сек + шишки/сек',
      unlock: { shishki: 2000, knowledge: 180 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 4.4, decay: 0.96 },
        { stat: 'shishkiPerSecond', firstGain: 6.5, decay: 0.962 },
      ],
    },
  },
}

export const STARTING_STATE = BALANCE.start
export const SUBSCRIPTIONS = Object.values(BALANCE.subscriptions)
export const UPGRADES = Object.values(BALANCE.upgrades)

const achievementNumber = new Intl.NumberFormat('ru-RU')

function totalLevels(collection) {
  return Object.values(collection ?? {}).reduce((sum, value) => sum + Number(value ?? 0), 0)
}

function buildMilestoneAchievements({
  idPrefix,
  titlePrefix,
  descriptionPrefix,
  suffix,
  milestones,
  valueGetter,
  icon = '🏁',
}) {
  return milestones.map((target, index) => ({
    id: `${idPrefix}_${index + 1}`,
    title: `${icon} ${titlePrefix} ${index + 1}`,
    description: `${descriptionPrefix} ${achievementNumber.format(target)} ${suffix}`.trim(),
    check: (state) => valueGetter(state) >= target,
  }))
}

const specialAchievements = [
  {
    id: 'first_click',
    title: 'Первый удар',
    description: 'Сделай первый клик по шишке.',
    check: (state) => state.manualClicks >= 1,
  },
  {
    id: 'silence_lover',
    title: 'Любитель тишины',
    description: 'Зачем вы делаете музыку такой громкой?',
    check: (state) => state.achievements?.silence_lover_progress,
  },
  {
    id: 'collector',
    title: 'Коллекционер шишек',
    description: 'Накопи 1 000 шишек за всё время.',
    check: (state) => state.lifetimeShishkiEarned >= 1000,
  },
  {
    id: 'mega_clicker',
    title: 'Мега-кликер',
    description: 'Сделай 10 мега-кликов.',
    check: (state) => state.megaClicks >= 10,
  },
  {
    id: 'emoji_lord',
    title: 'Повелитель эмодзи',
    description: 'Поймай 15 эмодзи-взрывов.',
    check: (state) => state.emojiBursts >= 15,
  },
  {
    id: 'researcher',
    title: 'Грызун науки',
    description: 'Заработай 250 знаний за всё время.',
    check: (state) => state.lifetimeKnowledgeEarned >= 250,
  },
  {
    id: 'reborn',
    title: 'Перерождение',
    description: 'Выполни первый ребёрс.',
    check: (state) => state.rebirths >= 1,
  },
  {
    id: 'prestige_banker',
    title: 'Осколочный магнат',
    description: 'Накопи 25 осколков престижа.',
    check: (state) => state.totalPrestigeShardsEarned >= 25,
  },
]

const levelAchievements = [
  ...buildMilestoneAchievements({
    idPrefix: 'manual_clicks',
    titlePrefix: 'Кликер',
    descriptionPrefix: 'Сделай',
    suffix: 'кликов вручную.',
    milestones: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000],
    valueGetter: (state) => state.manualClicks ?? 0,
    icon: '🖱️',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'banked_shishki',
    titlePrefix: 'Склад шишек',
    descriptionPrefix: 'Держи одновременно',
    suffix: 'шишек на балансе.',
    milestones: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000],
    valueGetter: (state) => state.shishki ?? 0,
    icon: '🌰',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_shishki',
    titlePrefix: 'Шишечный магнат',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'шишек.',
    milestones: [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000],
    valueGetter: (state) => state.lifetimeShishkiEarned ?? 0,
    icon: '💼',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_money',
    titlePrefix: 'Денежный поток',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'денег.',
    milestones: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
    valueGetter: (state) => state.lifetimeMoneyEarned ?? 0,
    icon: '💵',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_knowledge',
    titlePrefix: 'Архив знаний',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'знаний.',
    milestones: [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000],
    valueGetter: (state) => state.lifetimeKnowledgeEarned ?? 0,
    icon: '📚',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'subscription_levels',
    titlePrefix: 'Подписочный стек',
    descriptionPrefix: 'Купи суммарно',
    suffix: 'уровней подписок.',
    milestones: [1, 3, 5, 10, 15, 25, 40, 60, 90, 120],
    valueGetter: (state) => totalLevels(state.subscriptions),
    icon: '🧠',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'upgrade_levels',
    titlePrefix: 'Инженер прогресса',
    descriptionPrefix: 'Купи суммарно',
    suffix: 'уровней улучшений.',
    milestones: [1, 3, 5, 10, 15, 25, 40, 60, 90, 120],
    valueGetter: (state) => totalLevels(state.upgrades),
    icon: '⚙️',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'mega_clicks',
    titlePrefix: 'Серия мега-кликов',
    descriptionPrefix: 'Сделай',
    suffix: 'мега-кликов.',
    milestones: [1, 5, 10, 25, 50, 100, 250, 500],
    valueGetter: (state) => state.megaClicks ?? 0,
    icon: '⚡',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'emoji_bursts',
    titlePrefix: 'Фестиваль эмодзи',
    descriptionPrefix: 'Поймай',
    suffix: 'эмодзи-взрывов.',
    milestones: [1, 5, 15, 30, 60, 120, 240],
    valueGetter: (state) => state.emojiBursts ?? 0,
    icon: '🎉',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'rebirths',
    titlePrefix: 'Колесо сансары',
    descriptionPrefix: 'Сделай',
    suffix: 'перерождений.',
    milestones: [1, 2, 3, 5, 8, 12, 20],
    valueGetter: (state) => state.rebirths ?? 0,
    icon: '♻️',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'prestige_shards',
    titlePrefix: 'Осколочный фонд',
    descriptionPrefix: 'Заработай суммарно',
    suffix: 'осколков престижа.',
    milestones: [5, 10, 25, 50, 100, 200, 400],
    valueGetter: (state) => state.totalPrestigeShardsEarned ?? 0,
    icon: '💎',
  }),
]

const subscriptionUnlockAchievements = SUBSCRIPTIONS.map((item) => ({
  id: `subscription_unlock_${item.id}`,
  title: `🧠 Первый слот: ${item.title}`,
  description: `Купи первый уровень подписки «${item.title}».`,
  check: (state) => (state.subscriptions?.[item.id] ?? 0) >= 1,
}))

const upgradeUnlockAchievements = UPGRADES.map((item) => ({
  id: `upgrade_unlock_${item.id}`,
  title: `⚙️ Первый апгрейд: ${item.title}`,
  description: `Купи первый уровень улучшения «${item.title}».`,
  check: (state) => (state.upgrades?.[item.id] ?? 0) >= 1,
}))

export const ACHIEVEMENTS = [
  ...specialAchievements,
  ...levelAchievements,
  ...subscriptionUnlockAchievements,
  ...upgradeUnlockAchievements,
]

const STAT_META = {
  clickPower: { label: 'клик', prefix: '+', suffix: '' },
  shishkiPerSecond: { label: 'шишки/сек', prefix: '+', suffix: '' },
  moneyPerSecond: { label: 'деньги/сек', prefix: '+', suffix: '' },
  knowledgePerSecond: { label: 'знания/сек', prefix: '+', suffix: '' },
  aiMultiplier: { label: 'AI множитель', prefix: 'x', suffix: '' },
  aiPower: { label: 'AI мощности', prefix: '+', suffix: '' },
  prestigeMultiplier: { label: 'престиж', prefix: 'x', suffix: '' },
  megaChance: { label: 'шанс мега-клика', prefix: '+', suffix: '%' },
}

const CONTRIBUTION_META = {
  clickPower: { unit: '/ клик' },
  shishkiPerSecond: { unit: '/ сек' },
  moneyPerSecond: { unit: '/ сек' },
  knowledgePerSecond: { unit: '/ сек' },
  aiPower: { unit: '' },
}

function getUnlockRule(id) {
  return BALANCE.subscriptions[id]?.unlock ?? BALANCE.upgrades[id]?.unlock ?? { shishki: 0, knowledge: 0 }
}

export function getUnlockStatus(state, id) {
  const rule = getUnlockRule(id)
  const progress = {
    shishki: state.lifetimeShishkiEarned ?? state.totalShishkiEarned ?? 0,
    knowledge: state.lifetimeKnowledgeEarned ?? state.totalKnowledgeEarned ?? 0,
  }

  return {
    unlocked: progress.shishki >= rule.shishki && progress.knowledge >= rule.knowledge,
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

function buildBaseTotals() {
  return {
    clickPower: 0,
    shishkiPerSecond: 0,
    moneyPerSecond: 0,
    knowledgePerSecond: 0,
  }
}

function getEffectTotalAtLevel(effect, level, aiMultiplier = 1) {
  if (level <= 0) return 0
  const gain = geometricGain(level, effect.firstGain, effect.decay)
  const scaledGain = effect.aiScaled ? gain * aiMultiplier : gain
  return scaledGain + (effect.baseBonus ?? 0)
}

function accumulateEffects(items, levels, aiMultiplier = 1) {
  return items.reduce((totals, item) => {
    const level = levels[item.id] ?? 0
    if (level <= 0) return totals

    item.effects.forEach((effect) => {
      totals[effect.stat] = (totals[effect.stat] ?? 0) + getEffectTotalAtLevel(effect, level, aiMultiplier)
    })

    return totals
  }, buildBaseTotals())
}

function getEffectIncrement(effect, level, aiMultiplier = 1) {
  return getEffectTotalAtLevel(effect, level + 1, aiMultiplier) - getEffectTotalAtLevel(effect, level, aiMultiplier)
}

function formatEffectStat(stat, value) {
  const meta = STAT_META[stat] ?? { label: stat, prefix: '+', suffix: '' }
  return `${meta.prefix}${Number(value.toFixed(2))} ${meta.label}${meta.suffix}`.trim()
}

function describeItemEffects(item, level, aiMultiplier, prestigeMultiplier) {
  const current = []
  const next = []

  item.effects.forEach((effect) => {
    const total = getEffectTotalAtLevel(effect, level, aiMultiplier) * (effect.stat === 'clickPower' || effect.stat.endsWith('PerSecond') ? prestigeMultiplier : 1)
    const delta = getEffectIncrement(effect, level, aiMultiplier) * (effect.stat === 'clickPower' || effect.stat.endsWith('PerSecond') ? prestigeMultiplier : 1)

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

  if (item.id === 'focusMode') {
    const currentChance = getMegaClickChance({ upgrades: { focusMode: level, memeMarketing: 0 } })
    const nextChance = getMegaClickChance({ upgrades: { focusMode: level + 1, memeMarketing: 0 } })
    current.push(formatEffectStat('megaChance', currentChance * 100))
    next.push(formatEffectStat('megaChance', (nextChance - currentChance) * 100))
  }

  return {
    currentText: current.length ? current.join(' · ') : item.effectLabel,
    nextText: next.length ? `След. ур.: ${next.join(' · ')}` : 'Максимум полезного эффекта достигнут',
  }
}

export function getItemEffectPreview(item, level, aiMultiplier, prestigeMultiplier = 1) {
  return describeItemEffects(item, level, aiMultiplier, prestigeMultiplier)
}

function deriveAiMultiplier(state) {
  const source = BALANCE.growth.aiMultiplier
  const level = state.upgrades?.[source.source] ?? 0
  return source.base + geometricGain(level, source.firstGain, source.decay)
}

export function derivePrestigeMultiplier(state) {
  const cfg = BALANCE.growth.prestigeMultiplier
  return 1 + (state.rebirths ?? 0) * cfg.rebirthGain + (state.prestigeShards ?? 0) * cfg.shardGain
}

function deriveAiPower(state) {
  const raw = SUBSCRIPTIONS.reduce((sum, item) => {
    const level = state.subscriptions?.[item.id] ?? 0
    return sum + level * (item.aiPowerWeight ?? 0)
  }, 0)

  return applySoftcap('aiPower', raw)
}

export function getMegaClickChance(state) {
  const cfg = BALANCE.growth.megaClick
  const focusLevel = state.upgrades?.focusMode ?? 0
  return Math.min(0.45, cfg.chanceBase + focusLevel * cfg.chancePerFocus)
}

export function getMegaEmojiChance(state) {
  const cfg = BALANCE.growth.megaClick
  const memeLevel = state.upgrades?.memeMarketing ?? 0
  return Math.min(0.9, cfg.emojiChance + memeLevel * cfg.emojiChancePerMeme)
}

export function getRandomMegaEmoji() {
  const pool = BALANCE.growth.megaClick.pool
  return pool[Math.floor(Math.random() * pool.length)]
}

function getRawStatTotals(state, aiMultiplier, prestigeMultiplier) {
  const upgradeTotals = accumulateEffects(UPGRADES, state.upgrades ?? {}, aiMultiplier)
  const subscriptionTotals = accumulateEffects(SUBSCRIPTIONS, state.subscriptions ?? {}, aiMultiplier)

  return {
    clickPower: (upgradeTotals.clickPower || 1) * prestigeMultiplier,
    shishkiPerSecond: (upgradeTotals.shishkiPerSecond + subscriptionTotals.shishkiPerSecond) * prestigeMultiplier,
    moneyPerSecond: (upgradeTotals.moneyPerSecond || 1) * prestigeMultiplier,
    knowledgePerSecond: (upgradeTotals.knowledgePerSecond + subscriptionTotals.knowledgePerSecond) * prestigeMultiplier,
  }
}

function getItemStatTotals(item, level, aiMultiplier, prestigeMultiplier) {
  const totals = buildBaseTotals()
  if (level <= 0) return totals

  item.effects.forEach((effect) => {
    const value = getEffectTotalAtLevel(effect, level, aiMultiplier)
    totals[effect.stat] = (totals[effect.stat] ?? 0) + value * (effect.stat === 'clickPower' || effect.stat.endsWith('PerSecond') ? prestigeMultiplier : 1)
  })

  return totals
}

function getBaseContributionEntries(rawTotals, finalTotals) {
  return [
    {
      stat: 'clickPower',
      entry: {
        id: 'base-click',
        title: 'Базовый клик',
        sourceType: 'base',
        value: rawTotals.clickPower > 0 ? finalTotals.clickPower / rawTotals.clickPower : 0,
      },
    },
    {
      stat: 'moneyPerSecond',
      entry: {
        id: 'base-money',
        title: 'Базовый доход',
        sourceType: 'base',
        value: rawTotals.moneyPerSecond > 0 ? finalTotals.moneyPerSecond / rawTotals.moneyPerSecond : 0,
      },
    },
  ]
}

export function deriveContributionBreakdown(state) {
  const aiMultiplier = deriveAiMultiplier(state)
  const prestigeMultiplier = derivePrestigeMultiplier(state)
  const rawTotals = getRawStatTotals(state, aiMultiplier, prestigeMultiplier)
  const rawAiPower = SUBSCRIPTIONS.reduce((sum, item) => {
    const level = state.subscriptions?.[item.id] ?? 0
    return sum + level * (item.aiPowerWeight ?? 0)
  }, 0)

  const finalTotals = {
    clickPower: applySoftcap('clickPower', rawTotals.clickPower),
    shishkiPerSecond: applySoftcap('shishkiPerSecond', rawTotals.shishkiPerSecond),
    moneyPerSecond: applySoftcap('moneyPerSecond', rawTotals.moneyPerSecond),
    knowledgePerSecond: applySoftcap('knowledgePerSecond', rawTotals.knowledgePerSecond),
    aiPower: applySoftcap('aiPower', rawAiPower),
  }

  const groups = {
    clickPower: [],
    shishkiPerSecond: [],
    moneyPerSecond: [],
    knowledgePerSecond: [],
    aiPower: [],
  }

  const items = [
    ...UPGRADES.map((item) => ({ ...item, sourceType: 'upgrade', level: state.upgrades?.[item.id] ?? 0 })),
    ...SUBSCRIPTIONS.map((item) => ({ ...item, sourceType: 'subscription', level: state.subscriptions?.[item.id] ?? 0 })),
  ]

  items.forEach((item) => {
    if (item.level <= 0) return
    const totals = getItemStatTotals(item, item.level, aiMultiplier, prestigeMultiplier)

    Object.keys(groups).forEach((stat) => {
      const rawValue = totals[stat] ?? 0
      if (rawValue <= 0) return
      const rawTotal = rawTotals[stat] ?? 0
      const finalTotal = finalTotals[stat] ?? 0
      const scaledValue = rawTotal > 0 ? (rawValue / rawTotal) * finalTotal : 0

      groups[stat].push({
        id: item.id,
        title: item.title,
        sourceType: item.sourceType,
        value: Number(scaledValue.toFixed(2)),
      })
    })

    if ((item.aiPowerWeight ?? 0) > 0) {
      const rawValue = item.level * item.aiPowerWeight
      const scaledValue = rawAiPower > 0 ? (rawValue / rawAiPower) * finalTotals.aiPower : 0
      groups.aiPower.push({
        id: item.id,
        title: item.title,
        sourceType: item.sourceType,
        value: Number(scaledValue.toFixed(2)),
      })
    }
  })

  getBaseContributionEntries(rawTotals, finalTotals).forEach(({ stat, entry }) => {
    groups[stat].push({ ...entry, value: Number(entry.value.toFixed(2)) })
  })

  return Object.fromEntries(
    Object.entries(groups).map(([stat, entries]) => {
      const top = entries.sort((a, b) => b.value - a.value).slice(0, 3)
      const leader = top[0] ?? null
      return [
        stat,
        {
          leader,
          items: top,
          total: Number((finalTotals[stat] ?? 0).toFixed(2)),
          unit: CONTRIBUTION_META[stat]?.unit ?? '',
        },
      ]
    }),
  )
}

function getUnlockedAchievementCount(state) {
  return ACHIEVEMENTS.reduce((count, achievement) => {
    const unlocked = Boolean(state.achievements?.[achievement.id]) || Boolean(achievement.check(state))
    return count + (unlocked ? 1 : 0)
  }, 0)
}

export function getPrestigeUnlockStatus(state) {
  const rule = BALANCE.prestige.unlock
  const progress = {
    shishki: state.lifetimeShishkiEarned ?? 0,
    knowledge: state.lifetimeKnowledgeEarned ?? 0,
    achievements: getUnlockedAchievementCount(state),
  }

  return {
    unlocked:
      progress.shishki >= rule.shishki &&
      progress.knowledge >= rule.knowledge &&
      progress.achievements >= rule.achievements,
    rule,
    progress,
  }
}

export function getPrestigePreview(state) {
  const unlock = getPrestigeUnlockStatus(state)
  const earnedShishki = state.lifetimeShishkiEarned ?? 0
  const earnedKnowledge = state.lifetimeKnowledgeEarned ?? 0
  const unlockedAchievements = unlock.progress.achievements
  const shardCfg = BALANCE.prestige.shards
  const rebirthRule = BALANCE.prestige.rebirth
  const shards = Math.max(
    0,
    Math.floor(
      Math.sqrt(earnedShishki / shardCfg.shishkiDivisor) +
      earnedKnowledge / shardCfg.knowledgeDivisor +
      unlockedAchievements / shardCfg.achievementDivisor,
    ) - (state.rebirths ?? 0) * shardCfg.rebirthPenalty,
  )

  return {
    isUnlocked: unlock.unlocked,
    unlockRule: unlock.rule,
    unlockProgress: unlock.progress,
    rebirthRule,
    canRebirth:
      unlock.unlocked &&
      earnedShishki >= rebirthRule.shishki &&
      earnedKnowledge >= rebirthRule.knowledge,
    shards,
    unlockedAchievements,
    nextGoal: {
      shishki: Math.max(0, rebirthRule.shishki - earnedShishki),
      knowledge: Math.max(0, rebirthRule.knowledge - earnedKnowledge),
    },
  }
}

export function deriveAchievements(state) {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: Boolean(state.achievements?.[achievement.id]) || Boolean(achievement.check(state)),
  }))
}

export function deriveEconomy(state) {
  const aiMultiplier = deriveAiMultiplier(state)
  const prestigeMultiplier = derivePrestigeMultiplier(state)
  const rawTotals = getRawStatTotals(state, aiMultiplier, prestigeMultiplier)

  return {
    clickPower: Number(applySoftcap('clickPower', rawTotals.clickPower).toFixed(1)),
    shishkiPerSecond: Number(applySoftcap('shishkiPerSecond', rawTotals.shishkiPerSecond).toFixed(1)),
    moneyPerSecond: Number(applySoftcap('moneyPerSecond', rawTotals.moneyPerSecond).toFixed(1)),
    knowledgePerSecond: Number(applySoftcap('knowledgePerSecond', rawTotals.knowledgePerSecond).toFixed(1)),
    aiPower: Number(deriveAiPower(state).toFixed(1)),
    aiMultiplier: Number(aiMultiplier.toFixed(2)),
    prestigeMultiplier: Number(prestigeMultiplier.toFixed(2)),
    megaClickChance: Number((getMegaClickChance(state) * 100).toFixed(1)),
    emojiMegaChance: Number((getMegaEmojiChance(state) * 100).toFixed(1)),
  }
}
