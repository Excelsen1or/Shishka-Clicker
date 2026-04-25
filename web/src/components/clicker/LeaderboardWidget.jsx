import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Crown, Gem, Lightning, PxlKitIcon } from '../../lib/pxlkit'
import { useWebsocketStore } from '../../stores/StoresProvider.jsx'
import { formatDurationCompact, formatNumber } from '../../lib/format.js'

export const LEADERBOARD_TABS = [
  { id: 'shishki', label: 'шишки', icon: null },
  { id: 'shards', label: 'небесные', icon: Gem },
  { id: 'clicks', label: 'клики', icon: Lightning },
  { id: 'time', label: 'время', icon: Crown },
]

export function getLeaderboardRankToneClass(index) {
  if (index === 0) return 'leaderboard-widget__row--gold'
  if (index === 1) return 'leaderboard-widget__row--silver'
  if (index === 2) return 'leaderboard-widget__row--bronze'
  return ''
}

function normalizeLeaderboardIdentity(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isCurrentLeaderboardPlayer(entry, user) {
  const entryName = normalizeLeaderboardIdentity(entry?.username)
  const currentName = normalizeLeaderboardIdentity(
    user?.global_name ?? user?.username,
  )

  if (!entryName || !currentName) {
    return false
  }

  return entryName === currentName
}

function getStateCopy(state) {
  switch (state) {
    case 'LOADING':
      return 'Загружаем рейтинг...'
    case 'FAILURE':
      return 'Рейтинг временно недоступен.'
    default:
      return 'В этом топе пока пусто.'
  }
}

function getUpdatedCopy(updatedAt) {
  const timestamp = Date.parse(updatedAt ?? '')

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return 'обновление неизвестно'
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) return `${diffMinutes}м назад`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}ч назад`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}д назад`
}

export const LeaderboardWidget = observer(function LeaderboardWidget({
  placement = 'floating',
}) {
  const websocketStore = useWebsocketStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('shishki')
  const activeMeta =
    LEADERBOARD_TABS.find((tab) => tab.id === activeTab) ?? LEADERBOARD_TABS[0]
  const entries = useMemo(
    () => (websocketStore.leaderboards?.[activeTab] ?? []).slice(0, 5),
    [activeTab, websocketStore.leaderboards],
  )
  const topValue = entries[0]?.[activeTab] ?? 0
  const summaryValue =
    activeTab === 'time'
      ? formatDurationCompact(topValue)
      : formatNumber(topValue)
  const currentUserEntry = entries.find((entry) =>
    isCurrentLeaderboardPlayer(entry, websocketStore.user),
  )

  return (
    <aside
      className={`leaderboard-widget leaderboard-widget--${placement} ${isOpen ? 'leaderboard-widget--open' : 'leaderboard-widget--collapsed'}`.trim()}
    >
      <button
        type="button"
        className={[
          'leaderboard-widget__toggle',
          'leaderboard-widget__toggle--pixel',
          'pixel-badge',
          placement === 'header' ? 'leaderboard-widget__toggle--header' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Свернуть топ-5' : 'Развернуть топ-5'}
      >
        <PxlKitIcon
          icon={Crown}
          size={16}
          colorful
          className="pixel-inline-icon"
        />
        <span className="leaderboard-widget__toggle-copy">
          <strong>TOP-5</strong>
          <small>рейтинга</small>
        </span>
      </button>

      {isOpen ? (
        <div className="leaderboard-widget__panel pixel-surface">
          <div className="leaderboard-widget__head">
            <div className="leaderboard-widget__heading">
              <div className="leaderboard-widget__kicker">Рейтинг</div>
              <div className="leaderboard-widget__title">
                Лучшие за всё время
              </div>
            </div>
            <div className="leaderboard-widget__summary pixel-badge">
              {activeMeta.icon ? (
                <PxlKitIcon
                  icon={activeMeta.icon}
                  size={14}
                  colorful
                  className="pixel-inline-icon"
                />
              ) : null}
              <span>{activeMeta.label}</span>
              <strong>{summaryValue}</strong>
            </div>
          </div>

          {currentUserEntry ? (
            <div className="leaderboard-widget__status-badge pixel-badge">
              <span>ты в топе</span>
              <strong>{currentUserEntry.username}</strong>
            </div>
          ) : null}

          <div
            className="leaderboard-widget__tabs"
            role="tablist"
            aria-label="Переключение рейтинга"
          >
            {LEADERBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`leaderboard-widget__tab pixel-badge ${tab.id === activeTab ? 'leaderboard-widget__tab--active' : ''}`.trim()}
                aria-selected={tab.id === activeTab}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon ? (
                  <PxlKitIcon
                    icon={tab.icon}
                    size={14}
                    colorful
                    className="pixel-inline-icon"
                  />
                ) : null}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="leaderboard-widget__body">
            {entries.length === 0 ? (
              <div className="leaderboard-widget__empty">
                {getStateCopy(websocketStore.state)}
              </div>
            ) : (
              entries.map((entry, index) => (
                <div
                  key={`${activeTab}-${entry.username}-${index}`}
                  className={[
                    'leaderboard-widget__row',
                    'pixel-surface',
                    getLeaderboardRankToneClass(index),
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {index === 0 ? (
                    <div className="leaderboard-widget__crown-strip">
                      <PxlKitIcon
                        icon={Crown}
                        size={12}
                        colorful
                        className="pixel-inline-icon"
                      />
                      <span>лидер сезона</span>
                    </div>
                  ) : null}
                  <div className="leaderboard-widget__placement">
                    <span className="leaderboard-widget__rank">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="leaderboard-widget__player">
                    <span className="leaderboard-widget__player-copy">
                      <span className="leaderboard-widget__name">
                        {entry.username}
                      </span>
                      <span className="leaderboard-widget__updated">
                        {getUpdatedCopy(entry.updatedAt)}
                      </span>
                    </span>
                  </div>
                  <div
                    className="leaderboard-widget__value"
                    title={
                      activeTab === 'time'
                        ? formatDurationCompact(entry[activeTab] ?? 0)
                        : String(entry[activeTab] ?? 0)
                    }
                  >
                    {activeTab === 'time'
                      ? formatDurationCompact(entry[activeTab] ?? 0)
                      : formatNumber(entry[activeTab] ?? 0)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </aside>
  )
})
