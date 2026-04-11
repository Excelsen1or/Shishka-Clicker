import {formatNumber, formatFullNumber, isNumberAbbreviated} from "../../lib/format.js"
import { ConeIcon } from '../ui/ConeIcon'
import { KnowledgeIcon } from '../ui/GameIcon'


export const LockBadge = ({ item }) => {
	return (
		<div className="shop-card__lock">
			<div className="shop-card__lock-title">🔒 Заблокировано</div>
			<div className="shop-card__lock-text">{item.unlockText}</div>
			<div className="shop-card__lock-progress">
				<span {...(isNumberAbbreviated(formatNumber(item.unlockProgress.shishki)) || isNumberAbbreviated(formatNumber(item.unlockRule.shishki)) ? { 'data-tip': `${formatFullNumber(item.unlockProgress.shishki)} / ${formatFullNumber(item.unlockRule.shishki)}` } : {})}><ConeIcon /> {formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
				<span {...(isNumberAbbreviated(formatNumber(item.unlockProgress.knowledge)) || isNumberAbbreviated(formatNumber(item.unlockRule.knowledge)) ? { 'data-tip': `${formatFullNumber(item.unlockProgress.knowledge)} / ${formatFullNumber(item.unlockRule.knowledge)}` } : {})}><KnowledgeIcon /> {formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
			</div>
		</div>
	)
}