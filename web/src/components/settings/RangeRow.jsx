export const RangeRow = ({ label, hint, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }) => {
	return (
		<label className="settings-range">
			<div className="settings-range__head">
				<div>
					<div className="settings-card__label">{label}</div>
					<div className="settings-card__hint">{hint}</div>
				</div>
				<div className="settings-range__value">{value}{suffix}</div>
			</div>

			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</label>
	)
}