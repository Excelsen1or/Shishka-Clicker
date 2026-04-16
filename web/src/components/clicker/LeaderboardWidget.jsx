import { useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useWebsocketStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format.js'

const LEADERBOARD_TABS = [
  { id: 'shishki', label: 'шишки', valueLabel: 'мне лень' },
  { id: 'shards', label: 'осколки', valueLabel: 'мне лень' },
  { id: 'clicks', label: 'клики', valueLabel: 'мне лень' },
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
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('shishki')

  const activeMeta = LEADERBOARD_TABS.find((tab) => tab.id === activeTab) ?? LEADERBOARD_TABS[0]
  const entries = useMemo(
    () => websocketStore.leaderboards?.[activeTab] ?? [],
    [activeTab, websocketStore.leaderboards],
  )

  return (
    <aside className={`leaderboard-widget ${isOpen ? 'leaderboard-widget--open' : 'leaderboard-widget--collapsed'}`.trim()}>
      <button
        type="button"
        className="leaderboard-widget__toggle leaderboard-widget__toggle--pixel pixel-badge"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Свернуть рейтинг' : 'Развернуть рейтинг'}
      >
        ⌄
      </button>

      {isOpen ? (
        <div className="leaderboard-widget__panel pixel-surface">
          <div className="leaderboard-widget__head">
            <div>
              <div className="leaderboard-widget__kicker">Потом переделаю</div>
            </div>
            <div className="leaderboard-widget__summary pixel-badge">
              <span>{activeMeta.label}</span>
              <span>{activeMeta.valueLabel}</span>
            </div>
          </div>

          <div className="leaderboard-widget__tabs" role="tablist" aria-label="Переключение рейтинга">
            {LEADERBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`leaderboard-widget__tab pixel-badge ${tab.id === activeTab ? 'leaderboard-widget__tab--active' : ''}`.trim()}
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
                <div key={`${activeTab}-${entry.username}-${index}`} className="leaderboard-widget__row pixel-surface">
                  <div className="leaderboard-widget__player">
                    <span className="leaderboard-widget__rank">#{index + 1}</span>
                    <span className="leaderboard-widget__name">{entry.username}</span>
                  </div>
                  <div className="leaderboard-widget__value">{formatNumber(entry[activeTab] ?? 0)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </aside>
  )
})
