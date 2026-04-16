import { memo } from 'react'

export const ToggleRow = memo(function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}) {
  return (
    <div className="settings-toggle">
      <div className="settings-toggle__copy settings-copy-group">
        <div className="settings-card__label">{label}</div>
        <div className="settings-card__hint">{hint}</div>
      </div>
      <button
        type="button"
        role="switch"
        className={`settings-switch ${checked ? 'settings-switch--active' : ''}`}
        onClick={onChange}
        aria-checked={checked}
        aria-label={`${label}: ${checked ? 'включено' : 'выключено'}`}
      >
        <span className="settings-switch__thumb" />
      </button>
    </div>
  )
})
