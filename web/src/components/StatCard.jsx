import { formatNumber } from '../lib/format'

export function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left shadow-sm backdrop-blur-sm">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{formatNumber(value)}</div>
      {hint ? <div className="mt-1 text-sm text-fuchsia-200">{hint}</div> : null}
    </div>
  )
}
