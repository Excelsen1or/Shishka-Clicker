import { useCallback, useEffect, useRef } from 'react'
import { useSettingsContext } from '../context/SettingsContext'

let sharedCtx = null
function getAudioContext() {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume()
  return sharedCtx
}

export function useSound(src, { volume = 1, randomPitch } = {}) {
  const rawRef = useRef(null)
  const bufferRef = useRef(null)
  const { effectVolumeFactor } = useSettingsContext()

  useEffect(() => {
    let cancelled = false

    fetch(src)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        if (!cancelled) rawRef.current = data
      })
      .catch((err) => console.log('Audio load error:', err))

    return () => {
      cancelled = true
    }
  }, [src])

  const play = useCallback(async () => {
    if (effectVolumeFactor <= 0) return
    if (!rawRef.current && !bufferRef.current) return

    const ctx = getAudioContext()

    if (!bufferRef.current && rawRef.current) {
      bufferRef.current = await ctx.decodeAudioData(rawRef.current.slice(0))
    }
    if (!bufferRef.current) return

    const source = ctx.createBufferSource()
    source.buffer = bufferRef.current

    const baseVol = Math.max(0, Math.min(1, volume * effectVolumeFactor))
    const gain = ctx.createGain()

    const pitch = randomPitch
    if (pitch) {
      const [semitoneDown, semitoneUp] = pitch
      const semitones = semitoneDown + Math.random() * (semitoneUp - semitoneDown)
      source.playbackRate.value = Math.pow(2, semitones / 12)
      gain.gain.value = baseVol * (0.85 + Math.random() * 0.15)
    } else {
      gain.gain.value = baseVol
    }

    source.connect(gain)
    gain.connect(ctx.destination)
    source.start(0)
  }, [effectVolumeFactor, randomPitch, volume])

  return { play }
}
