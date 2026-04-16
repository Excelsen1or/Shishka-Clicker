import { startTransition } from 'react'
import { computed, makeAutoObservable, runInAction } from 'mobx'
import {
  STARTING_STATE,
  SUBSCRIPTIONS,
  UPGRADES,
  deriveAchievements,
  deriveContributionBreakdown,
  deriveEconomy,
  formatUnlockText,
  getItemEffectPreview,
  getPrestigePreview,
  getRandomMegaEmoji,
  getScaledCost,
  getUnlockStatus,
  getMegaClickChance,
  getMegaEmojiChance,
} from '../game/config'
import {
  getPrestigeUpgradeCards,
  PRESTIGE_UPGRADES,
  getPrestigeUpgradeCost,
} from '../game/metaConfig'
import {
  formatFullNumber,
  formatNumber,
  isNumberAbbreviated,
} from '../lib/format'

const UI_SNAPSHOT_DELAY_MS = 120
const PASSIVE_UI_SNAPSHOT_DELAY_MS = 480
const ACTIVE_TICK_MS = 250
const IDLE_TICK_MS = 1000
const IDLE_THRESHOLD_MS = 1500
const DEV_RESOURCE_KEYS = ['shishki', 'money', 'knowledge', 'prestigeShards']

function buildSeenShopItems(snapshot = STARTING_STATE) {
  const safeSnapshot = snapshot ?? STARTING_STATE

  return [...SUBSCRIPTIONS, ...UPGRADES].reduce((accumulator, item) => {
    if (getUnlockStatus(safeSnapshot, item.id).unlocked) {
      accumulator[item.id] = true
    }

    return accumulator
  }, {})
}

function buildSeenBuyableShopItems(snapshot = STARTING_STATE) {
  const safeSnapshot = snapshot ?? STARTING_STATE

  return [...SUBSCRIPTIONS, ...UPGRADES].reduce((accumulator, item) => {
    const level = item.currency
      ? (safeSnapshot.upgrades?.[item.id] ?? 0)
      : (safeSnapshot.subscriptions?.[item.id] ?? 0)
    const currency = item.currency ?? 'money'
    const unlock = getUnlockStatus(safeSnapshot, item.id)
    const cost = getScaledCost(item.baseCost, item.costScale, level)
    const balance = safeSnapshot[currency] ?? 0

    if (level > 0 || (unlock.unlocked && balance >= cost)) {
      accumulator[item.id] = true
    }

    return accumulator
  }, {})
}

function mergeState(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return createFreshState()
  }

  return {
    ...STARTING_STATE,
    ...saved,
    achievements: {
      ...(saved.achievements ?? {}),
    },
    seenShopItems: saved.seenShopItems
      ? { ...(saved.seenShopItems ?? {}) }
      : buildSeenShopItems({
          ...STARTING_STATE,
          ...saved,
          subscriptions: {
            ...STARTING_STATE.subscriptions,
            ...(saved.subscriptions ?? {}),
          },
          upgrades: {
            ...STARTING_STATE.upgrades,
            ...(saved.upgrades ?? {}),
          },
        }),
    seenBuyableShopItems: saved.seenBuyableShopItems
      ? { ...(saved.seenBuyableShopItems ?? {}) }
      : buildSeenBuyableShopItems({
          ...STARTING_STATE,
          ...saved,
          subscriptions: {
            ...STARTING_STATE.subscriptions,
            ...(saved.subscriptions ?? {}),
          },
          upgrades: {
            ...STARTING_STATE.upgrades,
            ...(saved.upgrades ?? {}),
          },
        }),
    prestigeUpgrades: {
      ...STARTING_STATE.prestigeUpgrades,
      ...(saved.prestigeUpgrades ?? {}),
    },
    subscriptions: {
      ...STARTING_STATE.subscriptions,
      ...(saved.subscriptions ?? {}),
    },
    upgrades: {
      ...STARTING_STATE.upgrades,
      ...(saved.upgrades ?? {}),
    },
  }
}

function enrichItem(state, item, level, aiMultiplier, prestigeMultiplier) {
  const unlock = getUnlockStatus(state, item.id)
  const effectPreview = getItemEffectPreview(
    item,
    level,
    aiMultiplier,
    prestigeMultiplier,
  )
  const cost = getScaledCost(item.baseCost, item.costScale, level)
  const balance = Number(state?.[item.currency] ?? 0)

  return {
    ...item,
    level,
    cost,
    balance,
    canBuy: unlock.unlocked && balance >= cost,
    unlocked: unlock.unlocked,
    isNew: unlock.unlocked && !state?.seenShopItems?.[item.id],
    isBuyableNew:
      unlock.unlocked &&
      level === 0 &&
      balance >= cost &&
      !state?.seenBuyableShopItems?.[item.id],
    unlockRule: unlock.rule,
    unlockText: formatUnlockText(unlock.rule),
    unlockProgress: unlock.progress,
    effectPreview,
  }
}

function applyIncome(current, seconds) {
  const safeCurrent = mergeState(current)
  const rates = deriveEconomy(safeCurrent)
  const shishkiGain = rates.shishkiPerSecond * seconds
  const moneyGain = rates.moneyPerSecond * seconds
  const knowledgeGain = rates.knowledgePerSecond * seconds

  return {
    ...safeCurrent,
    shishki: safeCurrent.shishki + shishkiGain,
    money: safeCurrent.money + moneyGain,
    knowledge: safeCurrent.knowledge + knowledgeGain,
    totalShishkiEarned: safeCurrent.totalShishkiEarned + shishkiGain,
    totalMoneyEarned: safeCurrent.totalMoneyEarned + moneyGain,
    totalKnowledgeEarned: safeCurrent.totalKnowledgeEarned + knowledgeGain,
    lifetimeShishkiEarned: safeCurrent.lifetimeShishkiEarned + shishkiGain,
    lifetimeMoneyEarned: safeCurrent.lifetimeMoneyEarned + moneyGain,
    lifetimeKnowledgeEarned:
      safeCurrent.lifetimeKnowledgeEarned + knowledgeGain,
  }
}

function unlockAchievements(current) {
  const derived = deriveAchievements(current)
  const nextUnlocked = { ...(current.achievements ?? {}) }
  const unlockedNow = []

  derived.forEach((achievement) => {
    if (achievement.unlocked && !nextUnlocked[achievement.id]) {
      nextUnlocked[achievement.id] = true
      unlockedNow.push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        tier: achievement.tier,
        secret: achievement.secret,
      })
    }
  })

  if (!unlockedNow.length) return { state: current, unlockedNow: [] }

  return {
    state: {
      ...current,
      achievements: nextUnlocked,
    },
    unlockedNow,
  }
}

function buildStatsSnapshot(state, contributions) {
  return [
    {
      icon: 'cone',
      label: 'Шишки',
      value: formatNumber(state.shishki),
      hint: `+${formatNumber(state.shishkiPerSecond)} / сек`,
      contributions: contributions.shishkiPerSecond,
    },
    {
      icon: 'money',
      label: 'Деньги',
      value: formatNumber(state.money),
      hint: `+${formatNumber(state.moneyPerSecond)} / сек`,
      contributions: contributions.moneyPerSecond,
    },
    {
      icon: 'knowledge',
      label: 'Знания',
      value: formatNumber(state.knowledge),
      hint: `+${formatNumber(state.knowledgePerSecond)} / сек`,
      contributions: contributions.knowledgePerSecond,
    },
    {
      icon: 'power',
      label: 'Сила клика',
      value: formatNumber(state.clickPower),
      hint: `${formatNumber(state.manualClicks)} кликов`,
      contributions: contributions.clickPower,
    },
    {
      icon: 'robot',
      label: 'AI-мощность',
      value: formatNumber(state.aiPower),
      hint: `множитель x${formatNumber(state.aiMultiplier)}`,
      contributions: contributions.aiPower,
    },
  ]
}

function buildAlertSummary(items) {
  const readyCount = items.filter((item) => item.isBuyableNew).length
  const newCount = items.filter(
    (item) => item.isNew && !item.isBuyableNew,
  ).length

  return {
    count: readyCount || newCount,
    hasReady: readyCount > 0,
  }
}

function buildUnlockPreview(state, sourceItems, type) {
  const derived = deriveEconomy(state)
  const { aiMultiplier, prestigeMultiplier } = derived
  const nextItem = sourceItems.find(
    (item) => !getUnlockStatus(state, item.id).unlocked,
  )
  if (!nextItem) return null

  const level =
    type === 'subscriptions'
      ? (state.subscriptions[nextItem.id] ?? 0)
      : (state.upgrades[nextItem.id] ?? 0)

  return enrichItem(
    state,
    type === 'subscriptions' ? { ...nextItem, currency: 'money' } : nextItem,
    level,
    aiMultiplier,
    prestigeMultiplier,
  )
}

function buildEconomySnapshot(state, derived) {
  const { aiMultiplier, prestigeMultiplier } = derived

  return {
    subscriptions: SUBSCRIPTIONS.map((item) => {
      const level = state.subscriptions[item.id] ?? 0
      return enrichItem(
        state,
        { ...item, currency: 'money' },
        level,
        aiMultiplier,
        prestigeMultiplier,
      )
    }),
    upgrades: UPGRADES.map((item) => {
      const level = state.upgrades[item.id] ?? 0
      return enrichItem(state, item, level, aiMultiplier, prestigeMultiplier)
    }),
    prestigeUpgrades: getPrestigeUpgradeCards(state),
  }
}

function markSeenItems(state, ids) {
  const nextIds = Array.from(new Set((ids ?? []).filter(Boolean)))
  if (!nextIds.length) {
    return { changed: false, state }
  }

  let changed = false
  const seenShopItems = { ...state.seenShopItems }
  const seenBuyableShopItems = { ...state.seenBuyableShopItems }

  nextIds.forEach((id) => {
    if (!seenShopItems[id] || !seenBuyableShopItems[id]) {
      seenShopItems[id] = true
      seenBuyableShopItems[id] = true
      changed = true
    }
  })

  if (!changed) {
    return { changed: false, state }
  }

  return {
    changed: true,
    state: {
      ...state,
      seenShopItems,
      seenBuyableShopItems,
    },
  }
}

function createFreshState() {
  return {
    ...STARTING_STATE,
    seenShopItems: buildSeenShopItems(STARTING_STATE),
    seenBuyableShopItems: buildSeenBuyableShopItems(STARTING_STATE),
  }
}

export default class GameStore {
  rootStore
  _state = createFreshState()
  uiSnapshotState = this._state
  achievementQueue = []
  uiRefreshTimeoutId = null
  uiRefreshDueAt = 0
  tickTimeoutId = null
  interactionTimeoutId = null
  pendingPassiveSeconds = 0
  isInteracting = false
  initialized = false
  lastTickAt = 0
  lastActivityAt = 0
  clientRevision = 0
  lastMutationAt = null

  constructor(rootStore) {
    this.rootStore = rootStore

    makeAutoObservable(
      this,
      {
        rootStore: false,
        uiRefreshTimeoutId: false,
        uiRefreshDueAt: false,
        tickTimeoutId: false,
        interactionTimeoutId: false,
        pendingPassiveSeconds: false,
        isInteracting: false,
        initialized: false,
        lastTickAt: false,
        lastActivityAt: false,
        syncUiSnapshotNow: false,
        scheduleUiSnapshotSync: false,
        statsBarData: computed.struct,
        bottomNavAlerts: computed.struct,
        clickerMetrics: computed.struct,
        progressOverviewData: computed.struct,
        devConsoleResources: computed.struct,
      },
      { autoBind: true },
    )

    this.start()
  }

  get derived() {
    return deriveEconomy(this._state)
  }

  get uiDerived() {
    return deriveEconomy(this.uiSnapshotState)
  }

  get state() {
    return {
      ...this._state,
      ...this.derived,
    }
  }

  get uiState() {
    return {
      ...this.uiSnapshotState,
      ...this.uiDerived,
    }
  }

  get achievements() {
    return deriveAchievements(this._state)
  }

  get uiAchievements() {
    return deriveAchievements(this.uiSnapshotState)
  }

  get contributions() {
    return deriveContributionBreakdown(this._state)
  }

  get uiContributions() {
    return deriveContributionBreakdown(this.uiSnapshotState)
  }

  get prestige() {
    return getPrestigePreview(this._state)
  }

  get uiPrestige() {
    return getPrestigePreview(this.uiSnapshotState)
  }

  get economy() {
    return buildEconomySnapshot(this._state, this.derived)
  }

  get uiEconomy() {
    return buildEconomySnapshot(this.uiSnapshotState, this.uiDerived)
  }

  get statsBarData() {
    return buildStatsSnapshot(this.uiState, this.uiContributions)
  }

  get bottomNavAlerts() {
    return {
      subscriptions: buildAlertSummary(this.uiEconomy.subscriptions ?? []),
      upgrades: buildAlertSummary(this.uiEconomy.upgrades ?? []),
    }
  }

  get clickerMetrics() {
    return {
      clickPowerText: formatNumber(this.state.clickPower),
      clickPowerFull: formatFullNumber(this.state.clickPower),
      megaClickChanceText: `${formatNumber(this.state.megaClickChance)}%`,
      megaClickChanceFull: formatFullNumber(this.state.megaClickChance),
      megaClickStreak: this._state.megaClickStreak ?? 0,
      emojiMegaChanceText: `${formatNumber(this.state.emojiMegaChance)}%`,
      emojiMegaChanceFull: formatFullNumber(this.state.emojiMegaChance),
      emojiBurstStreak: this._state.emojiBurstStreak ?? 0,
    }
  }

  get progressOverviewData() {
    const achievements = this.uiAchievements
    const prestige = this.uiPrestige
    const cycleShishkiText = formatNumber(prestige.cycleProgress.shishki)
    const cycleShishkiGoalText = formatNumber(prestige.rebirthRule.shishki)
    const cycleKnowledgeText = formatNumber(prestige.cycleProgress.knowledge)
    const cycleKnowledgeGoalText = formatNumber(prestige.rebirthRule.knowledge)

    return {
      nextSub: buildUnlockPreview(
        this.uiSnapshotState,
        SUBSCRIPTIONS,
        'subscriptions',
      ),
      nextUpgrade: buildUnlockPreview(
        this.uiSnapshotState,
        UPGRADES,
        'upgrades',
      ),
      unlockedAchievements: achievements.filter((entry) => entry.unlocked)
        .length,
      achievementsTotal: achievements.length,
      rebirthsText: formatNumber(this.uiSnapshotState.rebirths),
      prestigeShardsText: formatNumber(this.uiSnapshotState.prestigeShards),
      projectedShardsText: formatNumber(prestige.projectedShards),
      lifetimeShishkiEarnedText: formatNumber(
        this.uiSnapshotState.lifetimeShishkiEarned,
      ),
      totalMoneyEarnedText: formatNumber(this.uiSnapshotState.totalMoneyEarned),
      totalKnowledgeEarnedText: formatNumber(
        this.uiSnapshotState.totalKnowledgeEarned,
      ),
      megaClicksText: formatNumber(this.uiSnapshotState.megaClicks),
      prestigeLabel: prestige.isUnlocked
        ? `Цикл #${prestige.rebirthRule.cycle}`
        : 'Система ещё закрыта',
      cycleShishkiText,
      cycleShishkiGoalText,
      cycleShishkiFull: `${formatFullNumber(prestige.cycleProgress.shishki)} / ${formatFullNumber(prestige.rebirthRule.shishki)}`,
      cycleShishkiAbbreviated:
        isNumberAbbreviated(cycleShishkiText) ||
        isNumberAbbreviated(cycleShishkiGoalText),
      cycleKnowledgeText,
      cycleKnowledgeGoalText,
      cycleKnowledgeFull: `${formatFullNumber(prestige.cycleProgress.knowledge)} / ${formatFullNumber(prestige.rebirthRule.knowledge)}`,
      cycleKnowledgeAbbreviated:
        isNumberAbbreviated(cycleKnowledgeText) ||
        isNumberAbbreviated(cycleKnowledgeGoalText),
      prestige,
    }
  }

  get devConsoleResources() {
    return {
      shishki: this._state.shishki,
      shishkiText: formatNumber(this._state.shishki),
      money: this._state.money,
      moneyText: formatNumber(this._state.money),
      knowledge: this._state.knowledge,
      knowledgeText: formatNumber(this._state.knowledge),
      prestigeShards: this._state.prestigeShards,
      prestigeShardsText: formatNumber(this._state.prestigeShards),
    }
  }

  start() {
    if (this.initialized || typeof window === 'undefined') return

    this.initialized = true
    this.lastTickAt = performance.now()
    this.lastActivityAt = this.lastTickAt
    this.tickTimeoutId = window.setTimeout(this.tickStep, 250)

    window.addEventListener('scroll', this.handleInteraction, { passive: true })
    window.addEventListener('wheel', this.handleInteraction, { passive: true })
    window.addEventListener('touchmove', this.handleInteraction, {
      passive: true,
    })
  }

  markStateChanged(updatedAt = new Date().toISOString()) {
    this.clientRevision += 1
    this.lastMutationAt = updatedAt
  }

  syncUiSnapshotNow() {
    window.clearTimeout(this.uiRefreshTimeoutId)
    this.uiSnapshotState = this._state
    this.uiRefreshTimeoutId = null
    this.uiRefreshDueAt = 0
  }

  scheduleUiSnapshotSync(delayMs = UI_SNAPSHOT_DELAY_MS) {
    const now = Date.now()
    const dueAt = now + delayMs

    if (this.uiRefreshTimeoutId && this.uiRefreshDueAt <= dueAt) return

    window.clearTimeout(this.uiRefreshTimeoutId)
    this.uiRefreshDueAt = dueAt

    this.uiRefreshTimeoutId = window.setTimeout(() => {
      runInAction(() => {
        this.syncUiSnapshotNow()
      })
    }, delayMs)
  }

  pushUnlocked(unlockedNow) {
    if (unlockedNow.length) {
      this.achievementQueue.push(...unlockedNow)
    }
  }

  commitState(nextState, unlockedNow = [], options = {}) {
    const { uiSync = 'default' } = options
    this._state = nextState
    this.pushUnlocked(unlockedNow)

    if (uiSync === 'immediate') {
      this.syncUiSnapshotNow()
    } else {
      this.scheduleUiSnapshotSync(
        uiSync === 'passive'
          ? PASSIVE_UI_SNAPSHOT_DELAY_MS
          : UI_SNAPSHOT_DELAY_MS,
      )
    }

    this.markStateChanged()
  }

  transact(updater, options) {
    const result = unlockAchievements(updater(this._state))
    this.commitState(result.state, result.unlockedNow, options)
  }

  buyEconomyItem(items, collectionKey, id, currencyOverride = null) {
    this.recordActivity()
    const item = items.find((entry) => entry.id === id)
    if (!item) return

    const unlock = getUnlockStatus(this._state, item.id)
    if (!unlock.unlocked) return

    const level = this._state[collectionKey][item.id] ?? 0
    const cost = getScaledCost(item.baseCost, item.costScale, level)
    const currency = currencyOverride ?? item.currency
    const balance = this._state[currency]

    if (balance < cost) return

    this.transact((state) => ({
      ...state,
      [currency]: state[currency] - cost,
      seenShopItems: {
        ...state.seenShopItems,
        [id]: true,
      },
      seenBuyableShopItems: {
        ...state.seenBuyableShopItems,
        [id]: true,
      },
      [collectionKey]: {
        ...state[collectionKey],
        [id]: (state[collectionKey][id] ?? 0) + 1,
      },
    }))
  }

  replaceState(nextState, { markDirty = false, updatedAt = null } = {}) {
    this.achievementQueue = []
    this._state = nextState
    this.syncUiSnapshotNow()

    if (markDirty) {
      this.markStateChanged(updatedAt ?? new Date().toISOString())
      return
    }

    this.lastMutationAt =
      updatedAt ?? this.lastMutationAt ?? new Date().toISOString()
  }

  applyPassiveIncome(seconds) {
    if (seconds <= 0) return

    startTransition(() => {
      runInAction(() => {
        const result = unlockAchievements(applyIncome(this._state, seconds))
        this.commitState(result.state, result.unlockedNow, {
          uiSync: 'passive',
        })
      })
    })
  }

  tickStep() {
    const now = performance.now()
    const seconds = Math.min(2.5, (now - this.lastTickAt) / 1000)
    this.lastTickAt = now
    this.pendingPassiveSeconds += seconds
    const isForeground = document.visibilityState !== 'hidden'
    const isIdleForeground =
      isForeground &&
      !this.isInteracting &&
      now - this.lastActivityAt >= IDLE_THRESHOLD_MS

    if (isForeground && this.isInteracting) {
      this.tickTimeoutId = window.setTimeout(this.tickStep, ACTIVE_TICK_MS)
      return
    }

    const secondsToApply = this.pendingPassiveSeconds
    this.pendingPassiveSeconds = 0
    this.applyPassiveIncome(secondsToApply)

    this.tickTimeoutId = window.setTimeout(
      this.tickStep,
      document.visibilityState === 'hidden' || isIdleForeground
        ? IDLE_TICK_MS
        : ACTIVE_TICK_MS,
    )
  }

  recordActivity() {
    this.lastActivityAt = performance.now()
  }

  getSaveMeta() {
    return {
      clientRevision: this.clientRevision,
      updatedAt: this.lastMutationAt,
    }
  }

  handleInteraction() {
    this.recordActivity()
    this.isInteracting = true
    window.clearTimeout(this.interactionTimeoutId)
    this.interactionTimeoutId = window.setTimeout(() => {
      this.isInteracting = false
    }, 180)
  }

  mineShishki() {
    this.recordActivity()
    const snapshot = this._state
    const megaClickChance = getMegaClickChance(snapshot)
    const isMega = Math.random() < megaClickChance
    const isEmojiBurst = isMega && Math.random() < getMegaEmojiChance(snapshot)
    const emoji = isEmojiBurst ? getRandomMegaEmoji() : '🌰'
    const rates = deriveEconomy(snapshot)
    const rawClickValue = isMega ? rates.clickPower * 5 : rates.clickPower
    const clickValue = Number.isFinite(rawClickValue)
      ? Math.max(rawClickValue, 0.1)
      : 0.1
    const emojiExplosionPool = [
      '😀',
      '😎',
      '🥳',
      '🤯',
      '😈',
      '🤖',
      '👾',
      '🦄',
      '🪩',
      '🔥',
      '⚡',
      '🌈',
      '💥',
      '🎉',
      '✨',
      '🍄',
      '🐸',
      '🐙',
      '🐲',
      '🦊',
      '🍓',
      '🍍',
      '🍕',
      '🍩',
      '🧃',
      '🌟',
      '⭐',
      '💫',
      '🎊',
      '🎵',
      '🎮',
      '🛸',
      '🌸',
      '🌻',
      '🌴',
      '❄️',
      '☁️',
      '🌋',
      '🦋',
      '🐣',
      '🐼',
      '🪅',
      '💎',
      '🍀',
      '🫧',
      '🧠',
      '👑',
      '🫶',
      '🎯',
      '🏆',
    ]

    const result = unlockAchievements({
      ...snapshot,
      shishki: snapshot.shishki + clickValue,
      manualClicks: snapshot.manualClicks + 1,
      megaClicks: snapshot.megaClicks + (isMega ? 1 : 0),
      emojiBursts: snapshot.emojiBursts + (isEmojiBurst ? 1 : 0),
      megaClickStreak: isMega ? (snapshot.megaClickStreak ?? 0) + 1 : 0,
      emojiBurstStreak: isEmojiBurst ? (snapshot.emojiBurstStreak ?? 0) + 1 : 0,
      totalShishkiEarned: snapshot.totalShishkiEarned + clickValue,
      lifetimeShishkiEarned: snapshot.lifetimeShishkiEarned + clickValue,
    })

    this.commitState(result.state, result.unlockedNow)

    const particleCount = Math.round(
      clickValue * (isEmojiBurst ? 1.35 : isMega ? 1.1 : 1),
    )

    return {
      amount: clickValue,
      particleCount: Math.max(
        isEmojiBurst ? 6 : isMega ? 3 : 1,
        Math.min(isEmojiBurst ? 68 : isMega ? 32 : 10, particleCount),
      ),
      symbols: isEmojiBurst
        ? emojiExplosionPool
        : isMega
          ? ['⚡', '⚡️', '⚡', '⚡️']
          : [emoji, '✨'],
      isMega,
      isEmojiExplosion: isEmojiBurst,
    }
  }

  buySubscription(id) {
    this.buyEconomyItem(SUBSCRIPTIONS, 'subscriptions', id, 'money')
  }

  buyUpgrade(id) {
    this.buyEconomyItem(UPGRADES, 'upgrades', id)
  }

  buyPrestigeUpgrade(id) {
    this.recordActivity()
    const item = PRESTIGE_UPGRADES.find((entry) => entry.id === id)
    if (!item) return

    const level = this._state.prestigeUpgrades[item.id] ?? 0
    const cost = getPrestigeUpgradeCost(item, level)
    if ((this._state.prestigeShards ?? 0) < cost) return

    this.commitState({
      ...this._state,
      prestigeShards: this._state.prestigeShards - cost,
      prestigeUpgrades: {
        ...this._state.prestigeUpgrades,
        [id]: level + 1,
      },
    })
  }

  markShopItemSeen(id) {
    this.recordActivity()
    const result = markSeenItems(this._state, [id])
    if (!result.changed) return
    this.commitState(result.state)
  }

  markShopItemsSeen(ids) {
    this.recordActivity()
    const result = markSeenItems(this._state, ids)
    if (!result.changed) return
    this.commitState(result.state)
  }

  markAutoClicker() {
    if (this._state.achievements?.autoclicker_reached) return

    const result = unlockAchievements({
      ...this._state,
      achievements: {
        ...this._state.achievements,
        autoclicker_reached: true,
      },
    })

    this.commitState(result.state, result.unlockedNow)
  }

  prestigeReset() {
    this.recordActivity()
    const preview = getPrestigePreview(this._state)
    if (!preview.canRebirth || preview.shards <= 0) return

    const result = unlockAchievements({
      ...STARTING_STATE,
      achievements: this._state.achievements,
      seenShopItems: buildSeenShopItems(STARTING_STATE),
      seenBuyableShopItems: buildSeenBuyableShopItems(STARTING_STATE),
      prestigeUpgrades: this._state.prestigeUpgrades,
      prestigeShards: this._state.prestigeShards + preview.shards,
      totalPrestigeShardsEarned:
        this._state.totalPrestigeShardsEarned + preview.shards,
      rebirths: this._state.rebirths + 1,
      lifetimeShishkiEarned: this._state.lifetimeShishkiEarned,
      lifetimeMoneyEarned: this._state.lifetimeMoneyEarned,
      lifetimeKnowledgeEarned: this._state.lifetimeKnowledgeEarned,
      megaClicks: this._state.megaClicks,
      emojiBursts: this._state.emojiBursts,
    })

    this.commitState(result.state, result.unlockedNow)
  }

  resetGame() {
    const nextState = createFreshState()
    this.replaceState(nextState, { markDirty: true })
  }

  exportGameSave() {
    return JSON.parse(JSON.stringify(this._state))
  }

  importGameSave(saveData, options = {}) {
    const nextState = mergeState(saveData)
    this.replaceState(nextState, options)
  }

  dismissAchievement() {
    this.achievementQueue = this.achievementQueue.slice(1)
  }

  _devGiveResource(key, amount) {
    if (!DEV_RESOURCE_KEYS.includes(key) || !Number.isFinite(amount)) return

    this.commitState({
      ...this._state,
      [key]: (this._state[key] ?? 0) + amount,
    })
  }

  _devSetResource(key, value) {
    if (!DEV_RESOURCE_KEYS.includes(key) || !Number.isFinite(value)) return

    this.commitState({
      ...this._state,
      [key]: value,
    })
  }
}
