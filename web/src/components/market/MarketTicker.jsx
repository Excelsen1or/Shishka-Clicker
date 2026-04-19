import { formatFullNumber } from '../../lib/format.js'
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

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
            <li key={good.id} className="market-entity-row market-ticker__item">
              <span
                className="market-entity-slot"
                aria-hidden="true"
                data-field-code={good.fieldCode}
              >
                <EntityPlaceholderIcon
                  code={good.fieldCode}
                  label={good.title}
                  type="market"
                  state="available"
                  size={32}
                />
              </span>
              <span className="market-ticker__content">
                <strong>{good.title}</strong> · {formatFullNumber(good.price)} шишек
                <span> · {PROFILE_LABELS[good.profile] ?? 'Спот'}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Пока нет доступных лотов.</p>
      )}
    </section>
  )
}
