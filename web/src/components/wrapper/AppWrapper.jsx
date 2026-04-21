import { BottomNav } from '../bottom/BottomNav.jsx'
import { AchievementToast } from '../ui/AchievementToast.jsx'
import { DevConsole } from '../ui/DevConsole.jsx'
import { EventToast } from '../ui/EventToast.jsx'
import { StatsBar } from '../stats/StatsBar.jsx'
import { Suspense, lazy, memo, useEffect, useSyncExternalStore } from 'react'
import { observer } from 'mobx-react-lite'
import { Header } from '../header/Header.jsx'
import { useNav } from '../../context/NavContext.jsx'
import { useSettingsVisuals } from '../../context/SettingsContext.jsx'
import { useDiscordBoot } from '../../context/DiscordActivityContext.jsx'
import { ScreenFallback } from './ScreenFallback.jsx'
import { AmbientCanvas } from '../ui/AmbientCanvas.jsx'

const DiscordRichPresenceBridge = lazy(() =>
  import('../discord/DiscordRichPresenceBridge.jsx').then((module) => ({
    default: module.DiscordRichPresenceBridge,
  })),
)

export const loadClickerScreen = () => import('../clicker/ClickerScreen')
export const loadShopScreen = () => import('../shop/ShopScreen')
export const loadSettingsScreen = () => import('../settings/SettingsScreen')
export const loadMetaScreen = () => import('../meta/MetaScreen')
export const loadMarketScreen = () => import('../market/MarketScreen')

const screenLoaders = {
  clicker: loadClickerScreen,
  purchases: loadShopScreen,
  market: loadMarketScreen,
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

  if (tabId === 'purchases') {
    registerLoadedScreen('purchases', module.ShopScreen)
    return
  }

  if (tabId === 'meta') {
    registerLoadedScreen('meta', module.MetaScreen)
    return
  }

  if (tabId === 'market') {
    registerLoadedScreen('market', module.MarketScreen)
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
  if (loadedTabs.has(tabId))
    return Promise.resolve(screenRegistry.get(tabId) ?? null)

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
      if (tabId === 'purchases') {
        screenLoadPromises.delete('purchases')
      }
    })

  screenLoadPromises.set(tabId, promise)

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
    case 'purchases':
      return <ScreenComponent />
    case 'meta':
      return <ScreenComponent />
    case 'market':
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
    <AmbientCanvas showAmbient={showAmbientOrbs} showNoise={showNoiseOverlay} />
  )
})

function resolveBootProgress({ status, syncState }) {
  const sessionReady = status === 'ready'
  const syncReady = syncState === 'synced' || syncState === 'offline'

  const steps = [
    {
      id: 'session',
      label: 'Сессия',
      detail: sessionReady
        ? 'Профиль найден'
        : 'Проверяем вход и профиль игрока',
      state: sessionReady
        ? 'done'
        : status === 'error'
          ? 'error'
          : status === 'connecting'
            ? 'active'
            : 'pending',
    },
    {
      id: 'save',
      label: 'Сейв',
      detail: syncReady
        ? 'Прогресс готов'
        : syncState === 'syncing'
          ? 'Сверяем прогресс с облаком'
          : 'Поднимаем сохранение',
      state: syncReady
        ? 'done'
        : syncState === 'error'
          ? 'error'
          : syncState === 'syncing' || syncState === 'loading'
            ? 'active'
            : 'pending',
    },
  ]

  const completedSteps = steps.filter((step) => step.state === 'done').length
  const activeStep = steps.find((step) => step.state === 'active')
  const progressTarget = Math.min(
    96,
    completedSteps * 32 + (activeStep ? 18 : 0),
  )

  if (completedSteps === steps.length) {
    return {
      phase: 'ready',
      progressTarget: 100,
      steps,
    }
  }

  return {
    phase:
      syncState === 'syncing'
        ? 'syncing'
        : status === 'connecting'
          ? 'connecting'
          : 'loading',
    progressTarget,
    steps,
  }
}

export const AppWrapper = observer(function AppWrapper() {
  const { activeTab, transitionDirection } = useNav()
  const { visualEffectToggles } = useSettingsVisuals()
  const { saveReady, status, syncState, enterOfflineMode } = useDiscordBoot()
  const showBootScreen = !saveReady
  const bootProgress = resolveBootProgress({
    status,
    syncState,
  })

  useSyncExternalStore(
    subscribeToScreenRegistry,
    getScreenRegistrySnapshot,
    getScreenRegistrySnapshot,
  )

  useEffect(() => {
    void preloadTabScreen('clicker')
  }, [])

  useEffect(() => {
    const preloadScreens = () => {
      void preloadTabScreen('purchases')
      void preloadTabScreen('market')
      void preloadTabScreen('settings')
      void preloadTabScreen('meta')
    }

    if (typeof window === 'undefined') return undefined

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(preloadScreens, {
        timeout: 1200,
      })
      return () => window.cancelIdleCallback?.(idleId)
    }

    const timeoutId = window.setTimeout(preloadScreens, 250)
    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <div className="app-shell">
      <AppBackground visualEffectToggles={visualEffectToggles} />
      {showBootScreen ? null : (
        <Suspense fallback={null}>
          <DiscordRichPresenceBridge />
        </Suspense>
      )}

      <div className="app-content">
        <Header />
        <main
          className={`app-main ${showBootScreen ? 'app-main--boot' : ''}`.trim()}
        >
          {showBootScreen ? null : <StatsBar className="stats-bar--shop" />}
          <div
            className={`screen-bg ${showBootScreen ? 'screen-bg--boot' : ''}`.trim()}
          >
            <div className="screen__glow" />
            <div
              key={activeTab}
              className={`screen-stage ${visualEffectToggles.revealAnimations ? 'screen-stage--animate' : ''} ${showBootScreen ? 'screen-stage--boot' : ''}`.trim()}
              data-direction={transitionDirection}
            >
              {showBootScreen ? (
                <ScreenFallback
                  mode="boot"
                  phase={bootProgress.phase}
                  progressTarget={bootProgress.progressTarget}
                  steps={bootProgress.steps}
                  allowOffline
                  onSkipSync={enterOfflineMode}
                />
              ) : (
                renderLoadedScreen(activeTab)
              )}
            </div>
          </div>
        </main>
      </div>

      <AchievementToast />
      <EventToast />
      <DevConsole />
      {showBootScreen ? null : <BottomNav />}
    </div>
  )
})
