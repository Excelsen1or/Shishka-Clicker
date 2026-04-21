import { observer } from 'mobx-react-lite'
import { getMarketFeeRate } from '../../game/economyMath.js'
import { formatNumber } from '../../lib/format.js'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { MarketPortfolio } from './MarketPortfolio.jsx'
import { MarketTicker } from './MarketTicker.jsx'
import { MarketTradePanel } from './MarketTradePanel.jsx'

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

  return (
    <section className="screen market-screen">
      <div className="screen__header">
        <span className="screen__kicker">Рынок</span>
        <h2 className="screen__title">Серая биржа и прогревы</h2>
        <p className="screen__desc">
          Торгуй дефицитом, двигай цены и покупай подозрительный шум.
        </p>
      </div>

      {isUnlocked ? (
        <section className="market-panel pixel-surface">
          <h3>Статус биржи</h3>
          <p>
            Брокер: {brokerLevel} ур. · Комиссия: {Math.round(feeRate * 1000) / 10}
            % {activeEvent ? `· Активное окно: ${activeEvent.title}` : ''}
          </p>
          <p>
            {activeCampaign
              ? `Активный прогрев: ${activeCampaign.title}.`
              : 'Сейчас без прогрева: можно брать спокойные позиции или копить на хайп-окно.'}
          </p>
        </section>
      ) : null}

      {!isUnlocked ? (
        <section className="market-panel pixel-surface">
          <h3>Рынок пока закрыт</h3>
          <p>
            Чтобы открыть рынок, зайди в <strong>Покупки</strong>, открой вкладку{' '}
            <strong>Здания</strong> и купи первый <strong>Ларёк перепродажи</strong>.
          </p>
          <p>
            Нужный слот: {resaleStall ? formatNumber(resaleStall.cost) : '28 000'} шишек.
            Прогресс по условию: {unlockProgress} / 1.
          </p>
        </section>
      ) : null}

      {isUnlocked ? (
        <>
      <MarketTicker goods={goods} />
      <MarketPortfolio goods={goods} shishki={shishki} onSell={sellMarketGood} />
      <MarketTradePanel
        goods={goods}
        campaigns={campaigns}
        shishki={shishki}
        feeRate={feeRate}
        onBuy={buyMarketGood}
        onSell={sellMarketGood}
        onCampaign={activateCampaign}
      />
        </>
      ) : null}
    </section>
  )
})
