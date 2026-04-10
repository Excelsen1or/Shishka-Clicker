import { useRef } from 'react'
import { formatNumber } from '../../lib/format'
import { useSound } from '../../hooks/useSound'
import buySound from '../../assets/audio/ui/blip1.mp3'

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
        <span>🌰 {formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}</span>
        <span>📚 {formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}</span>
      </div>
    </div>
  )
}

export function ShopCard({ item, canBuy, onBuy, delay = 0 }) {
  const isLocked = !item.unlocked
  const currency = CURRENCY_META[item.currency] ?? { icon: '✨', label: 'ресурс' }
  const { play } = useSound(buySound, { volume: 0.2 })
  const cardRef = useRef(null)

  const handleBuy = () => {
    if (isLocked || !canBuy) return
    play()
    onBuy()
  }

  // 3D tilt on mouse move
  function handleMouseMove(e) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const tiltX = ((y - cy) / cy) * -6   // max ±6deg
    const tiltY = ((x - cx) / cx) * 6
    card.style.transform = `translateY(-10px) scale(1.018) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    // move shine with mouse
    const shine = card.querySelector('.shop-card__shine')
    if (shine) {
      const pct = (x / rect.width) * 100
      shine.style.backgroundPosition = `${pct}% 0`
    }
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = ''
    const shine = card.querySelector('.shop-card__shine')
    if (shine) shine.style.backgroundPosition = ''
  }

  return (
    <article
      ref={cardRef}
      className={`shop-card ${item.currency === 'money' ? 'shop-card--money' : item.currency === 'knowledge' ? 'shop-card--knowledge' : 'shop-card--shishki'} ${isLocked ? 'shop-card--locked' : ''} ${canBuy && !isLocked ? 'shop-card--can-buy' : ''}`}
      style={{ animationDelay: `${delay * 50}ms` }}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="shop-card__glow" />
      <div className="shop-card__shine" />

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
            <span className="shop-card__price-num">{formatNumber(item.cost)}</span>
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
