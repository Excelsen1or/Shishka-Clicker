import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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
    root.style.setProperty('--fx-grid-opacity', String((0.14 + densityFactor * 0.24).toFixed(3)))
    root.style.setProperty('--fx-grid-size', `${Math.round(30 + densityFactor * 10)}px`)
    root.style.setProperty('--fx-firework-scale', String((0.75 + densityFactor * 0.65).toFixed(2)))

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

  const value = useMemo(() => {
    const densityFactor = settings.visualEffectsDensity / 100
    const particleCap = Math.round(10 + densityFactor * 130)
    const burstCap = Math.round(3 + densityFactor * 26)
    const coneCap = Math.round(1 + densityFactor * 16)

    return {
      settings,
      patchSettings,
      setVolume,
      toggle,
      resetSettings,
      effectVolumeFactor:
        settings.soundEnabled ? (settings.masterVolume / 100) * (settings.effectsVolume / 100) : 0,
      musicVolumeFactor:
        settings.musicEnabled ? (settings.masterVolume / 100) * (settings.musicVolume / 100) : 0,
      visualEffectsFactor: densityFactor,
      visualEffectCaps: {
        particleCap,
        burstCap,
        coneCap,
        totalHint: particleCap + burstCap + coneCap,
      },
    }
  }, [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
