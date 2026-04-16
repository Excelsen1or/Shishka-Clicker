const SETTINGS_KEY = 'shishka-clicker-settings-v1'

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  masterVolume: 70,
  effectsVolume: 80,
  visualEffectsDensity: 45,
  showAmbientEffects: true,
  showNoiseOverlay: true,
  showRevealAnimations: true,
  showClickAnimations: true,
  showParticles: true,
  showFloatingNumbers: true,
  showConeSprites: true,
  showShockwaves: true,
  showAchievementToasts: true,
}

function clampPercent(value, fallback, min = 0, max = 100) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

export function normalizeSettings(settings) {
  const input = settings ?? {}

  return {
    soundEnabled: input.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
    masterVolume: clampPercent(
      input.masterVolume,
      DEFAULT_SETTINGS.masterVolume,
    ),
    effectsVolume: clampPercent(
      input.effectsVolume,
      DEFAULT_SETTINGS.effectsVolume,
    ),
    visualEffectsDensity: clampPercent(
      input.visualEffectsDensity,
      DEFAULT_SETTINGS.visualEffectsDensity,
      20,
      200,
    ),
    showAmbientEffects:
      input.showAmbientEffects ?? DEFAULT_SETTINGS.showAmbientEffects,
    showNoiseOverlay:
      input.showNoiseOverlay ?? DEFAULT_SETTINGS.showNoiseOverlay,
    showRevealAnimations:
      input.showRevealAnimations ?? DEFAULT_SETTINGS.showRevealAnimations,
    showClickAnimations:
      input.showClickAnimations ?? DEFAULT_SETTINGS.showClickAnimations,
    showParticles: input.showParticles ?? DEFAULT_SETTINGS.showParticles,
    showFloatingNumbers:
      input.showFloatingNumbers ?? DEFAULT_SETTINGS.showFloatingNumbers,
    showConeSprites: input.showConeSprites ?? DEFAULT_SETTINGS.showConeSprites,
    showShockwaves: input.showShockwaves ?? DEFAULT_SETTINGS.showShockwaves,
    showAchievementToasts:
      input.showAchievementToasts ?? DEFAULT_SETTINGS.showAchievementToasts,
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
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(normalizeSettings(settings)),
    )
  } catch (error) {
    console.warn('Failed to save settings:', error)
  }
}
