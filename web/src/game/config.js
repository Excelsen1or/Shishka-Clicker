import {
  getPrestigeBonuses,
  getRebirthQuota,
  getShardPreview,
} from './metaConfig'

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
    megaClickStreak: 0,
    emojiBurstStreak: 0,
    achievements: {},
    seenShopItems: {},
    seenBuyableShopItems: {},
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
      gemini: 0,
      deepseek: 0,
      mistral: 0,
    },
    upgrades: {
      textbooks: 0,
      coffee: 0,
      internship: 0,
      pickupPointShift: 0,
      courierRush: 0,
      studyGroup: 0,
      promptEngineering: 0,
      researchLab: 0,
      autoClicker: 0,
      focusMode: 0,
      memeMarketing: 0,
      coneSorting: 0,
      resinWorkshop: 0,
      logisticsHub: 0,
      serverRack: 0,
      campusExchange: 0,
      grantProgram: 0,
      brandStudio: 0,
      franchiseNetwork: 0,
      ventureFund: 0,
      quantFund: 0,
    },
  },
  price: {
    levelPenaltyStep: 0.075,
  },
  growth: {
    aiMultiplier: {
      base: 1,
      source: 'promptEngineering',
      firstGain: 0.052,
      decay: 0.9,
    },
    prestigeMultiplier: {
      rebirthGain: 0.12,
      shardGain: 0.012,
    },
    megaClick: {
      chanceBase: 0.05,
      chancePerFocus: 0.008,
      powerMultiplier: 4,
      emojiChance: 0.16,
      emojiChancePerMeme: 0.035,
      pool: [
        '🤡',
        '🌸',
        '🤖',
        '👾',
        '💥',
        '🛸',
        '🎉',
        '🦄',
        '🪩',
        '⚡',
        '🔥',
        '🌟',
        '🌈',
        '💫',
        '✨',
        '💎',
        '🍄',
        '🐿️',
        '🧠',
        '🎊',
        '🎆',
        '🫧',
        '🍀',
        '🌻',
        '🍓',
        '🦊',
        '🐸',
        '🛹',
        '🎮',
        '💜',
        '💚',
        '🧨',
        '🥳',
        '🦖',
        '🐣',
        '🌙',
      ],
    },
  },
  prestige: {
    unlock: {
      shishki: 65000,
      knowledge: 1800,
      achievements: 24,
    },
    rebirth: {
      explanation:
        'После открытия престижа каждая новая жизнь требует закрыть отдельную квоту текущего цикла.',
    },
  },
  softcaps: {
    clickPower: { threshold: 26, power: 0.68 },
    shishkiPerSecond: { threshold: 118, power: 0.66 },
    moneyPerSecond: { threshold: 78, power: 0.68 },
    knowledgePerSecond: { threshold: 52, power: 0.67 },
    aiPower: { threshold: 82, power: 0.74 },
  },
  subscriptions: {
    gigachat: {
      id: 'gigachat',
      title: 'ГигаЧат «Братишка, выручи»',
      description:
        'Бюджетный ИИ формата «и из-за этой хуйни дорожает оперативка?» работает, слава богу и ладно.',
      baseCost: 50,
      costScale: 1.78,
      tier: 1,
      effectLabel: 'Ранний шишечно-научный старт',
      unlock: { shishki: 0, knowledge: 0 },
      aiPowerWeight: 1.1,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 0.95,
          decay: 0.962,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 0.08,
          decay: 0.976,
          aiScaled: true,
        },
      ],
    },
    yandex_alisa: {
      id: 'yandex_alisa',
      title: 'Алиса, включи режим взрослого',
      description:
        'Универсал с вайбом «такси уже подъехало»: и по делу, и с характером, и в целом без сюрпризов.',
      baseCost: 150,
      costScale: 1.76,
      tier: 2,
      effectLabel: 'Универсальный ранний контур',
      unlock: { shishki: 180, knowledge: 12 },
      aiPowerWeight: 2,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 1.75,
          decay: 0.956,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 0.22,
          decay: 0.968,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 0.14,
          decay: 0.972,
          aiScaled: true,
        },
      ],
    },
    gpt: {
      id: 'gpt',
      title: 'Чат ГПТ помоги',
      description:
        'Режим «открыл чат, а закрыл с дипломом»: стабильно генерит пользу и лёгкую экзистенцию.',
      baseCost: 380,
      costScale: 1.79,
      tier: 3,
      effectLabel: 'Стабильный средний тир',
      unlock: { shishki: 560, knowledge: 55 },
      aiPowerWeight: 3.2,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 3.2,
          decay: 0.95,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 0.38,
          decay: 0.965,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 0.34,
          decay: 0.96,
          aiScaled: true,
        },
      ],
    },
    claude: {
      id: 'claude',
      title: 'Клод «Я вас услышал»',
      description:
        'Включает эстетику «вежливо, дорого, непонятно, но прибыльно». Тихо качает кэш и мозги.',
      baseCost: 900,
      costScale: 1.84,
      tier: 4,
      effectLabel: 'Сильный средний-лейт буст',
      unlock: { shishki: 1500, knowledge: 160 },
      aiPowerWeight: 4.6,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 3.8,
          decay: 0.946,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 0.72,
          decay: 0.958,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 0.82,
          decay: 0.954,
          aiScaled: true,
        },
      ],
    },
    perplexity: {
      id: 'perplexity',
      title: 'Perplexity «А пруф?»',
      description:
        'Исследовательский режим «а пруфы будут?»: знания летят вверх быстрее, чем цены на оперативку.',
      baseCost: 1650,
      costScale: 1.88,
      tier: 5,
      effectLabel: 'Специалист по знаниям',
      unlock: { shishki: 3200, knowledge: 360 },
      aiPowerWeight: 5.8,
      effects: [
        {
          stat: 'knowledgePerSecond',
          firstGain: 1.4,
          decay: 0.95,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 1.05,
          decay: 0.954,
          aiScaled: true,
        },
      ],
    },
    copilot: {
      id: 'copilot',
      title: 'Копилот «Ща накодим»',
      description:
        'Превращает хаос в релиз: как будто дедлайн завтра, а ты внезапно всё успеваешь.',
      baseCost: 3100,
      costScale: 1.91,
      tier: 6,
      effectLabel: 'Производственный буст',
      unlock: { shishki: 6200, knowledge: 700 },
      aiPowerWeight: 7.2,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 6.7,
          decay: 0.946,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 1.35,
          decay: 0.952,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 0.5,
          decay: 0.958,
          aiScaled: true,
        },
      ],
    },
    gemini: {
      id: 'gemini',
      title: 'Gemini «И умный и красивый»',
      description:
        'Гибрид - и умный, и при деньгах. Тот самый случай, когда и cashback есть, и саморазвитие присутствует.',
      baseCost: 5200,
      costScale: 1.95,
      tier: 7,
      effectLabel: 'Гибрид лейт-гейма',
      unlock: { shishki: 10500, knowledge: 1200 },
      aiPowerWeight: 8.8,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 4.8,
          decay: 0.948,
          aiScaled: true,
        },
        { stat: 'moneyPerSecond', firstGain: 2.0, decay: 0.95, aiScaled: true },
        {
          stat: 'knowledgePerSecond',
          firstGain: 1.25,
          decay: 0.952,
          aiScaled: true,
        },
      ],
    },
    deepseek: {
      id: 'deepseek',
      title: 'DeepSeek «Ипотека Edition»',
      description:
        'Премиум-режим «ипотека на нейросеть»: дорого, пафосно, зато ощущается каждый вложенный рубль.',
      baseCost: 8200,
      costScale: 1.99,
      tier: 8,
      effectLabel: 'Лейт-гейм AI-ускоритель',
      unlock: { shishki: 16500, knowledge: 1900 },
      aiPowerWeight: 10.8,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 10.4,
          decay: 0.944,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 1.8,
          decay: 0.95,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 2.45,
          decay: 0.95,
          aiScaled: true,
        },
      ],
    },
    mistral: {
      id: 'mistral',
      title: 'Mistral «Финальный вайб»',
      description:
        'Финальный босс оптимизации: после него сборка звучит как «я просто случайно всё просчитал».',
      baseCost: 12800,
      costScale: 2.03,
      tier: 9,
      effectLabel: 'Финальная мульти-ресурсная машина',
      unlock: { shishki: 26000, knowledge: 3000 },
      aiPowerWeight: 13,
      effects: [
        {
          stat: 'shishkiPerSecond',
          firstGain: 12.2,
          decay: 0.944,
          aiScaled: true,
        },
        {
          stat: 'knowledgePerSecond',
          firstGain: 2.6,
          decay: 0.948,
          aiScaled: true,
        },
        {
          stat: 'moneyPerSecond',
          firstGain: 3.1,
          decay: 0.948,
          aiScaled: true,
        },
      ],
    },
  },
  upgrades: {
    textbooks: {
      id: 'textbooks',
      title: 'Методичка 2007 без ответов',
      description:
        'Классика жанра: купил методичку, открыл на странице 3 и уже чувствуешь себя отличником.',
      currency: 'money',
      baseCost: 35,
      costScale: 1.76,
      tier: 1,
      effectLabel: 'Клик и ранние знания',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [
        { stat: 'clickPower', firstGain: 0.58, decay: 0.98, baseBonus: 1 },
        { stat: 'knowledgePerSecond', firstGain: 0.04, decay: 0.984 },
      ],
    },
    coffee: {
      id: 'coffee',
      title: 'Кофе 3-в-1 и паника',
      description:
        'Комбо «эспрессо плюс паника»: пальцы кликают быстрее, а продуктивность выглядит убедительно.',
      currency: 'money',
      baseCost: 70,
      costScale: 1.58,
      tier: 1,
      effectLabel: 'Темп клика и шишек/сек',
      unlock: { shishki: 0, knowledge: 0 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.42, decay: 0.974 },
        { stat: 'clickPower', firstGain: 0.08, decay: 0.982 },
      ],
    },
    internship: {
      id: 'internship',
      title: 'Склад OZON 12ч',
      description:
        'Первый серьёзный кэшфлоу: смена прошла, ноги болят, зато бюджет на апгрейды появился.',
      currency: 'shishki',
      baseCost: 120,
      costScale: 1.54,
      tier: 2,
      effectLabel: 'Деньги/сек и чуть науки',
      unlock: { shishki: 90, knowledge: 0 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 0.72, decay: 0.969, baseBonus: 1 },
        { stat: 'knowledgePerSecond', firstGain: 0.05, decay: 0.98 },
      ],
    },
    pickupPointShift: {
      id: 'pickupPointShift',
      title: 'ПВЗ WB: вечная очередь',
      description:
        'Смена на выдаче: сканер пищит, очередь не кончается, а баланс денег всё-таки растёт.',
      currency: 'shishki',
      baseCost: 180,
      costScale: 1.57,
      tier: 2,
      effectLabel: 'Деньги/сек и выносливость клика',
      unlock: { shishki: 140, knowledge: 8 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 0.86, decay: 0.968, baseBonus: 1 },
        { stat: 'clickPower', firstGain: 0.07, decay: 0.98 },
      ],
    },
    courierRush: {
      id: 'courierRush',
      title: 'Курьер: 30 до дождя',
      description:
        'Темп как в пятницу вечером: лифт занят, самокат пищит, зато зарплата капает стабильнее.',
      currency: 'shishki',
      baseCost: 260,
      costScale: 1.6,
      tier: 2,
      effectLabel: 'Деньги/сек + немного науки',
      unlock: { shishki: 220, knowledge: 15 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.05, decay: 0.966, baseBonus: 1 },
        { stat: 'knowledgePerSecond', firstGain: 0.06, decay: 0.979 },
      ],
    },
    studyGroup: {
      id: 'studyGroup',
      title: 'Учебный чат «кто скинет?»',
      description:
        'Чат на 42 человека, где реально пишут двое, но именно они и тащат вас к прогрессу.',
      currency: 'knowledge',
      baseCost: 55,
      costScale: 1.64,
      tier: 2,
      effectLabel: 'Клик, деньги и наука',
      unlock: { shishki: 100, knowledge: 28 },
      effects: [
        { stat: 'clickPower', firstGain: 0.18, decay: 0.968 },
        { stat: 'moneyPerSecond', firstGain: 0.2, decay: 0.976 },
        { stat: 'knowledgePerSecond', firstGain: 0.1, decay: 0.978 },
      ],
    },
    promptEngineering: {
      id: 'promptEngineering',
      title: 'Промпт «сделай нормально»',
      description:
        'Один нормальный промпт и вместо «иди нахуй даун» появляется результат, который не стыдно показать тимлиду.',
      currency: 'knowledge',
      baseCost: 95,
      costScale: 1.68,
      tier: 3,
      effectLabel: 'AI множитель и опорный клик',
      unlock: { shishki: 260, knowledge: 70 },
      effects: [
        { stat: 'clickPower', firstGain: 0.12, decay: 0.94 },
        { stat: 'knowledgePerSecond', firstGain: 0.22, decay: 0.968 },
      ],
    },
    researchLab: {
      id: 'researchLab',
      title: 'Лаба + научрук в офлайне',
      description:
        'Научрук редко в сети, но когда отвечает «интересно», экономика сразу идёт в плюс.',
      currency: 'knowledge',
      baseCost: 180,
      costScale: 1.84,
      tier: 3,
      effectLabel: 'Исследовательский контур',
      unlock: { shishki: 650, knowledge: 110 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.18, decay: 0.966 },
        { stat: 'moneyPerSecond', firstGain: 0.42, decay: 0.956 },
        { stat: 'knowledgePerSecond', firstGain: 0.42, decay: 0.962 },
      ],
    },
    autoClicker: {
      id: 'autoClicker',
      title: 'Автокликер под партой',
      description:
        'Ты вроде на лекции, а прогресс будто работает в две смены и без перекуров.',
      currency: 'money',
      baseCost: 260,
      costScale: 1.74,
      tier: 3,
      effectLabel: 'Клик + шишки/сек',
      unlock: { shishki: 430, knowledge: 45 },
      effects: [
        { stat: 'clickPower', firstGain: 0.42, decay: 0.962 },
        { stat: 'shishkiPerSecond', firstGain: 1.05, decay: 0.962 },
      ],
    },
    focusMode: {
      id: 'focusMode',
      title: 'Фокус: уведомления в бан',
      description:
        'Режим «не отвлекаюсь»: выключил уведомления, открыл таск и за 40 минут сделал как за неделю.',
      currency: 'knowledge',
      baseCost: 240,
      costScale: 1.72,
      tier: 4,
      effectLabel: 'Мега-клик, знания и ручной темп',
      unlock: { shishki: 1350, knowledge: 220 },
      effects: [
        { stat: 'knowledgePerSecond', firstGain: 0.42, decay: 0.962 },
        { stat: 'clickPower', firstGain: 0.14, decay: 0.97 },
      ],
    },
    memeMarketing: {
      id: 'memeMarketing',
      title: 'Меммаркетинг и охваты',
      description:
        'Один удачный мем, и вот уже даже бухгалтерия лайкает: охваты растут, касса тоже.',
      currency: 'money',
      baseCost: 920,
      costScale: 1.88,
      tier: 4,
      effectLabel: 'Доход и эмодзи-моментум',
      unlock: { shishki: 2200, knowledge: 300 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.15, decay: 0.958 },
        { stat: 'shishkiPerSecond', firstGain: 0.75, decay: 0.962 },
      ],
    },
    coneSorting: {
      id: 'coneSorting',
      title: 'Шишки по пакетам',
      description:
        'Сначала бардак как на складе после распродажи, потом порядок как в Excel у завхоза и всё внезапно летит.',
      currency: 'shishki',
      baseCost: 220,
      costScale: 1.56,
      tier: 2,
      effectLabel: 'Деньги/сек + клик',
      unlock: { shishki: 220, knowledge: 18 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 0.62, decay: 0.972 },
        { stat: 'clickPower', firstGain: 0.16, decay: 0.976 },
      ],
    },
    resinWorkshop: {
      id: 'resinWorkshop',
      title: 'Смоляной гараж-цех',
      description:
        'Мини-завод формата «гараж-стайл»: пахнет смолой, шумит как маршрутка, но прибыль капает.',
      currency: 'shishki',
      baseCost: 640,
      costScale: 1.66,
      tier: 3,
      effectLabel: 'Шишки/сек + деньги/сек',
      unlock: { shishki: 820, knowledge: 95 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 0.9, decay: 0.966 },
        { stat: 'moneyPerSecond', firstGain: 0.7, decay: 0.968 },
      ],
    },
    logisticsHub: {
      id: 'logisticsHub',
      title: 'Логистика через Госуслуги',
      description:
        'Как удачно поймать окно на МФЦ: незаметно, но резко ускоряет всё сразу и спасает нервы.',
      currency: 'shishki',
      baseCost: 1280,
      costScale: 1.71,
      tier: 4,
      effectLabel: 'Шишки, деньги и немного науки',
      unlock: { shishki: 1900, knowledge: 240 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 1.35, decay: 0.962 },
        { stat: 'moneyPerSecond', firstGain: 1.0, decay: 0.964 },
        { stat: 'knowledgePerSecond', firstGain: 0.18, decay: 0.968 },
      ],
    },
    serverRack: {
      id: 'serverRack',
      title: 'Стойка, что шумит как поезд',
      description:
        'Железо гудит, лампочки мигают, соседи думают майнинг, а ты просто строишь светлое будущее.',
      currency: 'money',
      baseCost: 2100,
      costScale: 1.95,
      tier: 5,
      effectLabel: 'Тяжёлая пассивная инфраструктура',
      unlock: { shishki: 3800, knowledge: 480 },
      effects: [
        { stat: 'shishkiPerSecond', firstGain: 1.95, decay: 0.956 },
        { stat: 'moneyPerSecond', firstGain: 0.82, decay: 0.962 },
        { stat: 'knowledgePerSecond', firstGain: 0.72, decay: 0.96 },
      ],
    },
    campusExchange: {
      id: 'campusExchange',
      title: 'Биржа общаги 24/7',
      description:
        'Локальная биржа по правилам общаги: меняем всё на всё, лишь бы курс был в твою пользу.',
      currency: 'shishki',
      baseCost: 2100,
      costScale: 1.74,
      tier: 5,
      effectLabel: 'Биржа ресурсов',
      unlock: { shishki: 3000, knowledge: 350 },
      effects: [
        { stat: 'knowledgePerSecond', firstGain: 0.72, decay: 0.958 },
        { stat: 'moneyPerSecond', firstGain: 0.72, decay: 0.962 },
        { stat: 'shishkiPerSecond', firstGain: 1.1, decay: 0.964 },
      ],
    },
    grantProgram: {
      id: 'grantProgram',
      title: 'Грант: дедлайн был вчера',
      description:
        'Три ночи на заявку, пять правок шрифта, один шанс: зато потом экономика дышит свободнее.',
      currency: 'knowledge',
      baseCost: 560,
      costScale: 1.82,
      tier: 5,
      effectLabel: 'Наука и денежный runway',
      unlock: { shishki: 3600, knowledge: 460 },
      effects: [
        { stat: 'knowledgePerSecond', firstGain: 0.95, decay: 0.958 },
        { stat: 'moneyPerSecond', firstGain: 0.9, decay: 0.96 },
      ],
    },
    brandStudio: {
      id: 'brandStudio',
      title: 'Бренд-студия «дорого-богато»',
      description:
        'Добавляет проекту «дорого-богато»: те же шишки, но теперь в фирменной упаковке и с наценкой.',
      currency: 'money',
      baseCost: 1850,
      costScale: 1.9,
      tier: 5,
      effectLabel: 'Капитализация и рост знаний',
      unlock: { shishki: 4200, knowledge: 520 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.35, decay: 0.956 },
        { stat: 'knowledgePerSecond', firstGain: 0.42, decay: 0.962 },
        { stat: 'shishkiPerSecond', firstGain: 0.55, decay: 0.964 },
      ],
    },
    franchiseNetwork: {
      id: 'franchiseNetwork',
      title: 'Франшиза «точка на точке»',
      description:
        'Масштабирование по-русски: открыл точку, вторую, третью, и уже сам не понял, кто тут головной офис.',
      currency: 'shishki',
      baseCost: 3600,
      costScale: 1.86,
      tier: 6,
      effectLabel: 'Конвертация шишек в капитал',
      unlock: { shishki: 6200, knowledge: 760 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.95, decay: 0.954 },
        { stat: 'shishkiPerSecond', firstGain: 1.25, decay: 0.958 },
        { stat: 'knowledgePerSecond', firstGain: 0.45, decay: 0.962 },
      ],
    },
    ventureFund: {
      id: 'ventureFund',
      title: 'Фонд кафедры и риски',
      description:
        'Ставка на будущее, как покупка валюты в тревожный вечер: нервно, но иногда очень вовремя.',
      currency: 'knowledge',
      baseCost: 980,
      costScale: 1.92,
      tier: 6,
      effectLabel: 'Поздняя инвестиционная машина',
      unlock: { shishki: 7000, knowledge: 850 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 1.65, decay: 0.954 },
        { stat: 'shishkiPerSecond', firstGain: 2.25, decay: 0.956 },
        { stat: 'knowledgePerSecond', firstGain: 0.52, decay: 0.962 },
      ],
    },
    quantFund: {
      id: 'quantFund',
      title: 'Квант-фонд на трёх мониторах',
      description:
        'Финансовая алхимия уровня «таблица в три монитора»: выглядит страшно, а приносит стабильно.',
      currency: 'knowledge',
      baseCost: 1550,
      costScale: 1.95,
      tier: 7,
      effectLabel: 'Финансовый мульти-ресурсный контур',
      unlock: { shishki: 10500, knowledge: 1300 },
      effects: [
        { stat: 'moneyPerSecond', firstGain: 2.35, decay: 0.952 },
        { stat: 'shishkiPerSecond', firstGain: 1.75, decay: 0.956 },
        { stat: 'knowledgePerSecond', firstGain: 0.7, decay: 0.96 },
      ],
    },
  },
}

export const STARTING_STATE = BALANCE.start
export const SUBSCRIPTIONS = Object.values(BALANCE.subscriptions)
export const UPGRADES = Object.values(BALANCE.upgrades)

const achievementNumber = new Intl.NumberFormat('ru-RU')

function totalLevels(collection) {
  return Object.values(collection ?? {}).reduce(
    (sum, value) => sum + Number(value ?? 0),
    0,
  )
}

function ownsAllItemsAtLeast(state, target) {
  const hasSubscriptions = SUBSCRIPTIONS.every(
    (item) => (state.subscriptions?.[item.id] ?? 0) >= target,
  )
  const hasUpgrades = UPGRADES.every(
    (item) => (state.upgrades?.[item.id] ?? 0) >= target,
  )
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
    description:
      `${descriptionPrefix} ${achievementNumber.format(target)} ${suffix}`.trim(),
    check: (state) => valueGetter(state) >= target,
    achievementType: 'milestone',
    groupKey: idPrefix,
    groupTitle: `${icon} ${titlePrefix}`,
    level: index + 1,
    maxLevel: milestones.length,
    target,
    valueGetter,
    category,
    tier: index + 1 + tierOffset,
    secret,
  }))
}

const specialAchievements = [
  {
    id: 'first_click',
    title: 'Касание к ядру',
    description: 'Сделай первый клик по шишке и запусти цикл.',
    check: (state) => state.manualClicks >= 1,
    category: 'Кликер',
    tier: 1,
  },
  {
    id: 'first_subscription',
    title: 'Первый контракт',
    description: 'Купи первую подписку и открой пассивный доход.',
    check: (state) => totalLevels(state.subscriptions) >= 1,
    category: 'Подписки',
    tier: 1,
  },
  {
    id: 'first_upgrade',
    title: 'Первый тюнинг',
    description: 'Купи первое улучшение и усили базовый цикл.',
    check: (state) => totalLevels(state.upgrades) >= 1,
    category: 'Апгрейды',
    tier: 2,
  },
  {
    id: 'prestige_unlocked',
    title: 'Разрыв цикла',
    description: 'Открой систему престижа и выйди за пределы обычного забега.',
    check: (state) =>
      (state.totalPrestigeShardsEarned ?? 0) > 0 || (state.rebirths ?? 0) > 0,
    category: 'Престиж',
    tier: 3,
  },
  {
    id: 'reborn',
    title: 'Первый перезапуск',
    description: 'Сделай первый ребёрс и начни следующий цикл сильнее.',
    check: (state) => state.rebirths >= 1,
    category: 'Престиж',
    tier: 4,
  },
  {
    id: 'full_stack_bootstrap',
    title: 'Собрано на коленке',
    description:
      'Купи хотя бы по одному уровню всех подписок и всех апгрейдов.',
    check: (state) => ownsAllItemsAtLeast(state, 1),
    category: 'Секреты',
    tier: 5,
    secret: true,
  },
]

const levelAchievements = [
  ...buildMilestoneAchievements({
    idPrefix: 'manual_clicks',
    titlePrefix: 'Ритм руки',
    descriptionPrefix: 'Сделай',
    suffix: 'кликов вручную.',
    milestones: [10, 100, 1000, 10000, 100000, 1000000],
    valueGetter: (state) => state.manualClicks ?? 0,
    icon: '🖱️',
    category: 'Кликер',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_shishki',
    titlePrefix: 'Шишечная империя',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'шишек.',
    milestones: [1000, 10000, 100000, 1000000, 10000000, 100000000],
    valueGetter: (state) => state.lifetimeShishkiEarned ?? 0,
    icon: '💼',
    category: 'Экономика',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_money',
    titlePrefix: 'Кассовый разгон',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'денег.',
    milestones: [100, 1000, 10000, 100000, 1000000, 10000000],
    valueGetter: (state) => state.lifetimeMoneyEarned ?? 0,
    icon: '💵',
    category: 'Экономика',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'lifetime_knowledge',
    titlePrefix: 'Глубина архива',
    descriptionPrefix: 'Заработай за всё время',
    suffix: 'знаний.',
    milestones: [25, 250, 2500, 25000, 250000, 1000000],
    valueGetter: (state) => state.lifetimeKnowledgeEarned ?? 0,
    icon: '📚',
    category: 'Исследования',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'subscription_levels',
    titlePrefix: 'Стек сервисов',
    descriptionPrefix: 'Купи суммарно',
    suffix: 'уровней подписок.',
    milestones: [1, 5, 15, 40, 90, 180],
    valueGetter: (state) => totalLevels(state.subscriptions),
    icon: '🧠',
    category: 'Подписки',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'upgrade_levels',
    titlePrefix: 'Цех апгрейдов',
    descriptionPrefix: 'Купи суммарно',
    suffix: 'уровней улучшений.',
    milestones: [1, 5, 15, 40, 90, 180],
    valueGetter: (state) => totalLevels(state.upgrades),
    icon: '⚙️',
    category: 'Апгрейды',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'mega_clicks',
    titlePrefix: 'Шторм мега-кликов',
    descriptionPrefix: 'Сделай',
    suffix: 'мега-кликов.',
    milestones: [1, 10, 50, 250, 1000, 5000],
    valueGetter: (state) => state.megaClicks ?? 0,
    icon: '⚡',
    category: 'Кликер',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'emoji_bursts',
    titlePrefix: 'Карнавал эмодзи',
    descriptionPrefix: 'Поймай',
    suffix: 'эмодзи-взрывов.',
    milestones: [1, 10, 50, 250, 1000, 2500],
    valueGetter: (state) => state.emojiBursts ?? 0,
    icon: '🎉',
    category: 'Кликер',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'rebirths',
    titlePrefix: 'Спираль ребёрсов',
    descriptionPrefix: 'Сделай',
    suffix: 'ребёрсов.',
    milestones: [1, 3, 5, 10, 20, 35],
    valueGetter: (state) => state.rebirths ?? 0,
    icon: '♻️',
    category: 'Престиж',
  }),
  ...buildMilestoneAchievements({
    idPrefix: 'prestige_shards',
    titlePrefix: 'Осколочный реактор',
    descriptionPrefix: 'Заработай суммарно',
    suffix: 'осколков престижа.',
    milestones: [5, 25, 100, 400, 1600, 6400],
    valueGetter: (state) => state.totalPrestigeShardsEarned ?? 0,
    icon: '💎',
    category: 'Престиж',
  }),
]

const secretAchievements = [
  {
    id: 'all_systems_online_7',
    title: '🕵️ Тихий запуск',
    description: 'Подними все подписки и апгрейды минимум до 7 уровня.',
    check: (state) => ownsAllItemsAtLeast(state, 7),
    category: 'Секреты',
    tier: 2,
    secret: true,
  },
  {
    id: 'perfect_machine_20',
    title: '🛰️ Холодная синхронизация',
    description: 'Подними все подписки и апгрейды минимум до 20 уровня.',
    check: (state) => ownsAllItemsAtLeast(state, 20),
    category: 'Секреты',
    tier: 3,
    secret: true,
  },
  {
    id: 'manual_monster',
    title: '🖐️ Никакой автоматики',
    description: 'Сделай 1 000 000 ручных кликов.',
    check: (state) => (state.manualClicks ?? 0) >= 1_000_000,
    category: 'Секреты',
    tier: 14,
    secret: true,
  },
  {
    id: 'noob_trap',
    title: '🪤 Упрямый старт',
    description: 'Сделай 1000 ручных кликов, не купив ни одной подписки.',
    check: (state) =>
      (state.manualClicks ?? 0) >= 1000 &&
      totalLevels(state.subscriptions) === 0,
    category: 'Секреты',
    tier: 15,
    secret: true,
  },
  {
    id: 'pure_research',
    title: '🧪 Лаборатория без сна',
    description: 'Накопи 10 000 знаний на балансе одновременно.',
    check: (state) => (state.knowledge ?? 0) >= 10_000,
    category: 'Секреты',
    tier: 16,
    secret: true,
  },
  {
    id: 'dragon_hoard',
    title: '🐉 Гнездо накопителя',
    description: 'Держи одновременно 5 000 000 шишек на балансе.',
    check: (state) => (state.shishki ?? 0) >= 5_000_000,
    category: 'Секреты',
    tier: 17,
    secret: true,
  },
  {
    id: 'knowledge_ocean',
    title: '🌊 Белый шум архива',
    description: 'Держи одновременно 1 000 000 знаний.',
    check: (state) => (state.knowledge ?? 0) >= 1_000_000,
    category: 'Секреты',
    tier: 20,
    secret: true,
  },
  {
    id: 'capital_mount',
    title: '🏔️ Давление капитала',
    description: 'Держи одновременно 50 000 000 денег.',
    check: (state) => (state.money ?? 0) >= 50_000_000,
    category: 'Секреты',
    tier: 21,
    secret: true,
  },
  {
    id: 'oracle_31',
    title: '🔮 Оракул тридцать первого',
    description: 'Подними «Промпт-инжиниринг» минимум до 31 уровня.',
    check: (state) => (state.upgrades?.promptEngineering ?? 0) >= 31,
    category: 'Секреты',
    tier: 23,
    secret: true,
  },
  {
    id: 'meme_dimension',
    title: '🫠 Мембрана реальности',
    description: 'Сделай 777 эмодзи-взрывов и 777 мега-кликов.',
    check: (state) =>
      (state.emojiBursts ?? 0) >= 777 && (state.megaClicks ?? 0) >= 777,
    category: 'Секреты',
    tier: 24,
    secret: true,
  },
  {
    id: 'deepseek_cult',
    title: '🛸 Зов DeepSeek',
    description: 'Подними DeepSeek Ultra минимум до 66 уровня.',
    check: (state) => (state.subscriptions?.deepseek ?? 0) >= 66,
    category: 'Секреты',
    tier: 25,
    secret: true,
  },
  {
    id: 'autoclicker_suspect',
    title: '🤖 Подозрительная частота',
    description: 'Достигни скорости 11+ кликов в секунду. Ты точно человек?',
    check: (state) => Boolean(state.achievements?.autoclicker_reached),
    category: 'Секреты',
    tier: 26,
    secret: true,
  },
]

export const ACHIEVEMENTS = [
  ...specialAchievements,
  ...levelAchievements,
  ...secretAchievements,
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
  return (
    BALANCE.subscriptions[id]?.unlock ??
    BALANCE.upgrades[id]?.unlock ?? { shishki: 0, knowledge: 0 }
  )
}

export function getUnlockStatus(state, id) {
  const rule = getUnlockRule(id)
  const progress = {
    shishki: state.lifetimeShishkiEarned ?? state.totalShishkiEarned ?? 0,
    knowledge: state.lifetimeKnowledgeEarned ?? state.totalKnowledgeEarned ?? 0,
  }

  return {
    unlocked:
      progress.shishki >= rule.shishki && progress.knowledge >= rule.knowledge,
    rule,
    progress,
  }
}

export function formatUnlockText(rule) {
  const parts = []
  if (rule.shishki > 0) parts.push(`шишки: ${rule.shishki}`)
  if (rule.knowledge > 0) parts.push(`знания: ${rule.knowledge}`)
  return parts.length
    ? `Открывается при ${parts.join(' · ')}`
    : 'Открыто с начала игры'
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
      totals[effect.stat] =
        (totals[effect.stat] ?? 0) +
        getEffectTotalAtLevel(effect, level, aiMultiplier)
    })

    return totals
  }, buildBaseTotals())
}

function getEffectIncrement(effect, level, aiMultiplier = 1) {
  return (
    getEffectTotalAtLevel(effect, level + 1, aiMultiplier) -
    getEffectTotalAtLevel(effect, level, aiMultiplier)
  )
}

function formatEffectStat(stat, value) {
  const meta = STAT_META[stat] ?? { label: stat, prefix: '+', suffix: '' }
  return `${meta.prefix}${Number(value.toFixed(2))} ${meta.label}${meta.suffix}`.trim()
}

function describeItemEffects(item, level, aiMultiplier, prestigeMultiplier) {
  const current = []
  const next = []

  item.effects.forEach((effect) => {
    const total =
      getEffectTotalAtLevel(effect, level, aiMultiplier) *
      (effect.stat === 'clickPower' || effect.stat.endsWith('PerSecond')
        ? prestigeMultiplier
        : 1)
    const delta =
      getEffectIncrement(effect, level, aiMultiplier) *
      (effect.stat === 'clickPower' || effect.stat.endsWith('PerSecond')
        ? prestigeMultiplier
        : 1)

    if (total > 0) current.push(formatEffectStat(effect.stat, total))
    if (delta > 0) next.push(formatEffectStat(effect.stat, delta))
  })

  const aiSource = BALANCE.growth.aiMultiplier
  if (item.id === aiSource.source) {
    const currentAi =
      aiSource.base + geometricGain(level, aiSource.firstGain, aiSource.decay)
    const nextAi =
      aiSource.base +
      geometricGain(level + 1, aiSource.firstGain, aiSource.decay)
    const aiDelta = nextAi - currentAi

    if (level > 0 || currentAi > aiSource.base)
      current.push(formatEffectStat('aiMultiplier', currentAi))
    if (aiDelta > 0) next.push(formatEffectStat('aiMultiplier', aiDelta))
  }

  if (item.id === 'focusMode') {
    const currentChance = getMegaClickChance({
      upgrades: { focusMode: level, memeMarketing: 0 },
    })
    const nextChance = getMegaClickChance({
      upgrades: { focusMode: level + 1, memeMarketing: 0 },
    })
    current.push(formatEffectStat('megaChance', currentChance * 100))
    next.push(
      formatEffectStat('megaChance', (nextChance - currentChance) * 100),
    )
  }

  return {
    currentText: current.length ? current.join(' · ') : item.effectLabel,
    nextText: next.length
      ? `След. ур.: ${next.join(' · ')}`
      : 'Максимум полезного эффекта достигнут',
  }
}

export function getItemEffectPreview(
  item,
  level,
  aiMultiplier,
  prestigeMultiplier = 1,
) {
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
  return (
    1 +
    (state?.rebirths ?? 0) * cfg.rebirthGain +
    (state?.prestigeShards ?? 0) * cfg.shardGain +
    bonuses.permanentMultiplierBonus
  )
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

function getRawStatTotals(
  state = STARTING_STATE,
  aiMultiplier,
  prestigeMultiplier,
) {
  const safeState = state ?? STARTING_STATE
  const upgradeTotals = accumulateEffects(
    UPGRADES,
    safeState?.upgrades ?? {},
    aiMultiplier,
  )
  const subscriptionTotals = accumulateEffects(
    SUBSCRIPTIONS,
    safeState?.subscriptions ?? {},
    aiMultiplier,
  )

  return {
    clickPower: (upgradeTotals.clickPower || 1) * prestigeMultiplier,
    shishkiPerSecond:
      (upgradeTotals.shishkiPerSecond + subscriptionTotals.shishkiPerSecond) *
      prestigeMultiplier,
    moneyPerSecond: (upgradeTotals.moneyPerSecond || 1) * prestigeMultiplier,
    knowledgePerSecond:
      (upgradeTotals.knowledgePerSecond +
        subscriptionTotals.knowledgePerSecond) *
      prestigeMultiplier,
  }
}

function getItemStatTotals(item, level, aiMultiplier, prestigeMultiplier) {
  const totals = buildBaseTotals()
  if (level <= 0) return totals

  item.effects.forEach((effect) => {
    const value = getEffectTotalAtLevel(effect, level, aiMultiplier)
    totals[effect.stat] =
      (totals[effect.stat] ?? 0) +
      value *
        (effect.stat === 'clickPower' || effect.stat.endsWith('PerSecond')
          ? prestigeMultiplier
          : 1)
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
        value:
          rawTotals.clickPower > 0
            ? finalTotals.clickPower / rawTotals.clickPower
            : 0,
      },
    },
    {
      stat: 'moneyPerSecond',
      entry: {
        id: 'base-money',
        title: 'Базовый доход',
        sourceType: 'base',
        value:
          rawTotals.moneyPerSecond > 0
            ? finalTotals.moneyPerSecond / rawTotals.moneyPerSecond
            : 0,
      },
    },
  ]
}

export function deriveContributionBreakdown(state = STARTING_STATE) {
  const safeState = state ?? STARTING_STATE
  const aiMultiplier = deriveAiMultiplier(safeState)
  const prestigeMultiplier = derivePrestigeMultiplier(safeState)
  const rawTotals = getRawStatTotals(
    safeState,
    aiMultiplier,
    prestigeMultiplier,
  )
  const rawAiPower = SUBSCRIPTIONS.reduce((sum, item) => {
    const level = safeState?.subscriptions?.[item.id] ?? 0
    return sum + level * (item.aiPowerWeight ?? 0)
  }, 0)

  const finalTotals = {
    clickPower: applySoftcap('clickPower', rawTotals.clickPower),
    shishkiPerSecond: applySoftcap(
      'shishkiPerSecond',
      rawTotals.shishkiPerSecond,
    ),
    moneyPerSecond: applySoftcap('moneyPerSecond', rawTotals.moneyPerSecond),
    knowledgePerSecond: applySoftcap(
      'knowledgePerSecond',
      rawTotals.knowledgePerSecond,
    ),
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
    ...UPGRADES.map((item) => ({
      ...item,
      sourceType: 'upgrade',
      level: safeState?.upgrades?.[item.id] ?? 0,
    })),
    ...SUBSCRIPTIONS.map((item) => ({
      ...item,
      sourceType: 'subscription',
      level: safeState?.subscriptions?.[item.id] ?? 0,
    })),
  ]

  items.forEach((item) => {
    if (item.level <= 0) return
    const totals = getItemStatTotals(
      item,
      item.level,
      aiMultiplier,
      prestigeMultiplier,
    )

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
      const scaledValue =
        rawAiPower > 0 ? (rawValue / rawAiPower) * finalTotals.aiPower : 0
      groups.aiPower.push({
        id: item.id,
        title: item.title,
        sourceType: item.sourceType,
        value: Number(scaledValue.toFixed(2)),
      })
    }
  })

  getBaseContributionEntries(rawTotals, finalTotals).forEach(
    ({ stat, entry }) => {
      groups[stat].push({ ...entry, value: Number(entry.value.toFixed(2)) })
    },
  )

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
    const unlocked =
      Boolean(safeState?.achievements?.[achievement.id]) ||
      Boolean(achievement.check(safeState))
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
  const nextQuota = getRebirthQuota(
    state,
    unlockedAchievements,
    (state?.rebirths ?? 0) + 1,
  )
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
      achievements: Math.max(
        0,
        quota.achievements - shardPreview.progress.achievements,
      ),
    },
  }
}

export function deriveAchievements(state = STARTING_STATE) {
  return ACHIEVEMENTS.map((achievement, index) => ({
    category: achievement.category ?? 'Разное',
    tier: achievement.tier ?? index + 1,
    secret: Boolean(achievement.secret),
    ...achievement,
    progressValue:
      achievement.achievementType === 'milestone' &&
      typeof achievement.valueGetter === 'function'
        ? Number(achievement.valueGetter(state ?? STARTING_STATE) ?? 0)
        : null,
    unlocked:
      Boolean(state?.achievements?.[achievement.id]) ||
      Boolean(achievement.check(state ?? STARTING_STATE)),
  }))
}

export function deriveEconomy(state = STARTING_STATE) {
  const aiMultiplier = deriveAiMultiplier(state)
  const prestigeMultiplier = derivePrestigeMultiplier(state)
  const rawTotals = getRawStatTotals(state, aiMultiplier, prestigeMultiplier)

  return {
    clickPower: Number(
      applySoftcap('clickPower', rawTotals.clickPower).toFixed(1),
    ),
    shishkiPerSecond: Number(
      applySoftcap('shishkiPerSecond', rawTotals.shishkiPerSecond).toFixed(1),
    ),
    moneyPerSecond: Number(
      applySoftcap('moneyPerSecond', rawTotals.moneyPerSecond).toFixed(1),
    ),
    knowledgePerSecond: Number(
      applySoftcap('knowledgePerSecond', rawTotals.knowledgePerSecond).toFixed(
        1,
      ),
    ),
    aiPower: Number(deriveAiPower(state).toFixed(1)),
    aiMultiplier: Number(aiMultiplier.toFixed(2)),
    prestigeMultiplier: Number(prestigeMultiplier.toFixed(2)),
    megaClickChance: Number((getMegaClickChance(state) * 100).toFixed(1)),
    emojiMegaChance: Number((getMegaEmojiChance(state) * 100).toFixed(1)),
  }
}
