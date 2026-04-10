import {formatNumber} from "../../lib/format.js"


export const LabCard = ({ item, canBuy, onBuy }) => {
	return (
		<article className={`prestige-lab-card prestige-lab-card--${item.tint ?? 'amber'}`}>
			<div className="prestige-lab-card__head">
				<div>
					<div className="prestige-lab-card__kicker">Метапрокачка</div>
					<h3 className="prestige-lab-card__title">{item.title}</h3>
				</div>
				<div className="prestige-lab-card__level">ур. {item.level}</div>
			</div>

			<p className="prestige-lab-card__desc">{item.description}</p>

			<div className="prestige-lab-card__effect">{item.effectPreview?.currentText}</div>
			<div className="prestige-lab-card__next">{item.effectPreview?.nextText}</div>

			<div className="prestige-lab-card__footer">
				<div className="prestige-lab-card__price">💎 {formatNumber(item.cost)}</div>
				<button type="button" className="shop-card__btn" disabled={!canBuy} onClick={onBuy}>
					{canBuy ? 'Улучшить за осколки' : 'Не хватает осколков'}
				</button>
			</div>
		</article>
	)
}