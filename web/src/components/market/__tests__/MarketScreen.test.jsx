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
          title: 'Параллельный завоз',
          price: 110,
          owned: 3,
          averageBuyPrice: 90,
          profile: 'volatile',
        },
      ],
      campaigns: [
        { id: 'iceFlexer', title: 'Ледяной флексер', active: false, cost: 8000 },
      ],
    },
    uiState: {
      shishki: 500,
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
    expect(html).toContain('Купить 1 Параллельный завоз')
  })
})
