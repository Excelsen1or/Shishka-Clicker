import { getPrestigeBonuses, getRebirthQuota, getShardPreview } from './metaConfig'

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
    prestigeUpgrades: {
      coneTheory: 0,
      archiveIndex: 0,
      trophyRoute: 0,
      rebirthCore: 0,
      shardRefinery: 0,
      overflowDoctrine: 0,
    },
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
      coneSorting: 0,
      resinWorkshop: 0,
      campusExchange: 0,
      ventureFund: 0,
    },
  },
  price: {
    levelPenaltyStep: 0.09,
  },
  growth: {
    aiMultiplier: {
      base: 1,
      source: 'promptEngineering',
      firstGain: 0.045,
      decay: 0.88,
    },
    prestigeMultiplier: {
      rebirthGain: 0.1,
      shardGain: 0.015,
    },
    megaClick: {
      chanceBase: 0.045,
      chancePerFocus: 0.009,
      powerMultiplier: 4,
      emojiChance: 0.18,
      emojiChancePerMeme: 0.05,
      pool: ['🤡', '🌸', '🤖', '👾', '💥', '🛸', '🎉', '🦄', '🪩', '⚡', '🔥', '🌟'],
    },
  },
  prestige: {
    unlock: {
      shishki: 30000,
      knowledge: 900,
      achievements: 45,
    },
    rebirth: {
      explanation: 'После открытия престижа каждая новая жизнь требует закрыть отдельную квоту текущего цикла.',
    },
  },
  softcaps: {
    clickPower: { threshold: 18, power: 0.66 },
    shishkiPerSecond: { threshold: 78, power: 0.64 },
    moneyPerSecond: { threshold: 44, power: 0.67 },
    knowledgePerSecond: { threshold: 28, power: 0.66 },
    aiPower: { threshold: 40, power: 0.72 },
  },
  subscriptions: {
    gigachat: {
      id: 'gigachat',
      title: 'Гига чат',
      description: 'Дешёвый AI-стажёр. Лучший старт, но быстро упирается в насыщение.',
      baseCost: 60,
      costScale: 1.9,
      tier: 1,
      effectLabel: 'Ранний буст к шишкам и знаниям',
      unlock: { shishki: 0, knowledge: 0 },
      aiPowerWeight: 1,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 1.05, decay: 0.955, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.09, decay: 0.97, aiScaled: true },
      ],
    },
    yandex_alisa: {
      id: 'yandex_alisa',
      title: 'Яндекс Алиса',
      description: 'Универсальный помощник с хорошим темпом на раннем и среднем этапе.',
      baseCost: 210,
      costScale: 1.83,
      tier: 2,
      effectLabel: 'Универсальный AI-майнер',
      unlock: { shishki: 260, knowledge: 18 },
      aiPowerWeight: 2.1,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 2.7, decay: 0.948, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.26, decay: 0.958, aiScaled: true },
      ],
    },
    gpt: {
      id: 'gpt',
      title: 'Чат ГПТ помоги',
      description: 'Стабильная середина игры: уверенный приток шишек и знаний.',
      baseCost: 560,
      costScale: 1.88,
      tier: 3,
      effectLabel: 'Стабильный средний тир',
      unlock: { shishki: 720, knowledge: 60 },
      aiPowerWeight: 3,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 4.4, decay: 0.942, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.4, decay: 0.95, aiScaled: true },
      ],
    },
    claude: {
      id: 'claude',
      title: 'Клоуд АИ',
      description: 'Дорогой и мощный инструмент для поздней стадии экономики.',
      baseCost: 980,
      costScale: 1.93,
      tier: 4,
      effectLabel: 'Поздний буст экономики',
      unlock: { shishki: 1800, knowledge: 180 },
      aiPowerWeight: 4.5,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 6.2, decay: 0.938, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 0.62, decay: 0.946, aiScaled: true },
      ],
    },
    perplexity: {
      id: 'perplexity',
      title: 'Perplexity Pro',
      description: 'Добывает знания заметно лучше остальных и помогает выйти в престиж.',
      baseCost: 2200,
      costScale: 1.97,
      tier: 5,
      effectLabel: 'Знания и деньги для поздней игры',
      unlock: { shishki: 4200, knowledge: 450 },
      aiPowerWeight: 5.8,
      effects: [
        { stat: 'knowledgePerSecond', firstGain: 1.55, decay: 0.944, aiScaled: true },
        { stat: 'moneyPerSecond', firstGain: 1.25, decay: 0.948, aiScaled: true },
      ],
    },
    copilot: {
      id: 'copilot',
      title: 'GitHub Copilot+',
      description: 'Делает сборку конвейера быстрее и заметно ускоряет пассивные шишки.',
      baseCost: 4200,
      costScale: 2.02,
      tier: 6,
      effectLabel: 'Производственный буст',
      unlock: { shishki: 9000, knowledge: 900 },
      aiPowerWeight: 7.5,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 9.2, decay: 0.94, aiScaled: true },
        { stat: 'moneyPerSecond', firstGain: 1.55, decay: 0.946, aiScaled: true },
      ],
    },
    deepseek: {
      id: 'deepseek',
      title: 'DeepSeek Ultra',
      description: 'Поздний экспериментальный монстр. Дорогой, но даёт лучший скейл.',
      baseCost: 9000,
      costScale: 2.08,
      tier: 7,
      effectLabel: 'Лейт-гейм AI-ускоритель',
      unlock: { shishki: 18000, knowledge: 1800 },
      aiPowerWeight: 10,
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 13.5, decay: 0.938, aiScaled: true },
        { stat: 'knowledgePerSecond', firstGain: 1.65, decay: 0.944, aiScaled: true },
        { stat: 'moneyPerSecond', firstGain: 2.0, decay: 0.944, aiScaled: true },
      ],
    },
  },
  upgrades: {
    textbooks: {
      id: 'textbooks',
      title: 'Учебники и методички',
      description: 'Укрепляют ручной прогресс и понемногу повышают темп получения знаний.',
      currency: 'money',
      baseCost: 40,
      costScale: 1.92,
      tier: 1,
      effectLabel: 'Клик + немного знаний/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [
        { stat: 'clickPower', firstGain: 0.52, decay: 0.975, baseBonus: 1 },
        { stat: 'knowledgePerSecond', firstGain: 0.06, decay: 0.976 },
      ],
    },
    coffee: {
      id: 'coffee',
      title: 'Кофе и дедлайны',
      description: 'Добавляют шишки в секунду, но без диких ускорений.',
      currency: 'money',
      baseCost: 95,
      costScale: 1.67,
      tier: 1,
      effectLabel: 'Пассивные шишки/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [{ stat: 'shishkiPerSecond', firstGain: 0.55, decay: 0.968 }],
    },
    internship: {
      id: 'internship',
      title: 'Работа на складе OZON',
      description: 'Превращает академический прогресс в стабильный денежный поток.',
      currency: 'shishki',
      baseCost: 190,
      costScale: 1.58,
      tier: 2,
      effectLabel: 'Деньги/сек',
      unlock: { shishki: 120, knowledge: 0 },
      effects: [{ stat: 'moneyPerSecond', firstGain: 0.8, decay: 0.966, baseBonus: 1 }],
    },
    promptEngineering: {
      id: 'promptEngineering',
      title: 'Промпт-инжиниринг',
      description: 'Усиливает AI-экономику процентом и немного улучшает силу клика.',
      currency: 'knowledge',
      baseCost: 75,
      costScale: 1.72,
      tier: 2,
      effectLabel: 'Мягкий множитель AI',
      unlock: { shishki: 0, knowledge: 45 },
      effects: [{ stat: 'clickPower', firstGain: 0.1, decay: 0.935 }],
    },
    researchLab: {
      id: 'researchLab',
      title: 'Лаба и научрук',
      description: 'Укрепляет исследовательский контур: знания и деньги растут устойчивее.',
      currency: 'knowledge',
      baseCost: 150,
      costScale: 1.96,
      tier: 3,
      effectLabel: 'Знания/сек + деньги/сек',
      unlock: { shishki: 700, knowledge: 120 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.22, decay: 0.96 },
        { stat: 'moneyPerSecond', firstGain: 0.48, decay: 0.95 },
        { stat: 'knowledgePerSecond', firstGain: 0.34, decay: 0.96 },
      ],
    },
    autoClicker: {
      id: 'autoClicker',
      title: 'Автокликер на парах',
      description: 'Слегка поднимает клик и заметно улучшает пассивную добычу шишек.',
      currency: 'money',
      baseCost: 380,
      costScale: 1.82,
      tier: 3,
      effectLabel: 'Клик + шишки/сек',
      unlock: { shishki: 480, knowledge: 55 },
      effects: [
        { stat: 'clickPower', firstGain: 0.46, decay: 0.958 },
        { stat: 'shishkiPerSecond', firstGain: 1.3, decay: 0.958 },
      ],
    },
    focusMode: {
      id: 'focusMode',
      title: 'Режим фокуса',
      description: 'Увеличивает шанс мега-клика и немного ускоряет добычу знаний.',
      currency: 'knowledge',
      baseCost: 320,
      costScale: 1.74,
      tier: 4,
      effectLabel: 'Мега-клик и знания',
      unlock: { shishki: 1500, knowledge: 260 },
      effects: [{ stat: 'knowledgePerSecond', firstGain: 0.58, decay: 0.955 }],
    },
    memeMarketing: {
      id: 'memeMarketing',
      title: 'Мемный маркетинг',
      description: 'Учит игру любить эмодзи и приносит доход на хайпе.',
      currency: 'money',
      baseCost: 1250,
      costScale: 1.96,
      tier: 4,
      effectLabel: 'Деньги/сек + эмодзи-шанс',
      unlock: { shishki: 2400, knowledge: 340 },
      effects: [{ stat: 'moneyPerSecond', firstGain: 1.35, decay: 0.955 }],
    },
    serverRack: {
      id: 'serverRack',
      title: 'Серверная стойка',
      description: 'Поднимает все пассивные процессы, но стоит уже по-взрослому.',
      currency: 'money',
      baseCost: 2400,
      costScale: 2.0,
      tier: 5,
      effectLabel: 'Шишки/сек + знания/сек',
      unlock: { shishki: 4200, knowledge: 520 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 2.3, decay: 0.952 },
        { stat: 'knowledgePerSecond', firstGain: 0.82, decay: 0.955 },
      ],
    },
    coneSorting: {
      id: 'coneSorting',
      title: 'Сортировка шишек',
      description: 'Шишки начинают работать как сырьё: даёт деньги и немного усиливает ручной клик.',
      currency: 'shishki',
      baseCost: 360,
      costScale: 1.61,
      tier: 2,
      effectLabel: 'Деньги/сек + клик',
      unlock: { shishki: 240, knowledge: 20 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 0.7, decay: 0.968 },
        { stat: 'clickPower', firstGain: 0.18, decay: 0.972 },
      ],
    },
    resinWorkshop: {
      id: 'resinWorkshop',
      title: 'Смоляная мастерская',
      description: 'Перерабатывает шишки в устойчивый поток пассивных шишек и денег.',
      currency: 'shishki',
      baseCost: 880,
      costScale: 1.7,
      tier: 3,
      effectLabel: 'Шишки/сек + деньги/сек',
      unlock: { shishki: 950, knowledge: 110 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 1.1, decay: 0.962 },
        { stat: 'moneyPerSecond', firstGain: 0.92, decay: 0.964 },
      ],
    },
    campusExchange: {
      id: 'campusExchange',
      title: 'Кампусная биржа',
      description: 'Позволяет тратить шишки на знания и ускорять путь к поздней игре.',
      currency: 'shishki',
      baseCost: 2400,
      costScale: 1.78,
      tier: 5,
      effectLabel: 'Знания/сек + шишки/сек',
      unlock: { shishki: 3200, knowledge: 380 },
      effects: [
        { stat: 'knowledgePerSecond', firstGain: 0.78, decay: 0.956 },
        { stat: 'shishkiPerSecond', firstGain: 1.7, decay: 0.958 },
      ],
    },
    ventureFund: {
      id: 'ventureFund',
      title: 'Венчурный фонд кафедры',
      description: 'Поздняя инвестиция для рывка в престиж и ребёрс.',
      currency: 'knowledge',
      baseCost: 880,
      costScale: 2.02,
      tier: 6,
      effectLabel: 'Деньги/сек + шишки/сек',
      unlock: { shishki: 7500, knowledge: 900 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.95, decay: 0.95 },
        { stat: 'shishkiPerSecond', firstGain: 2.8, decay: 0.952 },
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

function ownsAllItemsAtLeast(state, target) {
  const hasSubscriptions = SUBSCRIPTIONS.every((item) => (state.subscriptions?.[item.id] ?? 0) >= target)
  const hasUpgrades = UPGRADES.every((item) => (state.upgrades?.[item.id] ?? 0) >= target)
  return hasSubscriptions && hasUpgrades
}

function buildMilestoneAchievements({
  idPrefix,
  titlePrefix,
  descriptionPrefix,
  suffix,
  milestones,
  valueGetter,
  icon = '🏁',
  category = 'Прогресс',
  tierOffset = 0,
  secret = false,
}) {
  return milestones.map((target, index) => ({
    id: `${idPrefix}_${index + 1}`,
    title: `${icon} ${titlePrefix} ${index + 1}`,
    description: `${descriptionPrefix} ${achievementNumber.format(target)} ${suffix}`.trim(),
    check: (state) => valueGetter(state) >= target,
    category,
    tier: index + 1 + tierOffset,
    secret,
  }))
}

const specialAchievements = [
  {
    id: 'first_click',
    title: 'Первый удар',
    description: 'Сделай первый клик по шишке.',
    check: (state) => state.manualClicks >= 1,
    category: 'Кликер',
    tier: 1,
  },
  {
    id: 'silence_lover',
    title: 'Любитель тишины',
    description: 'Зачем вы делаете музыку такой громкой?',
    check: (state) => state.achievements?.silence_lover_progress,
    category: 'Секреты',
    tier: 1,
    secret: true,
  },
  {
    id: 'collector',
    title: 'Коллекционер шишек',
    description: 'Накопи 1 000 шишек за всё время.',
    check: (state) => state.lifetimeShishkiEarned >= 1000,
    category: 'Экономика',
    tier: 1,
  },
  {
    id: 'mega_clicker',
    title: 'Мега-кликер',
    description: 'Сделай 10 мега-кликов.',
    check: (state) => state.megaClicks >= 10,
    category: 'Кликер',
    tier: 2,
  },
  {
    id: 'emoji_lord',
    title: 'Повелитель эмодзи',
    description: 'Поймай 15 эмодзи-взрывов.',
    check: (state) => state.emojiBursts >= 15,
    category: 'Кликер',
    tier: 3,
  },
  {
    id: 'researcher',
    title: 'Грызун науки',
    description: 'Заработай 250 знаний за всё время.',
    check: (state) => state.lifetimeKnowledgeEarned >= 250,
    category: 'Исследования',
    tier: 1,
  },
  {
    id: 'reborn',
    title: 'Перерождение',
    description: 'Выполни первый ребёрс.',
    check: (state) => state.rebirths >= 1,
    category: 'Престиж',
    tier: 1,
  },
  {
    id: 'prestige_banker',
    title: 'Осколочный магнат',
    description: 'Накопи 25 осколков престижа.',
    check: (state) => state.totalPrestigeShardsEarned >= 25,
    category: 'Престиж',
    tier: 2,
  },
]

const levelAchievements = [
  ...buildMilestoneAchievements({
    idPrefix: 'manual_clicks',
    titlePrefix: 'Кликер',
    descriptionPrefix: 'Сделай',
    suffix: 'кликов вручную.',
    milestones: [10, 100, 500, 2500, 10000, 50000, 250000, 1000000],
    valueGetter: (state) => state.manualClicks ?? 0,
    icon: '🖱️',
    category: 'Кликер',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'banked_shishki',
    titlePrefix: 'Склад шишек',
    descriptionPrefix: 'Держи одновременно',
    suffix: 'шишек на балансе.',
    milestones: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000],
    valueGetter: (state) => state.shishki ?? 0,
    icon: '🌰',
    category: 'Экономика',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_shishki',
    titlePrefix: 'Шишечный магнат',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'шишек.',
    milestones: [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000, 25000000, 100000000],
    valueGetter: (state) => state.lifetimeShishkiEarned ?? 0,
    icon: '💼',
    category: 'Экономика',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_money',
    titlePrefix: 'Денежный поток',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'денег.',
    milestones: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 1000000, 5000000],
    valueGetter: (state) => state.lifetimeMoneyEarned ?? 0,
    icon: '💵',
    category: 'Экономика',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_knowledge',
    titlePrefix: 'Архив знаний',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'знаний.',
    milestones: [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 1000000],
    valueGetter: (state) => state.lifetimeKnowledgeEarned ?? 0,
    icon: '📚',
    category: 'Исследования',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'subscription_levels',
    titlePrefix: 'Подписочный стек',
    descriptionPrefix: 'Купи суммарно',
    suffix: 'уровней подписок.',
    milestones: [1, 3, 5, 10, 15, 25, 40, 60, 90, 120, 160, 220, 300],
    valueGetter: (state) => totalLevels(state.subscriptions),
    icon: '🧠',
    category: 'Подписки',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'upgrade_levels',
    titlePrefix: 'Инженер прогресса',
    descriptionPrefix: 'Купи суммарно',
    suffix: 'уровней улучшений.',
    milestones: [1, 3, 5, 10, 15, 25, 40, 60, 90, 120, 160, 220, 300],
    valueGetter: (state) => totalLevels(state.upgrades),
    icon: '⚙️',
    category: 'Апгрейды',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'mega_clicks',
    titlePrefix: 'Серия мега-кликов',
    descriptionPrefix: 'Сделай',
    suffix: 'мега-кликов.',
    milestones: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    valueGetter: (state) => state.megaClicks ?? 0,
    icon: '⚡',
    category: 'Кликер',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'emoji_bursts',
    titlePrefix: 'Фестиваль эмодзи',
    descriptionPrefix: 'Поймай',
    suffix: 'эмодзи-взрывов.',
    milestones: [1, 5, 15, 30, 60, 120, 240, 500, 1000, 2500],
    valueGetter: (state) => state.emojiBursts ?? 0,
    icon: '🎉',
    category: 'Кликер',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'rebirths',
    titlePrefix: 'Колесо сансары',
    descriptionPrefix: 'Сделай',
    suffix: 'перерождений.',
    milestones: [1, 2, 3, 5, 8, 12, 20, 35, 50],
    valueGetter: (state) => state.rebirths ?? 0,
    icon: '♻️',
    category: 'Престиж',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'prestige_shards',
    titlePrefix: 'Осколочный фонд',
    descriptionPrefix: 'Заработай суммарно',
    suffix: 'осколков престижа.',
    milestones: [5, 10, 25, 50, 100, 200, 400, 800, 1600, 3200],
    valueGetter: (state) => state.totalPrestigeShardsEarned ?? 0,
    icon: '💎',
    category: 'Престиж',
  }),
]


const secretAchievements = [
  {
    id: 'all_systems_online_3',
    title: '🕵️ Все системы онлайн I',
    description: 'Подними все подписки и апгрейды минимум до 3 уровня.',
    check: (state) => ownsAllItemsAtLeast(state, 3),
    category: 'Секреты',
    tier: 2,
    secret: true,
  },
  {
    id: 'all_systems_online_7',
    title: '🕵️ Все системы онлайн II',
    description: 'Подними все подписки и апгрейды минимум до 7 уровня.',
    check: (state) => ownsAllItemsAtLeast(state, 7),
    category: 'Секреты',
    tier: 3,
    secret: true,
  },
  {
    id: 'all_systems_online_12',
    title: '👁️ Все системы онлайн III',
    description: 'Подними все подписки и апгрейды минимум до 12 уровня.',
    check: (state) => ownsAllItemsAtLeast(state, 12),
    category: 'Секреты',
    tier: 4,
    secret: true,
  },
  {
    id: 'balanced_build_25',
    title: '🧩 Симметричная сборка',
    description: 'Сделай так, чтобы все подписки имели минимум 25 уровней.',
    check: (state) => SUBSCRIPTIONS.every((item) => (state.subscriptions?.[item.id] ?? 0) >= 25),
    category: 'Секреты',
    tier: 5,
    secret: true,
  },
  {
    id: 'balanced_upgrades_25',
    title: '🧱 Монолит апгрейдов',
    description: 'Сделай так, чтобы все апгрейды имели минимум 25 уровней.',
    check: (state) => UPGRADES.every((item) => (state.upgrades?.[item.id] ?? 0) >= 25),
    category: 'Секреты',
    tier: 6,
    secret: true,
  },
  {
    id: 'cone_emperor',
    title: '🌲 Император шишек',
    description: 'Заработай 1 000 000 000 шишек за всё время.',
    check: (state) => (state.lifetimeShishkiEarned ?? 0) >= 1_000_000_000,
    category: 'Секреты',
    tier: 7,
    secret: true,
  },
  {
    id: 'archive_singularity',
    title: '📚 Архивная сингулярность',
    description: 'Заработай 10 000 000 знаний за всё время.',
    check: (state) => (state.lifetimeKnowledgeEarned ?? 0) >= 10_000_000,
    category: 'Секреты',
    tier: 8,
    secret: true,
  },
  {
    id: 'capital_black_hole',
    title: '💰 Чёрная дыра капитала',
    description: 'Заработай 100 000 000 денег за всё время.',
    check: (state) => (state.lifetimeMoneyEarned ?? 0) >= 100_000_000,
    category: 'Секреты',
    tier: 9,
    secret: true,
  },
  {
    id: 'shard_reactor',
    title: '💎 Реактор осколков',
    description: 'Заработай суммарно 10 000 осколков престижа.',
    check: (state) => (state.totalPrestigeShardsEarned ?? 0) >= 10_000,
    category: 'Секреты',
    tier: 10,
    secret: true,
  },
  {
    id: 'mega_storm',
    title: '🌩️ Грозовой фронт',
    description: 'Сделай 25 000 мега-кликов.',
    check: (state) => (state.megaClicks ?? 0) >= 25_000,
    category: 'Секреты',
    tier: 11,
    secret: true,
  },
  {
    id: 'emoji_apocalypse',
    title: '🎊 Эмодзи-апокалипсис',
    description: 'Поймай 10 000 эмодзи-взрывов.',
    check: (state) => (state.emojiBursts ?? 0) >= 10_000,
    category: 'Секреты',
    tier: 12,
    secret: true,
  },
  {
    id: 'ascetic',
    title: '🔕 Аскет',
    description: 'Открой тишину и всё равно сделай ребёрс.',
    check: (state) => Boolean(state.achievements?.silence_lover_progress) && (state.rebirths ?? 0) >= 1,
    category: 'Секреты',
    tier: 13,
    secret: true,
  },
  {
    id: 'manual_monster',
    title: '🖐️ Ручной режим',
    description: 'Сделай 1 000 000 ручных кликов.',
    check: (state) => (state.manualClicks ?? 0) >= 1_000_000,
    category: 'Секреты',
    tier: 14,
    secret: true,
  },
  {
    id: 'noob_trap',
    title: '🪤 Ловушка новичка',
    description: 'Сделай 1000 ручных кликов, не купив ни одной подписки.',
    check: (state) => (state.manualClicks ?? 0) >= 1000 && totalLevels(state.subscriptions) === 0,
    category: 'Секреты',
    tier: 15,
    secret: true,
  },
  {
    id: 'pure_research',
    title: '🧪 Чистая наука',
    description: 'Накопи 10 000 знаний на балансе одновременно.',
    check: (state) => (state.knowledge ?? 0) >= 10_000,
    category: 'Секреты',
    tier: 16,
    secret: true,
  },
  {
    id: 'dragon_hoard',
    title: '🐉 Драконий склад',
    description: 'Держи одновременно 5 000 000 шишек на балансе.',
    check: (state) => (state.shishki ?? 0) >= 5_000_000,
    category: 'Секреты',
    tier: 17,
    secret: true,
  },
  {
    id: 'silent_architect',
    title: '🕯️ Тихий архитектор',
    description: 'Сделай 5 ребёрсов с выключенной музыкой.',
    check: (state) => Boolean(state.achievements?.silence_lover_progress) && (state.rebirths ?? 0) >= 5,
    category: 'Секреты',
    tier: 18,
    secret: true,
  },
  {
    id: 'perfect_machine_20',
    title: '🛰️ Идеальная машина',
    description: 'Подними все подписки и апгрейды минимум до 20 уровня.',
    check: (state) => ownsAllItemsAtLeast(state, 20),
    category: 'Секреты',
    tier: 19,
    secret: true,
  },
  {
    id: 'knowledge_ocean',
    title: '🌊 Океан знаний',
    description: 'Держи одновременно 1 000 000 знаний.',
    check: (state) => (state.knowledge ?? 0) >= 1_000_000,
    category: 'Секреты',
    tier: 20,
    secret: true,
  },
  {
    id: 'capital_mount',
    title: '🏔️ Гора капитала',
    description: 'Держи одновременно 50 000 000 денег.',
    check: (state) => (state.money ?? 0) >= 50_000_000,
    category: 'Секреты',
    tier: 21,
    secret: true,
  },
  {
    id: 'cone_galaxy',
    title: '🌌 Шишечная галактика',
    description: 'Заработай 1 000 000 000 000 шишек за всё время.',
    check: (state) => (state.lifetimeShishkiEarned ?? 0) >= 1_000_000_000_000,
    category: 'Секреты',
    tier: 22,
    secret: true,
  },
  {
    id: 'oracle_31',
    title: '🔮 Оракул 31',
    description: 'Подними «Промпт-инжиниринг» минимум до 31 уровня.',
    check: (state) => (state.upgrades?.promptEngineering ?? 0) >= 31,
    category: 'Секреты',
    tier: 23,
    secret: true,
  },
  {
    id: 'meme_dimension',
    title: '🫠 Мемное измерение',
    description: 'Сделай 777 эмодзи-взрывов и 777 мега-кликов.',
    check: (state) => (state.emojiBursts ?? 0) >= 777 && (state.megaClicks ?? 0) >= 777,
    category: 'Секреты',
    tier: 24,
    secret: true,
  },
  {
    id: 'deepseek_cult',
    title: '🛸 Культ DeepSeek',
    description: 'Подними DeepSeek Ultra минимум до 66 уровня.',
    check: (state) => (state.subscriptions?.deepseek ?? 0) >= 66,
    category: 'Секреты',
    tier: 25,
    secret: true,
  },
]

const subscriptionUnlockAchievements = SUBSCRIPTIONS.map((item, index) => ({
  id: `subscription_unlock_${item.id}`,
  title: `🧠 Первый слот: ${item.title}`,
  description: `Купи первый уровень подписки «${item.title}».`,
  check: (state) => (state.subscriptions?.[item.id] ?? 0) >= 1,
  category: 'Подписки',
  tier: index + 1,
}))

const upgradeUnlockAchievements = UPGRADES.map((item, index) => ({
  id: `upgrade_unlock_${item.id}`,
  title: `⚙️ Первый апгрейд: ${item.title}`,
  description: `Купи первый уровень улучшения «${item.title}».`,
  check: (state) => (state.upgrades?.[item.id] ?? 0) >= 1,
  category: 'Апгрейды',
  tier: index + 1,
}))

export const ACHIEVEMENTS = [
  ...specialAchievements,
  ...levelAchievements,
  ...secretAchievements,
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

function deriveAiMultiplier(state = STARTING_STATE) {
  const source = BALANCE.growth.aiMultiplier
  const level = state?.upgrades?.[source.source] ?? 0
  return source.base + geometricGain(level, source.firstGain, source.decay)
}

export function derivePrestigeMultiplier(state = STARTING_STATE) {
  const cfg = BALANCE.growth.prestigeMultiplier
  const bonuses = getPrestigeBonuses(state)
  return 1 + (state?.rebirths ?? 0) * cfg.rebirthGain + (state?.prestigeShards ?? 0) * cfg.shardGain + bonuses.permanentMultiplierBonus
}

function deriveAiPower(state = STARTING_STATE) {
  const raw = SUBSCRIPTIONS.reduce((sum, item) => {
    const level = state?.subscriptions?.[item.id] ?? 0
    return sum + level * (item.aiPowerWeight ?? 0)
  }, 0)

  return applySoftcap('aiPower', raw)
}

export function getMegaClickChance(state = STARTING_STATE) {
  const cfg = BALANCE.growth.megaClick
  const focusLevel = state?.upgrades?.focusMode ?? 0
  return Math.min(0.45, cfg.chanceBase + focusLevel * cfg.chancePerFocus)
}

export function getMegaEmojiChance(state = STARTING_STATE) {
  const cfg = BALANCE.growth.megaClick
  const memeLevel = state?.upgrades?.memeMarketing ?? 0
  return Math.min(0.9, cfg.emojiChance + memeLevel * cfg.emojiChancePerMeme)
}

export function getRandomMegaEmoji() {
  const pool = BALANCE.growth.megaClick.pool
  return pool[Math.floor(Math.random() * pool.length)]
}

function getRawStatTotals(state = STARTING_STATE, aiMultiplier, prestigeMultiplier) {
  const safeState = state ?? STARTING_STATE
  const upgradeTotals = accumulateEffects(UPGRADES, safeState?.upgrades ?? {}, aiMultiplier)
  const subscriptionTotals = accumulateEffects(SUBSCRIPTIONS, safeState?.subscriptions ?? {}, aiMultiplier)

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

export function deriveContributionBreakdown(state = STARTING_STATE) {
  const safeState = state ?? STARTING_STATE
  const aiMultiplier = deriveAiMultiplier(safeState)
  const prestigeMultiplier = derivePrestigeMultiplier(safeState)
  const rawTotals = getRawStatTotals(safeState, aiMultiplier, prestigeMultiplier)
  const rawAiPower = SUBSCRIPTIONS.reduce((sum, item) => {
    const level = safeState?.subscriptions?.[item.id] ?? 0
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
    ...UPGRADES.map((item) => ({ ...item, sourceType: 'upgrade', level: safeState?.upgrades?.[item.id] ?? 0 })),
    ...SUBSCRIPTIONS.map((item) => ({ ...item, sourceType: 'subscription', level: safeState?.subscriptions?.[item.id] ?? 0 })),
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

function getUnlockedAchievementCount(state = STARTING_STATE) {
  const safeState = state ?? STARTING_STATE
  return ACHIEVEMENTS.reduce((count, achievement) => {
    const unlocked = Boolean(safeState?.achievements?.[achievement.id]) || Boolean(achievement.check(safeState))
    return count + (unlocked ? 1 : 0)
  }, 0)
}

export function getPrestigeUnlockStatus(state = STARTING_STATE) {
  const safeState = state ?? STARTING_STATE
  const rule = BALANCE.prestige.unlock
  const progress = {
    shishki: safeState?.lifetimeShishkiEarned ?? 0,
    knowledge: safeState?.lifetimeKnowledgeEarned ?? 0,
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

export function getPrestigePreview(state = STARTING_STATE) {
  const unlock = getPrestigeUnlockStatus(state)
  const unlockedAchievements = unlock.progress.achievements
  const quota = getRebirthQuota(state, unlockedAchievements)
  const shardPreview = getShardPreview(state, unlockedAchievements, quota)
  const nextQuota = getRebirthQuota(state, unlockedAchievements, (state?.rebirths ?? 0) + 1)
  const bonuses = getPrestigeBonuses(state)

  return {
    isUnlocked: unlock.unlocked,
    unlockRule: unlock.rule,
    unlockProgress: unlock.progress,
    rebirthRule: quota,
    nextQuota,
    canRebirth: unlock.unlocked && shardPreview.canRebirth,
    shards: unlock.unlocked ? shardPreview.projectedShards : 0,
    projectedShards: unlock.unlocked ? shardPreview.projectedShards : 0,
    unlockedAchievements,
    bonuses,
    cycleProgress: shardPreview.progress,
    cycleRatios: shardPreview.ratios,
    quotaScore: shardPreview.quotaScore,
    overflowScore: shardPreview.overflowScore,
    nextGoal: {
      shishki: Math.max(0, quota.shishki - shardPreview.progress.shishki),
      knowledge: Math.max(0, quota.knowledge - shardPreview.progress.knowledge),
      achievements: Math.max(0, quota.achievements - shardPreview.progress.achievements),
    },
  }
}

export function deriveAchievements(state = STARTING_STATE) {
  return ACHIEVEMENTS.map((achievement, index) => ({
    category: achievement.category ?? 'Разное',
    tier: achievement.tier ?? index + 1,
    secret: Boolean(achievement.secret),
    ...achievement,
    unlocked: Boolean(state?.achievements?.[achievement.id]) || Boolean(achievement.check(state ?? STARTING_STATE)),
  }))
}

export function deriveEconomy(state = STARTING_STATE) {
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
