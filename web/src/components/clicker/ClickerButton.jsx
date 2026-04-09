import { useMemo, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import buttonImage from '../../assets/disco.gif'
import vityaImage from '../../assets/v4.png'
import coneImage from '../../assets/cone.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'
import {MainStore} from "../../MainStore.js"


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

function createConeSprites(localX, localY, amount, isMega) {
  const now = Date.now()
  const total = isMega ? amount + 2 : amount

  return Array.from({ length: total }, (_, index) => {
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 1.8
    const distance = 42 + Math.random() * (isMega ? 120 : 72)

    return {
      id: `cone-${now}-${index}-${Math.random().toString(36).slice(2)}`,
      x: localX,
      y: localY,
      dx: Math.cos(angle) * distance,
      dy: -18 - Math.abs(Math.sin(angle) * distance),
      rotateStart: Math.round(Math.random() * 180),
      rotateEnd: Math.round((Math.random() - 0.5) * 560),
      scale: 0.5 + Math.random() * (isMega ? 0.8 : 0.45),
      isMega,
    }
  })
}

export function ClickerButton() {
  const [particles, setParticles] = useState([])
  const [coneSprites, setConeSprites] = useState([])
  const { state, mineShishki } = useGameContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.42 })

  const particleLimitHint = useMemo(() => Math.min(28, Math.ceil(state.clickPower * 1.2)), [state.clickPower])

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

    addBurst(localX, localY, result.isMega ? `⚡ ${result.amount}` : `+${MainStore.formatShortNumber(state.clickPower)}`)

    const spawned = createParticles(localX, localY, result.particleCount, result.symbol, result.isMega)
    setParticles((current) => [...current.slice(-40), ...spawned])

    const coneBurstCount = result.isMega ? 2 : 1
    const cones = createConeSprites(localX, localY, coneBurstCount, result.isMega)
    setConeSprites((current) => [...current.slice(-18), ...cones])
  }

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

          {coneSprites.map((sprite) => (
            <img
              key={sprite.id}
              src={coneImage}
              alt=""
              className={`cone-sprite ${sprite.isMega ? 'cone-sprite--mega' : ''}`}
              draggable={false}
              style={{
                left: `${sprite.x}px`,
                top: `${sprite.y}px`,
                '--dx': `${sprite.dx}px`,
                '--dy': `${sprite.dy}px`,
                '--rot-start': `${sprite.rotateStart}deg`,
                '--rot-end': `${sprite.rotateEnd}deg`,
                '--cone-scale': sprite.scale,
              }}
              onAnimationEnd={() => {
                setConeSprites((current) => current.filter((entry) => entry.id !== sprite.id))
              }}
            />
          ))}
        </div>

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
        <div className="clicker-btn__sub">За клик: +{MainStore.formatShortNumber(state.clickPower)} 🌰</div>
        <div className="clicker-btn__meta">
          Мега-клик: {MainStore.formatShortNumber(state.megaClickChance)}% · эмодзи при мега: {MainStore.formatShortNumber(state.emojiMegaChance)}% · макс. частиц: {particleLimitHint}
        </div>
      </div>
    </div>
  )
}
