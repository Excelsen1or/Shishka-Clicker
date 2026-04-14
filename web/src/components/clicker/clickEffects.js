import { formatNumber } from '../../lib/format'

export const CLEANUP_INTERVAL_MS = 120
export const CLEANUP_BUFFER_MS = 120
export const MAX_CANVAS_DPR = 1.5

export const EFFECT_LIFETIMES = {
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
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

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function easeOutCubic(value) {
  return 1 - ((1 - value) ** 3)
}

export function easeOutQuad(value) {
  return 1 - ((1 - value) ** 2)
}

export function appendWithCapInPlace(current, incoming, cap, pool) {
  if (cap <= 0) {
    if (pool) {
      pool.push(...current)
    }
    current.length = 0
    return current
  }

  if (!incoming.length) return current

  current.push(...incoming)

  if (current.length > cap) {
    const now = Date.now()
    const overflow = current.length - cap
    fastExpireOverflowInPlace(current, overflow, now, pool)
  }

  return current
}

function acquirePooledEffect(pool) {
  return pool?.pop() ?? {}
}

function fastExpireOverflowInPlace(current, overflow, now, pool) {
  if (!overflow) return current

  let remaining = overflow

  for (let index = 0; index < current.length && remaining > 0; index += 1) {
    const effect = current[index]
    if (effect.expiresAt <= now) continue

    const elapsed = Math.max(0, now - effect.createdAt)
    const lifetime = Math.max(1, effect.lifetime)
    const progress = clamp(elapsed / lifetime, 0, 1)
    if (progress >= 0.9) {
      remaining -= 1
      continue
    }

    const targetProgress = 0.9 + Math.random() * 0.08
    const adjustedCreatedAt = now - (lifetime * targetProgress)
    effect.createdAt = adjustedCreatedAt
    effect.expiresAt = adjustedCreatedAt + lifetime + CLEANUP_BUFFER_MS
    remaining -= 1
  }

  if (remaining > 0) {
    const removed = current.splice(0, remaining)
    if (pool) {
      pool.push(...removed)
    }
  }

  return current
}

export function pruneExpiredInPlace(current, now, pool) {
  if (!current.length) return current

  let writeIndex = 0

  for (let readIndex = 0; readIndex < current.length; readIndex += 1) {
    const effect = current[readIndex]
    if (effect.expiresAt > now) {
      current[writeIndex] = effect
      writeIndex += 1
    } else if (pool) {
      pool.push(effect)
    }
  }

  current.length = writeIndex
  return current
}

function createParticles(localX, localY, amount, symbols, isMega, isEmojiExplosion, particleCap, now, effectPool) {
  const isNormalConeDrop = !isMega && !isEmojiExplosion
  const maxParticles = isEmojiExplosion || isMega ? Math.min(Math.max(0, particleCap), 5) : Math.max(0, particleCap)
  const total = isNormalConeDrop ? 1 : Math.max(1, Math.min(maxParticles, amount))
  const pool = Array.isArray(symbols) ? symbols : [symbols]
  const lifetime = EFFECT_LIFETIMES.particle[isEmojiExplosion ? 'emoji' : isMega ? 'mega' : 'normal']
  const angleJitter = (Math.PI * 2) / Math.max(total, 1)

  return Array.from({ length: total }, (_, index) => {
    const angle = isNormalConeDrop
      ? (Math.PI / 2) + ((Math.random() - 0.5) * 0.12)
      : isEmojiExplosion
        ? ((Math.PI * 2 * index) / total) + ((Math.random() - 0.5) * angleJitter * 0.9)
        : getRandomAngle()
    const spawnOffset = isNormalConeDrop
      ? { x: (Math.random() - 0.5) * 8, y: -10 - Math.random() * 10 }
      : getRandomOffset(isEmojiExplosion ? 18 : isMega ? 20 : 18)
    const distance = isNormalConeDrop
      ? 156 + Math.random() * 72
      : isEmojiExplosion
        ? 180 + Math.random() * 180
        : 22 + Math.random() * (isMega ? 180 : 92)

    const particle = acquirePooledEffect(effectPool)
    particle.x = localX + spawnOffset.x
    particle.y = localY + spawnOffset.y
    particle.dx = Math.cos(angle) * distance
    particle.dy = Math.sin(angle) * distance
    particle.rotate = isNormalConeDrop
      ? Math.round((Math.random() - 0.5) * 90)
      : Math.round((Math.random() - 0.5) * (isEmojiExplosion ? 1080 : isMega ? 720 : 540))
    particle.scale = isNormalConeDrop
      ? 1.25 + Math.random() * 0.24
      : isEmojiExplosion
        ? 0.72 + Math.random() * 0.16
        : isMega
          ? 0.9 + Math.random() * 0.2
          : 0.9 + Math.random() * 0.58
    particle.symbol = isNormalConeDrop ? '🌰' : pickRandom(pool)
    particle.isMega = isMega
    particle.isEmojiExplosion = isEmojiExplosion
    particle.isNormalConeDrop = isNormalConeDrop
    particle.createdAt = now
    particle.lifetime = lifetime
    particle.expiresAt = now + lifetime + CLEANUP_BUFFER_MS
    return particle
  })
}

function createConeSprites(localX, localY, amount, isMega, coneCap, now, effectPool) {
  if (amount <= 0 || coneCap <= 0) return []

  const total = Math.min(coneCap, isMega ? amount + 3 : amount + 1)
  const lifetime = EFFECT_LIFETIMES.cone

  return Array.from({ length: total }, () => {
    const angle = getRandomAngle()
    const spawnOffset = getRandomOffset(isMega ? 24 : 16)
    const distance = 56 + Math.random() * (isMega ? 165 : 84)

    const sprite = acquirePooledEffect(effectPool)
    sprite.x = localX + spawnOffset.x
    sprite.y = localY + spawnOffset.y
    sprite.dx = Math.cos(angle) * distance
    sprite.dy = Math.sin(angle) * distance
    sprite.rotateStart = Math.round(Math.random() * 360)
    sprite.rotateEnd = Math.round((Math.random() - 0.5) * (isMega ? 1440 : 1080))
    sprite.scale = isMega ? 0.96 + Math.random() * 0.32 : 0.92 + Math.random() * 0.18
    sprite.isMega = isMega
    sprite.createdAt = now
    sprite.lifetime = lifetime
    sprite.expiresAt = now + lifetime + CLEANUP_BUFFER_MS
    return sprite
  })
}

function createShockwaves(result, point, now, effectPool) {
  const waveCount = result.isEmojiExplosion ? 2 : 1
  const lifetime = EFFECT_LIFETIMES.shockwave

  return Array.from({ length: waveCount }, (_, index) => {
    const wave = acquirePooledEffect(effectPool)
    wave.delay = index * 160
    wave.x = point.x
    wave.y = point.y
    wave.color = result.isEmojiExplosion
      ? ['rgba(168,85,247,0.72)', 'rgba(34,211,238,0.72)', 'rgba(255,166,0,0.72)'][index]
      : index === 0
        ? 'rgba(250,204,21,0.72)'
        : 'rgba(34,211,238,0.62)'
    wave.createdAt = now + index * 160
    wave.lifetime = lifetime
    wave.expiresAt = now + index * 160 + lifetime + CLEANUP_BUFFER_MS
    return wave
  })
}

export function buildClickEffectPoints(buttonElement, event) {
  const rect = buttonElement.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const particleAngle = getRandomAngle()
  const burstAngle = getRandomAngle()
  const burstRadiusBase = Math.min(rect.width, rect.height) * 0.28
  const burstRadius = burstRadiusBase + Math.random() * (burstRadiusBase * 0.42)
  const hasPointerCoords = Number.isFinite(event.clientX) && Number.isFinite(event.clientY)

  return {
    particlePoint: {
      x: centerX + Math.cos(particleAngle) * burstRadius,
      y: centerY + Math.sin(particleAngle) * burstRadius,
    },
    burstPoint: {
      x: centerX + Math.cos(burstAngle) * burstRadius,
      y: centerY + Math.sin(burstAngle) * burstRadius,
    },
    shockwavePoint: {
      x: hasPointerCoords ? event.clientX : centerX,
      y: hasPointerCoords ? event.clientY : centerY,
    },
  }
}

export function buildClickSpawnState({ result, particlePoint, burstPoint, shockwavePoint, config, now, pools }) {
  const {
    visualEffectCaps: caps,
    visualEffectScaling: scaling,
    visualEffectToggles: toggles,
    visualEffectsFactor: factor,
  } = config

  const burstType = result.isEmojiExplosion ? 'emoji' : result.isMega ? 'mega' : 'normal'
  const burstLifetime = EFFECT_LIFETIMES.burst[burstType]
  const burstCap = Math.round(caps.burstCap * scaling.burstSpawnScale)
  const particleAmount = result.isEmojiExplosion || result.isMega
    ? Math.round(result.particleCount * scaling.particleSpawnScale)
    : result.particleCount
  const coneBurstCount = Math.max(
    0,
    result.isEmojiExplosion
      ? Math.round(2 * scaling.coneSpawnScale)
      : result.isMega
        ? Math.round(1 * scaling.coneSpawnScale)
        : 0,
  )

  return {
    burst: !toggles.floatingNumbers || burstCap <= 0
      ? null
      : {
          cap: burstCap,
          entry: {
            id: `burst-${now}-${Math.random().toString(36).slice(2)}`,
            x: burstPoint.x,
            y: burstPoint.y,
            value: result.isEmojiExplosion
              ? `💥 ЭМОДЗИ +${formatNumber(result.amount)}`
              : result.isMega
                ? `⚡ МЕГА +${formatNumber(result.amount)}`
                : `+${formatNumber(result.amount)}`,
            type: burstType,
            expiresAt: now + burstLifetime + CLEANUP_BUFFER_MS,
          },
        },
    particles: toggles.particles
      ? createParticles(
          particlePoint.x,
          particlePoint.y,
          particleAmount,
          result.symbols,
          result.isMega,
          result.isEmojiExplosion,
          caps.particleCap,
          now,
          pools?.particles,
        )
      : [],
    cones: toggles.coneSprites
      ? createConeSprites(
          particlePoint.x,
          particlePoint.y,
          coneBurstCount,
          result.isMega,
          caps.coneCap,
          now,
          pools?.coneSprites,
        )
      : [],
    shockwaves: result.isMega && toggles.shockwaves && factor > 0.2
      ? createShockwaves(result, shockwavePoint, now, pools?.shockwaves)
      : [],
  }
}
