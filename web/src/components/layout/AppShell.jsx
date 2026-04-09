import { useEffect, useState } from 'react'
import { setupDiscord } from '../../discord'
import { useNav } from '../../context/NavContext'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { StatsBar } from '../stats/StatsBar'
import { ClickerScreen } from '../clicker/ClickerScreen'
import { ShopScreen } from '../shop/ShopScreen'

export function AppShell() {
  const { activeTab } = useNav()
  const [user, setUser] = useState(null)

  useEffect(() => {
    setupDiscord().then(setUser).catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      {/* Ambient background blobs */}
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
        </main>
      </div>

      <BottomNav />
    </div>
  )
}