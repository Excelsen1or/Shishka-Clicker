import { useEffect, useMemo, useRef, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import { formatNumber } from '../../lib/format'
import buttonImage from '../../assets/disco.gif'
import vityaImage from '../../assets/v4.png'
import coneImage from '../../assets/cone.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function createParticles(localX, localY, amount, symbols, isMega, isEmojiExplosion, particleCap) {
  const now = Date.now()
  const capped = Math.max(6, Math.min(isEmojiExplosion ? particleCap : Math.min(particleCap, 32), amount))
  const pool = Array.isArray(symbols) ? symbols : [symbols]

  return Array.from({ length: capped }, (_, index) => {
    const angle = (Math.PI * 2 * index) / capped + Math.random() * 0.7
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
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 2.2
    const distance = 56 + Math.random() * (isMega ? 165 : 84)

    return {
      id: `cone-${now}-${index}-${Math.random().toString(36).slice(2)}`,
      x: localX,
      y: localY,
      dx: Math.cos(angle) * distance,
      dy: -24 - Math.abs(Math.sin(angle) * distance),
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
  const total = Math.max(18, Math.min(Math.round(particleCap * 0.95), amount))

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

export function ClickerButton() {
  const [particles, setParticles] = useState([])
  const [coneSprites, setConeSprites] = useState([])
  const [screenFireworks, setScreenFireworks] = useState([])
  const [isPressed, setIsPressed] = useState(false)
  const [isMegaPressed, setIsMegaPressed] = useState(false)
  const [isRgbBurst, setIsRgbBurst] = useState(false)

  const pressTimeoutRef = useRef(null)
  const megaPressTimeoutRef = useRef(null)
  const rgbTimeoutRef = useRef(null)
  const bodyMegaTimeoutRef = useRef(null)
  const bodyRgbTimeoutRef = useRef(null)

  const { state, mineShishki } = useGameContext()
  const { visualEffectCaps, visualEffectsFactor } = useSettingsContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.42 })

  const particleLimitHint = useMemo(
    () => Math.min(visualEffectCaps.particleCap, Math.ceil(state.clickPower * (1.15 + visualEffectsFactor * 0.6))),
    [state.clickPower, visualEffectCaps.particleCap, visualEffectsFactor],
  )

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) window.clearTimeout(pressTimeoutRef.current)
      if (megaPressTimeoutRef.current) window.clearTimeout(megaPressTimeoutRef.current)
      if (rgbTimeoutRef.current) window.clearTimeout(rgbTimeoutRef.current)
      if (bodyMegaTimeoutRef.current) window.clearTimeout(bodyMegaTimeoutRef.current)
      if (bodyRgbTimeoutRef.current) window.clearTimeout(bodyRgbTimeoutRef.current)
      document.body.classList.remove('body--mega-click', 'body--rgb-festival')
    }
  }, [])

  useEffect(() => {
    if (!isMegaPressed) return

    document.body.classList.add('body--mega-click')
    if (bodyMegaTimeoutRef.current) window.clearTimeout(bodyMegaTimeoutRef.current)
    bodyMegaTimeoutRef.current = window.setTimeout(() => {
      document.body.classList.remove('body--mega-click')
    }, 1650)

    return () => {
      if (bodyMegaTimeoutRef.current) window.clearTimeout(bodyMegaTimeoutRef.current)
      document.body.classList.remove('body--mega-click')
    }
  }, [isMegaPressed])

  useEffect(() => {
    if (!isRgbBurst) return

    document.body.classList.add('body--rgb-festival', 'body--mega-click')
    if (bodyRgbTimeoutRef.current) window.clearTimeout(bodyRgbTimeoutRef.current)
    bodyRgbTimeoutRef.current = window.setTimeout(() => {
      document.body.classList.remove('body--rgb-festival', 'body--mega-click')
    }, 3400)

    return () => {
      if (bodyRgbTimeoutRef.current) window.clearTimeout(bodyRgbTimeoutRef.current)
      document.body.classList.remove('body--rgb-festival', 'body--mega-click')
    }
  }, [isRgbBurst])

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
      Math.round(result.particleCount * (0.55 + visualEffectsFactor)),
      result.symbols,
      result.isMega,
      result.isEmojiExplosion,
      visualEffectCaps.particleCap,
    )
    setParticles((current) => [...current.slice(-(visualEffectCaps.particleCap * 2)), ...spawned])

    const coneBurstCount = Math.max(1, Math.round((result.isEmojiExplosion ? 2 : result.isMega ? 3 : 1) * (0.7 + visualEffectsFactor * 0.55)))
    const cones = createConeSprites(localX, localY, coneBurstCount, result.isMega, visualEffectCaps.coneCap)
    setConeSprites((current) => [...current.slice(-(visualEffectCaps.coneCap * 2)), ...cones])

    if (result.isEmojiExplosion) {
      const fireworks = createViewportFireworks(
        Math.round(Math.max(visualEffectCaps.particleCap + 18, result.particleCount + 22) * (0.7 + visualEffectsFactor * 0.9)),
        result.symbols,
        visualEffectCaps.particleCap + visualEffectCaps.burstCap,
      )
      setScreenFireworks((current) => [...current.slice(-visualEffectCaps.particleCap), ...fireworks])
    }
  }

  function preventKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
  }

  const isActive = state.shishkiPerSecond > 0

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
