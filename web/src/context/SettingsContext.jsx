import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, saveSettings } from '../lib/settingsStorage'

const SettingsContext = createContext(null)

function computeSafeMode() {
  if (typeof window === 'undefined') return false

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const slowDisplayUpdates = window.matchMedia?.('(update: slow)').matches ?? false
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const connectionSaveData = navigator.connection?.saveData === true
  const deviceMemory = navigator.deviceMemory
  const hardwareConcurrency = navigator.hardwareConcurrency
  const constrainedHardware =
    (typeof deviceMemory === 'number' && deviceMemory <= 4) ||
    (typeof hardwareConcurrency === 'number' && hardwareConcurrency <= 4)

  return prefersReducedMotion || slowDisplayUpdates || connectionSaveData || (coarsePointer && constrainedHardware)
}

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
    root.dataset.fxSafeMode = String(computeSafeMode())
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
    const densityScale = Math.min(2, Math.max(0.2, densityFactor))
    const particleCap = Math.max(0, Math.round(10 + densityScale * 28))
    const burstCap = Math.max(0, Math.round(1 + densityScale * 5))
    const coneCap = 10
    const particleSpawnScale = 0.3 + densityScale * 0.55
    const burstSpawnScale = 0.4 + densityScale * 0.35
    const coneSpawnScale = 0.25 + densityScale * 0.55
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
      visualEffectsScale: densityScale,
      visualEffectScaling: {
        particleSpawnScale,
        burstSpawnScale,
        coneSpawnScale,
      },
      visualEffectCaps: {
        particleCap: visualEffectToggles.particles ? particleCap : 0,
        burstCap: visualEffectToggles.floatingNumbers ? burstCap : 0,
        coneCap: visualEffectToggles.coneSprites ? coneCap : 0,
        totalHint:
          (visualEffectToggles.particles ? particleCap : 0) +
          (visualEffectToggles.floatingNumbers ? burstCap : 0) +
          (visualEffectToggles.coneSprites ? coneCap : 0),
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
