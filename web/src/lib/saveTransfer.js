import { normalizeSettings } from './settingsStorage'

export const SAVE_EXPORT_FORMAT = 'shishka-clicker-save'
export const SAVE_EXPORT_VERSION = 1
export const SAVE_FILE_EXTENSION = '.shishka-save.json'

export function buildSaveFileName(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
    '-',
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join('')

  return `shishka-clicker-save-${stamp}${SAVE_FILE_EXTENSION}`
}

export function createSaveBundle({
  gameState,
  settings,
  includeSettings = true,
  appVersion = 'unknown',
  exportedAt = new Date().toISOString(),
}) {
  return {
    format: SAVE_EXPORT_FORMAT,
    version: SAVE_EXPORT_VERSION,
    appVersion,
    exportedAt,
    payload: {
      game: gameState,
      ...(includeSettings && settings
        ? { settings: normalizeSettings(settings) }
        : {}),
    },
  }
}

function hasGameStateShape(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('shishki' in value ||
      'money' in value ||
      'knowledge' in value ||
      'subscriptions' in value ||
      'upgrades' in value ||
      'prestigeUpgrades' in value),
  )
}

export function normalizeImportedBundle(rawValue) {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    throw new Error('Файл сохранения пустой или повреждён.')
  }

  if (rawValue.format === SAVE_EXPORT_FORMAT) {
    const game = rawValue.payload?.game
    if (!hasGameStateShape(game)) {
      throw new Error('В файле не найден игровой прогресс.')
    }

    return {
      appVersion: rawValue.appVersion ?? 'unknown',
      exportedAt: rawValue.exportedAt ?? null,
      game,
      settings: rawValue.payload?.settings
        ? normalizeSettings(rawValue.payload.settings)
        : null,
      isLegacy: false,
    }
  }

  if (hasGameStateShape(rawValue)) {
    return {
      appVersion: 'legacy',
      exportedAt: null,
      game: rawValue,
      settings: null,
      isLegacy: true,
    }
  }

  throw new Error('Неизвестный формат сохранения.')
}
