import { useNav } from '../../context/NavContext'
import { useSound } from '../../hooks/useSound'
import switchSound from '../../assets/wpn_select.mp3'

export function BottomNav() {
  const { activeTab, setActiveTab, tabs } = useNav()
  const { play } = useSound(switchSound)

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      play()               // 🔊 звук переключения
      setActiveTab(tabId)  // смена вкладки
    }
  }

  return (
    <nav className="bottom-nav" aria-label="Разделы игры">
      <div className="bottom-nav__track">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              className={`bottom-nav__btn ${isActive ? 'bottom-nav__btn--active' : ''}`}
              onClick={() => handleTabChange(tab.id)} // 👈 изменили здесь
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