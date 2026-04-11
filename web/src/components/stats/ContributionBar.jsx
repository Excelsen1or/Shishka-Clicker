import {formatNumber, formatFullNumber} from "../../lib/format.js"


export const ContributionBar = ({ entry, total, index }) => {
	const share = total > 0 ? Math.max(6, Math.round((entry.value / total) * 100)) : 0

	return (
		<div className="contribution-row">
			<div className="contribution-row__info">
				<span className="contribution-row__rank">#{index + 1}</span>
				<span className="contribution-row__name">{entry.title}</span>
				<span className="contribution-row__val" title={formatFullNumber(entry.value)}>{formatNumber(entry.value)}</span>
			</div>
			<div className="contribution-bar">
				<div className="contribution-bar__fill" style={{ width: `${share}%` }} />
			</div>
		</div>
	)
}