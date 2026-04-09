import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'

function ToggleRow({ label, hint, checked, onChange }) {
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

function RangeRow({ label, hint, value, onChange }) {
  return (
    <label className="settings-range">
      <div className="settings-range__head">
        <div>
          <div className="settings-card__label">{label}</div>
          <div className="settings-card__hint">{hint}</div>
        </div>
        <div className="settings-range__value">{value}%</div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export function SettingsScreen() {
  const { resetGame } = useGameContext()
  const { settings, setVolume, toggle, resetSettings } = useSettingsContext()

  return (
    <section className="screen settings-screen">
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">Настройки</span>
        <h2 className="screen__title">Звук и управление прогрессом</h2>
        <p className="screen__desc">
          Управляй общей громкостью, отдельно настрой эффекты и музыку, а также сбрасывай сохранение из одного места.
        </p>
      </div>

      <div className="settings-grid">
        <article className="settings-card">
          <h3 className="settings-card__title">Аудио</h3>

          <ToggleRow
            label="Звуковые эффекты"
            hint="Клики, покупки и переключение вкладок"
            checked={settings.soundEnabled}
            onChange={() => toggle('soundEnabled')}
          />

          <ToggleRow
            label="Фоновая музыка"
            hint="Отдельный канал громкости для фонового трека"
            checked={settings.musicEnabled}
            onChange={() => toggle('musicEnabled')}
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
            hint="Фоновая композиция"
            value={settings.musicVolume}
            onChange={(value) => setVolume('musicVolume', value)}
          />

          <button type="button" className="settings-ghost-btn" onClick={resetSettings}>
            Сбросить настройки звука
          </button>
        </article>

        <article className="settings-card settings-card--danger">
          <h3 className="settings-card__title">Игра</h3>
          <p className="settings-card__hint settings-card__hint--block">
            Полный сброс удалит текущий прогресс, но не затронет параметры звука.
          </p>

          <button type="button" className="reset-btn" onClick={resetGame}>
            Сбросить прогресс
          </button>
        </article>
      </div>
    </section>
  )
}
