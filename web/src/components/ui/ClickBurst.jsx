import { memo } from 'react'

export const ClickBurst = memo(function ClickBurst({ bursts }) {
  if (!bursts.length) return null

  return (
    <div className="bursts-layer">
      {bursts.map((burst) => {
        const amount = String(burst.value).match(/\+\S+/)?.[0] ?? burst.value

        return (
          <span
            key={burst.id}
            className={`click-burst click-burst--${burst.type || 'normal'}`}
            style={{ left: burst.x, top: burst.y }}
          >
            {(burst.type === 'mega' || burst.type === 'emoji') && (
              <span className="click-burst__badge">{burst.type === 'emoji' ? 'ЭМОДЗИ' : 'МЕГА'}</span>
            )}
            <span className="click-burst__amount">{amount}</span>
          </span>
        )
      })}
    </div>
  )
})
