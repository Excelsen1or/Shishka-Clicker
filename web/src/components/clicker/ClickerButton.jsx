import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'
import { useNav } from '../../context/NavContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import { formatNumber, formatFullNumber, isNumberAbbreviated } from '../../lib/format'
import discoImage from '../../assets/disco.gif'
import coneImage from '../../assets/cone.png'
import coneV2Image from '../../assets/conev2.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'
import { ConeIcon } from '../ui/ConeIcon'

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function getRandomAngle() {
  return Math.random() * Math.PI * 2
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const TAP_SPEED_WINDOW = 2000

const TAP_SPEED_TIERS = [
  {
    minTps: 0,
    labels: ['Че так медленно', 'Давай, тапай побыстрее', "Расход: 150 шишечек", "Хомяк отдыхает"],
  },
  {
    minTps: 2,
    labels: ['Неплохо!', 'Разгоняемся...', 'КЛИК = ПРОФИТ', 'Так держать!'],
  },
  {
    minTps: 4,
    labels: ['ЖМИИИИ!!!!', 'Тапай, пока шишка горячая', 'Тапай, тапай этого хомячка', 'Ахахах - Лисимп',
      "Пишу Default Squad", "Среднестатистический"
    ],
  },
  {
    minTps: 7,
    labels: ['ЕБАНУТЫЙ РАЗГОН НАХУЙ', 'ЕБАТЬ ТЫ ЖМЯКАЕШЬ', 'ЧУВААААК', 'МАШИНА КЛИКОВ!!!'],
  },
  {
    minTps: 11,
    labels: ['АВТОКЛИКЕР?!', 'ТЫ ВООБЩЕ ЧЕЛОВЕК?!', 'НЕРЕАЛЬНАЯ СКОРОСТЬ', 'БОГА ТАПА ПРИЗВАЛИ'],
  },
]

const IDLE_LABELS = [
  'Ты чо уснул?',
  'Тапать будем, нет?',
  'Всё да?',
  'Блади мышка имба',
  'Шишки сами себя не натапают',
  'Эй, ты тут?',
]

const IDLE_TIMEOUT = 4500

const GREETING_LABELS = [
  'Ты в эдите братан!',
  'Да ну, неужели та самая легенда вернулась?',
]

const RETURN_LABELS = {
  subscriptions: [
    'Всё прокачал?',
    'Подписки не забыл оплатить?',
    'Когда на смену в озон?',
    'На завод пойдешь?',
  ],
  upgrades: [
    'Всё прокачал?',
    'Подписки не забыл оплатить?',
    'Когда на смену в озон?',
    'На завод пойдешь?',
  ],
  meta: [
    'Проверял достижения?',
    'Ну, как там перерождения?',
    'Сколько осколков ожидается?',
    'Перерождение не ждёт',
  ],
  settings: [
    'Всё настроил?',
    'Звук зачем выключил?',
    'Музыка не нужна.',
    'И что ты там накрутил?',
  ],
}

function getTierForTps(tps) {
  for (let i = TAP_SPEED_TIERS.length - 1; i >= 0; i--) {
    if (tps >= TAP_SPEED_TIERS[i].minTps) return TAP_SPEED_TIERS[i]
  }
  return TAP_SPEED_TIERS[0]
}

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
  const [clickerLabel, setClickerLabel] = useState(() => pickRandom(GREETING_LABELS))
  const [isLabelShaking, setIsLabelShaking] = useState(false)

  const visualTimeoutRef = useRef(null)
  const idleTimeoutRef = useRef(null)
  const tapTimestampsRef = useRef([])
  const lastTierIndexRef = useRef(0)
  const lastLabelIndexRef = useRef(0)

  const { state, mineShishki, markAutoClicker } = useGameContext()
  const { visualEffectCaps, visualEffectsFactor } = useSettingsContext()
  const { activeTab } = useNav()
  const { bursts, addBurst, removeBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.42, randomPitch: [-3.9, 5.8] })

  const prevTabRef = useRef(activeTab)

  const particleLimitHint = useMemo(
    () => Math.min(visualEffectCaps.particleCap, Math.ceil(state.clickPower * (1.05 + visualEffectsFactor * 0.45))),
    [state.clickPower, visualEffectCaps.particleCap, visualEffectsFactor],
  )

  const metricItems = useMemo(
    () => [
      { label: 'за клик', value: <><span>+{formatNumber(state.clickPower)}</span> <ConeIcon /></>, fullValue: formatFullNumber(state.clickPower) },
      { label: 'мега-шанс', value: `${formatNumber(state.megaClickChance)}%`, fullValue: formatFullNumber(state.megaClickChance) },
      { label: 'эмодзи', value: `${formatNumber(state.emojiMegaChance)}%`, fullValue: formatFullNumber(state.emojiMegaChance) },
      { label: 'лимит частиц', value: formatNumber(particleLimitHint), fullValue: formatFullNumber(particleLimitHint) },
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
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const prev = prevTabRef.current
    prevTabRef.current = activeTab

    if (activeTab === 'clicker' && prev !== 'clicker') {
      const pool = RETURN_LABELS[prev]
      if (pool) {
        setClickerLabel(pickRandom(pool))
      }
    }
  }, [activeTab])

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

  function scheduleIdleLabel() {
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
    idleTimeoutRef.current = window.setTimeout(() => {
      const label = pickRandom(IDLE_LABELS)
      setClickerLabel(label)
      lastTierIndexRef.current = -1
      setIsLabelShaking(false)
    }, IDLE_TIMEOUT)
  }

  function rotateClickerLabel() {
    const now = Date.now()
    tapTimestampsRef.current.push(now)
    tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => now - t <= TAP_SPEED_WINDOW)

    scheduleIdleLabel()

    const elapsed = (now - tapTimestampsRef.current[0]) / 1000
    const tps = elapsed > 0 ? (tapTimestampsRef.current.length - 1) / elapsed : 0

    setIsLabelShaking(tps >= 7)

    if (tps >= 11) {
      markAutoClicker()
    }

    const tier = getTierForTps(tps)
    const tierIndex = TAP_SPEED_TIERS.indexOf(tier)
    const tierChanged = tierIndex !== lastTierIndexRef.current

    if (tierChanged) {
      lastTierIndexRef.current = tierIndex
      const nextIndex = getRandomInt(0, tier.labels.length - 1)
      lastLabelIndexRef.current = nextIndex
      setClickerLabel(tier.labels[nextIndex])
    } else if (tapTimestampsRef.current.length % 3 === 0) {
      let nextIndex = getRandomInt(0, tier.labels.length - 1)
      if (tier.labels.length > 1) {
        while (nextIndex === lastLabelIndexRef.current) {
          nextIndex = getRandomInt(0, tier.labels.length - 1)
        }
      }
      lastLabelIndexRef.current = nextIndex
      setClickerLabel(tier.labels[nextIndex])
    }
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
    const { x: burstX, y: burstY } = getRandomBurstPoint(event.currentTarget)
    const burstValue = result.isEmojiExplosion
      ? `💥 ЭМОДЗИ +${formattedAmount}`
      : result.isMega
        ? `⚡ МЕГА +${formattedAmount}`
        : `+${formattedAmount}`

    addBurst(burstX, burstY, burstValue)

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
            {particle.symbol === '🌰'
              ? <img src={coneV2Image} alt="" className="cone-icon" />
              : particle.symbol}
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

      <ClickBurst bursts={bursts} onBurstEnd={removeBurst} />
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

        <div className={`clicker-btn__content${isLabelShaking ? ' clicker-btn__content--shake' : ''}`}>
          <span className="clicker-btn__label">{clickerLabel}</span>
        </div>

        <div className="clicker-btn__metrics">
          {metricItems.map((item) => (
            <span key={item.label} className="clicker-btn__metric" {...(item.fullValue && isNumberAbbreviated(String(item.value)) ? { 'data-tip': item.fullValue } : {})}>
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
