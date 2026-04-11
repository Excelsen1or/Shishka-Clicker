import { memo, useCallback, useMemo } from 'react'
import { useNav } from '../../context/NavContext.jsx'
import { useGameContext } from '../../context/GameContext.jsx'
import { useSound } from '../../hooks/useSound.js'
import switchSound from '../../assets/audio/ui/wpn_select.mp3'

function getButtonClassName(isActive) {
  return `bottom-nav__btn ${isActive ? 'bottom-nav__btn--active' : ''}`
}

export const BottomNav = memo(function BottomNav() {
  const { activeTab, setActiveTab, tabs } = useNav()
  const { economy } = useGameContext()
  const { play } = useSound(switchSound, { volume: 0.1 })

  const tabAlerts = useMemo(() => ({
    subscriptions: (() => {
      const items = economy.subscriptions ?? []
      const readyCount = items.filter((item) => item.isBuyableNew).length
      const newCount = items.filter((item) => item.isNew && !item.isBuyableNew).length
      return {
        count: readyCount || newCount,
        hasReady: readyCount > 0,
      }
    })(),
    upgrades: (() => {
      const items = economy.upgrades ?? []
      const readyCount = items.filter((item) => item.isBuyableNew).length
      const newCount = items.filter((item) => item.isNew && !item.isBuyableNew).length
      return {
        count: readyCount || newCount,
        hasReady: readyCount > 0,
      }
    })(),
  }), [economy.subscriptions, economy.upgrades])

  const handleTabChange = useCallback((tabId) => {
    play()
    setActiveTab(tabId)
  }, [play, setActiveTab])

  return (
    <nav className="bottom-nav" aria-label="Разделы игры">
      <div className="bottom-nav__track">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const alert = tabAlerts[tab.id]

          return (
            <button
              key={tab.id}
              type="button"
              className={getButtonClassName(isActive)}
              onClick={() => handleTabChange(tab.id)}
              aria-pressed={isActive}
            >
              <span className="bottom-nav__icon">{tab.icon}</span>
              <span className="bottom-nav__label">{tab.label}</span>
              {alert?.count > 0 && (
                <span
                  className={`bottom-nav__alert ${alert.hasReady ? 'bottom-nav__alert--ready' : 'bottom-nav__alert--new'}`}
                  aria-hidden="true"
                >
                  {alert.count > 9 ? '9+' : alert.count}
                </span>
              )}
              {isActive && <span className="bottom-nav__pip" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
})
