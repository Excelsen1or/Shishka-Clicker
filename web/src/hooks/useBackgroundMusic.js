import { useEffect, useMemo, useRef } from 'react'
import { useSettingsContext } from '../context/SettingsContext'

export function useBackgroundMusic(sourceList) {
  const audioRef = useRef(null)
  const unlockRef = useRef(false)
  const sourcesRef = useRef([])
  const sourceIndexRef = useRef(0)
  const volumeRef = useRef(0)
  const { musicVolumeFactor } = useSettingsContext()
  const sourceKey = useMemo(() => {
    const sources = Array.isArray(sourceList) ? sourceList : [sourceList]
    return sources.filter(Boolean).join('|')
  }, [sourceList])
  const storageKey = useMemo(() => `bgm-position:${sourceKey}`, [sourceKey])
  const unlockKey = useMemo(() => `bgm-unlocked:${sourceKey}`, [sourceKey])

  useEffect(() => {
    volumeRef.current = musicVolumeFactor
  }, [musicVolumeFactor])

  useEffect(() => {
    const sources = Array.isArray(sourceList) ? sourceList.filter(Boolean) : [sourceList]
    sourcesRef.current = sources
    sourceIndexRef.current = 0

    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.src = sources[0] || ''
    audioRef.current = audio

    const handleError = () => {
      const nextIndex = sourceIndexRef.current + 1
      if (nextIndex >= sourcesRef.current.length) return
      sourceIndexRef.current = nextIndex
      audio.src = sourcesRef.current[nextIndex]
      if (unlockRef.current && volumeRef.current > 0) {
        audio.play().catch(() => {})
      }
    }

    audio.addEventListener('error', handleError)

    const restorePosition = () => {
      try {
        const raw = window.localStorage.getItem(storageKey)
        const parsed = raw ? Number(raw) : 0
        if (Number.isFinite(parsed) && parsed > 0) {
          audio.currentTime = parsed
        }
      } catch {
        // ignore restore errors
      }
    }

    const savePosition = () => {
      if (!Number.isFinite(audio.currentTime)) return
      try {
        window.localStorage.setItem(storageKey, String(audio.currentTime))
      } catch {
        // ignore save errors
      }
    }

    const handleLoaded = () => {
      restorePosition()
      if (unlockRef.current && volumeRef.current > 0) {
        audio.play().catch(() => {})
      }
    }
    const handlePageHide = () => savePosition()
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') savePosition()
    }

    audio.addEventListener('loadedmetadata', handleLoaded)
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibility)
    const intervalId = window.setInterval(savePosition, 5000)

    return () => {
      window.clearInterval(intervalId)
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('error', handleError)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibility)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [sourceList, sourceKey, storageKey])

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
    try {
      if (window.localStorage.getItem(unlockKey) === 'true') {
        unlockRef.current = true
        const audio = audioRef.current
        if (audio && musicVolumeFactor > 0) {
          audio.play().catch(() => {})
        }
      }
    } catch {
      // ignore storage errors
    }

    const unlockPlayback = () => {
      unlockRef.current = true
      try {
        window.localStorage.setItem(unlockKey, 'true')
      } catch {
        // ignore storage errors
      }
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
  }, [musicVolumeFactor, unlockKey])
}
