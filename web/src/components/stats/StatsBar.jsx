import { memo, useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { StatCard } from './StatCard'
import { formatNumber } from '../../lib/format'
import { ConeIcon } from '../ui/ConeIcon'
import { MoneyIcon, KnowledgeIcon, PowerIcon, RobotIcon } from '../ui/GameIcon'

export function buildStats(state, contributions) {
  return [
    {
      icon: <ConeIcon />,
      label: 'Шишки',
      value: state.shishki,
      hint: `+${formatNumber(state.shishkiPerSecond)} / сек`,
      contributions: contributions.shishkiPerSecond,
    },
    {
      icon: <MoneyIcon />,
      label: 'Деньги',
      value: state.money,
      hint: `+${formatNumber(state.moneyPerSecond)} / сек`,
      contributions: contributions.moneyPerSecond,
    },
    {
      icon: <KnowledgeIcon />,
      label: 'Знания',
      value: state.knowledge,
      hint: `+${formatNumber(state.knowledgePerSecond)} / сек`,
      contributions: contributions.knowledgePerSecond,
    },
    {
      icon: <PowerIcon />,
      label: 'Сила клика',
      value: state.clickPower,
      hint: `${formatNumber(state.manualClicks)} кликов`,
      contributions: contributions.clickPower,
    },
    {
      icon: <RobotIcon />,
      label: 'AI-мощность',
      value: state.aiPower,
      hint: `множитель x${formatNumber(state.aiMultiplier)}`,
      contributions: contributions.aiPower,
    },
  ]
}

export const StatsBar = memo(function StatsBar({ className = '' }) {
  const { state, contributions } = useGameContext()
  const stats = useMemo(() => buildStats(state, contributions), [state, contributions])

  return (
    <section className={`stats-bar ${className}`.trim()}>
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i} />
      ))}
    </section>
  )
})
