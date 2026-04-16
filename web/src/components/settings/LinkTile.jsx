export const LinkTile = ({ title, hint, href, icon = null }) => {
  return (
    <a
      className="settings-link-tile"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="settings-link-tile__title">
        {icon ? (
          <span className="settings-link-tile__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {title}
      </span>
      <span className="settings-link-tile__hint">{hint}</span>
    </a>
  )
}
