import { useSound } from '../../hooks/useSound'
import buySound from '../../assets/audio/ui/blip1.mp3'
import {MainStore} from "../../MainStore.js"


const CURRENCY_META = {
  money: { icon: '💵', label: 'деньги' },
  shishki: { icon: '🌰', label: 'шишки' },
  knowledge: { icon: '📚', label: 'знания' },
}

function LockBadge({ item }) {
  return (
    <div className="shop-card__lock">
      <div className="shop-card__lock-title">🔒 Заблокировано</div>
      <div className="shop-card__lock-text">{item.unlockText}</div>
      <div className="shop-card__lock-progress">
        <span>🌰 {MainStore.formatShortNumber(item.unlockProgress.shishki)} / {MainStore.formatShortNumber(item.unlockRule.shishki)}</span>
        <span>📚 {MainStore.formatShortNumber(item.unlockProgress.knowledge)} / {MainStore.formatShortNumber(item.unlockRule.knowledge)}</span>
      </div>
    </div>
  )
}

export function ShopCard({ item, canBuy, onBuy, delay = 0 }) {
  const isLocked = !item.unlocked
  const currency = CURRENCY_META[item.currency] ?? { icon: '✨', label: 'ресурс' }
  const { play } = useSound(buySound, { volume: 0.2 })

  const handleBuy = () => {
    if (isLocked || !canBuy) return
    play()
    onBuy()
  }

  return (
    <article
      className={`shop-card ${isLocked ? 'shop-card--locked' : ''} ${canBuy && !isLocked ? 'shop-card--can-buy' : ''}`}
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      <div className="shop-card__glow" />

      <div className="shop-card__head">
        <div className="shop-card__meta">
          <span className="shop-card__tier">тир {item.tier}</span>
          <span className="shop-card__level">ур. {item.level}</span>
        </div>
        <h3 className="shop-card__title">{item.title}</h3>
        <p className="shop-card__desc">{item.description}</p>
      </div>

      <div className="shop-card__body">
        <div className="shop-card__effect-box">
          <div className="shop-card__effect-label">Эффект</div>
          <div className="shop-card__effect-val">
            {item.effectPreview?.currentText ?? item.effectLabel}
          </div>
          <div className="shop-card__effect-next">
            {item.effectPreview?.nextText ?? 'Следующий уровень усилит слот'}
          </div>
        </div>

        <div className="shop-card__price-box">
          <div className="shop-card__price-label">Цена уровня</div>
          <div className="shop-card__price">
            <span className="shop-card__price-num">{MainStore.formatShortNumber(item.cost)}</span>
            <span className="shop-card__price-icon">{currency.icon}</span>
            <span className="shop-card__price-cur">{currency.label}</span>
          </div>
        </div>

        {isLocked && <LockBadge item={item} />}
      </div>

      <div className="shop-card__footer">
        <button
          className="shop-card__btn"
          disabled={!canBuy || isLocked}
          onClick={handleBuy}
        >
          {isLocked ? 'Сначала открой тир' : canBuy ? 'Купить уровень' : 'Не хватает ресурса'}
        </button>
      </div>
    </article>
  )
}