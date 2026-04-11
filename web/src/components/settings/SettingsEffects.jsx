import { RangeRow } from './RangeRow.jsx'
import { ToggleRow } from './ToggleRow.jsx'

const EFFECT_TOGGLES = [
  { key: 'showAmbientEffects', label: 'Фоновое свечение', hint: 'Плавающие цветные пятна на фоне приложения.' },
  { key: 'showNoiseOverlay', label: 'Шумовая текстура', hint: 'Лёгкая зернистость поверх фона.' },
  { key: 'showRevealAnimations', label: 'Появление карточек', hint: 'Анимации входа у панелей, карточек и экранов.' },
  { key: 'showClickAnimations', label: 'Анимация кликера', hint: 'Пульсации, вращение колец и отклик главной кнопки.' },
  { key: 'showParticles', label: 'Частицы', hint: 'Эмодзи и искры после клика.' },
  { key: 'showFloatingNumbers', label: 'Всплывающие числа', hint: 'Текст с прибавкой ресурса над кликом.' },
  { key: 'showConeSprites', label: 'Спрайты шишек', hint: 'Дополнительные вылетающие изображения шишек.' },
  { key: 'showShockwaves', label: 'Ударные волны', hint: 'Кольца и вспышки при мощных кликах.' },
  { key: 'showAchievementToasts', label: 'Тосты достижений', hint: 'Всплывающее окно при открытии достижения.' },
]

export const SettingsEffects = ({
  settings,
  setVolume,
  visualEffectCaps,
  toggle,
}) => {
  const enabledCount = EFFECT_TOGGLES.filter(({ key }) => settings[key]).length

  return (
    <article className="settings-card">
      <div className="settings-card__head">
        <h3 className="settings-card__title">Визуальные эффекты</h3>
        <span className="settings-chip">{enabledCount}/{EFFECT_TOGGLES.length} вкл.</span>
      </div>

      <RangeRow
        label="Плотность эффектов"
        hint="Ползунок управляет общим бюджетом частиц, чисел и декоративных всплесков."
        value={settings.visualEffectsDensity}
        min={20}
        max={200}
        suffix="%"
        onChange={(value) => setVolume('visualEffectsDensity', value)}
      />

      <div className="settings-info-box">
        <div className="settings-card__label">Текущий лимит эффектов</div>
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

      <div className="settings-stack">
        {EFFECT_TOGGLES.map((item) => (
          <ToggleRow
            key={item.key}
            label={item.label}
            hint={item.hint}
            checked={Boolean(settings[item.key])}
            onChange={() => toggle(item.key)}
          />
        ))}
      </div>
    </article>
  )
}
