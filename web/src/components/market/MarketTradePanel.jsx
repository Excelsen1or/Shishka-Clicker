import { formatFullNumber } from '../../lib/format.js'
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

function estimateBuyFee(price, brokerLevel) {
  const feeRate = Math.max(0.02, 0.08 - brokerLevel * 0.005)
  return Math.ceil(price * feeRate)
}

export function MarketTradePanel({
  goods,
  campaigns,
  shishki,
  brokerLevel,
  onBuy,
  onCampaign,
}) {
  return (
    <section className="market-panel pixel-surface">
      <h3>Сделки и прогревы</h3>
      {goods.length > 0 ? (
        <div className="market-trade-grid">
          {goods.map((good) => {
            const fee = estimateBuyFee(good.price, brokerLevel)
            const total = good.price + fee
            const disabled = shishki < total

            return (
              <button
                key={good.id}
                type="button"
                onClick={() => onBuy(good.id, 1)}
                disabled={disabled}
                className="market-entity-row market-action-tile"
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
                    state={disabled ? 'locked' : 'available'}
                    size={32}
                  />
                </span>
                <span>
                  Купить 1 {good.title} · {formatFullNumber(total)} шишек
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p>Нет доступных сделок.</p>
      )}
      {campaigns.length > 0 ? (
        <div className="market-campaign-grid">
          {campaigns.map((campaign) => {
            const disabled = campaign.active || shishki < campaign.cost

            return (
              <button
                key={campaign.id}
                type="button"
                onClick={() => onCampaign(campaign.id)}
                disabled={disabled}
                className="market-entity-row market-action-tile"
              >
                <span
                  className="market-entity-slot"
                  aria-hidden="true"
                  data-field-code={campaign.fieldCode}
                >
                  <EntityPlaceholderIcon
                    code={campaign.fieldCode}
                    label={campaign.title}
                    type="campaign"
                    state={campaign.active ? 'active' : disabled ? 'locked' : 'available'}
                    size={32}
                  />
                </span>
                <span>
                  {campaign.active ? 'Активно: ' : ''}
                  {campaign.title} · {formatFullNumber(campaign.cost)} шишек
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
