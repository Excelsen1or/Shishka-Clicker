import { BottomNav } from '../bottom/BottomNav.jsx'
import { AchievementToast } from '../ui/AchievementToast.jsx'
import { DevConsole } from '../ui/DevConsole.jsx'
import { StatsBar } from '../stats/StatsBar.jsx'
import { memo, useEffect, useSyncExternalStore } from 'react'
import { Header } from '../header/Header.jsx'
import { useNav } from '../../context/NavContext.jsx'
import { useSettingsContext } from '../../context/SettingsContext.jsx'
import { useDiscordActivity } from '../../context/DiscordActivityContext.jsx'
import { SyncConflictDialog } from '../settings/SyncConflictDialog.jsx'
import { ScreenFallback } from './ScreenFallback.jsx'

export const loadClickerScreen = () => import('../clicker/ClickerScreen')
export const loadShopScreen = () => import('../shop/ShopScreen')
export const loadSettingsScreen = () => import('../settings/SettingsScreen')
export const loadMetaScreen = () => import('../meta/MetaScreen')

const screenLoaders = {
  clicker: loadClickerScreen,
  subscriptions: loadShopScreen,
  upgrades: loadShopScreen,
  meta: loadMetaScreen,
  settings: loadSettingsScreen,
}

const loadedTabs = new Set()
const screenLoadPromises = new Map()
const screenRegistry = new Map()
const screenRegistryListeners = new Set()

function notifyScreenRegistry() {
  screenRegistryListeners.forEach((listener) => listener())
}

function registerLoadedScreen(tabId, component) {
  loadedTabs.add(tabId)
  screenRegistry.set(tabId, component)
}

function registerLoadedModule(tabId, module) {
  if (tabId === 'clicker') {
    registerLoadedScreen('clicker', module.ClickerScreen)
    return
  }

  if (tabId === 'subscriptions' || tabId === 'upgrades') {
    registerLoadedScreen('subscriptions', module.ShopScreen)
    registerLoadedScreen('upgrades', module.ShopScreen)
    return
  }

  if (tabId === 'meta') {
    registerLoadedScreen('meta', module.MetaScreen)
    return
  }

  if (tabId === 'settings') {
    registerLoadedScreen('settings', module.SettingsScreen)
  }
}

export function isTabScreenLoaded(tabId) {
  return loadedTabs.has(tabId)
}

export function preloadTabScreen(tabId) {
  const loader = screenLoaders[tabId]
  if (!loader) return Promise.resolve(null)
  if (loadedTabs.has(tabId)) return Promise.resolve(screenRegistry.get(tabId) ?? null)

  const existingPromise = screenLoadPromises.get(tabId)
  if (existingPromise) return existingPromise

  const promise = loader()
    .then((module) => {
      registerLoadedModule(tabId, module)
      notifyScreenRegistry()
      return module
    })
    .finally(() => {
      screenLoadPromises.delete(tabId)
      if (tabId === 'subscriptions' || tabId === 'upgrades') {
        screenLoadPromises.delete('subscriptions')
        screenLoadPromises.delete('upgrades')
      }
    })

  screenLoadPromises.set(tabId, promise)

  if (tabId === 'subscriptions' || tabId === 'upgrades') {
    screenLoadPromises.set('subscriptions', promise)
    screenLoadPromises.set('upgrades', promise)
  }

  return promise
}

function subscribeToScreenRegistry(listener) {
  screenRegistryListeners.add(listener)
  return () => {
    screenRegistryListeners.delete(listener)
  }
}

function getScreenRegistrySnapshot() {
  return screenRegistry.size
}

function renderLoadedScreen(tabId) {
  const ScreenComponent = screenRegistry.get(tabId)
  if (!ScreenComponent) {
    return <ScreenFallback />
  }

  switch (tabId) {
    case 'clicker':
      return <ScreenComponent />
    case 'subscriptions':
      return <ScreenComponent type="subscriptions" />
    case 'upgrades':
      return <ScreenComponent type="upgrades" />
    case 'meta':
      return <ScreenComponent />
    case 'settings':
      return <ScreenComponent />
    default:
      return <ScreenFallback />
  }
}

const AppBackground = memo(function AppBackground({ visualEffectToggles }) {
  const showAmbientOrbs = visualEffectToggles.ambientEffects
  const showNoiseOverlay = visualEffectToggles.noiseOverlay

  return (
    <>
      {showAmbientOrbs ? <div className="ambient ambient--a" /> : null}
      {showAmbientOrbs ? <div className="ambient ambient--b" /> : null}
      {showAmbientOrbs ? <div className="ambient ambient--c" /> : null}
      {showNoiseOverlay ? <div className="noise-overlay" /> : null}
    </>
  )
})

export const AppWrapper = memo(function AppWrapper() {
  const { activeTab, transitionDirection } = useNav()
  const { visualEffectToggles } = useSettingsContext()
  const { saveReady, status, syncState, enterOfflineMode } = useDiscordActivity()

  useSyncExternalStore(subscribeToScreenRegistry, getScreenRegistrySnapshot, getScreenRegistrySnapshot)

  useEffect(() => {
    void preloadTabScreen('clicker')
  }, [])

  useEffect(() => {
    const preloadScreens = () => {
      void preloadTabScreen('subscriptions')
      void preloadTabScreen('settings')
      void preloadTabScreen('meta')
    }

    if (typeof window === 'undefined') return undefined

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(preloadScreens, { timeout: 1200 })
      return () => window.cancelIdleCallback?.(idleId)
    }

    const timeoutId = window.setTimeout(preloadScreens, 250)
    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <div className="app-shell">
      <AppBackground visualEffectToggles={visualEffectToggles} />

      <div className="app-content">
        <Header />
        <main className={`app-main ${saveReady ? '' : 'app-main--boot'}`.trim()}>
          {saveReady ? <StatsBar className="stats-bar--shop" /> : null}
          <div className={`screen-bg ${saveReady ? '' : 'screen-bg--boot'}`.trim()}>
            <div className="screen__glow" />
            <div
              key={activeTab}
              className={`screen-stage ${visualEffectToggles.revealAnimations ? 'screen-stage--animate' : ''} ${saveReady ? '' : 'screen-stage--boot'}`.trim()}
              data-direction={transitionDirection}
            >
              {saveReady ? (
                renderLoadedScreen(activeTab)
              ) : (
                <ScreenFallback
                  mode="boot"
                  phase={syncState === 'syncing' ? 'syncing' : status === 'connecting' ? 'connecting' : 'loading'}
                  allowOffline
                  onSkipSync={enterOfflineMode}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <AchievementToast />
      <SyncConflictDialog />
      <DevConsole />
      {saveReady ? <BottomNav /> : null}
    </div>
  )
})
