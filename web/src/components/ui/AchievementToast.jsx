import { useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useSound } from '../../hooks/useSound'
import achievementSound from '../../assets/audio/ui/opoveshchenie.mp3'

export function AchievementToast() {
  const { achievementQueue, dismissAchievement } = useGameContext()
  const current = achievementQueue[0]
  const { play } = useSound(achievementSound, { volume: 0.65 })

  useEffect(() => {
    if (!current) return
    play()
    const timer = window.setTimeout(() => {
      dismissAchievement()
    }, 4200)

    return () => window.clearTimeout(timer)
  }, [current?.id])

  if (!current) return null

  return (
    <div className="achievement-toast" role="status" aria-live="polite">
      <div className="achievement-toast__steam">ACHIEVEMENT UNLOCKED</div>
      <div className="achievement-toast__icon">🏆</div>
      <div className="achievement-toast__body">
        <div className="achievement-toast__label">Достижение получено</div>
        <div className="achievement-toast__title">{current.title}</div>
        <div className="achievement-toast__desc">{current.description}</div>
      </div>
    </div>
  )
}
