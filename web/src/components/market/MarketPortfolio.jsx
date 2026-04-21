import { formatFullNumber, formatNumber } from '../../lib/format.js'

export function MarketPortfolio({ goods, shishki, onSell }) {
  const heldGoods = goods.filter((good) => good.owned > 0)

  return (
    <section className="market-panel pixel-surface">
      <h3>Портфель</h3>
      <p>Ликвидность: {formatNumber(shishki)} шишек</p>
      {heldGoods.length > 0 ? (
        <ul className="market-portfolio">
          {heldGoods.map((good) => {
            const deltaPerUnit = good.price - good.averageBuyPrice
            const deltaLabel = deltaPerUnit > 0 ? `+${deltaPerUnit}` : `${deltaPerUnit}`

            return (
              <li key={good.id}>
                <strong>{good.title}</strong> · {good.owned} шт. · средняя{' '}
                {formatFullNumber(good.averageBuyPrice)} · спот{' '}
                {formatFullNumber(good.price)} · P/L {deltaLabel}
                <span className="market-portfolio__actions">
                  <button type="button" onClick={() => onSell(good.id, 1)}>
                    Продать 1
                  </button>
                  <button
                    type="button"
                    onClick={() => onSell(good.id, Math.min(5, good.owned))}
                  >
                    Продать до 5
                  </button>
                  <button type="button" onClick={() => onSell(good.id, good.owned)}>
                    Слить всё
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <p>Портфель пуст. Сначала купи хотя бы один лот.</p>
      )}
    </section>
  )
}
