import { APP_VERSION } from '../config/appMeta.js'
import { formatNumber } from './format.js'

const PRESENCE_DETAILS_BY_TAB = {
  clicker: 'Кликает по шишке',
  subscriptions: 'Прокачивает AI-подписки',
  upgrades: 'Покупает апгрейды',
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

  return Object.values(achievements).reduce((total, value) => total + (value ? 1 : 0), 0)
}

function buildPresenceState(activeTab, gameState, economy) {
  const achievementCount = countUnlockedAchievements(gameState?.achievements)
  const subscriptionLevels = sumLevels(gameState?.subscriptions)
  const upgradeLevels = sumLevels(gameState?.upgrades)
  const rebirths = Number(gameState?.rebirths ?? 0)
  const prestigeShards = Number(gameState?.prestigeShards ?? 0)
  const aiMultiplier = Number(economy?.aiMultiplier ?? 1)
  const shishkiPerSecond = Number(economy?.shishkiPerSecond ?? 0)
  const moneyPerSecond = Number(economy?.moneyPerSecond ?? 0)

  const partsByTab = {
    clicker: [
      `Шишки/с: ${formatNumber(shishkiPerSecond)}`,
      aiMultiplier > 1 ? `AI x${formatNumber(aiMultiplier)}` : `Ачивок: ${formatNumber(achievementCount)}`,
    ],
    subscriptions: [
      `Подписок: ${formatNumber(subscriptionLevels)}`,
      `AI x${formatNumber(aiMultiplier)}`,
    ],
    upgrades: [
      `Апгрейдов: ${formatNumber(upgradeLevels)}`,
      `Деньги/с: ${formatNumber(moneyPerSecond)}`,
    ],
    meta: [
      `Ребёрсы: ${formatNumber(rebirths)}`,
      `Шарды: ${formatNumber(prestigeShards)}`,
    ],
    settings: [
      `Ачивок: ${formatNumber(achievementCount)}`,
      `v${APP_VERSION}`,
    ],
  }

  return (partsByTab[activeTab] ?? [
    `Шишки/с: ${formatNumber(shishkiPerSecond)}`,
    `Ачивок: ${formatNumber(achievementCount)}`,
  ])
    .filter(Boolean)
    .slice(0, 2)
    .join(' • ')
}

function getExternalPresenceImageUrl() {
  const overrideUrl = import.meta.env.VITE_DISCORD_ACTIVITY_LARGE_IMAGE_URL
  if (overrideUrl) {
    return overrideUrl
  }

  if (typeof window === 'undefined') {
    return null
  }

  const hostname = window.location.hostname
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')

  if (isLocalHost) {
    return null
  }

  return new URL('/discord-rich-presence.png', window.location.origin).toString()
}

export function buildDiscordRichPresence({ activeTab, gameState, economy, startedAt }) {
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
