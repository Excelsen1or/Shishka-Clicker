const SETTINGS_KEY = 'shishka-clicker-settings-v1'

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  masterVolume: 70,
  effectsVolume: 80,
  musicVolume: 35,
}

function clampPercent(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(100, Math.max(0, Math.round(number)))
}

export function normalizeSettings(settings) {
  const input = settings ?? {}

  return {
    soundEnabled: input.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
    musicEnabled: input.musicEnabled ?? DEFAULT_SETTINGS.musicEnabled,
    masterVolume: clampPercent(input.masterVolume, DEFAULT_SETTINGS.masterVolume),
    effectsVolume: clampPercent(input.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
    musicVolume: clampPercent(input.musicVolume, DEFAULT_SETTINGS.musicVolume),
  }
}

export function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    return raw ? normalizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS
  } catch (error) {
    console.warn('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)))
  } catch (error) {
    console.warn('Failed to save settings:', error)
  }
}
