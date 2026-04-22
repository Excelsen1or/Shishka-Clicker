import { memo, useEffect, useRef } from 'react'

const MAX_DPR = 1.25
const PIXEL_SCALE = 6
const NOISE_CELL = 2

function resizeCanvas(canvas, ctx, buffer, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.scale(dpr, dpr)

  buffer.width = Math.max(1, Math.round(width / PIXEL_SCALE))
  buffer.height = Math.max(1, Math.round(height / PIXEL_SCALE))
}

function drawBlob(ctx, width, height, blob, time) {
  const drift = time * blob.speed
  const x = width * blob.anchorX + Math.sin(drift) * blob.swingX
  const y = height * blob.anchorY + Math.cos(drift * blob.wave) * blob.swingY
  const radius = Math.min(width, height) * blob.radius

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, blob.inner)
  gradient.addColorStop(0.55, blob.mid)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawNoise(ctx, width, height) {
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let y = 0; y < height; y += NOISE_CELL) {
    for (let x = 0; x < width; x += NOISE_CELL) {
      if (Math.random() > 0.06) continue
      ctx.fillRect(x, y, NOISE_CELL, NOISE_CELL)
    }
  }
}

export const AmbientCanvas = memo(function AmbientCanvas({
  showAmbient,
  showNoise,
}) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const bufferCanvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return undefined

    if (!showAmbient && !showNoise) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      return undefined
    }

    const ctx = canvas.getContext('2d')
    const bufferCanvas = document.createElement('canvas')
    const bufferCtx = bufferCanvas.getContext('2d')
    if (!ctx || !bufferCtx) return undefined

    bufferCanvasRef.current = bufferCanvas

    const blobs = [
      {
        anchorX: 0.14,
        anchorY: 0.16,
        radius: 0.24,
        swingX: 6,
        swingY: 5,
        speed: 0.00022,
        wave: 0.86,
        inner: 'rgba(255,166,0,0.24)',
        mid: 'rgba(255,166,0,0.08)',
      },
      {
        anchorX: 0.84,
        anchorY: 0.3,
        radius: 0.26,
        swingX: 7,
        swingY: 8,
        speed: 0.00018,
        wave: 1.05,
        inner: 'rgba(55,213,255,0.22)',
        mid: 'rgba(55,213,255,0.08)',
      },
      {
        anchorX: 0.34,
        anchorY: 0.88,
        radius: 0.2,
        swingX: 8,
        swingY: 6,
        speed: 0.00015,
        wave: 0.72,
        inner: 'rgba(255,91,211,0.16)',
        mid: 'rgba(255,91,211,0.06)',
      },
    ]

    const resize = () => {
      resizeCanvas(
        canvas,
        ctx,
        bufferCanvas,
        window.innerWidth,
        window.innerHeight,
      )
    }

    const draw = (time) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const bufferWidth = bufferCanvas.width
      const bufferHeight = bufferCanvas.height

      bufferCtx.clearRect(0, 0, bufferWidth, bufferHeight)
      bufferCtx.fillStyle = 'rgba(7, 10, 18, 0.92)'
      bufferCtx.fillRect(0, 0, bufferWidth, bufferHeight)

      if (showAmbient) {
        for (const blob of blobs) {
          drawBlob(bufferCtx, bufferWidth, bufferHeight, blob, time)
        }
      }

      if (showNoise) {
        drawNoise(bufferCtx, bufferWidth, bufferHeight)
      }

      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(bufferCanvas, 0, 0, width, height)
      frameRef.current = window.requestAnimationFrame(draw)
    }

    resize()
    frameRef.current = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
      }
      bufferCanvasRef.current = null
    }
  }, [showAmbient, showNoise])

  return (
    <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true" />
  )
})
