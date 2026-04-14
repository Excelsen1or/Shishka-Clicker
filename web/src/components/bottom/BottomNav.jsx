import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useNav } from '../../context/NavContext.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useSound } from '../../hooks/useSound.js'
import switchSound from '../../assets/audio/ui/wpn_select.mp3'
import { isTabScreenLoaded, preloadTabScreen } from '../wrapper/AppWrapper.jsx'

function getButtonClassName(isActive) {
  return `bottom-nav__btn ${isActive ? 'bottom-nav__btn--active' : ''}`
}

export const BottomNav = observer(function BottomNav() {
  const { activeTab, setActiveTab, tabs } = useNav()
  const { bottomNavAlerts } = useGameStore()
  const { play } = useSound(switchSound, { volume: 0.1 })

  const handleTabChange = useCallback(async (tabId) => {
    if (tabId === activeTab) return

    if (!isTabScreenLoaded(tabId)) {
      await preloadTabScreen(tabId)
    }

    play()
    setActiveTab(tabId)
  }, [activeTab, play, setActiveTab])

  return (
    <nav className="bottom-nav" aria-label="Разделы игры">
      <div className="bottom-nav__track">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const alert = bottomNavAlerts[tab.id]

          return (
            <button
              key={tab.id}
              type="button"
              className={getButtonClassName(isActive)}
              onClick={() => void handleTabChange(tab.id)}
              onMouseEnter={() => void preloadTabScreen(tab.id)}
              onFocus={() => void preloadTabScreen(tab.id)}
              onTouchStart={() => void preloadTabScreen(tab.id)}
              aria-pressed={isActive}
            >
              <span className="bottom-nav__icon">{tab.icon}</span>
              <span className="bottom-nav__label">{tab.label}</span>
              {alert?.count > 0 ? (
                <span
                  className={`bottom-nav__alert ${alert.hasReady ? 'bottom-nav__alert--ready' : 'bottom-nav__alert--new'}`}
                  aria-hidden="true"
                >
                  {alert.count > 9 ? '9+' : alert.count}
                </span>
              ) : null}
              {isActive ? <span className="bottom-nav__pip" /> : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
})
