import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import { formatNumber } from '../../lib/format'
import discoImage from '../../assets/disco.gif'
import coneImage from '../../assets/cone.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function getRandomAngle() {
  return Math.random() * Math.PI * 2
}

function createParticles(localX, localY, amount, symbols, isMega, isEmojiExplosion, particleCap) {
  const now = Date.now()
  const total = Math.max(1, Math.min(isEmojiExplosion ? particleCap : Math.min(particleCap, 16), amount))
  const pool = Array.isArray(symbols) ? symbols : [symbols]

  return Array.from({ length: total }, (_, index) => {
    const angle = getRandomAngle()
    const distance = (isEmojiExplosion ? 98 : 22) + Math.random() * (isMega ? 180 : 92)

    return {
      id: `${now}-${index}-${Math.random().toString(36).slice(2)}`,
      x: localX,
      y: localY,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - (isMega ? 42 : 14),
      rotate: Math.round((Math.random() - 0.5) * (isEmojiExplosion ? 520 : 240)),
      scale: 0.9 + Math.random() * (isEmojiExplosion ? 1.35 : isMega ? 0.9 : 0.45),
      symbol: pickRandom(pool),
      isMega,
      isEmojiExplosion,
    }
  })
}

function createConeSprites(localX, localY, amount, isMega, coneCap) {
  const now = Date.now()
  const total = Math.min(coneCap, isMega ? amount + 3 : amount + 1)

  return Array.from({ length: total }, (_, index) => {
    const angle = getRandomAngle()
    const distance = 56 + Math.random() * (isMega ? 165 : 84)

    return {
      id: `cone-${now}-${index}-${Math.random().toString(36).slice(2)}`,
      x: localX,
      y: localY,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotateStart: Math.round(Math.random() * 180),
      rotateEnd: Math.round((Math.random() - 0.5) * 720),
      scale: 0.6 + Math.random() * (isMega ? 0.95 : 0.5),
      isMega,
    }
  })
}

function createViewportFireworks(amount, symbols, particleCap) {
  const now = Date.now()
  const pool = Array.isArray(symbols) ? symbols : [symbols]
  const total = Math.max(1, Math.min(Math.max(1, Math.round(particleCap * 0.5)), amount))

  return Array.from({ length: total }, (_, index) => {
    const lane = index / Math.max(1, total - 1)
    const launchX = 4 + lane * 92 + (Math.random() - 0.5) * 8
    const dx = (Math.random() - 0.5) * 36
    const dy = -(160 + Math.random() * 260 + (index % 5) * 14)

    return {
      id: `fw-${now}-${index}-${Math.random().toString(36).slice(2)}`,
      x: launchX,
      dx,
      dy,
      rotate: Math.round((Math.random() - 0.5) * 520),
      scale: 0.9 + Math.random() * 1.35,
      delay: Math.round(Math.random() * 240),
      symbol: pickRandom(pool),
    }
  })
}

function createFallingEmojis(amount, symbols, limit) {
  const now = Date.now()
  const pool = Array.isArray(symbols) ? symbols : [symbols]
  const total = Math.max(1, Math.min(limit, amount))

  return Array.from({ length: total }, (_, index) => ({
    id: `rain-${now}-${index}-${Math.random().toString(36).slice(2)}`,
    x: 2 + Math.random() * 96,
    drift: (Math.random() - 0.5) * 22,
    rotate: Math.round((Math.random() - 0.5) * 180),
    scale: 0.8 + Math.random() * 1.2,
    duration: 2400 + Math.round(Math.random() * 1800),
    delay: Math.round(Math.random() * 520),
    symbol: pickRandom(pool),
  }))
}

const VISUAL_DURATIONS = {
  tap: 240,
  mega: 680,
  prism: 1300,
}

export function ClickerButton() {
  const [particles, setParticles] = useState([])
  const [coneSprites, setConeSprites] = useState([])
  const [screenFireworks, setScreenFireworks] = useState([])
  const [fallingEmojis, setFallingEmojis] = useState([])
  const [visualState, setVisualState] = useState('idle')
  const [shockwaves, setShockwaves] = useState([])

  const visualTimeoutRef = useRef(null)

  const { state, mineShishki } = useGameContext()
  const { visualEffectCaps, visualEffectsFactor } = useSettingsContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.42 })

  const particleLimitHint = useMemo(
    () => Math.min(visualEffectCaps.particleCap, Math.ceil(state.clickPower * (1.05 + visualEffectsFactor * 0.45))),
    [state.clickPower, visualEffectCaps.particleCap, visualEffectsFactor],
  )

  const metricItems = useMemo(
    () => [
      { label: 'за клик', value: `+${formatNumber(state.clickPower)} 🌰` },
      { label: 'мега-шанс', value: `${formatNumber(state.megaClickChance)}%` },
      { label: 'эмодзи', value: `${formatNumber(state.emojiMegaChance)}%` },
      { label: 'лимит частиц', value: formatNumber(particleLimitHint) },
    ],
    [particleLimitHint, state.clickPower, state.emojiMegaChance, state.megaClickChance],
  )

  const overlayRoot = typeof document !== 'undefined' ? document.body : null
  const isCharged =
    visualState !== 'idle' ||
    particles.length > 0 ||
    coneSprites.length > 0 ||
    shockwaves.length > 0

  useEffect(() => {
    return () => {
      if (visualTimeoutRef.current) window.clearTimeout(visualTimeoutRef.current)
    }
  }, [])

  function armVisualState(nextState) {
    setVisualState('idle')

    requestAnimationFrame(() => {
      setVisualState(nextState)

      if (visualTimeoutRef.current) window.clearTimeout(visualTimeoutRef.current)
      visualTimeoutRef.current = window.setTimeout(() => {
        setVisualState('idle')
      }, VISUAL_DURATIONS[nextState])
    })
  }

  function spawnMegaRain(symbols, intensity = 1) {
    if (visualEffectCaps.rainCap <= 0) return

    const rain = createFallingEmojis(
      Math.round((2 + visualEffectCaps.burstCap * 0.35) * (0.55 + visualEffectsFactor * 0.35) * intensity),
      symbols,
      visualEffectCaps.rainCap,
    )

    setFallingEmojis((current) => [...current.slice(-visualEffectCaps.rainCap), ...rain])
  }

  function getLocalPoint(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const hasPointerCoords = Number.isFinite(event.clientX) && Number.isFinite(event.clientY)

    return {
      localX: hasPointerCoords ? event.clientX - rect.left : rect.width / 2,
      localY: hasPointerCoords ? event.clientY - rect.top : rect.height / 2,
    }
  }

  function blockKeyboardActivation(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
  }

  function handleClick(event) {
    if (event.detail === 0) {
      event.preventDefault()
      return
    }

    play()

    const result = mineShishki()
    const nextVisualState = result.isEmojiExplosion ? 'prism' : result.isMega ? 'mega' : 'tap'
    const formattedAmount = formatNumber(result.amount)

    armVisualState(nextVisualState)

    const { localX, localY } = getLocalPoint(event)
    const burstValue = result.isEmojiExplosion
      ? `🌈 +${formattedAmount}`
      : result.isMega
        ? `⚡ МЕГА +${formattedAmount}`
        : `+${formattedAmount}`

    addBurst(localX, localY, burstValue)

    const spawnedParticles = createParticles(
      localX,
      localY,
      Math.round(result.particleCount * (0.16 + visualEffectsFactor * 0.28)),
      result.symbols,
      result.isMega,
      result.isEmojiExplosion,
      visualEffectCaps.particleCap,
    )

    setParticles((current) => [...current.slice(-visualEffectCaps.particleCap), ...spawnedParticles])

    const coneBurstCount = Math.max(
      0,
      Math.round((result.isEmojiExplosion ? 1 : result.isMega ? 1 : 0.5) * (0.45 + visualEffectsFactor * 0.2)),
    )
    const cones = createConeSprites(localX, localY, coneBurstCount, result.isMega, visualEffectCaps.coneCap)
    setConeSprites((current) => [...current.slice(-visualEffectCaps.coneCap), ...cones])

    if (result.isMega) {
      spawnMegaRain(result.symbols, result.isEmojiExplosion ? 1.5 : 1)

      const now = Date.now()
      const waveCount = result.isEmojiExplosion ? 3 : 2
      const waves = Array.from({ length: waveCount }, (_, index) => ({
        id: `sw-${now}-${index}`,
        delay: index * 160,
        color: result.isEmojiExplosion
          ? ['rgba(168,85,247,0.72)', 'rgba(34,211,238,0.72)', 'rgba(255,166,0,0.72)'][index]
          : index === 0
            ? 'rgba(250,204,21,0.72)'
            : 'rgba(34,211,238,0.62)',
      }))

      setShockwaves((current) => [...current.slice(-6), ...waves])
    }

    if (result.isEmojiExplosion && visualEffectCaps.fireworkCap > 0 && visualEffectsFactor >= 0.35) {
      const fireworks = createViewportFireworks(
        Math.round(Math.max(visualEffectCaps.fireworkCap, result.particleCount + 2) * (0.3 + visualEffectsFactor * 0.25)),
        result.symbols,
        visualEffectCaps.fireworkCap,
      )

      setScreenFireworks((current) => [...current.slice(-visualEffectCaps.fireworkCap), ...fireworks])
    }
  }

  return (
    <div className="clicker-wrap">
      <button
        type="button"
        className={`clicker-btn ${isCharged ? 'clicker-btn--charged' : ''} ${visualState !== 'idle' ? `clicker-btn--${visualState}` : ''}`.trim()}
        data-buff-state={visualState}
        onClick={handleClick}
        onKeyDown={blockKeyboardActivation}
        onKeyUp={blockKeyboardActivation}
        aria-label="Добыть шишки"
      >
        <div className="clicker-particles" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className={`clicker-particle ${particle.isMega ? 'clicker-particle--mega' : ''} ${particle.isEmojiExplosion ? 'clicker-particle--emoji-explosion' : ''}`}
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

        {shockwaves.map((wave) => (
          <span
            key={wave.id}
            className="shockwave-ring"
            style={{ '--sw-color': wave.color, animationDelay: `${wave.delay}ms` }}
            onAnimationEnd={() => setShockwaves((current) => current.filter((entry) => entry.id !== wave.id))}
          />
        ))}

        <span className="clicker-btn__aura" />

        <div className="clicker-btn__core">
          <span className="clicker-btn__core-ring clicker-btn__core-ring--outer" />
          <span className="clicker-btn__core-ring clicker-btn__core-ring--inner" />
          <div className="clicker-btn__hero-shell">
            <img
              src={discoImage}
              alt="Шишка"
              className="clicker-btn__hero"
              draggable={false}
            />
          </div>
        </div>

        <div className="clicker-btn__content">
          <span className="clicker-btn__eyebrow">Активная добыча</span>
          <span className="clicker-btn__label">Жми и разгоняй прогресс</span>
          <span className="clicker-btn__sub">Каждое нажатие приносит шишки и может запустить мега-эффект</span>
        </div>

        <div className="clicker-btn__metrics">
          {metricItems.map((item) => (
            <span key={item.label} className="clicker-btn__metric">
              <b>{item.value}</b>
              <small>{item.label}</small>
            </span>
          ))}
        </div>
      </button>

      {overlayRoot && createPortal(
        <>
          <div className="screen-fireworks" aria-hidden="true">
            {screenFireworks.map((firework) => (
              <span
                key={firework.id}
                className="screen-firework"
                style={{
                  left: `${firework.x}vw`,
                  '--dx': `${firework.dx}vw`,
                  '--dy': `${firework.dy}px`,
                  '--rot': `${firework.rotate}deg`,
                  '--scale': firework.scale,
                  animationDelay: `${firework.delay}ms`,
                }}
                onAnimationEnd={() => {
                  setScreenFireworks((current) => current.filter((entry) => entry.id !== firework.id))
                }}
              >
                {firework.symbol}
              </span>
            ))}
          </div>

          <div className="emoji-rain" aria-hidden="true">
            {fallingEmojis.map((emoji) => (
              <span
                key={emoji.id}
                className="emoji-rain__item"
                style={{
                  left: `${emoji.x}vw`,
                  '--rain-drift': `${emoji.drift}vw`,
                  '--rain-rotate': `${emoji.rotate}deg`,
                  '--rain-scale': emoji.scale,
                  animationDuration: `${emoji.duration}ms`,
                  animationDelay: `${emoji.delay}ms`,
                }}
                onAnimationEnd={() => {
                  setFallingEmojis((current) => current.filter((entry) => entry.id !== emoji.id))
                }}
              >
                {emoji.symbol}
              </span>
            ))}
          </div>
        </>,
        overlayRoot,
      )}
    </div>
  )
}
