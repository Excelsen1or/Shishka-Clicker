import { memo, useEffect, useRef } from 'react'
import {
  Arrow,
  Chest,
  Coin,
  Gem,
  Lightning,
  MagicWand,
  PxlKitIcon,
  QuestCompass,
  Scroll,
  SocialStar,
  Staff,
  Target,
  Community,
  Package,
  Palette,
  Pencil,
  Search,
  Robot,
} from '../../lib/pxlkit'
import { formatNumber } from '../../lib/format'
import { useSound } from '../../hooks/useSound'
import buySound from '../../assets/audio/ui/blip1.mp3'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import { LockBadge } from './LockBadge.jsx'
import { ConeIcon } from '../ui/ConeIcon'

const pxl = (icon, label, size = 22) => (
  <PxlKitIcon
    icon={icon}
    size={size}
    colorful
    className="pixel-inline-icon"
    aria-label={label}
  />
)

const CURRENCY_META = {
  money: { icon: pxl(Coin, 'money', 18), label: 'деньги' },
  shishki: { icon: <ConeIcon />, label: 'шишки' },
  knowledge: { icon: pxl(Scroll, 'knowledge', 18), label: 'знания' },
}

const ITEM_ICONS = {
  gigachat: pxl(Robot, 'gigachat'),
  yandex_alisa: pxl(Community, 'alisa'),
  gpt: pxl(Scroll, 'gpt'),
  claude: pxl(MagicWand, 'claude'),
  perplexity: pxl(Search, 'perplexity'),
  copilot: pxl(Staff, 'copilot'),
  gemini: pxl(SocialStar, 'gemini'),
  deepseek: pxl(Arrow, 'deepseek'),
  mistral: pxl(QuestCompass, 'mistral'),
  textbooks: pxl(Scroll, 'textbooks'),
  coffee: pxl(Lightning, 'coffee'),
  internship: pxl(Package, 'internship'),
  studyGroup: pxl(Community, 'study-group'),
  promptEngineering: pxl(Pencil, 'prompt-engineering'),
  researchLab: pxl(Gem, 'research-lab'),
  autoClicker: pxl(Robot, 'auto-clicker'),
  focusMode: pxl(Target, 'focus-mode'),
  memeMarketing: pxl(Community, 'meme-marketing'),
  logisticsHub: pxl(Chest, 'logistics-hub'),
  serverRack: pxl(Robot, 'server-rack'),
  coneSorting: pxl(Arrow, 'cone-sorting'),
  resinWorkshop: pxl(MagicWand, 'resin-workshop'),
  campusExchange: pxl(Coin, 'campus-exchange'),
  grantProgram: pxl(Scroll, 'grant-program'),
  brandStudio: pxl(Palette, 'brand-studio'),
  franchiseNetwork: pxl(Community, 'franchise-network'),
  ventureFund: pxl(Coin, 'venture-fund'),
  quantFund: pxl(Gem, 'quant-fund'),
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
  const toneClass =
    item.currency === 'money'
      ? 'shop-card--money'
      : item.currency === 'knowledge'
        ? 'shop-card--knowledge'
        : 'shop-card--shishki'

  const level = Number(item.level) || 1
  const rarityClass =
    level <= 1
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
  ]
    .filter(Boolean)
    .join(' ')
}

function areEffectPreviewsEqual(previousPreview, nextPreview) {
  return (
    (previousPreview?.currentText ?? null) ===
      (nextPreview?.currentText ?? null) &&
    (previousPreview?.nextText ?? null) === (nextPreview?.nextText ?? null)
  )
}

function areUnlockProgressEqual(previousProgress, nextProgress) {
  return (
    (previousProgress?.shishki ?? 0) === (nextProgress?.shishki ?? 0) &&
    (previousProgress?.knowledge ?? 0) === (nextProgress?.knowledge ?? 0)
  )
}

function areUnlockRulesEqual(previousRule, nextRule) {
  return (
    (previousRule?.shishki ?? 0) === (nextRule?.shishki ?? 0) &&
    (previousRule?.knowledge ?? 0) === (nextRule?.knowledge ?? 0)
  )
}

function areShopItemsEqual(previousItem, nextItem) {
  return (
    previousItem.id === nextItem.id &&
    previousItem.title === nextItem.title &&
    previousItem.description === nextItem.description &&
    previousItem.currency === nextItem.currency &&
    previousItem.tier === nextItem.tier &&
    previousItem.level === nextItem.level &&
    previousItem.cost === nextItem.cost &&
    previousItem.balance === nextItem.balance &&
    previousItem.canBuy === nextItem.canBuy &&
    previousItem.unlocked === nextItem.unlocked &&
    previousItem.isNew === nextItem.isNew &&
    previousItem.isBuyableNew === nextItem.isBuyableNew &&
    previousItem.unlockText === nextItem.unlockText &&
    previousItem.effectLabel === nextItem.effectLabel &&
    areEffectPreviewsEqual(
      previousItem.effectPreview,
      nextItem.effectPreview,
    ) &&
    areUnlockProgressEqual(
      previousItem.unlockProgress,
      nextItem.unlockProgress,
    ) &&
    areUnlockRulesEqual(previousItem.unlockRule, nextItem.unlockRule)
  )
}

function areShopCardPropsEqual(previousProps, nextProps) {
  return (
    previousProps.itemId === nextProps.itemId &&
    previousProps.canBuy === nextProps.canBuy &&
    previousProps.balance === nextProps.balance &&
    previousProps.onBuy === nextProps.onBuy &&
    previousProps.onInspect === nextProps.onInspect &&
    areShopItemsEqual(previousProps.item, nextProps.item)
  )
}

export const ShopCard = memo(function ShopCard({
  itemId,
  item,
  canBuy,
  balance = 0,
  onBuy,
  onInspect,
}) {
  const isLocked = !item.unlocked
  const showDetails = !isLocked
  const currency = CURRENCY_META[item.currency] ?? {
    icon: pxl(SocialStar, 'resource', 18),
    label: 'ресурс',
  }
  const itemIcon = ITEM_ICONS[item.id] ?? pxl(SocialStar, item.id)
  const { play: playBuySound } = useSound(buySound, { volume: 0.2 })
  const { play: playDenySound } = useSound(denySound, { volume: 0.26 })
  const cardRef = useRef(null)
  const buyButtonRef = useRef(null)
  const buyButtonLabelRef = useRef(null)
  const deniedCardAnimationRef = useRef(null)
  const deniedButtonAnimationRef = useRef(null)
  const deniedButtonLabelAnimationRef = useRef(null)

  useEffect(
    () => () => {
      deniedCardAnimationRef.current?.cancel()
      deniedButtonAnimationRef.current?.cancel()
      deniedButtonLabelAnimationRef.current?.cancel()
    },
    [],
  )

  const playDeniedFeedback = () => {
    deniedCardAnimationRef.current?.cancel()
    deniedButtonAnimationRef.current?.cancel()
    deniedButtonLabelAnimationRef.current?.cancel()

    if (cardRef.current) {
      deniedCardAnimationRef.current = cardRef.current.animate(
        [
          {
            boxShadow:
              '0 0 0 1px rgba(255, 122, 122, 0), 0 14px 28px rgba(255, 92, 92, 0)',
            filter: 'saturate(1)',
          },
          {
            boxShadow:
              '0 0 0 1px rgba(255, 122, 122, 0.38), 0 20px 42px rgba(255, 92, 92, 0.18)',
            filter: 'saturate(1.08)',
          },
          {
            boxShadow:
              '0 0 0 1px rgba(255, 122, 122, 0), 0 14px 28px rgba(255, 92, 92, 0)',
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
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 14px rgba(255, 108, 108, 0.12)',
          },
          {
            transform: 'translateY(2px) scale(0.95) rotate(-0.8deg)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 10px rgba(255, 108, 108, 0.2)',
          },
          {
            transform: 'translateY(-2px) scale(1.03) rotate(0.8deg)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(255, 108, 108, 0.22)',
          },
          {
            transform: 'translateY(0) scale(1) rotate(0deg)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 14px rgba(255, 108, 108, 0.12)',
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
    onBuy?.(itemId)
  }

  const handleInspect = () => {
    if (!item.isNew && !item.isBuyableNew) return
    onInspect?.(itemId)
  }

  const missingAmount = Math.max(0, Number(item.cost) - Number(balance))
  const currentEffectText = item.effectPreview?.currentText ?? item.effectLabel
  const nextEffectText =
    item.effectPreview?.nextText ?? 'Следующий уровень усилит слот'
  const currentEffectLines = splitEffectLines(currentEffectText)
  const nextEffectLines = splitEffectLines(nextEffectText, true)

  return (
    <article
      ref={cardRef}
      className={getCardClassName(item, isLocked, canBuy)}
      data-new={item.isNew ? 'true' : 'false'}
      onMouseEnter={handleInspect}
      onFocus={handleInspect}
    >
      <div className="shop-card__glow" />
      <div className="shop-card__shine" />

      <div className="shop-card__head">
        <div className="shop-card__meta">
          <div className="shop-card__badge-wrap">
            <span className="shop-card__emoji" aria-hidden="true">
              {itemIcon}
            </span>
            <div>
              <h3 className="shop-card__title">{item.title}</h3>
              {showDetails ? (
                <p className="shop-card__desc">{item.description}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shop-card__chips">
          {item.isNew ? (
            <span className="shop-card__new-badge">новое</span>
          ) : null}
          {item.isBuyableNew ? (
            <span className="shop-card__new-badge shop-card__new-badge--ready">
              можно взять
            </span>
          ) : null}
          <span className="shop-card__tier">тир {item.tier}</span>
          {!isLocked ? (
            <span className="shop-card__level">ур. {item.level}</span>
          ) : null}
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
                      <div key={line} className="shop-card__effect-line">
                        {line}
                      </div>
                    ))
                  : currentEffectText}
              </div>
              <div className="shop-card__effect-next">
                {nextEffectLines.length > 0
                  ? nextEffectLines.map((line) => (
                      <div key={line} className="shop-card__effect-next-line">
                        {line}
                      </div>
                    ))
                  : nextEffectText}
              </div>
            </div>

            <div className="shop-card__price-box">
              <div className="shop-card__price-label">Цена уровня</div>
              <div className="shop-card__price">
                <span className="shop-card__price-num">
                  {formatNumber(item.cost)}
                </span>
                <span className="shop-card__price-icon">{currency.icon}</span>
              </div>
              {!canBuy ? (
                <div className="shop-card__shortage">
                  Нужно ещё <strong>{formatNumber(missingAmount)}</strong>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      {showDetails ? (
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
              {isLocked
                ? 'Сначала открой тир'
                : canBuy
                  ? 'Купить уровень'
                  : 'Не хватает ресурса'}
            </span>
          </button>
        </div>
      ) : null}
    </article>
  )
}, areShopCardPropsEqual)
