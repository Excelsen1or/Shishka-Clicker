export const QUOTA_RULES = {
  baseQuota: 1_000,
  quotaGrowth: 2,
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
    baseCost: 100,
    baseOutput: 1,
  },
  {
    id: 'greySorting',
    fieldCode: 'building_grey_sorting',
    title: 'Серая сортировка',
    baseCost: 1_100,
    baseOutput: 8,
  },
  {
    id: 'selfEmployedCrew',
    fieldCode: 'building_self_employed_crew',
    title: 'Бригада самозанятых',
    baseCost: 12_000,
    baseOutput: 47,
  },
  {
    id: 'resaleStall',
    fieldCode: 'building_resale_stall',
    title: 'Ларек перепродажи',
    baseCost: 130_000,
    baseOutput: 260,
  },
  {
    id: 'packingLine',
    fieldCode: 'building_packing_line',
    title: 'Линия фасовки',
    baseCost: 1_500_000,
    baseOutput: 1_500,
  },
  {
    id: 'nightWarehouse',
    fieldCode: 'building_night_warehouse',
    title: 'Ночной склад',
    baseCost: 12_000_000,
    baseOutput: 7_500,
  },
  {
    id: 'bunkerSortingHub',
    fieldCode: 'building_bunker_sorting_hub',
    title: 'Бункерный сортировочный узел',
    baseCost: 75_000_000,
    baseOutput: 40_000,
  },
  {
    id: 'logisticsDepot',
    fieldCode: 'building_logistics_depot',
    title: 'Логистический депо',
    baseCost: 420_000_000,
    baseOutput: 200_000,
  },
  {
    id: 'tarpCollective',
    fieldCode: 'building_tarp_collective',
    title: 'Бригада тентовиков',
    baseCost: 2_000_000_000,
    baseOutput: 1_000_000,
  },
  {
    id: 'routerBrokerage',
    fieldCode: 'building_router_brokerage',
    title: 'Маршрутизаторная брокерская',
    baseCost: 9_000_000_000,
    baseOutput: 4_500_000,
  },
  {
    id: 'railSideHub',
    fieldCode: 'building_rail_side_hub',
    title: 'Привокзальный хаб',
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
    title: 'Деривативный стол шишек',
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
    cost: 250,
    value: 0.2,
  },
  {
    id: 'cashbackBug',
    fieldCode: 'run_cashback_bug',
    title: 'Ошибочный кэшбэк',
    kind: 'clickMultiplier',
    cost: 600,
    value: 1,
  },
  {
    id: 'quietLogistics',
    fieldCode: 'run_quiet_logistics',
    title: 'Тихая логистика',
    kind: 'globalMultiplier',
    cost: 2_000,
    value: 0.45,
  },
  {
    id: 'grayTenderLoop',
    fieldCode: 'run_gray_tender_loop',
    title: 'Серый тендерный цикл',
    kind: 'globalMultiplier',
    cost: 7_500,
    value: 0.75,
  },
  {
    id: 'streetPromoBurst',
    fieldCode: 'run_street_promo_burst',
    title: 'Уличный промо-рывок',
    kind: 'clickMultiplier',
    cost: 9_500,
    value: 2,
  },
  {
    id: 'tarCacheMerge',
    fieldCode: 'run_tar_cache_merge',
    title: 'Слияние тар-кэша',
    kind: 'tarLumpMultiplier',
    cost: 18_000,
    value: 0.1,
  },
  {
    id: 'streetContractWave',
    fieldCode: 'run_street_contract_wave',
    title: 'Волна уличных контрактов',
    kind: 'globalMultiplier',
    cost: 40_000,
    value: 1.1,
  },
  {
    id: 'shadowCourierLine',
    fieldCode: 'run_shadow_courier_line',
    title: 'Теневая курьерская линия',
    kind: 'clickMultiplier',
    cost: 75_000,
    value: 3,
  },
]
validateUniqueFieldCodes(RUN_UPGRADES, 'run upgrade')

export const PRESTIGE_UPGRADES = [
  {
    id: 'heavenlyTar',
    fieldCode: 'prestige_heavenly_tar',
    title: 'Небесная смола',
    baseCost: 1,
    value: 0.15,
  },
  {
    id: 'taxBlindness',
    fieldCode: 'prestige_tax_blindness',
    title: 'Налоговая слепота',
    baseCost: 2,
    value: 0.01,
  },
  {
    id: 'coneLegacy',
    fieldCode: 'prestige_cone_legacy',
    title: 'Шишечное наследие',
    baseCost: 4,
    value: 0.02,
  },
  {
    id: 'shadowBrokerage',
    fieldCode: 'prestige_shadow_brokerage',
    title: 'Теневая брокерка',
    baseCost: 8,
    value: 0.03,
  },
  {
    id: 'logisticsIcon',
    fieldCode: 'prestige_logistics_icon',
    title: 'Икона логистики',
    baseCost: 15,
    value: 0.05,
  },
  {
    id: 'coneEmpire',
    fieldCode: 'prestige_cone_empire',
    title: 'Империя шишек',
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
    basePrice: 40,
    profile: 'stable',
  },
  {
    id: 'parallelImport',
    fieldCode: 'market_parallel_import',
    title: 'Параллельный завоз',
    basePrice: 100,
    profile: 'volatile',
  },
  {
    id: 'neuroCover',
    fieldCode: 'market_neuro_cover',
    title: 'Нейро-обложки',
    basePrice: 75,
    profile: 'hype',
  },
  {
    id: 'grayPackaging',
    fieldCode: 'market_gray_packaging',
    title: 'Серая упаковка',
    basePrice: 190,
    profile: 'stable',
  },
  {
    id: 'tarDrums',
    fieldCode: 'market_tar_drums',
    title: 'Таровые бочки',
    basePrice: 260,
    profile: 'volatile',
  },
  {
    id: 'railSlotTokens',
    fieldCode: 'market_rail_slot_tokens',
    title: 'Жетоны вагонных слотов',
    basePrice: 420,
    profile: 'hype',
  },
  {
    id: 'grayBrokerNotes',
    fieldCode: 'market_gray_broker_notes',
    title: 'Записки серого брокера',
    basePrice: 610,
    profile: 'stable',
  },
  {
    id: 'pineSealant',
    fieldCode: 'market_pine_sealant',
    title: 'Шишечный герметик',
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
    cost: 8_000,
    durationMs: 90_000,
    productionBoost: 0,
    clickBoost: 2,
    eventBoost: 0.1,
  },
  {
    id: 'sundayProphet',
    fieldCode: 'campaign_sunday_prophet',
    title: 'Воскресный пророк',
    cost: 15_000,
    durationMs: 180_000,
    productionBoost: 0.35,
    clickBoost: 0,
    eventBoost: 0.15,
  },
  {
    id: 'nightDistrict',
    fieldCode: 'campaign_night_district',
    title: 'Ночной район',
    cost: 30_000,
    durationMs: 180_000,
    productionBoost: 0.2,
    clickBoost: 1,
    eventBoost: 0.2,
  },
  {
    id: 'grayTour',
    fieldCode: 'campaign_gray_tour',
    title: 'Серый тур',
    cost: 60_000,
    durationMs: 240_000,
    productionBoost: 0.45,
    clickBoost: 0,
    eventBoost: 0.25,
  },
  {
    id: 'logisticsAnthem',
    fieldCode: 'campaign_logistics_anthem',
    title: 'Гимн логистики',
    cost: 120_000,
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
    durationMs: 180_000,
    productionBoost: -0.2,
    clickBoost: 0,
  },
  {
    id: 'districtHype',
    fieldCode: 'event_district_hype',
    title: 'Районный хайп',
    kind: 'positive',
    durationMs: 120_000,
    productionBoost: 0.15,
    clickBoost: 1,
  },
  {
    id: 'fieldAudit',
    fieldCode: 'event_field_audit',
    title: 'Полевой аудит',
    kind: 'mixed',
    durationMs: 210_000,
    productionBoost: -0.05,
    clickBoost: 2,
  },
  {
    id: 'routeOverflow',
    fieldCode: 'event_route_overflow',
    title: 'Перегрузка маршрутов',
    kind: 'negative',
    durationMs: 240_000,
    productionBoost: -0.1,
    clickBoost: -1,
  },
  {
    id: 'pineBloom',
    fieldCode: 'event_pine_bloom',
    title: 'Шишечное цветение',
    kind: 'positive',
    durationMs: 150_000,
    productionBoost: 0.25,
    clickBoost: 0,
  },
  {
    id: 'logisticsCongress',
    fieldCode: 'event_logistics_congress',
    title: 'Конгресс логистики',
    kind: 'positive',
    durationMs: 300_000,
    productionBoost: 0.35,
    clickBoost: 1,
  },
]
validateUniqueFieldCodes(EVENT_DEFINITIONS, 'event')

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
