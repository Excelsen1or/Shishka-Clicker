import {formatNumber} from "../../lib/format.js"
import {LabCard} from "./LabCard.jsx"


export const ShardsLaboratory = ({
	buyPrestigeUpgrade,
	economy,
	state,
	prestige
}) => {
	return (
		<article className="meta-card prestige-lab">
			<div className="meta-card__kicker">Лаборатория осколков</div>
			<h3 className="meta-card__title">Постоянные улучшения престижа</h3>
			<p className="meta-card__desc">
				Осколки редкие, поэтому здесь нет мусорных покупок: часть веток режет квоту, часть усиливает престиж, а часть повышает награду за перелив сверх квоты.
			</p>

			<div className="prestige-lab__summary">
				<div><span>На руках</span><b>{formatNumber(state.prestigeShards)} 💎</b></div>
				<div><span>Суммарно заработано</span><b>{formatNumber(state.totalPrestigeShardsEarned)} 💎</b></div>
				<div><span>Снижение квоты шишек</span><b>-{formatNumber(prestige.bonuses.shishkiQuotaReduction * 100)}%</b></div>
				<div><span>Снижение квоты знаний</span><b>-{formatNumber(prestige.bonuses.knowledgeQuotaReduction * 100)}%</b></div>
				<div><span>Срез достижений</span><b>-{formatNumber(prestige.bonuses.achievementQuotaReduction)}</b></div>
				<div><span>Бонус к престижу</span><b>+x{formatNumber(prestige.bonuses.permanentMultiplierBonus)}</b></div>
			</div>

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