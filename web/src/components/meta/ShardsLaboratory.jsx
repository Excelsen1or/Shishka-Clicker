import {LabCard} from "./LabCard.jsx"
import {StatCard} from "../stats/StatCard.jsx"


export const ShardsLaboratory = ({
	buyPrestigeUpgrade,
	economy,
	state,
	prestigeLabSummary
}) => {
	return (
		<article className="meta-card prestige-lab">
			<div className="meta-card__kicker">Лаборатория осколков</div>
			<h3 className="meta-card__title">Постоянные улучшения престижа</h3>
			<p className="meta-card__desc">
			  Осколки редкие, но они дают большое преимущество: часть веток режет квоту, часть усиливает престиж, а часть повышает награду за перелив сверх квоты.
			</p>

			<section className="stats-bar stats-bar--shop prestige-lab__summary">
			  {prestigeLabSummary.map((item) => (
					<StatCard key={item.label} {...item} formatValue={false} />
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