import {formatNumber} from "../../lib/format.js"


export const UnlockCard = ({ title, item, accentClass }) => {
	if (!item) {
		return (
			<div className="unlock-card">
				<div className="unlock-card__label">{title}</div>
				<div className="unlock-card__value unlock-card__value--done">✓ Всё открыто</div>
				<div className="unlock-card__text">Фокус на прокачке уровней и престиже.</div>
			</div>
		)
	}

	const shishkiPct = Math.min(100, (item.unlockProgress.shishki / Math.max(1, item.unlockRule.shishki)) * 100)
	const knowledgePct = Math.min(100, (item.unlockProgress.knowledge / Math.max(1, item.unlockRule.knowledge)) * 100)

	return (
		<div className="unlock-card">
			<div className="unlock-card__label">{title}</div>
			<div className={`unlock-card__value ${accentClass}`}>{item.title}</div>
			<div className="unlock-card__text">{item.unlockText}</div>

			<div className="unlock-progress">
				<div className="unlock-progress__row">
					<span>🌰 Шишки</span>
					<span>{formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
				</div>
				<div className="unlock-progress__track">
					<div className="unlock-progress__fill" style={{ width: `${shishkiPct}%` }} />
				</div>

				<div className="unlock-progress__row">
					<span>📚 Знания</span>
					<span>{formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
				</div>
				<div className="unlock-progress__track">
					<div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${knowledgePct}%` }} />
				</div>
			</div>
		</div>
	)
}