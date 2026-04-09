import { useEffect, useRef } from 'react'
import { useSettingsContext } from '../context/SettingsContext'

export function useBackgroundMusic(src) {
  const audioRef = useRef(null)
  const unlockRef = useRef(false)
  const { musicVolumeFactor } = useSettingsContext()

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = musicVolumeFactor
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = musicVolumeFactor

    if (musicVolumeFactor <= 0) {
      audio.pause()
      return
    }

    if (!unlockRef.current) return

    audio.play().catch(() => {})
  }, [musicVolumeFactor])

  useEffect(() => {
    const unlockPlayback = () => {
      unlockRef.current = true
      const audio = audioRef.current
      if (!audio || musicVolumeFactor <= 0) return
      audio.play().catch(() => {})
    }

    window.addEventListener('pointerdown', unlockPlayback, { once: true })
    window.addEventListener('keydown', unlockPlayback, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockPlayback)
      window.removeEventListener('keydown', unlockPlayback)
    }
  }, [musicVolumeFactor])
}
