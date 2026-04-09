import { GameProvider } from './context/GameContext'
import { NavProvider } from './context/NavContext'
import { AppShell } from './components/layout/AppShell'


export default function App() {
  return (
    <GameProvider>
      <NavProvider>
        <AppShell />
      </NavProvider>
    </GameProvider>
  )
}
