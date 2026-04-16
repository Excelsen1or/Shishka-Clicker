import { Lock, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { formatNumber } from '../../lib/format.js'
import { ConeIcon } from '../ui/ConeIcon'

export const LockBadge = ({ item }) => {
  return (
    <div className="shop-card__lock">
      <div className="shop-card__lock-title">
        <PxlKitIcon icon={Lock} size={16} colorful className="pixel-inline-icon" />
        Заблокировано
      </div>

      <div className="shop-card__lock-text">{item.unlockText}</div>

      <div className="shop-card__lock-progress">
        <div className="shop-card__lock-row">
          <span className="shop-card__lock-label"><ConeIcon /> Шишки</span>
          <span className="shop-card__lock-value">
            {formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}
          </span>
        </div>

        <div className="shop-card__lock-row">
          <span className="shop-card__lock-label">
            <PxlKitIcon icon={Scroll} size={16} colorful className="pixel-inline-icon" />
            Знания
          </span>
          <span className="shop-card__lock-value">
            {formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}
          </span>
        </div>
      </div>
    </div>
  )
}
