import { useState } from 'react'
import { useDiscordActivity } from '../../context/DiscordActivityContext.jsx'

function formatDate(value) {
  if (!value) return 'нет данных'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'нет данных'

  return date.toLocaleString('ru-RU')
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function SnapshotCard({ title, snapshot }) {
  return (
    <div className="sync-conflict__snapshot">
      <div className="sync-conflict__snapshot-title">{title}</div>
      <div className="sync-conflict__snapshot-row">Обновлён: {formatDate(snapshot?.updatedAt)}</div>
      <div className="sync-conflict__snapshot-row">Оценка прогресса: {formatNumber(snapshot?.progressScore)}</div>
      <div className="sync-conflict__snapshot-row">Шишки за всё время: {formatNumber(snapshot?.lifetimeShishkiEarned)}</div>
      <div className="sync-conflict__snapshot-row">Деньги за всё время: {formatNumber(snapshot?.lifetimeMoneyEarned)}</div>
      <div className="sync-conflict__snapshot-row">Знания за всё время: {formatNumber(snapshot?.lifetimeKnowledgeEarned)}</div>
      <div className="sync-conflict__snapshot-row">Перерождения: {formatNumber(snapshot?.rebirths)}</div>
      <div className="sync-conflict__snapshot-row">Престижные осколки: {formatNumber(snapshot?.prestigeShards)}</div>
      <div className="sync-conflict__snapshot-row">Достижения: {formatNumber(snapshot?.achievements)}</div>
      <div className="sync-conflict__snapshot-row">Подписки: {formatNumber(snapshot?.subscriptions)}</div>
      <div className="sync-conflict__snapshot-row">Апгрейды: {formatNumber(snapshot?.upgrades)}</div>
    </div>
  )
}

export function SyncConflictDialog() {
  const { conflict, acceptCloudSave, keepLocalSave, clearConflict } = useDiscordActivity()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!conflict) return null

  const resolve = async (action) => {
    setIsSubmitting(true)
    try {
      await action()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sync-conflict-overlay" role="dialog" aria-modal="true" aria-label="Конфликт сохранений">
      <div className="sync-conflict">
        <div className="sync-conflict__head">
          <h3 className="sync-conflict__title">Конфликт сохранений</h3>
          <button type="button" className="sync-conflict__close" onClick={clearConflict} disabled={isSubmitting}>
            Закрыть
          </button>
        </div>

        <p className="sync-conflict__text">
          Найдены две заметно разные версии прогресса. Автоматическая синхронизация остановлена, чтобы не потерять историю.
        </p>

        <div className="sync-conflict__grid">
          <SnapshotCard title="Это устройство" snapshot={conflict.local} />
          <SnapshotCard title="Облако Discord" snapshot={conflict.remote} />
        </div>

        <div className="sync-conflict__actions">
          <button
            type="button"
            className="settings-ghost-btn"
            onClick={() => void resolve(keepLocalSave)}
            disabled={isSubmitting}
          >
            Оставить локальный сейв
          </button>
          <button
            type="button"
            className="settings-ghost-btn"
            onClick={() => void resolve(acceptCloudSave)}
            disabled={isSubmitting}
          >
            Загрузить облачный сейв
          </button>
        </div>
      </div>
    </div>
  )
}
