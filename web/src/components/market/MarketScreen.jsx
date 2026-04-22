import { observer } from 'mobx-react-lite'
import { getMarketFeeRate } from '../../game/economyMath.js'

import { formatNumber } from '../../lib/format.js'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { MarketPortfolio } from './MarketPortfolio.jsx'
import { MarketTicker } from './MarketTicker.jsx'
import { MarketTradePanel } from './MarketTradePanel.jsx'

function getBrokerTone(level) {
  if (level >= 6) return 'legendary'
  if (level >= 4) return 'epic'
  if (level >= 2) return 'rare'
  if (level >= 1) return 'uncommon'
  return 'common'
}

export const MarketScreen = observer(function MarketScreen() {
  const {
    uiEconomy,
    uiState,
    buyMarketGood,
    sellMarketGood,
    activateCampaign,
  } = useGameStore()
  const isUnlocked = Boolean(uiState?.market?.unlocked)
  const goods = uiEconomy?.marketGoods ?? []
  const campaigns = uiEconomy?.campaigns ?? []
  const buildings = uiEconomy?.buildings ?? []
  const shishki = uiState?.shishki ?? 0
  const brokerLevel = uiEconomy?.brokerLevel ?? 0
  const activeEvent = uiState?.activeEvent ?? null
  const activeCampaign = uiState?.activeCampaign ?? null
  const feeRate = getMarketFeeRate(uiState)
  const resaleStall = buildings.find((item) => item.id === 'resaleStall')
  const unlockProgress = Number(uiState?.buildings?.resaleStall ?? 0)
  const unlockPrice = resaleStall ? formatNumber(resaleStall.cost) : '28 000'
  const brokerTone = getBrokerTone(brokerLevel)
  const hasActiveWindow = Boolean(activeEvent)
  const hasActiveCampaign = Boolean(activeCampaign)

  return (
    <section
      className={`screen market-screen ${isUnlocked ? 'market-screen--open' : 'market-screen--locked'}`.trim()}
    >
      <div className="screen__header market-screen__header">
        <div className="market-screen__header-copy">
          <span className="screen__kicker">Рынок</span>
          <h2 className="screen__title">Торговая биржа</h2>
        </div>
      </div>

      {isUnlocked ? (
        <section className="market-exchange pixel-surface">
          <header className="market-exchange__hero">
            <div className="market-exchange__copy">
              <span className="market-exchange__kicker">Терминал</span>
              <p className="market-exchange__desc">
                Покупай активы дешевле, жди рост цены и продавай в плюс. Следи
                за ивентами и прогревами: они меняют рынок.
              </p>
              <div className="market-exchange__copy-strip"></div>
            </div>

            <div className="market-exchange__stats">
              <article
                className={`market-exchange__stat market-exchange__stat--${brokerTone}`.trim()}
              >
                <span>Брокер</span>
                <strong>{brokerLevel} ур.</strong>
              </article>
              <article className="market-exchange__stat market-exchange__stat--accent">
                <span>Комиссия</span>
                <strong>{Math.round(feeRate * 1000) / 10}%</strong>
              </article>
              <article
                className={`market-exchange__stat ${hasActiveWindow ? 'market-exchange__stat--live' : 'market-exchange__stat--idle'}`.trim()}
              >
                <span>Окно</span>
                <strong>{activeEvent ? activeEvent.title : 'Тихо'}</strong>
              </article>
              <article
                className={`market-exchange__stat ${hasActiveCampaign ? 'market-exchange__stat--live' : 'market-exchange__stat--idle'}`.trim()}
              >
                <span>Прогрев</span>
                <strong>{activeCampaign ? activeCampaign.title : 'Нет'}</strong>
              </article>
            </div>
          </header>

          <MarketTicker goods={goods} activeEvent={activeEvent} />

          <div className="market-exchange__grid">
            <MarketTradePanel
              goods={goods}
              campaigns={campaigns}
              shishki={shishki}
              feeRate={feeRate}
              onBuy={buyMarketGood}
              onSell={sellMarketGood}
              onCampaign={activateCampaign}
            />
            <MarketPortfolio goods={goods} onSell={sellMarketGood} />
          </div>
        </section>
      ) : (
        <section className="market-locker pixel-surface">
          <div className="market-locker__hero">
            <span className="market-locker__badge">
              Терминал биржи недоступен
            </span>
            <h3>Рынок пока закрыт</h3>
            <p>
              Чтобы открыть рынок, зайди в <strong>Покупки</strong>, открой
              вкладку <strong>Здания</strong> и купи первый{' '}
              <strong>Ларёк перепродажи</strong>.
            </p>
          </div>

          <div className="market-locker__ticker" aria-hidden="true">
            <span>LOCK</span>
            <span>PVZ</span>
            <span>GRAY</span>
            <span>HYPE</span>
            <span>LOCK</span>
            <span>PVZ</span>
            <span>GRAY</span>
            <span>HYPE</span>
          </div>

          <div className="market-locker__grid">
            <article className="market-locker__card">
              <span className="market-locker__label">Цена входа</span>
              <strong>{unlockPrice} шишек</strong>
              <p>
                Купи <strong>"Ларёк перепродажи"</strong> и откроешь сделки,
                портфель и прогревы.
              </p>
            </article>
            <article className="market-locker__card">
              <span className="market-locker__label">
                Прогресс разблокировки
              </span>
              <strong>{unlockProgress} / 1</strong>
              <div className="market-locker__progress">
                <span
                  className="market-locker__progress-fill"
                  style={{ width: `${Math.min(100, unlockProgress * 100)}%` }}
                />
              </div>
            </article>
            <article className="market-locker__card">
              <span className="market-locker__label">После открытия</span>
              <strong>Лента котировок</strong>
              <p>Таблица цен, быстрые сделки, портфель и шумовые кампании.</p>
            </article>
          </div>
        </section>
      )}
    </section>
  )
})
