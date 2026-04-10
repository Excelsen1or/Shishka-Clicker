export const ToggleRow = ({ label, hint, checked, onChange }) => {
	return (
		<label className="settings-toggle">
			<div>
				<div className="settings-card__label">{label}</div>
				<div className="settings-card__hint">{hint}</div>
			</div>
			<button
				type="button"
				className={`settings-switch ${checked ? 'settings-switch--active' : ''}`}
				onClick={onChange}
				aria-pressed={checked}
			>
				<span className="settings-switch__thumb" />
			</button>
		</label>
	)
}