import { useSound } from '../../hooks/useSound.js'
import buySound from '../../assets/audio/ui/wpn_select.mp3'
import sellSound from '../../assets/audio/ui/button3.wav'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import { formatFullNumber, formatNumber } from '../../lib/format.js'
import { LockBadge } from '../shop/LockBadge.jsx'
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
  const unlockedGoods = goods.filter((good) => good.unlocked)
  const lockedGoods = goods.filter((good) => !good.unlocked)
  const unlockedCampaigns = campaigns.filter((campaign) => campaign.unlocked)
  const lockedCampaigns = campaigns.filter((campaign) => !campaign.unlocked)

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
        <h3>Активы</h3>
        <span className="market-panel__eyebrow">Баланс: {formatNumber(shishki)} ш.</span>
      </div>
      <p>
        Комиссия: {Math.round(feeRate * 1000) / 10}% за вход и выход. Чем выше
        брокер и мета-пассивки, тем меньше срез.
      </p>
      {goods.length > 0 ? (
        <div className="market-trade-sections">
          {unlockedGoods.length > 0 ? (
            <section className="shop-group shop-group--active">
              <div className="shop-group__head">
                <span className="shop-group__eyebrow">Доступно сейчас</span>
                <h3 className="shop-group__title">Открытые активы</h3>
                <p className="shop-group__desc">
                  Эти лоты уже открыты. Покупай дешевле, жди рост и выходи в плюс.
                </p>
              </div>
              <div className="market-trade-grid">
                {unlockedGoods.map((good) => {
                  const buyOneFee = Math.ceil(good.price * feeRate)
                  const buyFiveFee = Math.ceil(good.price * 5 * feeRate)
                  const buyOneTotal = good.price + buyOneFee
                  const buyFiveTotal = good.price * 5 + buyFiveFee
                  const canBuyOne = shishki >= buyOneTotal
                  const canBuyFive = shishki >= buyFiveTotal
                  const canSell = good.owned > 0

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
                          state={canBuyOne ? 'available' : 'owned'}
                          size={32}
                        />
                      </span>
                      <span className="market-action-tile__body">
                        <strong>{good.title}</strong>
                        <span>{`Спот ${formatFullNumber(good.price)} · в портфеле ${good.owned} шт.`}</span>
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
                      </span>
                    </article>
                  )
                })}
              </div>
            </section>
          ) : null}

          {lockedGoods.length > 0 ? (
            <section className="shop-group shop-group--locked">
              <div className="shop-group__head">
                <span className="shop-group__eyebrow">Закрыто</span>
                <h3 className="shop-group__title">Закрытые активы</h3>
                <p className="shop-group__desc">
                  Эти лоты откроются по мере роста экономики, как следующая ступень рынка.
                </p>
              </div>
              <div className="market-trade-grid market-trade-grid--locked">
                {lockedGoods.map((good) => (
                  <article
                    key={good.id}
                    className="market-entity-row market-action-tile market-action-tile--locked shop-card--locked"
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
                        state="locked"
                        size={32}
                      />
                    </span>
                    <span className="market-action-tile__body">
                      <strong>{good.title}</strong>
                      <LockBadge item={good} />
                    </span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <p>Нет доступных сделок.</p>
      )}
      {campaigns.length > 0 ? (
        <div className="market-trade-sections">
          {unlockedCampaigns.length > 0 ? (
            <section className="shop-group shop-group--active">
              <div className="shop-group__head">
                <span className="shop-group__eyebrow">Шум и запуск</span>
                <h3 className="shop-group__title">Открытые прогревы</h3>
                <p className="shop-group__desc">
                  Эти кампании можно запускать прямо сейчас, чтобы ускорять рынок и ловить окно.
                </p>
              </div>
              <div className="market-campaign-grid">
                {unlockedCampaigns.map((campaign) => {
                  const launchCost = campaign.launchCost ?? campaign.cost
                  const disabled = campaign.active || shishki < launchCost

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
                          state={campaign.active ? 'active' : disabled ? 'owned' : 'available'}
                          size={32}
                        />
                      </span>
                      <span className="market-action-tile__body">
                        <strong>{campaign.title}</strong>
                        <span>
                          {campaign.active
                            ? 'Активный прогрев'
                            : `Запуск ${formatFullNumber(launchCost)} шишек`}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          {lockedCampaigns.length > 0 ? (
            <section className="shop-group shop-group--locked">
              <div className="shop-group__head">
                <span className="shop-group__eyebrow">Закрыто</span>
                <h3 className="shop-group__title">Закрытые прогревы</h3>
                <p className="shop-group__desc">
                  Эти кампании откроются позже, когда рынок и здания дорастут до нужной ступени.
                </p>
              </div>
              <div className="market-campaign-grid market-campaign-grid--locked">
                {lockedCampaigns.map((campaign) => (
                  <article
                    key={campaign.id}
                    className="market-entity-row market-action-tile market-action-tile--locked shop-card--locked"
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
                        state="locked"
                        size={32}
                      />
                    </span>
                    <span className="market-action-tile__body">
                      <strong>{campaign.title}</strong>
                      <LockBadge item={campaign} />
                    </span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
