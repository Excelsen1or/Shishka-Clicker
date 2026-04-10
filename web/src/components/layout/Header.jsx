const CHANGELOG_URL = 'https://github.com/AREKKUZZERA/Shishka-Clicker/releases'

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
          v1.5.45
        </a>
      </div>
    </header>
  )
}
