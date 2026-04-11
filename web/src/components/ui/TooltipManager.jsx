import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function TooltipManager() {
  const [tooltip, setTooltip] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function handleMouseMove(e) {
      positionRef.current = { x: e.clientX, y: e.clientY }
      if (!tooltip) return
      setPosition(positionRef.current)
    }

    function getTipFromTarget(target) {
      if (!(target instanceof Element)) return null
      const tipNode = target.closest('[data-tip]')
      return tipNode?.getAttribute('data-tip') || null
    }

    function handleMouseEnter(e) {
      const tip = getTipFromTarget(e.target)
      if (tip) {
        positionRef.current = { x: e.clientX, y: e.clientY }
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setTooltip(tip)
          setPosition(positionRef.current)
        }, 150)
      }
    }

    function handleMouseLeave(e) {
      if (getTipFromTarget(e.target)) {
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
    document.body
  )
}
