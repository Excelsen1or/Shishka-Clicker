import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useDiscordPresence } from '../../context/DiscordActivityContext.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useNav } from '../../context/NavContext.jsx'
import { deriveEconomy } from '../../game/config.js'
import { buildDiscordRichPresence } from '../../lib/discordPresence.js'

export const DiscordRichPresenceBridge = observer(
  function DiscordRichPresenceBridge() {
    const { activeTab } = useNav()
    const game = useGameStore()
    const { isActivity, status, updateRichPresence } = useDiscordPresence()
    const startedAtRef = useRef(Math.floor(Date.now() / 1000))
    const gameState = game._state
    const economy = deriveEconomy(gameState)

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
    }, [isActivity, presence, status, updateRichPresence])

    return null
  },
)
