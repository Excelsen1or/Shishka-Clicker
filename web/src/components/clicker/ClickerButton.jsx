import { useEffect, useRef } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import { formatNumber } from '../../lib/format'
import buttonImage from '../../assets/disco.gif'
import vityaImage from '../../assets/v4.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'

export function ClickerButton() {
  const cones = useRef([])
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  const { state, mineShishki } = useGameContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.5 })

  const spawnCones = (e, amount) => {
    const id = Date.now()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 1 + 2

      cones.current.push({
        id: id + i,
        x: localX,
        y: localY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        rotate: Math.random() * 360,
        rotateSpeed: (Math.random() - 0.5) * 6,
        life: 60,
      })
    }
  }



  useEffect(() => {
    let frame

    const update = () => {
      const container = containerRef.current
      if (!container) return

      container.innerHTML = ''

      cones.current = cones.current.filter((p) => p.life > 0)

      cones.current.forEach((p) => {
        p.vy += 0.03
        p.x += p.vx * 0.3
        p.y += p.vy * 0.3
        p.rotate += p.rotateSpeed
        p.life -= 0.4

        const el = document.createElement('div')
        el.textContent = '🌰'
        el.style.position = 'absolute'
        el.style.left = `${p.x}px`
        el.style.top = `${p.y}px`
        el.style.transform = `translate(-50%, -50%) rotate(${p.rotate}deg)`
        el.style.pointerEvents = 'none'
        el.style.userSelect = 'none'
        el.style.willChange = 'transform, top, left'
        el.style.opacity = String(Math.max(p.life / 60, 0))
        el.style.zIndex = '3'

        container.appendChild(el)
      })

      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  function handleClick(e) {
    if (e.detail === 0) {
      e.preventDefault()
      return
    }

    play()
    mineShishki()

    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    addBurst(localX, localY, `+${formatNumber(state.clickPower)}`)
    spawnCones(e, state.clickPower)
  }

  function preventKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
  }

  const isActive = state.shishkiPerSecond > 0

  return (
    <div className="clicker-wrap">
      <div
        ref={buttonRef}
        className="clicker-btn"
        onClick={handleClick}
        onKeyDown={preventKeyboard}
        aria-label="Добыть шишки"
      >
        <div ref={containerRef} className="clicker-particles" />
        <ClickBurst bursts={bursts} />

        <div className="clicker-btn__halo" />
        <div className="clicker-btn__ring clicker-btn__ring--outer" />
        <div className="clicker-btn__ring clicker-btn__ring--inner" />

        <img
          src={isActive ? buttonImage : vityaImage}
          alt="Шишка"
          className="clicker-btn__hero"
          draggable={false}
        />

        <div className="clicker-btn__label">Кликни и добудь вышку</div>
        <div className="clicker-btn__sub">За клик: +{formatNumber(state.clickPower)} 🌰</div>
      </div>
    </div>
  )
}