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

  const value = useMemo(() => ({
    settings,
    patchSettings,
    setVolume,
    toggle,
    resetSettings,
    effectVolumeFactor:
      settings.soundEnabled ? (settings.masterVolume / 100) * (settings.effectsVolume / 100) : 0,
    musicVolumeFactor:
      settings.musicEnabled ? (settings.masterVolume / 100) * (settings.musicVolume / 100) : 0,
  }), [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
