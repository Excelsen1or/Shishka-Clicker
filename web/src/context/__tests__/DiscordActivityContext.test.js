import { describe, expect, it } from 'vitest'
import {
  classifyCloudSave,
  chooseSyncWinner,
  getProgressScore,
} from '../DiscordActivityContext.jsx'
import { createSaveBundle } from '../../lib/saveTransfer.js'

function createCurrentGameState(overrides = {}) {
  return {
    shishki: 1200,
    manualClicks: 50,
    totalShishkiEarned: 2200,
    lifetimeShishkiEarned: 2200,
    heavenlyShishki: 2,
    totalHeavenlyShishkiEarned: 2,
    tarLumps: 1,
    rebirths: 1,
    quotaIndex: 1,
    currentRunShishki: 1200,
    buildings: {
      garagePicker: 3,
      pickupPoint: 2,
    },
    buildingLevels: {
      garagePicker: 1,
      pickupPoint: 1,
    },
    upgrades: {
      warehouseRhythm: 1,
    },
    prestigeUpgrades: {
      heavenlyTar: 1,
    },
    market: {
      unlocked: true,
      brokerLevel: 1,
      prices: {},
      positions: {
        parallelImport: 3,
      },
      averageBuyPrice: {},
    },
    achievements: {
      firstQuota: true,
    },
    ...overrides,
  }
}

function createLegacyCloudSave(overrides = {}) {
  return {
    save: {
      money: 1_000_000_000,
      knowledge: 750_000,
      prestigeShards: 100,
      subscriptions: {
        oldLoop: 50,
      },
      ...overrides,
    },
    updatedAt: '2026-04-19T12:00:00.000Z',
  }
}

describe('DiscordActivityContext sync helpers', () => {
  it('classifies legacy remote saves as obsolete', () => {
    expect(classifyCloudSave(createLegacyCloudSave())).toEqual({
      gameState: null,
      isLegacy: true,
      hasValidSave: false,
    })
  })

  it('scores the new economy above the legacy economy', () => {
    const modernScore = getProgressScore(createCurrentGameState())
    const legacyScore = getProgressScore({
      money: 1_000_000_000,
      knowledge: 750_000,
      prestigeShards: 100,
      subscriptions: {
        oldLoop: 50,
      },
    })

    expect(modernScore).toBeGreaterThan(legacyScore)
  })

  it('keeps the local save when the remote cloud save is legacy', () => {
    const localSave = createSaveBundle({
      gameState: createCurrentGameState(),
      includeSettings: false,
      appVersion: 'test',
    })

    expect(
      chooseSyncWinner(localSave.payload.game, createLegacyCloudSave()),
    ).toBe('local')
  })
})
