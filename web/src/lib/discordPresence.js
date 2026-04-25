import { APP_VERSION } from '../config/appMeta.js'
import { formatNumber } from './format.js'

const PRESENCE_DETAILS_BY_TAB = {
  clicker: 'Кликает по шишке',
  purchases: 'Листает пиксельный магазин',
  market: 'Торгует серым дефицитом',
  meta: 'Следит за мета-прогрессом',
  settings: 'Настраивает игру',
}

function sumLevels(map) {
  if (!map || typeof map !== 'object') return 0

  return Object.values(map).reduce((total, value) => {
    const numericValue = Number(value)
    return total + (Number.isFinite(numericValue) ? numericValue : 0)
  }, 0)
}

function countUnlockedAchievements(achievements) {
  if (!achievements || typeof achievements !== 'object') return 0

  return Object.values(achievements).reduce(
    (total, value) => total + (value ? 1 : 0),
    0,
  )
}

export function buildDiscordPresenceSource({ gameState, economy }) {
  const achievementCount = countUnlockedAchievements(gameState?.achievements)
  const buildingCount = sumLevels(gameState?.buildings)
  const upgradeLevels = sumLevels(gameState?.upgrades)
  const marketPositions = sumLevels(gameState?.market?.positions)
  const shishki = Number(gameState?.shishki ?? 0)
  const heavenlyShishki = Number(gameState?.heavenlyShishki ?? 0)
  const tarLumps = Number(gameState?.tarLumps ?? 0)
  const shishkiPerSecond = Number(economy?.shishkiPerSecond ?? 0)
  const clickPower = Number(economy?.clickPower ?? 1)

  return {
    achievementCountText: formatNumber(achievementCount),
    buildingCountText: formatNumber(buildingCount),
    upgradeLevelsText: formatNumber(upgradeLevels),
    marketPositionsText: formatNumber(marketPositions),
    shishkiText: formatNumber(shishki),
    heavenlyShishkiText: formatNumber(heavenlyShishki),
    tarLumpsText: formatNumber(tarLumps),
    shishkiPerSecondText: formatNumber(shishkiPerSecond),
    clickPowerText: formatNumber(clickPower),
  }
}

function buildPresenceState(activeTab, source) {
  const {
    achievementCountText = '0',
    buildingCountText = '0',
    upgradeLevelsText = '0',
    marketPositionsText = '0',
    shishkiText = '0',
    heavenlyShishkiText = '0',
    tarLumpsText = '0',
    shishkiPerSecondText = '0',
    clickPowerText = '1',
  } = source ?? {}

  const partsByTab = {
    clicker: [`Шишки/с: ${shishkiPerSecondText}`, `Клик: ${clickPowerText}`],
    purchases: [
      `Построек: ${buildingCountText}`,
      `Апгрейдов: ${upgradeLevelsText}`,
    ],
    market: [`Позиции: ${marketPositionsText}`, `Шишки: ${shishkiText}`],
    meta: [`Небесные: ${heavenlyShishkiText}`, `Комки: ${tarLumpsText}`],
    settings: [`Ачивок: ${achievementCountText}`, `v${APP_VERSION}`],
  }

  return (
    partsByTab[activeTab] ?? [
      `Шишки/с: ${shishkiPerSecondText}`,
      `Ачивок: ${achievementCountText}`,
    ]
  )
    .filter(Boolean)
    .slice(0, 2)
    .join(' • ')
}

export function getExternalPresenceImageUrl({ env = import.meta.env } = {}) {
  const overrideUrl = env.VITE_DISCORD_ACTIVITY_LARGE_IMAGE_URL
  if (overrideUrl) {
    return overrideUrl
  }

  return null
}

export function buildDiscordRichPresence({
  activeTab,
  gameState,
  economy,
  presenceSource = null,
  startedAt,
}) {
  const source =
    presenceSource ?? buildDiscordPresenceSource({ gameState, economy })
  const activity = {
    type: 0,
    details: PRESENCE_DETAILS_BY_TAB[activeTab] ?? 'Играет в Shishka Clicker',
    state: buildPresenceState(activeTab, source),
    timestamps: {
      start: startedAt,
    },
  }

  const largeImageUrl = getExternalPresenceImageUrl()

  if (largeImageUrl) {
    activity.assets = {
      large_image: largeImageUrl,
      large_text: `Shishka Clicker v${APP_VERSION}`,
    }
  }

  return activity
}
