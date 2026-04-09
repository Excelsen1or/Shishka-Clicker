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

function RangeRow({ label, hint, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }) {
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

export function SettingsScreen() {
  const { resetGame, markSilenceLover } = useGameContext()
  const {
    settings,
    setVolume,
    toggle,
    resetSettings,
    visualEffectCaps,
  } = useSettingsContext()

  const handleMusicToggle = () => {
    if (settings.musicEnabled) markSilenceLover()
    toggle('musicEnabled')
  }

  const handleMusicVolume = (value) => {
    if (value <= 5) markSilenceLover()
    setVolume('musicVolume', value)
  }

  return (
    <section className="screen settings-screen">
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">Настройки</span>
        <h2 className="screen__title">Звук, эффекты и управление прогрессом</h2>
        <p className="screen__desc">
          Настрой громкость, интенсивность визуальных эффектов и при необходимости быстро сбрось сохранение.
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

          <button type="button" className="settings-ghost-btn" onClick={resetSettings}>
            Сбросить настройки звука
          </button>
        </article>

        <article className="settings-card">
          <h3 className="settings-card__title">Визуальные эффекты</h3>

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

        <article className="settings-card settings-card--danger">
          <h3 className="settings-card__title">Игра</h3>
          <p className="settings-card__hint settings-card__hint--block">
            Кнопка ниже очищает только игровое сохранение. Аудио и остальные локальные настройки останутся как есть.
          </p>

          <button type="button" className="reset-btn" onClick={resetGame}>
            Сбросить весь прогресс
          </button>
        </article>
      </div>
    </section>
  )
}
