import { formatNumber } from '../../lib/format'

function ContributionBar({ entry, total, index }) {
  const share = total > 0 ? Math.max(6, Math.round((entry.value / total) * 100)) : 0

  return (
    <div className="contribution-row">
      <div className="contribution-row__info">
        <span className="contribution-row__rank">#{index + 1}</span>
        <span className="contribution-row__name">{entry.title}</span>
        <span className="contribution-row__val">{formatNumber(entry.value)}</span>
      </div>
      <div className="contribution-bar">
        <div className="contribution-bar__fill" style={{ width: `${share}%` }} />
      </div>
    </div>
  )
}

export function StatCard({ icon, label, value, hint, contributions, delay = 0, compact = false }) {
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
