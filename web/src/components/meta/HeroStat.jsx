export const HeroStat = ({ label, value, hint }) => {
	return (
		<article className="meta-hero-stat">
			<span className="meta-hero-stat__label">{label}</span>
			<strong className="meta-hero-stat__value">{value}</strong>
			<span className="meta-hero-stat__hint">{hint}</span>
		</article>
	)
}