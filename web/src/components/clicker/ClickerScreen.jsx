import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'
import { useGameContext } from '../../context/GameContext'
import { buildStats } from '../stats/StatsBar'
import { StatCard } from '../stats/StatCard'

export function ClickerScreen() {
  const { state, contributions } = useGameContext()
  const stats = buildStats(state, contributions)

  return (
    <section className="screen clicker-screen">
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">Главный экран</span>
        <h2 className="screen__title">Добыча и прогресс</h2>
        <p className="screen__desc">
          Кликай, держи темп экономики и смотри, какие ветки развития откроются следующими.
        </p>
      </div>

      <div className="clicker-layout">
        <div className="clicker-layout__left">
          <ClickerButton />
        </div>

        <div className="clicker-layout__right">
          <div className="clicker-panel">
            <div className="clicker-panel__head">
              <span className="clicker-panel__kicker">Текущие показатели</span>
              <h3 className="clicker-panel__title">Все ключевые stat-card рядом с кликером</h3>
            </div>

            <div className="clicker-stats-stack">
              {stats.map((item, index) => (
                <StatCard key={item.label} {...item} delay={index} compact />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="clicker-below">
        <ProgressOverview />
      </div>
    </section>
  )
}
