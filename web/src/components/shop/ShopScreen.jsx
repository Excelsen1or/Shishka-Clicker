import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef, useState } from 'react'
import '../../styles/shop-screen.css'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'
import { useSound } from '../../hooks/useSound.js'
import buySound from '../../assets/audio/ui/blip1.mp3'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'

const PURCHASE_VIEWS = {
  buildings: {
    id: 'buildings',
    kicker: 'Покупки',
    title: 'Здания',
    desc: 'Строй шишечную машину от гаражей до системного абсурда.',
  },
  upgrades: {
    id: 'upgrades',
    kicker: 'Покупки',
    title: 'Усиления',
    desc: 'Подкручивай клик, рынок и темп очередного шишечного цикла.',
  },
}

function LockBlock({ item }) {
  if (item.unlocked) return null

  return (
    <div className="shop-card__lock">
      <div className="shop-card__lock-title">Заблокировано</div>
      <div className="shop-card__lock-text">{item.unlockText}</div>
      {item.unlockProgress && item.unlockRule ? (
        <div className="shop-card__lock-progress">
          <div className="shop-card__lock-row">
            <span className="shop-card__lock-label">Прогресс</span>
            <span className="shop-card__lock-value">
              {formatNumber(item.unlockProgress.shishki)} /{' '}
              {formatNumber(item.unlockRule.shishki)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function getEconomyCardFlags(item) {
  const locked = item.unlocked === false

  return {
    locked,
  }
}

function EconomyCard({ item, action, visualType, levelText, desc, meta }) {
  const { locked } = getEconomyCardFlags(item)
  const disabled = locked
  const { play: playBuySound } = useSound(buySound, { volume: 0.2 })
  const { play: playDenySound } = useSound(denySound, { volume: 0.26 })
  const cardRef = useRef(null)
  const buttonRef = useRef(null)
  const deniedCardAnimationRef = useRef(null)
  const deniedButtonAnimationRef = useRef(null)

  useEffect(
    () => () => {
      deniedCardAnimationRef.current?.cancel()
      deniedButtonAnimationRef.current?.cancel()
    },
    [],
  )

  const playDeniedFeedback = () => {
    deniedCardAnimationRef.current?.cancel()
    deniedButtonAnimationRef.current?.cancel()

    if (cardRef.current) {
      deniedCardAnimationRef.current = cardRef.current.animate(
        [
          { transform: 'translateX(0)', borderColor: 'rgba(255, 122, 122, 0.16)' },
          { transform: 'translateX(-2px)', borderColor: 'rgba(255, 122, 122, 0.5)' },
          { transform: 'translateX(2px)', borderColor: 'rgba(255, 122, 122, 0.5)' },
          { transform: 'translateX(0)', borderColor: 'rgba(255, 122, 122, 0.16)' },
        ],
        { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
    }

    if (buttonRef.current) {
      deniedButtonAnimationRef.current = buttonRef.current.animate(
        [
          { transform: 'translate(0, 0) scale(1)' },
          { transform: 'translate(-1px, 1px) scale(0.98)' },
          { transform: 'translate(1px, -1px) scale(1.02)' },
          { transform: 'translate(0, 0) scale(1)' },
        ],
        { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
    }
  }

  const handleBuy = () => {
    if (locked) return
    if (!item.canBuy) {
      playDenySound()
      playDeniedFeedback()
      return
    }

    playBuySound()
    action()
  }

  const cardClassName = [
    'shop-card',
    'shop-card--shishki',
    'shop-card--rarity-common',
    locked ? 'shop-card--locked' : '',
    !locked && item.canBuy ? 'shop-card--can-buy' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article ref={cardRef} className={cardClassName}>
      <div className="shop-card__head">
        <div className="shop-card__badge-wrap">
          <span
            className="shop-card__visual"
            aria-hidden="true"
            data-field-code={item.fieldCode}
          >
            <EntityPlaceholderIcon
              code={item.fieldCode}
              label={item.title}
              type={visualType}
              state={locked ? 'locked' : item.canBuy ? 'available' : 'owned'}
              size={32}
            />
          </span>
          <div className="shop-card__meta">
            <div>
              <h3 className="shop-card__title">{item.title}</h3>
              <p className="shop-card__desc">{desc}</p>
            </div>
          </div>
        </div>
        <div className="shop-card__chips">
          <span className="shop-card__tier">{levelText}</span>
        </div>
      </div>
      <div className="shop-card__body">
        {!locked ? (
          <div className="shop-card__effect-box">
            {meta.map((line) => (
              <div key={line} className="shop-card__effect-line">
                {line}
              </div>
            ))}
          </div>
        ) : null}
        <LockBlock item={item} />
      </div>
      <div className="shop-card__footer">
        <button
          ref={buttonRef}
          type="button"
          className="shop-card__btn"
          data-state={locked ? 'locked' : item.canBuy ? 'ready' : 'denied'}
          onClick={handleBuy}
          disabled={disabled}
        >
          {locked ? 'Закрыто' : item.canBuy ? 'Купить' : 'Не хватает шишек'}
        </button>
      </div>
    </article>
  )
}

export const ShopScreen = observer(function ShopScreen({
  initialView = 'buildings',
}) {
  const { uiEconomy, buySubscription, buyUpgrade } = useGameStore()
  const [activeView, setActiveView] = useState(
    PURCHASE_VIEWS[initialView] ? initialView : 'buildings',
  )

  const itemsByView = useMemo(
    () => ({
      buildings: uiEconomy.subscriptions,
      upgrades: uiEconomy.upgrades,
    }),
    [uiEconomy.subscriptions, uiEconomy.upgrades],
  )

  const upgradesUnlocked = uiEconomy.upgrades.some((item) => item.unlocked)
  const firstLockedUpgrade = uiEconomy.upgrades.find((item) => item.unlocked === false)
  const viewLocks = {
    buildings: null,
    upgrades: upgradesUnlocked
      ? null
      : {
          text: 'Вкладка откроется после первых 80 шишек за все жизни.',
          progress: Math.min(
            Math.max(0, Number(firstLockedUpgrade?.unlockProgress?.shishki ?? 0)),
            80,
          ),
          goal: 80,
        },
  }

  const activeViewLock = viewLocks[activeView]
  const meta = PURCHASE_VIEWS[activeView]
  const isBuildingsView = activeView === 'buildings'
  const items = itemsByView[activeView]
  const unlockedItems = items.filter((item) => item.unlocked !== false)
  const lockedItems = items.filter((item) => item.unlocked === false)
  const onBuy = isBuildingsView ? buySubscription : buyUpgrade

  return (
    <section className="screen shop-screen shop-screen--orange">
      <div className="screen__header">
        <span className="screen__kicker">{meta.kicker}</span>
        <h2 className="screen__title">{meta.title}</h2>
        <p className="screen__desc">{meta.desc}</p>
      </div>

      <div
        className="pixel-tabbar pixel-tabbar--shop"
        role="tablist"
        aria-label="Разделы покупок"
      >
        {Object.values(PURCHASE_VIEWS).map((view) => {
          const isActive = view.id === activeView
          const isLocked = Boolean(viewLocks[view.id])

          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={isLocked}
              className={`pixel-tabbar__btn ${isActive ? 'pixel-tabbar__btn--active' : ''} ${isLocked ? 'pixel-tabbar__btn--locked' : ''}`.trim()}
              onClick={() => setActiveView(view.id)}
            >
              {view.title}
            </button>
          )
        })}
      </div>

      {activeViewLock ? (
        <section className="shop-panel-lock pixel-surface">
          <strong>Раздел закрыт</strong>
          <p>{activeViewLock.text}</p>
          <div className="shop-panel-lock__progress">
            <span>Прогресс</span>
            <span>
              {formatNumber(activeViewLock.progress)} /{' '}
              {formatNumber(activeViewLock.goal)}
            </span>
          </div>
        </section>
      ) : null}

      <div className="shop-categories">
        {unlockedItems.length > 0 ? (
          <section className="shop-group shop-group--active">
            <div className="shop-group__head">
              <span className="shop-group__eyebrow">Доступно сейчас</span>
              <h3 className="shop-group__title">
                {isBuildingsView ? 'Открытые здания' : 'Открытые усиления'}
              </h3>
              <p className="shop-group__desc">
                {isBuildingsView
                  ? 'Эти слоты уже открыты по прогрессу и готовы к покупке.'
                  : 'Эти усиления уже вышли в ротацию текущего забега.'}
              </p>
            </div>
            <div className="shop-grid shop-grid--category">
              {unlockedItems.map((item) => (
                <EconomyCard
                  key={item.id}
                  item={item}
                  desc={isBuildingsView ? item.perkSummary : `Тип: ${item.kind}`}
                  meta={
                    isBuildingsView
                      ? [
                          `Куплено: ${formatNumber(item.owned)}`,
                          `Уровень смолы: ${formatNumber(item.level)}`,
                          `Цена: ${formatNumber(item.cost)} шишек`,
                        ]
                      : [
                          `Уровень: ${formatNumber(item.level)}`,
                          `Цена: ${formatNumber(item.cost)} шишек`,
                          `Эффект: ${item.kind}`,
                        ]
                  }
                  action={() => onBuy(item.id)}
                  visualType={isBuildingsView ? 'building' : 'upgrade'}
                  levelText={
                    isBuildingsView
                      ? `здание ${formatNumber(item.owned)}`
                      : `ур. ${formatNumber(item.level)}`
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        {lockedItems.length > 0 ? (
          <section className="shop-group shop-group--locked">
            <div className="shop-group__head">
              <span className="shop-group__eyebrow">Закрыто</span>
              <h3 className="shop-group__title">
                {isBuildingsView ? 'Закрытые здания' : 'Закрытые усиления'}
              </h3>
              <p className="shop-group__desc">
                Эти товары откроются по мере прогресса, как следующая ступень экономики.
              </p>
            </div>
            <div className="shop-grid shop-grid--category shop-grid--locked">
              {lockedItems.map((item) => (
                <EconomyCard
                  key={item.id}
                  item={item}
                  desc={isBuildingsView ? item.perkSummary : `Тип: ${item.kind}`}
                  meta={
                    isBuildingsView
                      ? [
                          `Куплено: ${formatNumber(item.owned)}`,
                          `Уровень смолы: ${formatNumber(item.level)}`,
                          `Цена: ${formatNumber(item.cost)} шишек`,
                        ]
                      : [
                          `Уровень: ${formatNumber(item.level)}`,
                          `Цена: ${formatNumber(item.cost)} шишек`,
                          `Эффект: ${item.kind}`,
                        ]
                  }
                  action={() => onBuy(item.id)}
                  visualType={isBuildingsView ? 'building' : 'upgrade'}
                  levelText={
                    isBuildingsView
                      ? `здание ${formatNumber(item.owned)}`
                      : `ур. ${formatNumber(item.level)}`
                  }
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
})
