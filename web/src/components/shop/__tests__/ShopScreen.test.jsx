import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import { SettingsProvider } from '../../../context/SettingsContext.jsx'
import { ShopScreen } from '../ShopScreen.jsx'

describe('ShopScreen', () => {
  it('renders purchases tabs and per-purchase building gain in the card description', () => {
    const html = renderToStaticMarkup(
      <SettingsProvider>
        <StoresContext.Provider
          value={{
            gameStore: {
              uiEconomy: {
                subscriptions: [
                  {
                    id: 'garagePicker',
                    title: 'Сборщик шишек у гаражей',
                    fieldCode: 'building_garage_picker',
                    baseOutput: 0.1,
                    owned: 3,
                    level: 1,
                    perkSummary:
                      'Уровни усиливают ручной клик и стартовый темп. Сейчас: +0.3 к клику.',
                    cost: 25,
                    canBuy: true,
                    unlocked: true,
                  },
                ],
                upgrades: [
                  {
                    id: 'cashbackBug',
                    title: 'Ошибочный кэшбэк',
                    fieldCode: 'run_cashback_bug',
                    kind: 'clickMultiplier',
                    level: 0,
                    cost: 300,
                    canBuy: false,
                    unlocked: false,
                    unlockText: 'Откроется после первых 80 шишек за всё время.',
                    unlockProgress: { shishki: 24 },
                    unlockRule: { shishki: 80 },
                  },
                ],
              },
              buySubscription: () => {},
              buyUpgrade: () => {},
            },
          }}
        >
          <ShopScreen initialView="buildings" />
        </StoresContext.Provider>
      </SettingsProvider>,
    )

    expect(html).toContain('Разделы покупок')
    expect(html).toContain('Здания')
    expect(html).toContain('Усиления')
    expect(html).toContain('+0,1 шишки/сек за покупку')
    expect(html).toContain('+0.3 к клику')
  })

  it('renders player-friendly upgrade effect labels instead of internal kind ids', () => {
    const html = renderToStaticMarkup(
      <SettingsProvider>
        <StoresContext.Provider
          value={{
            gameStore: {
              uiEconomy: {
                subscriptions: [],
                upgrades: [
                  {
                    id: 'warehouseRhythm',
                    title: 'Складской ритм',
                    fieldCode: 'run_warehouse_rhythm',
                    kind: 'globalMultiplier',
                    value: 0.25,
                    level: 1,
                    cost: 138,
                    canBuy: true,
                    unlocked: true,
                  },
                ],
              },
              buySubscription: () => {},
              buyUpgrade: () => {},
            },
          }}
        >
          <ShopScreen initialView="upgrades" />
        </StoresContext.Provider>
      </SettingsProvider>,
    )

    expect(html).toContain('+25% к производству за уровень')
    expect(html).toContain('Эффект: Буст производства')
    expect(html).not.toContain('globalMultiplier')
  })

  it('moves price into the purchase button and shows tar level as УС badge', () => {
    const html = renderToStaticMarkup(
      <SettingsProvider>
        <StoresContext.Provider
          value={{
            gameStore: {
              uiEconomy: {
                subscriptions: [
                  {
                    id: 'garagePicker',
                    title: 'Сборщик шишек у гаражей',
                    fieldCode: 'building_garage_picker',
                    baseOutput: 0.1,
                    owned: 3,
                    level: 2,
                    perkSummary:
                      'Уровни усиливают ручной клик и стартовый темп. Сейчас: +0.3 к клику.',
                    cost: 132,
                    canBuy: true,
                    unlocked: true,
                  },
                ],
                upgrades: [],
              },
              buySubscription: () => {},
              buyUpgrade: () => {},
            },
          }}
        >
          <ShopScreen initialView="buildings" />
        </StoresContext.Provider>
      </SettingsProvider>,
    )

    expect(html).not.toContain('Куплено:')
    expect(html).not.toContain('Цена:')
    expect(html).not.toContain('Уровень смолы:')
    expect(html).toContain('УС 2')
    expect(html).toContain('132 шишек')
    expect(html).not.toContain('>Купить<')
  })

  it('renders locked styling for unavailable purchase content', () => {
    const html = renderToStaticMarkup(
      <SettingsProvider>
        <StoresContext.Provider
          value={{
            gameStore: {
              uiEconomy: {
                subscriptions: [
                  {
                    id: 'pickupPoint',
                    title: 'ПВЗ на окраине',
                    fieldCode: 'building_pickup_point',
                    owned: 0,
                    level: 0,
                    perkSummary: 'Следующий ранний логистический слой.',
                    cost: 75,
                    canBuy: false,
                    unlocked: false,
                    unlockText:
                      'Откроется после 90 шишек за всё время или первой покупки "Сборщик шишек у гаражей".',
                    unlockProgress: { shishki: 20 },
                    unlockRule: { shishki: 90 },
                  },
                ],
                upgrades: [
                  {
                    id: 'cashbackBug',
                    title: 'Ошибочный кэшбэк',
                    fieldCode: 'run_cashback_bug',
                    kind: 'clickMultiplier',
                    level: 0,
                    cost: 300,
                    canBuy: false,
                    unlocked: false,
                    unlockText: 'Откроется после первых 80 шишек за всё время.',
                    unlockProgress: { shishki: 20 },
                    unlockRule: { shishki: 80 },
                  },
                ],
              },
              buySubscription: () => {},
              buyUpgrade: () => {},
            },
          }}
        >
          <ShopScreen initialView="buildings" />
        </StoresContext.Provider>
      </SettingsProvider>,
    )

    expect(html).toContain('shop-card--locked')
    expect(html).toContain('Заблокировано')
    expect(html).toContain('20 / 90')
  })
})
