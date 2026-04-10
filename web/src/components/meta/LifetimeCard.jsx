import {formatNumber} from "../../lib/format.js"


export const LifetimeCard = ({
	state,
	unlockedCount,
	achievements
}) => {
	return (
		<article className="meta-card meta-card--stats">
			<div className="meta-card__kicker">Лайфтайм</div>
			<h3 className="meta-card__title">Глобальный прогресс</h3>
			<div className="meta-lifetime-grid">
				<div><span>Всего шишек</span><b>{formatNumber(state.lifetimeShishkiEarned)}</b></div>
				<div><span>Всего денег</span><b>{formatNumber(state.lifetimeMoneyEarned)}</b></div>
				<div><span>Всего знаний</span><b>{formatNumber(state.lifetimeKnowledgeEarned)}</b></div>
				<div><span>Мега-кликов</span><b>{formatNumber(state.megaClicks)}</b></div>
				<div><span>Эмодзи-взрывов</span><b>{formatNumber(state.emojiBursts)}</b></div>
				<div><span>Достижений</span><b>{unlockedCount}/{achievements.length}</b></div>
			</div>

			<div className="meta-card__hint">
				После ребёрса сбрасываются текущие ресурсы и уровни магазина, но сохраняются достижения, осколки, мета-улучшения и общий множитель престижа.
			</div>
		</article>
	)
}