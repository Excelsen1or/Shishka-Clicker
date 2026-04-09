import {useEffect, useMemo, useRef, useState} from 'react'
import { useGameContext } from '../../context/GameContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import { formatNumber } from '../../lib/format'
import buttonImage from '../../assets/disco.gif'
import vityaImage from '../../assets/v4.png'
import coneImage from '../../assets/cone.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'

function createParticles(localX, localY, amount, symbol, isMega) {
  const now = Date.now()
  const capped = Math.min(28, amount)

  return Array.from({ length: capped }, (_, index) => {
    const angle = (Math.PI * 2 * index) / capped + Math.random() * 0.45
    const distance = 20 + Math.random() * (isMega ? 120 : 70)

    return {
      id: `${now}-${index}-${Math.random().toString(36).slice(2)}`,
      x: localX,
      y: localY,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - (isMega ? 25 : 10),
      rotate: Math.round((Math.random() - 0.5) * 180),
      scale: 0.75 + Math.random() * (isMega ? 0.9 : 0.45),
      symbol,
      isMega,
    }
  })
}

export function ClickerButton() {
  const cones = useRef([])
  const containerRef = useRef(null)
  const [particles, setParticles] = useState([])
  const { state, mineShishki } = useGameContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.42 })

  const particleLimitHint = useMemo(() => Math.min(28, Math.ceil(state.clickPower * 1.2)), [state.clickPower])



  const spawnCones = (e, amount) => {
    const id = Date.now()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() + 2

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

  function handleClick(e) {
    if (e.detail === 0) {
      e.preventDefault()
      return
    }

    play()
    const result = mineShishki()

    const rect = e.currentTarget.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    addBurst(localX, localY, result.isMega ? `⚡ ${result.amount}` : `+${formatNumber(state.clickPower)}`)

    const spawned = createParticles(localX, localY, result.particleCount, result.symbol, result.isMega)
    setParticles((current) => [...current.slice(-40), ...spawned])
    spawnCones(e, 1)
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

        const el = document.createElement('img')
        el.src = coneImage
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

  function preventKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
  }

  const isActive = state.shishkiPerSecond > 0

  return (
    <div className="clicker-wrap">
      <div
        className={`clicker-btn ${particles.length ? 'clicker-btn--active' : ''}`}
        onClick={handleClick}
        onKeyDown={preventKeyboard}
        aria-label="Добыть шишки"
      >
        <div className="clicker-particles" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className={`clicker-particle ${particle.isMega ? 'clicker-particle--mega' : ''}`}
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                '--dx': `${particle.dx}px`,
                '--dy': `${particle.dy}px`,
                '--rot': `${particle.rotate}deg`,
                '--scale': particle.scale,
              }}
              onAnimationEnd={() => {
                setParticles((current) => current.filter((entry) => entry.id !== particle.id))
              }}
            >
              {particle.symbol}
            </span>
          ))}
        </div>

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
        <div className="clicker-btn__meta">
          Мега-клик: {formatNumber(state.megaClickChance)}% · эмодзи при мега: {formatNumber(state.emojiMegaChance)}% · макс. частиц: {particleLimitHint}
        </div>
      </div>
    </div>
  )
}
