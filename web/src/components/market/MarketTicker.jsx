import { formatFullNumber } from '../../lib/format.js'

const PROFILE_LABELS = {
  stable: 'Стабильный',
  volatile: 'Волатильный',
  hype: 'Хайповый',
}

export function MarketTicker({ goods }) {
  return (
    <section className="market-panel pixel-surface">
      <h3>Биржа серого шума</h3>
      {goods.length > 0 ? (
        <ul className="market-ticker">
          {goods.map((good) => (
            <li key={good.id}>
              <strong>{good.title}</strong> · {formatFullNumber(good.price)} шишек
              <span> · {PROFILE_LABELS[good.profile] ?? 'Спот'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Пока нет доступных лотов.</p>
      )}
    </section>
  )
}
