import { Lock, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { formatNumber } from '../../lib/format.js'
import { ConeIcon } from '../ui/ConeIcon'

export const LockBadge = ({ item }) => {
  const hasShishkiRequirement =
    item.unlockProgress?.shishki != null || item.unlockRule?.shishki != null
  const hasKnowledgeRequirement =
    item.unlockProgress?.knowledge != null || item.unlockRule?.knowledge != null

  return (
    <div className="shop-card__lock">
      <div className="shop-card__lock-title">
        <PxlKitIcon
          icon={Lock}
          size={16}
          colorful
          className="pixel-inline-icon"
        />
        Заблокировано
      </div>

      <div className="shop-card__lock-text">{item.unlockText}</div>

      <div className="shop-card__lock-progress">
        {hasShishkiRequirement ? (
          <div className="shop-card__lock-row">
            <span className="shop-card__lock-label">
              <ConeIcon /> Шишки
            </span>
            <span className="shop-card__lock-value">
              {formatNumber(item.unlockProgress?.shishki ?? 0)} /{' '}
              {formatNumber(item.unlockRule?.shishki ?? 0)}
            </span>
          </div>
        ) : null}

        {hasKnowledgeRequirement ? (
          <div className="shop-card__lock-row">
            <span className="shop-card__lock-label">
              <PxlKitIcon
                icon={Scroll}
                size={16}
                colorful
                className="pixel-inline-icon"
              />
              Знания
            </span>
            <span className="shop-card__lock-value">
              {formatNumber(item.unlockProgress?.knowledge ?? 0)} /{' '}
              {formatNumber(item.unlockRule?.knowledge ?? 0)}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
