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

function buildPresenceState(activeTab, gameState, economy) {
  const achievementCount = countUnlockedAchievements(gameState?.achievements)
  const buildingCount = sumLevels(gameState?.buildings)
  const upgradeLevels = sumLevels(gameState?.upgrades)
  const marketPositions = sumLevels(gameState?.market?.positions)
  const shishki = Number(gameState?.shishki ?? 0)
  const heavenlyShishki = Number(gameState?.heavenlyShishki ?? 0)
  const tarLumps = Number(gameState?.tarLumps ?? 0)
  const shishkiPerSecond = Number(economy?.shishkiPerSecond ?? 0)
  const clickPower = Number(economy?.clickPower ?? 1)

  const partsByTab = {
    clicker: [
      `Шишки/с: ${formatNumber(shishkiPerSecond)}`,
      `Клик: ${formatNumber(clickPower)}`,
    ],
    purchases: [
      `Построек: ${formatNumber(buildingCount)}`,
      `Апгрейдов: ${formatNumber(upgradeLevels)}`,
    ],
    market: [
      `Позиции: ${formatNumber(marketPositions)}`,
      `Шишки: ${formatNumber(shishki)}`,
    ],
    meta: [
      `Небесные: ${formatNumber(heavenlyShishki)}`,
      `Комки: ${formatNumber(tarLumps)}`,
    ],
    settings: [`Ачивок: ${formatNumber(achievementCount)}`, `v${APP_VERSION}`],
  }

  return (
    partsByTab[activeTab] ?? [
      `Шишки/с: ${formatNumber(shishkiPerSecond)}`,
      `Ачивок: ${formatNumber(achievementCount)}`,
    ]
  )
    .filter(Boolean)
    .slice(0, 2)
    .join(' • ')
}

export function getExternalPresenceImageUrl({
  env = import.meta.env,
} = {}) {
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
  startedAt,
}) {
  const activity = {
    type: 0,
    details: PRESENCE_DETAILS_BY_TAB[activeTab] ?? 'Играет в Shishka Clicker',
    state: buildPresenceState(activeTab, gameState, economy),
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
