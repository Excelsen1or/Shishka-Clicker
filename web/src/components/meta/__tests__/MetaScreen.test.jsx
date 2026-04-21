import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StoresContext } from '../../../stores/StoresProvider.jsx'
import { MetaScreen } from '../MetaScreen.jsx'

describe('MetaScreen', () => {
  it('shows the next-life seed reserve preview', () => {
    const html = renderToStaticMarkup(
      <StoresContext.Provider
        value={{
          gameStore: {
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
            prestigeReset: () => {},
            buyPrestigeUpgrade: () => {},
            upgradeBuildingLevel: () => {},
          },
        }}
      >
        <MetaScreen />
      </StoresContext.Provider>,
    )

    expect(html).toContain('Старт следующей жизни')
    expect(html).toContain('50')
  })
})
