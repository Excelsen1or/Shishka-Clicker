import { STARTING_STATE } from '../game/economyConfig.js'

export function createFreshState() {
  return {
    ...STARTING_STATE,
    buildings: { ...STARTING_STATE.buildings },
    buildingLevels: { ...STARTING_STATE.buildingLevels },
    upgrades: { ...STARTING_STATE.upgrades },
    prestigeUpgrades: { ...STARTING_STATE.prestigeUpgrades },
    market: {
      ...STARTING_STATE.market,
      prices: { ...STARTING_STATE.market.prices },
      positions: { ...STARTING_STATE.market.positions },
      averageBuyPrice: { ...STARTING_STATE.market.averageBuyPrice },
    },
    achievements: { ...STARTING_STATE.achievements },
  }
}

export function mergeState(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return createFreshState()
  }

  const fresh = createFreshState()

  return {
    ...fresh,
    ...saved,
    buildings: {
      ...fresh.buildings,
      ...(saved.buildings ?? {}),
    },
    buildingLevels: {
      ...fresh.buildingLevels,
      ...(saved.buildingLevels ?? {}),
    },
    upgrades: {
      ...fresh.upgrades,
      ...(saved.upgrades ?? {}),
    },
    prestigeUpgrades: {
      ...fresh.prestigeUpgrades,
      ...(saved.prestigeUpgrades ?? {}),
    },
    market: {
      ...fresh.market,
      ...(saved.market ?? {}),
      prices: {
        ...fresh.market.prices,
        ...(saved.market?.prices ?? {}),
      },
      positions: {
        ...fresh.market.positions,
        ...(saved.market?.positions ?? {}),
      },
      averageBuyPrice: {
        ...fresh.market.averageBuyPrice,
        ...(saved.market?.averageBuyPrice ?? {}),
      },
    },
    achievements: {
      ...fresh.achievements,
      ...(saved.achievements ?? {}),
    },
  }
}
