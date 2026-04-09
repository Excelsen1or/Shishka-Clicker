import { GameProvider } from './context/GameContext'
import { NavProvider } from './context/NavContext'
import { SettingsProvider } from './context/SettingsContext'
import { AppShell } from './components/layout/AppShell'

export default function App() {
  return (
    <GameProvider>
      <SettingsProvider>
        <NavProvider>
          <AppShell />
        </NavProvider>
      </SettingsProvider>
    </GameProvider>
  )
}
