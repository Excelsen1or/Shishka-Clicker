import { startTransition } from 'react'
import { computed, makeAutoObservable, runInAction } from 'mobx'
import {
  BUILDINGS,
  EVENT_DEFINITIONS,
  PRESTIGE_UPGRADES,
  RUN_UPGRADES,
  TAR_LUMP_RULES,
} from '../game/economyConfig.js'
import {
  advanceMarketPrices,
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  getBuildingById,
  getBuildingPurchaseCost,
  getCampaignById,
  getCampaignLaunchCost,
  getCampaignWindow,
  getEventSpawnChance,
  getEventPresentation,
  getEventRewardMultiplier,
  getEventWindow,
  rollEventDefinition,
  resolveQuotaClosures,
  getRunUpgradePurchaseCost,
} from '../game/economyMath.js'
import { getEventVisual } from '../game/marketEventVisuals.js'
import { buildDiscordPresenceSource } from '../lib/discordPresence.js'
import {
  getPrestigeUpgradeCost,
  getPrestigeStartBonus,
  getQuotaPreview,
} from '../game/metaConfig.js'
import {
  buildDevConsoleResources,
  buildClickerFieldData,
  buildEconomySnapshot,
} from './gameStoreSnapshots.js'
import { createFreshState, mergeState } from './gameStoreState.js'

const ACTIVE_TICK_MS = 250
const IDLE_TICK_MS = 1000
const DEV_RESOURCE_KEYS = ['shishki', 'heavenlyShishki', 'tarLumps']
const SHISHKI_PRECISION = 3

function roundShishkiValue(value) {
  return Number(value.toFixed(SHISHKI_PRECISION))
}

function resolveQuotaState(state) {
  return {
    ...state,
    ...resolveQuotaClosures({
      quotaIndex: state.quotaIndex,
      currentRunShishki: state.currentRunShishki,
      heavenlyShishki: state.heavenlyShishki,
      totalHeavenlyShishkiEarned: state.totalHeavenlyShishkiEarned,
    }),
  }
}

function gainShishki(state, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return state
  }

  return resolveQuotaState({
    ...state,
    shishki: roundShishkiValue(state.shishki + amount),
    totalShishkiEarned: roundShishkiValue(state.totalShishkiEarned + amount),
    lifetimeShishkiEarned: roundShishkiValue(
      state.lifetimeShishkiEarned + amount,
    ),
    currentRunShishki: roundShishkiValue(state.currentRunShishki + amount),
  })
}

function gainQuotaCredit(state, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return state
  }

  return resolveQuotaState({
    ...state,
    totalShishkiEarned: roundShishkiValue(state.totalShishkiEarned + amount),
    lifetimeShishkiEarned: roundShishkiValue(
      state.lifetimeShishkiEarned + amount,
    ),
    currentRunShishki: roundShishkiValue(state.currentRunShishki + amount),
  })
}

function clearExpiredCampaign(state, now = Date.now()) {
  if (!state.activeCampaign?.endsAt || state.activeCampaign.endsAt > now) {
    return state
  }

  return {
    ...state,
    activeCampaign: null,
  }
}

function clearExpiredEvent(state, now = Date.now()) {
  if (!state.activeEvent?.endsAt || state.activeEvent.endsAt > now) {
    return state
  }

  return {
    ...state,
    activeEvent: null,
  }
}

function getUiExpirationAt(state) {
  const campaignEndsAt = Number(state?.activeCampaign?.endsAt ?? 0)
  const eventEndsAt = Number(state?.activeEvent?.endsAt ?? 0)
  const candidates = [campaignEndsAt, eventEndsAt].filter(
    (value) => Number.isFinite(value) && value > 0,
  )

  if (!candidates.length) {
    return 0
  }

  return Math.min(...candidates)
}

function getEventMarketPayload(eventId) {
  switch (eventId) {
    case 'districtHype':
      return { marketBoostGoodId: 'neuroCover', marketBoost: 0.08 }
    case 'logisticsCongress':
      return { marketBoostGoodId: 'parallelImport', marketBoost: 0.06 }
    case 'tarStorm':
      return { marketBoostGoodId: 'tarDrums', marketBoost: 0.12 }
    default:
      return { marketBoostGoodId: null, marketBoost: 0 }
  }
}

function spawnTimedEvent(
  state,
  seconds,
  now = Date.now(),
  random = Math.random,
) {
  const clearedState = clearExpiredEvent(state, now)

  if (clearedState.activeEvent || !clearedState.market?.unlocked) {
    return clearedState
  }

  const eventChance = Math.min(0.35, getEventSpawnChance(clearedState, seconds))

  if (random() >= eventChance) {
    return clearedState
  }

  const definition = rollEventDefinition(random, clearedState)
  const baseReward =
    definition.kind === 'positive'
      ? 90
      : definition.kind === 'mixed'
        ? 45
        : definition.kind === 'chain'
          ? 60
          : 0
  const rewardMultiplier = getEventRewardMultiplier(clearedState)

  return gainShishki(
    {
      ...clearedState,
      activeEvent: {
        ...getEventWindow(clearedState, definition, now),
        ...getEventMarketPayload(definition.id),
        chainStep: definition.kind === 'chain' ? 0 : undefined,
        rewardShishki: Math.round(baseReward * rewardMultiplier),
      },
    },
    Math.round(baseReward * rewardMultiplier),
  )
}

function resolveUiState(state) {
  return clearExpiredEvent(clearExpiredCampaign(state))
}

function getBuildingLevelCost(level) {
  if (level >= TAR_LUMP_RULES.maxBuildingLevel) {
    return null
  }

  if (level >= 5) {
    return 2
  }

  return 1
}

function buildEventToastPayload(event) {
  if (!event?.id) {
    return null
  }

  return {
    id: event.id,
    toastId: `${event.id}-${event.endsAt ?? Date.now()}`,
    title: event.title,
    description: getEventPresentation(event.id),
    rarity: event.rarity ?? 'common',
    kind: event.kind ?? 'positive',
  }
}

function arePlainObjectsShallowEqual(left, right) {
  if (left === right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false
    }
  }

  return true
}

function areFieldItemsEqual(left, right) {
  return (
    left?.id === right?.id &&
    left?.title === right?.title &&
    left?.code === right?.code &&
    left?.type === right?.type &&
    left?.state === right?.state &&
    left?.count === right?.count &&
    left?.unlocked === right?.unlocked
  )
}

function reuseFieldItemArray(previousItems, nextItems) {
  if (
    !Array.isArray(previousItems) ||
    previousItems.length !== nextItems.length
  ) {
    return nextItems
  }

  let changed = false
  const mergedItems = nextItems.map((nextItem, index) => {
    const previousItem = previousItems[index]
    if (areFieldItemsEqual(previousItem, nextItem)) {
      return previousItem
    }

    changed = true
    return nextItem
  })

  return changed ? mergedItems : previousItems
}

function reusePlainObject(previousValue, nextValue) {
  return arePlainObjectsShallowEqual(previousValue, nextValue)
    ? previousValue
    : nextValue
}

function reuseClickerFieldData(previousValue, nextValue) {
  if (!previousValue) {
    return nextValue
  }

  const buildingsFieldItems = reuseFieldItemArray(
    previousValue.buildingsFieldItems,
    nextValue.buildingsFieldItems,
  )
  const marketFieldItems = reuseFieldItemArray(
    previousValue.marketFieldItems,
    nextValue.marketFieldItems,
  )
  const upgradesFieldItems = reuseFieldItemArray(
    previousValue.upgradesFieldItems,
    nextValue.upgradesFieldItems,
  )
  const metaFieldItems = reuseFieldItemArray(
    previousValue.metaFieldItems,
    nextValue.metaFieldItems,
  )
  const summary = reusePlainObject(previousValue.summary, nextValue.summary)
  const deckLocks = {
    buildings: reusePlainObject(
      previousValue.deckLocks?.buildings,
      nextValue.deckLocks.buildings,
    ),
    market: reusePlainObject(
      previousValue.deckLocks?.market,
      nextValue.deckLocks.market,
    ),
    upgrades: reusePlainObject(
      previousValue.deckLocks?.upgrades,
      nextValue.deckLocks.upgrades,
    ),
    meta: reusePlainObject(
      previousValue.deckLocks?.meta,
      nextValue.deckLocks.meta,
    ),
  }

  if (
    buildingsFieldItems === previousValue.buildingsFieldItems &&
    marketFieldItems === previousValue.marketFieldItems &&
    upgradesFieldItems === previousValue.upgradesFieldItems &&
    metaFieldItems === previousValue.metaFieldItems &&
    summary === previousValue.summary &&
    deckLocks.buildings === previousValue.deckLocks?.buildings &&
    deckLocks.market === previousValue.deckLocks?.market &&
    deckLocks.upgrades === previousValue.deckLocks?.upgrades &&
    deckLocks.meta === previousValue.deckLocks?.meta
  ) {
    return previousValue
  }

  return {
    ...nextValue,
    buildingsFieldItems,
    marketFieldItems,
    upgradesFieldItems,
    metaFieldItems,
    summary,
    deckLocks,
  }
}

export default class GameStore {
  rootStore
  _state = createFreshState()
  uiSnapshotState = this._state
  achievementQueue = []
  eventToastQueue = []
  tickTimeoutId = null
  initialized = false
  lastTickAt = 0
  clientRevision = 0
  lastMutationAt = null
  derivedCache = { state: null, value: null }
  uiResolvedCache = { state: null, value: null, expiresAt: 0 }
  uiDerivedCache = { state: null, value: null }
  economyCache = { state: null, derived: null, value: null }
  uiEconomyCache = { state: null, derived: null, value: null }
  clickerFieldCache = { state: null, value: null }
  devResourcesCache = { state: null, value: null }
  uiPrestigeCache = { state: null, value: null }
  statsBarCache = { state: null, derived: null, value: null }
  bottomNavAlertsCache = { value: null }
  discordPresenceSourceCache = { state: null, derived: null, value: null }

  constructor(rootStore) {
    this.rootStore = rootStore

    makeAutoObservable(
      this,
      {
        rootStore: false,
        tickTimeoutId: false,
        initialized: false,
        lastTickAt: false,
        derivedCache: false,
        uiResolvedCache: false,
        uiDerivedCache: false,
        economyCache: false,
        uiEconomyCache: false,
        clickerFieldCache: false,
        devResourcesCache: false,
        uiPrestigeCache: false,
        statsBarCache: false,
        bottomNavAlertsCache: false,
        discordPresenceSourceCache: false,
        achievementQueue: false,
        state: computed.struct,
        uiState: computed.struct,
        economy: computed.struct,
        uiEconomy: computed.struct,
        statsBarData: computed.struct,
        bottomNavAlerts: computed.struct,
        clickerMetrics: computed.struct,
        clickerFieldData: computed.struct,
        discordPresenceSource: computed.struct,
        devConsoleResources: computed.struct,
      },
      { autoBind: true },
    )

    this.start()
  }

  getDerivedForState(state) {
    if (this.derivedCache.state === state && this.derivedCache.value) {
      return this.derivedCache.value
    }

    const value = deriveProduction(state)
    this.derivedCache = { state, value }
    return value
  }

  getResolvedUiState() {
    const currentState = this.uiSnapshotState
    const now = Date.now()

    if (
      this.uiResolvedCache.state === currentState &&
      this.uiResolvedCache.value &&
      (this.uiResolvedCache.expiresAt <= 0 ||
        now < this.uiResolvedCache.expiresAt)
    ) {
      return this.uiResolvedCache.value
    }

    const value = resolveUiState(currentState)
    this.uiResolvedCache = {
      state: currentState,
      value,
      expiresAt: getUiExpirationAt(value),
    }
    return value
  }

  getUiDerivedForState(state) {
    if (this.uiDerivedCache.state === state && this.uiDerivedCache.value) {
      return this.uiDerivedCache.value
    }

    const value = deriveProduction(state)
    this.uiDerivedCache = { state, value }
    return value
  }

  get derived() {
    return this.getDerivedForState(this._state)
  }

  get uiDerived() {
    return this.getUiDerivedForState(this.getResolvedUiState())
  }

  get state() {
    return {
      ...this._state,
      ...this.derived,
    }
  }

  get uiState() {
    return {
      ...this.getResolvedUiState(),
      ...this.uiDerived,
    }
  }

  get prestige() {
    const quota = getQuotaPreview(this._state)

    return {
      currentRunShishki: this._state.currentRunShishki,
      currentQuotaTarget: quota.current,
      nextQuotaTarget: quota.next,
      quotaIndex: this._state.quotaIndex,
      heavenlyShishki: this._state.heavenlyShishki,
      rebirths: this._state.rebirths,
      tarLumps: this._state.tarLumps,
    }
  }

  get uiPrestige() {
    const resolvedState = this.getResolvedUiState()
    if (
      this.uiPrestigeCache.state === resolvedState &&
      this.uiPrestigeCache.value
    ) {
      return this.uiPrestigeCache.value
    }

    const quota = getQuotaPreview(resolvedState)

    const value = {
      currentRunShishki: resolvedState.currentRunShishki,
      currentQuotaTarget: quota.current,
      nextQuotaTarget: quota.next,
      quotaIndex: resolvedState.quotaIndex,
      heavenlyShishki: resolvedState.heavenlyShishki,
      rebirths: resolvedState.rebirths,
      tarLumps: resolvedState.tarLumps,
    }
    this.uiPrestigeCache = { state: resolvedState, value }
    return value
  }

  get economy() {
    if (
      this.economyCache.state === this._state &&
      this.economyCache.derived === this.derived &&
      this.economyCache.value
    ) {
      return this.economyCache.value
    }

    const value = buildEconomySnapshot(this._state, this.derived)
    this.economyCache = { state: this._state, derived: this.derived, value }
    return value
  }

  get uiEconomy() {
    if (
      this.uiEconomyCache.state === this.uiSnapshotState &&
      this.uiEconomyCache.derived === this.uiDerived &&
      this.uiEconomyCache.value
    ) {
      return this.uiEconomyCache.value
    }

    const value = buildEconomySnapshot(this.uiSnapshotState, this.uiDerived)
    this.uiEconomyCache = {
      state: this.uiSnapshotState,
      derived: this.uiDerived,
      value,
    }
    return value
  }

  get statsBarData() {
    const uiState = this.getResolvedUiState()
    const uiDerived = this.uiDerived
    if (
      this.statsBarCache.state === uiState &&
      this.statsBarCache.derived === uiDerived &&
      this.statsBarCache.value
    ) {
      return this.statsBarCache.value
    }

    const activeEvent = uiState.activeEvent ?? null
    const eventVisual = getEventVisual(activeEvent)
    const eventDescription = activeEvent
      ? getEventPresentation(activeEvent.id)
      : 'Спокойный рынок без всплесков.'

    const value = [
      {
        icon: 'cone',
        label: 'Шишки',
        value: uiState.shishki,
        hint: `+${uiDerived.shishkiPerSecond}/сек`,
      },
      {
        icon: 'rebirth',
        label: 'Небесные',
        value: uiState.heavenlyShishki,
        hint: 'за всё время',
      },
      {
        icon: 'knowledge',
        label: 'Комочки',
        value: uiState.tarLumps,
        hint: 'редкий ресурс',
      },
      {
        icon: 'power',
        label: 'Клик',
        value: uiDerived.clickPower,
        hint: `${uiState.manualClicks} кликов`,
      },
      {
        label: 'Ивент',
        value: eventVisual.title,
        hint: eventDescription,
        pixelIcon: eventVisual.icon,
        className:
          `stat-card--market-event stat-card--market-event--${eventVisual.tone}`.trim(),
      },
    ]
    this.statsBarCache = {
      state: uiState,
      derived: uiDerived,
      value,
    }
    return value
  }

  get bottomNavAlerts() {
    if (this.bottomNavAlertsCache.value) {
      return this.bottomNavAlertsCache.value
    }

    const value = {
      purchases: { count: 0, hasReady: false },
      market: { count: 0, hasReady: false },
      meta: { count: 0, hasReady: false },
      settings: { count: 0, hasReady: false },
      clicker: { count: 0, hasReady: false },
    }
    this.bottomNavAlertsCache = { value }
    return value
  }

  get clickerMetrics() {
    return {
      clickPowerText: String(this.state.clickPower),
    }
  }

  get clickerFieldData() {
    const resolvedState =
      typeof this.getResolvedUiState === 'function'
        ? this.getResolvedUiState()
        : resolveUiState(this.uiSnapshotState)
    const cache = this.clickerFieldCache ?? { state: null, value: null }
    if (cache.state === resolvedState && cache.value) {
      return cache.value
    }

    const nextValue = buildClickerFieldData(resolvedState)
    const value = reuseClickerFieldData(cache.value, nextValue)
    if (this.clickerFieldCache) {
      this.clickerFieldCache = { state: resolvedState, value }
    }
    return value
  }

  get discordPresenceSource() {
    const previousValue = this.discordPresenceSourceCache.value
    if (
      this.discordPresenceSourceCache.state === this._state &&
      this.discordPresenceSourceCache.derived === this.derived &&
      previousValue
    ) {
      return previousValue
    }

    const nextValue = buildDiscordPresenceSource({
      gameState: this._state,
      economy: this.derived,
    })
    const value = arePlainObjectsShallowEqual(previousValue, nextValue)
      ? previousValue
      : nextValue
    this.discordPresenceSourceCache = {
      state: this._state,
      derived: this.derived,
      value,
    }
    return value
  }

  get devConsoleResources() {
    if (
      this.devResourcesCache.state === this._state &&
      this.devResourcesCache.value
    ) {
      return this.devResourcesCache.value
    }

    const value = buildDevConsoleResources(this._state)
    this.devResourcesCache = { state: this._state, value }
    return value
  }

  start() {
    if (this.initialized || typeof window === 'undefined') {
      return
    }

    this.initialized = true
    this.lastTickAt = performance.now()
    this.tickTimeoutId = window.setTimeout(this.tickStep, ACTIVE_TICK_MS)
  }

  markStateChanged(updatedAt = new Date().toISOString()) {
    this.clientRevision += 1
    this.lastMutationAt = updatedAt
  }

  commitState(nextState) {
    this._state = nextState
    this.uiSnapshotState = nextState
    this.markStateChanged()
  }

  replaceState(nextState, { markDirty = false, updatedAt = null } = {}) {
    this._state = nextState
    this.uiSnapshotState = nextState

    if (markDirty) {
      this.markStateChanged(updatedAt ?? new Date().toISOString())
      return
    }

    this.lastMutationAt =
      updatedAt ?? this.lastMutationAt ?? new Date().toISOString()
  }

  applyPassiveIncome(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return
    }

    startTransition(() => {
      runInAction(() => {
        let nextState = clearExpiredEvent(clearExpiredCampaign(this._state))
        const previousEventId = nextState.activeEvent?.id ?? null
        nextState = spawnTimedEvent(nextState, seconds)
        if (!previousEventId && nextState.activeEvent?.id) {
          const eventToast = buildEventToastPayload(nextState.activeEvent)
          if (eventToast) {
            this.eventToastQueue = [...this.eventToastQueue, eventToast]
          }
        }
        nextState = accrueTarLumps(nextState, seconds * 1000)
        nextState = advanceMarketPrices(nextState)
        nextState = gainShishki(
          nextState,
          deriveProduction(nextState).shishkiPerSecond * seconds,
        )
        this.commitState(nextState)
      })
    })
  }

  tickStep() {
    const now = performance.now()
    const seconds = Math.min(2.5, (now - this.lastTickAt) / 1000)
    this.lastTickAt = now
    this.applyPassiveIncome(seconds)

    if (typeof window !== 'undefined') {
      this.tickTimeoutId = window.setTimeout(
        this.tickStep,
        document.visibilityState === 'hidden' ? IDLE_TICK_MS : ACTIVE_TICK_MS,
      )
    }
  }

  getSaveMeta() {
    return {
      clientRevision: this.clientRevision,
      updatedAt: this.lastMutationAt,
    }
  }

  mineShishki() {
    const clickValue = Math.max(0.1, this.derived.clickPower)
    let nextState = {
      ...clearExpiredEvent(clearExpiredCampaign(this._state)),
      manualClicks: this._state.manualClicks + 1,
    }

    if (nextState.activeEvent?.kind === 'chain') {
      const nextStep = (nextState.activeEvent.chainStep ?? 0) + 1
      const chainGoal = nextState.activeEvent.chainGoal ?? 0

      if (nextStep >= chainGoal) {
        nextState = gainShishki(
          {
            ...nextState,
            activeEvent: null,
          },
          nextState.activeEvent.chainRewardShishki ??
            nextState.activeEvent.rewardShishki ??
            0,
        )
      } else {
        nextState = {
          ...nextState,
          activeEvent: {
            ...nextState.activeEvent,
            chainStep: nextStep,
          },
        }
      }
    }

    nextState = gainShishki(nextState, clickValue)

    this.commitState(nextState)

    return {
      amount: clickValue,
      particleCount: Math.max(1, Math.round(clickValue)),
      symbols: ['🌰', '✨'],
    }
  }

  buyBuilding(id) {
    const snapshot = buildEconomySnapshot(this._state, this.derived)
    const buildingCard = snapshot.buildings.find((item) => item.id === id)
    const building = BUILDINGS.find((item) => item.id === id)
    if (!building) {
      return
    }
    if (!buildingCard?.unlocked) {
      return
    }

    const owned = this._state.buildings[id] ?? 0
    const cost = getBuildingPurchaseCost(this._state, building, owned)
    if (this._state.shishki < cost) {
      return
    }

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - cost,
      buildings: {
        ...this._state.buildings,
        [id]: owned + 1,
      },
      market: {
        ...this._state.market,
        unlocked:
          this._state.market.unlocked ||
          (id === 'resaleStall' && owned + 1 > 0),
      },
    })
  }

  buySubscription(id) {
    this.buyBuilding(id)
  }

  buyUpgrade(id) {
    const snapshot = buildEconomySnapshot(this._state, this.derived)
    const upgradeCard = snapshot.upgrades.find((item) => item.id === id)
    const upgrade = RUN_UPGRADES.find((item) => item.id === id)
    const level = this._state.upgrades[id] ?? 0
    const cost = upgrade
      ? getRunUpgradePurchaseCost(this._state, upgrade, level)
      : null

    if (!upgrade || !upgradeCard?.unlocked || this._state.shishki < cost) {
      return
    }

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - cost,
      upgrades: {
        ...this._state.upgrades,
        [id]: (this._state.upgrades[id] ?? 0) + 1,
      },
    })
  }

  buyPrestigeUpgrade(id) {
    const item = PRESTIGE_UPGRADES.find((entry) => entry.id === id)
    if (!item) {
      return
    }

    if (this._state.rebirths < 1) {
      return
    }

    const level = this._state.prestigeUpgrades[id] ?? 0
    const cost = getPrestigeUpgradeCost(item, level)
    if (this._state.heavenlyShishki < cost) {
      return
    }

    this.commitState({
      ...this._state,
      heavenlyShishki: this._state.heavenlyShishki - cost,
      prestigeUpgrades: {
        ...this._state.prestigeUpgrades,
        [id]: level + 1,
      },
    })
  }

  upgradeBuildingLevel(id) {
    const building = getBuildingById(id)
    if (!building) {
      return false
    }

    const currentLevel = this._state.buildingLevels[id] ?? 0
    const cost = getBuildingLevelCost(currentLevel)

    if (cost === null || this._state.tarLumps < cost) {
      return false
    }

    this.commitState({
      ...this._state,
      tarLumps: this._state.tarLumps - cost,
      buildingLevels: {
        ...this._state.buildingLevels,
        [id]: currentLevel + 1,
      },
    })

    return true
  }

  buyMarketGood(goodId, quantity = 1) {
    if (!this._state.market.unlocked) {
      return
    }
    const snapshot = buildEconomySnapshot(this._state, this.derived)
    const goodCard = snapshot.marketGoods.find((item) => item.id === goodId)
    if (!goodCard?.unlocked) {
      return
    }

    const trade = applyMarketTrade({
      state: this._state,
      goodId,
      quantity,
      side: 'buy',
    })

    this.commitState(trade.nextState)
  }

  sellMarketGood(goodId, quantity = 1) {
    if (!this._state.market.unlocked) {
      return
    }
    const snapshot = buildEconomySnapshot(this._state, this.derived)
    const goodCard = snapshot.marketGoods.find((item) => item.id === goodId)
    if (!goodCard?.unlocked) {
      return
    }

    const trade = applyMarketTrade({
      state: this._state,
      goodId,
      quantity,
      side: 'sell',
    })

    this.commitState(gainQuotaCredit(trade.nextState, trade.realizedProfit))
  }

  activateCampaign(campaignId) {
    if (!this._state.market.unlocked) {
      return
    }
    const snapshot = buildEconomySnapshot(this._state, this.derived)
    const campaignCard = snapshot.campaigns.find(
      (item) => item.id === campaignId,
    )

    const campaign = getCampaignById(campaignId)
    const launchCost = campaign
      ? getCampaignLaunchCost(this._state, campaign)
      : null

    if (
      !campaign ||
      !campaignCard?.unlocked ||
      this._state.shishki < launchCost
    ) {
      return
    }

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - launchCost,
      activeCampaign: {
        ...getCampaignWindow(this._state, campaign, Date.now()),
        label: getEventPresentation(campaignId),
        launchCost,
      },
    })
  }

  prestigeReset() {
    const quota = getQuotaPreview(this._state)
    const hasPrestigeProgress =
      this._state.quotaIndex > 0 ||
      this._state.currentRunShishki >= quota.current

    if (!hasPrestigeProgress) {
      return false
    }

    const nextState = createFreshState()
    const startBonus = getPrestigeStartBonus(this._state)

    this.commitState({
      ...nextState,
      shishki: startBonus,
      heavenlyShishki: this._state.heavenlyShishki,
      totalHeavenlyShishkiEarned: this._state.totalHeavenlyShishkiEarned,
      tarLumps: this._state.tarLumps,
      tarLumpProgressMs: this._state.tarLumpProgressMs,
      buildingLevels: { ...this._state.buildingLevels },
      prestigeUpgrades: { ...this._state.prestigeUpgrades },
      achievements: { ...this._state.achievements },
      rebirths: this._state.rebirths + 1,
      manualClicks: this._state.manualClicks,
      lifetimeShishkiEarned: this._state.lifetimeShishkiEarned,
    })

    return true
  }

  resetGame() {
    this.replaceState(createFreshState(), { markDirty: true })
  }

  exportGameSave() {
    return JSON.parse(JSON.stringify(this._state))
  }

  importGameSave(saveData, options = {}) {
    this.replaceState(mergeState(saveData), options)
  }

  dismissAchievement() {
    this.achievementQueue = this.achievementQueue.slice(1)
  }

  dismissEventToast() {
    this.eventToastQueue = this.eventToastQueue.slice(1)
  }

  _devGiveResource(key, amount) {
    if (!DEV_RESOURCE_KEYS.includes(key) || !Number.isFinite(amount)) {
      return
    }

    this.commitState({
      ...this._state,
      [key]: (this._state[key] ?? 0) + amount,
    })
  }

  _devSetResource(key, value) {
    if (!DEV_RESOURCE_KEYS.includes(key) || !Number.isFinite(value)) {
      return
    }

    this.commitState({
      ...this._state,
      [key]: value,
    })
  }

  _devTick(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return false
    }

    this.applyPassiveIncome(seconds)
    return true
  }

  _devSetMarketUnlocked(enabled) {
    this.commitState({
      ...this._state,
      market: {
        ...this._state.market,
        unlocked: enabled,
      },
    })

    return true
  }

  _devSetEvent(eventId) {
    if (!eventId) {
      this.commitState({
        ...this._state,
        activeEvent: null,
      })

      return true
    }

    const definition = EVENT_DEFINITIONS.find((item) => item.id === eventId)
    if (!definition) {
      return false
    }

    this.commitState({
      ...this._state,
      market: {
        ...this._state.market,
        unlocked: true,
      },
      activeEvent: {
        ...getEventWindow(this._state, definition, Date.now()),
        ...getEventMarketPayload(definition.id),
        chainStep: definition.kind === 'chain' ? 0 : undefined,
        rewardShishki: definition.chainRewardShishki ?? 0,
      },
    })

    return true
  }

  _devSetCampaign(campaignId) {
    if (!campaignId) {
      this.commitState({
        ...this._state,
        activeCampaign: null,
      })

      return true
    }

    const campaign = getCampaignById(campaignId)
    if (!campaign) {
      return false
    }

    this.commitState({
      ...this._state,
      market: {
        ...this._state.market,
        unlocked: true,
      },
      activeCampaign: {
        ...getCampaignWindow(this._state, campaign, Date.now()),
        label: getEventPresentation(campaignId),
        launchCost: 0,
      },
    })

    return true
  }

  _devSetQuotaReady() {
    const quota = getQuotaPreview(this._state)
    const nextState = resolveQuotaState({
      ...this._state,
      currentRunShishki: quota.current,
    })

    this.commitState(nextState)
    return quota.current
  }

  _devDoRebirth() {
    return this.prestigeReset()
  }
}
