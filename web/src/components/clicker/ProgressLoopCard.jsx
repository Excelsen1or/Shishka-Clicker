import { ConeIcon } from '../ui/ConeIcon'
import { MoneyIcon, KnowledgeIcon } from '../ui/GameIcon'

export const ProgressLoopCard = () => {
	return (
		<article className="meta-card progress-loop-card">
			<div className="meta-card__kicker">Петля прогресса</div>
			<div className="progress-loop__steps">
				<div className="loop-step"><b>1.</b> Кликаешь и фармишь <b><ConeIcon /> шишки</b>.</div>
				<div className="loop-step"><b>2.</b> Вкладываешь их в ветки за <b><MoneyIcon /> деньги</b>, <b><KnowledgeIcon /> знания</b> и <b><ConeIcon /> шишечные апгрейды</b>.</div>
				<div className="loop-step"><b>3.</b> Открываешь престиж, закрываешь квоту цикла и получаешь редкие <b>💎 осколки</b>.</div>
			</div>
		</article>
	)
}