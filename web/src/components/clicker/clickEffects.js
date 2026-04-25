import { formatNumber } from '../../lib/format'

export const CLEANUP_INTERVAL_MS = 120
export const CLEANUP_BUFFER_MS = 120
export const MAX_CANVAS_DPR = 1.5

export const EFFECT_LIFETIMES = {
  burst: 840,
  particle: 1080,
}

function getRandomAngle() {
  return Math.random() * Math.PI * 2
}

export function easeOutCubic(value) {
  return 1 - (1 - value) ** 3
}

export function easeOutQuad(value) {
  return 1 - (1 - value) ** 2
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

  const removed = current.splice(0, overflow)
  if (pool) {
    pool.push(...removed)
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

export function hasActiveCanvasEffects(effects) {
  return (
    (effects?.particles?.length ?? 0) > 0 || (effects?.bursts?.length ?? 0) > 0
  )
}

function createParticles(
  localX,
  localY,
  amount,
  symbols,
  particleCap,
  now,
  effectPool,
) {
  const isNormalConeDrop = true
  const total = 1
  const pool = Array.isArray(symbols) ? symbols : [symbols]
  const lifetime = EFFECT_LIFETIMES.particle

  return Array.from({ length: total }, () => {
    const particle = acquirePooledEffect(effectPool)
    const horizontalDirection = Math.random() < 0.5 ? -1 : 1

    particle.x = localX + (Math.random() - 0.5) * 18
    particle.y = localY - 8 - Math.random() * 14
    particle.dx = horizontalDirection * (18 + Math.random() * 64)
    particle.dy = 88 + Math.random() * 62
    particle.rotate = horizontalDirection * (140 + Math.random() * 260)
    particle.scale = 1.04 + Math.random() * 0.3
    particle.arcHeight = 18 + Math.random() * 28
    particle.wobble = 2 + Math.random() * 12
    particle.wobbleTurns = 0.7 + Math.random() * 1.1
    particle.fallCurve = 1.35 + Math.random() * 0.7
    particle.arcBias = 0.8 + Math.random() * 0.5
    particle.wobblePhase = Math.random() * Math.PI * 2
    particle.symbol = 'shishka'
    particle.iconData = pool.length ? null : null
    particle.isNormalConeDrop = isNormalConeDrop
    particle.createdAt = now
    particle.lifetime = lifetime
    particle.expiresAt = now + lifetime + CLEANUP_BUFFER_MS
    return particle
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
  const hasPointerCoords =
    Number.isFinite(event.clientX) && Number.isFinite(event.clientY)
  const pointerX = hasPointerCoords ? event.clientX : centerX
  const pointerY = hasPointerCoords ? event.clientY : centerY

  return {
    pointerPoint: {
      x: pointerX,
      y: pointerY,
    },
    particlePoint: {
      x: centerX + Math.cos(particleAngle) * burstRadius,
      y: centerY + Math.sin(particleAngle) * burstRadius,
    },
    burstPoint: {
      x: hasPointerCoords
        ? pointerX + (Math.random() - 0.5) * 20
        : centerX + Math.cos(burstAngle) * burstRadius,
      y: hasPointerCoords
        ? pointerY - 28 - Math.random() * 8
        : centerY + Math.sin(burstAngle) * burstRadius,
    },
  }
}

export function buildClickSpawnState({
  result,
  pointerPoint,
  particlePoint,
  burstPoint,
  config,
  now,
  pools,
}) {
  const {
    visualEffectCaps: caps,
    visualEffectScaling: scaling,
    visualEffectToggles: toggles,
  } = config

  const burstLifetime = EFFECT_LIFETIMES.burst
  const burstCap = caps.burstCap
  const particleAmount = Math.max(
    1,
    Math.round(result.particleCount * scaling.particleSpawnScale),
  )
  const spawnParticlePoint = pointerPoint ?? particlePoint

  return {
    burst:
      !toggles.floatingNumbers || burstCap <= 0
        ? null
        : {
            cap: burstCap,
            entry: {
              x: burstPoint.x,
              y: burstPoint.y,
              value: `+${formatNumber(result.amount)}`,
              type: 'normal',
              createdAt: now,
              lifetime: burstLifetime,
              expiresAt: now + burstLifetime + CLEANUP_BUFFER_MS,
            },
          },
    particles: toggles.particles
      ? createParticles(
          spawnParticlePoint.x,
          spawnParticlePoint.y,
          particleAmount,
          result.symbols,
          caps.particleCap,
          now,
          pools?.particles,
        )
      : [],
  }
}
