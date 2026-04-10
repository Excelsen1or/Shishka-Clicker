export const StatusTile = ({ label, value, hint }) => {
	return (
		<article className="settings-status-tile">
			<span className="settings-status-tile__label">{label}</span>
			<strong className="settings-status-tile__value">{value}</strong>
			<span className="settings-status-tile__hint">{hint}</span>
		</article>
	)
}