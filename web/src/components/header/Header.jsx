import { APP_VERSION, CHANGELOG_URL } from '../../config/appMeta.js'

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__glow" />
      <div className="app-header__inner">
        <h1 className="app-header__title">Шишки онлайн!</h1>

        <a
          className="app-header__link"
          href={CHANGELOG_URL}
          target="_blank"
          rel="noreferrer"
        >
          v{APP_VERSION}
        </a>
      </div>
    </header>
  )
}
