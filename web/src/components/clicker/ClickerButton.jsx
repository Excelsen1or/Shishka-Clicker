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
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useSettingsVisuals } from '../../context/SettingsContext'
import { useNav } from '../../context/NavContext'
import { useSound } from '../../hooks/useSound'
import { formatNumber } from '../../lib/format'
import racoonDefaultImage from '../../assets/racoon-pose-128x128.png'
import racoonAltImage from '../../assets/racoon-pose-128x128_2.png'
import racoonIdleImage from '../../assets/racoon-pose-idle-128x128.png'
import racoonMegaImage from '../../assets/racoon-pose-mega-128x128.png'
import racoonMegaAltImage from '../../assets/racoon-pose-mega2-128x128.png'
import coneImage from '../../assets/cone.png'
import coneV2Image from '../../assets/conev2.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'
import { Lightning, PxlKitIcon, SparkleSmall } from '../../lib/pxlkit'
import { ConeIcon } from '../ui/ConeIcon'
import {
  appendWithCapInPlace,
  buildClickEffectPoints,
  buildClickSpawnState,
  easeOutCubic,
  easeOutQuad,
  MAX_CANVAS_DPR,
  pruneExpiredInPlace,
} from './clickEffects'

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const imageCache = new Map()

function loadImage(src) {
  const cached = imageCache.get(src)
  if (cached) return cached

  const image = new Image()
  image.src = src
  imageCache.set(src, image)
  return image
}

function pruneTapTimestampsInPlace(buffer, now) {
  let writeIndex = 0
  for (let index = 0; index < buffer.length; index += 1) {
    if (now - buffer[index] <= TAP_SPEED_WINDOW) {
      buffer[writeIndex] = buffer[index]
      writeIndex += 1
    }
  }
  buffer.length = writeIndex
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

function getPxlIconSprite(cache, iconData, targetSize) {
  const key = `${iconData.name}::${targetSize}`
  const cached = cache.get(key)
  if (cached) return cached

  const pixelSize = Math.max(1, Math.round(targetSize / iconData.size))
  const size = iconData.size * pixelSize
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallback = { canvas, size }
    cache.set(key, fallback)
    return fallback
  }

  ctx.imageSmoothingEnabled = false

  for (let y = 0; y < iconData.grid.length; y += 1) {
    const row = iconData.grid[y]
    for (let x = 0; x < row.length; x += 1) {
      const symbol = row[x]
      if (symbol === '.') continue
      const color = iconData.palette[symbol]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }

  const sprite = { canvas, size }
  cache.set(key, sprite)
  return sprite
}

const TAP_SPEED_WINDOW = 2000
const IDLE_TIMEOUT = 4500
const EFFECTS_VIEWPORT_PADDING = 420

const VISUAL_DURATIONS = {
  tap: 240,
  mega: 680,
  prism: 1300,
}

const TAP_SPEED_TIERS = [
  {
    minTps: 0,
    labels: [
      'Че так медленно',
      'Давай, тапай побыстрее',
      'Расход: 150 шишечек',
      'Хомяк отдыхает',
    ],
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
    labels: [
      'ЕБАНУТЫЙ РАЗГОН НАХУЙ',
      'ЕБАТЬ ТЫ ЖМЯКАЕШЬ',
      'ЧУВАААААК',
      'МАШИНА КЛИКОВ!!!',
    ],
  },
  {
    minTps: 11,
    labels: [
      'АВТОКЛИКЕР?!',
      'ТЫ ВООБЩЕ ЧЕЛОВЕК?!',
      'НЕРЕАЛЬНАЯ СКОРОСТЬ',
      'БОГА ТАПА ПРИЗВАЛИ',
    ],
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

function drawCanvasBurst(ctx, burst, now) {
  const progress = clamp((now - burst.createdAt) / burst.lifetime, 0, 1)
  const eased = easeOutCubic(progress)
  const y = burst.y - 28 - 74 * eased
  const amount = String(burst.value).match(/\+\S+/)?.[0] ?? burst.value
  const badge =
    burst.type === 'emoji' ? 'EMOJI' : burst.type === 'mega' ? 'MEGA' : null
  const fontSize = burst.type === 'emoji' ? 17 : burst.type === 'mega' ? 16 : 15
  const alpha =
    progress < 0.12 ? progress / 0.12 : progress > 0.76 ? 1 - (progress - 0.76) / 0.24 : 1

  ctx.save()
  ctx.globalAlpha = clamp(alpha, 0, 1)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.34)'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  let cursorX = burst.x
  if (badge) {
    ctx.font = '900 10px "Space Mono", monospace'
    const badgeWidth = Math.ceil(ctx.measureText(badge).width) + 16
    ctx.fillStyle =
      burst.type === 'emoji'
        ? 'rgba(255, 91, 211, 0.28)'
        : 'rgba(255, 196, 53, 0.24)'
    ctx.fillRect(cursorX - 10, y - 10, badgeWidth, 16)
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.lineWidth = 2
    ctx.strokeRect(cursorX - 10, y - 10, badgeWidth, 16)
    ctx.fillStyle = 'rgba(255,255,255,0.94)'
    ctx.fillText(badge, cursorX - 2, y)
    cursorX += badgeWidth + 5
  }

  ctx.font = `900 ${fontSize}px "Unbounded", sans-serif`
  ctx.fillStyle =
    burst.type === 'emoji'
      ? '#ffd7f4'
      : burst.type === 'mega'
        ? '#ffffff'
        : '#ffbe32'
  ctx.fillText(amount, cursorX, y)
  ctx.restore()
}

const ClickerEffectsOverlayInner = forwardRef(function ClickerEffectsOverlay(
  { anchorRef },
  ref,
) {
  const [isVisible, setIsVisible] = useState(false)
  const {
    visualEffectCaps,
    visualEffectScaling,
    visualEffectToggles,
    visualEffectsFactor,
  } = useSettingsVisuals()

  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const rafRef = useRef(0)
  const sizeRef = useRef({ left: 0, top: 0, width: 0, height: 0, dpr: 1 })
  const imagesRef = useRef({ cone: null, altCone: null })
  const textSpriteCacheRef = useRef(new Map())
  const effectsRef = useRef({
    particles: [],
    coneSprites: [],
    shockwaves: [],
    bursts: [],
  })
  const visibilityRef = useRef(false)
  const poolsRef = useRef({
    particles: [],
    coneSprites: [],
    shockwaves: [],
    bursts: [],
  })
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
  }, [
    visualEffectCaps,
    visualEffectScaling,
    visualEffectToggles,
    visualEffectsFactor,
  ])

  useEffect(() => {
    visibilityRef.current = isVisible
  }, [isVisible])

  useEffect(() => {
    imagesRef.current.cone = loadImage(coneImage)
    imagesRef.current.altCone = loadImage(coneV2Image)
  }, [])

  const syncOverlayBounds = useCallback(() => {
    const canvas = canvasRef.current
    const anchor = anchorRef?.current
    if (!canvas || !anchor) return

    const rect = anchor.getBoundingClientRect()
    const left = Math.max(0, Math.floor(rect.left - EFFECTS_VIEWPORT_PADDING))
    const top = Math.max(0, Math.floor(rect.top - EFFECTS_VIEWPORT_PADDING))
    const right = Math.min(
      window.innerWidth,
      Math.ceil(rect.right + EFFECTS_VIEWPORT_PADDING),
    )
    const bottom = Math.min(
      window.innerHeight,
      Math.ceil(rect.bottom + EFFECTS_VIEWPORT_PADDING),
    )
    const width = Math.max(1, right - left)
    const height = Math.max(1, bottom - top)
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR)

    sizeRef.current = { left, top, width, height, dpr }

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.left = `${left}px`
    canvas.style.top = `${top}px`
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr)
    ctx.imageSmoothingEnabled = true
    ctxRef.current = ctx
  }, [anchorRef])

  useEffect(() => {
    if (!isVisible) return undefined

    const resizeOverlay = () => {
      syncOverlayBounds()
    }

    resizeOverlay()
    window.addEventListener('resize', resizeOverlay)

    return () => {
      window.removeEventListener('resize', resizeOverlay)
      ctxRef.current = null
    }
  }, [isVisible, syncOverlayBounds])

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) return

    const drawFrame = (time) => {
      rafRef.current = 0
      const ctx = ctxRef.current
      if (!ctx) return

      const now = performance.timeOrigin + time
      const { left, top, width, height } = sizeRef.current
      ctx.clearRect(left, top, width, height)

      const activeEffects = effectsRef.current
      pruneExpiredInPlace(
        activeEffects.particles,
        now,
        poolsRef.current.particles,
      )
      pruneExpiredInPlace(
        activeEffects.coneSprites,
        now,
        poolsRef.current.coneSprites,
      )
      pruneExpiredInPlace(
        activeEffects.shockwaves,
        now,
        poolsRef.current.shockwaves,
      )
      pruneExpiredInPlace(activeEffects.bursts, now, poolsRef.current.bursts)

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
        const progress = clamp(
          (now - particle.createdAt) / particle.lifetime,
          0,
          1,
        )
        const move = particle.isNormalConeDrop
          ? progress
          : easeOutCubic(progress)
        const alpha = particle.isNormalConeDrop
          ? Math.max(0, 1 - progress * 1.45)
          : particle.isEmojiExplosion
            ? progress < 0.1
              ? progress / 0.1
              : progress > 0.48
                ? 1 - easeOutQuad((progress - 0.48) / 0.52)
                : 1
            : particle.isMega
              ? progress < 0.12
                ? progress / 0.12
                : progress > 0.52
                  ? 1 - easeOutQuad((progress - 0.52) / 0.48)
                  : 1
              : progress < 0.12
                ? progress / 0.12
                : progress > 0.72
                  ? 1 - (progress - 0.72) / 0.28
                  : 1
        const normalDrift = particle.isNormalConeDrop
          ? easeOutQuad(progress)
          : 0
        const normalFall = particle.isNormalConeDrop
          ? progress ** (particle.fallCurve ?? 1.65)
          : 0
        const normalArc = particle.isNormalConeDrop
          ? Math.sin(progress * Math.PI * (particle.arcBias ?? 1)) *
            (particle.arcHeight ?? 0)
          : 0
        const normalWobble = particle.isNormalConeDrop
          ? Math.sin(
              progress * Math.PI * (particle.wobbleTurns ?? 1) +
                (particle.wobblePhase ?? 0),
            ) * (particle.wobble ?? 0)
          : 0
        const x = particle.isNormalConeDrop
          ? particle.x + particle.dx * normalDrift + normalWobble
          : particle.x + particle.dx * move
        const y = particle.isNormalConeDrop
          ? particle.y + particle.dy * normalFall - normalArc
          : particle.y + particle.dy * move
        const rotation = particle.isNormalConeDrop
          ? (particle.rotate * easeOutQuad(progress) * Math.PI) / 180
          : (particle.rotate * move * Math.PI) / 180
        const scale = particle.isNormalConeDrop
          ? particle.scale * (1 - progress * 0.08)
          : particle.scale *
            (particle.isEmojiExplosion
              ? 1 + 0.12 * (1 - progress)
              : 0.9 + 0.18 * (1 - progress))
        const fontSize = particle.isEmojiExplosion
          ? 22
          : particle.isMega
            ? 25
            : 20

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        ctx.globalAlpha = clamp(alpha, 0, 1)

        if (
          particle.symbol === 'shishka' &&
          imagesRef.current.altCone?.complete
        ) {
          ctx.drawImage(imagesRef.current.altCone, -10, -10, 20, 20)
        } else if (particle.iconData) {
          const targetSize = particle.isEmojiExplosion
            ? 24
            : particle.isMega
              ? 22
              : 20
          const sprite = getPxlIconSprite(
            textSpriteCacheRef.current,
            particle.iconData,
            targetSize,
          )
          ctx.drawImage(
            sprite.canvas,
            -sprite.size / 2,
            -sprite.size / 2,
            sprite.size,
            sprite.size,
          )
        } else {
          const fillStyle = particle.isMega
            ? 'rgba(255,255,255,0.96)'
            : '#ffc85c'
          const fontWeight =
            particle.isEmojiExplosion || particle.isMega ? 900 : 800
          const sprite = getTextSprite(
            textSpriteCacheRef.current,
            particle.symbol,
            fontSize,
            fillStyle,
            fontWeight,
          )
          ctx.drawImage(
            sprite.canvas,
            -sprite.size / 2,
            -sprite.size / 2,
            sprite.size,
            sprite.size,
          )
        }

        ctx.restore()
      }

      for (const sprite of activeEffects.coneSprites) {
        const progress = clamp((now - sprite.createdAt) / sprite.lifetime, 0, 1)
        const move = easeOutCubic(progress)
        const x = sprite.x + sprite.dx * move
        const y = sprite.y + sprite.dy * move
        const rotation =
          ((sprite.rotateStart +
            (sprite.rotateEnd - sprite.rotateStart) * move) *
            Math.PI) /
          180
        const scale = sprite.scale * (1 - progress * 0.12)
        const alpha = progress < 0.12 ? progress / 0.12 : 1 - progress
        const baseSize = sprite.isMega ? 24 : 18

        if (!imagesRef.current.cone?.complete) continue

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        ctx.globalAlpha = clamp(alpha, 0, 1)
        ctx.drawImage(
          imagesRef.current.cone,
          -baseSize / 2,
          -baseSize / 2,
          baseSize,
          baseSize,
        )
        ctx.restore()
      }

      for (const burst of activeEffects.bursts) {
        drawCanvasBurst(ctx, burst, now)
      }

      const hasCanvasEffects =
        activeEffects.particles.length > 0 ||
        activeEffects.coneSprites.length > 0 ||
        activeEffects.shockwaves.length > 0 ||
        activeEffects.bursts.length > 0

      if (hasCanvasEffects) {
        rafRef.current = window.requestAnimationFrame(drawFrame)
      } else if (visibilityRef.current) {
        setIsVisible(false)
      }
    }

    rafRef.current = window.requestAnimationFrame(drawFrame)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const hasCanvasEffects =
      effectsRef.current.particles.length > 0 ||
      effectsRef.current.coneSprites.length > 0 ||
      effectsRef.current.shockwaves.length > 0 ||
      effectsRef.current.bursts.length > 0

    if (hasCanvasEffects) {
      scheduleDraw()
    }
  }, [isVisible, scheduleDraw])

  useImperativeHandle(
    ref,
    () => ({
      spawn({
        result,
        pointerPoint,
        particlePoint,
        burstPoint,
        shockwavePoint,
      }) {
        const now = Date.now()
        syncOverlayBounds()

        const nextEffects = buildClickSpawnState({
          result,
          pointerPoint,
          particlePoint,
          burstPoint,
          shockwavePoint,
          config: configRef.current,
          now,
          pools: poolsRef.current,
        })

        if (!visibilityRef.current) {
          setIsVisible(true)
        }

        if (nextEffects.burst) {
          appendWithCapInPlace(
            effectsRef.current.bursts,
            [nextEffects.burst.entry],
            nextEffects.burst.cap,
            poolsRef.current.bursts,
          )
        }

        if (nextEffects.particles.length) {
          appendWithCapInPlace(
            effectsRef.current.particles,
            nextEffects.particles,
            configRef.current.visualEffectCaps.particleCap,
            poolsRef.current.particles,
          )
        }

        if (nextEffects.cones.length) {
          appendWithCapInPlace(
            effectsRef.current.coneSprites,
            nextEffects.cones,
            configRef.current.visualEffectCaps.coneCap,
            poolsRef.current.coneSprites,
          )
        }

        if (nextEffects.shockwaves.length) {
          appendWithCapInPlace(
            effectsRef.current.shockwaves,
            nextEffects.shockwaves,
            8,
            poolsRef.current.shockwaves,
          )
        }

        const hasCanvasEffects =
          effectsRef.current.particles.length > 0 ||
          effectsRef.current.coneSprites.length > 0 ||
          effectsRef.current.shockwaves.length > 0 ||
          effectsRef.current.bursts.length > 0

        if (hasCanvasEffects) {
          scheduleDraw()
        }
      },
    }),
    [scheduleDraw, syncOverlayBounds],
  )

  if (!isVisible) return null

  return createPortal(
    <canvas
      ref={canvasRef}
      className="clicker-particles clicker-effects-canvas"
      aria-hidden="true"
    />,
    document.body,
  )
})

const ClickerEffectsOverlay = memo(ClickerEffectsOverlayInner)

export const ClickerButton = observer(function ClickerButton() {
  const [visualState, setVisualState] = useState('idle')
  const [heroPose, setHeroPose] = useState('idle')
  const [clickerLabel, setClickerLabel] = useState(() =>
    pickRandom(GREETING_LABELS),
  )
  const [isLabelShaking, setIsLabelShaking] = useState(false)
  const [normalHeroFrame, setNormalHeroFrame] = useState(0)
  const [megaHeroFrame, setMegaHeroFrame] = useState(0)

  const visualTimeoutRef = useRef(null)
  const idleTimeoutRef = useRef(null)
  const tapTimestampsRef = useRef([])
  const lastTierIndexRef = useRef(0)
  const lastLabelIndexRef = useRef(0)
  const effectsOverlayRef = useRef(null)
  const buttonRef = useRef(null)

  const { clickerMetrics, mineShishki, markAutoClicker } = useGameStore()
  const { visualEffectToggles } = useSettingsVisuals()
  const { activeTab } = useNav()
  const { play } = useSound(shishkaSound, {
    volume: 0.42,
    randomPitch: [-3.9, 5.8],
  })

  const prevTabRef = useRef(activeTab)

  const metricItems = useMemo(
    () => [
      {
        label: 'Сила клика',
        value: (
          <>
            <span>+{clickerMetrics.clickPowerText}</span> <ConeIcon />
          </>
        ),
      },
      {
        label: 'Мега-клик',
        value: (
          <>
            <PxlKitIcon
              icon={Lightning}
              size={16}
              colorful
              className="pixel-inline-icon"
            />
            <span>{clickerMetrics.megaClickChanceText}</span>
          </>
        ),
        streak: clickerMetrics.megaClickStreak,
      },
      {
        label: 'Эмодзи',
        value: (
          <>
            <PxlKitIcon
              icon={SparkleSmall}
              size={16}
              colorful
              className="pixel-inline-icon"
            />
            <span>{clickerMetrics.emojiMegaChanceText}</span>
          </>
        ),
        streak: clickerMetrics.emojiBurstStreak,
      },
    ],
    [clickerMetrics],
  )

  const isCharged =
    visualEffectToggles.clickAnimations && visualState !== 'idle'
  const heroImage =
    heroPose === 'idle'
      ? racoonIdleImage
      : heroPose === 'mega'
        ? [racoonMegaImage, racoonMegaAltImage][megaHeroFrame]
        : [racoonDefaultImage, racoonAltImage][normalHeroFrame]

  useEffect(() => {
    return () => {
      if (visualTimeoutRef.current)
        window.clearTimeout(visualTimeoutRef.current)
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

      if (visualTimeoutRef.current)
        window.clearTimeout(visualTimeoutRef.current)
      visualTimeoutRef.current = window.setTimeout(() => {
        setVisualState('idle')
      }, VISUAL_DURATIONS[nextState])
    })
  }

  function blockKeyboardActivation(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
  }

  function scheduleIdleLabel() {
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
    idleTimeoutRef.current = window.setTimeout(() => {
      setHeroPose('idle')
      setClickerLabel(pickRandom(IDLE_LABELS))
      lastTierIndexRef.current = -1
      setIsLabelShaking(false)
    }, IDLE_TIMEOUT)
  }

  function rotateClickerLabel() {
    const now = Date.now()
    tapTimestampsRef.current.push(now)
    pruneTapTimestampsInPlace(tapTimestampsRef.current, now)

    scheduleIdleLabel()

    const elapsed = (now - tapTimestampsRef.current[0]) / 1000
    const tps =
      elapsed > 0 ? (tapTimestampsRef.current.length - 1) / elapsed : 0

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
    const nextVisualState = result.isEmojiExplosion
      ? 'prism'
      : result.isMega
        ? 'mega'
        : 'tap'
    const nextHeroPose = result.isMega || result.isEmojiExplosion ? 'mega' : 'tap'

    setHeroPose(nextHeroPose)
    if (nextHeroPose === 'mega') {
      setMegaHeroFrame((current) => (current + 1) % 2)
    } else {
      setNormalHeroFrame((current) => (current + 1) % 2)
    }

    if (visualEffectToggles.clickAnimations) {
      armVisualState(nextVisualState)
    }

    rotateClickerLabel()

    const effectPoints = buildClickEffectPoints(event.currentTarget, event)
    effectsOverlayRef.current?.spawn({
      result,
      ...effectPoints,
    })
  }

  return (
    <div className="clicker-wrap clicker-wrap--pixel">
      <div className="clicker-wrap__metrics" aria-label="Показатели клика">
        {metricItems.map((item) => (
          <div
            key={item.label}
            className="clicker-wrap__metric clicker-wrap__metric--pixel"
          >
            {item.streak > 0 && (
              <span className="clicker-wrap__metric-streak pixel-badge">
                x{formatNumber(item.streak)}
              </span>
            )}
            <b>{item.value}</b>
            <small>{item.label}</small>
          </div>
        ))}
      </div>

      <button
        ref={buttonRef}
        type="button"
        className={`clicker-btn clicker-btn--pixel ${isCharged ? 'clicker-btn--charged' : ''} ${visualState !== 'idle' ? `clicker-btn--${visualState}` : ''}`.trim()}
        data-buff-state={visualState}
        onClick={handleClick}
        onKeyDown={blockKeyboardActivation}
        onKeyUp={blockKeyboardActivation}
        aria-label="Добыть шишки"
      >
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--tl"
          aria-hidden="true"
        />
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--tr"
          aria-hidden="true"
        />
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--bl"
          aria-hidden="true"
        />
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--br"
          aria-hidden="true"
        />
        {visualEffectToggles.clickAnimations && (
          <span className="clicker-btn__aura" />
        )}

        <div className="clicker-btn__core">
          {visualEffectToggles.clickAnimations && (
            <span className="clicker-btn__core-ring clicker-btn__core-ring--outer" />
          )}
          {visualEffectToggles.clickAnimations && (
            <span className="clicker-btn__core-ring clicker-btn__core-ring--inner" />
          )}
          <div className="clicker-btn__hero-shell">
            <span className="clicker-btn__hero-grid" aria-hidden="true" />
            <span className="clicker-btn__hero-badge pixel-badge" aria-hidden="true">
              <PxlKitIcon
                icon={SparkleSmall}
                size={12}
                colorful
                className="pixel-inline-icon"
              />
              <span>PXL-01</span>
            </span>
            <span className="clicker-btn__hero-motion">
              <img
                src={heroImage}
                alt="Шишка"
                className="clicker-btn__hero"
                draggable={false}
              />
            </span>
          </div>
        </div>

        <div
          className={`clicker-btn__content${isLabelShaking ? ' clicker-btn__content--shake' : ''}`}
        >
          <span className="clicker-btn__label">{clickerLabel}</span>
        </div>
      </button>

      <ClickerEffectsOverlay ref={effectsOverlayRef} anchorRef={buttonRef} />
    </div>
  )
})
