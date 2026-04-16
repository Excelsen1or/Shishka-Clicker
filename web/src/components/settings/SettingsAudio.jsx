import { memo } from 'react'
import { PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { ToggleRow } from './ToggleRow.jsx'
import { RangeRow } from './RangeRow.jsx'

export const SettingsAudio = memo(function SettingsAudio({
  soundEnabled,
  masterVolume,
  effectsVolume,
  toggle,
  setVolume,
  resetSettings,
}) {
  return (
    <article className="settings-card">
      <div className="settings-card__head">
        <h3 className="settings-card__title">Звук</h3>
        <span className="settings-chip">
          <PxlKitIcon
            icon={Scroll}
            size={16}
            colorful
            className="pixel-inline-icon"
          />{' '}
          Основное
        </span>
      </div>

      <div className="settings-stack">
        <ToggleRow
          label="Включить звуковые эффекты"
          hint="Выключает все звуковые эффекты"
          checked={soundEnabled}
          onChange={() => toggle('soundEnabled')}
        />

        <RangeRow
          label="Микшер громкости"
          hint="Общая громкость всех эффектов"
          value={masterVolume}
          onChange={(value) => setVolume('masterVolume', value)}
        />

        <RangeRow
          label="Громкость эффектов"
          hint="Настраивает громкость элементов UI"
          value={effectsVolume}
          onChange={(value) => setVolume('effectsVolume', value)}
        />
      </div>

      <button
        type="button"
        className="settings-ghost-btn"
        onClick={resetSettings}
      >
        Сбросить настройки звука
      </button>
    </article>
  )
})
