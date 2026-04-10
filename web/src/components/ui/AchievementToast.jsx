import { useEffect, useRef } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useSound } from '../../hooks/useSound'
import achievementSound from '../../assets/audio/ui/opoveshchenie.mp3'

export function AchievementToast() {
  const { achievementQueue, dismissAchievement } = useGameContext()
  const current = achievementQueue[0]
  const currentId = current?.id
  const { play } = useSound(achievementSound, { volume: 0.65 })
  const playRef = useRef(play)
  playRef.current = play

  useEffect(() => {
    if (!currentId) return
    playRef.current()
    const timer = window.setTimeout(() => {
      dismissAchievement()
    }, 4200)

    return () => window.clearTimeout(timer)
  }, [currentId, dismissAchievement])

  if (!current) return null

  return (
    <div className={`achievement-toast ${current.secret ? 'achievement-toast--secret' : ''}`} role="status" aria-live="polite">
      <div className="achievement-toast__steam">{current.secret ? 'SECRET ACHIEVEMENT' : 'ACHIEVEMENT UNLOCKED'}</div>
      <div className="achievement-toast__icon">{current.secret ? '🕵️' : '🏆'}</div>
      <div className="achievement-toast__body">
        <div className="achievement-toast__label">
          {current.category ?? 'Достижение'} · ур. {current.tier ?? 1}
        </div>
        <div className="achievement-toast__title">{current.title}</div>
        <div className="achievement-toast__desc">{current.description}</div>
      </div>
    </div>
  )
}
