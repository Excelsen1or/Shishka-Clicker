import { useSound } from '../../hooks/useSound.js'
import buySound from '../../assets/audio/ui/wpn_select.mp3'
import sellSound from '../../assets/audio/ui/button3.wav'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import { formatFullNumber, formatNumber } from '../../lib/format.js'
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
  const { play: playBuySound } = useSound(buySound, { volume: 0.14 })
  const { play: playSellSound } = useSound(sellSound, { volume: 0.18 })
  const { play: playDenySound } = useSound(denySound, { volume: 0.14 })

  function handleBuy(goodId, quantity, enabled) {
    if (!enabled) {
      playDenySound()
      return
    }
    playBuySound()
    onBuy(goodId, quantity)
  }

  function handleSell(goodId, quantity, enabled) {
    if (!enabled) {
      playDenySound()
      return
    }
    playSellSound()
    onSell(goodId, quantity)
  }

  function handleCampaign(campaignId, enabled) {
    if (!enabled) {
      playDenySound()
      return
    }
    playBuySound()
    onCampaign(campaignId)
  }

  return (
    <section className="market-panel market-trade-panel pixel-surface">
      <div className="market-panel__head">
        <h3>Торговый слот</h3>
        <span className="market-panel__eyebrow">Баланс: {formatNumber(shishki)} ш.</span>
      </div>
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
                    <span className="market-action-tile__buttons market-action-tile__buttons--trade">
                      <button
                        type="button"
                        className="market-action-btn market-action-btn--buy"
                        onClick={() => handleBuy(good.id, 1, canBuyOne)}
                        aria-disabled={!canBuyOne}
                        aria-label={`Купить 1 ${good.title}`}
                        title={`Купить 1 ${good.title}`}
                      >
                        Куп 1
                      </button>
                      <button
                        type="button"
                        className="market-action-btn market-action-btn--buy"
                        onClick={() => handleBuy(good.id, 5, canBuyFive)}
                        aria-disabled={!canBuyFive}
                        aria-label={`Купить 5 ${good.title}`}
                        title={`Купить 5 ${good.title}`}
                      >
                        Куп 5
                      </button>
                      <button
                        type="button"
                        className="market-action-btn market-action-btn--sell"
                        onClick={() => handleSell(good.id, 1, canSell)}
                        aria-disabled={!canSell}
                        aria-label={`Продать 1 ${good.title}`}
                        title={`Продать 1 ${good.title}`}
                      >
                        Прод 1
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
                onClick={() => handleCampaign(campaign.id, !disabled)}
                aria-disabled={disabled}
                className="market-entity-row market-action-tile market-action-tile--campaign"
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
                <span className="market-action-tile__body">
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
