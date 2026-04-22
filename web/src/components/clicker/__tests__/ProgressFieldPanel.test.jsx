import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { NavProvider } from '../../../context/NavContext.jsx'
import { SettingsProvider } from '../../../context/SettingsContext.jsx'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import GameStore from '../../../stores/GameStore.js'
import { buildClickerFieldData } from '../../../stores/gameStoreSnapshots.js'
import { ClickerScreen } from '../ClickerScreen.jsx'
import { ProgressFieldPanel } from '../ProgressFieldPanel.jsx'

describe('ProgressFieldPanel', () => {
  it('renders adaptive field items with placeholder tiles', () => {
    const html = renderToStaticMarkup(
      <ProgressFieldPanel
        title="Здания"
        items={[
          {
            id: 'pickupPoint',
            title: 'ПВЗ на окраине',
            code: 'building_pickup_point',
            type: 'building',
            state: 'owned',
            count: 3,
          },
          {
            id: 'garagePicker',
            title: 'Сборщик шишек у гаражей',
            code: 'building_garage_picker',
            type: 'building',
            state: 'locked',
            count: 0,
          },
        ]}
      />,
    )

    expect(html).toContain('Здания')
    expect(html).toContain('BP')
    expect(html).toContain('x3')
    expect(html).toContain('data-state="locked"')
  })

  it('maps campaign statuses and clears expired active campaigns', () => {
    const activeCampaignState = {
      activeCampaign: { id: 'sundayProphet', endsAt: Date.now() + 60_000 },
      market: {
        unlocked: true,
        positions: {},
        prices: {},
        averageBuyPrice: {},
      },
      buildings: {},
      upgrades: {},
      prestigeUpgrades: {},
    }

    const activeResult = buildClickerFieldData(activeCampaignState)
    const activeCampaign = activeResult.marketFieldItems.find(
      (item) => item.id === 'sundayProphet',
    )
    const availableCampaign = activeResult.marketFieldItems.find(
      (item) => item.id === 'grayTour',
    )

    expect(activeCampaign?.state).toBe('active')
    expect(availableCampaign?.state).toBe('locked')

    const expiredCampaignState = {
      ...activeCampaignState,
      activeCampaign: { id: 'sundayProphet', endsAt: Date.now() - 60_000 },
    }

    const clickerFieldDataGetter = Object.getOwnPropertyDescriptor(
      GameStore.prototype,
      'clickerFieldData',
    ).get
    const expiredResult = clickerFieldDataGetter.call({
      uiSnapshotState: expiredCampaignState,
    })
    const expiredCampaign = expiredResult.marketFieldItems.find(
      (item) => item.id === 'sundayProphet',
    )

    expect(expiredCampaign?.state).toBe('locked')
  })

  it('keeps market field entities and deck locked before the market is unlocked', () => {
    const result = buildClickerFieldData({
      activeCampaign: null,
      market: {
        unlocked: false,
        positions: {},
        prices: {},
        averageBuyPrice: {},
      },
      buildings: {},
      upgrades: {},
      prestigeUpgrades: {},
      currentRunShishki: 0,
      totalHeavenlyShishkiEarned: 0,
      lifetimeShishkiEarned: 0,
    })

    const marketGood = result.marketFieldItems.find(
      (item) => item.id === 'parallelImport',
    )
    const campaign = result.marketFieldItems.find(
      (item) => item.id === 'iceFlexer',
    )

    expect(marketGood?.state).toBe('locked')
    expect(campaign?.state).toBe('locked')
    expect(result.deckLocks.market.unlocked).toBe(false)
    expect(result.deckLocks.upgrades.unlocked).toBe(false)
    expect(result.deckLocks.meta.unlocked).toBe(false)
  })

  it('renders locked deck tabs for unavailable sections', () => {
    const fakeStore = {
      gameStore: {
        clickerFieldData: {
          buildingsFieldItems: [
            {
              id: 'pickupPoint',
              title: 'ПВЗ на окраине',
              code: 'building_pickup_point',
              type: 'building',
              state: 'owned',
              count: 1,
              unlocked: true,
            },
          ],
          marketFieldItems: [],
          upgradesFieldItems: [],
          metaFieldItems: [],
          deckLocks: {
            buildings: { unlocked: true },
            market: {
              unlocked: false,
              text: 'Откроется после первой покупки "Ларька перепродажи".',
              progress: 0,
              goal: 1,
            },
            upgrades: {
              unlocked: false,
              text: 'Откроется после первых 80 шишек за всё время.',
              progress: 12,
              goal: 80,
            },
            meta: {
              unlocked: false,
              text: 'Откроется, когда подберёшься к первой квоте небесных шишек.',
              progress: 250,
              goal: 4200,
            },
          },
        },
        clickerMetrics: {
          clickPowerText: '12',
          megaClickChanceText: '0%',
          megaClickStreak: 0,
          emojiMegaChanceText: '0%',
          emojiBurstStreak: 0,
        },
        uiEconomy: { shishkiPerSecond: 12 },
        uiPrestige: {
          currentRunShishki: 250,
          currentQuotaTarget: 1_000,
          heavenlyShishki: 0,
          tarLumps: 0,
        },
        uiState: {
          clickPower: 12,
          market: { unlocked: false },
          activeCampaign: null,
          activeEvent: {
            id: 'districtHype',
            title: 'Районный хайп',
          },
        },
        mineShishki: () => ({
          amount: 12,
          particleCount: 12,
          symbols: ['🌰'],
          isMega: false,
          isEmojiExplosion: false,
        }),
        markAutoClicker: () => {},
      },
    }

    const html = renderToStaticMarkup(
      <SettingsProvider>
        <NavProvider>
          <StoresContext.Provider value={fakeStore}>
            <ClickerScreen />
          </StoresContext.Provider>
        </NavProvider>
      </SettingsProvider>,
    )

    expect(html).toContain('Прогресс, покупки и мета-петля')
    expect(html).toContain('Здания')
    expect(html).toContain('Рынок и хайп')
    expect(html).toContain('Усиления')
    expect(html).toContain('Мета')
    expect(html).toContain('disabled=""')
    expect(html).toContain('clicker-wrap--scene')
    expect(html).toContain('clicker-wrap--scene-clean')
    expect(html).toContain('clicker-deck-layout--stacked')
    expect(html).toContain('clicker-deck-layout__panel')
    expect(html).toContain('clicker-deck__copy')
    expect(html).toContain('clicker-deck__tabs')
    expect(html.indexOf('clicker-deck-layout__hero')).toBeLessThan(
      html.indexOf('clicker-deck-layout__panel'),
    )
  })
})
