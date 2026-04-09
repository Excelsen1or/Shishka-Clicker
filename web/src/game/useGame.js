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
  if (!saved) return STARTING_STATE

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
  const rates = deriveEconomy(current)
  const shishkiGain = rates.shishkiPerSecond * seconds
  const moneyGain = rates.moneyPerSecond * seconds
  const knowledgeGain = rates.knowledgePerSecond * seconds

  return {
    ...current,
    shishki: current.shishki + shishkiGain,
    money: current.money + moneyGain,
    knowledge: current.knowledge + knowledgeGain,
    totalShishkiEarned: current.totalShishkiEarned + shishkiGain,
    totalMoneyEarned: current.totalMoneyEarned + moneyGain,
    totalKnowledgeEarned: current.totalKnowledgeEarned + knowledgeGain,
    lifetimeShishkiEarned: current.lifetimeShishkiEarned + shishkiGain,
    lifetimeMoneyEarned: current.lifetimeMoneyEarned + moneyGain,
    lifetimeKnowledgeEarned: current.lifetimeKnowledgeEarned + knowledgeGain,
  }
}

function unlockAchievements(current) {
  const derived = deriveAchievements(current)
  const nextUnlocked = { ...(current.achievements ?? {}) }
  let changed = false

  derived.forEach((achievement) => {
    if (achievement.unlocked && !nextUnlocked[achievement.id]) {
      nextUnlocked[achievement.id] = true
      changed = true
    }
  })

  if (!changed) return current
  return {
    ...current,
    achievements: nextUnlocked,
  }
}

export function useGame() {
  const [state, setState] = useState(() => mergeState(loadGame()))
  const derived = useMemo(() => deriveEconomy(state), [state])
  const saveTimeoutRef = useRef(null)
  const skipNextSaveRef = useRef(false)

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
        setState((current) => unlockAchievements(applyIncome(current, seconds)))
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

  const achievements = useMemo(() => deriveAchievements(state), [state])
  const contributions = useMemo(() => deriveContributionBreakdown(state), [state])
  const prestige = useMemo(() => getPrestigePreview(state), [state])

  const economy = useMemo(() => {
    const { aiMultiplier, prestigeMultiplier } = derived

    const subscriptions = SUBSCRIPTIONS.map((item) => {
      const level = state.subscriptions[item.id] ?? 0
      return enrichItem(state, { ...item, currency: 'money' }, level, aiMultiplier, prestigeMultiplier)
    })

    const upgrades = UPGRADES.map((item) => {
      const level = state.upgrades[item.id] ?? 0
      return enrichItem(state, item, level, aiMultiplier, prestigeMultiplier)
    })

    return { subscriptions, upgrades }
  }, [derived, state])

  function mineShishki() {
    const megaClickChance = getMegaClickChance(state)
    const isMega = Math.random() < megaClickChance
    const isEmojiBurst = isMega && Math.random() < getMegaEmojiChance(state)
    const emoji = isEmojiBurst ? getRandomMegaEmoji() : '🌰'

    let burstValue = ''

    setState((current) => {
      const rates = deriveEconomy(current)
      const clickValue = isMega ? rates.clickPower * 5 : rates.clickPower
      burstValue = `${isMega ? 'МЕГА ' : '+'}${Math.round(clickValue * 10) / 10}`

      return unlockAchievements({
        ...current,
        shishki: current.shishki + clickValue,
        manualClicks: current.manualClicks + 1,
        megaClicks: current.megaClicks + (isMega ? 1 : 0),
        emojiBursts: current.emojiBursts + (isEmojiBurst ? 1 : 0),
        totalShishkiEarned: current.totalShishkiEarned + clickValue,
        lifetimeShishkiEarned: current.lifetimeShishkiEarned + clickValue,
      })
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
      const item = SUBSCRIPTIONS.find((entry) => entry.id === id)
      if (!item) return current

      const unlock = getUnlockStatus(current, item.id)
      if (!unlock.unlocked) return current

      const level = current.subscriptions[item.id] ?? 0
      const cost = getScaledCost(item.baseCost, item.costScale, level)
      if (current.money < cost) return current

      return unlockAchievements({
        ...current,
        money: current.money - cost,
        subscriptions: {
          ...current.subscriptions,
          [id]: level + 1,
        },
      })
    })
  }

  function buyUpgrade(id) {
    setState((current) => {
      const item = UPGRADES.find((entry) => entry.id === id)
      if (!item) return current

      const unlock = getUnlockStatus(current, item.id)
      if (!unlock.unlocked) return current

      const level = current.upgrades[item.id] ?? 0
      const cost = getScaledCost(item.baseCost, item.costScale, level)
      const balance = current[item.currency]
      if (balance < cost) return current

      return unlockAchievements({
        ...current,
        [item.currency]: current[item.currency] - cost,
        upgrades: {
          ...current.upgrades,
          [id]: level + 1,
        },
      })
    })
  }

  function markSilenceLover() {
    setState((current) => unlockAchievements({
      ...current,
      achievements: {
        ...current.achievements,
        silence_lover_progress: true,
      },
    }))
  }

  function prestigeReset() {
    setState((current) => {
      const preview = getPrestigePreview(current)
      if (!preview.canRebirth || preview.shards <= 0) return current

      return unlockAchievements({
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
    })
  }

  function resetGame() {
    window.clearTimeout(saveTimeoutRef.current)
    skipNextSaveRef.current = true
    clearGame()
    setState(() => ({ ...STARTING_STATE }))
  }

  return {
    state: {
      ...state,
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
  }
}
