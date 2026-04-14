import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { StatCard } from './StatCard'

export const StatsBar = observer(function StatsBar({ className = '' }) {
  const { statsBarData } = useGameStore()

  return (
    <section className={`stats-bar ${className}`.trim()}>
      {statsBarData.map((item, index) => (
        <StatCard
          key={item.label}
          {...item}
          iconKey={item.icon}
          delay={index}
          formatValue={false}
        />
      ))}
    </section>
  )
})
