import { useEffect, useRef, useState } from 'react'
import { formatNumber, formatFullNumber } from '../../lib/format'
import { useSound } from '../../hooks/useSound'
import buySound from '../../assets/audio/ui/blip1.mp3'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import {LockBadge} from "./LockBadge.jsx"
import { ConeIcon } from '../ui/ConeIcon'
import { MoneyIcon, KnowledgeIcon } from '../ui/GameIcon'


const CURRENCY_META = {
  money: { icon: <MoneyIcon />, label: 'деньги' },
  shishki: { icon: <ConeIcon />, label: 'шишки' },
  knowledge: { icon: <KnowledgeIcon />, label: 'знания' },
}

const ITEM_EMOJI = {
  gigachat: '🪄',
  yandex_alisa: '🎙️',
  gpt: '🧠',
  claude: '🧾',
  perplexity: '🔎',
  copilot: '🛠️',
  gemini: '🌌',
  deepseek: '🚀',
  mistral: '🌪️',
  textbooks: '📘',
  coffee: '☕',
  internship: '📦',
  studyGroup: '🧑‍🏫',
  promptEngineering: '⌨️',
  researchLab: '🧪',
  autoClicker: '🖱️',
  focusMode: '🎯',
  memeMarketing: '📣',
  logisticsHub: '🚚',
  serverRack: '🖥️',
  coneSorting: '🧺',
  resinWorkshop: '🧴',
  campusExchange: '🏫',
  grantProgram: '📝',
  brandStudio: '🎨',
  franchiseNetwork: '🏪',
  ventureFund: '💼',
  quantFund: '📈',
}

function splitEffectLines(text, stripNextPrefix = false) {
  if (!text) return []

  let normalized = String(text).trim()

  if (stripNextPrefix) {
    normalized = normalized.replace(/^След\.\s*ур\.:\s*/i, '').trim()
  }

  return normalized
    .split(' · ')
    .map((line) => line.trim())
    .filter(Boolean)
}

function getCardClassName(item, isLocked, canBuy) {
  const toneClass = item.currency === 'money'
    ? 'shop-card--money'
    : item.currency === 'knowledge'
      ? 'shop-card--knowledge'
      : 'shop-card--shishki'

  const level = Number(item.level) || 1
  const rarityClass = level <= 1
    ? 'shop-card--rarity-common'
    : level <= 4
      ? 'shop-card--rarity-uncommon'
      : level <= 9
        ? 'shop-card--rarity-rare'
        : level <= 14
          ? 'shop-card--rarity-epic'
          : level <= 24
            ? 'shop-card--rarity-legendary'
            : 'shop-card--rarity-mythic'

  return [
    'shop-card',
    toneClass,
    rarityClass,
    item.isNew ? 'shop-card--new' : '',
    item.isBuyableNew ? 'shop-card--buyable-new' : '',
    isLocked ? 'shop-card--locked' : '',
    canBuy && !isLocked ? 'shop-card--can-buy' : '',
  ].filter(Boolean).join(' ')
}

export function ShopCard({ item, canBuy, balance = 0, onBuy, onInspect, delay = 0 }) {
  const isLocked = !item.unlocked
  const showDetails = !isLocked
  const currency = CURRENCY_META[item.currency] ?? { icon: '✨', label: 'ресурс' }
  const itemEmoji = ITEM_EMOJI[item.id] ?? '✨'
  const { play: playBuySound } = useSound(buySound, { volume: 0.2 })
  const { play: playDenySound } = useSound(denySound, { volume: 0.26 })
  const [isEntering, setIsEntering] = useState(true)
  const cardRef = useRef(null)
  const buyButtonRef = useRef(null)
  const buyButtonLabelRef = useRef(null)
  const deniedCardAnimationRef = useRef(null)
  const deniedButtonAnimationRef = useRef(null)
  const deniedButtonLabelAnimationRef = useRef(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsEntering(false), delay * 50 + 600)
    return () => clearTimeout(timeoutId)
  }, [delay])

  useEffect(() => () => {
    deniedCardAnimationRef.current?.cancel()
    deniedButtonAnimationRef.current?.cancel()
    deniedButtonLabelAnimationRef.current?.cancel()
  }, [])

  const playDeniedFeedback = () => {
    deniedCardAnimationRef.current?.cancel()
    deniedButtonAnimationRef.current?.cancel()
    deniedButtonLabelAnimationRef.current?.cancel()

    if (cardRef.current) {
      deniedCardAnimationRef.current = cardRef.current.animate(
        [
          {
            boxShadow: '0 0 0 1px rgba(255, 122, 122, 0), 0 14px 28px rgba(255, 92, 92, 0)',
            filter: 'saturate(1)',
          },
          {
            boxShadow: '0 0 0 1px rgba(255, 122, 122, 0.38), 0 20px 42px rgba(255, 92, 92, 0.18)',
            filter: 'saturate(1.08)',
          },
          {
            boxShadow: '0 0 0 1px rgba(255, 122, 122, 0), 0 14px 28px rgba(255, 92, 92, 0)',
            filter: 'saturate(1)',
          },
        ],
        {
          duration: 360,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      )
    }

    if (buyButtonRef.current) {
      deniedButtonAnimationRef.current = buyButtonRef.current.animate(
        [
          {
            transform: 'translateY(0) scale(1) rotate(0deg)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 14px rgba(255, 108, 108, 0.12)',
          },
          {
            transform: 'translateY(2px) scale(0.95) rotate(-0.8deg)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 10px rgba(255, 108, 108, 0.2)',
          },
          {
            transform: 'translateY(-2px) scale(1.03) rotate(0.8deg)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(255, 108, 108, 0.22)',
          },
          {
            transform: 'translateY(0) scale(1) rotate(0deg)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 14px rgba(255, 108, 108, 0.12)',
          },
        ],
        {
          duration: 460,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      )
    }

    if (buyButtonLabelRef.current) {
      deniedButtonLabelAnimationRef.current = buyButtonLabelRef.current.animate(
        [
          { transform: 'translateX(0) rotate(0deg)' },
          { transform: 'translateX(-2px) rotate(-1.2deg)' },
          { transform: 'translateX(2px) rotate(1.2deg)' },
          { transform: 'translateX(-1px) rotate(-0.6deg)' },
          { transform: 'translateX(0) rotate(0deg)' },
        ],
        {
          duration: 360,
          easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
        },
      )
    }
  }

  const handleBuy = () => {
    if (isLocked || !canBuy) {
      playDenySound()
      playDeniedFeedback()
      return
    }

    playBuySound()
    onBuy()
  }

  const handleInspect = () => {
    if (!item.isNew && !item.isBuyableNew) return
    onInspect?.()
  }

  const missingAmount = Math.max(0, Number(item.cost) - Number(balance))
  const currentEffectText = item.effectPreview?.currentText ?? item.effectLabel
  const nextEffectText = item.effectPreview?.nextText ?? 'Следующий уровень усилит слот'
  const currentEffectLines = splitEffectLines(currentEffectText)
  const nextEffectLines = splitEffectLines(nextEffectText, true)

  return (
    <article
      ref={cardRef}
      className={getCardClassName(item, isLocked, canBuy)}
      data-new={item.isNew ? 'true' : 'false'}
      onMouseEnter={handleInspect}
      onFocus={handleInspect}
      style={isEntering ? { animationDelay: `${delay * 50}ms` } : undefined}
    >
      <div className="shop-card__glow" />
      <div className="shop-card__shine" />

      <div className="shop-card__head">
        <div className="shop-card__meta">
          <div className="shop-card__badge-wrap">
            <span className="shop-card__emoji" aria-hidden="true">{itemEmoji}</span>
            <div>
              <h3 className="shop-card__title">{item.title}</h3>
              {showDetails && <p className="shop-card__desc">{item.description}</p>}
            </div>
          </div>
        </div>

        <div className="shop-card__chips">
          {item.isNew && <span className="shop-card__new-badge">новое</span>}
          {item.isBuyableNew && <span className="shop-card__new-badge shop-card__new-badge--ready">можно взять</span>}
          <span className="shop-card__tier">тир {item.tier}</span>
          {!isLocked && <span className="shop-card__level">ур. {item.level}</span>}
        </div>
      </div>

      <div className="shop-card__body">
        {isLocked ? (
          <LockBadge item={item} />
        ) : (
          <>
            <div className="shop-card__effect-box">
              <div className="shop-card__effect-label">Эффект</div>
              <div className="shop-card__effect-val">
                {currentEffectLines.length > 0
                  ? currentEffectLines.map((line) => (
                    <div key={line} className="shop-card__effect-line">{line}</div>
                  ))
                  : currentEffectText}
              </div>
              <div className="shop-card__effect-next">
                {nextEffectLines.length > 0
                  ? nextEffectLines.map((line) => (
                    <div key={line} className="shop-card__effect-next-line">{line}</div>
                  ))
                  : nextEffectText}
              </div>
            </div>

            <div className="shop-card__price-box">
              <div className="shop-card__price-label">Цена уровня</div>
              <div className="shop-card__price">
                <span className="shop-card__price-num" title={formatFullNumber(item.cost)}>{formatNumber(item.cost)}</span>
                <span className="shop-card__price-icon">{currency.icon}</span>
              </div>
              {!canBuy && (
                <div className="shop-card__shortage">
                  Нужно ещё <strong title={formatFullNumber(missingAmount)}>{formatNumber(missingAmount)}</strong>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showDetails && (
        <div className="shop-card__footer">
          <button
            ref={buyButtonRef}
            type="button"
            className="shop-card__btn"
            disabled={isLocked}
            aria-disabled={!canBuy || isLocked}
            data-state={isLocked ? 'locked' : canBuy ? 'ready' : 'denied'}
            onClick={handleBuy}
          >
            <span ref={buyButtonLabelRef}>
              {isLocked ? 'Сначала открой тир' : canBuy ? 'Купить уровень' : 'Не хватает ресурса'}
            </span>
          </button>
        </div>
      )}
    </article>
  )
}
