export const QUOTA_RULES = {
  baseQuota: 1_000,
  quotaGrowth: 2,
}

export const TAR_LUMP_RULES = {
  intervalMs: 14_400_000,
  maxBuildingLevel: 10,
}

export const BUILDINGS = [
  {
    id: 'garagePicker',
    title: 'Сборщик шишек у гаражей',
    baseCost: 15,
    baseOutput: 0.1,
  },
  {
    id: 'pickupPoint',
    title: 'ПВЗ на окраине',
    baseCost: 100,
    baseOutput: 1,
  },
  {
    id: 'greySorting',
    title: 'Серая сортировка',
    baseCost: 1_100,
    baseOutput: 8,
  },
  {
    id: 'selfEmployedCrew',
    title: 'Бригада самозанятых',
    baseCost: 12_000,
    baseOutput: 47,
  },
  {
    id: 'resaleStall',
    title: 'Ларек перепродажи',
    baseCost: 130_000,
    baseOutput: 260,
  },
]

export const RUN_UPGRADES = [
  {
    id: 'warehouseRhythm',
    title: 'Складской ритм',
    kind: 'globalMultiplier',
    cost: 250,
    value: 0.2,
  },
  {
    id: 'cashbackBug',
    title: 'Ошибочный кэшбэк',
    kind: 'clickMultiplier',
    cost: 600,
    value: 1,
  },
]

export const PRESTIGE_UPGRADES = [
  {
    id: 'heavenlyTar',
    title: 'Небесная смола',
    baseCost: 1,
    value: 0.15,
  },
  {
    id: 'taxBlindness',
    title: 'Налоговая слепота',
    baseCost: 2,
    value: 0.01,
  },
]

export const MARKET_GOODS = [
  {
    id: 'pickupPointLeftovers',
    title: 'Остатки с ПВЗ',
    basePrice: 40,
    profile: 'stable',
  },
  {
    id: 'parallelImport',
    title: 'Параллельный завоз',
    basePrice: 100,
    profile: 'volatile',
  },
  {
    id: 'neuroCover',
    title: 'Нейро-обложки',
    basePrice: 75,
    profile: 'hype',
  },
]

export const RAP_CAMPAIGNS = [
  {
    id: 'iceFlexer',
    title: 'Ледяной флексер',
    cost: 8_000,
    durationMs: 90_000,
    productionBoost: 0,
    clickBoost: 2,
    eventBoost: 0.1,
  },
  {
    id: 'sundayProphet',
    title: 'Воскресный пророк',
    cost: 15_000,
    durationMs: 180_000,
    productionBoost: 0.35,
    clickBoost: 0,
    eventBoost: 0.15,
  },
]

const emptyByIds = (items) => Object.fromEntries(items.map((item) => [item.id, 0]))

export const STARTING_STATE = {
  shishki: 0,
  manualClicks: 0,
  totalShishkiEarned: 0,
  lifetimeShishkiEarned: 0,
  heavenlyShishki: 0,
  totalHeavenlyShishkiEarned: 0,
  tarLumps: 0,
  tarLumpProgressMs: 0,
  rebirths: 0,
  quotaIndex: 0,
  currentRunShishki: 0,
  buildings: emptyByIds(BUILDINGS),
  buildingLevels: emptyByIds(BUILDINGS),
  upgrades: emptyByIds(RUN_UPGRADES),
  prestigeUpgrades: emptyByIds(PRESTIGE_UPGRADES),
  market: {
    unlocked: false,
    brokerLevel: 0,
    prices: Object.fromEntries(
      MARKET_GOODS.map((item) => [item.id, item.basePrice]),
    ),
    positions: emptyByIds(MARKET_GOODS),
    averageBuyPrice: emptyByIds(MARKET_GOODS),
  },
  activeEvent: null,
  activeCampaign: null,
  achievements: {},
}
