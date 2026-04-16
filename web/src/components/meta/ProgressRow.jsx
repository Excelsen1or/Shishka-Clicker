import { formatNumber } from '../../lib/format.js'

export const ProgressRow = ({ label, current, goal, alt = false }) => {
  const percent = Math.min(100, (current / Math.max(1, goal)) * 100)

  return (
    <>
      <div className="unlock-progress__row">
        <span>{label}</span>
        <span>
          {formatNumber(current)} / {formatNumber(goal)}
        </span>
      </div>
      <div className="unlock-progress__track">
        <div
          className={`unlock-progress__fill ${alt ? 'unlock-progress__fill--alt' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </>
  )
}
