import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, saveSettings } from '../lib/settingsStorage'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettings()))

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const densityFactor = settings.visualEffectsDensity / 100
    const root = document.documentElement
    root.style.setProperty('--fx-density', densityFactor.toFixed(2))
    root.style.setProperty('--fx-grid-opacity', String((0.06 + densityFactor * 0.08).toFixed(3)))
    root.style.setProperty('--fx-grid-size', `${Math.round(34 + densityFactor * 6)}px`)
    root.style.setProperty('--fx-firework-scale', String((0.6 + densityFactor * 0.25).toFixed(2)))

    return () => {
      root.style.removeProperty('--fx-density')
      root.style.removeProperty('--fx-grid-opacity')
      root.style.removeProperty('--fx-grid-size')
      root.style.removeProperty('--fx-firework-scale')
    }
  }, [settings.visualEffectsDensity])

  function patchSettings(patch) {
    setSettings((current) => normalizeSettings({ ...current, ...patch }))
  }

  function setVolume(key, value) {
    patchSettings({ [key]: value })
  }

  function toggle(key) {
    setSettings((current) => normalizeSettings({ ...current, [key]: !current[key] }))
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS)
  }

  function exportSettings() {
    return normalizeSettings(settings)
  }

  function importSettings(nextSettings) {
    setSettings(normalizeSettings(nextSettings))
  }

  const densityFactor = settings.visualEffectsDensity / 100
  const particleCap = Math.round(4 + densityFactor * 20)
  const burstCap = Math.round(1 + densityFactor * 4)
  const coneCap = Math.round(1 + densityFactor * 3)
  const rainCap = Math.round(0 + densityFactor * 6)
  const fireworkCap = Math.round(0 + densityFactor * 8)

  const value = {
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
      particleCap,
      burstCap,
      coneCap,
      rainCap,
      fireworkCap,
      totalHint: particleCap + burstCap + coneCap + rainCap + fireworkCap,
    },
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
