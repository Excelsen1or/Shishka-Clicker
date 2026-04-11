import {StatCard} from "../stats/StatCard.jsx"


export const LifetimeCard = ({
	lifetimeStats
}) => {
	return (
		<article className="meta-card">
			<div className="meta-card__kicker">Глобальный прогресс</div>
			<section className="stats-bar stats-bar--shop meta-lifetime-grid">
			  {lifetimeStats.map((item) => (
					<StatCard key={item.label} {...item} formatValue={false} />
			  ))}
			</section>

			<div className="meta-card__hint">
			  После ребёрса сбрасываются текущие ресурсы и уровни магазина, но сохраняются достижения, осколки, мета-улучшения и общий множитель престижа.
			</div>
		</article>
	)
}
