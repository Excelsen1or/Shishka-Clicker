import { memo } from 'react'

export const ClickBurst = memo(function ClickBurst({ bursts, onBurstEnd }) {
  if (!bursts.length) return null

  return (
    <div className="bursts-layer">
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="click-burst"
          style={{ left: burst.x, top: burst.y }}
          onAnimationEnd={() => onBurstEnd(burst.id)}
        >
          {burst.value}
        </span>
      ))}
    </div>
  )
})
