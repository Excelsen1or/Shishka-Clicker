import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SAVE_EXPORT_VERSION,
  createSaveBundle,
  isObsoleteSaveBundle,
  normalizeImportedBundle,
} from '../saveTransfer.js'
import { clearLegacyGame, loadLegacyGameRecord } from '../storage.js'

function createGameState(overrides = {}) {
  return {
    shishki: 123,
    manualClicks: 7,
    totalShishkiEarned: 456,
    lifetimeShishkiEarned: 456,
    heavenlyShishki: 3,
    totalHeavenlyShishkiEarned: 3,
    tarLumps: 1,
    quotaIndex: 0,
    currentRunShishki: 123,
    buildings: { garagePicker: 1 },
    buildingLevels: { garagePicker: 0 },
    upgrades: { warehouseRhythm: 0 },
    prestigeUpgrades: { heavenlyTar: 0 },
    market: {
      unlocked: false,
      brokerLevel: 0,
      prices: { parallelImport: 100 },
      positions: { parallelImport: 0 },
      averageBuyPrice: { parallelImport: 0 },
    },
    achievements: {},
    ...overrides,
  }
}

function mockWindow(storageEntries = {}) {
  const storage = new Map(Object.entries(storageEntries))

  globalThis.window = {
    localStorage: {
      getItem: vi.fn((key) => storage.get(key) ?? null),
      removeItem: vi.fn((key) => {
        storage.delete(key)
      }),
    },
  }

  return {
    storage,
    localStorage: globalThis.window.localStorage,
  }
}

describe('saveTransfer', () => {
  it('exports the current save bundle version', () => {
    const bundle = createSaveBundle({
      gameState: createGameState(),
      includeSettings: false,
      appVersion: 'test-build',
    })

    expect(SAVE_EXPORT_VERSION).toBe(2)
    expect(bundle.version).toBe(2)
    expect(normalizeImportedBundle(bundle).game.heavenlyShishki).toBe(3)
  })

  it('rejects raw legacy save imports', () => {
    expect(() =>
      normalizeImportedBundle(
        createGameState({
          money: 999,
          knowledge: 111,
        }),
      ),
    ).toThrow(/устарев|поддерж/i)
  })

  it('rejects older bundle versions even with the new schema', () => {
    const bundle = createSaveBundle({
      gameState: createGameState(),
      includeSettings: false,
    })

    expect(() =>
      normalizeImportedBundle({
        ...bundle,
        version: 1,
      }),
    ).toThrow(/устарев|поддерж/i)
  })

  it('flags obsolete bundles before sync tries to import them', () => {
    expect(
      isObsoleteSaveBundle(
        createGameState({
          money: 999,
          knowledge: 111,
        }),
      ),
    ).toBe(true)

    expect(
      isObsoleteSaveBundle({
        ...createSaveBundle({
          gameState: createGameState(),
          includeSettings: false,
        }),
        version: 1,
      }),
    ).toBe(true)
  })
})

describe('storage migration', () => {
  afterEach(() => {
    delete globalThis.window
  })

  it('ignores obsolete save keys after the storage key bump', () => {
    mockWindow({
      'shishka-clicker-save-v5': JSON.stringify({
        state: createGameState(),
        updatedAt: '2026-04-19T12:00:00.000Z',
      }),
    })

    expect(loadLegacyGameRecord()).toEqual({
      state: null,
      updatedAt: null,
    })
  })

  it('clears the current and obsolete local save keys', () => {
    const { localStorage } = mockWindow({
      'shishka-clicker-save-v6': JSON.stringify({
        state: createGameState(),
      }),
      'shishka-clicker-save-v5': '{}',
      'shishka-clicker-save-v4': '{}',
    })

    clearLegacyGame()

    expect(localStorage.removeItem).toHaveBeenCalledWith(
      'shishka-clicker-save-v6',
    )
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      'shishka-clicker-save-v5',
    )
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      'shishka-clicker-save-v4',
    )
  })
})
