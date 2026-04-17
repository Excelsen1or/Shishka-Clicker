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
          <ProgressStatsPanel />
          <ClickerButton />
          <ProgressMetaPanel />
      </div>

      <div className="clicker-below clicker-below--pixel">
        <ProgressOverview hideStats hideMeta />
      </div>
    </section>
  )
}
