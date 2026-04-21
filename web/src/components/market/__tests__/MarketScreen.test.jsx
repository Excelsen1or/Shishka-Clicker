import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SettingsProvider } from '../../../context/SettingsContext.jsx'
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
      <SettingsProvider>
        <StoresContext.Provider value={store}>
          <MarketScreen />
        </StoresContext.Provider>
      </SettingsProvider>,
    )

    expect(html).toContain('market-screen market-screen--open')
    expect(html).toContain('Терминал')
    expect(html).toContain('Лента котировок')
    expect(html).toContain('Торговый слот')
    expect(html).toContain('Параллельный завоз')
    expect(html).toContain('Ледяной флексер')
    expect(html).toContain('500')
    expect(html).toContain('330')
    expect(html).toContain('Ликвидность')
    expect(html).toContain('Баланс')
    expect(html).toContain('Брокер')
    expect(html).toContain('Районный хайп')
    expect(html).toContain('Куп 1')
    expect(html).toContain('Комиссия')
    expect(html).toContain('Прод 1')
    expect(html).toContain('До 5')
    expect(html).toContain('Всё')
    expect(html).toContain('>MP<')
    expect(html).toContain('>CI<')
  })

  it('renders a locked-state message before the market is unlocked', () => {
    const html = renderToStaticMarkup(
      <SettingsProvider>
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
        </StoresContext.Provider>
      </SettingsProvider>,
    )

    expect(html).toContain('market-screen market-screen--locked')
    expect(html).toContain('Рынок пока закрыт')
    expect(html).toContain('Терминал биржи недоступен')
    expect(html).toContain('Ларёк перепродажи')
    expect(html).toContain('Покупки')
    expect(html).toContain('Здания')
    expect(html).toContain('Прогресс разблокировки')
    expect(html).not.toContain('Купить 1 Параллельный завоз')
  })
})
