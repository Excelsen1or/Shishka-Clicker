import { useGameContext } from '../../context/GameContext'
import { StatCard } from './StatCard'
import {MainStore} from "../../MainStore.js"


export function StatsBar() {
  const { state, contributions } = useGameContext()

  const stats = [
    {
      icon: '🌰',
      label: 'Шишки',
      value: state.shishki,
      hint: `+${MainStore.formatShortNumber(state.shishkiPerSecond)} / сек`,
      contributions: contributions.shishkiPerSecond,
    },
    {
      icon: '💵',
      label: 'Деньги',
      value: state.money,
      hint: `+${MainStore.formatShortNumber(state.moneyPerSecond)} / сек`,
      contributions: contributions.moneyPerSecond,
    },
    {
      icon: '📚',
      label: 'Знания',
      value: state.knowledge,
      hint: `+${MainStore.formatShortNumber(state.knowledgePerSecond)} / сек`,
      contributions: contributions.knowledgePerSecond,
    },
    {
      icon: '💪',
      label: 'Сила клика',
      value: state.clickPower,
      hint: `${MainStore.formatShortNumber(state.manualClicks)} кликов`,
      contributions: contributions.clickPower,
    },
    {
      icon: '🤖',
      label: 'AI-мощность',
      value: state.aiPower,
      hint: `множитель x${MainStore.formatShortNumber(state.aiMultiplier)}`,
      contributions: contributions.aiPower,
    },
  ]

  return (
    <section className="stats-bar">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i} />
      ))}
    </section>
  )
}
