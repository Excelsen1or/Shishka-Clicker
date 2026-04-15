import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useWebsocketStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format.js'

const LEADERBOARD_TABS = [
  { id: 'shishki', label: 'Шишки', valueLabel: 'за всё время' },
  { id: 'shards', label: 'Осколки', valueLabel: 'всего получено' },
  { id: 'clicks', label: 'Клики', valueLabel: 'за всё время' },
]

function getStateCopy(state) {
  switch (state) {
    case 'LOADING':
      return 'Подтягиваем игроков...'
    case 'FAILURE':
      return 'Рейтинг временно недоступен.'
    default:
      return 'В этом топе пока пусто.'
  }
}

export const LeaderboardWidget = observer(function LeaderboardWidget() {
  const websocketStore = useWebsocketStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('shishki')

  const activeMeta = LEADERBOARD_TABS.find((tab) => tab.id === activeTab) ?? LEADERBOARD_TABS[0]
  const entries = useMemo(
    () => websocketStore.leaderboards?.[activeTab] ?? [],
    [activeTab, websocketStore.leaderboards],
  )

  return (
    <aside className={`leaderboard-widget ${isCollapsed ? 'leaderboard-widget--collapsed' : ''}`.trim()}>
      <div className="leaderboard-widget__shell">
        <div className="leaderboard-widget__head">
          <div>
            <div className="leaderboard-widget__kicker">Рейтинг</div>
            <div className="leaderboard-widget__title">Топ-5</div>
          </div>

          <button
            type="button"
            className="leaderboard-widget__toggle"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Развернуть рейтинг' : 'Свернуть рейтинг'}
          >
            ⌄
          </button>
        </div>

        <div className="leaderboard-widget__summary">
          <span>{activeMeta.label}</span>
          <span>{activeMeta.valueLabel}</span>
        </div>

        {isCollapsed ? null : (
          <>
            <div className="leaderboard-widget__tabs" role="tablist" aria-label="Переключение рейтинга">
              {LEADERBOARD_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={`leaderboard-widget__tab ${tab.id === activeTab ? 'leaderboard-widget__tab--active' : ''}`.trim()}
                  aria-selected={tab.id === activeTab}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="leaderboard-widget__body">
              {entries.length === 0 ? (
                <div className="leaderboard-widget__empty">{getStateCopy(websocketStore.state)}</div>
              ) : (
                entries.map((entry, index) => (
                  <div key={`${activeTab}-${entry.username}-${index}`} className="leaderboard-widget__row">
                    <div className="leaderboard-widget__player">
                      <span className="leaderboard-widget__rank">#{index + 1}</span>
                      <span className="leaderboard-widget__name">{entry.username}</span>
                    </div>
                    <div className="leaderboard-widget__value">{formatNumber(entry[activeTab] ?? 0)}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
})
