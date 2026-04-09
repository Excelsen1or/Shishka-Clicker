import { createContext, useContext, useState } from 'react'

export const TABS = [
  {
    id: 'clicker',
    icon: '🌰',
    label: 'Кликер',
    description: 'Кликай шишку, следи за прогрессом',
  },
  {
    id: 'subscriptions',
    icon: '🧠',
    label: 'Подписки',
    description: 'AI-сервисы для пассивного дохода',
  },
  {
    id: 'upgrades',
    icon: '⚙️',
    label: 'Апгрейды',
    description: 'Инвестиции и исследования',
  },
  {
    id: 'settings',
    icon: '🔊',
    label: 'Настройки',
    description: 'Звук, музыка и управление сохранением',
  },
]

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [activeTab, setActiveTab] = useState('clicker')
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]

  return (
    <NavContext.Provider value={{ activeTab, setActiveTab, currentTab, tabs: TABS }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}
