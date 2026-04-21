import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import { MarketScreen } from '../MarketScreen.jsx'

const store = {
  gameStore: {
    uiEconomy: {
      marketGoods: [
        {
          id: 'parallelImport',
          fieldCode: 'market_parallel_import',
          title: 'Параллельный завоз',
          price: 110,
          owned: 3,
          averageBuyPrice: 90,
          profile: 'volatile',
          unlocked: true,
        },
      ],
      campaigns: [
        {
          id: 'iceFlexer',
          fieldCode: 'campaign_ice_flexer',
          title: 'Ледяной флексер',
          active: false,
          cost: 8000,
          launchCost: 8000,
          unlocked: true,
        },
      ],
    },
    uiState: {
      shishki: 500,
      activeEvent: {
        id: 'districtHype',
        title: 'Районный хайп',
      },
      market: {
        unlocked: true,
      },
    },
    buyMarketGood: () => {},
    sellMarketGood: () => {},
    activateCampaign: () => {},
  },
}

describe('MarketScreen', () => {
  it('renders market goods and hype campaigns', () => {
    const html = renderToStaticMarkup(
      <StoresContext.Provider value={store}>
        <MarketScreen />
      </StoresContext.Provider>,
    )

    expect(html).toContain('Параллельный завоз')
    expect(html).toContain('Ледяной флексер')
    expect(html).toContain('500')
    expect(html).toContain('Ликвидность')
    expect(html).toContain('Брокер')
    expect(html).toContain('Районный хайп')
    expect(html).toContain('Купить 1')
    expect(html).toContain('Комиссия')
    expect(html).toContain('Продать 1')
    expect(html).toContain('>MP<')
    expect(html).toContain('>CI<')
  })

  it('renders a locked-state message before the market is unlocked', () => {
    const html = renderToStaticMarkup(
      <StoresContext.Provider
        value={{
          gameStore: {
            ...store.gameStore,
            uiState: {
              ...store.gameStore.uiState,
              market: {
                unlocked: false,
              },
            },
          },
        }}
      >
        <MarketScreen />
      </StoresContext.Provider>,
    )

    expect(html).toContain('Рынок пока закрыт')
    expect(html).toContain('Ларёк перепродажи')
    expect(html).toContain('Покупки')
    expect(html).toContain('Здания')
    expect(html).not.toContain('Купить 1 Параллельный завоз')
  })
})
