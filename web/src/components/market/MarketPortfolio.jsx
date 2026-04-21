import { useSound } from '../../hooks/useSound.js'
import sellSound from '../../assets/audio/ui/button3.wav'
import { formatFullNumber, formatNumber } from '../../lib/format.js'

export function MarketPortfolio({ goods, onSell }) {
  const heldGoods = goods.filter((good) => good.owned > 0)
  const portfolioLiquidity = heldGoods.reduce(
    (total, good) => total + good.price * good.owned,
    0,
  )
  const { play: playSellSound } = useSound(sellSound, { volume: 0.18 })

  function handleSell(goodId, quantity) {
    playSellSound()
    onSell(goodId, quantity)
  }

  return (
    <section className="market-panel market-portfolio-panel pixel-surface">
      <div className="market-panel__head">
        <h3>Портфель</h3>
        <span className="market-panel__eyebrow">
          Ликвидность: {formatNumber(portfolioLiquidity)} ш.
        </span>
      </div>
      {heldGoods.length > 0 ? (
        <ul className="market-portfolio">
          {heldGoods.map((good) => {
            const deltaPerUnit = good.price - good.averageBuyPrice
            const deltaLabel = deltaPerUnit > 0 ? `+${deltaPerUnit}` : `${deltaPerUnit}`
            const deltaTone =
              deltaPerUnit > 0 ? 'up' : deltaPerUnit < 0 ? 'down' : 'flat'

            return (
              <li key={good.id} className={`market-portfolio__item market-portfolio__item--${deltaTone}`.trim()}>
                <div className="market-portfolio__meta">
                  <div className="market-portfolio__meta-top">
                    <strong>{good.title}</strong>
                    <span className="market-portfolio__count">{good.owned} шт.</span>
                  </div>
                  <div className="market-portfolio__stats">
                    <span>Средняя {formatFullNumber(good.averageBuyPrice)}</span>
                    <span>Спот {formatFullNumber(good.price)}</span>
                    <span className={`market-portfolio__delta market-portfolio__delta--${deltaTone}`.trim()}>
                      P/L {deltaLabel}
                    </span>
                  </div>
                </div>
                <span className="market-portfolio__actions market-portfolio__actions--trade">
                  <button
                    type="button"
                    className="market-action-btn market-action-btn--sell"
                    onClick={() => handleSell(good.id, 1)}
                    aria-label={`Продать 1 ${good.title}`}
                    title={`Продать 1 ${good.title}`}
                  >
                    Прод 1
                  </button>
                  <button
                    type="button"
                    className="market-action-btn market-action-btn--sell"
                    onClick={() => handleSell(good.id, Math.min(5, good.owned))}
                    aria-label={`Продать до 5 ${good.title}`}
                    title={`Продать до 5 ${good.title}`}
                  >
                    До 5
                  </button>
                  <button
                    type="button"
                    className="market-action-btn market-action-btn--panic"
                    onClick={() => handleSell(good.id, good.owned)}
                    aria-label={`Слить всё ${good.title}`}
                    title={`Слить всё ${good.title}`}
                  >
                    Всё
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
