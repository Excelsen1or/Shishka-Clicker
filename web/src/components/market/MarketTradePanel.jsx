import { formatFullNumber } from '../../lib/format.js'

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
              >
                Купить 1 {good.title} · {formatFullNumber(total)} шишек
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
              >
                {campaign.active ? 'Активно: ' : ''}
                {campaign.title} · {formatFullNumber(campaign.cost)} шишек
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
