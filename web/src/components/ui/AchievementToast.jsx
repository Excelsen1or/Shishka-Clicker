import { memo, useEffect, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'
import { useSound } from '../../hooks/useSound'
import achievementSound from '../../assets/audio/ui/opoveshchenie.mp3'
import { PrizeIcon } from './GameIcon'

const DISPLAY_DURATION = 3400
const EXIT_DURATION = 500

const ActiveAchievementToast = memo(function ActiveAchievementToast({ current, dismissAchievement }) {
  const [leaving, setLeaving] = useState(false)
  const { play } = useSound(achievementSound, { volume: 0.65 })

  useEffect(() => {
    play()

    const exitTimer = window.setTimeout(() => {
      setLeaving(true)
    }, DISPLAY_DURATION)

    const dismissTimer = window.setTimeout(() => {
      dismissAchievement()
    }, DISPLAY_DURATION + EXIT_DURATION)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [dismissAchievement, play])

  return (
    <div className={`achievement-toast ${current.secret ? 'achievement-toast--secret' : ''} ${leaving ? 'achievement-toast--leaving' : ''}`} role="status" aria-live="polite">
      <div className="achievement-toast__steam">{current.secret ? 'SECRET ACHIEVEMENT' : 'ACHIEVEMENT UNLOCKED'}</div>
      <div className="achievement-toast__icon">{current.secret ? '🕵️' : <PrizeIcon />}</div>
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

export const AchievementToast = memo(function AchievementToast() {
  const { achievementQueue, dismissAchievement } = useGameContext()
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
