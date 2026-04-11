import {formatNumber, formatFullNumber, isNumberAbbreviated} from "../../lib/format.js"
import {StatCard} from "../stats/StatCard.jsx"
import { ConeIcon } from '../ui/ConeIcon'
import { KnowledgeIcon } from '../ui/GameIcon'


export const UnlockCard = ({ title, item, accentClass }) => {
	if (!item) {
		return (
			<StatCard
				label={title}
				value="✓ Всё открыто"
				hint="Фокус на прокачке уровней и престиже."
				formatValue={false}
				className="stat-card--shop-surface stat-card--unlock"
				valueClassName="stat-card__value--done"
			/>
		)
	}

	const shishkiPct = Math.min(100, (item.unlockProgress.shishki / Math.max(1, item.unlockRule.shishki)) * 100)
  const knowledgePct = Math.min(100, (item.unlockProgress.knowledge / Math.max(1, item.unlockRule.knowledge)) * 100)

  return (
    <StatCard
      label={title}
      value={item.title}
      hint={item.unlockText}
      formatValue={false}
      className="stat-card--shop-surface stat-card--unlock"
      valueClassName={accentClass}
    >
      <div className="unlock-progress">
        <div className="unlock-progress__row">
          <span><ConeIcon /> Шишки</span>
          <span {...(isNumberAbbreviated(formatNumber(item.unlockProgress.shishki)) || isNumberAbbreviated(formatNumber(item.unlockRule.shishki)) ? { 'data-tip': `${formatFullNumber(item.unlockProgress.shishki)} / ${formatFullNumber(item.unlockRule.shishki)}` } : {})}>{formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill" style={{ width: `${shishkiPct}%` }} />
        </div>

        <div className="unlock-progress__row">
          <span><KnowledgeIcon /> Знания</span>
          <span {...(isNumberAbbreviated(formatNumber(item.unlockProgress.knowledge)) || isNumberAbbreviated(formatNumber(item.unlockRule.knowledge)) ? { 'data-tip': `${formatFullNumber(item.unlockProgress.knowledge)} / ${formatFullNumber(item.unlockRule.knowledge)}` } : {})}>{formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
        </div>
        <div className="unlock-progress__track">
          <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${knowledgePct}%` }} />
        </div>
      </div>
    </StatCard>
  )
}