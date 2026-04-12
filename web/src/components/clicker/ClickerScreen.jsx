import { observer } from 'mobx-react-lite'
import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'

export const ClickerScreen = observer(function ClickerScreen() {
  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout">
        <ClickerButton />
      </div>

      <div className="clicker-below">
        <ProgressOverview />
      </div>
    </section>
  )
})
