import { memo } from 'react'
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

export const StatCard = memo(function StatCard({
  icon = null,
  label,
  value,
  hint,
  contributions,
  delay = 0,
  compact = false,
  className = '',
  formatValue = true,
  valueClassName = '',
  hintClassName = '',
  children,
}) {
  const items = compact ? (contributions?.items?.slice(0, 2) ?? []) : (contributions?.items ?? [])
  const total = items.reduce((s, e) => s + e.value, 0) ?? 0
  const topContributor = items[0] ?? null
  const displayValue = formatValue ? formatNumber(value) : value
  const cardClassName = ['stat-card', compact ? 'stat-card--compact' : '', className].filter(Boolean).join(' ')
  const valueClasses = ['stat-card__value', valueClassName].filter(Boolean).join(' ')
  const hintClasses = ['stat-card__hint', hintClassName].filter(Boolean).join(' ')

  return (
    <div className={cardClassName} style={{ animationDelay: `${delay * 60}ms` }}>
      {(icon || label) && (
        <div className="stat-card__head">
          {icon ? <span className="stat-card__icon">{icon}</span> : null}
          {label ? <span className="stat-card__label">{label}</span> : null}
        </div>
      )}

      <div className={valueClasses}>{displayValue}</div>

      {hint && <div className={hintClasses}>{hint}</div>}

      {children}

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
})

StatCard.displayName = 'StatCard'
