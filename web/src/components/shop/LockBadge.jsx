import {formatNumber} from "../../lib/format.js"


export const LockBadge = ({ item }) => {
	return (
		<div className="shop-card__lock">
			<div className="shop-card__lock-title">🔒 Заблокировано</div>
			<div className="shop-card__lock-text">{item.unlockText}</div>
			<div className="shop-card__lock-progress">
				<span>🌰 {formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
				<span>📚 {formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
			</div>
		</div>
	)
}