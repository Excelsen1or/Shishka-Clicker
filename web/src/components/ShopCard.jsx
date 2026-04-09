import { formatNumber } from '../lib/format'

export function ShopCard({ item, level, cost, canBuy, onBuy }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-sm text-white/65">{item.description}</p>
        </div>
        <div className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-100">
          ур. {level}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <div>
          <div className="text-white/50">Эффект</div>
          <div className="font-medium text-fuchsia-100">{item.effectLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-white/50">Цена</div>
          <div className="font-medium text-white">
            {formatNumber(cost)} {item.currency === 'money' ? '💵' : '🌰'}
          </div>
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-2xl px-4 py-3 font-semibold transition enabled:bg-fuchsia-500 enabled:text-white enabled:hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        disabled={!canBuy}
        onClick={onBuy}
      >
        Купить
      </button>
    </div>
  )
}
