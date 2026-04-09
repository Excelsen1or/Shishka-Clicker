import {MainStore} from "../../MainStore.js"


function ContributionBar({ entry, total, index }) {
  const share = total > 0 ? Math.max(6, Math.round((entry.value / total) * 100)) : 0

  return (
    <div className="contribution-row">
      <div className="contribution-row__info">
        <span className="contribution-row__rank">#{index + 1}</span>
        <span className="contribution-row__name">{entry.title}</span>
        <span className="contribution-row__val">{MainStore.formatShortNumber(entry.value)}</span>
      </div>
      <div className="contribution-bar">
        <div className="contribution-bar__fill" style={{ width: `${share}%` }} />
      </div>
    </div>
  )
}

export function StatCard({ icon, label, value, hint, contributions, delay = 0 }) {
  const total = contributions?.items?.reduce((s, e) => s + e.value, 0) ?? 0

  return (
    <div className="stat-card" style={{ animationDelay: `${delay * 60}ms` }}>
      <div className="stat-card__head">
        <span className="stat-card__icon">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>

      <div className="stat-card__value">{MainStore.formatShortNumber(value)}</div>

      {hint && <div className="stat-card__hint">{hint}</div>}

      {contributions?.items?.length > 0 && (
        <div className="stat-card__breakdown">
          {contributions.items.map((entry, i) => (
            <ContributionBar key={entry.id} entry={entry} total={total} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
