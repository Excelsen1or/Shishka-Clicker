import { ClickerButton } from './ClickerButton'
import { ProgressMetaPanel, ProgressOverview, ProgressStatsPanel } from './ProgressOverview'
import { LeaderboardWidget } from './LeaderboardWidget.jsx'

export function ClickerScreen() {
  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout">
        <div className="clicker-layout__stats">
          <ProgressStatsPanel />
        </div>

        <div className="clicker-layout__hero">
          <ClickerButton />
        </div>

        <div className="clicker-layout__meta">
          <ProgressMetaPanel />
        </div>

        <LeaderboardWidget />
      </div>

      <div className="clicker-below">
        <ProgressOverview hideStats hideMeta />
      </div>
    </section>
  )
}
