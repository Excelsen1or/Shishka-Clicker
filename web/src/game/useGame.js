import { useEffect, useMemo, useState } from 'react'
import { STARTING_STATE, SUBSCRIPTIONS, UPGRADES, getScaledCost } from './config'
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

export function useGame() {
  const [state, setState] = useState(() => mergeState(loadGame()))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => {
        const nextShishki = current.shishki + current.shishkiPerSecond
        const nextMoney = current.money + current.moneyPerSecond

        return {
          ...current,
          shishki: nextShishki,
          money: nextMoney,
          totalShishkiEarned: current.totalShishkiEarned + current.shishkiPerSecond,
          totalMoneyEarned: current.totalMoneyEarned + current.moneyPerSecond,
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
      return {
        ...item,
        currency: 'money',
        level,
        cost: getScaledCost(item.baseCost, item.costScale, level),
      }
    })

    const upgrades = UPGRADES.map((item) => {
      const level = state.upgrades[item.id] ?? 0
      return {
        ...item,
        level,
        cost: getScaledCost(item.baseCost, item.costScale, level),
      }
    })

    return { subscriptions, upgrades }
  }, [state])

  function mineShishki() {
    setState((current) => ({
      ...current,
      shishki: current.shishki + current.clickPower,
      manualClicks: current.manualClicks + 1,
      totalShishkiEarned: current.totalShishkiEarned + current.clickPower,
    }))
  }

  function buySubscription(id) {
    const item = economy.subscriptions.find((entry) => entry.id === id)
    if (!item) return

    setState((current) => {
      if (current.money < item.cost) return current

      const next = {
        ...current,
        money: current.money - item.cost,
        subscriptions: {
          ...current.subscriptions,
          [id]: (current.subscriptions[id] ?? 0) + 1,
        },
      }

      item.apply(next)
      return next
    })
  }

  function buyUpgrade(id) {
    const item = economy.upgrades.find((entry) => entry.id === id)
    if (!item) return

    setState((current) => {
      const balance = item.currency === 'money' ? current.money : current.shishki
      if (balance < item.cost) return current

      const next = {
        ...current,
        [item.currency]: current[item.currency] - item.cost,
        upgrades: {
          ...current.upgrades,
          [id]: (current.upgrades[id] ?? 0) + 1,
        },
      }

      item.apply(next)
      return next
    })
  }

  function resetGame() {
    clearGame()
    setState(STARTING_STATE)
  }

  return {
    state,
    economy,
    mineShishki,
    buySubscription,
    buyUpgrade,
    resetGame,
  }
}
