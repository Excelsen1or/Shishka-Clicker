import { observer } from 'mobx-react-lite'
import { StatCard } from '../stats/StatCard.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'

function buildCards(uiState, uiPrestige, uiEconomy) {
  return [
    {
      iconKey: 'cone',
      label: 'Шишки/сек',
      value: formatNumber(uiEconomy.shishkiPerSecond),
      hint: 'производство прямо сейчас',
    },
    {
      iconKey: 'rebirth',
      label: 'Квота',
      value: `${formatNumber(uiPrestige.currentRunShishki)} / ${formatNumber(uiPrestige.currentQuotaTarget)}`,
      hint: 'небесные шишки за жизнь',
    },
    {
      iconKey: 'shards',
      label: 'Небесные',
      value: formatNumber(uiState.heavenlyShishki),
      hint: 'собрано без ребёрса',
    },
    {
      iconKey: 'knowledge',
      label: 'Комочки',
      value: formatNumber(uiState.tarLumps),
      hint: 'улучшают здания навсегда',
    },
  ]
}

export const ProgressStatsPanel = observer(function ProgressStatsPanel({
  className = '',
}) {
  const { uiState, uiPrestige, uiEconomy } = useGameStore()
  const cards = buildCards(uiState, uiPrestige, uiEconomy).slice(0, 2)

  return (
    <section className={className}>
      <div className="side-kpi-grid">
        {cards.map((item) => (
          <StatCard key={item.label} {...item} variant="pixel" formatValue={false} />
        ))}
      </div>
    </section>
  )
})

export const ProgressMetaPanel = observer(function ProgressMetaPanel({
  className = '',
}) {
  const { uiState, uiPrestige, uiEconomy } = useGameStore()
  const cards = buildCards(uiState, uiPrestige, uiEconomy).slice(2)

  return (
    <section className={className}>
      <div className="side-kpi-grid">
        {cards.map((item) => (
          <StatCard key={item.label} {...item} variant="pixel" formatValue={false} />
        ))}
      </div>
    </section>
  )
})

export const ProgressOverview = observer(function ProgressOverview() {
  const { uiState, uiPrestige, uiEconomy } = useGameStore()
  const cards = buildCards(uiState, uiPrestige, uiEconomy)

  return (
    <div className="progress-overview">
      <div className="stats-bar stats-bar--shop">
        {cards.map((item) => (
          <StatCard key={item.label} {...item} variant="pixel" formatValue={false} />
        ))}
      </div>
    </div>
  )
})
