import {APP_VERSION, CHANGELOG_URL, PRIVACY_URL, REPOSITORY_URL, TERMS_URL} from "../../config/appMeta.js"
import {LinkTile} from "./LinkTile.jsx"


export const SettingsAbout = ({
	resetGame
															}) => {
	return (
		<aside className="settings-layout__side">
			<article className="settings-card">
				<div className="settings-card__head">
					<h3 className="settings-card__title">О приложении</h3>
					<span className="settings-chip">v{APP_VERSION}</span>
				</div>

				<div className="settings-about-grid">
					<div className="settings-about-item">
						<span>Версия</span>
						<strong>{APP_VERSION}</strong>
					</div>
					<div className="settings-about-item">
						<span>Репозиторий</span>
						<strong>GitHub</strong>
					</div>
				</div>

				<div className="settings-links-grid">
					<LinkTile title="Репозиторий" hint="Исходный код проекта на GitHub" href={REPOSITORY_URL} />
					<LinkTile title="Changelog" hint="Последние changelogs и обновления" href={CHANGELOG_URL} />
				</div>
			</article>

			<article className="settings-card">
				<div className="settings-card__head">
					<h3 className="settings-card__title">Документы</h3>
					<span className="settings-chip">Policy</span>
				</div>

				<div className="settings-links-grid">
					<LinkTile title="Privacy Policy" hint="Политика конфиденциальности" href={PRIVACY_URL} />
					<LinkTile title="Terms of Service" hint="Пользовательское соглашение" href={TERMS_URL} />
				</div>
			</article>

			<article className="settings-card settings-card--danger">
				<div className="settings-card__head">
					<h3 className="settings-card__title">Игра</h3>
					<span className="settings-chip settings-chip--danger">Опасно</span>
				</div>

				<p className="settings-card__hint settings-card__hint--block">
					Кнопка ниже очищает только игровое сохранение. Аудио и остальные локальные настройки останутся как есть.
				</p>

				<button type="button" className="reset-btn" onClick={resetGame}>
					Сбросить весь прогресс
				</button>
			</article>
		</aside>
	)
}