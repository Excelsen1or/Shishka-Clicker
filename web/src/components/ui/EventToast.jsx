import { memo, useEffect, useRef, useState } from 'react'
import { PxlKitIcon, Community } from '../../lib/pxlkit'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useSettingsVisuals } from '../../context/SettingsContext'
import { useSound } from '../../hooks/useSound'
import eventSound from '../../assets/audio/ui/event.wav'

const DISPLAY_DURATION = 3400
const EXIT_DURATION = 500

function getEventLabel(current) {
  if (current.kind === 'chain') {
    return 'Цепной ивент'
  }

  if (current.rarity === 'rare') {
    return 'Редкий ивент'
  }

  return 'Ивент начался'
}

const ActiveEventToast = memo(function ActiveEventToast({
  current,
  dismissEventToast,
}) {
  const [leaving, setLeaving] = useState(false)
  const { play } = useSound(eventSound, { volume: 0.68 })
  const replayRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const tryPlay = () => {
      if (cancelled) return
      const maybePromise = play()
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {
          if (replayRef.current) return
          replayRef.current = true
          const unlock = () => {
            window.removeEventListener('pointerdown', unlock)
            window.removeEventListener('keydown', unlock)
            replayRef.current = false
            play()
          }
          window.addEventListener('pointerdown', unlock, { once: true })
          window.addEventListener('keydown', unlock, { once: true })
        })
      }
    }

    tryPlay()

    const exitTimer = window.setTimeout(() => {
      setLeaving(true)
    }, DISPLAY_DURATION)

    const dismissTimer = window.setTimeout(() => {
      dismissEventToast()
    }, DISPLAY_DURATION + EXIT_DURATION)

    return () => {
      cancelled = true
      window.clearTimeout(exitTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [dismissEventToast, play])

  return (
    <div
      className={`achievement-toast achievement-toast--event ${leaving ? 'achievement-toast--leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="achievement-toast__steam">EVENT STARTED</div>
      <div className="achievement-toast__icon">
        <PxlKitIcon
          icon={Community}
          size={28}
          colorful
          className="pixel-inline-icon"
        />
      </div>
      <div className="achievement-toast__body">
        <div className="achievement-toast__label">{getEventLabel(current)}</div>
        <div className="achievement-toast__title">{current.title}</div>
        <div className="achievement-toast__desc">{current.description}</div>
      </div>
    </div>
  )
})

export const EventToast = observer(function EventToast() {
  const { eventToastQueue, dismissEventToast } = useGameStore()
  const { visualEffectToggles } = useSettingsVisuals()
  const current = eventToastQueue[0]

  useEffect(() => {
    if (current && !visualEffectToggles.achievementToasts) {
      dismissEventToast()
    }
  }, [current, dismissEventToast, visualEffectToggles.achievementToasts])

  if (!current) return null
  if (!visualEffectToggles.achievementToasts) return null

  return (
    <ActiveEventToast
      key={current.toastId}
      current={current}
      dismissEventToast={dismissEventToast}
    />
  )
})
