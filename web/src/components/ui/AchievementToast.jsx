import { memo, useEffect, useRef, useState } from 'react'
import { PxlKitIcon, Trophy, Community } from '../../lib/pxlkit'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useSettingsContext } from '../../context/SettingsContext'
import { useSound } from '../../hooks/useSound'
import achievementSound from '../../assets/audio/ui/achiv.mp3'

const DISPLAY_DURATION = 3400
const EXIT_DURATION = 500

const ActiveAchievementToast = memo(function ActiveAchievementToast({ current, dismissAchievement }) {
  const [leaving, setLeaving] = useState(false)
  const { play } = useSound(achievementSound, { volume: 0.65 })
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
      dismissAchievement()
    }, DISPLAY_DURATION + EXIT_DURATION)

    return () => {
      cancelled = true
      window.clearTimeout(exitTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [dismissAchievement, play])

  return (
    <div className={`achievement-toast ${current.secret ? 'achievement-toast--secret' : ''} ${leaving ? 'achievement-toast--leaving' : ''}`} role="status" aria-live="polite">
      <div className="achievement-toast__steam">{current.secret ? 'SECRET ACHIEVEMENT' : 'ACHIEVEMENT UNLOCKED'}</div>
      <div className="achievement-toast__icon">
        <PxlKitIcon icon={current.secret ? Community : Trophy} size={28} colorful className="pixel-inline-icon" />
      </div>
      <div className="achievement-toast__body">
        <div className="achievement-toast__label">
          {current.category ?? 'Достижение'} · ур. {current.tier ?? 1}
        </div>
        <div className="achievement-toast__title">{current.title}</div>
        <div className="achievement-toast__desc">{current.description}</div>
      </div>
    </div>
  )
})

export const AchievementToast = observer(function AchievementToast() {
  const { achievementQueue, dismissAchievement } = useGameStore()
  const { visualEffectToggles } = useSettingsContext()
  const current = achievementQueue[0]

  useEffect(() => {
    if (current && !visualEffectToggles.achievementToasts) {
      dismissAchievement()
    }
  }, [current, dismissAchievement, visualEffectToggles.achievementToasts])

  if (!current) return null
  if (!visualEffectToggles.achievementToasts) return null

  return <ActiveAchievementToast key={current.id} current={current} dismissAchievement={dismissAchievement} />
})
