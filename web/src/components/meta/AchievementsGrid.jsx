import {AchievementCard} from "./AchievementCard.jsx"


export const AchievementsGrid = ({ grouped }) => {
	return (
		<div className="achievement-category-grid">
			{grouped.map((group) => (
				<article key={group.category} className="achievement-category">
					<div className="achievement-category__head">
						<div>
							<div className="achievement-category__kicker">Категория</div>
							<h3 className="achievement-category__title">{group.category}</h3>
						</div>
						<div className="achievement-category__count">{group.unlocked}/{group.total}</div>
					</div>

					<div className="achievement-grid">
						{group.items.map((achievement) => (
							<AchievementCard key={achievement.id} achievement={achievement} />
						))}
					</div>
				</article>
			))}
		</div>
	)
}