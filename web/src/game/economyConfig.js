export const QUOTA_RULES = {
  baseQuota: 1_000_000,
  quotaGrowth: 2.85,
}

export const TAR_LUMP_RULES = {
  intervalMs: 14_400_000,
  maxBuildingLevel: 10,
}

function validateUniqueFieldCodes(items, label) {
  const seen = new Set()

  for (const item of items) {
    const fieldCode = item?.fieldCode

    if (typeof fieldCode !== 'string' || !fieldCode) {
      throw new TypeError(`Invalid ${label} fieldCode`)
    }

    if (seen.has(fieldCode)) {
      throw new RangeError(`Duplicate ${label} fieldCode: ${fieldCode}`)
    }

    seen.add(fieldCode)
  }
}

export const BUILDINGS = [
  {
    id: 'garagePicker',
    fieldCode: 'building_garage_picker',
    title: 'Сборщик шишек у гаражей',
    baseCost: 15,
    baseOutput: 0.1,
  },
  {
    id: 'pickupPoint',
    fieldCode: 'building_pickup_point',
    title: 'ПВЗ на окраине',
    baseCost: 75,
    baseOutput: 0.8,
  },
  {
    id: 'greySorting',
    fieldCode: 'building_grey_sorting',
    title: 'Серая сортировка',
    baseCost: 650,
    baseOutput: 6,
  },
  {
    id: 'selfEmployedCrew',
    fieldCode: 'building_self_employed_crew',
    title: 'Бригада самозанятых',
    baseCost: 4_200,
    baseOutput: 32,
  },
  {
    id: 'resaleStall',
    fieldCode: 'building_resale_stall',
    title: 'Ларёк перепродажи',
    baseCost: 28_000,
    baseOutput: 175,
  },
  {
    id: 'packingLine',
    fieldCode: 'building_packing_line',
    title: 'Смоляной цех',
    baseCost: 180_000,
    baseOutput: 900,
  },
  {
    id: 'nightWarehouse',
    fieldCode: 'building_night_warehouse',
    title: 'Подпольный фулфилмент',
    baseCost: 1_100_000,
    baseOutput: 5_200,
  },
  {
    id: 'bunkerSortingHub',
    fieldCode: 'building_bunker_sorting_hub',
    title: 'Фабрика карточек товара',
    baseCost: 75_000_000,
    baseOutput: 40_000,
  },
  {
    id: 'logisticsDepot',
    fieldCode: 'building_logistics_depot',
    title: 'Автопарк последней мили',
    baseCost: 420_000_000,
    baseOutput: 200_000,
  },
  {
    id: 'tarpCollective',
    fieldCode: 'building_tarp_collective',
    title: 'Храм оптимизации',
    baseCost: 2_000_000_000,
    baseOutput: 1_000_000,
  },
  {
    id: 'routerBrokerage',
    fieldCode: 'building_router_brokerage',
    title: 'Агентство инфошума',
    baseCost: 9_000_000_000,
    baseOutput: 4_500_000,
  },
  {
    id: 'railSideHub',
    fieldCode: 'building_rail_side_hub',
    title: 'Нейро-ферма контента',
    baseCost: 35_000_000_000,
    baseOutput: 18_000_000,
  },
  {
    id: 'greyImportExchange',
    fieldCode: 'building_grey_import_exchange',
    title: 'Биржа серого импорта',
    baseCost: 120_000_000_000,
    baseOutput: 65_000_000,
  },
  {
    id: 'coneDerivativeDesk',
    fieldCode: 'building_cone_derivative_desk',
    title: 'Кредитный конвейер',
    baseCost: 500_000_000_000,
    baseOutput: 260_000_000,
  },
  {
    id: 'ministryOfConeLogistics',
    fieldCode: 'building_ministry_of_cone_logistics',
    title: 'Министерство шишечной логистики',
    baseCost: 2_000_000_000_000,
    baseOutput: 1_100_000_000,
  },
]
validateUniqueFieldCodes(BUILDINGS, 'building')

export const RUN_UPGRADES = [
  {
    id: 'warehouseRhythm',
    fieldCode: 'run_warehouse_rhythm',
    title: 'Складской ритм',
    kind: 'globalMultiplier',
    cost: 400,
    value: 0.12,
  },
  {
    id: 'cashbackBug',
    fieldCode: 'run_cashback_bug',
    title: 'Ошибочный кэшбэк',
    kind: 'clickMultiplier',
    cost: 300,
    value: 1,
  },
  {
    id: 'doubleSwing',
    fieldCode: 'run_double_swing',
    title: 'Двойной замах',
    kind: 'clickMultiplier',
    cost: 700,
    value: 0.75,
  },
  {
    id: 'quietLogistics',
    fieldCode: 'run_quiet_logistics',
    title: 'Тихая логистика',
    kind: 'globalMultiplier',
    cost: 900,
    value: 0.35,
  },
  {
    id: 'bulkDeal',
    fieldCode: 'run_bulk_deal',
    title: 'Оптовая договорённость',
    kind: 'buildingDiscount',
    cost: 1_200,
    value: 0.03,
  },
  {
    id: 'brokenCounter',
    fieldCode: 'run_broken_counter',
    title: 'Сбитый счётчик',
    kind: 'clickMultiplier',
    cost: 2_400,
    value: 1.25,
  },
  {
    id: 'grayTenderLoop',
    fieldCode: 'run_gray_tender_loop',
    title: 'Серый тендерный цикл',
    kind: 'globalMultiplier',
    cost: 9_000,
    value: 0.22,
  },
  {
    id: 'warmBackground',
    fieldCode: 'run_warm_background',
    title: 'Тёплый фон',
    kind: 'eventPositiveChance',
    cost: 5_000,
    value: 0.08,
  },
  {
    id: 'warehouseConcession',
    fieldCode: 'run_warehouse_concession',
    title: 'Складская уступка',
    kind: 'buildingDiscount',
    cost: 6_500,
    value: 0.04,
  },
  {
    id: 'streetPromoBurst',
    fieldCode: 'run_street_promo_burst',
    title: 'Уличный промо-рывок',
    kind: 'clickMultiplier',
    cost: 4_200,
    value: 2,
  },
  {
    id: 'districtWarmup',
    fieldCode: 'run_district_warmup',
    title: 'Прогрев района',
    kind: 'campaignDiscount',
    cost: 12_000,
    value: 0.08,
  },
  {
    id: 'handTrained',
    fieldCode: 'run_hand_trained',
    title: 'Рука набита',
    kind: 'clickMultiplier',
    cost: 8_500,
    value: 2,
  },
  {
    id: 'quietDetour',
    fieldCode: 'run_quiet_detour',
    title: 'Тихий обход',
    kind: 'eventNegativeReduction',
    cost: 11_000,
    value: 0.1,
  },
  {
    id: 'tarCacheMerge',
    fieldCode: 'run_tar_cache_merge',
    title: 'Слияние тар-кэша',
    kind: 'tarLumpMultiplier',
    cost: 12_000,
    value: 0.1,
  },
  {
    id: 'nightSlotSale',
    fieldCode: 'run_night_slot_sale',
    title: 'Ночная распродажа мест',
    kind: 'upgradeDiscount',
    cost: 14_000,
    value: 0.05,
  },
  {
    id: 'feedOnStandby',
    fieldCode: 'run_feed_on_standby',
    title: 'Лента на подхвате',
    kind: 'eventDurationBoost',
    cost: 22_000,
    value: 0.15,
  },
  {
    id: 'mediaTail',
    fieldCode: 'run_media_tail',
    title: 'Медийный хвост',
    kind: 'campaignDurationBoost',
    cost: 26_000,
    value: 0.2,
  },
  {
    id: 'streetContractWave',
    fieldCode: 'run_street_contract_wave',
    title: 'Волна уличных контрактов',
    kind: 'globalMultiplier',
    cost: 45_000,
    value: 0.3,
  },
  {
    id: 'adOverdrive',
    fieldCode: 'run_ad_overdrive',
    title: 'Рекламный перегиб',
    kind: 'campaignEffectBoost',
    cost: 55_000,
    value: 0.12,
  },
  {
    id: 'shadowCourierLine',
    fieldCode: 'run_shadow_courier_line',
    title: 'Теневая курьерская линия',
    kind: 'clickMultiplier',
    cost: 36_000,
    value: 2.5,
  },
]
validateUniqueFieldCodes(RUN_UPGRADES, 'run upgrade')

export const PRESTIGE_UPGRADES = [
  {
    id: 'heavenlyTar',
    fieldCode: 'prestige_heavenly_tar',
    title: 'Смола нового старта',
    description:
      'Дает запас шишек после перерождения, чтобы новая жизнь не начиналась с нуля.',
    effectText: '+15% к пассивной добыче и +20 стартовых шишек за уровень.',
    baseCost: 1,
    value: 0.15,
  },
  {
    id: 'taxBlindness',
    fieldCode: 'prestige_tax_blindness',
    title: 'Серый налоговый щит',
    description:
      'Снижает комиссию рынка. Полезно, если часто покупаешь и продаешь товары.',
    effectText: '-1% к рыночной комиссии за уровень.',
    baseCost: 2,
    value: 0.01,
  },
  {
    id: 'coneLegacy',
    fieldCode: 'prestige_cone_legacy',
    title: 'Наследство первой квоты',
    description:
      'Упрощает следующие квоты и добавляет стартовые шишки после перерождения.',
    effectText: '-2% к цели квоты и +30 стартовых шишек за уровень.',
    baseCost: 4,
    value: 0.02,
  },
  {
    id: 'shadowBrokerage',
    fieldCode: 'prestige_shadow_brokerage',
    title: 'Теневой брокерский стол',
    description:
      'Усиливает торговлю: меньше потерь на комиссиях и выше потенциал рынка.',
    effectText: '-3% к рыночной комиссии за уровень.',
    baseCost: 8,
    value: 0.03,
  },
  {
    id: 'logisticsIcon',
    fieldCode: 'prestige_logistics_icon',
    title: 'Логистический культ',
    description:
      'Ускоряет производство и усиливает доставку после каждого перерождения.',
    effectText: '+5% к пассивной добыче и +15% к доставке за уровень.',
    baseCost: 15,
    value: 0.05,
  },
  {
    id: 'coneEmpire',
    fieldCode: 'prestige_cone_empire',
    title: 'Шишечная монополия',
    description:
      'Большой поздний буст для кликов и пассивной добычи, когда экономика уже разогнана.',
    effectText: '+8% к пассивной добыче и +10% к клику за уровень.',
    baseCost: 30,
    value: 0.08,
  },
]
validateUniqueFieldCodes(PRESTIGE_UPGRADES, 'prestige upgrade')

export const MARKET_GOODS = [
  {
    id: 'pickupPointLeftovers',
    fieldCode: 'market_pickup_point_leftovers',
    title: 'Остатки с ПВЗ',
    basePrice: 24,
    profile: 'stable',
  },
  {
    id: 'parallelImport',
    fieldCode: 'market_parallel_import',
    title: 'Параллельный завоз',
    basePrice: 55,
    profile: 'volatile',
  },
  {
    id: 'neuroCover',
    fieldCode: 'market_neuro_cover',
    title: 'Нейро-обложки',
    basePrice: 70,
    profile: 'hype',
  },
  {
    id: 'grayPackaging',
    fieldCode: 'market_gray_packaging',
    title: 'Паль',
    basePrice: 48,
    profile: 'volatile',
  },
  {
    id: 'cashbackCoupons',
    fieldCode: 'market_cashback_coupons',
    title: 'Кэшбэк-купоны',
    basePrice: 62,
    profile: 'hype',
  },
  {
    id: 'returnLot',
    fieldCode: 'market_return_lot',
    title: 'Возвратный товар',
    basePrice: 84,
    profile: 'stable',
  },
  {
    id: 'tarDrums',
    fieldCode: 'market_tar_drums',
    title: 'Дефицитные коробки',
    basePrice: 160,
    profile: 'volatile',
  },
  {
    id: 'railSlotTokens',
    fieldCode: 'market_rail_slot_tokens',
    title: 'Курьерские слоты',
    basePrice: 280,
    profile: 'hype',
  },
  {
    id: 'grayBrokerNotes',
    fieldCode: 'market_gray_broker_notes',
    title: 'Инфокурс по маркетплейсам',
    basePrice: 610,
    profile: 'hype',
  },
  {
    id: 'pineSealant',
    fieldCode: 'market_pine_sealant',
    title: 'Серые расходники',
    basePrice: 880,
    profile: 'volatile',
  },
]
validateUniqueFieldCodes(MARKET_GOODS, 'market good')

export const RAP_CAMPAIGNS = [
  {
    id: 'iceFlexer',
    fieldCode: 'campaign_ice_flexer',
    title: 'Ледяной флексер',
    cost: 2_500,
    durationMs: 90_000,
    productionBoost: 0,
    clickBoost: 2,
    eventBoost: 0.1,
  },
  {
    id: 'sundayProphet',
    fieldCode: 'campaign_sunday_prophet',
    title: 'Воскресный пророк',
    cost: 7_500,
    durationMs: 180_000,
    productionBoost: 0.35,
    clickBoost: 0,
    eventBoost: 0.15,
  },
  {
    id: 'nightDistrict',
    fieldCode: 'campaign_night_district',
    title: 'Ночной район',
    cost: 18_000,
    durationMs: 180_000,
    productionBoost: 0.2,
    clickBoost: 1,
    eventBoost: 0.2,
  },
  {
    id: 'grayTour',
    fieldCode: 'campaign_gray_tour',
    title: 'Серый тур',
    cost: 42_000,
    durationMs: 240_000,
    productionBoost: 0.45,
    clickBoost: 0,
    eventBoost: 0.25,
  },
  {
    id: 'logisticsAnthem',
    fieldCode: 'campaign_logistics_anthem',
    title: 'Гимн логистики',
    cost: 90_000,
    durationMs: 300_000,
    productionBoost: 0.65,
    clickBoost: 1,
    eventBoost: 0.35,
  },
]
validateUniqueFieldCodes(RAP_CAMPAIGNS, 'rap campaign')

export const EVENT_DEFINITIONS = [
  {
    id: 'tarStorm',
    fieldCode: 'event_tar_storm',
    title: 'Таровая буря',
    kind: 'negative',
    rarity: 'common',
    durationMs: 180_000,
    productionBoost: -0.2,
    clickBoost: 0,
  },
  {
    id: 'districtHype',
    fieldCode: 'event_district_hype',
    title: 'Районный хайп',
    kind: 'positive',
    rarity: 'common',
    durationMs: 120_000,
    productionBoost: 0.15,
    clickBoost: 1,
  },
  {
    id: 'fieldAudit',
    fieldCode: 'event_field_audit',
    title: 'Полевой аудит',
    kind: 'mixed',
    rarity: 'common',
    durationMs: 210_000,
    productionBoost: -0.05,
    clickBoost: 2,
    purchaseDiscount: 0.25,
  },
  {
    id: 'routeOverflow',
    fieldCode: 'event_route_overflow',
    title: 'Перегрузка маршрутов',
    kind: 'negative',
    rarity: 'common',
    durationMs: 240_000,
    productionBoost: -0.1,
    clickBoost: -1,
  },
  {
    id: 'pineBloom',
    fieldCode: 'event_pine_bloom',
    title: 'Шишечное цветение',
    kind: 'positive',
    rarity: 'common',
    durationMs: 150_000,
    productionBoost: 0.25,
    clickBoost: 0,
  },
  {
    id: 'logisticsCongress',
    fieldCode: 'event_logistics_congress',
    title: 'Конгресс логистики',
    kind: 'positive',
    rarity: 'rare',
    durationMs: 300_000,
    productionBoost: 0.35,
    clickBoost: 1,
  },
  {
    id: 'cashbackGlitchChain',
    fieldCode: 'event_cashback_glitch_chain',
    title: 'Кэшбэк-глитч',
    kind: 'chain',
    rarity: 'rare',
    durationMs: 45_000,
    productionBoost: 0,
    clickBoost: 1,
    chainGoal: 7,
    chainRewardShishki: 600,
  },
]
validateUniqueFieldCodes(EVENT_DEFINITIONS, 'event')

const emptyByIds = (items) =>
  Object.fromEntries(items.map((item) => [item.id, 0]))

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
