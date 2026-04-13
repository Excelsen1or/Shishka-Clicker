import { useState } from 'react'
import { useDiscordActivity } from '../../context/DiscordActivityContext.jsx'

function formatDate(value) {
  if (!value) return 'ещё не синхронизировано'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'время синхронизации недоступно'
  }

  return date.toLocaleString('ru-RU')
}

export function SettingsDiscordCard() {
  const {
    isActivity,
    status,
    user,
    syncState,
    syncError,
    lastSyncedAt,
    syncSource,
    manualSync,
    presenceState,
    presenceError,
    lastPresenceAt,
  } = useDiscordActivity()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await manualSync()
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <article className="settings-card">
      <div className="settings-card__head">
        <h3 className="settings-card__title">Discord Activity</h3>
        <span className="settings-chip">{isActivity ? 'Connected' : 'Standalone'}</span>
      </div>

      <p className="settings-card__hint settings-card__hint--block">
        {isActivity
          ? `Игрок: ${user?.username ?? 'unknown'}${user?.discriminator ? `#${user.discriminator}` : ''}`
          : 'Приложение открыто вне Discord Activity. Облачная синхронизация Discord сейчас не используется.'}
      </p>

      <p className="settings-card__hint settings-card__hint--block">
        Статус SDK: {status}. Синхронизация: {syncState}.
      </p>

      <p className="settings-card__hint settings-card__hint--block">
        Rich Presence: {presenceState}. Последнее обновление: {formatDate(lastPresenceAt)}.
      </p>

      <p className="settings-card__hint settings-card__hint--block">
        Последняя синхронизация: {formatDate(lastSyncedAt)}
        {syncSource ? ` (${syncSource})` : ''}
      </p>

      {syncError ? (
        <div className="settings-transfer-status settings-transfer-status--error">
          {syncError}
        </div>
      ) : null}

      {presenceError ? (
        <div className="settings-transfer-status settings-transfer-status--error">
          {presenceError}
        </div>
      ) : null}

      {isActivity ? (
        <button
          type="button"
          className="settings-ghost-btn"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Синхронизация...' : 'Синхронизировать сейчас'}
        </button>
      ) : null}
    </article>
  )
}
