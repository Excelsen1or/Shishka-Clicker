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

const getRandomAngle = () => Math.random() * Math.PI * 2

function createParticles(localX, localY, amount, symbols, isMega, isEmojiExplosion, particleCap) {
  const now = Date.now()
  const capped = Math.max(1, Math.min(isEmojiExplosion ? particleCap : Math.min(particleCap, 16), amount))
  const pool = Array.isArray(symbols) ? symbols : [symbols]

  return Array.from({ length: capped }, (_, index) => {
    // const angle = (Math.PI * 2 * index) / capped + Math.random() * 0.7
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

export function ClickerButton() {
  const [particles, setParticles] = useState([])
  const [coneSprites, setConeSprites] = useState([])
  const [screenFireworks, setScreenFireworks] = useState([])
  const [fallingEmojis, setFallingEmojis] = useState([])
  const [isPressed, setIsPressed] = useState(false)
  const [isMegaPressed, setIsMegaPressed] = useState(false)
  const [isRgbBurst, setIsRgbBurst] = useState(false)
  const [shockwaves, setShockwaves] = useState([])

  const pressTimeoutRef = useRef(null)
  const megaPressTimeoutRef = useRef(null)
  const rgbTimeoutRef = useRef(null)

  const { state, mineShishki } = useGameContext()
  const { visualEffectCaps, visualEffectsFactor } = useSettingsContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.42 })

  const particleLimitHint = useMemo(
    () => Math.min(visualEffectCaps.particleCap, Math.ceil(state.clickPower * (1.05 + visualEffectsFactor * 0.45))),
    [state.clickPower, visualEffectCaps.particleCap, visualEffectsFactor],
  )

  const overlayRoot = typeof document !== 'undefined' ? document.body : null

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) window.clearTimeout(pressTimeoutRef.current)
      if (megaPressTimeoutRef.current) window.clearTimeout(megaPressTimeoutRef.current)
      if (rgbTimeoutRef.current) window.clearTimeout(rgbTimeoutRef.current)
    }
  }, [])


  function triggerPressAnimation() {
    setIsPressed(false)

    requestAnimationFrame(() => {
      setIsPressed(true)
      if (pressTimeoutRef.current) window.clearTimeout(pressTimeoutRef.current)
      pressTimeoutRef.current = window.setTimeout(() => setIsPressed(false), 220)
    })
  }

  function triggerMegaPressAnimation() {
    setIsMegaPressed(false)

    requestAnimationFrame(() => {
      setIsMegaPressed(true)
      if (megaPressTimeoutRef.current) window.clearTimeout(megaPressTimeoutRef.current)
      megaPressTimeoutRef.current = window.setTimeout(() => setIsMegaPressed(false), 760)
    })
  }

  function triggerRgbBurst() {
    setIsRgbBurst(true)
    if (rgbTimeoutRef.current) window.clearTimeout(rgbTimeoutRef.current)
    rgbTimeoutRef.current = window.setTimeout(() => setIsRgbBurst(false), 2400)
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

  function handleClick(e) {
    if (e.detail === 0) {
      e.preventDefault()
      return
    }

    play()
    const result = mineShishki()

    if (result.isMega) triggerMegaPressAnimation()
    else triggerPressAnimation()
    if (result.isEmojiExplosion) triggerRgbBurst()

    const rect = e.currentTarget.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    addBurst(
      localX,
      localY,
      result.isEmojiExplosion ? `🌈 ${result.amount}` : result.isMega ? `⚡ ${result.amount}` : `+${formatNumber(state.clickPower)}`,
    )

    const spawned = createParticles(
      localX,
      localY,
      Math.round(result.particleCount * (0.16 + visualEffectsFactor * 0.28)),
      result.symbols,
      result.isMega,
      result.isEmojiExplosion,
      visualEffectCaps.particleCap,
    )
    setParticles((current) => [...current.slice(-visualEffectCaps.particleCap), ...spawned])

    const coneBurstCount = Math.max(0, Math.round((result.isEmojiExplosion ? 1 : result.isMega ? 1 : 0.5) * (0.45 + visualEffectsFactor * 0.2)))
    const cones = createConeSprites(localX, localY, coneBurstCount, result.isMega, visualEffectCaps.coneCap)
    setConeSprites((current) => [...current.slice(-visualEffectCaps.coneCap), ...cones])

    if (result.isMega) {
      spawnMegaRain(result.symbols, result.isEmojiExplosion ? 1.5 : 1)
      // spawn shockwave rings
      const now = Date.now()
      const swCount = result.isEmojiExplosion ? 3 : 2
      const newWaves = Array.from({ length: swCount }, (_, i) => ({
        id: `sw-\${now}-\${i}`,
        delay: i * 160,
        color: result.isEmojiExplosion
          ? ['rgba(168,85,247,0.75)', 'rgba(34,211,238,0.75)', 'rgba(255,153,0,0.75)'][i]
          : i === 0 ? 'rgba(250,204,21,0.75)' : 'rgba(34,211,238,0.65)',
      }))
      setShockwaves((current) => [...current.slice(-6), ...newWaves])
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

  function preventKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
  }

  return (
    <div className="clicker-wrap">
      <div
        className={`clicker-btn ${isPressed ? 'clicker-btn--pressed' : ''} ${isMegaPressed ? 'clicker-btn--mega-pressed' : ''} ${isRgbBurst ? 'clicker-btn--rgb' : ''} ${particles.length ? 'clicker-btn--active' : ''}`}
        data-buff-state={isRgbBurst ? 'emoji' : isMegaPressed ? 'mega' : isPressed ? 'click' : 'idle'}
        onClick={handleClick}
        onKeyDown={preventKeyboard}
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

        {shockwaves.map((sw) => (
          <span
            key={sw.id}
            className="shockwave-ring"
            style={{ '--sw-color': sw.color, animationDelay: `${sw.delay}ms` }}
            onAnimationEnd={() => setShockwaves((c) => c.filter((s) => s.id !== sw.id))}
          />
        ))}

        <div className="clicker-btn__halo" />
        <div className="clicker-btn__ring clicker-btn__ring--outer" />
        <div className="clicker-btn__ring clicker-btn__ring--inner" />

        <img
          src={discoImage}
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
