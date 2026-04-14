import { useState } from 'react'
import { useDiscordActivity } from '../../context/DiscordActivityContext.jsx'

const STATUS_LABELS = {
  idle: 'ожидание',
  connecting: 'подключение',
  ready: 'готово',
  error: 'ошибка',
}

const SYNC_STATE_LABELS = {
  idle: 'ожидание',
  loading: 'загрузка',
  syncing: 'синхронизация',
  synced: 'синхронизировано',
  offline: 'оффлайн',
  error: 'ошибка',
}

const SYNC_SOURCE_LABELS = {
  download: 'облако',
  upload: 'выгрузка',
  override: 'перезапись облака',
  migration: 'миграция',
  offline: 'оффлайн',
  noop: 'без изменений',
}

const PRESENCE_STATE_LABELS = {
  idle: 'ожидание',
  ready: 'активен',
  error: 'ошибка',
}

function formatDate(value) {
  if (!value) return 'ещё не синхронизировано'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'время синхронизации недоступно'
  }

  return date.toLocaleString('ru-RU')
}

function formatLabel(value, labels) {
  return labels[value] ?? value ?? 'нет данных'
}

export function SettingsDiscordCard() {
  const {
    isActivity,
    status,
    user,
    offlineMode,
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
        <span className="settings-chip">
          {offlineMode ? 'Offline' : isActivity ? 'Connected' : 'Cloud Profile'}
        </span>
      </div>

      <p className="settings-card__hint settings-card__hint--block">
        {offlineMode
          ? 'Сейчас включён офлайн-режим. Облачная синхронизация приостановлена, игра работает локально в памяти.'
          : isActivity
          ? `Игрок: ${user?.username ?? 'unknown'}${user?.discriminator ? `#${user.discriminator}` : ''}`
          : 'Приложение открыто вне Discord Activity. Для сейва используется облачный профиль этого устройства.'}
      </p>

      <p className="settings-card__hint settings-card__hint--block">
        Статус SDK: {formatLabel(status, STATUS_LABELS)}. Синхронизация: {formatLabel(syncState, SYNC_STATE_LABELS)}.
      </p>

      <p className="settings-card__hint settings-card__hint--block">
        Rich Presence: {formatLabel(presenceState, PRESENCE_STATE_LABELS)}. Последнее обновление: {formatDate(lastPresenceAt)}.
      </p>

      <p className="settings-card__hint settings-card__hint--block">
        Последняя синхронизация: {formatDate(lastSyncedAt)}
        {syncSource ? ` (${formatLabel(syncSource, SYNC_SOURCE_LABELS)})` : ''}
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

      <button
        type="button"
        className="settings-ghost-btn"
        onClick={handleSync}
        disabled={isSyncing}
      >
        {isSyncing ? 'Синхронизация...' : offlineMode ? 'Включить синхронизацию' : 'Синхронизировать сейчас'}
      </button>
    </article>
  )
}
