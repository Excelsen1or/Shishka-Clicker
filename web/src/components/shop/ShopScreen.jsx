import { observer } from 'mobx-react-lite'
import '../../styles/shop-screen.css'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'
import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

const SCREEN_META = {
  subscriptions: {
    kicker: 'Производство',
    title: 'Здания',
    desc: 'Строй шишечную машину от гаражей до системного абсурда.',
  },
  upgrades: {
    kicker: 'Усиления',
    title: 'Улучшения',
    desc: 'Разгоняй клик, рынок и темп очередного шишечного цикла.',
  },
}

function EconomyCard({
  title,
  desc,
  meta,
  action,
  disabled,
  levelText,
  fieldCode,
  visualType,
}) {
  return (
    <article className="shop-card shop-card--shishki shop-card--rarity-common">
      <div className="shop-card__head">
        <div className="shop-card__badge-wrap">
          <span
            className="shop-card__visual"
            aria-hidden="true"
            data-field-code={fieldCode}
          >
            <EntityPlaceholderIcon
              code={fieldCode}
              label={title}
              type={visualType}
              state={disabled ? 'locked' : 'available'}
              size={32}
            />
          </span>
          <div className="shop-card__meta">
            <div>
              <h3 className="shop-card__title">{title}</h3>
              <p className="shop-card__desc">{desc}</p>
            </div>
          </div>
        </div>
        <div className="shop-card__chips">
          <span className="shop-card__tier">{levelText}</span>
        </div>
      </div>
      <div className="shop-card__body">
        <div className="shop-card__effect-box">
          {meta.map((line) => (
            <div key={line} className="shop-card__effect-line">
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className="shop-card__footer">
        <button
          type="button"
          className="shop-card__btn"
          onClick={action}
          disabled={disabled}
        >
          {disabled ? 'Не хватает шишек' : 'Купить'}
        </button>
      </div>
    </article>
  )
}

export const ShopScreen = observer(function ShopScreen({ type }) {
  const { uiEconomy, buySubscription, buyUpgrade } = useGameStore()
  const meta = SCREEN_META[type]
  const items =
    type === 'subscriptions' ? uiEconomy.subscriptions : uiEconomy.upgrades
  const onBuy = type === 'subscriptions' ? buySubscription : buyUpgrade

  return (
    <section className="screen shop-screen shop-screen--orange">
      <div className="screen__header">
        <span className="screen__kicker">{meta.kicker}</span>
        <h2 className="screen__title">{meta.title}</h2>
        <p className="screen__desc">{meta.desc}</p>
      </div>

      <div className="shop-grid">
        {items.map((item) => (
          <EconomyCard
            key={item.id}
            title={item.title}
            desc={
              type === 'subscriptions'
                ? `Базовая выработка: ${formatNumber(item.baseOutput)}/сек`
                : `Тип: ${item.kind}`
            }
            meta={
              type === 'subscriptions'
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
            disabled={!item.canBuy}
            fieldCode={item.fieldCode}
            visualType={type === 'subscriptions' ? 'building' : 'upgrade'}
            levelText={
              type === 'subscriptions'
                ? `здание ${formatNumber(item.owned)}`
                : `ур. ${formatNumber(item.level)}`
            }
          />
        ))}
      </div>
    </section>
  )
})
