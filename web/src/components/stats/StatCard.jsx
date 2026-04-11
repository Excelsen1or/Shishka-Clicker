import { formatNumber, formatFullNumber } from '../../lib/format'
import {ContributionBar} from "./ContributionBar.jsx"
import {memo} from "react"


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
  const items = compact ? (contributions?.items?.slice(0, 3) ?? []) : (contributions?.items ?? [])
  const total = items.reduce((s, e) => s + e.value, 0) ?? 0
  const topContributors = compact ? items.slice(0, 3) : []
  const displayValue = formatValue ? formatNumber(value) : value
  const fullValue = typeof value === 'number' ? formatFullNumber(value) : undefined
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

      <div className={valueClasses} title={fullValue}>{displayValue}</div>

      {hint && <div className={hintClasses}>{hint}</div>}

      {children}

      {compact && topContributors.length > 0 && (
        <div className="stat-card__top-contrib">
          {topContributors.map((c, i) => (
            <div key={c.id} className="stat-card__top-contrib-row" title={`#${i + 1} ${c.title}: ${formatNumber(c.value)}`}>
              <span>#{i + 1}</span>
              <b>{c.title}</b>
              <span className="stat-card__top-contrib-val">{formatNumber(c.value)}</span>
            </div>
          ))}
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
