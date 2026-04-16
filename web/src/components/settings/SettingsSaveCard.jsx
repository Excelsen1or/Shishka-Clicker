import { Gem, PxlKitIcon } from '../../lib/pxlkit'

export const SettingsSaveCard = ({
  handleExportSave,
  handleImportSave,
  handleImportClick,
  handleRevealSaveText,
  handleCopySaveText,
  importInputRef,
  transferStatus,
  exportedSaveText,
  exportTextRef,
}) => {
  return (
    <article className="settings-card settings-card--save">
      <div className="settings-card__head">
        <h3 className="settings-card__title">Экспорт и импорт сейвов</h3>
        <span className="settings-chip">
          <PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" /> Backup
        </span>
      </div>

      <div className="settings-transfer-actions">
        <button type="button" className="settings-ghost-btn" onClick={handleExportSave}>
          Экспортировать сейв
        </button>
        <button type="button" className="settings-ghost-btn" onClick={handleImportClick}>
          Импортировать сейв
        </button>
        <button type="button" className="settings-ghost-btn" onClick={handleRevealSaveText}>
          Показать текст сейва
        </button>
        <button type="button" className="settings-ghost-btn" onClick={handleCopySaveText}>
          Скопировать текст сейва
        </button>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json,.shishka-save.json"
        className="settings-file-input"
        onChange={handleImportSave}
      />

      {transferStatus ? (
        <div className={`settings-transfer-status settings-transfer-status--${transferStatus.type}`}>
          {transferStatus.text}
        </div>
      ) : null}

      {exportedSaveText ? (
        <div className="settings-save-text-box">
          <div className="settings-save-text-box__head">
            <div className="settings-card__label">Текст экспортированного сейва</div>
            <div className="settings-card__hint">Можно скопировать вручную и отправить как обычный текст.</div>
          </div>
          <textarea
            ref={exportTextRef}
            className="settings-save-textarea"
            value={exportedSaveText}
            readOnly
            spellCheck={false}
            onFocus={(event) => event.target.select()}
          />
        </div>
      ) : null}
    </article>
  )
}
