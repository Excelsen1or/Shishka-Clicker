import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { MarketPortfolio } from './MarketPortfolio.jsx'
import { MarketTicker } from './MarketTicker.jsx'
import { MarketTradePanel } from './MarketTradePanel.jsx'

export const MarketScreen = observer(function MarketScreen() {
  const { uiEconomy, uiState, buyMarketGood, sellMarketGood, activateCampaign } =
    useGameStore()
  const goods = uiEconomy?.marketGoods ?? []
  const campaigns = uiEconomy?.campaigns ?? []
  const shishki = uiState?.shishki ?? 0
  const brokerLevel = uiState?.market?.brokerLevel ?? 0

  return (
    <section className="screen market-screen">
      <div className="screen__header">
        <span className="screen__kicker">Рынок</span>
        <h2 className="screen__title">Серая биржа и прогревы</h2>
        <p className="screen__desc">
          Торгуй дефицитом, двигай цены и покупай подозрительный шум.
        </p>
      </div>

      <MarketTicker goods={goods} />
      <MarketPortfolio goods={goods} shishki={shishki} onSell={sellMarketGood} />
      <MarketTradePanel
        goods={goods}
        campaigns={campaigns}
        shishki={shishki}
        brokerLevel={brokerLevel}
        onBuy={buyMarketGood}
        onCampaign={activateCampaign}
      />
    </section>
  )
})
