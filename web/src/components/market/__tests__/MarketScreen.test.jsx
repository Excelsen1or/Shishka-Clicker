import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SettingsProvider } from '../../../context/SettingsContext.jsx'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import { MarketScreen } from '../MarketScreen.jsx'

const store = {
  gameStore: {
    uiEconomy: {
      buildings: [
        {
          id: 'garagePicker',
          title: 'Сборщик шишек у гаражей',
          unlocked: true,
        },
        { id: 'pickupPoint', title: 'ПВЗ на окраине', unlocked: true },
        { id: 'greySorting', title: 'Серая сортировка', unlocked: true },
        {
          id: 'selfEmployedCrew',
          title: 'Бригада самозанятых',
          unlocked: false,
        },
        {
          id: 'resaleStall',
          title: 'Ларёк перепродажи',
          cost: 28000,
          unlocked: false,
          unlockRule: {
            shishki: 25200,
          },
        },
      ],
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
        {
          id: 'coursePacks',
          fieldCode: 'market_course_packs',
          title: 'Инфокурс по маркетплейсам',
          price: 410,
          owned: 0,
          averageBuyPrice: 0,
          profile: 'hype',
          unlocked: false,
          unlockText: 'Откроется после 1 шт. "Смоляной цех".',
          unlockProgress: {
            shishki: 0,
            previousOwned: 0,
          },
          unlockRule: {
            shishki: 0,
            previousTitle: 'Смоляной цех',
          },
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
        {
          id: 'sundayProphet',
          fieldCode: 'campaign_sunday_prophet',
          title: 'Воскресный пророк',
          active: false,
          cost: 7500,
          launchCost: 7500,
          unlocked: false,
          unlockText: 'Откроется после 2 шт. "Ларёк перепродажи".',
          unlockProgress: {
            shishki: 1,
            previousOwned: 1,
          },
          unlockRule: {
            shishki: 2,
            previousTitle: 'Ларёк перепродажи',
          },
        },
      ],
    },
    uiState: {
      shishki: 500,
      lifetimeShishkiEarned: 10000,
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
    expect(html).toContain('Активы')
    expect(html).toContain('Параллельный завоз')
    expect(html).toContain('Ледяной флексер')
    expect(html).toContain('Открытые прогревы')
    expect(html).toContain('Закрытые прогревы')
    expect(html).toContain('Воскресный пророк')
    expect(html).toContain('500')
    expect(html).toContain('330')
    expect(html).toContain('Ликвидность')
    expect(html).toContain('Баланс')
    expect(html).toContain('Брокер')
    expect(html).toContain('Районный хайп')
    expect(html).toContain('Короткий районный хайп')
    expect(html).not.toContain('<span>Ивент</span>')
    expect(html).toContain('Куп 1')
    expect(html).toContain('Комиссия')
    expect(html).toContain('Прод 1')
    expect(html).toContain('Запустить')
    expect(html).toContain('8K')
    expect(html).toContain('прод 5')
    expect(html).toContain('слить')
    expect(html).toContain('Открыть изображение Ледяной флексер')
    expect(html).toContain('yanix.png')
    expect(html).toContain('Открыть изображение Воскресный пророк')
    expect(html).toContain('voskresenskii.png')
    expect(html).toContain('Закрытые активы')
    expect(html).toContain('Инфокурс по маркетплейсам')
    expect(html).not.toContain('undefined / undefined')
    expect(html).toContain('>MP<')
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
    expect(html).toContain('Осталось заработать 15,2K шишек')
    expect(html).toContain('Открыто зданий: 3 / 5')
    expect(html).not.toContain('Купить 1 Параллельный завоз')
  })
})
