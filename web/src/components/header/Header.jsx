import { memo } from 'react'
import { APP_VERSION, CHANGELOG_URL } from '../../config/appMeta.js'
import { LeaderboardWidget } from '../clicker/LeaderboardWidget.jsx'

export const Header = memo(function Header() {
  return (
    <header className="app-header app-header--pixel pixel-surface">
      <div className="app-header__glow" />
      <div className="app-header__inner">
        <h1 className="app-header__title">Шишки онлайн!</h1>

        <div className="app-header__actions">
          <LeaderboardWidget placement="header" />

          <a
            className="app-header__link app-header__link--pixel pixel-badge"
            href={CHANGELOG_URL}
            target="_blank"
            rel="noreferrer"
          >
            v{APP_VERSION}
          </a>
        </div>
      </div>
    </header>
  )
})
