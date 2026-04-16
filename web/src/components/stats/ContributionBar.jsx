import { memo } from 'react'
import { formatNumber } from '../../lib/format.js'

export const ContributionBar = memo(({ entry, total, index }) => {
  const share =
    total > 0 ? Math.max(6, Math.round((entry.value / total) * 100)) : 0

  return (
    <div className="grid gap-[0.3rem]">
      <div className="contribution-row__info grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[0.45rem]">
        <span className="contribution-row__rank">#{index + 1}</span>
        <span className="contribution-row__name min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {entry.title}
        </span>
        <span className="contribution-row__val">
          {formatNumber(entry.value)}
        </span>
      </div>
      <div className="contribution-bar">
        <div
          className="contribution-bar__fill"
          style={{ width: `${share}%` }}
        />
      </div>
    </div>
  )
})
