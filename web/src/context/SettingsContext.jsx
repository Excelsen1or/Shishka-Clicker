import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from '../lib/settingsStorage'

const SettingsStateContext = createContext(null)
const SettingsActionsContext = createContext(null)
const SettingsVisualContext = createContext(null)
const SettingsAudioContext = createContext(null)
const SETTINGS_PERSIST_DELAY_MS = 180

function computeSafeMode() {
  if (typeof window === 'undefined') return false

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const slowDisplayUpdates =
    window.matchMedia?.('(update: slow)').matches ?? false
  const coarsePointer =
    window.matchMedia?.('(pointer: coarse)').matches ?? false
  const connectionSaveData = navigator.connection?.saveData === true
  const deviceMemory = navigator.deviceMemory
  const hardwareConcurrency = navigator.hardwareConcurrency
  const constrainedHardware =
    (typeof deviceMemory === 'number' && deviceMemory <= 4) ||
    (typeof hardwareConcurrency === 'number' && hardwareConcurrency <= 4)

  return (
    prefersReducedMotion ||
    slowDisplayUpdates ||
    connectionSaveData ||
    (coarsePointer && constrainedHardware)
  )
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() =>
    normalizeSettings(loadSettings()),
  )
  const settingsRef = useRef(settings)
  const persistTimeoutRef = useRef(null)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    if (persistTimeoutRef.current) {
      window.clearTimeout(persistTimeoutRef.current)
    }

    persistTimeoutRef.current = window.setTimeout(() => {
      saveSettings(settings)
      persistTimeoutRef.current = null
    }, SETTINGS_PERSIST_DELAY_MS)

    return () => {
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current)
        persistTimeoutRef.current = null
      }
    }
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
    root.style.setProperty(
      '--fx-grid-opacity',
      String((0.06 + densityFactor * 0.08).toFixed(3)),
    )
    root.style.setProperty(
      '--fx-grid-size',
      `${Math.round(34 + densityFactor * 6)}px`,
    )
    root.style.setProperty(
      '--fx-firework-scale',
      String((0.6 + densityFactor * 0.25).toFixed(2)),
    )
    root.dataset.fxAmbient = String(visualEffectToggles.ambientEffects)
    root.dataset.fxNoise = String(visualEffectToggles.noiseOverlay)
    root.dataset.fxReveal = String(visualEffectToggles.revealAnimations)
    root.dataset.fxClickAnimations = String(visualEffectToggles.clickAnimations)
    root.dataset.fxParticles = String(visualEffectToggles.particles)
    root.dataset.fxNumbers = String(visualEffectToggles.floatingNumbers)
    root.dataset.fxConeSprites = String(visualEffectToggles.coneSprites)
    root.dataset.fxShockwaves = String(visualEffectToggles.shockwaves)
    root.dataset.fxAchievementToasts = String(
      visualEffectToggles.achievementToasts,
    )
    root.dataset.fxSafeMode = String(computeSafeMode())
  }, [settings])

  const updateSettings = useCallback((updater) => {
    setSettings((current) => {
      const nextSettings = normalizeSettings(
        typeof updater === 'function' ? updater(current) : updater,
      )

      const currentKeys = Object.keys(current)
      const hasChanges = currentKeys.some(
        (key) => current[key] !== nextSettings[key],
      )
      return hasChanges ? nextSettings : current
    })
  }, [])

  const patchSettings = useCallback(
    function patchSettings(patch) {
      updateSettings((current) => ({ ...current, ...patch }))
    },
    [updateSettings],
  )

  const setVolume = useCallback(
    function setVolume(key, value) {
      patchSettings({ [key]: value })
    },
    [patchSettings],
  )

  const toggle = useCallback(
    function toggle(key) {
      updateSettings((current) => ({ ...current, [key]: !current[key] }))
    },
    [updateSettings],
  )

  const resetSettings = useCallback(
    function resetSettings() {
      updateSettings(DEFAULT_SETTINGS)
    },
    [updateSettings],
  )

  const exportSettings = useCallback(function exportSettings() {
    return normalizeSettings(settingsRef.current)
  }, [])

  const importSettings = useCallback(
    function importSettings(nextSettings) {
      updateSettings(nextSettings)
    },
    [updateSettings],
  )

  const visualValue = useMemo(() => {
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
  }, [settings])

  const audioValue = useMemo(
    () => ({
      effectVolumeFactor: settings.soundEnabled
        ? (settings.masterVolume / 100) * (settings.effectsVolume / 100)
        : 0,
    }),
    [settings.effectsVolume, settings.masterVolume, settings.soundEnabled],
  )

  const stateValue = useMemo(
    () => ({
      settings,
      exportSettings,
    }),
    [exportSettings, settings],
  )

  const actionsValue = useMemo(
    () => ({
      patchSettings,
      setVolume,
      toggle,
      resetSettings,
      importSettings,
    }),
    [importSettings, patchSettings, resetSettings, setVolume, toggle],
  )

  return (
    <SettingsActionsContext.Provider value={actionsValue}>
      <SettingsAudioContext.Provider value={audioValue}>
        <SettingsVisualContext.Provider value={visualValue}>
          <SettingsStateContext.Provider value={stateValue}>
            {children}
          </SettingsStateContext.Provider>
        </SettingsVisualContext.Provider>
      </SettingsAudioContext.Provider>
    </SettingsActionsContext.Provider>
  )
}

function useRequiredContext(context, hookName) {
  const value = useContext(context)
  if (!value) {
    throw new Error(`${hookName} must be used within SettingsProvider`)
  }
  return value
}

export function useSettingsState() {
  return useRequiredContext(SettingsStateContext, 'useSettingsState')
}

export function useSettingsActions() {
  return useRequiredContext(SettingsActionsContext, 'useSettingsActions')
}

export function useSettingsVisuals() {
  return useRequiredContext(SettingsVisualContext, 'useSettingsVisuals')
}

export function useSettingsAudio() {
  return useRequiredContext(SettingsAudioContext, 'useSettingsAudio')
}

export function useSettingsContext() {
  const state = useSettingsState()
  const actions = useSettingsActions()
  const visuals = useSettingsVisuals()
  const audio = useSettingsAudio()

  return useMemo(
    () => ({
      ...state,
      ...actions,
      ...visuals,
      ...audio,
    }),
    [actions, audio, state, visuals],
  )
}
