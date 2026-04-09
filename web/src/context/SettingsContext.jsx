import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, saveSettings } from '../lib/settingsStorage'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettings()))

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

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
    const particleCap = Math.round(24 + densityFactor * 84)
    const burstCap = Math.round(6 + densityFactor * 16)
    const coneCap = Math.round(3 + densityFactor * 10)

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
