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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomClickThreshold() {
  return getRandomInt(6, 12)
}

const DEFAULT_CLICKER_LABEL = 'Нажми на меня'

const CLICKER_LABEL_POOL = [
  'ЖМИИИИ!!!!',
  'ЕБАНУТЫЙ РАЗГОН НАХУЙ',
  'ЕБАТЬ ТЫ ЖМЯКАЕШЬ',
  'Лучше бы котиков гладил',
  'Ахахах - лисимп',
  'Тапай, пока шишка горячая',
  'Тапай, тапай этого хомячка',
  'КЛИК = ПРОФИТ',
]

function createParticles(localX, localY, amount, symbols, isMega, isEmojiExplosion, particleCap) {
  const now = Date.now()
  const maxParticles = isEmojiExplosion ? Math.min(particleCap, 12) : Math.min(particleCap, 16)
  const total = Math.max(1, Math.min(maxParticles, amount))
  const pool = Array.isArray(symbols) ? symbols : [symbols]

  return Array.from({ length: total }, (_, index) => {
    const angle = getRandomAngle()
    const distance = isEmojiExplosion
      ? 220 + Math.random() * 300
      : (22 + Math.random() * (isMega ? 180 : 92))

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

const VISUAL_DURATIONS = {
  tap: 240,
  mega: 680,
  prism: 1300,
}

export function ClickerButton() {
  const [particles, setParticles] = useState([])
  const [coneSprites, setConeSprites] = useState([])
  const [visualState, setVisualState] = useState('idle')
  const [shockwaves, setShockwaves] = useState([])
  const [clickerLabel, setClickerLabel] = useState(DEFAULT_CLICKER_LABEL)

  const visualTimeoutRef = useRef(null)
  const clicksUntilLabelChangeRef = useRef(getRandomClickThreshold())
  const clickerLabelIndexRef = useRef(-1)

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

  function getRandomBurstPoint(buttonElement) {
    const rect = buttonElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angle = getRandomAngle()
    const radiusBase = Math.min(rect.width, rect.height) * 0.28
    const radius = radiusBase + Math.random() * (radiusBase * 0.42)

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    }
  }

  function getShockwavePoint(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const hasPointerCoords = Number.isFinite(event.clientX) && Number.isFinite(event.clientY)

    return {
      x: hasPointerCoords ? event.clientX - rect.left : rect.width / 2,
      y: hasPointerCoords ? event.clientY - rect.top : rect.height / 2,
    }
  }

  function blockKeyboardActivation(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
  }

  function rotateClickerLabel() {
    clicksUntilLabelChangeRef.current -= 1

    if (clicksUntilLabelChangeRef.current > 0) return

    let nextIndex = getRandomInt(0, CLICKER_LABEL_POOL.length - 1)

    if (CLICKER_LABEL_POOL.length > 1) {
      while (nextIndex === clickerLabelIndexRef.current) {
        nextIndex = getRandomInt(0, CLICKER_LABEL_POOL.length - 1)
      }
    }

    clickerLabelIndexRef.current = nextIndex
    setClickerLabel(CLICKER_LABEL_POOL[nextIndex])
    clicksUntilLabelChangeRef.current = getRandomClickThreshold()
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
    rotateClickerLabel()

    const { x, y } = getRandomBurstPoint(event.currentTarget)
    const burstValue = result.isEmojiExplosion
      ? `💥 ЭМОДЗИ +${formattedAmount}`
      : result.isMega
        ? `⚡ МЕГА +${formattedAmount}`
        : `+${formattedAmount}`

    addBurst(x, y, burstValue)

    const spawnedParticles = createParticles(
      x,
      y,
      Math.round(
        result.particleCount * (result.isEmojiExplosion ? 0.12 + visualEffectsFactor * 0.2 : 0.16 + visualEffectsFactor * 0.28),
      ),
      result.symbols,
      result.isMega,
      result.isEmojiExplosion,
      visualEffectCaps.particleCap,
    )

    setParticles((current) => [...current.slice(-visualEffectCaps.particleCap), ...spawnedParticles])

    const coneBurstCount = Math.max(
      0,
      Math.round((result.isEmojiExplosion ? 2 : result.isMega ? 1 : 0.5) * (0.45 + visualEffectsFactor * 0.2)),
    )
    const cones = createConeSprites(x, y, coneBurstCount, result.isMega, visualEffectCaps.coneCap)
    setConeSprites((current) => [...current.slice(-visualEffectCaps.coneCap), ...cones])

    if (result.isMega) {
      const now = Date.now()
      const waveCount = result.isEmojiExplosion ? 3 : 2
      const shockwavePoint = getShockwavePoint(event)
      const waves = Array.from({ length: waveCount }, (_, index) => ({
        id: `sw-${now}-${index}`,
        delay: index * 160,
        x: shockwavePoint.x,
        y: shockwavePoint.y,
        color: result.isEmojiExplosion
          ? ['rgba(168,85,247,0.72)', 'rgba(34,211,238,0.72)', 'rgba(255,166,0,0.72)'][index]
          : index === 0
            ? 'rgba(250,204,21,0.72)'
            : 'rgba(34,211,238,0.62)',
      }))

      setShockwaves((current) => [...current.slice(-6), ...waves])
    }

  }

  const overlayEffects = (
    <>
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
    </>
  )

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
        {shockwaves.map((wave) => (
          <span
            key={wave.id}
            className="shockwave-ring"
            style={{ left: `${wave.x}px`, top: `${wave.y}px`, '--sw-color': wave.color, animationDelay: `${wave.delay}ms` }}
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
          <span className="clicker-btn__label">{clickerLabel}</span>
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

      {createPortal(overlayEffects, document.body)}

    </div>
  )
}
