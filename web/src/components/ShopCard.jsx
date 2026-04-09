import { formatNumber } from '../lib/format'

const currencyMeta = {
  money: '💵',
  shishki: '🌰',
  knowledge: '📚',
}

export function ShopCard({ item, level, cost, canBuy, onBuy }) {
  const isLocked = item.unlocked === false

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <div className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
              тир {item.tier}
            </div>
          </div>
          <p className="mt-1 text-sm text-white/65">{item.description}</p>
        </div>
        <div className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-100">
          ур. {level}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 text-sm">
        <div className="min-w-0">
          <div className="text-white/50">Эффект</div>
          <div className="font-medium text-fuchsia-100">{item.effectPreview?.currentText ?? item.effectLabel}</div>
          <div className="mt-1 text-xs text-white/45">{item.effectPreview?.nextText}</div>
        </div>
        <div className="text-right">
          <div className="text-white/50">Цена</div>
          <div className="font-medium text-white">
            {formatNumber(cost)} {currencyMeta[item.currency]}
          </div>
        </div>
      </div>

      {isLocked ? (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <div className="font-semibold">Заблокировано</div>
          <div className="mt-1 text-amber-50/80">{item.unlockText}</div>
          <div className="mt-2 text-xs text-amber-50/70">
            Прогресс: {formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)} 🌰{' '}
            · {formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)} 📚
          </div>
        </div>
      ) : null}

      <button
        className="mt-4 w-full rounded-2xl px-4 py-3 font-semibold transition enabled:bg-fuchsia-500 enabled:text-white enabled:hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        disabled={!canBuy || isLocked}
        onClick={onBuy}
      >
        {isLocked ? 'Сначала открой тир' : 'Купить'}
      </button>
    </div>
  )
}
