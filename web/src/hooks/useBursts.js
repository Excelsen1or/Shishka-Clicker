import { useCallback, useState } from 'react'
import { useSettingsContext } from '../context/SettingsContext'

export function useBursts() {
  const [bursts, setBursts] = useState([])
  const { visualEffectCaps, visualEffectsFactor } = useSettingsContext()

  const removeBurst = useCallback((id) => {
    setBursts((current) => current.filter((b) => b.id !== id))
  }, [])

  function addBurst(x, y, value) {
    const cap = Math.round(visualEffectCaps.burstCap * (0.4 + visualEffectsFactor * 0.35))
    if (cap <= 0) return

    setBursts((current) => [
      ...(cap > 1 ? current.slice(-(cap - 1)) : []),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        x,
        y,
        value,
      },
    ])
  }

  return { bursts, addBurst, removeBurst }
}
