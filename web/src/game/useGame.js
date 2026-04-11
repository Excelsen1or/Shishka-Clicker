import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
} from './config'
import { getPrestigeUpgradeCards, PRESTIGE_UPGRADES, getPrestigeUpgradeCost } from './metaConfig'
import { loadGame, saveGame, clearGame } from '../lib/storage'


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
    return {
      ...STARTING_STATE,
      seenShopItems: buildSeenShopItems(STARTING_STATE),
      seenBuyableShopItems: buildSeenBuyableShopItems(STARTING_STATE),
    }
  }

  const mergedState = { // Local variable mergedState is redundant
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

  return mergedState
}

function enrichItem(state, item, level, aiMultiplier, prestigeMultiplier) {
  const unlock = getUnlockStatus(state, item.id)
  const effectPreview = getItemEffectPreview(item, level, aiMultiplier, prestigeMultiplier)
  const cost = getScaledCost(item.baseCost, item.costScale, level)
  const balance = Number(state?.[item.currency] ?? 0)

  return {
    ...item,
    level,
    cost,
    unlocked: unlock.unlocked,
    isNew: unlock.unlocked && !state?.seenShopItems?.[item.id],
    isBuyableNew: unlock.unlocked
      && level === 0
      && balance >= cost
      && !state?.seenBuyableShopItems?.[item.id],
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
    lifetimeKnowledgeEarned: safeCurrent.lifetimeKnowledgeEarned + knowledgeGain,
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

export function useGame() {
  const [state, setState] = useState(() => mergeState(loadGame()))
  const safeState = useMemo(() => mergeState(state), [state])
  const derived = useMemo(() => deriveEconomy(safeState), [safeState])
  const saveTimeoutRef = useRef(null)
  const saveIdleRef = useRef(null)
  const skipNextSaveRef = useRef(false)
  const [achievementQueue, setAchievementQueue] = useState([])

  useEffect(() => {
    const FOREGROUND_TICK_MS = 250
    const BACKGROUND_TICK_MS = 1000
    let last = performance.now()
    let timeoutId = null

    const step = () => {
      const now = performance.now()
      const seconds = Math.min(2.5, (now - last) / 1000)
      last = now

      setState((current) => {
        const result = unlockAchievements(applyIncome(current, seconds))
        if (result.unlockedNow.length) {
          setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
        }
        return result.state
      })

      timeoutId = window.setTimeout(
        step,
        document.visibilityState === 'hidden' ? BACKGROUND_TICK_MS : FOREGROUND_TICK_MS,
      )
    }

    timeoutId = window.setTimeout(step, FOREGROUND_TICK_MS)

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    window.clearTimeout(saveTimeoutRef.current)
    if (saveIdleRef.current && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(saveIdleRef.current)
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return () => {
        window.clearTimeout(saveTimeoutRef.current)
        if (saveIdleRef.current && typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(saveIdleRef.current)
        }
      }
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') {
        saveIdleRef.current = window.requestIdleCallback(() => saveGame(state), { timeout: 800 })
        return
      }

      saveGame(state)
    }, 320)

    return () => {
      window.clearTimeout(saveTimeoutRef.current)
      if (saveIdleRef.current && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(saveIdleRef.current)
      }
    }
  }, [state])

  const achievements = useMemo(() => deriveAchievements(safeState), [safeState])
  const contributions = useMemo(() => deriveContributionBreakdown(safeState), [safeState])
  const prestige = useMemo(() => getPrestigePreview(safeState), [safeState])

  const economy = useMemo(() => {
    const { aiMultiplier, prestigeMultiplier } = derived

    const subscriptions = SUBSCRIPTIONS.map((item) => {
      const level = safeState.subscriptions[item.id] ?? 0
      return enrichItem(safeState, { ...item, currency: 'money' }, level, aiMultiplier, prestigeMultiplier)
    })

    const upgrades = UPGRADES.map((item) => {
      const level = safeState.upgrades[item.id] ?? 0
      return enrichItem(safeState, item, level, aiMultiplier, prestigeMultiplier)
    })

    const prestigeUpgrades = getPrestigeUpgradeCards(safeState)

    return { subscriptions, upgrades, prestigeUpgrades }
  }, [derived, safeState])

  const mineShishki = useCallback(function mineShishki() {
    const snapshot = mergeState(state)
    const megaClickChance = getMegaClickChance(snapshot)
    const isMega = Math.random() < megaClickChance
    const isEmojiBurst = isMega && Math.random() < getMegaEmojiChance(snapshot)
    const emoji = isEmojiBurst ? getRandomMegaEmoji() : '🌰'
    const rates = deriveEconomy(snapshot)
    const rawClickValue = isMega ? rates.clickPower * 5 : rates.clickPower
    const clickValue = Number.isFinite(rawClickValue) ? Math.max(rawClickValue, 0.1) : 0.1
    const emojiExplosionPool = [
      '😀', '😎', '🥳', '🤯', '😈', '🤖', '👾', '🦄', '🪩', '🔥', '⚡', '🌈', '💥', '🎉', '✨', '🍄', '🐸', '🐙', '🐲', '🦊',
      '🍓', '🍍', '🍕', '🍩', '🧃', '🌟', '⭐', '💫', '🎊', '🎵', '🎮', '🛸', '🌸', '🌻', '🌴', '❄️', '☄️', '🌋', '🦋', '🐣',
      '🐼', '🪅', '💎', '🍀', '🫧', '🧠', '👑', '🫶', '🎯', '🏆'
    ]

    setState((current) => {
      current = mergeState(current)

      const result = unlockAchievements({
        ...current,
        shishki: current.shishki + clickValue,
        manualClicks: current.manualClicks + 1,
        megaClicks: current.megaClicks + (isMega ? 1 : 0),
        emojiBursts: current.emojiBursts + (isEmojiBurst ? 1 : 0),
        totalShishkiEarned: current.totalShishkiEarned + clickValue,
        lifetimeShishkiEarned: current.lifetimeShishkiEarned + clickValue,
      })

      if (result.unlockedNow.length) {
        setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
      }

      return result.state
    })

    return {
      amount: clickValue,
      particleCount: Math.max(6, Math.min(isEmojiBurst ? 52 : 28, Math.ceil((rates.clickPower * (isMega ? 3.1 : 1.2)) / 1.35))),
      symbols: isEmojiBurst ? emojiExplosionPool : isMega ? [emoji, '⚡', '🌰', '✨'] : [emoji, '🌰'],
      isMega,
      isEmojiExplosion: isEmojiBurst,
    }
  }, [state])

  const buySubscription = useCallback(function buySubscription(id) {
    setState((current) => {
      current = mergeState(current)
      const item = SUBSCRIPTIONS.find((entry) => entry.id === id)
      if (!item) return current

      const unlock = getUnlockStatus(current, item.id)
      if (!unlock.unlocked) return current

      const level = current.subscriptions[item.id] ?? 0
      const cost = getScaledCost(item.baseCost, item.costScale, level)
      if (current.money < cost) return current

      const result = unlockAchievements({
        ...current,
        money: current.money - cost,
        seenShopItems: {
          ...current.seenShopItems,
          [id]: true,
        },
        seenBuyableShopItems: {
          ...current.seenBuyableShopItems,
          [id]: true,
        },
        subscriptions: {
          ...current.subscriptions,
          [id]: level + 1,
        },
      })

      if (result.unlockedNow.length) {
        setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
      }

      return result.state
    })
  }, [])

  const buyUpgrade = useCallback(function buyUpgrade(id) {
    setState((current) => {
      current = mergeState(current)
      const item = UPGRADES.find((entry) => entry.id === id)
      if (!item) return current

      const unlock = getUnlockStatus(current, item.id)
      if (!unlock.unlocked) return current

      const level = current.upgrades[item.id] ?? 0
      const cost = getScaledCost(item.baseCost, item.costScale, level)
      const balance = current[item.currency]
      if (balance < cost) return current

      const result = unlockAchievements({
        ...current,
        [item.currency]: current[item.currency] - cost,
        seenShopItems: {
          ...current.seenShopItems,
          [id]: true,
        },
        seenBuyableShopItems: {
          ...current.seenBuyableShopItems,
          [id]: true,
        },
        upgrades: {
          ...current.upgrades,
          [id]: level + 1,
        },
      })

      if (result.unlockedNow.length) {
        setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
      }

      return result.state
    })
  }, [])

  const buyPrestigeUpgrade = useCallback(function buyPrestigeUpgrade(id) {
    setState((current) => {
      current = mergeState(current)
      const item = PRESTIGE_UPGRADES.find((entry) => entry.id === id)
      if (!item) return current

      const level = current.prestigeUpgrades[item.id] ?? 0
      const cost = getPrestigeUpgradeCost(item, level)
      if ((current.prestigeShards ?? 0) < cost) return current

      return {
        ...current,
        prestigeShards: current.prestigeShards - cost,
        prestigeUpgrades: {
          ...current.prestigeUpgrades,
          [id]: level + 1,
        },
      }
    })
  }, [])

  const markShopItemSeen = useCallback(function markShopItemSeen(id) {
    setState((current) => {
      current = mergeState(current)
      if (!id) return current

      const alreadySeen = current.seenShopItems?.[id] && current.seenBuyableShopItems?.[id]
      if (alreadySeen) return current

      return {
        ...current,
        seenShopItems: {
          ...current.seenShopItems,
          [id]: true,
        },
        seenBuyableShopItems: {
          ...current.seenBuyableShopItems,
          [id]: true,
        },
      }
    })
  }, [])

  const markSilenceLover = useCallback(function markSilenceLover() {
    setState((current) => {
      current = mergeState(current)
      const result = unlockAchievements({
        ...current,
        achievements: {
          ...current.achievements,
          silence_lover_progress: true,
        },
      })

      if (result.unlockedNow.length) {
        setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
      }

      return result.state
    })
  }, [])

  const markAutoClicker = useCallback(function markAutoClicker() {
    setState((current) => {
      current = mergeState(current)
      if (current.achievements?.autoclicker_reached) return current
      const result = unlockAchievements({
        ...current,
        achievements: {
          ...current.achievements,
          autoclicker_reached: true,
        },
      })

      if (result.unlockedNow.length) {
        setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
      }

      return result.state
    })
  }, [])

  const prestigeReset = useCallback(function prestigeReset() {
    setState((current) => {
      current = mergeState(current)
      const preview = getPrestigePreview(current)
      if (!preview.canRebirth || preview.shards <= 0) return current

      const result = unlockAchievements({
        ...STARTING_STATE,
        achievements: current.achievements,
        seenShopItems: buildSeenShopItems(STARTING_STATE),
        seenBuyableShopItems: buildSeenBuyableShopItems(STARTING_STATE),
        prestigeUpgrades: current.prestigeUpgrades,
        prestigeShards: current.prestigeShards + preview.shards,
        totalPrestigeShardsEarned: current.totalPrestigeShardsEarned + preview.shards,
        rebirths: current.rebirths + 1,
        lifetimeShishkiEarned: current.lifetimeShishkiEarned,
        lifetimeMoneyEarned: current.lifetimeMoneyEarned,
        lifetimeKnowledgeEarned: current.lifetimeKnowledgeEarned,
        megaClicks: current.megaClicks,
        emojiBursts: current.emojiBursts,
      })

      if (result.unlockedNow.length) {
        setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
      }

      return result.state
    })
  }, [])

  const resetGame = useCallback(function resetGame() {
    window.clearTimeout(saveTimeoutRef.current)
    if (saveIdleRef.current && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(saveIdleRef.current)
    }
    skipNextSaveRef.current = true
    clearGame()
    setAchievementQueue([])
    setState(() => ({
      ...STARTING_STATE,
      seenShopItems: buildSeenShopItems(STARTING_STATE),
      seenBuyableShopItems: buildSeenBuyableShopItems(STARTING_STATE),
    }))
  }, [])

  const exportGameSave = useCallback(function exportGameSave() {
    return JSON.parse(JSON.stringify(state))
  }, [state])

  const importGameSave = useCallback(function importGameSave(saveData) {
    const nextState = mergeState(saveData)
    window.clearTimeout(saveTimeoutRef.current)
    if (saveIdleRef.current && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(saveIdleRef.current)
    }
    skipNextSaveRef.current = true
    saveGame(nextState)
    setAchievementQueue([])
    setState(nextState)
  }, [])

  const dismissAchievement = useCallback(() => setAchievementQueue((queue) => queue.slice(1)), [])
  const _devGiveResource = useCallback((key, amount) => {
    const ALLOWED = ['shishki', 'money', 'knowledge', 'prestigeShards']
    if (!ALLOWED.includes(key) || !Number.isFinite(amount)) return
    setState((prev) => {
      const safe = mergeState(prev)
      return { ...safe, [key]: (safe[key] ?? 0) + amount }
    })
  }, [])
  const _devSetResource = useCallback((key, value) => {
    const ALLOWED = ['shishki', 'money', 'knowledge', 'prestigeShards']
    if (!ALLOWED.includes(key) || !Number.isFinite(value)) return
    setState((prev) => {
      const safe = mergeState(prev)
      return { ...safe, [key]: value }
    })
  }, [])

  return useMemo(() => ({
    state: {
      ...safeState,
      ...derived,
    },
    economy,
    achievements,
    prestige,
    contributions,
    mineShishki,
    buySubscription,
    buyUpgrade,
    buyPrestigeUpgrade,
    markShopItemSeen,
    markSilenceLover,
    markAutoClicker,
    prestigeReset,
    resetGame,
    exportGameSave,
    importGameSave,
    achievementQueue,
    dismissAchievement,
    _devGiveResource,
    _devSetResource,
  }), [
    safeState, derived, economy, achievements, prestige, contributions,
    mineShishki, buySubscription, buyUpgrade, buyPrestigeUpgrade,
    markShopItemSeen, markSilenceLover, markAutoClicker,
    prestigeReset, resetGame, exportGameSave, importGameSave,
    achievementQueue, dismissAchievement, _devGiveResource, _devSetResource
  ])
}
