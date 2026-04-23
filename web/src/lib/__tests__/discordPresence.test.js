import { describe, expect, it } from 'vitest'
import {
  buildDiscordRichPresence,
  getExternalPresenceImageUrl,
} from '../discordPresence.js'

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

  it('does not attach external assets by default', () => {
    const presence = buildDiscordRichPresence({
      activeTab: 'clicker',
      gameState: {
        shishki: 100,
      },
      economy: {
        shishkiPerSecond: 2,
        clickPower: 1,
      },
      startedAt: 1_700_000_000,
    })

    expect(presence.assets).toBeUndefined()
  })
})

describe('getExternalPresenceImageUrl', () => {
  it('returns the explicit env override when provided', () => {
    expect(
      getExternalPresenceImageUrl({
        env: {
          VITE_DISCORD_ACTIVITY_LARGE_IMAGE_URL:
            'https://cdn.example.com/presence.png',
        },
      }),
    ).toBe('https://cdn.example.com/presence.png')
  })
})
