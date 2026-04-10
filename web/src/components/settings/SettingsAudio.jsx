import {ToggleRow} from "./ToggleRow.jsx"
import {RangeRow} from "./RangeRow.jsx"


export const SettingsAudio = ({
	handleMusicToggle,
	handleMusicVolume,
	toggle,
	setVolume,
	settings,
	resetSettings
															}) => {
	return (
		<article className="settings-card">
			<div className="settings-card__head">
				<h3 className="settings-card__title">Аудио</h3>
				<span className="settings-chip">Основное</span>
			</div>

			<div className="settings-stack">
				<ToggleRow
					label="Звуковые эффекты"
					hint="Клики, покупки и переключение вкладок"
					checked={settings.soundEnabled}
					onChange={() => toggle('soundEnabled')}
				/>

				<ToggleRow
					label="Фоновая музыка"
					hint="Выключение откроет секретное достижение для любителей тишины"
					checked={settings.musicEnabled}
					onChange={handleMusicToggle}
				/>

				<RangeRow
					label="Общая громкость"
					hint="Главный множитель для всех звуков"
					value={settings.masterVolume}
					onChange={(value) => setVolume('masterVolume', value)}
				/>

				<RangeRow
					label="Громкость эффектов"
					hint="Клики, покупки и UI"
					value={settings.effectsVolume}
					onChange={(value) => setVolume('effectsVolume', value)}
				/>

				<RangeRow
					label="Громкость музыки"
					hint="Опусти почти в ноль, если хочешь тишины"
					value={settings.musicVolume}
					onChange={handleMusicVolume}
				/>
			</div>

			<button type="button" className="settings-ghost-btn" onClick={resetSettings}>
				Сбросить настройки звука
			</button>
		</article>
	)
}