import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useDiscordPresence } from '../../context/DiscordActivityContext.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useNav } from '../../context/NavContext.jsx'
import { deriveEconomy } from '../../game/config.js'
import { buildDiscordRichPresence } from '../../lib/discordPresence.js'

const PRESENCE_RETRY_DELAY_MS = 250
const PRESENCE_MAX_ATTEMPTS = 8

export const DiscordRichPresenceBridge = observer(
  function DiscordRichPresenceBridge() {
    const { activeTab } = useNav()
    const game = useGameStore()
    const { isActivity, status, updateRichPresence, markPresenceBridgeMounted } =
      useDiscordPresence()
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
      markPresenceBridgeMounted()
    }, [markPresenceBridgeMounted])

    useEffect(() => {
      if (!isActivity || status !== 'ready') {
        return undefined
      }

      let cancelled = false
      let timeoutId = 0
      let attempt = 0

      const tryUpdatePresence = async () => {
        const applied = await updateRichPresence(presence)

        if (cancelled || applied) {
          return
        }

        attempt += 1
        if (attempt >= PRESENCE_MAX_ATTEMPTS) {
          return
        }

        timeoutId = window.setTimeout(() => {
          void tryUpdatePresence()
        }, PRESENCE_RETRY_DELAY_MS)
      }

      void tryUpdatePresence()

      return () => {
        cancelled = true
        window.clearTimeout(timeoutId)
      }
    }, [isActivity, presence, status, updateRichPresence])

    return null
  },
)
