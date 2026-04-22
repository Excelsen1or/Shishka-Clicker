import { formatFullNumber } from '../../lib/format.js'
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

const PROFILE_LABELS = {
  stable: 'Стабильный',
  volatile: 'Волатильный',
  hype: 'Хайповый',
}

export function MarketTicker({ goods, activeEvent = null }) {
  const tickerItems = goods.length > 0 ? [...goods, ...goods] : []

  return (
    <section className="market-ticker-panel pixel-surface">
      <div className="market-ticker-panel__head">
        <h3>Лента котировок</h3>
        <span className="market-ticker-panel__event">
          {activeEvent
            ? `Сейчас шумит: ${activeEvent.title}`
            : 'Рынок в штатном режиме'}
        </span>
      </div>
      {tickerItems.length > 0 ? (
        <div className="market-ticker">
          <div className="market-ticker__track">
            {tickerItems.map((good, index) => (
              <article
                key={`${good.id}-${index}`}
                className={`market-entity-row market-ticker__item market-ticker__item--${good.profile}`.trim()}
              >
                <span
                  className="market-entity-slot"
                  aria-hidden="true"
                  data-field-code={good.fieldCode}
                >
                  <EntityPlaceholderIcon
                    code={good.fieldCode}
                    label={good.title}
                    type="market"
                    state={good.unlocked ? 'available' : 'locked'}
                    size={32}
                  />
                </span>
                <span className="market-ticker__content">
                  <strong>{good.title}</strong>
                  <span>{formatFullNumber(good.price)} шишек</span>
                  <span>{PROFILE_LABELS[good.profile] ?? 'Спот'}</span>
                  {!good.unlocked ? <span>закрыто</span> : <span>LIVE</span>}
                </span>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p>Пока нет доступных лотов.</p>
      )}
    </section>
  )
}
