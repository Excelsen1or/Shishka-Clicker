import {
  useCallback,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'
import { useNav } from '../../context/NavContext'
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

function getRandomOffset(radius) {
  const angle = getRandomAngle()
  const distance = Math.random() * radius

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function appendWithCapInPlace(current, incoming, cap) {
  if (cap <= 0) {
    current.length = 0
    return current
  }

  if (!incoming.length) return current

  current.push(...incoming)

  if (current.length > cap) {
    current.splice(0, current.length - cap)
  }

  return current
}

function pruneExpiredInPlace(current, now) {
  if (!current.length) return current

  let writeIndex = 0

  for (let readIndex = 0; readIndex < current.length; readIndex += 1) {
    if (current[readIndex].expiresAt > now) {
      current[writeIndex] = current[readIndex]
      writeIndex += 1
    }
  }

  current.length = writeIndex
  return current
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function easeOutCubic(value) {
  return 1 - ((1 - value) ** 3)
}

function easeOutQuad(value) {
  return 1 - ((1 - value) ** 2)
}

function loadImage(src) {
  const image = new Image()
  image.src = src
  return image
}

function getTextSprite(cache, symbol, fontSize, fillStyle, fontWeight) {
  const key = `${symbol}::${fontSize}::${fillStyle}::${fontWeight}`
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  const size = Math.ceil(fontSize * 2.6)
  const center = size / 2
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallback = { canvas, size }
    cache.set(key, fallback)
    return fallback
  }

  ctx.font = `${fontWeight} ${fontSize}px "Unbounded", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = fillStyle
  ctx.fillText(String(symbol), center, center)

  const sprite = { canvas, size }
  cache.set(key, sprite)
  return sprite
}

const TAP_SPEED_WINDOW = 2000
const IDLE_TIMEOUT = 4500
const CLEANUP_INTERVAL_MS = 120
const CLEANUP_BUFFER_MS = 120
const MAX_CANVAS_DPR = 1.5

const VISUAL_DURATIONS = {
  tap: 240,
  mega: 680,
  prism: 1300,
}

const EFFECT_LIFETIMES = {
  burst: {
    normal: 840,
    mega: 1220,
    emoji: 1460,
  },
  particle: {
    normal: 920,
    mega: 1120,
    emoji: 1860,
  },
  cone: 920,
  shockwave: 860,
}

const TAP_SPEED_TIERS = [
  {
    minTps: 0,
    labels: ['Че так медленно', 'Давай, тапай побыстрее', 'Расход: 150 шишечек', 'Хомяк отдыхает'],
  },
  {
    minTps: 2,
    labels: ['Неплохо!', 'Разгоняемся...', 'КЛИК = ПРОФИТ', 'Так держать!'],
  },
  {
    minTps: 4,
    labels: [
      'ЖМИИИИ!!!!',
      'Тапай, пока шишка горячая',
      'Тапай, тапай этого хомячка',
      'Ахахахах - Лисимп',
      'Пишу Default Squad',
      'Среднестатистический',
    ],
  },
  {
    minTps: 7,
    labels: ['ЕБАНУТЫЙ РАЗГОН НАХУЙ', 'ЕБАТЬ ТЫ ЖМЯКАЕШЬ', 'ЧУВАААААК', 'МАШИНА КЛИКОВ!!!'],
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

function createParticles(localX, localY, amount, symbols, isMega, isEmojiExplosion, particleCap, now) {
  const maxParticles = isEmojiExplosion || isMega ? Math.min(Math.max(0, particleCap), 5) : Math.max(0, particleCap)
  const total = Math.max(1, Math.min(maxParticles, amount))
  const pool = Array.isArray(symbols) ? symbols : [symbols]
  const lifetime = EFFECT_LIFETIMES.particle[isEmojiExplosion ? 'emoji' : isMega ? 'mega' : 'normal']
  const angleJitter = (Math.PI * 2) / Math.max(total, 1)

  return Array.from({ length: total }, (_, index) => {
    const angle = isEmojiExplosion
      ? ((Math.PI * 2 * index) / total) + ((Math.random() - 0.5) * angleJitter * 0.9)
      : getRandomAngle()
    const spawnOffset = getRandomOffset(isEmojiExplosion ? 18 : isMega ? 20 : 18)
    const distance = isEmojiExplosion
      ? 180 + Math.random() * 180
      : 22 + Math.random() * (isMega ? 180 : 92)

    return {
      x: localX + spawnOffset.x,
      y: localY + spawnOffset.y,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotate: Math.round((Math.random() - 0.5) * (isEmojiExplosion ? 1080 : isMega ? 720 : 540)),
      scale: isEmojiExplosion
        ? 0.9 + Math.random() * 0.2
        : isMega
          ? 0.9 + Math.random() * 0.2
          : 0.9 + Math.random() * 0.58,
      symbol: pickRandom(pool),
      isMega,
      isEmojiExplosion,
      createdAt: now,
      lifetime,
      expiresAt: now + lifetime + CLEANUP_BUFFER_MS,
    }
  })
}

function createConeSprites(localX, localY, amount, isMega, coneCap, now) {
  const total = Math.min(coneCap, isMega ? amount + 3 : amount + 1)
  const lifetime = EFFECT_LIFETIMES.cone

  return Array.from({ length: total }, (_, index) => {
    const angle = getRandomAngle()
    const spawnOffset = getRandomOffset(isMega ? 24 : 16)
    const distance = 56 + Math.random() * (isMega ? 165 : 84)

    return {
      x: localX + spawnOffset.x,
      y: localY + spawnOffset.y,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotateStart: Math.round(Math.random() * 360),
      rotateEnd: Math.round((Math.random() - 0.5) * (isMega ? 1440 : 1080)),
      scale: isMega ? 0.96 + Math.random() * 0.32 : 0.92 + Math.random() * 0.18,
      isMega,
      createdAt: now,
      lifetime,
      expiresAt: now + lifetime + CLEANUP_BUFFER_MS,
    }
  })
}

function createShockwaves(result, point, now) {
  const waveCount = result.isEmojiExplosion ? 2 : 1
  const lifetime = EFFECT_LIFETIMES.shockwave

  return Array.from({ length: waveCount }, (_, index) => ({
    delay: index * 160,
    x: point.x,
    y: point.y,
    color: result.isEmojiExplosion
      ? ['rgba(168,85,247,0.72)', 'rgba(34,211,238,0.72)', 'rgba(255,166,0,0.72)'][index]
      : index === 0
        ? 'rgba(250,204,21,0.72)'
        : 'rgba(34,211,238,0.62)',
    createdAt: now + index * 160,
    lifetime,
    expiresAt: now + index * 160 + lifetime + CLEANUP_BUFFER_MS,
  }))
}

const ClickerEffectsOverlay = memo(forwardRef(function ClickerEffectsOverlay(_, ref) {
  const [bursts, setBursts] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const {
    visualEffectCaps,
    visualEffectScaling,
    visualEffectToggles,
    visualEffectsFactor,
  } = useSettingsContext()

  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const rafRef = useRef(0)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const imagesRef = useRef({
    cone: null,
    altCone: null,
  })
  const textSpriteCacheRef = useRef(new Map())
  const effectsRef = useRef({
    particles: [],
    coneSprites: [],
    shockwaves: [],
  })
  const burstsRef = useRef([])
  const visibilityRef = useRef(false)
  const configRef = useRef({
    visualEffectCaps,
    visualEffectScaling,
    visualEffectToggles,
    visualEffectsFactor,
  })

  useEffect(() => {
    configRef.current = {
      visualEffectCaps,
      visualEffectScaling,
      visualEffectToggles,
      visualEffectsFactor,
    }
  }, [visualEffectCaps, visualEffectScaling, visualEffectToggles, visualEffectsFactor])

  useEffect(() => {
    burstsRef.current = bursts
  }, [bursts])

  useEffect(() => {
    visibilityRef.current = isVisible
  }, [isVisible])

  useEffect(() => {
    imagesRef.current.cone = loadImage(coneImage)
    imagesRef.current.altCone = loadImage(coneV2Image)
  }, [])

  useEffect(() => {
    if (!isVisible) return undefined

    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR)
      const width = window.innerWidth
      const height = window.innerHeight

      sizeRef.current = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctxRef.current = ctx
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      ctxRef.current = null
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isVisible])

  useEffect(() => {
    if (!bursts.length) return undefined

    const intervalId = window.setInterval(() => {
      const now = Date.now()
      setBursts((current) => {
        const next = current.filter((entry) => entry.expiresAt > now)
        const hasCanvasEffects =
          effectsRef.current.particles.length > 0 ||
          effectsRef.current.coneSprites.length > 0 ||
          effectsRef.current.shockwaves.length > 0

        if (!next.length && !hasCanvasEffects && visibilityRef.current) {
          setIsVisible(false)
        }

        return next
      })
    }, CLEANUP_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [bursts.length])

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) return

    const drawFrame = (time) => {
      rafRef.current = 0
      const canvas = canvasRef.current
      const ctx = ctxRef.current

      if (!canvas || !ctx) return

      const now = performance.timeOrigin + time
      const { width, height } = sizeRef.current
      ctx.clearRect(0, 0, width, height)

      const activeEffects = effectsRef.current
      pruneExpiredInPlace(activeEffects.particles, now)
      pruneExpiredInPlace(activeEffects.coneSprites, now)
      pruneExpiredInPlace(activeEffects.shockwaves, now)

      for (const wave of activeEffects.shockwaves) {
        if (now < wave.createdAt) continue

        const progress = clamp((now - wave.createdAt) / wave.lifetime, 0, 1)
        const eased = easeOutCubic(progress)
        const radius = 54 + 74 * eased
        const alpha = 0.8 * (1 - progress)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.lineWidth = 2 + (1 - progress) * 1.4
        ctx.strokeStyle = wave.color
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      for (const particle of activeEffects.particles) {
        const progress = clamp((now - particle.createdAt) / particle.lifetime, 0, 1)
        const move = easeOutCubic(progress)
        const alpha = particle.isEmojiExplosion
          ? (progress < 0.1
              ? progress / 0.1
              : progress > 0.48
                ? 1 - easeOutQuad((progress - 0.48) / 0.52)
                : 1)
          : particle.isMega
            ? (progress < 0.12
                ? progress / 0.12
                : progress > 0.52
                  ? 1 - easeOutQuad((progress - 0.52) / 0.48)
                  : 1)
          : progress < 0.12
            ? progress / 0.12
            : progress > 0.72
              ? 1 - ((progress - 0.72) / 0.28)
              : 1
        const x = particle.x + particle.dx * move
        const y = particle.y + particle.dy * move
        const rotation = (particle.rotate * move * Math.PI) / 180
        const scale = particle.scale * (particle.isEmojiExplosion ? 1 + 0.12 * (1 - progress) : 0.9 + 0.18 * (1 - progress))
        const fontSize = particle.isEmojiExplosion
          ? 30
          : particle.isMega
            ? 25
            : 20

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        ctx.globalAlpha = clamp(alpha, 0, 1)

        if (particle.symbol === '🌰' && imagesRef.current.altCone?.complete) {
          ctx.drawImage(imagesRef.current.altCone, -10, -10, 20, 20)
        } else {
          const fillStyle = particle.isMega ? 'rgba(255,255,255,0.96)' : '#ffc85c'
          const fontWeight = particle.isEmojiExplosion || particle.isMega ? 900 : 800
          const sprite = getTextSprite(textSpriteCacheRef.current, particle.symbol, fontSize, fillStyle, fontWeight)
          ctx.drawImage(sprite.canvas, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size)
        }

        ctx.restore()
      }

      for (const sprite of activeEffects.coneSprites) {
        const progress = clamp((now - sprite.createdAt) / sprite.lifetime, 0, 1)
        const move = easeOutCubic(progress)
        const x = sprite.x + sprite.dx * move
        const y = sprite.y + sprite.dy * move
        const rotation = ((sprite.rotateStart + (sprite.rotateEnd - sprite.rotateStart) * move) * Math.PI) / 180
        const scale = sprite.scale * (1 - progress * 0.12)
        const alpha = progress < 0.12 ? progress / 0.12 : 1 - progress
        const baseSize = sprite.isMega ? 24 : 18

        if (!imagesRef.current.cone?.complete) continue

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        ctx.globalAlpha = clamp(alpha, 0, 1)
        ctx.drawImage(imagesRef.current.cone, -baseSize / 2, -baseSize / 2, baseSize, baseSize)
        ctx.restore()
      }

      const hasCanvasEffects =
        activeEffects.particles.length > 0 ||
        activeEffects.coneSprites.length > 0 ||
        activeEffects.shockwaves.length > 0

      if (hasCanvasEffects) {
        rafRef.current = window.requestAnimationFrame(drawFrame)
      } else if (!burstsRef.current.length && visibilityRef.current) {
        setIsVisible(false)
      }
    }

    rafRef.current = window.requestAnimationFrame(drawFrame)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const hasCanvasEffects =
      effectsRef.current.particles.length > 0 ||
      effectsRef.current.coneSprites.length > 0 ||
      effectsRef.current.shockwaves.length > 0

    if (hasCanvasEffects) {
      scheduleDraw()
    }
  }, [isVisible, scheduleDraw])

  useImperativeHandle(ref, () => ({
    spawn({ result, particlePoint, burstPoint, shockwavePoint }) {
      const now = Date.now()
      const {
        visualEffectCaps: caps,
        visualEffectScaling: scaling,
        visualEffectToggles: toggles,
        visualEffectsFactor: factor,
      } = configRef.current

      if (!visibilityRef.current) {
        setIsVisible(true)
      }

      if (toggles.floatingNumbers) {
        const burstType = result.isEmojiExplosion ? 'emoji' : result.isMega ? 'mega' : 'normal'
        const burstValue = result.isEmojiExplosion
          ? `💥 ЭМОДЗИ +${formatNumber(result.amount)}`
          : result.isMega
            ? `⚡ МЕГА +${formatNumber(result.amount)}`
            : `+${formatNumber(result.amount)}`
        const burstCap = Math.round(caps.burstCap * scaling.burstSpawnScale)
        const burstLifetime = EFFECT_LIFETIMES.burst[burstType]

        if (burstCap > 0) {
          setBursts((current) => [
            ...(burstCap > 1 ? current.slice(-(burstCap - 1)) : []),
            {
              id: `burst-${now}-${Math.random().toString(36).slice(2)}`,
              x: burstPoint.x,
              y: burstPoint.y,
              value: burstValue,
              type: burstType,
              expiresAt: now + burstLifetime + CLEANUP_BUFFER_MS,
            },
          ])
        }
      }

      if (toggles.particles) {
        const spawnedParticles = createParticles(
          particlePoint.x,
          particlePoint.y,
          Math.round(result.particleCount * scaling.particleSpawnScale),
          result.symbols,
          result.isMega,
          result.isEmojiExplosion,
          caps.particleCap,
          now,
        )

        if (spawnedParticles.length) {
          appendWithCapInPlace(effectsRef.current.particles, spawnedParticles, caps.particleCap)
        }
      }

      if (toggles.coneSprites) {
        const coneBurstCount = Math.max(
          0,
          Math.round((result.isEmojiExplosion ? 2 : result.isMega ? 1 : 0.5) * scaling.coneSpawnScale),
        )
        const cones = createConeSprites(
          particlePoint.x,
          particlePoint.y,
          coneBurstCount,
          result.isMega,
          caps.coneCap,
          now,
        )

        if (cones.length) {
          appendWithCapInPlace(effectsRef.current.coneSprites, cones, caps.coneCap)
        }
      }

      if (result.isMega && toggles.shockwaves && factor > 0.2) {
        const waves = createShockwaves(result, shockwavePoint, now)
        appendWithCapInPlace(effectsRef.current.shockwaves, waves, 8)
      }

      const hasCanvasEffects =
        effectsRef.current.particles.length > 0 ||
        effectsRef.current.coneSprites.length > 0 ||
        effectsRef.current.shockwaves.length > 0

      if (hasCanvasEffects) {
        scheduleDraw()
      }
    },
  }))

  if (!isVisible) return null

  return createPortal(
    <>
      <canvas ref={canvasRef} className="clicker-particles clicker-effects-canvas" aria-hidden="true" />
      <ClickBurst bursts={bursts} />
    </>,
    document.body,
  )
}))

export function ClickerButton() {
  const [visualState, setVisualState] = useState('idle')
  const [clickerLabel, setClickerLabel] = useState(() => pickRandom(GREETING_LABELS))
  const [isLabelShaking, setIsLabelShaking] = useState(false)

  const visualTimeoutRef = useRef(null)
  const idleTimeoutRef = useRef(null)
  const tapTimestampsRef = useRef([])
  const lastTierIndexRef = useRef(0)
  const lastLabelIndexRef = useRef(0)
  const effectsOverlayRef = useRef(null)

  const { state, mineShishki, markAutoClicker } = useGameContext()
  const { visualEffectToggles } = useSettingsContext()
  const { activeTab } = useNav()
  const { play } = useSound(shishkaSound, { volume: 0.42, randomPitch: [-3.9, 5.8] })

  const prevTabRef = useRef(activeTab)

  const metricItems = useMemo(
    () => [
      {
        label: 'за клик',
        value: <><span>+{formatNumber(state.clickPower)}</span> <ConeIcon /></>,
        fullValue: formatFullNumber(state.clickPower),
      },
      {
        label: 'мега-шанс',
        value: `${formatNumber(state.megaClickChance)}%`,
        fullValue: formatFullNumber(state.megaClickChance),
        streak: state.megaClickStreak ?? 0,
      },
      {
        label: 'эмодзи',
        value: `${formatNumber(state.emojiMegaChance)}%`,
        fullValue: formatFullNumber(state.emojiMegaChance),
        streak: state.emojiBurstStreak ?? 0,
      },
    ],
    [state.clickPower, state.emojiBurstStreak, state.emojiMegaChance, state.megaClickChance, state.megaClickStreak],
  )

  const isCharged = visualEffectToggles.clickAnimations && visualState !== 'idle'
  const heroImage = discoImage

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
      x: hasPointerCoords ? event.clientX : rect.left + rect.width / 2,
      y: hasPointerCoords ? event.clientY : rect.top + rect.height / 2,
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
      setClickerLabel(pickRandom(IDLE_LABELS))
      lastTierIndexRef.current = -1
      setIsLabelShaking(false)
    }, IDLE_TIMEOUT)
  }

  function rotateClickerLabel() {
    const now = Date.now()
    tapTimestampsRef.current.push(now)
    tapTimestampsRef.current = tapTimestampsRef.current.filter((timestamp) => now - timestamp <= TAP_SPEED_WINDOW)

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
      return
    }

    if (tapTimestampsRef.current.length % 3 === 0) {
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

    if (visualEffectToggles.clickAnimations) {
      armVisualState(nextVisualState)
    }

    rotateClickerLabel()

    effectsOverlayRef.current?.spawn({
      result,
      particlePoint: getRandomBurstPoint(event.currentTarget),
      burstPoint: getRandomBurstPoint(event.currentTarget),
      shockwavePoint: getShockwavePoint(event),
    })
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
        {visualEffectToggles.clickAnimations && <span className="clicker-btn__aura" />}

        <div className="clicker-btn__core">
          {visualEffectToggles.clickAnimations && <span className="clicker-btn__core-ring clicker-btn__core-ring--outer" />}
          {visualEffectToggles.clickAnimations && <span className="clicker-btn__core-ring clicker-btn__core-ring--inner" />}
          <div className="clicker-btn__hero-shell">
            <img
              src={heroImage}
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
            <span
              key={item.label}
              className="clicker-btn__metric"
              {...(item.fullValue && isNumberAbbreviated(String(item.value)) ? { 'data-tip': item.fullValue } : {})}
            >
              {item.streak > 0 && <span className="clicker-btn__metric-streak">x{formatNumber(item.streak)}</span>}
              <b>{item.value}</b>
              <small>{item.label}</small>
            </span>
          ))}
        </div>
      </button>

      <ClickerEffectsOverlay ref={effectsOverlayRef} />
    </div>
  )
}
