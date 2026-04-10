import { useNav } from '../../context/NavContext'
import { useSound } from '../../hooks/useSound'
import switchSound from '../../assets/audio/ui/wpn_select.mp3'

function getButtonClassName(isActive) {
  return `bottom-nav__btn ${isActive ? 'bottom-nav__btn--active' : ''}`
}

export function BottomNav() {
  const { activeTab, setActiveTab, tabs } = useNav()
  const { play } = useSound(switchSound, { volume: 0.1 })

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return

    play()
    setActiveTab(tabId)
  }

  return (
    <nav className="bottom-nav" aria-label="Разделы игры">
      <div className="bottom-nav__track">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab

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
              {isActive && <span className="bottom-nav__pip" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
