import { memo, useMemo } from 'react'
import { ClickerButton } from './ClickerButton'
import { ProgressOverview } from './ProgressOverview'
import { useGameContext } from '../../context/GameContext'
import { buildStats } from '../stats/StatsBar'
import { StatCard } from '../stats/StatCard'

export const ClickerScreen = memo(function ClickerScreen() {
  const { state, contributions } = useGameContext()
  const stats = useMemo(() => buildStats(state, contributions), [state, contributions])

  return (
    <section className="screen clicker-screen">
      <div className="clicker-layout">
        <aside className="clicker-sidebar">
          <div className="clicker-panel">

            <div className="clicker-stats-stack">
              {stats.map((item, index) => (
                <StatCard key={item.label} {...item} delay={index} compact />
              ))}
            </div>
          </div>
        </aside>

        <ClickerButton />
      </div>

      <div className="clicker-below">
        <ProgressOverview />
      </div>
    </section>
  )
})
