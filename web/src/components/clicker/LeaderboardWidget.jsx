import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Crown, Gem, Lightning, PxlKitIcon } from '../../lib/pxlkit'
import { useWebsocketStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format.js'

const LEADERBOARD_TABS = [
  { id: 'shishki', label: 'шишки', icon: null },
  { id: 'shards', label: 'небесные', icon: Gem },
  { id: 'clicks', label: 'клики', icon: Lightning },
]

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
        <span>TOP-5</span>
      </button>

      {isOpen ? (
        <div className="leaderboard-widget__panel pixel-surface">
          <div className="leaderboard-widget__head">
            <div>
              <div className="leaderboard-widget__kicker">Рейтинг</div>
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
            </div>
          </div>

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
                  className="leaderboard-widget__row pixel-surface"
                >
                  <div className="leaderboard-widget__player">
                    <span className="leaderboard-widget__rank">
                      #{index + 1}
                    </span>
                    <span className="leaderboard-widget__name">
                      {entry.username}
                    </span>
                  </div>
                  <div className="leaderboard-widget__value">
                    {formatNumber(entry[activeTab] ?? 0)}
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
