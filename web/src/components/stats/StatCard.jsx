import { formatNumber } from '../../lib/format'
import {ContributionBar} from "./ContributionBar.jsx"
import {memo} from "react";


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
