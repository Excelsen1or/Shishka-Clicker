import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export function TooltipManager() {
  const [tooltip, setTooltip] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(0)

  useEffect(() => {
    if (window.matchMedia?.('(pointer: coarse)').matches) {
      return undefined
    }

    function flushPosition() {
      frameRef.current = 0
      setPosition(positionRef.current)
    }

    function schedulePositionUpdate() {
      if (frameRef.current) return
      frameRef.current = window.requestAnimationFrame(flushPosition)
    }

    function handleMouseMove(event) {
      positionRef.current = { x: event.clientX, y: event.clientY }
      if (!tooltip) return
      schedulePositionUpdate()
    }

    function getTipFromTarget(target) {
      if (!(target instanceof Element)) return null
      const tipNode = target.closest('[data-tip]')
      return tipNode?.getAttribute('data-tip') || null
    }

    function handleMouseEnter(event) {
      const tip = getTipFromTarget(event.target)
      if (tip) {
        positionRef.current = { x: event.clientX, y: event.clientY }
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setTooltip(tip)
          setPosition(positionRef.current)
        }, 150)
      }
    }

    function handleMouseLeave(event) {
      if (getTipFromTarget(event.target)) {
        clearTimeout(timeoutRef.current)
        setTooltip(null)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      clearTimeout(timeoutRef.current)
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [tooltip])

  if (!tooltip) return null

  return createPortal(
    <div
      ref={tooltipRef}
      className="tooltip-cursor"
      style={{
        position: 'fixed',
        left: `${position.x + 12}px`,
        top: `${position.y + 12}px`,
        pointerEvents: 'none',
        zIndex: 10000,
      }}
    >
      <div className="tooltip-cursor__content">{tooltip}</div>
    </div>,
    document.body,
  )
}
