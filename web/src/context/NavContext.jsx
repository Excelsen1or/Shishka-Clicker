import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { PxlKitIcon, Trophy, Community, Settings, Coin } from '../lib/pxlkit'
import { ConeIcon } from '../components/ui/ConeIcon'

const PixelNavIcon = ({ icon, label }) => (
  <PxlKitIcon
    icon={icon}
    size={20}
    colorful
    className="pixel-inline-icon"
    aria-label={label}
  />
)

export const TABS = [
  {
    id: 'clicker',
    icon: <ConeIcon />,
    label: 'Кликер',
    description: 'Кликай шишку, следи за прогрессом',
  },
  {
    id: 'purchases',
    icon: <PixelNavIcon icon={Community} label="Покупки" />,
    label: 'Покупки',
    description: 'Здания и усиления в одном пиксель-магазине',
  },
  {
    id: 'market',
    icon: <PixelNavIcon icon={Coin} label="Рынок" />,
    label: 'Рынок',
    description: 'Торгуй серым дефицитом и шумом',
  },
  {
    id: 'meta',
    icon: <PixelNavIcon icon={Trophy} label="Мета" />,
    label: 'Мета',
    description: 'Небесные шишки и комочки',
  },
  {
    id: 'settings',
    icon: <PixelNavIcon icon={Settings} label="Настройки" />,
    label: 'Настройки',
    description: 'Звук, музыка и управление сохранением',
  },
]

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [activeTab, setActiveTab] = useState('clicker')
  const [transitionDirection, setTransitionDirection] = useState('forward')
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0]

  const setActiveTabWithDirection = useCallback((nextTab) => {
    setActiveTab((currentTabId) => {
      if (currentTabId === nextTab) return currentTabId

      const currentIndex = TABS.findIndex((tab) => tab.id === currentTabId)
      const nextIndex = TABS.findIndex((tab) => tab.id === nextTab)
      setTransitionDirection(nextIndex >= currentIndex ? 'forward' : 'backward')
      return nextTab
    })
  }, [])

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab: setActiveTabWithDirection,
      currentTab,
      tabs: TABS,
      transitionDirection,
    }),
    [activeTab, currentTab, setActiveTabWithDirection, transitionDirection],
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}
