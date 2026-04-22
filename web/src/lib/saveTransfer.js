import { normalizeSettings } from './settingsStorage'

export const SAVE_EXPORT_FORMAT = 'shishka-clicker-save'
export const SAVE_EXPORT_VERSION = 2
export const SAVE_FILE_EXTENSION = '.shishka-save.json'

export const LEGACY_SAVE_ERROR =
  'Это сохранение создано в старой версии игры и больше не поддерживается.'

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
    'shishki' in value &&
    'heavenlyShishki' in value &&
    'tarLumps' in value &&
    value.buildings &&
    typeof value.buildings === 'object' &&
    !Array.isArray(value.buildings) &&
    value.market &&
    typeof value.market === 'object' &&
    !Array.isArray(value.market) &&
    value.prestigeUpgrades &&
    typeof value.prestigeUpgrades === 'object' &&
    !Array.isArray(value.prestigeUpgrades),
  )
}

export function isObsoleteSaveBundle(rawValue) {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return false
  }

  if (rawValue.format === SAVE_EXPORT_FORMAT) {
    return Number(rawValue.version) !== SAVE_EXPORT_VERSION
  }

  return Boolean(
    rawValue.version ||
    rawValue.payload ||
    'money' in rawValue ||
    'knowledge' in rawValue ||
    'subscriptions' in rawValue ||
    'prestigeShards' in rawValue,
  )
}

export function normalizeImportedBundle(rawValue) {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    throw new Error('Файл сохранения пустой или повреждён.')
  }

  if (rawValue.format === SAVE_EXPORT_FORMAT) {
    if (isObsoleteSaveBundle(rawValue)) {
      throw new Error(LEGACY_SAVE_ERROR)
    }

    const game = rawValue.payload?.game
    if (!hasGameStateShape(game)) {
      throw new Error(LEGACY_SAVE_ERROR)
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

  if (isObsoleteSaveBundle(rawValue)) {
    throw new Error(LEGACY_SAVE_ERROR)
  }

  throw new Error('Неизвестный формат сохранения.')
}
