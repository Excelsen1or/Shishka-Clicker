import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import { DiscordActivityProvider } from '../../../context/DiscordActivityContext.jsx'
import { MetaScreen } from '../MetaScreen.jsx'

describe('MetaScreen', () => {
  function renderMetaScreen(gameStore) {
    return renderToStaticMarkup(
      <StoresContext.Provider value={{ gameStore }}>
        <DiscordActivityProvider>
          <MetaScreen />
        </DiscordActivityProvider>
      </StoresContext.Provider>,
    )
  }

  it('shows the next-life seed reserve preview', () => {
    const html = renderMetaScreen({
      uiState: {
        rebirths: 1,
        heavenlyShishki: 2,
        tarLumps: 1,
        prestigeUpgrades: {
          heavenlyTar: 1,
          coneLegacy: 1,
        },
      },
      uiPrestige: {
        quotaIndex: 1,
        currentRunShishki: 4_000,
        currentQuotaTarget: 3_500,
        nextQuotaTarget: 8_400,
      },
      uiEconomy: {
        prestigeUpgrades: [],
        buildings: [],
      },
      getSaveMeta: () => ({
        updatedAt: '2026-04-23T19:00:00.000Z',
        clientRevision: 1,
      }),
      exportGameSave: () => ({}),
      importGameSave: () => {},
      prestigeReset: () => {},
      buyPrestigeUpgrade: () => {},
      upgradeBuildingLevel: () => {},
    })

    expect(html).toContain('Старт следующей жизни')
    expect(html).toContain('50')
  })

  it('shows the total playtime block', () => {
    const html = renderMetaScreen({
      uiState: {
        rebirths: 1,
        heavenlyShishki: 2,
        tarLumps: 1,
        prestigeUpgrades: {},
      },
      uiPrestige: {
        quotaIndex: 1,
        currentRunShishki: 4_000,
        currentQuotaTarget: 3_500,
        nextQuotaTarget: 8_400,
      },
      uiEconomy: {
        prestigeUpgrades: [],
        buildings: [],
      },
      getSaveMeta: () => ({
        updatedAt: '2026-04-23T19:00:00.000Z',
        clientRevision: 1,
      }),
      exportGameSave: () => ({}),
      importGameSave: () => {},
      prestigeReset: () => {},
      buyPrestigeUpgrade: () => {},
      upgradeBuildingLevel: () => {},
    })

    expect(html).toContain('В игре')
    expect(html).toContain('Общее время всех сессий этого профиля.')
  })

  it('blocks heavenly spending before the first rebirth', () => {
    const html = renderMetaScreen({
      uiState: {
        rebirths: 0,
        heavenlyShishki: 2,
        tarLumps: 0,
        prestigeUpgrades: {},
      },
      uiPrestige: {
        quotaIndex: 1,
        currentRunShishki: 1_000_000,
        currentQuotaTarget: 1_000_000,
        nextQuotaTarget: 2_850_000,
      },
      uiEconomy: {
        prestigeUpgrades: [
          {
            id: 'heavenlyTar',
            title: 'Небесная смола',
            level: 0,
            cost: 1,
          },
        ],
        buildings: [],
      },
      getSaveMeta: () => ({
        updatedAt: '2026-04-23T19:00:00.000Z',
        clientRevision: 1,
      }),
      exportGameSave: () => ({}),
      importGameSave: () => {},
      prestigeReset: () => {},
      buyPrestigeUpgrade: () => {},
      upgradeBuildingLevel: () => {},
    })

    expect(html).toContain('Сначала переродись')
  })
})
