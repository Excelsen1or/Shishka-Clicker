import { useGameContext } from '../../context/GameContext'
import { StatCard } from './StatCard'
import { formatNumber } from '../../lib/format'

export function buildStats(state, contributions) {
  return [
    {
      icon: '🌰',
      label: 'Шишки',
      value: state.shishki,
      hint: `+${formatNumber(state.shishkiPerSecond)} / сек`,
      contributions: contributions.shishkiPerSecond,
    },
    {
      icon: '💵',
      label: 'Деньги',
      value: state.money,
      hint: `+${formatNumber(state.moneyPerSecond)} / сек`,
      contributions: contributions.moneyPerSecond,
    },
    {
      icon: '📚',
      label: 'Знания',
      value: state.knowledge,
      hint: `+${formatNumber(state.knowledgePerSecond)} / сек`,
      contributions: contributions.knowledgePerSecond,
    },
    {
      icon: '💪',
      label: 'Сила клика',
      value: state.clickPower,
      hint: `${formatNumber(state.manualClicks)} кликов`,
      contributions: contributions.clickPower,
    },
    {
      icon: '🤖',
      label: 'AI-мощность',
      value: state.aiPower,
      hint: `множитель x${formatNumber(state.aiMultiplier)}`,
      contributions: contributions.aiPower,
    },
  ]
}

export function StatsBar({ className = '' }) {
  const { state, contributions } = useGameContext()
  const stats = buildStats(state, contributions)

  return (
    <section className={`stats-bar ${className}`.trim()}>
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i} />
      ))}
    </section>
  )
}
