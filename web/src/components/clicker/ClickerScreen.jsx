import { ClickerButton } from './ClickerButton'
import {
  ProgressMetaPanel,
  ProgressOverview,
  ProgressStatsPanel,
} from './ProgressOverview'

export function ClickerScreen() {
  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout clicker-layout--pixel">
        <section className="clicker-layout__stats clicker-layout__pane">
          <ProgressStatsPanel />
        </section>

        <section className="clicker-layout__hero clicker-layout__pane clicker-layout__pane--hero">
          <ClickerButton />
          <div className="clicker-event-banner">
            Лови события, закрывай квоты и раскручивай шум.
          </div>
        </section>

        <section className="clicker-layout__meta clicker-layout__pane">
          <ProgressMetaPanel />
        </section>
      </div>

      <div className="clicker-below clicker-below--pixel">
        <ProgressOverview />
      </div>
    </section>
  )
}
