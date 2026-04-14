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
        <div className="clicker-top-list">
          <div>TOP-5</div>
          {websocketStore.data.length === 0 ? (
            <div className="clicker-top-list__empty">Рейтинг появится, когда в Activity будут активные игроки.</div>
          ) : websocketStore.data.map((user, index) => (
            <div key={`${user.username}-${index}`} className="flex gap-10">
              <div>{user.username}</div>
              <div>{formatNumber(user.shishki)}</div>
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
