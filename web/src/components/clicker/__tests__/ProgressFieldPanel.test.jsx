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
      market: { positions: {}, prices: {}, averageBuyPrice: {} },
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
    expect(availableCampaign?.state).toBe('available')

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

    expect(expiredCampaign?.state).toBe('available')
  })

  it('keeps core clicker metrics visible in the composed screen', () => {
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
            },
          ],
          marketFieldItems: [],
          metaFieldItems: [],
        },
        clickerMetrics: {
          clickPowerText: '12',
          megaClickChanceText: '0%',
          megaClickStreak: 0,
          emojiMegaChanceText: '0%',
          emojiBurstStreak: 0,
        },
        uiEconomy: { shishkiPerSecond: 12 },
        uiPrestige: { currentRunShishki: 250, currentQuotaTarget: 1_000 },
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

    expect(html).toContain('Шишки/сек')
    expect(html).toContain('+12')
    expect(html).toContain('Квота')
    expect(html).toContain('250 / 1K')
  })
})
