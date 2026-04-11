import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, saveSettings } from '../lib/settingsStorage'

const SettingsContext = createContext(null)

function detectPerformanceProfile() {
  if (typeof window === 'undefined') {
    return {
      isMobileDevice: false,
      isLowPerformanceDevice: false,
      prefersReducedMotion: false,
      keepInactiveScreensMounted: true,
      effectsBudgetMultiplier: 1,
    }
  }

  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const narrowViewport = window.innerWidth <= 820
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 8
  const deviceMemory = navigator.deviceMemory ?? 8
  const saveData = navigator.connection?.saveData === true

  const isMobileDevice = coarsePointer || narrowViewport
  const isLowPerformanceDevice =
    reducedMotion ||
    saveData ||
    hardwareConcurrency <= 4 ||
    deviceMemory <= 4

  const effectsBudgetMultiplier = reducedMotion
    ? 0
    : isLowPerformanceDevice
      ? (isMobileDevice ? 0.34 : 0.5)
      : isMobileDevice
        ? 0.7
        : 1

  return {
    isMobileDevice,
    isLowPerformanceDevice,
    prefersReducedMotion: reducedMotion,
    keepInactiveScreensMounted: !(isMobileDevice || isLowPerformanceDevice),
    effectsBudgetMultiplier,
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettings()))
  const [performanceProfile, setPerformanceProfile] = useState(() => detectPerformanceProfile())

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const densityFactor = Math.max(
      0,
      (settings.visualEffectsDensity / 100) * performanceProfile.effectsBudgetMultiplier,
    )
    const root = document.documentElement
    const prefersReducedMotion = performanceProfile.prefersReducedMotion
    const visualEffectToggles = {
      ambientEffects: settings.showAmbientEffects && !prefersReducedMotion,
      noiseOverlay: settings.showNoiseOverlay && !prefersReducedMotion,
      revealAnimations: settings.showRevealAnimations && !prefersReducedMotion,
      clickAnimations: settings.showClickAnimations && !prefersReducedMotion,
      particles: settings.showParticles && !prefersReducedMotion,
      floatingNumbers: settings.showFloatingNumbers && !prefersReducedMotion,
      coneSprites: settings.showConeSprites && !prefersReducedMotion,
      shockwaves: settings.showShockwaves && !prefersReducedMotion,
      achievementToasts: settings.showAchievementToasts,
    }

    root.style.setProperty('--fx-density', densityFactor.toFixed(2))
    root.style.setProperty('--fx-grid-opacity', String((0.06 + densityFactor * 0.08).toFixed(3)))
    root.style.setProperty('--fx-grid-size', `${Math.round(34 + densityFactor * 6)}px`)
    root.style.setProperty('--fx-firework-scale', String((0.6 + densityFactor * 0.25).toFixed(2)))
    root.dataset.performanceProfile = performanceProfile.isLowPerformanceDevice
      ? 'low'
      : performanceProfile.isMobileDevice
        ? 'mobile'
        : 'default'
    root.dataset.fxAmbient = String(visualEffectToggles.ambientEffects)
    root.dataset.fxNoise = String(visualEffectToggles.noiseOverlay)
    root.dataset.fxReveal = String(visualEffectToggles.revealAnimations)
    root.dataset.fxClickAnimations = String(visualEffectToggles.clickAnimations)
    root.dataset.fxParticles = String(visualEffectToggles.particles)
    root.dataset.fxNumbers = String(visualEffectToggles.floatingNumbers)
    root.dataset.fxConeSprites = String(visualEffectToggles.coneSprites)
    root.dataset.fxShockwaves = String(visualEffectToggles.shockwaves)
    root.dataset.fxAchievementToasts = String(visualEffectToggles.achievementToasts)
  }, [performanceProfile, settings])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)')
    const updateProfile = () => setPerformanceProfile(detectPerformanceProfile())

    updateProfile()
    window.addEventListener('resize', updateProfile)
    reducedMotionQuery.addEventListener?.('change', updateProfile)
    coarsePointerQuery.addEventListener?.('change', updateProfile)

    return () => {
      window.removeEventListener('resize', updateProfile)
      reducedMotionQuery.removeEventListener?.('change', updateProfile)
      coarsePointerQuery.removeEventListener?.('change', updateProfile)
    }
  }, [])

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
    const densityFactor = Math.max(
      0,
      (settings.visualEffectsDensity / 100) * performanceProfile.effectsBudgetMultiplier,
    )
    const particleCap = Math.max(0, Math.round(densityFactor * 24))
    const burstCap = Math.max(0, Math.round(densityFactor * 5))
    const coneCap = Math.max(0, Math.round(densityFactor * 4))
    const rainCap = Math.max(0, Math.round(densityFactor * 6))
    const fireworkCap = Math.max(0, Math.round(densityFactor * 8))
    const visualEffectToggles = {
      ambientEffects: settings.showAmbientEffects && !performanceProfile.prefersReducedMotion,
      noiseOverlay: settings.showNoiseOverlay && !performanceProfile.prefersReducedMotion,
      revealAnimations: settings.showRevealAnimations && !performanceProfile.prefersReducedMotion,
      clickAnimations: settings.showClickAnimations && !performanceProfile.prefersReducedMotion,
      particles: settings.showParticles && !performanceProfile.prefersReducedMotion,
      floatingNumbers: settings.showFloatingNumbers && !performanceProfile.prefersReducedMotion,
      coneSprites: settings.showConeSprites && !performanceProfile.prefersReducedMotion,
      shockwaves: settings.showShockwaves && !performanceProfile.prefersReducedMotion,
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
      requestedVisualEffectsFactor: settings.visualEffectsDensity / 100,
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
      performanceProfile,
    }
  }, [
    settings,
    patchSettings,
    setVolume,
    toggle,
    resetSettings,
    exportSettings,
    importSettings,
    performanceProfile,
  ])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
