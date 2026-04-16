import { PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { ToggleRow } from './ToggleRow.jsx'
import { RangeRow } from './RangeRow.jsx'

export const SettingsAudio = ({
  toggle,
  setVolume,
  settings,
  resetSettings,
}) => {
  return (
    <article className="settings-card">
      <div className="settings-card__head">
        <h3 className="settings-card__title">Аудио</h3>
        <span className="settings-chip">
          <PxlKitIcon icon={Scroll} size={16} colorful className="pixel-inline-icon" /> Основное
        </span>
      </div>

      <div className="settings-stack">
        <ToggleRow
          label="Звуковые эффекты"
          hint="Клики, покупки и переключение вкладок"
          checked={settings.soundEnabled}
          onChange={() => toggle('soundEnabled')}
        />

        <RangeRow
          label="Общая громкость"
          hint="Контролирует общую громкость игры."
          value={settings.masterVolume}
          onChange={(value) => setVolume('masterVolume', value)}
        />

        <RangeRow
          label="Громкость эффектов"
          hint="Клики, покупки и UI"
          value={settings.effectsVolume}
          onChange={(value) => setVolume('effectsVolume', value)}
        />
      </div>

      <button type="button" className="settings-ghost-btn" onClick={resetSettings}>
        Сбросить настройки звука
      </button>
    </article>
  )
}
