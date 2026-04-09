import {useEffect, useRef, useState} from 'react'
import { setupDiscord } from '../../discord'
import { useNav } from '../../context/NavContext'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { StatsBar } from '../stats/StatsBar'
import { ClickerScreen } from '../clicker/ClickerScreen'
import { ShopScreen } from '../shop/ShopScreen'
import backgroundMusic from "../../assets/audio/music/background.mp3"
import {useSound} from "../../hooks/useSound.js"


export function AppShell() {
  const { activeTab } = useNav()
  const [user, setUser] = useState(null)
  const { play } = useSound(backgroundMusic, { volume: 0.1 })
  const events = ["click", "touchstart", "keydown"]

  useEffect(() => {
    setupDiscord().then(setUser).catch(() => {})

    events.map(event => window.addEventListener(event, startMusic))

    setInterval(() => startMusic(), 60 * 2 * 1000) // каждые 2 минуты включает backgroundMusic
  }, [])

  const startMusic = () => {
    play()
    events.map(event => window.removeEventListener(event, startMusic))
  }

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
