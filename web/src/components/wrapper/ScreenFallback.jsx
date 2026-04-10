export const ScreenFallback = () => {
	return (
		<section className="screen">
			<div className="screen__header">
				<span className="screen__kicker">Загрузка</span>
				<h2 className="screen__title">Подготавливаем экран</h2>
				<p className="screen__desc">
					UI теперь грузится по вкладкам, поэтому первый переход может занять долю секунды.
				</p>
			</div>
		</section>
	)
}