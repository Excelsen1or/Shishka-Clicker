import { useEffect, useMemo, useState } from 'react'
import {
  STARTING_STATE,
  SUBSCRIPTIONS,
  UPGRADES,
  deriveContributionBreakdown,
  deriveEconomy,
  formatUnlockText,
  getItemEffectPreview,
  getScaledCost,
  getUnlockStatus,
} from './config'
import { loadGame, saveGame, clearGame } from '../lib/storage'

function mergeState(saved) {
  if (!saved) return STARTING_STATE

  return {
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
  }
}

function enrichItem(state, item, level) {
  const unlock = getUnlockStatus(state, item.id)
  const rates = deriveEconomy(state)
  const effectPreview = getItemEffectPreview(item, level, rates.aiMultiplier)

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

export function useGame() {
  const [state, setState] = useState(() => mergeState(loadGame()))
  const derived = useMemo(() => deriveEconomy(state), [state])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => {
        const rates = deriveEconomy(current)
        const nextShishki = current.shishki + rates.shishkiPerSecond
        const nextMoney = current.money + rates.moneyPerSecond
        const nextKnowledge = current.knowledge + rates.knowledgePerSecond

        return {
          ...current,
          shishki: nextShishki,
          money: nextMoney,
          knowledge: nextKnowledge,
          totalShishkiEarned: current.totalShishkiEarned + rates.shishkiPerSecond,
          totalMoneyEarned: current.totalMoneyEarned + rates.moneyPerSecond,
          totalKnowledgeEarned: current.totalKnowledgeEarned + rates.knowledgePerSecond,
        }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    saveGame(state)
  }, [state])

  const contributions = useMemo(() => deriveContributionBreakdown(state), [state])

  const economy = useMemo(() => {
    const subscriptions = SUBSCRIPTIONS.map((item) => {
      const level = state.subscriptions[item.id] ?? 0
      return enrichItem(state, { ...item, currency: 'money' }, level)
    })

    const upgrades = UPGRADES.map((item) => {
      const level = state.upgrades[item.id] ?? 0
      return enrichItem(state, item, level)
    })

    return { subscriptions, upgrades }
  }, [state])

  function mineShishki() {
    setState((current) => {
      const rates = deriveEconomy(current)
      return {
        ...current,
        shishki: current.shishki + rates.clickPower,
        manualClicks: current.manualClicks + 1,
        totalShishkiEarned: current.totalShishkiEarned + rates.clickPower,
      }
    })
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

      return {
        ...current,
        money: current.money - cost,
        subscriptions: {
          ...current.subscriptions,
          [id]: level + 1,
        },
      }
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

      return {
        ...current,
        [item.currency]: current[item.currency] - cost,
        upgrades: {
          ...current.upgrades,
          [id]: level + 1,
        },
      }
    })
  }

  function resetGame() {
    clearGame()
    setState(STARTING_STATE)
  }

  return {
    state: {
      ...state,
      ...derived,
    },
    economy,
    contributions,
    mineShishki,
    buySubscription,
    buyUpgrade,
    resetGame,
  }
}
