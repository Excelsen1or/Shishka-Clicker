import { NavProvider } from './context/NavContext'
import { SettingsProvider } from './context/SettingsContext'
import { DiscordActivityProvider } from './context/DiscordActivityContext.jsx'
import { AppWrapper } from './components/wrapper/AppWrapper.jsx'
import { StoresProvider } from './stores/StoresProvider.jsx'

export default function App() {
  return (
    <StoresProvider>
      <SettingsProvider>
        <DiscordActivityProvider>
          <NavProvider>
            <AppWrapper />
          </NavProvider>
        </DiscordActivityProvider>
      </SettingsProvider>
    </StoresProvider>
  )
}
