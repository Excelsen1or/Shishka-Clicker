import { describe, expect, it } from 'vitest'
import { buildDiscordRichPresence } from '../discordPresence.js'

describe('buildDiscordRichPresence', () => {
  it('uses market copy and shishka metrics for the market tab', () => {
    const presence = buildDiscordRichPresence({
      activeTab: 'market',
      gameState: {
        shishki: 5120,
        market: {
          positions: {
            pickupPointLeftovers: 2,
            parallelImport: 4,
            neuroCover: 1,
          },
        },
      },
      economy: {
        shishkiPerSecond: 32,
        clickPower: 5,
      },
      startedAt: 1_700_000_000,
    })

    expect(presence.details).toBe('Торгует серым дефицитом')
    expect(presence.state).toBe('Позиции: 7 • Шишки: 5,1K')
  })

  it('uses heavenly shishki and tar lumps on the meta tab', () => {
    const presence = buildDiscordRichPresence({
      activeTab: 'meta',
      gameState: {
        heavenlyShishki: 9,
        tarLumps: 4,
        rebirths: 3,
      },
      economy: {
        shishkiPerSecond: 128,
        clickPower: 2,
      },
      startedAt: 1_700_000_000,
    })

    expect(presence.details).toBe('Следит за мета-прогрессом')
    expect(presence.state).toBe('Небесные: 9 • Комки: 4')
  })
})
