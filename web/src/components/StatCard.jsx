import { formatNumber } from '../lib/format'
import { DESIGN_SYSTEM } from '../ui/designSystem'

function formatContribution(value, unit = '') {
  return `${formatNumber(value)}${unit ? ` ${unit}` : ''}`.trim()
}

export function StatCard({ label, value, hint, contributions, delay = 0 }) {
  const total = contributions?.items?.reduce((sum, entry) => sum + entry.value, 0) ?? 0

  return (
    <div
      className="stat-card glass-panel rounded-3xl p-4 text-left shadow-sm backdrop-blur-sm"
      style={{ animationDelay: `${delay * DESIGN_SYSTEM.motion.cardStaggerMs}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="stat-card__label text-sm text-white/60">{label}</div>
      </div>

      <div className="stat-card__metric mt-3">
        <div className="stat-card__value text-3xl font-black text-white">{formatNumber(value)}</div>
        <div className="stat-card__hint">{hint || '—'}</div>
      </div>

      {contributions?.items?.length ? (
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="stat-card__meta text-[11px] font-semibold uppercase text-white/40">{DESIGN_SYSTEM.content.contributionTitle}</div>
          <div className="mt-3 space-y-3">
            {contributions.items.map((entry, index) => {
              const share = total > 0 ? Math.max(6, Math.round((entry.value / total) * 100)) : 0

              return (
                <div key={entry.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 text-white/75">
                      <span className="mr-2 text-white/35">#{index + 1}</span>
                      <span className="truncate">{entry.title}</span>
                    </div>
                    <div className="shrink-0 font-medium text-cyan-200">
                      {formatContribution(entry.value, contributions.unit)}
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/6">
                    <div className="stat-card__bar" style={{ width: `${share}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
