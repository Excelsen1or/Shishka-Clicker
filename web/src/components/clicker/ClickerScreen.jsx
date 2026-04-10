import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'
import { useGameContext } from '../../context/GameContext'
import { buildStats } from '../stats/StatsBar'
import { StatCard } from '../stats/StatCard'
import { formatNumber } from '../../lib/format'

export function ClickerScreen() {
  const { state, contributions } = useGameContext()
  const stats = buildStats(state, contributions)

  return (
    <section className="screen clicker-screen">
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">Главный экран</span>
        <h2 className="screen__title">Добыча и прогресс</h2>
      </div>

      <div className="clicker-layout">
          <ClickerButton />

        <aside className="clicker-sidebar">
          <div className="clicker-panel">
            <div className="clicker-panel__header">
              <span className="clicker-panel__kicker">Текущие показатели</span>
            </div>

            <div className="clicker-stats-stack">
              {stats.map((item, index) => (
                <StatCard key={item.label} {...item} delay={index} compact />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="clicker-below">
        <ProgressOverview />
      </div>
    </section>
  )
}
