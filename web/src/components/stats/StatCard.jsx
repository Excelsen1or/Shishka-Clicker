import { formatNumber } from '../../lib/format'
import {ContributionBar} from "./ContributionBar.jsx"


export const StatCard = ({ icon, label, value, hint, contributions, delay = 0, compact = false }) => {
  const items = compact ? (contributions?.items?.slice(0, 2) ?? []) : (contributions?.items ?? [])
  const total = items.reduce((s, e) => s + e.value, 0) ?? 0
  const topContributor = items[0] ?? null

  return (
    <div className={`stat-card ${compact ? 'stat-card--compact' : ''}`.trim()} style={{ animationDelay: `${delay * 60}ms` }}>
      <div className="stat-card__head">
        <span className="stat-card__icon">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>

      <div className="stat-card__value">{formatNumber(value)}</div>

      {hint && <div className="stat-card__hint">{hint}</div>}

      {compact && topContributor && (
        <div className="stat-card__top-contrib" title={`#1 ${topContributor.title}: ${formatNumber(topContributor.value)}`}>
          <span>топ вклад</span>
          <b>{topContributor.title}</b>
        </div>
      )}

      {items.length > 0 && (
        <div className="stat-card__breakdown">
          {items.map((entry, i) => (
            <ContributionBar key={entry.id} entry={entry} total={total} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
