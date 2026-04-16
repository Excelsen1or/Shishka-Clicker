import { LabCard } from './LabCard.jsx'
import { StatCard } from '../stats/StatCard.jsx'

export const ShardsLaboratory = ({
  buyPrestigeUpgrade,
  economy,
  state,
  prestigeLabSummary,
}) => {
  return (
    <article className="meta-card">
      <div className="meta-card__kicker">Лаборатория осколков</div>

      <section className="stats-bar stats-bar--shop prestige-lab__summary">
        {prestigeLabSummary.map((item) => (
          <StatCard key={item.label} {...item} formatValue={false} variant="pixel" />
        ))}
      </section>

      <div className="prestige-lab__grid">
        {economy.prestigeUpgrades.map((item) => (
          <LabCard
            key={item.id}
            item={item}
            canBuy={state.prestigeShards >= item.cost}
            onBuy={() => buyPrestigeUpgrade(item.id)}
          />
        ))}
      </div>
    </article>
  )
}
