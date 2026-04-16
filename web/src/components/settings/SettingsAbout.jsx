import { Coin, Gem, PxlKitIcon, Trophy, Community } from '../../lib/pxlkit'
import { APP_VERSION, CHANGELOG_URL, PRIVACY_URL, REPOSITORY_URL, TERMS_URL } from '../../config/appMeta.js'
import { LinkTile } from './LinkTile.jsx'

export const SettingsAbout = ({ resetGame }) => {
  return (
    <aside className="settings-layout__side">
      <article className="settings-card">
        <div className="settings-card__head">
          <h3 className="settings-card__title">О приложении</h3>
          <span className="settings-chip">
            <PxlKitIcon icon={Trophy} size={16} colorful className="pixel-inline-icon" /> v{APP_VERSION}
          </span>
        </div>

        <div className="settings-links-grid">
          <LinkTile
            title="Репозиторий"
            hint="Исходный код проекта на GitHub"
            href={REPOSITORY_URL}
            icon={<PxlKitIcon icon={Community} size={16} colorful className="pixel-inline-icon" />}
          />
          <LinkTile
            title="Changelog"
            hint="Последние changelogs и обновления"
            href={CHANGELOG_URL}
            icon={<PxlKitIcon icon={Coin} size={16} colorful className="pixel-inline-icon" />}
          />
        </div>
      </article>

      <article className="settings-card">
        <div className="settings-card__head">
          <h3 className="settings-card__title">Документы</h3>
          <span className="settings-chip">
            <PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" /> Policy
          </span>
        </div>

        <div className="settings-links-grid">
          <LinkTile
            title="Privacy Policy"
            hint="Политика конфиденциальности"
            href={PRIVACY_URL}
            icon={<PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" />}
          />
          <LinkTile
            title="Terms of Service"
            hint="Пользовательское соглашение"
            href={TERMS_URL}
            icon={<PxlKitIcon icon={Trophy} size={16} colorful className="pixel-inline-icon" />}
          />
        </div>
      </article>

      <article className="settings-card settings-card--danger">
        <div className="settings-card__head">
          <h3 className="settings-card__title">Игра</h3>
          <span className="settings-chip settings-chip--danger">
            <PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" /> Опасно
          </span>
        </div>

        <p className="settings-card__hint settings-card__hint--block">
          Кнопка очищает игровое сохранение. Нажми её, проверь что будет.
        </p>

        <button type="button" className="reset-btn" onClick={resetGame}>
          Проверить...
        </button>
      </article>
    </aside>
  )
}
