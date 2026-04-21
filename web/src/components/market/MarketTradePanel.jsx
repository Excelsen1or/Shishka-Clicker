import { formatFullNumber } from '../../lib/format.js'
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

export function MarketTradePanel({
  goods,
  campaigns,
  shishki,
  feeRate,
  onBuy,
  onSell,
  onCampaign,
}) {
  return (
    <section className="market-panel pixel-surface">
      <h3>Сделки и прогревы</h3>
      <p>
        Комиссия: {Math.round(feeRate * 1000) / 10}% за вход и выход. Чем выше
        брокер и мета-пассивки, тем меньше срез.
      </p>
      {goods.length > 0 ? (
        <div className="market-trade-grid">
          {goods.map((good) => {
            const buyOneFee = Math.ceil(good.price * feeRate)
            const buyFiveFee = Math.ceil(good.price * 5 * feeRate)
            const buyOneTotal = good.price + buyOneFee
            const buyFiveTotal = good.price * 5 + buyFiveFee
            const canBuyOne = good.unlocked && shishki >= buyOneTotal
            const canBuyFive = good.unlocked && shishki >= buyFiveTotal
            const canSell = good.unlocked && good.owned > 0

            return (
              <article
                key={good.id}
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
                    state={!good.unlocked ? 'locked' : canBuyOne ? 'available' : 'owned'}
                    size={32}
                  />
                </span>
                <span className="market-action-tile__body">
                  <strong>{good.title}</strong>
                  <span>
                    {!good.unlocked
                      ? good.unlockText
                      : `Спот ${formatFullNumber(good.price)} · в портфеле ${good.owned} шт.`}
                  </span>
                  {good.unlocked ? (
                    <span className="market-action-tile__buttons">
                      <button
                        type="button"
                        onClick={() => onBuy(good.id, 1)}
                        disabled={!canBuyOne}
                      >
                        Купить 1
                      </button>
                      <button
                        type="button"
                        onClick={() => onBuy(good.id, 5)}
                        disabled={!canBuyFive}
                      >
                        Купить 5
                      </button>
                      <button
                        type="button"
                        onClick={() => onSell(good.id, 1)}
                        disabled={!canSell}
                      >
                        Продать 1
                      </button>
                    </span>
                  ) : null}
                </span>
              </article>
            )
          })}
        </div>
      ) : (
        <p>Нет доступных сделок.</p>
      )}
      {campaigns.length > 0 ? (
        <div className="market-campaign-grid">
          {campaigns.map((campaign) => {
            const launchCost = campaign.launchCost ?? campaign.cost
            const disabled = !campaign.unlocked || campaign.active || shishki < launchCost

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
                    state={
                      campaign.active
                        ? 'active'
                        : !campaign.unlocked
                          ? 'locked'
                          : disabled
                            ? 'owned'
                            : 'available'
                    }
                    size={32}
                  />
                </span>
                <span>
                  {!campaign.unlocked
                    ? campaign.unlockText
                    : `${campaign.active ? 'Активно: ' : ''}${campaign.title} · ${formatFullNumber(launchCost)} шишек`}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
