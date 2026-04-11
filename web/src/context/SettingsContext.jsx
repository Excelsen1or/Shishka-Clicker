import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, saveSettings } from '../lib/settingsStorage'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettings()))

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const densityFactor = Math.max(0, settings.visualEffectsDensity / 100)
    const root = document.documentElement
    const visualEffectToggles = {
      ambientEffects: settings.showAmbientEffects,
      noiseOverlay: settings.showNoiseOverlay,
      revealAnimations: settings.showRevealAnimations,
      clickAnimations: settings.showClickAnimations,
      particles: settings.showParticles,
      floatingNumbers: settings.showFloatingNumbers,
      coneSprites: settings.showConeSprites,
      shockwaves: settings.showShockwaves,
      achievementToasts: settings.showAchievementToasts,
    }

    root.style.setProperty('--fx-density', densityFactor.toFixed(2))
    root.style.setProperty('--fx-grid-opacity', String((0.06 + densityFactor * 0.08).toFixed(3)))
    root.style.setProperty('--fx-grid-size', `${Math.round(34 + densityFactor * 6)}px`)
    root.style.setProperty('--fx-firework-scale', String((0.6 + densityFactor * 0.25).toFixed(2)))
    root.dataset.fxAmbient = String(visualEffectToggles.ambientEffects)
    root.dataset.fxNoise = String(visualEffectToggles.noiseOverlay)
    root.dataset.fxReveal = String(visualEffectToggles.revealAnimations)
    root.dataset.fxClickAnimations = String(visualEffectToggles.clickAnimations)
    root.dataset.fxParticles = String(visualEffectToggles.particles)
    root.dataset.fxNumbers = String(visualEffectToggles.floatingNumbers)
    root.dataset.fxConeSprites = String(visualEffectToggles.coneSprites)
    root.dataset.fxShockwaves = String(visualEffectToggles.shockwaves)
    root.dataset.fxAchievementToasts = String(visualEffectToggles.achievementToasts)
  }, [settings])

  const patchSettings = useCallback(function patchSettings(patch) {
    setSettings((current) => normalizeSettings({ ...current, ...patch }))
  }, [])

  const setVolume = useCallback(function setVolume(key, value) {
    patchSettings({ [key]: value })
  }, [patchSettings])

  const toggle = useCallback(function toggle(key) {
    setSettings((current) => normalizeSettings({ ...current, [key]: !current[key] }))
  }, [])

  const resetSettings = useCallback(function resetSettings() {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const exportSettings = useCallback(function exportSettings() {
    return normalizeSettings(settings)
  }, [settings])

  const importSettings = useCallback(function importSettings(nextSettings) {
    setSettings(normalizeSettings(nextSettings))
  }, [])

  const value = useMemo(() => {
    const densityFactor = Math.max(0, settings.visualEffectsDensity / 100)
    const particleCap = Math.max(0, Math.round(densityFactor * 24))
    const burstCap = Math.max(0, Math.round(densityFactor * 5))
    const coneCap = Math.max(0, Math.round(densityFactor * 4))
    const rainCap = Math.max(0, Math.round(densityFactor * 6))
    const fireworkCap = Math.max(0, Math.round(densityFactor * 8))
    const visualEffectToggles = {
      ambientEffects: settings.showAmbientEffects,
      noiseOverlay: settings.showNoiseOverlay,
      revealAnimations: settings.showRevealAnimations,
      clickAnimations: settings.showClickAnimations,
      particles: settings.showParticles,
      floatingNumbers: settings.showFloatingNumbers,
      coneSprites: settings.showConeSprites,
      shockwaves: settings.showShockwaves,
      achievementToasts: settings.showAchievementToasts,
    }

    return {
      settings,
      patchSettings,
      setVolume,
      toggle,
      resetSettings,
      exportSettings,
      importSettings,
      effectVolumeFactor:
        settings.soundEnabled ? (settings.masterVolume / 100) * (settings.effectsVolume / 100) : 0,
      musicVolumeFactor:
        settings.musicEnabled ? (settings.masterVolume / 100) * (settings.musicVolume / 100) : 0,
      visualEffectsFactor: densityFactor,
      visualEffectCaps: {
        particleCap: visualEffectToggles.particles ? particleCap : 0,
        burstCap: visualEffectToggles.floatingNumbers ? burstCap : 0,
        coneCap: visualEffectToggles.coneSprites ? coneCap : 0,
        rainCap,
        fireworkCap,
        totalHint:
          (visualEffectToggles.particles ? particleCap : 0) +
          (visualEffectToggles.floatingNumbers ? burstCap : 0) +
          (visualEffectToggles.coneSprites ? coneCap : 0) +
          rainCap +
          fireworkCap,
      },
      visualEffectToggles,
    }
  }, [
    settings,
    patchSettings,
    setVolume,
    toggle,
    resetSettings,
    exportSettings,
    importSettings,
  ])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
