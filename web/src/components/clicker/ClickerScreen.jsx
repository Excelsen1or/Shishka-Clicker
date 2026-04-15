import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'
import { LeaderboardWidget } from './LeaderboardWidget.jsx'

export function ClickerScreen() {
  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout">
        <ClickerButton />
        <LeaderboardWidget />
      </div>

      <div className="clicker-below">
        <ProgressOverview />
      </div>
    </section>
  )
}
