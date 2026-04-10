import { GameProvider } from './context/GameContext'
import { NavProvider } from './context/NavContext'
import { SettingsProvider } from './context/SettingsContext'
import {AppWrapper} from "./components/wrapper/AppWrapper.jsx"


export default function App() {
  return (
    <GameProvider>
      <SettingsProvider>
        <NavProvider>
          <AppWrapper />
        </NavProvider>
      </SettingsProvider>
    </GameProvider>
  )
}
