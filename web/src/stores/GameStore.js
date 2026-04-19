import { startTransition } from 'react'
import { computed, makeAutoObservable, runInAction } from 'mobx'
import {
  BUILDINGS,
  PRESTIGE_UPGRADES,
  RUN_UPGRADES,
} from '../game/economyConfig.js'
import {
  accrueTarLumps,
  applyMarketTrade,
  deriveProduction,
  getBuildingCost,
  getCampaignById,
  resolveQuotaClosures,
} from '../game/economyMath.js'
import {
  getPrestigeUpgradeCost,
  getQuotaPreview,
} from '../game/metaConfig.js'
import {
  buildDevConsoleResources,
  buildClickerFieldData,
  buildEconomySnapshot,
  buildProgressOverviewData,
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

function clearExpiredCampaign(state, now = Date.now()) {
  if (!state.activeCampaign?.endsAt || state.activeCampaign.endsAt > now) {
    return state
  }

  return {
    ...state,
    activeCampaign: null,
  }
}

function resolveUiState(state) {
  return clearExpiredCampaign(state)
}

export default class GameStore {
  rootStore
  _state = createFreshState()
  uiSnapshotState = this._state
  achievementQueue = []
  tickTimeoutId = null
  initialized = false
  lastTickAt = 0
  clientRevision = 0
  lastMutationAt = null

  constructor(rootStore) {
    this.rootStore = rootStore

    makeAutoObservable(
      this,
      {
        rootStore: false,
        tickTimeoutId: false,
        initialized: false,
        lastTickAt: false,
        achievementQueue: false,
        state: computed.struct,
        uiState: computed.struct,
        economy: computed.struct,
        uiEconomy: computed.struct,
        statsBarData: computed.struct,
        bottomNavAlerts: computed.struct,
        clickerMetrics: computed.struct,
        progressOverviewData: computed.struct,
        clickerFieldData: computed.struct,
        devConsoleResources: computed.struct,
      },
      { autoBind: true },
    )

    this.start()
  }

  get derived() {
    return deriveProduction(this._state)
  }

  get uiDerived() {
    return deriveProduction(resolveUiState(this.uiSnapshotState))
  }

  get state() {
    return {
      ...this._state,
      ...this.derived,
    }
  }

  get uiState() {
    return {
      ...resolveUiState(this.uiSnapshotState),
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
    const resolvedState = resolveUiState(this.uiSnapshotState)
    const quota = getQuotaPreview(resolvedState)

    return {
      currentRunShishki: resolvedState.currentRunShishki,
      currentQuotaTarget: quota.current,
      nextQuotaTarget: quota.next,
      quotaIndex: resolvedState.quotaIndex,
      heavenlyShishki: resolvedState.heavenlyShishki,
      rebirths: resolvedState.rebirths,
      tarLumps: resolvedState.tarLumps,
    }
  }

  get economy() {
    return buildEconomySnapshot(this._state, this.derived)
  }

  get uiEconomy() {
    return buildEconomySnapshot(this.uiSnapshotState, this.uiDerived)
  }

  get statsBarData() {
    return [
      {
        icon: 'cone',
        label: 'Шишки',
        value: this.uiState.shishki,
        hint: `+${this.uiDerived.shishkiPerSecond}/сек`,
      },
      {
        icon: 'rebirth',
        label: 'Небесные',
        value: this.uiState.heavenlyShishki,
        hint: 'за текущую и прошлые жизни',
      },
      {
        icon: 'knowledge',
        label: 'Комочки',
        value: this.uiState.tarLumps,
        hint: 'редкий мета-ресурс',
      },
      {
        icon: 'power',
        label: 'Клик',
        value: this.uiDerived.clickPower,
        hint: `${this.uiState.manualClicks} кликов`,
      },
    ]
  }

  get bottomNavAlerts() {
    return {
      subscriptions: { count: 0, hasReady: false },
      upgrades: { count: 0, hasReady: false },
      market: { count: 0, hasReady: false },
      meta: { count: 0, hasReady: false },
      settings: { count: 0, hasReady: false },
      clicker: { count: 0, hasReady: false },
    }
  }

  get clickerMetrics() {
    return {
      clickPowerText: String(this.state.clickPower),
      megaClickChanceText: '0%',
      megaClickStreak: 0,
      emojiMegaChanceText: '0%',
      emojiBurstStreak: 0,
    }
  }

  get progressOverviewData() {
    return buildProgressOverviewData(resolveUiState(this.uiSnapshotState), this.uiDerived)
  }

  get clickerFieldData() {
    return buildClickerFieldData(resolveUiState(this.uiSnapshotState))
  }

  get devConsoleResources() {
    return buildDevConsoleResources(this._state)
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
        let nextState = clearExpiredCampaign(this._state)
        nextState = accrueTarLumps(nextState, seconds * 1000)
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
    const nextState = gainShishki(
      {
        ...clearExpiredCampaign(this._state),
        manualClicks: this._state.manualClicks + 1,
      },
      clickValue,
    )

    this.commitState(nextState)

    return {
      amount: clickValue,
      particleCount: Math.max(1, Math.round(clickValue)),
      symbols: ['🌰', '✨'],
      isMega: false,
      isEmojiExplosion: false,
    }
  }

  buyBuilding(id) {
    const building = BUILDINGS.find((item) => item.id === id)
    if (!building) {
      return
    }

    const owned = this._state.buildings[id] ?? 0
    const cost = getBuildingCost(building.baseCost, owned)
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
    })
  }

  buySubscription(id) {
    this.buyBuilding(id)
  }

  buyUpgrade(id) {
    const upgrade = RUN_UPGRADES.find((item) => item.id === id)
    if (!upgrade || this._state.shishki < upgrade.cost) {
      return
    }

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - upgrade.cost,
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

  buyMarketGood(goodId, quantity = 1) {
    const trade = applyMarketTrade({
      state: this._state,
      goodId,
      quantity,
      side: 'buy',
    })

    this.commitState(trade.nextState)
  }

  sellMarketGood(goodId, quantity = 1) {
    const trade = applyMarketTrade({
      state: this._state,
      goodId,
      quantity,
      side: 'sell',
    })

    this.commitState(trade.nextState)
  }

  activateCampaign(campaignId) {
    const campaign = getCampaignById(campaignId)
    if (!campaign || this._state.shishki < campaign.cost) {
      return
    }

    this.commitState({
      ...this._state,
      shishki: this._state.shishki - campaign.cost,
      activeCampaign: {
        ...campaign,
        endsAt: Date.now() + campaign.durationMs,
      },
    })
  }

  prestigeReset() {
    const nextState = createFreshState()

    this.commitState({
      ...nextState,
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
}
