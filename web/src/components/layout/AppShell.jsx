import { Suspense, lazy, useEffect, useState } from 'react'
import { setupDiscord } from '../../discord'
import { useNav } from '../../context/NavContext'
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { StatsBar } from '../stats/StatsBar'
import backgroundMusic from '../../assets/audio/music/background.mp3'

const ClickerScreen = lazy(() => import('../clicker/ClickerScreen').then((module) => ({ default: module.ClickerScreen })))
const ShopScreen = lazy(() => import('../shop/ShopScreen').then((module) => ({ default: module.ShopScreen })))
const SettingsScreen = lazy(() => import('../settings/SettingsScreen').then((module) => ({ default: module.SettingsScreen })))
const MetaScreen = lazy(() => import('../meta/MetaScreen').then((module) => ({ default: module.MetaScreen })))

function ScreenFallback() {
  return (
    <section className="screen">
      <div className="screen__glow" />
      <div className="screen__header">
        <span className="screen__kicker">Загрузка</span>
        <h2 className="screen__title">Подготавливаем экран</h2>
        <p className="screen__desc">
          UI теперь грузится по вкладкам, поэтому первый переход может занять долю секунды.
        </p>
      </div>
    </section>
  )
}

export function AppShell() {
  const { activeTab } = useNav()
  const [user, setUser] = useState(null)

  useBackgroundMusic(backgroundMusic)

  useEffect(() => {
    setupDiscord().then(setUser).catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      <div className="ambient ambient--a" />
      <div className="ambient ambient--b" />
      <div className="ambient ambient--c" />
      <div className="noise-overlay" />

      <div className="app-content">
        <Header user={user} />
        <StatsBar />

        <main className="app-main">
          <Suspense fallback={<ScreenFallback />}>
            {activeTab === 'clicker' && <ClickerScreen />}
            {activeTab === 'subscriptions' && <ShopScreen type="subscriptions" />}
            {activeTab === 'upgrades' && <ShopScreen type="upgrades" />}
            {activeTab === 'meta' && <MetaScreen />}
            {activeTab === 'settings' && <SettingsScreen />}
          </Suspense>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
