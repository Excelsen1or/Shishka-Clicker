import {RangeRow} from "./RangeRow.jsx"


export const SettingsEffects = ({
	settings,
	setVolume,
	visualEffectCaps
																}) => {
	return (
		<article className="settings-card">
			<div className="settings-card__head">
				<h3 className="settings-card__title">Визуальные эффекты</h3>
				<span className="settings-chip">Производительность</span>
			</div>

			<RangeRow
				label="Плотность эффектов"
				hint="Один ползунок управляет общим лимитом шишек, эмодзи и всплывающих чисел на экране."
				value={settings.visualEffectsDensity}
				min={20}
				max={200}
				suffix="%"
				onChange={(value) => setVolume('visualEffectsDensity', value)}
			/>

			<div className="settings-info-box">
				<div className="settings-info-box__title">Текущий лимит эффектов</div>
				<div className="settings-info-box__grid">
					<div>
						<span>Эмодзи и шишки</span>
						<strong>до {visualEffectCaps.particleCap}</strong>
					</div>
					<div>
						<span>Всплывающие числа</span>
						<strong>до {visualEffectCaps.burstCap}</strong>
					</div>
					<div>
						<span>Доп. спрайты шишек</span>
						<strong>до {visualEffectCaps.coneCap}</strong>
					</div>
					<div>
						<span>Общий бюджет</span>
						<strong>{visualEffectCaps.totalHint}</strong>
					</div>
				</div>
			</div>
		</article>
	)
}