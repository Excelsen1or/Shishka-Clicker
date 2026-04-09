import { useRef } from 'react'

export function useSound(src, { volume = 0.5 } = {}) {
  const audioRef = useRef(null)

  function play() {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.volume = volume
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch((e) => console.log("Playback error:", e))
  }

  return { play }
}
