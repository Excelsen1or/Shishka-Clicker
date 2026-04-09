import { useEffect, useRef } from 'react'
import { useSettingsContext } from '../context/SettingsContext'

export function useSound(src, { volume = 1 } = {}) {
  const audioRef = useRef(null)
  const { effectVolumeFactor } = useSettingsContext()

  useEffect(() => {
    return () => {
      if (!audioRef.current) return
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
  }, [])

  function play() {
    if (effectVolumeFactor <= 0) return

    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.preload = 'auto'
    }

    audioRef.current.volume = Math.max(0, Math.min(1, volume * effectVolumeFactor))
    audioRef.current.currentTime = 0
    audioRef.current.play().catch((error) => {
      console.log('Playback error:', error)
    })
  }

  return { play }
}
