import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useDiscordActivity } from '../../context/DiscordActivityContext.jsx'
import { useGameContext } from '../../context/GameContext.jsx'
import { useNav } from '../../context/NavContext.jsx'
import { deriveEconomy } from '../../game/config.js'
import { buildDiscordRichPresence } from '../../lib/discordPresence.js'

function sumLevels(map) {
  if (!map || typeof map !== 'object') return 0

  return Object.values(map).reduce((total, value) => {
    const numericValue = Number(value)
    return total + (Number.isFinite(numericValue) ? numericValue : 0)
  }, 0)
}

function countUnlockedAchievements(achievements) {
  if (!achievements || typeof achievements !== 'object') return 0

  return Object.values(achievements).reduce((total, value) => total + (value ? 1 : 0), 0)
}

export const DiscordRichPresenceBridge = observer(function DiscordRichPresenceBridge() {
  const { activeTab } = useNav()
  const game = useGameContext()
  const { isActivity, status, updateRichPresence } = useDiscordActivity()
  const startedAtRef = useRef(Math.floor(Date.now() / 1000))
  const gameState = game._state
  const economy = deriveEconomy(gameState)

  const subscriptionLevels = sumLevels(gameState?.subscriptions)
  const upgradeLevels = sumLevels(gameState?.upgrades)
  const achievementCount = countUnlockedAchievements(gameState?.achievements)
  const rebirths = Number(gameState?.rebirths ?? 0)
  const prestigeShards = Number(gameState?.prestigeShards ?? 0)
  const aiMultiplier = Number(economy?.aiMultiplier ?? 1)
  const shishkiPerSecond = Number(economy?.shishkiPerSecond ?? 0)
  const moneyPerSecond = Number(economy?.moneyPerSecond ?? 0)

  const presence = buildDiscordRichPresence({
    activeTab,
    gameState,
    economy,
    startedAt: startedAtRef.current,
  })

  useEffect(() => {
    if (!isActivity || status !== 'ready') {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      void updateRichPresence(presence)
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    achievementCount,
    activeTab,
    aiMultiplier,
    isActivity,
    moneyPerSecond,
    presence,
    prestigeShards,
    rebirths,
    shishkiPerSecond,
    status,
    subscriptionLevels,
    updateRichPresence,
    upgradeLevels,
  ])

  return null
})
