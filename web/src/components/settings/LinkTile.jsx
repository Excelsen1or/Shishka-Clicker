export const LinkTile = ({ title, hint, href }) => {
	return (
		<a className="settings-link-tile" href={href} target="_blank" rel="noreferrer">
			<span className="settings-link-tile__title">{title}</span>
			<span className="settings-link-tile__hint">{hint}</span>
		</a>
	)
}