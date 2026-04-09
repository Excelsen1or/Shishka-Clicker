import { useEffect, useMemo, useRef, useState } from 'react'
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
import { loadGame, saveGame, clearGame } from '../lib/storage'

function mergeState(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return STARTING_STATE

  return {
    ...STARTING_STATE,
    ...saved,
    achievements: {
      ...(saved.achievements ?? {}),
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
  const effectPreview = getItemEffectPreview(item, level, aiMultiplier, prestigeMultiplier)

  return {
    ...item,
    level,
    cost: getScaledCost(item.baseCost, item.costScale, level),
    unlocked: unlock.unlocked,
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
  const skipNextSaveRef = useRef(false)
  const [achievementQueue, setAchievementQueue] = useState([])

  useEffect(() => {
    let mounted = true
    let last = performance.now()
    let accumulator = 0
    let frame = 0

    const tick = (now) => {
      if (!mounted) return
      const elapsed = Math.min(2.5, (now - last) / 1000)
      last = now
      accumulator += elapsed

      if (accumulator >= 0.25) {
        const seconds = accumulator
        accumulator = 0
        setState((current) => {
          const result = unlockAchievements(applyIncome(current, seconds))
          if (result.unlockedNow.length) {
            setAchievementQueue((queue) => [...queue, ...result.unlockedNow])
          }
          return result.state
        })
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => {
      mounted = false
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    window.clearTimeout(saveTimeoutRef.current)

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return () => window.clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveGame(state)
    }, 180)

    return () => window.clearTimeout(saveTimeoutRef.current)
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

    return { subscriptions, upgrades }
  }, [derived, safeState])

  function mineShishki() {
    const megaClickChance = getMegaClickChance(state)
    const isMega = Math.random() < megaClickChance
    const isEmojiBurst = isMega && Math.random() < getMegaEmojiChance(state)
    const emoji = isEmojiBurst ? getRandomMegaEmoji() : '🌰'

    let burstValue = ''

    setState((current) => {
      current = mergeState(current)
      const rates = deriveEconomy(current)
      const clickValue = isMega ? rates.clickPower * 5 : rates.clickPower
      burstValue = `${isMega ? 'МЕГА ' : '+'}${Math.round(clickValue * 10) / 10}`

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
      amount: burstValue,
      particleCount: Math.max(2, Math.min(24, Math.ceil((state.clickPower * (isMega ? 2.4 : 1)) / 1.8))),
      symbol: emoji,
      isMega,
    }
  }

  function buySubscription(id) {
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
  }

  function buyUpgrade(id) {
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
  }

  function markSilenceLover() {
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
  }

  function prestigeReset() {
    setState((current) => {
      current = mergeState(current)
      const preview = getPrestigePreview(current)
      if (!preview.canRebirth || preview.shards <= 0) return current

      const result = unlockAchievements({
        ...STARTING_STATE,
        achievements: current.achievements,
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
  }

  function resetGame() {
    window.clearTimeout(saveTimeoutRef.current)
    skipNextSaveRef.current = true
    clearGame()
    setAchievementQueue([])
    setState(() => ({ ...STARTING_STATE }))
  }

  return {
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
    markSilenceLover,
    prestigeReset,
    resetGame,
    achievementQueue,
    dismissAchievement: () => setAchievementQueue((queue) => queue.slice(1)),
  }
}
