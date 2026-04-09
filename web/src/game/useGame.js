import { useEffect, useMemo, useState } from 'react'
import {
  STARTING_STATE,
  SUBSCRIPTIONS,
  UPGRADES,
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
    const item = economy.subscriptions.find((entry) => entry.id === id)
    if (!item || !item.unlocked) return

    setState((current) => {
      if (current.money < item.cost) return current

      return {
        ...current,
        money: current.money - item.cost,
        subscriptions: {
          ...current.subscriptions,
          [id]: (current.subscriptions[id] ?? 0) + 1,
        },
      }
    })
  }

  function buyUpgrade(id) {
    const item = economy.upgrades.find((entry) => entry.id === id)
    if (!item || !item.unlocked) return

    setState((current) => {
      const balance = current[item.currency]
      if (balance < item.cost) return current

      return {
        ...current,
        [item.currency]: current[item.currency] - item.cost,
        upgrades: {
          ...current.upgrades,
          [id]: (current.upgrades[id] ?? 0) + 1,
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
    mineShishki,
    buySubscription,
    buyUpgrade,
    resetGame,
  }
}
