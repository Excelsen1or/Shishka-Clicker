import { observer } from 'mobx-react-lite'
import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'
import { useWebsocketStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format.js'


export const ClickerScreen = observer(function ClickerScreen() {
  const websocketStore = useWebsocketStore()

  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout">
        <ClickerButton />
        {/* Переместить этот TOP-5 в другое место */}
        <div>
          <div>TOP-5</div>
          {websocketStore.data.map((user) => (
            <div className="flex gap-10">
              <div>
                {user.username}
              </div>
              <div>
                {formatNumber(user.shishki)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="clicker-below">
        <ProgressOverview />
      </div>
    </section>
  )
})
