import { useEffect, useState } from 'react'
import { setupDiscord } from '../../discord'
import { useNav } from '../../context/NavContext'
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { StatsBar } from '../stats/StatsBar'
import { ClickerScreen } from '../clicker/ClickerScreen'
import { ShopScreen } from '../shop/ShopScreen'
import { SettingsScreen } from '../settings/SettingsScreen'
import backgroundMusic from '../../assets/audio/music/background.mp3'

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
          {activeTab === 'clicker' && <ClickerScreen />}
          {activeTab === 'subscriptions' && <ShopScreen type="subscriptions" />}
          {activeTab === 'upgrades' && <ShopScreen type="upgrades" />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
