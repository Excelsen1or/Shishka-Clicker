export const AchievementCard = ({ achievement }) => {
	return (
		<article className={`meta-card achievement-card ${achievement.unlocked ? 'achievement-card--done' : ''} ${achievement.secret ? 'achievement-card--secret' : ''}`}>
			<div className="achievement-card__head">
				<span>{achievement.category}</span>
				<span>ур. {achievement.tier}</span>
			</div>
			<h3 className="achievement-card__title">
				{achievement.unlocked ? achievement.title : achievement.secret ? '??? Секретное достижение' : achievement.title}
			</h3>
			<p className="achievement-card__desc">
				{achievement.unlocked || !achievement.secret
					? achievement.description
					: 'Откроется только после выполнения скрытого условия.'}
			</p>
			<div className="achievement-card__status">
				{achievement.unlocked ? '🏆 Открыто' : achievement.secret ? '🕶️ Скрыто' : '🔒 В процессе'}
			</div>
		</article>
	)
}